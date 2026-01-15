
/*--------------------------------------------------------------------------
  
  スキル「アーマーブレイク」
  スキル発動時に防御力を無視します。
  FEでいう「月光」スキル

  使用方法:
  スキルでカスタムを選択し、キーワードに[OT_BreakAttack]を設定します。

  カスタムパラメータ
  {
    BreakPercent:(数値)	//相手の防御力を何%無視するか設定
  }

  BreakPercentが未設定なら相手の防御力を100%無視します。
  
  作成者:
  o-to
  
  更新履歴:
  2015/5/31:新規作成
  2015/6/14:スキル発動する前にalias3.callするように修正
  2017/4/23:このスクリプト使用時に必中スキルのオプションの防御無視が機能しなくなっていたため修正

--------------------------------------------------------------------------*/


(function() {

var alias1 = SkillRandomizer.isCustomSkillInvokedInternal;
SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
	
	// アーマーブレイク
	if (keyword === 'OT_BreakAttack') {
		// 発動型でない場合は、単純にtrueを返すだけでよい
		return this._isSkillInvokedInternal(active, passive, skill);
	}

	return alias1.call(this, active, passive, skill, keyword);
};

// ダメージ設定
var alias2 = AttackEvaluator.HitCritical.calculateDamage;
AttackEvaluator.HitCritical.calculateDamage = function(virtualActive, virtualPassive, attackEntry) {
	var active = virtualActive.unitSelf;
	var passive = virtualPassive.unitSelf;

	// アーマーブレイク
	if (SkillControl.checkAndPushCustomSkill(virtualActive.unitSelf, virtualPassive.unitSelf, attackEntry, true, 'OT_BreakAttack') !== null) {
		virtualActive.unitSelf.custom.tmpBreakCheck = true;
	}

	return alias2.call(this, virtualActive, virtualPassive, attackEntry);
};

// ダメージを受ける側の設定
var alias3 = DamageCalculator.calculateDefense;
DamageCalculator.calculateDefense = function(active, passive, weapon, isCritical, totalStatus, trueHitValue) {

	var def = alias3.call(this, active, passive, weapon, isCritical, totalStatus, trueHitValue);
	var BreakCheck = active.custom.tmpBreakCheck;
	delete active.custom.tmpBreakCheck;

	// スキルが発動した場合は、防御無視
	if (BreakCheck == true) {
		var skill = SkillControl.getPossessionCustomSkill(active, 'OT_BreakAttack');
		var custom = skill.custom;
		var percent = 0;
		
		if( custom.BreakPercent != null )
		{
			percent = (100 - custom.BreakPercent) / 100;
		}

		def = Math.floor(def * percent);
	}
	
	return def;
}

})();

