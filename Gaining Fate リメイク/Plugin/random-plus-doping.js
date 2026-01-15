(function() {
	// ランダム能力上昇カスタムアイテム
	// キーワード: RandomPlusDoping
	// 使い方(アイテムのカスタムパラメータ例):
	//   { keyword: 'RandomPlusDoping', RPD_Value: 2 }
	// オプション(任意設定):
	//   RPD_Exclude: [ParamType.MOV]     // 除外する能力の配列(デフォルト: MOVを除外)
	//   RPD_Include: [ParamType.POW,...] // 候補を限定したい場合は包含リストを指定
	//   RPD_AllowMov: true               // 移動力も候補に含める場合
	//   RPD_ShowPreview: true            // 使用前プレビューウィンドウを表示(デフォルト: true)
	// 備考:
	//  - 対象能力は未最大(現在値 < 最大値)の中から抽選します。
	//  - RPD_Include を指定した場合、そこから RPD_Exclude を除いて抽選します。
	//  - RPD_Value が 0 または未指定の場合は効果なし。

	// 環境互換: Array.isArray がない環境向けポリフィル
	var RPD_isArray = Array.isArray || function(a) {
		return Object.prototype.toString.call(a) === '[object Array]';
	};

	var KEYWORD = 'RandomPlusDoping';
    // ドーピング対象のパラメータ
	var RPD_DEFAULT_INCLUDE = [
		ParamType.MHP,
		ParamType.POW,
		ParamType.MAG,
		ParamType.SKI,
		ParamType.SPD,
		ParamType.LUK,
		ParamType.DEF,
		ParamType.MDF
	];

	var aliasSel = ItemPackageControl.getCustomItemSelectionObject;
	ItemPackageControl.getCustomItemSelectionObject = function(item, keyword) {
		if (keyword === KEYWORD) return RPD_ItemSelection;
		return aliasSel.call(this, item, keyword);
	};

	var aliasUse = ItemPackageControl.getCustomItemUseObject;
	ItemPackageControl.getCustomItemUseObject = function(item, keyword) {
		if (keyword === KEYWORD) return RPD_ItemUse;
		return aliasUse.call(this, item, keyword);
	};

	var aliasInfo = ItemPackageControl.getCustomItemInfoObject;
	ItemPackageControl.getCustomItemInfoObject = function(item, keyword) {
		if (keyword === KEYWORD) return RPD_ItemInfo;
		return aliasInfo.call(this, item, keyword);
	};

	var aliasAvail = ItemPackageControl.getCustomItemAvailabilityObject;
	ItemPackageControl.getCustomItemAvailabilityObject = function(item, keyword) {
		if (keyword === KEYWORD) return RPD_ItemAvailability;
		return aliasAvail.call(this, item, keyword);
	};

	var aliasAI = ItemPackageControl.getCustomItemAIObject;
	ItemPackageControl.getCustomItemAIObject = function(item, keyword) {
		if (keyword === KEYWORD) return RPD_ItemAI;
		return aliasAI.call(this, item, keyword);
	};

	var RPD_ItemSelection = defineObject(BaseItemSelection, {});

	var RPD_ItemUse = defineObject(BaseItemUse, {
		_itemUseParent: null,
		_parameterChangeWindow: null,
		_selectedParam: -1,
		enterMainUseCycle: function(itemUseParent) {
			var info = itemUseParent.getItemTargetInfo();
			this._itemUseParent = itemUseParent;
			this._selectedParam = RPD_Control.selectRandomParam(info.targetUnit, info.item);
			if (itemUseParent.isItemSkipMode() || !RPD_Control.isPreviewEnabled(info.item)) {
				this.mainAction();
				return EnterResult.NOTENTER;
			}
			this._parameterChangeWindow = createWindowObject(RPD_ParameterPreviewWindow, this);
			this._parameterChangeWindow.setParameterChangeData(info.targetUnit, info.item, this._selectedParam);
			return EnterResult.OK;
		},
		moveMainUseCycle: function() {
			if (InputControl.isSelectAction()) {
				this.mainAction();
				return MoveResult.END;
			}
			this._parameterChangeWindow.moveWindow();
			return MoveResult.CONTINUE;
		},
		drawMainUseCycle: function() {
			var x = LayoutControl.getCenterX(-1, this._parameterChangeWindow.getWindowWidth());
			var y = LayoutControl.getCenterY(-1, this._parameterChangeWindow.getWindowHeight());
			this._parameterChangeWindow.drawWindow(x, y);
		},
		mainAction: function() {
			var info = this._itemUseParent.getItemTargetInfo();
			RPD_Control.applyRandomPlus(info.targetUnit, info.item, this._selectedParam);
		},
		getItemAnimePos: function(parent, animeData) {
			return this.getUnitBasePos(parent, animeData);
		}
	});

	var RPD_ItemInfo = defineObject(BaseItemInfo, {
		drawItemInfoCycle: function(x, y) {
			ItemInfoRenderer.drawKeyword(x, y, this.getItemTypeName('ドーピング'));
			y += ItemInfoRenderer.getSpaceY();
			var textui = root.queryTextUI('default_window');
			var font = textui.getFont();
			var text = '？？　+　２';
			TextRenderer.drawKeywordText(x, y, text, -1, ColorValue.DEFAULT, font);
		},
		getInfoPartsCount: function() { return 2; }
	});

	var RPD_ItemAvailability = defineObject(BaseItemAvailability, {
		isItemAllowed: function(unit, targetUnit, item) {
			return RPD_Control.hasAnyApplicableParam(targetUnit, item);
		}
	});

	var RPD_ItemAI = defineObject(BaseItemAI, {});

	var RPD_Control = {
		getPlusValue: function(item) {
			var v = 0;
			if (typeof item.custom.RPD_Value === 'number') v = item.custom.RPD_Value;
			return v;
		},
		isPreviewEnabled: function(item) {
			var v = item.custom.RPD_ShowPreview;
			if (typeof v === 'boolean') return v;
			return true;
		},
		getExcludeList: function(item) {
			var arr = item.custom.RPD_Exclude;
			if (RPD_isArray(arr)) return arr;
			var allowMov = (item.custom.RPD_AllowMov === true);
			return allowMov ? [] : [ParamType.MOV];
		},
		getIncludeList: function(item) {
			var arr = item.custom.RPD_Include;
			if (RPD_isArray(arr)) return arr;
			return RPD_DEFAULT_INCLUDE;
		},
		selectRandomParam: function(unit, item) {
			var candidates = this._collectApplicableParams(unit, item);
			if (candidates.length === 0) return -1;
			var idx = Math.floor(Math.random() * candidates.length);
			return candidates[idx];
		},
		applyRandomPlus: function(unit, item, paramIndex) {
			if (paramIndex < 0) return;
			var plus = this.getPlusValue(item);
			if (plus === 0) return;
			ParameterControl.changeParameter(unit, paramIndex, plus);
		},
		hasAnyApplicableParam: function(unit, item) {
			return this._collectApplicableParams(unit, item).length > 0;
		},
		_collectApplicableParams: function(unit, item) {
			var include = this.getIncludeList(item); // null なら全体から選定
			var exclude = this.getExcludeList(item);
			var count = ParamGroup.getParameterCount();
			var list = [];
			for (var i = 0; i < count; i++) {
				if (include && include.indexOf(i) === -1) continue;
				if (exclude.indexOf(i) !== -1) continue;
				var cur = ParamGroup.getUnitValue(unit, i);
				var max = ParamGroup.getMaxValue(unit, i);
				if (cur >= max) continue;
				list.push(i);
			}
			return list;
		}
	};

	var RPD_ParameterPreviewWindow = defineObject(BaseWindow, {
		_targetUnit: null,
		_selectedParam: -1,
		_scrollbar: null,
		setParameterChangeData: function(targetUnit, item, selectedParam) {
			this._scrollbar = createScrollbarObject(StatusScrollbar, this);
			this._scrollbar.enableStatusBonus(true);
			this._scrollbar.setStatusFromUnit(targetUnit);
			this._targetUnit = targetUnit;
			this._selectedParam = selectedParam;
			this._applyBonus(item, selectedParam);
			this._playSE();
		},
		moveWindowContent: function() {
			this._scrollbar.moveScrollbarCursor();
			if (InputControl.isSelectAction()) return MoveResult.END;
			return MoveResult.CONTINUE;
		},
		drawWindowContent: function(x, y) {
			this._drawTitle(x, y);
			this._scrollbar.drawScrollbar(x, y);
		},
		getWindowWidth: function() { return this._scrollbar.getScrollbarWidth() + (this.getWindowXPadding() * 2); },
		getWindowHeight: function() { return this._scrollbar.getScrollbarHeight() + (this.getWindowYPadding() * 2); },
		_applyBonus: function(item, paramIndex) {
			var count = ParamGroup.getParameterCount();
			var bonus = [];
			for (var i = 0; i < count; i++) bonus[i] = 0;
			if (paramIndex >= 0) bonus[paramIndex] = RPD_Control.getPlusValue(item);
			this._scrollbar.setStatusBonus(bonus);
		},
		_drawTitle: function(x, y) {
			var text = this._targetUnit.getName();
			var ui = root.queryTextUI('objective_title');
			var color = ui.getColor();
			var font = ui.getFont();
			var pic = ui.getUIImage();
			x -= 15; y -= 62;
			TextRenderer.drawFixedTitleText(x, y, text, color, font, TextFormat.CENTER, pic, 5);
		},
		_playSE: function() { MediaControl.soundDirect('parameterchange'); }
	});
})();


