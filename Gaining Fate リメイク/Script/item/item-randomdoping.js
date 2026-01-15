// ランダムドーピングアイテムプラグイン
// 移動力以外のいずれかの能力がランダムでプラスされるアイテム

// カスタムアイテムの登録
(function() {
	var alias1 = ItemPackageControl.getCustomItemSelectionObject;
	ItemPackageControl.getCustomItemSelectionObject = function(item, keyword) {
		if (keyword === 'RandomDoping') {
			return RandomDopingItemSelection;
		}
		return alias1.call(this, item, keyword);
	};

	var alias2 = ItemPackageControl.getCustomItemUseObject;
	ItemPackageControl.getCustomItemUseObject = function(item, keyword) {
		if (keyword === 'RandomDoping') {
			return RandomDopingItemUse;
		}
		return alias2.call(this, item, keyword);
	};

	var alias3 = ItemPackageControl.getCustomItemInfoObject;
	ItemPackageControl.getCustomItemInfoObject = function(item, keyword) {
		if (keyword === 'RandomDoping') {
			return RandomDopingItemInfo;
		}
		return alias3.call(this, item, keyword);
	};

	var alias4 = ItemPackageControl.getCustomItemPotencyObject;
	ItemPackageControl.getCustomItemPotencyObject = function(item, keyword) {
		if (keyword === 'RandomDoping') {
			return RandomDopingItemPotency;
		}
		return alias4.call(this, item, keyword);
	};

	var alias5 = ItemPackageControl.getCustomItemAvailabilityObject;
	ItemPackageControl.getCustomItemAvailabilityObject = function(item, keyword) {
		if (keyword === 'RandomDoping') {
			return RandomDopingItemAvailability;
		}
		return alias5.call(this, item, keyword);
	};

	var alias6 = ItemPackageControl.getCustomItemAIObject;
	ItemPackageControl.getCustomItemAIObject = function(item, keyword) {
		if (keyword === 'RandomDoping') {
			return RandomDopingItemAI;
		}
		return alias6.call(this, item, keyword);
	};
})();

var RandomDopingItemSelection = defineObject(BaseItemSelection,
{
}
);

var RandomDopingItemUse = defineObject(BaseItemUse,
{
	_itemUseParent: null,
	_parameterChangeWindow: null,
	_selectedParameter: -1,
	_originalItem: null,

	enterMainUseCycle: function(itemUseParent) {
		var itemTargetInfo = itemUseParent.getItemTargetInfo();

		this._itemUseParent = itemUseParent;
		this._originalItem = itemTargetInfo.item;

		// ランダムなパラメータを事前に選択（移動力を除く）
		this._selectedParameter = this._selectRandomParameter(itemTargetInfo.targetUnit, itemTargetInfo.item);

		if (itemUseParent.isItemSkipMode()) {
			this.mainAction();
			return EnterResult.NOTENTER;
		}

		this._parameterChangeWindow = createWindowObject(RandomDopingParameterChangeWindow, this);
		this._parameterChangeWindow.setParameterChangeData(itemTargetInfo.targetUnit, itemTargetInfo.item, this._selectedParameter);

		return EnterResult.OK;
	},

	moveMainUseCycle: function() {
		if (InputControl.isSelectAction()) {
			this.mainAction();
			return MoveResult.END;
		}
		else {
			this._parameterChangeWindow.moveWindow();
		}

		return MoveResult.CONTINUE;
	},

	drawMainUseCycle: function() {
		var x = LayoutControl.getCenterX(-1, this._parameterChangeWindow.getWindowWidth());
		var y = LayoutControl.getCenterY(-1, this._parameterChangeWindow.getWindowHeight());

		this._parameterChangeWindow.drawWindow(x, y);
	},

	mainAction: function() {
		var itemTargetInfo = this._itemUseParent.getItemTargetInfo();

		// カスタムランダムドーピング処理を実行
		RandomDopingParameterControl.addRandomDoping(itemTargetInfo.targetUnit, itemTargetInfo.item, this._selectedParameter);
	},

	getItemAnimePos: function(itemUseParent, animeData) {
		return this.getUnitBasePos(itemUseParent, animeData);
	},

	_selectRandomParameter: function(targetUnit, item) {
		var availableParams = [];
		var i, value, cur, max;
		var count = ParamGroup.getParameterCount();

		// 使用可能なパラメータを収集（移動力以外で、まだ最大値でないもの）
		for (i = 0; i < count; i++) {
			if (i === ParamType.MOV) {
				// 移動力は除外
				continue;
			}

			value = ParamGroup.getDopingParameter(item, i);
			if (value === 0) {
				// ドーピング値がないので考慮しない
				continue;
			}

			cur = ParamGroup.getUnitValue(targetUnit, i);
			max = ParamGroup.getMaxValue(targetUnit, i);
			if (cur >= max) {
				// 既に最大値なので考慮しない
				continue;
			}

			// 使用可能なパラメータとして追加
			availableParams.push(i);
		}

		// 使用可能なパラメータからランダムに1つ選択
		if (availableParams.length > 0) {
			var randomIndex = Math.floor(Math.random() * availableParams.length);
			return availableParams[randomIndex];
		}

		// 使用可能なパラメータがない場合は-1を返す
		return -1;
	}
}
);

