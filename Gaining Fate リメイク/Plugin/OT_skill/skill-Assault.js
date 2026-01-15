
/*--------------------------------------------------------------------------
  
  スキル「戦闘続行」
  スキルが発動すると戦闘を続行する。FEでいう「突撃」
  ただし、スキル所持者が一方的に攻撃される状況では発動しない。
  (スキル所持者が一方的に攻撃できる状況なら発動可、カスパラでOFF可能)

  使用方法:
  スキルでカスタムを選択し、キーワードに[OT_Assault]を設定します。
  
  カスタムパラメータ
  {
      AS_Max:(数値)				//発動回数上限(未指定時は50)
    , AS_OneSide:(論理値)		//一方的に攻撃できる状況で発動するか(未指定時はtrue)
    , AS_AbortCheck:(論理値)	//不死身ユニットが相手の場合、不死身ユニットが瀕死になった時に発動を抑制する(未指定時はfalse)
  }
  
  AS_Max未指定時のデフォルト値はこのスクリプトのAS_MaxActivateで定義されています。
  
  AS_AbortCheckについてtrueにした場合、イベントの設定で不死身状態になったキャラに対して
  スキルやクリティカルでHPが0になる攻撃をした場合に発生する強制回避の実行時、
  通常攻撃のダメージ量がHPを上回った時に発動しないようになります。
  発動者が一方的に攻撃されて不利になる状況を緩和します。
  
  作成者:
  o-to
  
  更新履歴:
  2015/6/20:新規作成
  2015/9/6:公式の関数の削除に伴い修正
  2015/10/31：公式の関数の名前変更に伴い修正
  2019/05/25：
  相手が無敵だったり、攻撃が命中しない、HP吸収しあうなどで延々と戦闘するような状況になると
  スキル発動条件追加スクリプトを併用してスキル回数制限を設定しない限り、
  フリーズする問題があったためこのスキルのスクリプトの標準で発動回数を制限するように修正。
  
  一方的に攻撃できる状況で発動しないようにできるようカスパラで設定できるように修正。
  
  イベントの設定で不死身状態になったキャラ相手だと発動者が不利になる状況となるが
  それを緩和するためのカスパラを追加。
  
  スキルの発動表示が両方の戦闘が終わった後、スキルによって再戦闘した場合の
  最初の攻防で表示されるように修正。
  
--------------------------------------------------------------------------*/


