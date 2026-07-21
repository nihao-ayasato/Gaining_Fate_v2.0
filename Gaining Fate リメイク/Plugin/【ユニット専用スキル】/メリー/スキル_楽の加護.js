/*--------------------------------------------------------------------------

  メリー専用スキル「楽の加護」

  周囲3マス以内にいる、スキル「楽属性」を持つ味方の
  攻撃力（威力）と防御力がそれぞれ+1される。

  使用方法:
  1. データベースでスキルを作成し、種類を「カスタム」にする
  2. キーワードに [Merry_PleasureAura] を設定する
  3. 対象ユニット（メリー）にスキルを所持させる
  4. 対象となる味方には、名前が「楽属性」のスキルを所持させる

  備考:
  ・メリー自身は対象に含みません（周囲1〜3マスの味方のみ）
  ・自軍のみ対象です（同盟軍は含みません）
  ・戦闘予測・実戦の両方に反映されます

  カスタムパラメータ（任意）:
  {
      range: 3,          // 範囲（未指定時は3）
      powerBonus: 1,     // 攻撃力補正（未指定時は1）
      defenseBonus: 1,   // 防御力補正（未指定時は1）
      skillName: '楽属性' // 対象スキル名（未指定時は「楽属性」）
  }

--------------------------------------------------------------------------*/

(function() {

var MERRY_PLEASURE_AURA_KEYWORD = 'Merry_PleasureAura';
var DEFAULT_RANGE = 3;
var DEFAULT_POWER_BONUS = 2;
var DEFAULT_DEFENSE_BONUS = 2;
var DEFAULT_SKILL_NAME = '楽';

var MerryPleasureAuraControl = {
	getAuraBonus: function(unit) {
		var i, j, list, count, merryUnit, skill;
		var range, powerBonus, defenseBonus, skillName;
		var listArray = FilterControl.getListArray(FilterControl.getNormalFilter(unit.getUnitType()));
		var result = {
			power: 0,
			defense: 0
		};

		for (i = 0; i < listArray.length; i++) {
			list = listArray[i];
			count = list.getCount();
			for (j = 0; j < count; j++) {
				merryUnit = list.getData(j);
				if (merryUnit === null || merryUnit === unit) {
					continue;
				}
				if (merryUnit.isInvisible()) {
					continue;
				}
				if (FusionControl.getFusionParent(merryUnit)) {
					continue;
				}

				skill = SkillControl.getPossessionCustomSkill(merryUnit, MERRY_PLEASURE_AURA_KEYWORD);
				if (skill === null) {
					continue;
				}

				range = DEFAULT_RANGE;
				powerBonus = DEFAULT_POWER_BONUS;
				defenseBonus = DEFAULT_DEFENSE_BONUS;
				skillName = DEFAULT_SKILL_NAME;

				if (typeof skill.custom.range === 'number') {
					range = skill.custom.range;
				}
				if (typeof skill.custom.powerBonus === 'number') {
					powerBonus = skill.custom.powerBonus;
				}
				if (typeof skill.custom.defenseBonus === 'number') {
					defenseBonus = skill.custom.defenseBonus;
				}
				if (typeof skill.custom.skillName === 'string') {
					skillName = skill.custom.skillName;
				}

				if (!this._hasSkillByName(unit, skillName)) {
					continue;
				}
				if (!this._isWithinRange(merryUnit, unit, range)) {
					continue;
				}

				result.power += powerBonus;
				result.defense += defenseBonus;
				return result;
			}
		}

		return result;
	},

	_hasSkillByName: function(unit, skillName) {
		var i, count, skill;
		var weapon = ItemControl.getEquippedWeapon(unit);
		var list = SkillControl.getSkillMixArray(unit, weapon, -1, '');

		count = list.length;
		for (i = 0; i < count; i++) {
			skill = list[i].skill;
			if (skill !== null && skill.getName() === skillName) {
				return true;
			}
		}

		return false;
	},

	_isWithinRange: function(centerUnit, targetUnit, range) {
		var indexArray;

		if (range < 1) {
			return false;
		}

		indexArray = IndexArray.getBestIndexArray(centerUnit.getMapX(), centerUnit.getMapY(), 1, range);
		return IndexArray.findUnit(indexArray, targetUnit);
	}
};

var alias1 = SupportCalculator.createTotalStatus;
SupportCalculator.createTotalStatus = function(unit) {
	var totalStatus = alias1.call(this, unit);
	var bonus;

	if (unit === null) {
		return totalStatus;
	}

	bonus = MerryPleasureAuraControl.getAuraBonus(unit);
	totalStatus.powerTotal += bonus.power;
	totalStatus.defenseTotal += bonus.defense;

	return totalStatus;
};

})();
