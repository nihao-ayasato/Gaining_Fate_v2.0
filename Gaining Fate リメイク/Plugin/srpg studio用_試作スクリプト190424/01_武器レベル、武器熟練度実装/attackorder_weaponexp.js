
/*--------------------------------------------------------------------------
  
  戦闘後、武器熟練度に装備している武器の武器経験値を加算する処理です。
  
  武器経験値が1の武器で戦った場合、戦闘終了後に武器熟練度に+1されます。
  追撃の有無に関わらず+1ですが、連続攻撃スキルを持った武器(FEで言う勇者の剣など)で戦った場合は2倍の+2となります。
  反撃不能などで攻撃行動を取らなかった場合は、武器熟練度は増えません。
  装備武器のwtypeが正しく設定されていない場合、熟練度は増えません。
  
  使用方法:
  custom-unit-jyukurendo,custom-item-weapnlevel,edit_weapontype-caseと併用して下さい。
  
  武器のカスタムパラメータに{wexp: 2, wtype: 0}のように設定します。
  (武器経験値が2,武器タイプが0(剣)の意味)
  詳しくはcustom-item-weapnlevelの冒頭を参照ください。
  
  またcustom-item-weapnlevelと同様に、新たに武器熟練度を作成した場合は、
  edit_weapontype-caseにも追記をして下さい。
  
  作成者: CB
  
  更新履歴:
  2015/07/05 新規作成
  2015/07/06 一部記載を変更
  2015/07/07 武器を装備せず戦闘を行った場合に落ちる不具合を修正
  2015/12/21 競合バグ対応（OT氏のスキル発動条件設定追加スクリプト）（作者じゃないけど）
  2015/12/25 武器熟練度Lvアップ表示処理対応に伴い、処理修正（作者じゃないけど）
  2016/01/11 1.048対応（作者じゃないけど）
  
--------------------------------------------------------------------------*/

(function() {

var alias1 = NormalAttackOrderBuilder._endVirtualAttack;
NormalAttackOrderBuilder._endVirtualAttack = function(virtualActive, virtualPassive) {
	alias1.call(this, virtualActive, virtualPassive);
	
	this._calculateWeaponExp(virtualActive, virtualPassive);
};

NormalAttackOrderBuilder._calculateWeaponExp = function(virtualActive, virtualPassive) {
	var weapon, wexp, attackcount, unit;
	var unitSrc = this._attackInfo.unitSrc;
	var unitDest = this._attackInfo.unitDest;
	
	this._order._unitPlayerOldArr = null;
	this._order._unitPlayerNew = null;

	// 経験値を得るのは自軍であるため、UnitType.PLAYERの比較は必須。
	// 自軍はunitSrcのときもunitDestのときもある。
	
	if (unitSrc.getUnitType() === UnitType.PLAYER) {
		// 攻撃をしかけたのが自軍の処理
		unit = unitSrc;
		weapon = virtualActive.weapon;
		attackcount = virtualActive.attackCount;

		// 武器熟練度加算前の自軍ユニットを退避
		this._order._unitPlayerOldArr = ParamGroup.getParamJukurendoArray(unit);

	}
	else if (unitDest.getUnitType() === UnitType.PLAYER) {
		// 攻撃を受けたのが自軍の処理
		unit = unitDest;
		weapon = virtualPassive.weapon;
		attackcount = virtualPassive.attackCount;

		// 武器熟練度加算前の自軍ユニットを退避
		this._order._unitPlayerOldArr = ParamGroup.getParamJukurendoArray(unit);
	}
	else {
		// 武器経験値を得ることはない
		return;
	}
	
	if(weapon === null) {
		// 武器を装備していない場合、武器経験値を得ることはない
		return;
	}
	
	if(typeof weapon.custom.wexp === 'number') {
		// 武器経験値が正しく定義されている場合
		wexp = attackcount * weapon.custom.wexp;
	}
	else {
		// 武器経験値が正しく定義されていない場合、武器経験値を1として扱う
		wexp = attackcount;
	}
	
	NormalAttackOrderBuilder._addWeaponExp(unit, wexp, weapon.custom.wtype);

	// 武器熟練度加算後の自軍ユニット
	this._order._unitPlayerNew = unit;
};




// 全ての能力値（武器熟練度含む）の値を取り出し、配列として返す
// （配列は熟練度のLvUpチェックで使用する）
ParamGroup.getParamJukurendoArray= function(unit) {
		var value;
		var i;
		var count = this.getParameterCount();
		var arr = [];

		// 熟練度の値を取得（配列を崩すとややこしいので、配列[0]=HP から熟練度終端まで全てを配列にしている）
		for (i = 0; i < count; i++){
			value = ParamGroup.getJukurendoLevelValue(unit, i);
			arr.push(value);
		}
		return arr;
};


// 指定の武器熟練度を取得する
ParamGroup.getJukurendoLevelValue= function(unit, param_index) {
		var param_name;
		var value = 0;
		var weapon = ItemControl.getEquippedWeapon(unit); 

		// 能力値を指定された場合、あるいは配列範囲外なら０を返す。
		if( param_index < this.getMainStatusCount() || param_index >= this.getParameterCount() ) {
			return 0;
		}

		// パラメータの値（熟練度の値）の記述
		param_name = this.getParameterName(param_index);
		//  武器が装備可能か調べる
		if( this._isWeaponTypeEquiped(unit, param_name) ) {
			// 装備可能な場合、ボーナスも加算する
			value = this.getClassUnitValue(unit, param_index) + this.getUnitTotalParamBonus(unit, param_index, weapon);
		}
		else if( (param_name === '杖') && (unit.getClass().getClassOption() & ClassOptionFlag.WAND) ) {
			// 杖が使用可能な場合、ボーナスも加算する(杖熟練度を実装していない場合、意味を持たない)
			value = this.getClassUnitValue(unit, param_index) + this.getUnitTotalParamBonus(unit, param_index, weapon);
		}

		return value;
};


// 指定ユニットの、指定武器装備可否チェック
ParamGroup._isWeaponTypeEquiped= function(unit, paramname) {
		var i;
		var list = unit.getClass().getEquipmentWeaponTypeReferenceList();
		var count = list.getTypeCount();
		
		// クラスの装備可能武器のリストに入っているか
		for (i = 0; i < count; i++) {
			if (paramname === list.getTypeData(i).getName()) {
				return true;
			}
		}
		
		return false;
}


})();