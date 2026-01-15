
/*--------------------------------------------------------------------------
  
  スキル「乱舞」
  スキル所有時にダメージが半減になるが2～5回攻撃を行うようになる
  カスタムパラメータで攻撃回数とダメージレート変更可

  使用方法:
  スキルでカスタムを選択し、キーワードに[OT_BoisterousDance]を設定します。
  カスタムパラメータを渡す事でスキルの詳細を設定できます。

  カスタムパラメータ
  {
      DamageRate     :(数値)	//何%ダメージになるか設定
    , MaxAttackCount :(数値)	//最大何回攻撃するか
    , MinAttackCount :(数値)	//最低でも何回攻撃するか
    , isRateChange   :(数値)	//0でスキルを所持しているだけでダメージレート変更、1でスキル発動時のみダメージレート変更
    , isNoReattack   :(数値)	//統合CalAのnoreattackの影響を受けるか設定、1で受ける、0で受けない
  }

  DamageRateが未設定なら50
  MaxAttackCountが未設定なら5になります。
  MinAttackCountが未設定なら2になります。
  isRateChangeが未設定なら0になります。
  isNoReattackは未設定なら1になります。
  
  作成者:
  o-to
  
  更新履歴:
  2015/5/31:新規作成
  2015/9/13:1-239氏の統合CalAのnoreattackに対応
  2015/10/31：公式の関数の名前変更に伴い修正

--------------------------------------------------------------------------*/


(function() {

var alias1 = SkillRandomizer.isCustomSkillInvokedInternal;
SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
	
	// 乱舞
	if (keyword === 'OT_BoisterousDance') {
		// 発動型でない場合は、単純にtrueを返すだけでよい
		
		// 1-239氏のnoreattackが設定されてたら発動しないようにする
		if( skill.custom.isNoReattack == null || skill.custom.isNoReattack == 1 )
		{
			var weapon = active.getItem(0); 
			var wpt = weapon.isWeapon(); 
			if (wpt == true){ 
				if(weapon.custom.noreattack == 1){ 
					return false;
				}
			}
		}

		return this._isSkillInvokedInternal(active, passive, skill);
	}

	return alias1.call(this, active, passive, skill, keyword);
};

// ダメージ設定
var alias2 = AttackEvaluator.HitCritical.calculateDamage;
AttackEvaluator.HitCritical.calculateDamage = function(virtualActive, virtualPassive, attackEntry) {
	var active = virtualActive.unitSelf;
	var passive = virtualPassive.unitSelf;
	var damage = alias2.call(this, virtualActive, virtualPassive, attackEntry);
	var skill = SkillControl.getPossessionCustomSkill(active, 'OT_BoisterousDance');
	
	if(skill != null)
	{
		if( skill.custom.isRateChange == 1 && virtualActive.tmpBoisterousDanceOn == false )
		{
			return damage;
		}
		
		var damage2;
		var custom = skill.custom;
		var percent = 0.5;
		
		if( custom.DamageRate != null )
		{
			percent = custom.DamageRate / 100;
		}

		damage2 = Math.floor(damage * percent);
		
		//乱舞未所持でのダメージが0以外かつ乱舞によるダメージが小数点以下になる場合、ダメージを1にする
		if( damage != 0 && damage2 == 0 )
		{
			if(damage >= 0)
			{
				damage = 1;
			}
			else
			{
				damage = -1;
			}
		}
		else
		{
			damage = damage2;
		}
	}

	return damage;
};

// 戦闘開始前の処理
var alias5 = NormalAttackOrderBuilder._getAttackCount;
NormalAttackOrderBuilder._getAttackCount = function(virtualActive, virtualPassive) {
	var skill;
	var attackCount = alias5.call(this, virtualActive, virtualPassive);
	
	skill = SkillControl.getPossessionCustomSkill(virtualActive.unitSelf, 'OT_BoisterousDance');
	
	if( skill != null )
	{
		//ここでtmpBoisterousDanceOnの初期化を行う
		virtualActive.tmpBoisterousDanceOn = false;
		if ( SkillRandomizer.isCustomSkillInvokedInternal(virtualActive.unitSelf, virtualPassive.unitSelf, skill, 'OT_BoisterousDance') ) {
			var custom = skill.custom;
			var min = 2;
			var max = 5;

			if(custom.MinAttackCount != null)
			{
				min = custom.MinAttackCount;
			}
	
			if(custom.MaxAttackCount != null)
			{
				max = custom.MaxAttackCount;
			}
			
			n = min + root.getRandomNumber() % (max - min + 1);

			// 乱舞のスキルによって攻撃回数が倍になる
			attackCount *= n;
			
			// attackEntryがないから、現時点で追加処理はできない。
			// 後で追加できるように保存する。
			virtualActive.tmpBoisterousDance = skill;
			virtualActive.tmpBoisterousDanceOn = true;
		}
	}
	
	return attackCount;
};

// attackEntryが作成された段階の処理
var alias6 = NormalAttackOrderBuilder._setInitialSkill;
NormalAttackOrderBuilder._setInitialSkill = function(virtualActive, virtualPassive, attackEntry) {
	
	alias6.call(this, virtualActive, virtualPassive, attackEntry);
	
	if (virtualActive.tmpBoisterousDance != null) {
		if (virtualActive.tmpBoisterousDance.isSkillDisplayable()) {
			attackEntry.skillArrayActive.push(virtualActive.tmpBoisterousDance);
		}
		virtualActive.tmpBoisterousDance = null;
	}
};


})();

