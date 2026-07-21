/*--------------------------------------------------------------------------

  エネルジコ専用スキル「再行動」

  周囲2マス以内の待機済み味方を再行動させられる。
  自軍コマンド／敵AIの両方に対応。

  使用方法:
  1. データベースでスキルを作成し、種類を「カスタム」にする
  2. キーワードに [Energico_Refresh] を設定する
  3. 対象ユニット（エネルジコなど）にスキルを所持させる

  コマンド位置の調整:
  下の ENERGICO_COMMAND_INDEX を変更してください。
  ・0 = 一番上
  ・1 = 上から2番目
  ・-1 = 「行動回復」の直後
  ・見つからない場合は末尾寄りに追加されます

  カスタムパラメータ（任意）:
  {
      range: 2,   // 範囲（未指定時は2）
      exp: 0      // 使用時に得る経験値（未指定時は0）
  }

--------------------------------------------------------------------------*/

(function() {

var ENERGICO_REFRESH_KEYWORD = 'Energico_Refresh';
var ENERGICO_COMMAND_NAME = '応援';
var DEFAULT_RANGE = 2;

// コマンドの表示位置（0が一番上、-1なら「行動回復」の直後）
var ENERGICO_COMMAND_INDEX = 1;

var EnergicoRefreshControl = {
	isRefreshSkill: function(skill) {
		return skill !== null &&
			skill.getSkillType() === SkillType.CUSTOM &&
			skill.getCustomKeyword() === ENERGICO_REFRESH_KEYWORD;
	},

	getRange: function(skill) {
		if (skill !== null && typeof skill.custom.range === 'number') {
			return skill.custom.range;
		}

		return DEFAULT_RANGE;
	},

	getExp: function(skill) {
		if (skill !== null && typeof skill.custom.exp === 'number') {
			return skill.custom.exp;
		}

		return 0;
	}
};

//----------------------------------
// 自軍コマンド
//----------------------------------
UnitCommand.EnergicoRefresh = defineObject(UnitCommand.Quick,
{
	getCommandName: function() {
		return ENERGICO_COMMAND_NAME;
	},

	isCommandDisplayable: function() {
		return this._getTradeArray(this.getCommandTarget()).length !== 0;
	},

	_completeCommandMemberData: function() {
		var skill = SkillControl.getPossessionCustomSkill(this.getCommandTarget(), ENERGICO_REFRESH_KEYWORD);
		var unit = this.getCommandTarget();
		var filter = this._getUnitFilter();
		var indexArray = this._getTradeArray(unit);

		if (skill === null) {
			return;
		}

		this._exp = EnergicoRefreshControl.getExp(skill);
		this._posSelector.setUnitOnly(unit, ItemControl.getEquippedWeapon(unit), indexArray, PosMenuType.Default, filter);
		this._posSelector.setFirstPos();
		this.changeCycleMode(QuickCommandMode.SELECT);
	},

	_getTradeArray: function(unit) {
		var i, index, x, y, targetUnit, skill, range;
		var indexArray = [];
		var candidates;

		skill = SkillControl.getPossessionCustomSkill(unit, ENERGICO_REFRESH_KEYWORD);
		if (skill === null) {
			return indexArray;
		}

		range = EnergicoRefreshControl.getRange(skill);
		if (range < 1) {
			return indexArray;
		}

		candidates = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, range);
		for (i = 0; i < candidates.length; i++) {
			index = candidates[i];
			x = CurrentMap.getX(index);
			y = CurrentMap.getY(index);
			targetUnit = PosChecker.getUnitFromPos(x, y);
			if (targetUnit !== null && this._isTargetAllowed(targetUnit, unit, skill)) {
				indexArray.push(index);
			}
		}

		return indexArray;
	},

	_isTargetAllowed: function(targetUnit, unit, skill) {
		if (!targetUnit.isWait()) {
			return false;
		}

		if (targetUnit.getUnitType() !== unit.getUnitType()) {
			return false;
		}

		if (!skill.getTargetAggregation().isCondition(targetUnit)) {
			return false;
		}

		return true;
	}
}
);

var alias1 = UnitCommand.configureCommands;
UnitCommand.configureCommands = function(groupArray) {
	var i, index;

	alias1.call(this, groupArray);

	if (ENERGICO_COMMAND_INDEX >= 0) {
		index = ENERGICO_COMMAND_INDEX;
		if (index > groupArray.length) {
			index = groupArray.length;
		}
	}
	else {
		index = groupArray.length;
		for (i = 0; i < groupArray.length; i++) {
			if (groupArray[i] === UnitCommand.Quick) {
				index = i + 1;
				break;
			}
		}
	}

	groupArray.insertObject(UnitCommand.EnergicoRefresh, index);
};

//----------------------------------
// 敵AI：行動候補の収集
//----------------------------------
var alias2 = CombinationCollector.Skill._setCombination;
CombinationCollector.Skill._setCombination = function(misc) {
	var filter, rangeMetrics, range;

	if (EnergicoRefreshControl.isRefreshSkill(misc.skill)) {
		filter = FilterControl.getNormalFilter(misc.unit.getUnitType());
		range = EnergicoRefreshControl.getRange(misc.skill);
		rangeMetrics = StructureBuilder.buildRangeMetrics();
		rangeMetrics.startRange = 1;
		rangeMetrics.endRange = range;
		rangeMetrics.rangeType = SelectionRangeType.MULTI;
		this._setUnitRangeCombination(misc, filter, rangeMetrics);
		return;
	}

	alias2.call(this, misc);
};

//----------------------------------
// 敵AI：スコア評価
//----------------------------------
var alias3 = AIScorer.Skill._getAIObject;
AIScorer.Skill._getAIObject = function(unit, combination) {
	if (combination.skill !== null && EnergicoRefreshControl.isRefreshSkill(combination.skill)) {
		return createObject(QuickItemAI);
	}

	return alias3.call(this, unit, combination);
};

//----------------------------------
// 敵AI：実行
//----------------------------------
var alias4 = SkillAutoAction._enterSkillUse;
SkillAutoAction._enterSkillUse = function() {
	if (EnergicoRefreshControl.isRefreshSkill(this._skill)) {
		return this._enterQuick();
	}

	return alias4.call(this);
};

var alias5 = SkillAutoAction._moveSkillUse;
SkillAutoAction._moveSkillUse = function() {
	if (EnergicoRefreshControl.isRefreshSkill(this._skill)) {
		return this._dynamicEvent.moveDynamicEvent();
	}

	return alias5.call(this);
};

})();
