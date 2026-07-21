/*--------------------------------------------------------------------------

  ダーハマ専用スキル「半減防御」

  25%の確率で、受けたダメージが半減する。

  使用方法:
  1. データベースでスキルを作成し、種類を「カスタム」にする
  2. キーワードに [Dahama_HalfDamage] を設定する
  3. 発動率を 25%（絶対など）に設定する
  4. 対象ユニット（ダーハマ）にスキルを所持させる

  備考:
  ・発動率はスキルの「発動」設定を使用します（推奨: 25%）
  ・「発動時に表示する」を有効にすると戦闘中にスキル名が表示されます
  ・戦闘予測には反映されません（発動は実戦時のみ判定）

  カスタムパラメータ（任意）:
  {
      guardValue: 50   // ダメージ軽減率（%）。50なら半減（未指定時は50）
  }

--------------------------------------------------------------------------*/

(function() {

var DAHAMA_HALF_DAMAGE_KEYWORD = 'Dahama_HalfDamage';
var DEFAULT_GUARD_VALUE = 50;

var alias1 = SkillRandomizer.isCustomSkillInvokedInternal;
SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
	if (keyword === DAHAMA_HALF_DAMAGE_KEYWORD) {
		return this._isSkillInvokedInternal(active, passive, skill);
	}

	return alias1.call(this, active, passive, skill, keyword);
};

var alias2 = AttackEvaluator.ActiveAction._getDamageGuardValue;
AttackEvaluator.ActiveAction._getDamageGuardValue = function(virtualActive, virtualPassive, attackEntry) {
	var value = alias2.call(this, virtualActive, virtualPassive, attackEntry);
	var skill;

	if (value !== -1) {
		return value;
	}

	skill = SkillControl.checkAndPushCustomSkill(
		virtualPassive.unitSelf,
		virtualActive.unitSelf,
		attackEntry,
		false,
		DAHAMA_HALF_DAMAGE_KEYWORD
	);

	if (skill === null) {
		return -1;
	}

	value = DEFAULT_GUARD_VALUE;
	if (typeof skill.custom.guardValue === 'number') {
		value = skill.custom.guardValue;
	}

	return value;
};

})();
