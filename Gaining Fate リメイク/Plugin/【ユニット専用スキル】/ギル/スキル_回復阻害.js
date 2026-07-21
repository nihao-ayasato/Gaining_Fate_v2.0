/*--------------------------------------------------------------------------

  ギル専用スキル「回復阻害」

  周囲3マス以内にいる敵味方の回復量が半減する。

  使用方法:
  1. データベースでスキルを作成し、種類を「カスタム」にする
  2. キーワードに [Gil_RecoveryHalf] を設定する
  3. 対象ユニット（ギル）にスキルを所持させる

  備考:
  ・回復を受けるユニットが、ギルの周囲1〜3マスにいる場合に発動します
  ・ギル自身の回復は対象外です
  ・敵・味方の両方に効果があります
  ・杖／回復アイテム／ターン開始時の自動回復などに反映されます
  ・全回復の場合は「不足HPの半分」だけ回復します

  カスタムパラメータ（任意）:
  {
      range: 3,   // 範囲（未指定時は3）
      rate: 0.5   // 倍率（未指定時は0.5）
  }

--------------------------------------------------------------------------*/

(function() {

var GIL_RECOVERY_HALF_KEYWORD = 'Gil_RecoveryHalf';
var DEFAULT_RANGE = 3;
var DEFAULT_RATE = 0.5;

var GilRecoveryHalfControl = {
	isRecoveryHalved: function(targetUnit) {
		return this._findAuraSkill(targetUnit) !== null;
	},

	getRecoveryRate: function(targetUnit) {
		var skill = this._findAuraSkill(targetUnit);
		var rate = DEFAULT_RATE;

		if (skill === null) {
			return 1;
		}
		if (typeof skill.custom.rate === 'number') {
			rate = skill.custom.rate;
		}

		return rate;
	},

	_findAuraSkill: function(targetUnit) {
		var i, j, list, count, gilUnit, skill, range;
		var listArray;

		if (targetUnit === null) {
			return null;
		}

		listArray = FilterControl.getAliveListArray(UnitFilterFlag.PLAYER | UnitFilterFlag.ENEMY | UnitFilterFlag.ALLY);
		for (i = 0; i < listArray.length; i++) {
			list = listArray[i];
			count = list.getCount();
			for (j = 0; j < count; j++) {
				gilUnit = list.getData(j);
				if (gilUnit === null || gilUnit === targetUnit) {
					continue;
				}
				if (gilUnit.isInvisible()) {
					continue;
				}
				if (FusionControl.getFusionParent(gilUnit)) {
					continue;
				}

				skill = SkillControl.getPossessionCustomSkill(gilUnit, GIL_RECOVERY_HALF_KEYWORD);
				if (skill === null) {
					continue;
				}

				range = DEFAULT_RANGE;
				if (typeof skill.custom.range === 'number') {
					range = skill.custom.range;
				}

				if (this._isWithinRange(gilUnit, targetUnit, range)) {
					return skill;
				}
			}
		}

		return null;
	},

	_isWithinRange: function(centerUnit, targetUnit, range) {
		var indexArray;

		if (range < 1) {
			return false;
		}

		indexArray = IndexArray.getBestIndexArray(centerUnit.getMapX(), centerUnit.getMapY(), 1, range);
		return IndexArray.findUnit(indexArray, targetUnit);
	},

	arrangeValue: function(targetUnit, value) {
		var rate;

		if (value <= 0) {
			return value;
		}
		if (!this.isRecoveryHalved(targetUnit)) {
			return value;
		}

		rate = this.getRecoveryRate(targetUnit);
		return Math.floor(value * rate);
	}
};

// 回復量の最終計算（予測・全体回復・MAX変換など）
var alias1 = Calculator.calculateRecoveryValue;
Calculator.calculateRecoveryValue = function(targetUnit, recoveryValue, recoveryType, plus) {
	var n;
	var maxMhp = ParamBonus.getMhp(targetUnit);

	if (GilRecoveryHalfControl.isRecoveryHalved(targetUnit)) {
		if (recoveryType === RecoveryType.MAX) {
			n = maxMhp - targetUnit.getHp();
			return GilRecoveryHalfControl.arrangeValue(targetUnit, n);
		}

		n = alias1.call(this, targetUnit, recoveryValue, recoveryType, plus);
		return GilRecoveryHalfControl.arrangeValue(targetUnit, n);
	}

	return alias1.call(this, targetUnit, recoveryValue, recoveryType, plus);
};

// 単体回復アイテム／杖は calculateRecoveryValue を経由しないため、ここで合わせる
RecoveryItemUse.enterMainUseCycle = function(itemUseParent) {
	var generator;
	var itemTargetInfo = itemUseParent.getItemTargetInfo();
	var recoveryInfo = itemTargetInfo.item.getRecoveryInfo();
	var type = itemTargetInfo.item.getRangeType();
	var plus = Calculator.calculateRecoveryItemPlus(itemTargetInfo.unit, itemTargetInfo.targetUnit, itemTargetInfo.item);
	var value = Calculator.calculateRecoveryValue(
		itemTargetInfo.targetUnit,
		recoveryInfo.getRecoveryValue(),
		recoveryInfo.getRecoveryType(),
		plus
	);

	this._dynamicEvent = createObject(DynamicEvent);
	generator = this._dynamicEvent.acquireEventGenerator();

	if (type !== SelectionRangeType.SELFONLY) {
		generator.locationFocus(itemTargetInfo.targetUnit.getMapX(), itemTargetInfo.targetUnit.getMapY(), true);
	}

	generator.hpRecovery(
		itemTargetInfo.targetUnit,
		this._getItemRecoveryAnime(itemTargetInfo),
		value,
		RecoveryType.SPECIFY,
		itemUseParent.isItemSkipMode()
	);

	return this._dynamicEvent.executeDynamicEvent();
};

// ターン開始時の自動回復
var alias3 = RecoveryAllFlowEntry._getRecoveryValue;
RecoveryAllFlowEntry._getRecoveryValue = function(unit) {
	var recoveryValue = alias3.call(this, unit);

	if (recoveryValue > 0) {
		recoveryValue = GilRecoveryHalfControl.arrangeValue(unit, recoveryValue);
	}

	return recoveryValue;
};

})();