(function() {
AS_MaxActivate = 50;
var tmpASRound = 0;

var alias1 = SkillRandomizer.isCustomSkillInvokedInternal;
SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
	
	// 戦闘続行
	if (keyword === 'OT_Assault') {
		if(typeof skill.custom.AS_AbortCheck != "undefined") {
			tmpASAbortCheck = skill.custom.AS_AbortCheck;
		}

		// 発動型でない場合は、単純にtrueを返すだけでよい
		return this._isSkillInvokedInternal(active, passive, skill);
	}

	return alias1.call(this, active, passive, skill, keyword);
};

// 攻撃回数取得時にスキル発動判定
// 戦闘回数の減少処理がisRound関数とこの関数の間、先攻と後攻の戦闘回数が0なのかの判定が関数化されていない
// 先攻と後攻の戦闘回数の両方を安全に弄れるのがこの関数の元の処理が終わった直後ぐらいなので
// ここで戦闘回数の追加を行っている
var alias2 = NormalAttackOrderBuilder._getAttackCount;
NormalAttackOrderBuilder._getAttackCount = function(virtualActive, virtualPassive) {
	var result = alias2.call(this, virtualActive, virtualPassive);

	// スキル発動表示の調整を行っている
	if(virtualActive.tmpAssault != null ) {
		virtualActive.tmpPushAssault = virtualActive.tmpAssault;
		virtualActive.tmpAssault = null;
	} 
	if(virtualPassive.tmpAssault != null ) {
		virtualPassive.tmpPushAssault = virtualPassive.tmpAssault;
		virtualPassive.tmpAssault = null;
	}

	if( virtualActive.roundCount === 0 && virtualPassive.roundCount === 0 )
	{
		var skill1 = SkillControl.getPossessionCustomSkill(virtualActive.unitSelf, 'OT_Assault');
		var skill2 = SkillControl.getPossessionCustomSkill(virtualPassive.unitSelf, 'OT_Assault');
		var ActiveWeapon  = virtualActive.weapon;
		var PassiveWeapon = virtualPassive.weapon;
		
		if( skill1 != null && SkillRandomizer.isCustomSkillInvokedInternal(virtualActive.unitSelf, virtualPassive.unitSelf, skill1, 'OT_Assault') )
		{
			// 発動判定チェック後、攻撃可能か確認
			// 攻撃封じ用の武器などで攻撃できない場合は発動しない
			if( NormalAttackOrderBuilder._isAttackContinue(virtualActive, virtualPassive) && tmpASRound < virtualActive.tmpASMaxActivate && !virtualActive.tmpASAbort)
			{
				// こちらが一方的に攻撃できる状況で
				// カスパラでAS_OneSideをfalseになっている場合は発動無し
				if( !virtualPassive.isCounterattack && !virtualActive.tmpASOneSide ) {
					//root.log("一方的な攻撃は禁止指定のため「戦闘続行」中断");
					return result;
				}
				
				tmpASRound++;
				virtualActive.tmpAssault = skill1;
				virtualActive.roundCount = Calculator.calculateRoundCount(virtualActive.unitSelf, virtualPassive.unitSelf, ActiveWeapon);

				// 相手が反撃可能ならば相手のラウンド変更
				// こちらが一方的に攻撃できる状況なら相手のラウンドは変更しない
				if( virtualPassive.isCounterattack )
				{
					virtualPassive.roundCount = Calculator.calculateRoundCount(virtualPassive.unitSelf, virtualActive.unitSelf, PassiveWeapon);
					virtualPassive.tmpAssaultPassive = true;
				}
			}
		}
		
		if( skill2 != null && SkillRandomizer.isCustomSkillInvokedInternal(virtualPassive.unitSelf, virtualActive.unitSelf, skill2, 'OT_Assault') )
		{
			// スキル発動者が攻撃封じ用の武器などで攻撃できない場合は発動しない
			if( NormalAttackOrderBuilder._isAttackContinue(virtualPassive, virtualActive) && tmpASRound < virtualPassive.tmpASMaxActivate && !virtualPassive.tmpASAbort)
			{
				// スキル発動者が一方的に攻撃されるような状況なら発動しない
				if( virtualPassive.isCounterattack )
				{
					virtualPassive.tmpAssault = skill2;
					virtualPassive.tmpAssaultEnable = true;
					
					// 攻撃者側がスキル発動していない場合のみ
					// 戦闘回数の修正を行う
					if(virtualActive.tmpAssault == null) {
						tmpASRound++;
						virtualActive.roundCount  = Calculator.calculateRoundCount(virtualActive.unitSelf, virtualPassive.unitSelf, ActiveWeapon);
						virtualPassive.roundCount = Calculator.calculateRoundCount(virtualPassive.unitSelf, virtualActive.unitSelf, PassiveWeapon);
						virtualPassive.tmpAssaultPassive = true;
					}
				}
			}
		}
	}
	return result;

};

// attackEntryが作成された段階の処理
// 両者の攻撃完了後、戦闘が続行したどちらかの最初の攻撃のタイミングでスキル発動表示がされるようにする
var alias3 = NormalAttackOrderBuilder._setInitialSkill;
NormalAttackOrderBuilder._setInitialSkill = function(virtualActive, virtualPassive, attackEntry) {
	alias3.call(this, virtualActive, virtualPassive, attackEntry);
	
	if(virtualActive.tmpPushAssault != null ) {
		if (virtualActive.tmpPushAssault.isSkillDisplayable()) {
			attackEntry.skillArrayActive.push(virtualActive.tmpPushAssault);
		}
		virtualActive.tmpPushAssault = null;
	} 
	if(virtualPassive.tmpPushAssault != null ) {
		if (virtualPassive.tmpPushAssault.isSkillDisplayable()) {
			attackEntry.skillArrayPassive.push(virtualPassive.tmpPushAssault);
		}
		virtualPassive.tmpPushAssault = null;
	}
};

// 攻撃を仕掛けた側のスキル発動後
// そのままだと直後に相手が攻撃するため攻撃を受ける側は一回スキップ
var alias4 = VirtualAttackControl.isRound;
VirtualAttackControl.isRound = function(virtualAttackUnit) {
	var result = alias4.call(this, virtualAttackUnit);
	
	if( result == true && virtualAttackUnit.tmpAssaultPassive == true && virtualAttackUnit.isSrc == false )
	{
		virtualAttackUnit.tmpAssaultPassive = false;
		result = false;
	}
	
	return result;
};

// 戦闘開始前に発動回数周りをリセット
var alias5 = NormalAttackOrderBuilder._startVirtualAttack;
NormalAttackOrderBuilder._startVirtualAttack = function() {
	tmpASRound = 0;
	//tmpASMaxActivate = AS_MaxActivate;
	//tmpASAbort = false;
	//tmpASAbortCheck = false;
	return alias5.call(this);
};

// 攻撃時に不死身状態の相手が瀕死だった場合、スキルの中断フラグを立てる
var alias6 = AttackEvaluator.PassiveAction.evaluateAttackEntry;
AttackEvaluator.PassiveAction.evaluateAttackEntry = function(virtualActive, virtualPassive, attackEntry) {
	// 「現HP-スキルやクリティカル等の補正後のダメージ」で0以下になるか確認
	// 不死身による回避でダメージ値が0になるためその前に内部値を取得
	var tmpHp = virtualPassive.hp - attackEntry.damagePassive;
	alias6.call(this, virtualActive, virtualPassive, attackEntry);
	
	// 中断確認フラグがある場合はチェックを行う
	if( virtualActive.tmpASAbortCheck ) {
		// 次回の攻撃にて「現HP-通常攻撃1回分のダメージ」で0以下になるか確認
		var tmpDmg = DamageCalculator.calculateDamage(virtualActive.unitSelf, virtualPassive.unitSelf, virtualActive.weapon, false, virtualActive.totalStatus, virtualPassive.totalStatus, 0);
		var tmpSimulateHP = virtualPassive.hp - tmpDmg - attackEntry.damagePassive;
		
		var passive = virtualPassive.unitSelf;
		if(passive.isImmortal()) {
			if(tmpHp <= 0 || tmpSimulateHP <= 0) {
				// 不死身でなければ次の一撃で倒せるぐらい弱っているため中断
				virtualActive.tmpASAbort = true;
				//root.log("不死身キャラが瀕死のため「戦闘続行」を中断");
				
				// tmpAssaultがnullの場合は戦闘回数を変動させていないので戦闘回数を変動させてはいけない
				// tmpAssaultがnullで無い場合はスキルを発動させて戦闘回数を変動させているため0に修正
				// レアケースとして、不死身キャラがスキルを保持していてスキルを発動している場合は変動しない
				if(virtualActive.tmpAssault) {
					if(virtualPassive.tmpAssault == null) {
						virtualActive.tmpAssault = null;
						virtualActive.roundCount = 0;
						virtualPassive.roundCount = 0;
					}
				}
			}
		}
	}
};

//// virtualAttackUnitにスキル用設定の初期値追加
//var alias100 = StructureBuilder.buildVirtualAttackUnit;
//StructureBuilder.buildVirtualAttackUnit = function() {
//	var virtualAttackUnit = alias100.call(this);
//	virtualAttackUnit.tmpAssaultEnable = false;
//	virtualAttackUnit.tmpAssault = null;
//	virtualAttackUnit.tmpPushAssault = null;
//	virtualAttackUnit.tmpASMaxActivate = AS_MaxActivate;
//	virtualAttackUnit.tmpASAbort = false;
//	virtualAttackUnit.tmpASAbortCheck = false;
//	virtualAttackUnit.tmpASOneSide = true;
//	return virtualAttackUnit;
//};

// virtualAttackUnit作成時にスキル用設定の初期値追加
var alias100 = VirtualAttackControl.createVirtualAttackUnit;
VirtualAttackControl.createVirtualAttackUnit = function(unitSelf, targetUnit, isSrc, attackInfo) {
	var virtualAttackUnit = alias100.call(this, unitSelf, targetUnit, isSrc, attackInfo);
	virtualAttackUnit.tmpAssaultEnable = false;
	virtualAttackUnit.tmpAssault = null;
	virtualAttackUnit.tmpPushAssault = null;
	virtualAttackUnit.tmpASMaxActivate = AS_MaxActivate;
	virtualAttackUnit.tmpASAbort = false;
	virtualAttackUnit.tmpASAbortCheck = false;
	virtualAttackUnit.tmpASOneSide = true;

	// スキル設定
	OT_AssaultCheckData(virtualAttackUnit);
	return virtualAttackUnit;
};

// スキル発動時にスキルに設定されたカスパラをvirtualAttackUnitに挿入
OT_AssaultCheckData = function(virtualAttackUnit) {
	var skill = SkillControl.getPossessionCustomSkill(virtualAttackUnit.unitSelf, 'OT_Assault');
	if( skill == null ) {
		return;
	}
		
	// AS_Maxが設定されている場合は最大発動回数をそれに設定
	if( typeof skill.custom.AS_Max !== 'undefined' ) {
		virtualAttackUnit.tmpASMaxActivate = skill.custom.AS_Max;
	}
	//if( typeof EC_EnableManager !== 'undefined' ) {
	//	// スキル発動条件追加スクリプトを使ってる人向けの処理
	//	// EC_TriggerCountBattleが設定されている場合は
	//	// 1戦闘でのスキル発動回数はスキル発動条件追加スクリプトで制御されてるため
	//	// tmpASMaxActivateの値はEC_TriggerCountBattleに合わせる
	//	if( skill.custom.EC_TriggerCountBattle != null ) {
	//		virtualAttackUnit.tmpASMaxActivate = skill.custom.EC_TriggerCountBattle;
	//	}
	//}
	
	if( typeof skill.custom.AS_AbortCheck !== 'undefined' ) {
		virtualAttackUnit.tmpASAbortCheck = skill.custom.AS_AbortCheck;
	}

	if( typeof skill.custom.AS_OneSide !== 'undefined' ) {
		virtualAttackUnit.tmpASOneSide = skill.custom.AS_OneSide;
	}
};

})();

