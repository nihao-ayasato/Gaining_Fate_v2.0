/*--------------------------------------------------------------------------

  レガート専用スキル「連携命中」

  2マス以内にいる自軍ユニットの数 × 命中+5%（最大5人分 = +25%）

  使用方法:
  1. データベースでスキルを作成し、種類を「カスタム」にする
  2. キーワードに [Legato_NearHit] を設定する
  3. 対象ユニット（レガート）にスキルを所持させる

  備考:
  ・自身は人数に含みません（周囲1〜2マスの自軍のみ）
  ・同盟軍は含みません（自軍のみ）
  ・戦闘予測・実戦の命中率の両方に反映されます

  カスタムパラメータ（任意）:
  {
      hitBonus: 5,   // 1人あたりの命中補正（未指定時は5）
      maxCount: 5,   // カウント上限（未指定時は5）
      range: 2       // 周囲マス数（未指定時は2）
  }

--------------------------------------------------------------------------*/

(function() {

var LEGATO_NEAR_HIT_KEYWORD = 'Legato_NearHit';
var DEFAULT_HIT_BONUS = 5;
var DEFAULT_MAX_COUNT = 5;
var DEFAULT_RANGE = 2;

var alias1 = HitCalculator.calculateSingleHit;
HitCalculator.calculateSingleHit = function(active, passive, weapon, totalStatus) {
	var value = alias1.call(this, active, passive, weapon, totalStatus);
	var skill = SkillControl.getPossessionCustomSkill(active, LEGATO_NEAR_HIT_KEYWORD);

	if (skill !== null) {
		value += LegatoNearHitControl.getHitBonus(active, skill);
	}

	return value;
};

var LegatoNearHitControl = {
	getHitBonus: function(unit, skill) {
		var hitBonus = DEFAULT_HIT_BONUS;
		var maxCount = DEFAULT_MAX_COUNT;
		var range = DEFAULT_RANGE;
		var count;

		if (typeof skill.custom.hitBonus === 'number') {
			hitBonus = skill.custom.hitBonus;
		}
		if (typeof skill.custom.maxCount === 'number') {
			maxCount = skill.custom.maxCount;
		}
		if (typeof skill.custom.range === 'number') {
			range = skill.custom.range;
		}

		count = this._getNearAllyCount(unit, range);
		if (count > maxCount) {
			count = maxCount;
		}

		return count * hitBonus;
	},

	_getNearAllyCount: function(unit, range) {
		var i, index, x, y, targetUnit;
		var count = 0;
		var indexArray;
		var filter = FilterControl.getNormalFilter(unit.getUnitType());

		if (range < 1) {
			return 0;
		}

		indexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, range);
		for (i = 0; i < indexArray.length; i++) {
			index = indexArray[i];
			x = CurrentMap.getX(index);
			y = CurrentMap.getY(index);
			targetUnit = PosChecker.getUnitFromPos(x, y);

			if (targetUnit === null || targetUnit === unit) {
				continue;
			}
			if (targetUnit.isInvisible()) {
				continue;
			}
			if (FusionControl.getFusionParent(targetUnit)) {
				continue;
			}
			if (!this._isSameArmy(targetUnit, filter)) {
				continue;
			}

			count++;
		}

		return count;
	},

	_isSameArmy: function(unit, filter) {
		var type = unit.getUnitType();

		if ((filter & UnitFilterFlag.PLAYER) && type === UnitType.PLAYER) {
			return true;
		}
		if ((filter & UnitFilterFlag.ENEMY) && type === UnitType.ENEMY) {
			return true;
		}
		if ((filter & UnitFilterFlag.ALLY) && type === UnitType.ALLY) {
			return true;
		}

		return false;
	}
};

})();
