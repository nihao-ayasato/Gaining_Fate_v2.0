/*--------------------------------------------------------------------------

  アグリ専用スキル「窮地防御」

  戦闘時、体力が50%以下の場合に防御+2

  使用方法:
  1. データベースでスキルを作成し、種類を「カスタム」にする
  2. キーワードに [Agri_LowHpDef] を設定する
  3. 対象ユニット（アグリ）にスキルを所持させる

  備考:
  ・物理攻撃／投射攻撃を受けたときの防御にのみ加算されます（魔防は対象外）
  ・戦闘予測・実戦のダメージ計算の両方に反映されます
  ・最大HPの50%以下で発動します（端数切り捨て後の値と比較）

  カスタムパラメータ（任意）:
  {
      defBonus: 2,   // 防御補正（未指定時は2）
      hpRate: 50     // 発動HP割合（%）未指定時は50
  }

--------------------------------------------------------------------------*/

(function() {

var AGRI_LOW_HP_DEF_KEYWORD = 'Agri_LowHpDef';
var DEFAULT_DEF_BONUS = 2;
var DEFAULT_HP_RATE = 50;

var alias1 = DamageCalculator.calculateDefense;
DamageCalculator.calculateDefense = function(active, passive, weapon, isCritical, totalStatus, trueHitValue) {
	var def = alias1.call(this, active, passive, weapon, isCritical, totalStatus, trueHitValue);
	var skill = SkillControl.getPossessionCustomSkill(passive, AGRI_LOW_HP_DEF_KEYWORD);
	var defBonus, hpRate;

	if (skill === null) {
		return def;
	}

	// 物理／投射以外（魔法）には防御補正を適用しない
	if (!Miscellaneous.isPhysicsBattle(weapon)) {
		return def;
	}

	defBonus = DEFAULT_DEF_BONUS;
	hpRate = DEFAULT_HP_RATE;

	if (typeof skill.custom.defBonus === 'number') {
		defBonus = skill.custom.defBonus;
	}
	if (typeof skill.custom.hpRate === 'number') {
		hpRate = skill.custom.hpRate;
	}

	if (AgriLowHpDefControl.isHpRateOrBelow(passive, hpRate)) {
		def += defBonus;
	}

	return def;
};

var AgriLowHpDefControl = {
	isHpRateOrBelow: function(unit, hpRate) {
		var maxHp = ParamBonus.getMhp(unit);
		var currentHp = unit.getHp();
		var threshold;

		if (maxHp <= 0) {
			return false;
		}

		threshold = Math.floor(maxHp * (hpRate / 100));
		return currentHp <= threshold;
	}
};

})();
