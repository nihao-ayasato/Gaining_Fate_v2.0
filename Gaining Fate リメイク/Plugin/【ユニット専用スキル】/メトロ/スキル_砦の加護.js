/*--------------------------------------------------------------------------

  メトロ専用スキル「砦の加護」

  砦に位置するとき、攻撃力+2、守備力+2

  使用方法:
  1. データベースでスキルを作成し、種類を「カスタム」にする
  2. キーワードに [Metro_FortBonus] を設定する
  3. 対象ユニット（メトロ）にスキルを所持させる

  備考:
  ・地形名が「砦」のマスにいるとき発動します
  ・攻撃力は戦闘の威力、守備力は物理防御に加算されます
  ・戦闘予測・実戦の両方に反映されます

  カスタムパラメータ（任意）:
  {
      powerBonus: 2,      // 攻撃力補正（未指定時は2）
      defenseBonus: 2,    // 守備力補正（未指定時は2）
      terrainName: '砦'   // 地形名（未指定時は「砦」）
  }

--------------------------------------------------------------------------*/

(function() {

var METRO_FORT_BONUS_KEYWORD = 'Metro_FortBonus';
var DEFAULT_POWER_BONUS = 2;
var DEFAULT_DEFENSE_BONUS = 2;
var DEFAULT_TERRAIN_NAME = '砦';

var MetroFortBonusControl = {
	getBonus: function(unit) {
		var skill = SkillControl.getPossessionCustomSkill(unit, METRO_FORT_BONUS_KEYWORD);
		var powerBonus = DEFAULT_POWER_BONUS;
		var defenseBonus = DEFAULT_DEFENSE_BONUS;
		var terrainName = DEFAULT_TERRAIN_NAME;
		var result = {
			power: 0,
			defense: 0
		};

		if (skill === null) {
			return result;
		}

		if (typeof skill.custom.powerBonus === 'number') {
			powerBonus = skill.custom.powerBonus;
		}
		if (typeof skill.custom.defenseBonus === 'number') {
			defenseBonus = skill.custom.defenseBonus;
		}
		if (typeof skill.custom.terrainName === 'string') {
			terrainName = skill.custom.terrainName;
		}

		if (!this._isOnTerrain(unit, terrainName)) {
			return result;
		}

		result.power = powerBonus;
		result.defense = defenseBonus;
		return result;
	},

	_isOnTerrain: function(unit, terrainName) {
		var terrain = PosChecker.getTerrainFromPos(unit.getMapX(), unit.getMapY());

		if (terrain === null) {
			return false;
		}

		return terrain.getName() === terrainName;
	}
};

var alias1 = SupportCalculator.createTotalStatus;
SupportCalculator.createTotalStatus = function(unit) {
	var totalStatus = alias1.call(this, unit);
	var bonus;

	if (unit === null) {
		return totalStatus;
	}

	bonus = MetroFortBonusControl.getBonus(unit);
	totalStatus.powerTotal += bonus.power;
	totalStatus.defenseTotal += bonus.defense;

	return totalStatus;
};

})();
