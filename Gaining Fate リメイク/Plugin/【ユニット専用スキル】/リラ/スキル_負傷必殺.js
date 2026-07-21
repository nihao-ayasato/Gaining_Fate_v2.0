/*--------------------------------------------------------------------------

  リラ専用スキル「負傷必殺」

  ダメージを受けている（最大HP未満）とき、必殺率が+20%

  使用方法:
  1. データベースでスキルを作成し、種類を「カスタム」にする
  2. キーワードに [Lila_DamagedCrit] を設定する
  3. 対象ユニット（リラ）にスキルを所持させる

  備考:
  ・攻撃側（リラ）のHPが最大未満のときに発動します
  ・戦闘予測・実戦の必殺率の両方に反映されます

  カスタムパラメータ（任意）:
  {
      critBonus: 20   // 必殺補正（未指定時は20）
  }

--------------------------------------------------------------------------*/

(function() {

var LILA_DAMAGED_CRIT_KEYWORD = 'Lila_DamagedCrit';
var DEFAULT_CRIT_BONUS = 20;

var alias1 = CriticalCalculator.calculateSingleCritical;
CriticalCalculator.calculateSingleCritical = function(active, passive, weapon, totalStatus) {
	var value = alias1.call(this, active, passive, weapon, totalStatus);
	var skill = SkillControl.getPossessionCustomSkill(active, LILA_DAMAGED_CRIT_KEYWORD);
	var critBonus;

	if (skill === null) {
		return value;
	}

	if (active.getHp() >= ParamBonus.getMhp(active)) {
		return value;
	}

	critBonus = DEFAULT_CRIT_BONUS;
	if (typeof skill.custom.critBonus === 'number') {
		critBonus = skill.custom.critBonus;
	}

	return value + critBonus;
};

})();