var RandomDopingItemPotency = defineObject(BaseItemPotency,
{
}
);

var RandomDopingItemInfo = defineObject(BaseItemInfo,
{
	drawItemInfoCycle: function(x, y) {
		ItemInfoRenderer.drawKeyword(x, y, this.getItemTypeName("ランダムドーピング"));
		y += ItemInfoRenderer.getSpaceY();

		// ランダム選択の説明を表示
		var textui = root.queryTextUI('default_window');
		var text = "移動力以外のいずれかの能力をランダムで上昇";
		var font = textui.getFont();
		TextRenderer.drawKeywordText(x, y, text, -1, ColorValue.KEYWORD, font);
	},

	getInfoPartsCount: function() {
		return 2; // タイトル + 説明
	}
}
);

var RandomDopingItemAvailability = defineObject(BaseItemAvailability,
{
	isItemAllowed: function(unit, targetUnit, item) {
		return RandomDopingItemControl.isItemAllowed(targetUnit, item);
	}
}
);

var RandomDopingItemAI = defineObject(BaseItemAI,
{
}
);

// ランダムドーピングアイテムの制御
var RandomDopingItemControl = {
	isItemAllowed: function(targetUnit, item) {
		var i, value, cur, max;
		var count = ParamGroup.getParameterCount();
		var result = false;

		if (this._isItemAlwaysAllowed(targetUnit, item)) {
			return true;
		}

		// 移動力以外で使用可能なパラメータが1つでもあれば使用許可
		for (i = 0; i < count; i++) {
			if (i === ParamType.MOV) {
				// 移動力は除外
				continue;
			}

			value = ParamGroup.getDopingParameter(item, i);
			if (value === 0) {
				// ドーピング値がないので考慮しない
				continue;
			}

			cur = ParamGroup.getUnitValue(targetUnit, i);
			max = ParamGroup.getMaxValue(targetUnit, i);
			if (cur >= max) {
				// 既に最大値なので考慮しない
				continue;
			}

			// 1つでもドーピングが見込めるアイテムならば使用許可とする
			result = true;
			break;
		}

		return result;
	},

	_isItemAlwaysAllowed: function(targetUnit, item) {
		// 経験値が設定されたアイテムは使用を許可する
		return item.getExp() > 0;
	}
};

// ランダムドーピング用のパラメータ制御
var RandomDopingParameterControl = {
	addRandomDoping: function(unit, obj, selectedParameter) {
		var value;

		// 選択されたパラメータのみにドーピング値を適用
		if (selectedParameter >= 0) {
			value = ParamGroup.getDopingParameter(obj, selectedParameter);
			if (value > 0) {
				ParameterControl.changeParameter(unit, selectedParameter, value);
			}
		}
	}
};

// ランダムドーピング専用のパラメータ変更ウィンドウ
var RandomDopingParameterChangeWindow = defineObject(BaseWindow,
{
	_targetUnit: null,
	_selectedParameter: -1,
	_scrollbar: null,

	setParameterChangeData: function(targetUnit, parameterChangeCommand, selectedParameter) {
		this._scrollbar = createScrollbarObject(StatusScrollbar, this);
		this._scrollbar.enableStatusBonus(true);
		this._scrollbar.setStatusFromUnit(targetUnit);

		this._targetUnit = targetUnit;
		this._selectedParameter = selectedParameter;

		this._setBonusStatus(parameterChangeCommand, selectedParameter);
		this._playParameterChangeSound();
	},

	moveWindowContent: function() {
		this._scrollbar.moveScrollbarCursor();
		if (InputControl.isSelectAction()) {
			return MoveResult.END;
		}

		return MoveResult.CONTINUE;
	},	

	drawWindowContent: function(x, y) {
		if (this._isTitleAllowed()) {
			this._drawTitleText(x, y);
		}

		this._scrollbar.drawScrollbar(x, y);
	},

	getWindowWidth: function() {
		return this._scrollbar.getScrollbarWidth() + (this.getWindowXPadding() * 2);
	},

	getWindowHeight: function() {
		return this._scrollbar.getScrollbarHeight() + (this.getWindowYPadding() * 2);
	},

	_setBonusStatus: function(parameterChangeCommand, selectedParameter) {
		var i;
		var count = ParamGroup.getParameterCount();
		var bonusArray = [];

		// 全パラメータを0で初期化
		for (i = 0; i < count; i++) {
			bonusArray[i] = 0;
		}

		// 選択されたパラメータのみにボーナスを設定
		if (selectedParameter >= 0) {
			bonusArray[selectedParameter] = ParamGroup.getDopingParameter(parameterChangeCommand, selectedParameter);
		}

		this._scrollbar.setStatusBonus(bonusArray);
	},

	_drawTitleText: function(x, y) {
		var text = this._targetUnit.getName();
		var textui = this._getTitleTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var pic = textui.getUIImage();

		x -= 15;
		y -= 62;
		TextRenderer.drawFixedTitleText(x, y, text, color, font, TextFormat.CENTER, pic, this._getTitlePartsCount());
	},

	_getTitleTextUI: function() {
		return root.queryTextUI('objective_title');
	},

	_isTitleAllowed: function() {
		return true;
	},

	_getTitlePartsCount: function() {
		return 5;
	},

	_playParameterChangeSound: function() {
		MediaControl.soundDirect('parameterchange');
	}
});