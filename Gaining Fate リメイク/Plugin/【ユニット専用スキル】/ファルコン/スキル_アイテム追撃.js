/*--------------------------------------------------------------------------

  ファルコン専用スキル「アイテム追撃」

  アイテムを使用した後、待機せずに攻撃（または待機）を選択できる。

  使用方法:
  1. データベースでスキルを作成し、種類を「カスタム」にする
  2. キーワードに [Falcon_ItemAttack] を設定する
  3. 対象ユニット（ファルコン）にスキルを所持させる

  備考:
  ・ユニットコマンド「アイテム」使用後に発動します（杖コマンドは対象外）
  ・アイテム使用後は「攻撃」と「待機」のみ選択できます
  ・キャンセルした場合は行動済みとして待機します

--------------------------------------------------------------------------*/

(function() {

var FALCON_ITEM_ATTACK_KEYWORD = 'Falcon_ItemAttack';

var FalconItemAttackControl = {
	isSkillActive: function(unit) {
		return SkillControl.getPossessionCustomSkill(unit, FALCON_ITEM_ATTACK_KEYWORD) !== null;
	},

	isAfterItemUse: function(unit) {
		return unit.custom.tmpFalconAfterItem === true;
	},

	setAfterItemUse: function(unit, isEnabled) {
		if (isEnabled) {
			unit.custom.tmpFalconAfterItem = true;
		}
		else {
			delete unit.custom.tmpFalconAfterItem;
		}
	}
};

// アイテム使用後、スキル所持時は待機せずコマンド選択に戻る
var alias1 = UnitCommand.Item._moveUse;
UnitCommand.Item._moveUse = function() {
	if (this._itemUse.moveUseCycle() !== MoveResult.CONTINUE) {
		var unit = this.getCommandTarget();

		if (FalconItemAttackControl.isSkillActive(unit) && !FalconItemAttackControl.isAfterItemUse(unit)) {
			FalconItemAttackControl.setAfterItemUse(unit, true);
			// 行動済み扱いにしつつ、コマンドメニューへ戻す
			this.setExitCommand(this);
			this.rebuildCommand();
			return MoveResult.END;
		}

		this.endCommandAction();
		return MoveResult.END;
	}

	return MoveResult.CONTINUE;
};

// アイテム使用後は攻撃と待機のみ表示
var alias2 = UnitCommand.configureCommands;
UnitCommand.configureCommands = function(groupArray) {
	var unit = this.getListCommandUnit();

	if (FalconItemAttackControl.isAfterItemUse(unit)) {
		groupArray.appendObject(UnitCommand.Attack);
		groupArray.appendObject(UnitCommand.Wait);
		return;
	}

	alias2.call(this, groupArray);
};

// 待機確定時にフラグをクリア
var alias3 = UnitWaitFlowEntry._completeMemberData;
UnitWaitFlowEntry._completeMemberData = function(playerTurn) {
	var unit = playerTurn.getTurnTargetUnit();
	FalconItemAttackControl.setAfterItemUse(unit, false);
	return alias3.call(this, playerTurn);
};

// 自軍ターン開始時にもフラグをクリア
var alias4 = TurnChangeStart._removeWaitState;
TurnChangeStart._removeWaitState = function(unit) {
	FalconItemAttackControl.setAfterItemUse(unit, false);
	alias4.call(this, unit);
};

})();
