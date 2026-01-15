
/*-----------------------------------------------------------------------------------------------
  
  カスタムアイテム用の関数ライブラリ
    
  作成者:
  o-to
  
  更新履歴:
  2015/10/11：範囲攻撃アイテムの新規作成(試作型)
  2015/10/13：範囲指定や付加ステータスなど様々な要素を追加
  2015/10/16：公式アップデート1.035に対応するように修正
  2015/10/31：スキルの状態異常無効に対応、敵AIを改善
              ダメージ数値の表示追加、ダメージエフェクトやユニット消滅を同時に再生するよう修正
              ステート付与時のアニメをステートのマップアニメに依存するよう修正
              マップ地形変更効果を追加
              使用時のダメージを敵のダメージと一緒に行うよう変更
  2015/12/04：最新バージョンではエラーで終了してしまうため修正
              ツール側のアニメーション再生に対応
  2016/05/03:
  補助オンリー(固定ダメージor固定回復量が0)の場合はダメージ表示とHP回復量の表示が省略されるように修正
  敵AIの行動決定に使用するスコアに倍率を設定可能に
  使用時ダメージにマイナス指定を行うとHP回復するように修正
  与えたダメージのHP吸収率を設定可能に

  2016/10/17:
  威力の補正に各ステータスの値が影響する設定ができるように修正
  最終的な攻撃力に補正値を掛ける設定を追加
  一部誤字修正
  
  2017/01/29:
  ステート付与時のエラー対応にて未使用だったOT_setCustomItemAddStateも念のため修正

  2019/07/07:
  エディタ側でステートのデータを削除してIDが歯抜け状態になっている状態で
  カスパラのIER_DelStateかOT_UseDelStateに'BadState'か'GoodState'を指定した
  アイテムにカーソルを合わせるとエラーになる問題を修正。
  OT_UseAddStateとIER_AddStateに対応していない'BadState'か'GoodState'、'AllState'を指定したアイテムに
  カーソルを合わせた時のエラーメッセージを指定しないで欲しい旨の警告が出て終了するように修正

  2019/10/06:
  OT_UnitReflectionをtrueにしてユニット能力を威力に反映するようにした時、
  「支援効果」による攻撃の補正値が参照されるよう修正。
  ダメージタイプが物理、魔法の場合に「支援効果」による防御の補正値が参照されるよう修正。
  支援効果の攻撃・防御・命中・回避の影響を受けるかどうかをカスパラで設定可能に修正（それぞれのデフォルトはtrue）。

  2020/04/28:
  必中設定としてIER_HitMarkというカスタムパラメータ追加。
  
  IER_EffectRangeTypeに99を設定すると効果範囲が『全域』になるように修正。
  効果範囲が全域の場合は射程タイプの指定が無効となり、どこでも発動可能になります。
  また、範囲効果のタイプに四角型を追加。
  
  ヒット音などが重複しないようにする設定、IER_SoundDuplicateというカスタムパラメータ追加。
  
  効果範囲のタイプでブレス型の場合、カーソルを使用者の斜めに移動すると極端な処理落ちが発生する問題を修正。
  不具合の元になりそうだった変数名を修正(IndexArray→indexArray)
  また効果範囲のタイプをブレス型にした場合、射程タイプを強制的に十字型になるようになりました。
  
  効果範囲のタイプにボックス型を追加。
  
  アイテムの説明文を分割、game.iniの[keyboard]のSYSTEMで指定したキー(デフォルト:左shift)で表示切替可能に。
  
  効果範囲内のキャラへのダメージや命中率が表示されるようにウィンドウを修正、
  game.iniの[keyboard]のSYSTEMで指定したキー(デフォルト:左shift)で表示切替可能。
  
  敵が範囲攻撃アイテムを使う時のAI処理を大幅修正。処理速度が大幅に改善。
  
  最低限のカスタムパラメータ(威力、射程)で動作するようにデフォルト値を見直し。
  デフォルト値を定義したファイル、EffectRangeItemDefault.jsを作成。
  
  IER_HitReflection(ユニットの技を命中率に加算、武器の命中値を命中率に加算)について
  パラメータをIER_HitReflectionUnit、IER_HitReflectionWeaponに分割。
  (旧型式、新方式どちらの指定でも可能です)

  2020/05/04:
  デバッグ確認用のログが出力されてたため修正。

  2020/05/05:
  敵が特定の範囲タイプの範囲攻撃を使用しようとした時にエラーになる問題を修正。

-----------------------------------------------------------------------------------------------*/
// 範囲タイプ
OT_EffectRangeType = {
	  NORMAL:0
	, CROSS:1
	, XCROSS:2
	, DOUBLECROSS:3
	, LINE:4
	, HORIZONTALLINE:5
	, BREATH:6
	, BOX:7
	, DEBUG:90
	, ALL:99
};

// ステータスの定義定数
OT_DefineStatus = {
	  LV : 'LV'
	, HP : 'HP'
	, EP : 'EP'
	, FP : 'FP'
};

// 現在値と最大値が分かれているパラメータの紐づけ配列
OT_NowStatusMapping = {
	  MHP : 'HP'
	, MEP : 'EP'
	, MFP : 'FP'
};

OT_SLANTING = 100;

StatusRenderer.drawEffectRangeAttackStatus = function(x, y, arr, color, font, space, recovery) {
	var baseX = x;
	var baseY = y;
	var i, text;
	var length = this._getTextLength();
	var numberSpace = DefineControl.getNumberSpace();
	//var buf = ['attack_capacity', 'hit_capacity', 'critical_capacity'];

	// ダメージ量
	x = baseX;
	if(recovery) {
		text = 'REC:';
	} else {
		text = 'DMG:';
	}
	TextRenderer.drawKeywordText(x, y, text, length, color, font);
	x += 32 + numberSpace;
	
	if (arr[0] >= 0) {
		NumberRenderer.drawNumber(x, y, arr[0]);
	} else {
		TextRenderer.drawSignText(x - 5, y, StringTable.SignWord_Limitless);
	}
	
	// 命中率
	x = baseX;
	y += space;
	text = root.queryCommand('hit_capacity') + ':';
	TextRenderer.drawKeywordText(x, y, text, length, color, font);
	x += 32 + numberSpace;
	
	if (arr[1] >= 0) {
		NumberRenderer.drawNumber(x, y, arr[1]);
	}
	else {
		TextRenderer.drawSignText(x - 5, y, StringTable.SignWord_Limitless);
	}
};

var PosEffectRangeItemWindow = defineObject(PosItemWindow, 
{
	getWindowTextUI: function() {
		return Miscellaneous.getColorWindowTextUI(this._unit);
	}
});

var PosEffectRangeItemEnemyWindow = defineObject(PosItemWindow, 
{
	_posX:0,
	_posY:0,
	_damage:0,
	_hit:100,
	_statusArray: null,
	_recovery:false,

	drawWindow: function(x, y) {
		var width = this.getWindowWidth();
		var height = this.getWindowHeight();
		
		if (!this._isWindowEnabled) {
			return;
		}

		this._drawWindowInternal(x, y, width, height);
		
		if (this._drawParentData !== null) {
			this._drawParentData(x, y);
		}
		
		
		// move系メソッドにて、座標をマウスで参照できるようにする
		this.xRendering = x + this.getWindowXPadding();
		this.yRendering = y + this.getWindowYPadding();

		//var session = root.getCurrentSession();
		//var width = UIFormat.MAPCURSOR_WIDTH / 2;
		//var height = UIFormat.MAPCURSOR_HEIGHT;
		//var x = (this._posX * GraphicsFormat.MAPCHIP_WIDTH) - session.getScrollPixelX();
		//var y = (this._posY * GraphicsFormat.MAPCHIP_HEIGHT) - session.getScrollPixelY();
		
		
		this.drawWindowContent(x + this.getWindowXPadding(), y + this.getWindowYPadding());
	},

	drawWindowContent: function(x, y) {
		this.drawUnit(x + 55, y - 20);
		this.drawInfo(x, y);
	},

	drawInfo: function(xBase, yBase) {
		this.drawName(xBase, yBase);
		this.drawInfoTop(xBase, yBase);
		this.drawInfoCenter(xBase, yBase);
		this.drawInfoBottom(xBase, yBase);

		//var x = xBase;
		//var y = yBase;
		//var length = this._getTextLength();
		//var textui = this.getWindowTextUI();
		//var color = textui.getColor();
		//var font = textui.getFont();
		//
		//TextRenderer.drawText(x, y, 'D:' + this._damage, length, color, font);
		//TextRenderer.drawText(x, y+20, 'H:' + this._hit, length, color, font);
	},

	drawInfoTop: function(xBase, yBase) {
		var x = xBase;
		var y = yBase + 20;
		var dx = [0, 44, 60, 98];
		var textHp = ContentRenderer._getHpText();
		var pic = root.queryUI('unit_gauge');
		var balancer = this._gaugeBar.getBalancer();
		
		if (this._unit !== null) {
			//ContentRenderer.drawHp(x, y + 20, balancer.getCurrentValue(), balancer.getMaxValue());
			//this._gaugeBar.drawGaugeBar(x, y + 40, pic);
			TextRenderer.drawSignText(x + dx[0], y, textHp);
			NumberRenderer.drawNumber(x + dx[1], y, balancer.getMaxValue());

		}
	},

	drawInfoCenter: function(xBase, yBase) {
	},
	
	drawInfoBottom: function(xBase, yBase) {
		var x = xBase;
		var y = yBase + 40;
		var textui = this.getWindowTextUI();
		var color = ColorValue.KEYWORD;
		var font = textui.getFont();
		
		StatusRenderer.drawEffectRangeAttackStatus(x, y, this._statusArray, color, font, 20, this._recovery);
	},
		
	setPosTarget: function(unit, item, targetUnit, targetItem, isSrc) {
		//if (item !== null && !item.isWeapon()) {
		//	this._obj = ItemPackageControl.getItemPotencyObject(item);
		//	this._obj.setPosMenuData(unit, item, targetUnit);
		//}

		var damage = OT_getCustomItemFinalDamage(targetUnit, targetItem);
		var damageType  = OT_getCustomItemType(targetItem);
		var hit = OT_getCustomItemHitPercent(targetUnit, unit, targetItem);
		var value = 0;

		this._recovery = OT_getCustomItemRecovery(targetItem);
		if( this._recovery ) {
			value = Calculator.calculateRecoveryValue(unit, damage, RecoveryType.SPECIFY, 0);
		} else {
			value = OT_getCalculateDamageValue(targetItem, unit, damage, damageType, 0);
		}
		
		//root.log(unit.getName() + ':' + damagePoint + 'hit' + hit);
		this._statusArray = [value, hit];
		this.setPosInfo(unit, item, isSrc);
	},

	setPosPoint: function(x, y) {
		this._posX = x;
		this._posY = y;
	},
	
	setPosInfo: function(unit, item, isSrc) {
		this._unit = unit;
		this._item = item;
		this._gaugeBar.setGaugeInfo(unit.getHp(), ParamBonus.getMhp(unit), 1);
		this._gaugeBar.setPartsCount(4);
	},

	getWindowWidth: function() {
		return 110;
	},
	
	getWindowHeight: function() {
		return 110;
	},

	getWindowXPadding: function() {
		return 10;
	}

});

var PosMenuEffectRange = defineObject(PosMenu, 
{
	_posEnemyWindow: [],
	_enemyDataArray  : [],
	_maxEnemyWindowView: 10,	//最大ウィンドウ数、10ぐらいにしないと処理が重くなる
	_maxEnemyWindowWidth: 5,	//ウィンドウの列数
	_maxEnemyWindowHeight: 2,	//ウィンドウの行数
	_nowIndex  : 0,
	_maxIndex  : 0,

	checkIndexTarget: function() {
		if(InputControl.isInputAction(InputType.BTN4)) {
			if(this._nowIndex < this._maxIndex) {
				this._nowIndex += 1;
			} else {
				this._nowIndex = 0;
			}
			MediaControl.soundDirect('menutargetchange');
			this.changeIndexTarget();
		}

		return MoveResult.CONTINUE;
	},

	changeIndexTarget: function() {
		var index = this._nowIndex * this._maxEnemyWindowView;
		var count = 0;
		
		delete(this._posEnemyWindow);
		this._posEnemyWindow = [];
		for( i=index; i<this._enemyDataArray.length ; i++) {
			this._posEnemyWindow.push(createWindowObject(PosEffectRangeItemEnemyWindow, this));
			this._posEnemyWindow[count].setPosTarget(this._enemyDataArray[i][0], this._enemyDataArray[i][1], this._unit, this._item, false);
			this._posEnemyWindow[count].setPosPoint(0, 0);
			
			count++;
			if(this._maxEnemyWindowView <= count) {
				break;
			}
		}
	},
	
	createPosMenuWindow: function(unit, item, type) {
		var obj = PosEffectRangeItemWindow;
		
		this._posWindowLeft = createWindowObject(PosEffectRangeItemWindow, this);
		this._posWindowRight = createWindowObject(PosEffectRangeItemEnemyWindow, this);
		
		this._unit = unit;
		this._item = item;
		this._posWindowLeft.setPosTarget(this._unit, this._item, null, null, true);
		
		//this._maxEnemyWindowWidth  = Math.floor(root.getGameAreaWidth() / PosEffectRangeItemEnemyWindow.getWindowWidth());
		//this._maxEnemyWindowHeight = Math.floor(root.getGameAreaHeight() / PosEffectRangeItemEnemyWindow.getWindowHeight());
		//this._maxEnemyWindowView   = this._maxEnemyWindowWidth * this._maxEnemyWindowHeight;
		
		//root.log(this._maxEnemyWindowWidth );
		//root.log(this._maxEnemyWindowHeight);
		//root.log(this._maxEnemyWindowView  );
	},
	
	// 描画処理
	drawWindowManager: function() {
		var x, y;

		if (this._unit === null) {
			return;
		}
		
		x = this.getPositionWindowX();
		y = this.getPositionWindowY();
		
		//this._posWindowLeft.drawWindow(x, y);
		
		
		var i;
		var j=0;
		var posX;
		var posY;
		for(i=0 ; i<this._posEnemyWindow.length ; i++) {
			j = Math.floor(i / this._maxEnemyWindowWidth);
			
			posX = x + (i % this._maxEnemyWindowWidth) * this._posEnemyWindow[i].getWindowWidth() + this._getWindowInterval();
			posY = y + j * this._posEnemyWindow[i].getWindowHeight();
			this._posEnemyWindow[i].drawWindow(posX, posY);
		}
		
		if(this._nowIndex != this._maxIndex) {
			j = 1 + Math.floor((i-1) / this._maxEnemyWindowWidth);
			y = y + j * PosEffectRangeItemEnemyWindow.getWindowHeight();
			var textui = root.queryTextUI('single_window');
			var pic  = textui.getUIImage();
			var width = 200;
			var height = 24;
			WindowRenderer.drawStretchWindow(x, y, width, height, pic);
			ItemInfoRenderer.drawKeyword(x + 20, y, '対象[' + (this._nowIndex + 1) + '/' + (this._maxIndex) + ']');
		}
		
		//this._posWindowRight.drawWindow(x + this._posWindowLeft.getWindowWidth() + this._getWindowInterval(), y);
	},

	getPositionWindowX: function() {
		return Miscellaneous.getDyamicWindowY(this._unit, this._currentTarget, this._posWindowLeft.getWindowWidth());
	},
	
	getPositionWindowY: function() {
		return Miscellaneous.getDyamicWindowY(this._unit, this._currentTarget, this._posWindowLeft.getWindowHeight());
	},
	
	changePosCheckTarget: function(effectRangeArray) {
		var targetItem, isLeft;
		
		if (this._unit === null) {
			this._currentTarget = null;
			return;
		}
		
		
		var targetUnit;
		var x, y, index;
		var count = 0;
		var filter = OT_EffectRangeGetFilter(this._unit, this._item);
		var tmpEnemyDataArray = [];
		for(var i=0 ; i<effectRangeArray.length ; i++) {
			index = effectRangeArray[i];
			x = CurrentMap.getX(index);
			y = CurrentMap.getY(index);
			targetUnit = PosChecker.getUnitFromPos(x, y);
			
			
			if(targetUnit != null) {
				if(!OT_EffectRangeCheckFilter(targetUnit, filter)) continue;
				
				targetItem = ItemControl.getEquippedWeapon(targetUnit);
				tmpEnemyDataArray.push([targetUnit, targetItem]);
			}
		}
		//if(this._enemyDataArray == tmpEnemyDataArray) {
		//	return;
		//}
		
		this._enemyDataArray = tmpEnemyDataArray;
		
		delete(this._posEnemyWindow);
		this._posEnemyWindow = [];
		for(var i=0 ; i<this._enemyDataArray.length ; i++) {
			this._posEnemyWindow.push(createWindowObject(PosEffectRangeItemEnemyWindow, this));
			this._posEnemyWindow[count].setPosTarget(this._enemyDataArray[i][0], this._enemyDataArray[i][1], this._unit, this._item, false);
			this._posEnemyWindow[count].setPosPoint(0, 0);
			
			count++;
			if(this._maxEnemyWindowView <= count) {
				break;
			}
		}
		
		this._nowIndex = 0;
		if(this._enemyDataArray.length > 0) {
			this._maxIndex = Math.floor(this._enemyDataArray.length / this._maxEnemyWindowView) + 1;
		} else {
			this._maxIndex = 0;
		}
	},

	emptyTarget: function() {
		delete(this._posEnemyWindow);
		this._posEnemyWindow = [];
		this._enemyDataArray = [];
		this._nowIndex = 0;
		this._maxIndex = 0;
	}
});

// 範囲攻撃用カーソル
var PosEffectRangeFreeCursor = defineObject(PosFreeCursor,
{
	checkCursor: function() {
		var x, y;
		
		this._mapCursor.moveCursor();
		
		x = this._mapCursor.getX();
		y = this._mapCursor.getY();
		if (x !== this._xPrev || y !== this._yPrev) {
			this._xPrev = x;
			this._yPrev = y;
			//targetUnit = PosChecker.getUnitFromPos(px, py);


			var item = this._parentSelector.item;
			var unit = this._parentSelector._unit;
			if( this._parentSelector.getSelectorPos(true) ) {
				var indexArray = OT_EffectRangeIndexArray.getEffectRangeItemIndexArray(this._xPrev, this._yPrev, item, unit);
				MapLayer.OT_getEffectRangePanel().setIndexArray(indexArray);
				this._parentSelector.setCheckTarget(indexArray);
			} else {
				MapLayer.OT_getEffectRangePanel().endLight();
				this._parentSelector.emptyTarget();
			}
		} else {
			this._parentSelector.setCheckIndex();
		}
	}
});

// 効果範囲実装用の発動箇所選択オブジェクト
OT_EffectRangePosSelector = defineObject(PosSelector,
{
	item:null,
	_effectRangeArray:null,
/*
	initialize: function() {
		PosSelector.initialize.call(this);

		// メニュー
		this._posMenu = createObject(OT_EffectRangePosMenu);
	},
*/	
	initialize: function() {
		this._mapCursor = createObject(MapCursor);
		this._posMenu = createObject(PosMenuEffectRange);
		this._selectorType = this._getDefaultSelectorType();
	},
	
	setUnitOnly: function(unit, item, indexArray, type, filter) {
		this._unit = unit;
		this._indexArray = indexArray;
		this._filter = filter;
		this.item = item;
		MapLayer.getMapChipLight().setIndexArray(indexArray);
		this._setPosMenu(unit, item, type);
		this._posCursor = createObject(PosEffectRangeFreeCursor);
		this._posCursor.setParentSelector(this);
	},

	_getDefaultSelectorType: function() {
		return PosSelectorType.FREE;
	},
	
	movePosSelector: function() {
		var result = PosSelectorResult.NONE;
		
		if (InputControl.isSelectAction()) {
			this._playSelectSound();
			result = PosSelectorResult.SELECT;
		}
		else if (InputControl.isCancelAction()) {
			this._playCancelSound();
			result = PosSelectorResult.CANCEL;
		}
		else {
			this._posCursor.checkCursor();
		}
		
		return result;
	},

	
	setCheckTarget: function(effectRangeArray) {
		this._effectRangeArray= effectRangeArray;
		this._posMenu.changePosCheckTarget(this._effectRangeArray);
	},

	setCheckIndex: function() {
		this._posMenu.checkIndexTarget();
	},

	emptyTarget: function() {
		this._posMenu.emptyTarget();
	},
	
	_setPosMenu: function(unit, item, type) {
		this._posMenu.createPosMenuWindow(unit, item, type);
		//this._posMenu.changePosTarget(null);
	},

	getSelectorTarget: function(isIndexArray) {
		var unit = this._mapCursor.getUnitFromCursor();
		
		return unit;
	},

	endPosSelector: function() {
		MapLayer.getMapChipLight().endLight();
		MapLayer.OT_getEffectRangePanel().endLight();
	}
}
);

(function() {

//----------------------------------------------------------
// 効果範囲用パネル
//----------------------------------------------------------
MapLayer.OT_EffectRangePanel = null;

MapLayer.OT_getEffectRangePanel = function() {
	return this.OT_EffectRangePanel;
};

var alias101 = MapLayer.prepareMapLayer;
MapLayer.prepareMapLayer = function() {
	alias101.call(this);
	this.OT_EffectRangePanel = createObject(MapChipLight);
	this.OT_EffectRangePanel.setLightType(MapLightType.RANGE);
};

var alias102 = MapLayer.moveMapLayer;
MapLayer.moveMapLayer = function() {
	this.OT_EffectRangePanel.moveLight();
	return alias102.call(this);
};

var alias103 = MapLayer.drawUnitLayer;
MapLayer.drawUnitLayer =  function() {
	alias103.call(this);
	this.OT_EffectRangePanel.drawLight();
};

// 効果範囲実装用の範囲生成オブジェクト
OT_EffectRangeIndexArray = {
	createIndexArray: function(x, y, item) {
		return this.getRangeItemIndexArray(x, y, item, false);
	},
	
	getBestIndexArray: function(x, y, startRange, endRange) {
		var simulator = root.getCurrentSession().createMapSimulator();
		
		simulator.startSimulationRange(x, y, startRange, endRange);
		
		return simulator.getSimulationIndexArray();
	},

	// 発動位置、使用アイテム、使用ユニット
	getEffectRangeItemIndexArray: function(x, y, item, unit, isGetIndexData) {
	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}
		var startRange = OT_getCustomItemEffectRangeMin(item);
		var endRange = OT_getCustomItemEffectRangeMax(item);
		var effectRangeType = OT_getCustomItemEffectRangeType(item);
		var spread = OT_getCustomItemEffectSpread(item);

		return this.getEffectRangeIndexArray( x, y, startRange, endRange, effectRangeType, spread, unit.getMapX(), unit.getMapY(), isGetIndexData );
	},
	
	getEffectRangeItemIndexArrayPos: function(x, y, item, px, py, isGetIndexData) {
		if( typeof isGetIndexData === 'undefined' ) {
			isGetIndexData = false;
		}
		var startRange = OT_getCustomItemEffectRangeMin(item);
		var endRange = OT_getCustomItemEffectRangeMax(item);
		var effectRangeType = OT_getCustomItemEffectRangeType(item);
		var spread = OT_getCustomItemEffectSpread(item);

		return this.getEffectRangeIndexArray( x, y, startRange, endRange, effectRangeType, spread, px, py, isGetIndexData );
	},

	getEffectRangeItemIndexArrayPosInfo: function(x, y, item, px, py, isGetIndexData) {
		if( typeof isGetIndexData === 'undefined' ) {
			isGetIndexData = false;
		}
		var startRange = OT_getCustomItemEffectRangeMin(item);
		var endRange = OT_getCustomItemEffectRangeMax(item);
		var effectRangeType = OT_getCustomItemEffectRangeType(item);
		var spread = OT_getCustomItemEffectSpread(item);
		
		if(endRange > 20) {
			endRange = 20;
		}

		return this.getEffectRangeIndexArray( x, y, startRange, endRange, effectRangeType, spread, px, py, isGetIndexData );
	},

	// 使用者の座標、アイテム、発動位置予測位置
	getAIEffectRangeItemIndexArray: function(posX, posY, item, direction) {
		var endRange = OT_getCustomItemEffectRangeMax(item);
		var startRange = OT_getCustomItemEffectRangeMin(item);
		var effectRangeType = OT_getCustomItemEffectRangeType(item);
		var spread = OT_getCustomItemEffectSpread(item);

		if( startRange < 0 ) startRange = 0;
		
		return this.getAIEffectRangeIndexArray( posX, posY, startRange, endRange, effectRangeType, spread, direction);
	},

	getRangeItemIndexArray: function(x, y, item, isGetIndexData) {
		if( typeof isGetIndexData === 'undefined' ) {
			isGetIndexData = false;
		}
		
		var startRange = OT_getCustomItemRangeMin(item);
		var endRange = OT_getCustomItemRangeMax(item);
		var rangeType = OT_getCustomItemRangeType(item);
		var spread = OT_getCustomItemRangeSpread(item);

		if( startRange > endRange )
		{
			startRange = endRange;
		}

		var effectRangeType = OT_getCustomItemEffectRangeType(item);

		//root.log('x:' + x + ' y:' + y + ' startRange:' + startRange + ' endRange:' + endRange + ' rangeType:' + rangeType);
		return this.getRangeIndexArray( x, y, startRange, endRange, rangeType, spread, isGetIndexData );
	},

	getRangeItemIndexArrayInfo: function(x, y, item, isGetIndexData) {
		if( typeof isGetIndexData === 'undefined' ) {
			isGetIndexData = false;
		}
		
		var startRange = OT_getCustomItemRangeMin(item);
		var endRange = OT_getCustomItemRangeMax(item);
		var rangeType = OT_getCustomItemRangeType(item);
		var spread = OT_getCustomItemRangeSpread(item);

		if(endRange > 20) {
			endRange = 20;
		}

		if( startRange > endRange )
		{
			startRange = endRange;
		}

		var effectRangeType = OT_getCustomItemEffectRangeType(item);

		//root.log('x:' + x + ' y:' + y + ' startRange:' + startRange + ' endRange:' + endRange + ' rangeType:' + rangeType);
		return this.getRangeIndexArray( x, y, startRange, endRange, rangeType, spread, isGetIndexData );
	},
	
	getAIRangeItemIndexArray: function(x, y, item, startRange, isGetIndexData) {
		if( typeof isGetIndexData === 'undefined' ) {
			isGetIndexData = false;
		}
		
		//var startRange = OT_getCustomItemRangeMin(item);
		var endRange = OT_getCustomItemRangeMax(item);
		var rangeType = OT_getCustomItemRangeType(item);
		var spread = OT_getCustomItemRangeSpread(item);

		if( startRange > endRange )
		{
			startRange = endRange;
		}

		var effectRangeType = OT_getCustomItemEffectRangeType(item);

		return this.getRangeIndexArray( x, y, startRange, endRange, rangeType, spread, isGetIndexData );
	},
	
	getRangeIndexArray: function(x, y, startRange, endRange, effectRangeType, spread, isGetIndexData) {
		if( typeof isGetIndexData === 'undefined' ) {
			isGetIndexData = false;
		}
		
		var indexArray = null;

		switch( effectRangeType )
		{
			case OT_EffectRangeType.CROSS:
				indexArray = OT_getCrossIndexArray(x, y, startRange, endRange, spread, isGetIndexData);
				break;
			
			case OT_EffectRangeType.XCROSS:
				indexArray = OT_getXCrossIndexArray(x, y, startRange, endRange, spread, isGetIndexData);
				break;

			case OT_EffectRangeType.DOUBLECROSS:
				indexArray = OT_getDoubleCrossIndexArray(x, y, startRange, endRange, spread, isGetIndexData);
				break;
			
			case OT_EffectRangeType.ALL:
				indexArray = OT_getAllIndexArray(isGetIndexData);
				break;
				
			default:
				if(isGetIndexData) {
					indexArray = OT_getNormalIndexArray(x, y, startRange, endRange, isGetIndexData);
				} else {
					var simulator = root.getCurrentSession().createMapSimulator();
					simulator.startSimulationRange(x, y, startRange, endRange);
					indexArray = simulator.getSimulationIndexArray();
				}
				
				//indexArray = OT_getLineIndexArray(x, y, startRange, endRange, 0);
				break;
		}
		//root.log(ERType);
		return indexArray;
	},
	
	// 発動位置(X, Y)、開始射程、終了射程、範囲タイプ、広がり、発動者の位置(X, Y)
	getEffectRangeIndexArray: function(x, y, startRange, endRange, effectRangeType, spread, unit_x, unit_y, isGetIndexData) {
		var indexArray = [];

		var direction = OT_getUnitDirection(unit_x, unit_y, x, y);
		
		//root.log('index1:'+CurrentMap.getIndex(x, y));
		//root.log('index2:'+CurrentMap.getIndex(unit_x, unit_y));
		//root.log('direction:'+direction);
		if( typeof isGetIndexData === 'undefined' ) {
			isGetIndexData = false;
		}

		switch( effectRangeType )
		{
			case OT_EffectRangeType.CROSS:
				indexArray = OT_getCrossIndexArray(x, y, startRange, endRange, spread, isGetIndexData);
				break;
			
			case OT_EffectRangeType.XCROSS:
				indexArray = OT_getXCrossIndexArray(x, y, startRange, endRange, spread, isGetIndexData);
				break;

			case OT_EffectRangeType.DOUBLECROSS:
				indexArray = OT_getDoubleCrossIndexArray(x, y, startRange, endRange, spread, isGetIndexData);
				break;
			
			case OT_EffectRangeType.LINE:
				if( direction >= OT_SLANTING )
				{
					indexArray = OT_getDiagonalIndexArray(x, y, startRange, endRange, direction - OT_SLANTING, spread, isGetIndexData);
				}
				else if( direction != -1)
				{
					indexArray = OT_getLineIndexArray(x, y, startRange, endRange, direction, spread, isGetIndexData);
				}
				break;

			case OT_EffectRangeType.HORIZONTALLINE:
				if( direction >= OT_SLANTING )
				{
					indexArray = OT_getDiagonalHorizontalLineIndexArray(x, y, startRange, endRange, direction - OT_SLANTING, spread, isGetIndexData);
				}
				else if( direction != -1)
				{
					indexArray = OT_getHorizontalLineIndexArray(x, y, startRange, endRange, direction, spread, isGetIndexData);
				}
				break;

			case OT_EffectRangeType.BREATH:
				if( direction >= OT_SLANTING ) {
					//indexArray = OT_getDiagonalBreathIndexArray(x, y, startRange, endRange, direction - OT_SLANTING, spread);
					indexArray = [];
				}
				else if( direction != -1)
				{
					indexArray = OT_getBreathIndexArray(x, y, startRange, endRange, direction, spread, isGetIndexData);
					//indexArray = OT_getAllBreathIndexArray(x, y, startRange, endRange, 2, isGetIndexData);
				}
				break;

			case OT_EffectRangeType.BOX:
					indexArray = OT_getBoxIndexArray(x, y, startRange, endRange, isGetIndexData);
				break;

			//case OT_EffectRangeType.DEBUG:
			//		indexArray = OT_getAllBreathIndexArray(x, y, startRange, endRange, spread, isGetIndexData);
			//	break;

			case OT_EffectRangeType.DEBUG:
					indexArray = OT_getBoxIndexArray(x, y, startRange, endRange, isGetIndexData);
					Array.prototype.push.apply( indexArray, IndexArray.getBestIndexArray(x, y, startRange, endRange) );
					//unique(indexArray);
				break;
				
			case OT_EffectRangeType.ALL:
				indexArray = OT_getAllIndexArray(isGetIndexData);
				break;

			default:
				if(isGetIndexData) {
					indexArray = OT_getNormalIndexArray(x, y, startRange, endRange, isGetIndexData);
				} else {
					var simulator = root.getCurrentSession().createMapSimulator();
					simulator.startSimulationRange(x, y, startRange, endRange);
					indexArray = simulator.getSimulationIndexArray();
				}
				
				//indexArray = OT_getLineIndexArray(x, y, startRange, endRange, 0);
				break;
		}
		//root.log(ERType);
		return indexArray;
	},

	// 発動位置(X, Y)、開始射程、終了射程、範囲タイプ、広がり、発動者の位置(X, Y)
	getAIEffectRangeIndexArray: function(posX, posY, startRange, endRange, effectRangeType, spread, direction) {
		//var direction = OT_getUnitDirection(posX, posY, targetX, targetY);
		var indexArray = [];

		//root.log('index1:'+CurrentMap.getIndex(posX, posY));
		//root.log('index2:'+CurrentMap.getIndex(targetX, targetY));
		//root.log('direction:'+direction);

		switch( effectRangeType )
		{
			case OT_EffectRangeType.CROSS:
				indexArray = OT_getCrossIndexArray(posX, posY, startRange, endRange, spread);
				break;
			
			case OT_EffectRangeType.XCROSS:
				indexArray = OT_getXCrossIndexArray(posX, posY, startRange, endRange, spread);
				break;

			case OT_EffectRangeType.HORIZONTALLINE:
				if( direction >= 4 ) {
					indexArray = OT_getDiagonalHorizontalLineIndexArray(posX, posY, startRange, endRange, direction - 4, spread);
				} else if( direction != -1) {
					indexArray = OT_getHorizontalLineIndexArray(posX, posY, startRange, endRange, direction, spread);
				}
				break;
				
			case OT_EffectRangeType.LINE:
				if( direction >= 4 ) {
					indexArray = OT_getDiagonalIndexArray(posX, posY, startRange, endRange, direction - 4, spread);
				} else if( direction != -1) {
					indexArray = OT_getLineIndexArray(posX, posY, startRange, endRange, direction, spread);
				}
				break;
				
			case OT_EffectRangeType.DOUBLECROSS:
				indexArray = OT_getDoubleCrossIndexArray(posX, posY, startRange, endRange, spread);
				break;
			
			case OT_EffectRangeType.BREATH:
				if( direction != -1) {
					indexArray = OT_getBreathIndexArray(posX, posY, startRange, endRange, direction, spread);
				}
				break;

			case OT_EffectRangeType.BOX:
					indexArray = OT_getBoxIndexArray(posX, posY, startRange, endRange);
				break;

			default:
				var simulator = root.getCurrentSession().createMapSimulator();
				simulator.startSimulationRange(posX, posY, startRange, endRange);
				indexArray = simulator.getSimulationIndexArray();
				
				break;
		}
		//root.log(ERType);
		return indexArray;
	},

	findUnit: function(indexArray, targetUnit) {
		var i, index, x, y;
		var count = indexArray.length;
		
		if (count === CurrentMap.getSize()) {
			return true;
		}
		
		for (i = 0; i < count; i++) {
			index = indexArray[i];
			x = CurrentMap.getX(index);
			y = CurrentMap.getY(index);
			if (PosChecker.getUnitFromPos(x, y) === targetUnit) {
				return true;
			}
		}
		
		return false;
	},
	
	findPos: function(indexArray, xTarget, yTarget) {
		var i, index, x, y;
		var count = indexArray.length;
		
		if (count === CurrentMap.getSize()) {
			return true;
		}
		
		for (i = 0; i < count; i++) {
			index = indexArray[i];
			x = CurrentMap.getX(index);
			y = CurrentMap.getY(index);
			if (x === xTarget && y === yTarget) {
				return true;
			}
		}
		
		return false;
	}
};

// 敵AI計算用
OT_EffectRangeAIScoreCalculation = {

	_getTotalScore: function(unit, targetUnit, item) {
		var n;
		var score = 0;

		var filter = this.getUnitFilter(unit, item);
		var isIndifference = OT_getCustomItemIndifference(item);
		
		if(OT_getCustomItemRecovery(item)) {
			// 回復系
			score += this._getRecoveryScore(unit, targetUnit, item);
			score += this._getStateScoreModeRecovery(unit, targetUnit, item);
		} else {
			n = this._getDamageScore(unit, targetUnit, item);
			if (n === 0 && !DataConfig.isAIDamageZeroAllowed()) {
				return 0;	// 被害無しの場合は-1
			}
			score += n;
			
			n = this._getHitScore(unit, targetUnit, item);
			if (n === 0 && !DataConfig.isAIHitZeroAllowed()) {
				return 0;
			}
			score += n;

			score += this._getStateScore(unit, targetUnit, item);
		}
		

		// 攻撃系なのに味方を巻き込んでた場合、
		// または回復系で敵を巻き込んでた場合はマイナス評価扱いで二倍する
		if( this._checkFilter(targetUnit, filter) == false ) {
			score *= -2;
		}
		
		//DebugPrint('score check:' + targetUnit.getName() + '/' + score);
		
		// 与えれるダメージが7、命中率が80、クリティカル確率が10の場合、
		// 42 (7 * 6) 6はMiscellaneous.convertAIValue
		// 16 (80 / 5)
		// 2 (10 / 5)
		// 合計60のscoreになる
		
		return Math.floor(score);
	},

	// 攻撃系のスコア計算
	_getDamageScore: function(unit, targetUnit, item) {
		var damageValue = OT_getCustomItemFinalDamage(unit, item);
		var damageType = OT_getCustomItemType(item);
		var damage = 0;
		var score = 0;
		var hp = targetUnit.getHp();
		var isDeath = false;

		//if(OT_getCustomItemRecovery(item)) {
		//	return Calculator.calculateRecoveryValue(targetUnit, damageValue, RecoveryType.SPECIFY, 0);
		//}
		
		damage = OT_getCalculateDamageValue(item, targetUnit, damageValue, damageType, 0);
		hp -= damage;
		if (hp <= 0) {
			isDeath = true;
		}
		
		score = Miscellaneous.convertAIValue(damage);
		
		// 相手を倒せる場合は、優遇する
		if (isDeath) {
			score += 50;
		}
		
		return score;
	},

	// 回復系のスコア計算
	_getRecoveryScore: function(unit, targetUnit, item) {
		var value = OT_getCustomItemFinalDamage(unit, item);
		var damage = 0;
		var score = 0;
		
		var maxHp = ParamBonus.getMhp(targetUnit);
		var currentHp = targetUnit.getHp();
		var baseHp;
		
		// 最大値の場合は回復の必要性無しで-1
		if (currentHp === maxHp) {
			return 0;
		}
		
		// HPの減りが激しいユニットほど優先される
		baseHp = Math.floor(maxHp * 0.25);
		if (currentHp < baseHp) {
			score = 50;
		}
		
		baseHp = Math.floor(maxHp * 0.5);
		if (currentHp < baseHp) {
			score = 30;
		}
		
		baseHp = Math.floor(maxHp * 0.75);
		if (currentHp < baseHp) {
			score = 10;
		}
		
		score += Calculator.calculateRecoveryValue(targetUnit, value, RecoveryType.SPECIFY, 0);
		
		return Miscellaneous.convertAIValue(score);
	},

	_getHpScore: function(targetUnit) {
		var limitHp = DataConfig.getMaxParameter(0);
		var maxHp = ParamBonus.getMhp(targetUnit);
		var currentHp = targetUnit.getHp();
		
		// HPが低いと高スコア
		score = 0;

		// HPの減りが激しいユニットはスコア加算
		if (currentHp < Math.floor(maxHp * 0.25)) {
			score += 50;
		} else if (currentHp < Math.floor(maxHp * 0.5)) {
			score += 30;
		} else if (currentHp < Math.floor(maxHp * 0.75)) {
			score += 10;
		}
		
		return score;
	},

	_getHitScore: function(unit, targetUnit, item) {
		var hit = OT_getCustomItemHitPercent(unit, targetUnit, item);
		
		//root.log(hit);
		// 命中率を優先する場合は数値を下げる
		return Math.floor(hit / 5);
	},

	// 攻撃系のステート付与と解除
	// 敵に有利なステートを付与、不利な異常を解除する場合でもスコアの減点はしない
	_getStateScore: function(unit, targetUnit, item) {
		var point;
		var score = 0;

		// 解除されるステート
		var delState = OT_getCustomItemDelState(item);

		// 追加されるステート
		var addState = OT_getCustomItemAddState(item);

		// ステートの追加
		for( var i=0 ; i<addState.length ; i++ ) {
			var state = addState[i][0];
			// 敵対者にグッドステートを付与させるような事があった場合
			if( !state.isBadState() ) {
				continue;
			}

			point = StateScoreChecker.getScore(unit, targetUnit, state);
			
			if( point > -1 ) {
				score += point;
			}
		}

		// ステートの解除
		for( var i=0 ; i<delState.length ; i++ ) {
			var state = delState[i][0];

			// 敵対者のバッドステートを解除させるような事があった場合
			if( state.isBadState() ) {
				continue;
			}
			
			if(StateControl.getTurnState( targetUnit, state ) !== null ) {
				//root.log('■4');
				score += 20 + targetUnit.getLv();
			}
		}
		
		return score;
	},
	
	// 回復系のステート付与と解除
	// 味方に有利なステートを解除、不利な異常を付与する場合でもスコアの減点はしない
	_getStateScoreModeRecovery: function(unit, targetUnit, item) {
		var point;
		var score = 0;

		// 解除されるステート
		var delState = OT_getCustomItemDelState(item);

		// 追加されるステート
		var addState = OT_getCustomItemAddState(item);

		// ステートの追加
		for( var i=0 ; i<addState.length ; i++ ) {
			var state = addState[i][0];
			
			// 味方にバッドステートを付与させるような事があった場合
			if( state.isBadState() ) {
				continue;
			}

			// 相手が既にそのステートを与えられている場合は、アイテムを使用しない
			if (StateControl.getTurnState(targetUnit, state) !== null) {
				continue;
			}
			
			point = StateScoreChecker.getScore(unit, targetUnit, state);

			if( point > -1 ) {
				//root.log('■1');
				score += point;
			}
		}

		// ステートの解除
		for( var i=0 ; i<delState.length ; i++ ) {
			var state = delState[i][0];

			// 味方のグッドステートを解除させるような事があった場合
			if( !state.isBadState() ) {
				continue;
			}
			
			if(StateControl.getTurnState( targetUnit, state ) !== null ) {
				//root.log('■3');
				score += 20 + targetUnit.getLv();
			}
		}
		
		return score;
	},

	getUnitFilter: function(unit, item) {
		var unitType = unit.getUnitType();
		
		if( OT_getCustomItemRecovery(item) ) {
			return FilterControl.getNormalFilter(unitType);
		}
		
		return FilterControl.getReverseFilter(unitType);
	},

	_checkFilter: function(unit, filter) {
		var type = unit.getUnitType();
		
		if (filter & UnitFilterFlag.PLAYER) {
			if (type === UnitType.PLAYER) {
				return true;
			}
		}
		
		if (filter & UnitFilterFlag.ENEMY) {
			if (type === UnitType.ENEMY) {
				return true;
			}
		}
		
		if (filter & UnitFilterFlag.ALLY) {
			if (type === UnitType.ALLY) {
				return true;
			}
		}
		
		return false;
	}
};

// 使用者の派閥と範囲攻撃か範囲回復かによって
// 対象となる派閥を選別するためのフィルターを作成する
// 例として敵軍が範囲攻撃を使った時は自軍と同盟軍が対象、
// 逆に敵軍が範囲回復の場合は敵軍のみ対象とする
OT_EffectRangeGetFilter = function(unit, item) {
	var unitType = unit.getUnitType();
	
	// 無差別系の場合は全派閥対象
	if( OT_getCustomItemIndifference(item) ) {
		return (UnitFilterFlag.PLAYER | UnitFilterFlag.ENEMY | UnitFilterFlag.ALLY);
	}
	
	// ユニットがバーサク状態の場合、設定有無関係無しに無差別状態にする
	if( StateControl.isBadStateOption(unit, BadStateOption.BERSERK) ) {
		return (UnitFilterFlag.PLAYER | UnitFilterFlag.ENEMY | UnitFilterFlag.ALLY);
	}
	
	// 回復系の場合は自分の派閥のみ対象
	if( OT_getCustomItemRecovery(item) ) {
		return FilterControl.getNormalFilter(unitType);
	}
	
	// 攻撃系の場合は敵対派閥のみ対象
	return FilterControl.getReverseFilter(unitType);
};

OT_EffectRangeCheckFilter = function(unit, filter) {
	var type = unit.getUnitType();
	
	if (filter & UnitFilterFlag.PLAYER) {
		if (type === UnitType.PLAYER) {
			return true;
		}
	}
	
	if (filter & UnitFilterFlag.ENEMY) {
		if (type === UnitType.ENEMY) {
			return true;
		}
	}
	
	if (filter & UnitFilterFlag.ALLY) {
		if (type === UnitType.ALLY) {
			return true;
		}
	}
	
	return false;
};

//----------------------------------------------------------
// 共通で使用できるそうなもの
//----------------------------------------------------------
// 使用時のダメージで死亡するかの設定を取得
OT_getUseDamageDeath = function(item) {
	var value = true;
	if( typeof item.custom.OT_UseDamageDeath === 'boolean' )
	{
		value = item.custom.OT_UseDamageDeath;
	}

	return value;
};

// 吸収ダメージの倍率を取得
OT_getAbsorptionRate = function(item) {
	var value = 0.0;
	if( typeof item.custom.OT_AbsorptionRate === 'number' )
	{
		value = item.custom.OT_AbsorptionRate;
	}

	return value;
};

// 吸収ダメージの倍率を算術した値を取得
OT_getAbsorptionRateValue = function(item, value) {
	var point = Math.floor(value * OT_getAbsorptionRate(item));
	
	return point;
};

// AIのスコアレートを取得
OT_getAIScoreRate = function(item) {
	var value = 1.0;
	if( typeof item.custom.OT_AIScoreRate === 'number' )
	{
		value = item.custom.OT_AIScoreRate;
	}

	return value;
};

// AIのスコアレートを算術した値を取得
OT_getAIScoreRateValue = function(item, value) {
	var score = Math.floor(value * OT_getAIScoreRate(item))
	
	return score;
};

// アイテムのタイプを取得
OT_getCustomItemType = function(item) {
	var damageType = item.custom.OT_DamageType;
	
	if (typeof damageType !== 'number') {
		damageType = OT_EffectRangeItemDefault.DamageType;
	} else if(damageType >= 3) {
		damageType = DamageType.FIXED;
	}
	return damageType;
};

// ユニットの攻撃力を取得
OT_getCustomItemValue = function(unit, item) {
	var reflection = OT_getCustomItemUnitReflection(item);

	var plus = 0;
	var unitTotalStatus = SupportCalculator.createTotalStatus(unit);

	if(reflection == true) {
		plus = OT_getCustomItemStatueReflection(unit, item);
		if(OT_getCustomItemCheckSupportAtk(item) == true) {
			plus += SupportCalculator.getPower(unitTotalStatus);
		}
	}
	
	return plus;
};

// ダメージ倍率を取得
OT_getCustomItemDamageMagnification = function(item) {
	var val = item.custom.OT_DamageMagnification;
	
	if (typeof val !== 'number') {
		val = 1.0;
	}
	return val;
};

// ユニット能力を威力に反映するか
OT_getCustomItemUnitReflection = function(item) {
	var value = OT_EffectRangeItemDefault.UnitReflection;
	if( typeof item.custom.OT_UnitReflection === 'boolean' ) {
		value = item.custom.OT_UnitReflection;
	}

	return value;
};

// 装備武器を威力に反映するか
OT_getCustomItemWeaponReflection = function(item) {
	var value = OT_EffectRangeItemDefault.WeaponReflection;
	if( typeof item.custom.OT_WeaponReflection === 'boolean' ) {
		value = item.custom.OT_WeaponReflection;
	}

	return value;
};

// ステータスによる攻撃力ボーナスを加算
OT_getCustomItemStatueReflection = function(unit, item) {
	var unitTotalStatus = SupportCalculator.createTotalStatus(unit);
	var val = item.custom.OT_StatueReflection;
	var plus = 0;

	if(val == null) {
		//root.log('OT_StatueReflection未設定');
		var damageType = OT_getCustomItemType(item);
		if (damageType === DamageType.PHYSICS) {
			plus = ParamBonus.getStr(unit);
		} else if (damageType === DamageType.MAGIC) {
			plus = ParamBonus.getMag(unit);
		}
	} else {
		//root.log('OT_StatueReflection設定済');
		for( var key in val )
		{
			if( typeof val[key] === 'number' )
			{
				var stateValue = OT_GetStatusValue(unit, key) * val[key];
				plus += stateValue;
			}
		}
	}
	
	return Math.floor(plus);
};

// 攻撃アイテムにユニットや武器の攻撃力を加算
OT_getCustomItemPlus = function(unit, item) {
	var plus = 0;
	var weaponReflection = OT_getCustomItemWeaponReflection(item);
	var weapon = ItemControl.getEquippedWeapon(unit);

	// ユニットステータスによる攻撃力加算
	plus = OT_getCustomItemValue(unit, item);

	// アイテムの攻撃力
	if(weaponReflection == true && weapon != null) {
		plus += weapon.getPow();
	}
	
	return plus;
};

// 攻撃アイテムの最終的な攻撃力を取得
OT_getCustomItemFinalDamage = function(unit, item) {
	// アイテムの攻撃力
	var damage = OT_getCustomItemDamage(item);

	// ユニットと装備武器の攻撃力
	damage += OT_getCustomItemPlus(unit, item);
	
	//ダメージ倍率を計算したものを返す
	return Math.floor(damage * OT_getCustomItemDamageMagnification(item));
};

// 最終的なダメージを計算する
OT_getCalculateDamageValue = function(item, targetUnit, damage, damageType, plus) {
	var unitTotalStatus = SupportCalculator.createTotalStatus(targetUnit);
	var def = 0;
	
	if (damageType === DamageType.PHYSICS || damageType === DamageType.MAGIC) {
		if(OT_getCustomItemCheckSupportDef(item) === true) {
			def = SupportCalculator.getDefense(unitTotalStatus);
		}
	}
	//root.log("ダメージ値："+damage);
	//root.log("防御支援："+def);
	return Calculator.calculateDamageValue(targetUnit, damage, damageType, -def);
};

// 攻撃アイテム使用時のアニメデータを取得
OT_getCustomItemAnimeData = function(item) {
	var anime = null;
	var animeID = OT_getCustomItemAnimeID(item);
	var runtime = OT_getCustomItemAnimeRuntime(item);
	
	if( animeID !== null )
	{
		var list = root.getBaseData().getEffectAnimationList(runtime);
		anime = list.getDataFromId(animeID);
	}
	
	return anime;
};


// 攻撃アイテム使用時のアニメのIDを取得
OT_getCustomItemAnimeID = function(item) {
	var AnimeData = item.custom.OT_EffectAnime;
	var AnimeID = null;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[0] === 'number')
		{
			AnimeID = AnimeData[0];
		}
	}
	
	return AnimeID;
};

// 攻撃アイテム使用時のアニメがランタイムか確認
OT_getCustomItemAnimeRuntime = function(item) {
	var AnimeData = item.custom.OT_EffectAnime;
	var runtime = true;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[1] === 'boolean' )
		{
			runtime = AnimeData[1];
		}
	}
	
	return runtime;
};

// 使用ダメージ時のアニメデータを取得
OT_getCustomItemUseDamageAnimeData = function(item) {
	var anime = null;
	var animeID = OT_getCustomItemUseDamageAnimeID(item);
	var runtime = OT_getCustomItemUseDamageAnimeRuntime(item);
	
	if( animeID !== null )
	{
		var list = root.getBaseData().getEffectAnimationList(runtime);
		anime = list.getDataFromId(animeID);
	}
	
	return anime;
};


// 使用ダメージ時のアニメのIDを取得
OT_getCustomItemUseDamageAnimeID = function(item) {
	var AnimeData = item.custom.OT_UseDamageAnime;
	var AnimeID = null;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[0] === 'number')
		{
			AnimeID = AnimeData[0];
		}
	}
	
	return AnimeID;
};

// 使用ダメージ時のアニメがランタイムか確認
OT_getCustomItemUseDamageAnimeRuntime = function(item) {
	var AnimeData = item.custom.OT_UseDamageAnime;
	var runtime = true;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[1] === 'boolean' )
		{
			runtime = AnimeData[1];
		}
	}
	
	return runtime;
};

// ヒット時のアニメデータを取得
OT_getCustomItemHitAnimeData = function(item) {
	var anime = null;
	var animeID = OT_getCustomItemHitAnimeID(item);
	var runtime = OT_getCustomItemHitAnimeRuntime(item);
	
	if( animeID !== null )
	{
		var list = root.getBaseData().getEffectAnimationList(runtime);
		anime = list.getDataFromId(animeID);
	}
	
	return anime;
};


// ヒット時のアニメのIDを取得
OT_getCustomItemHitAnimeID = function(item) {
	var AnimeData = item.custom.IER_HitAnime;
	var AnimeID = null;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[0] === 'number')
		{
			AnimeID = AnimeData[0];
		}
	}
	
	return AnimeID;
};

// ヒット時のアニメがランタイムか確認
OT_getCustomItemHitAnimeRuntime = function(item) {
	var AnimeData = item.custom.IER_HitAnime;
	var runtime = true;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[1] === 'boolean' )
		{
			runtime = AnimeData[1];
		}
	}
	
	return runtime;
};

// ミス時のアニメデータを取得
OT_getCustomItemMissAnimeData = function(item) {
	var anime = null;
	var animeID = OT_getCustomItemMissAnimeID(item);
	var runtime = OT_getCustomItemMissAnimeRuntime(item);
	
	if( animeID !== null )
	{
		var list = root.getBaseData().getEffectAnimationList(runtime);
		anime = list.getDataFromId(animeID);
	}
	
	return anime;
};


// ミス時のアニメのIDを取得
OT_getCustomItemMissAnimeID = function(item) {
	var AnimeData = item.custom.IER_MissAnime;
	var AnimeID = null;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[0] === 'number')
		{
			AnimeID = AnimeData[0];
		}
	}
	
	return AnimeID;
};

// ミス時のアニメがランタイムか確認
OT_getCustomItemMissAnimeRuntime = function(item) {
	var AnimeData = item.custom.IER_MissAnime;
	var runtime = true;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[1] === 'boolean' )
		{
			runtime = AnimeData[1];
		}
	}
	
	return runtime;
};

// GOODステート解除時のアニメデータを取得
OT_getCustomItemDeleteGoodAnimeData = function(item) {
	var anime = null;
	var animeID = OT_getCustomItemDeleteGoodAnimeID(item);
	var runtime = OT_getCustomItemDeleteGoodAnimeRuntime(item);
	
	if( animeID !== null )
	{
		var list = root.getBaseData().getEffectAnimationList(runtime);
		anime = list.getDataFromId(animeID);
	}
	
	return anime;
};


// GOODステート解除時のアニメのIDを取得
OT_getCustomItemDeleteGoodAnimeID = function(item) {
	var AnimeData = item.custom.IER_DelGoodAnime;
	var AnimeID = 200;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[0] === 'number')
		{
			AnimeID = AnimeData[0];
		}
	}
	
	return AnimeID;
};

// GOODステート解除時のアニメがランタイムか確認
OT_getCustomItemDeleteGoodAnimeRuntime = function(item) {
	var AnimeData = item.custom.IER_DelGoodAnime;
	var runtime = true;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[1] === 'boolean' )
		{
			runtime = AnimeData[1];
		}
	}
	
	return runtime;
};

// Badステート解除時のアニメデータを取得
OT_getCustomItemDeleteBadAnimeData = function(item) {
	var anime = null;
	var animeID = OT_getCustomItemDeleteBadAnimeID(item);
	var runtime = OT_getCustomItemDeleteBadAnimeRuntime(item);
	
	if( animeID !== null )
	{
		var list = root.getBaseData().getEffectAnimationList(runtime);
		anime = list.getDataFromId(animeID);
	}
	
	return anime;
};

// BADステート解除時のアニメのIDを取得
OT_getCustomItemDeleteBadAnimeID = function(item) {
	var AnimeData = item.custom.IER_DelBadAnime;
	var AnimeID = 101;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[0] === 'number')
		{
			AnimeID = AnimeData[0];
		}
	}
	
	return AnimeID;
};

// BADステート解除時のアニメがランタイムか確認
OT_getCustomItemDeleteBadAnimeRuntime = function(item) {
	var AnimeData = item.custom.IER_DelBadAnime;
	var runtime = true;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[1] === 'boolean' )
		{
			runtime = AnimeData[1];
		}
	}
	
	return runtime;
};

// 使用者のGOODステート解除時のアニメデータを取得
OT_getCustomItemUseDeleteGoodAnimeData = function(item) {
	var anime = null;
	var animeID = OT_getCustomItemUseDeleteGoodAnimeID(item);
	var runtime = OT_getCustomItemUseDeleteGoodAnimeRuntime(item);
	
	if( animeID !== null )
	{
		var list = root.getBaseData().getEffectAnimationList(runtime);
		anime = list.getDataFromId(animeID);
	}
	
	return anime;
};


// 使用者のGOODステート解除時のアニメのIDを取得
OT_getCustomItemUseDeleteGoodAnimeID = function(item) {
	var AnimeData = item.custom.OT_UseDelGoodAnime;
	var AnimeID = 200;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[0] === 'number')
		{
			AnimeID = AnimeData[0];
		}
	}
	
	return AnimeID;
};

// 使用者のGOODステート解除時のアニメがランタイムか確認
OT_getCustomItemUseDeleteGoodAnimeRuntime = function(item) {
	var AnimeData = item.custom.OT_UseDelGoodAnime;
	var runtime = true;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[1] === 'boolean' )
		{
			runtime = AnimeData[1];
		}
	}
	
	return runtime;
};

// 使用者のBadステート解除時のアニメデータを取得
OT_getCustomItemUseDeleteBadAnimeData = function(item) {
	var anime = null;
	var animeID = OT_getCustomItemUseDeleteBadAnimeID(item);
	var runtime = OT_getCustomItemUseDeleteBadAnimeRuntime(item);
	
	if( animeID !== null )
	{
		var list = root.getBaseData().getEffectAnimationList(runtime);
		anime = list.getDataFromId(animeID);
	}
	
	return anime;
};

// 使用者のBADステート解除時のアニメのIDを取得
OT_getCustomItemUseDeleteBadAnimeID = function(item) {
	var AnimeData = item.custom.OT_UseDelBadAnime;
	var AnimeID = 101;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[0] === 'number')
		{
			AnimeID = AnimeData[0];
		}
	}
	
	return AnimeID;
};

// 使用者のBADステート解除時のアニメがランタイムか確認
OT_getCustomItemUseDeleteBadAnimeRuntime = function(item) {
	var AnimeData = item.custom.OT_UseDelBadAnime;
	var runtime = true;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[1] === 'boolean' )
		{
			runtime = AnimeData[1];
		}
	}
	
	return runtime;
};

// 開始射程を取得
OT_getCustomItemRangeMin = function(item) {
	var Range = OT_EffectRangeItemDefault.MinRange;
	var effectRangeType = OT_getCustomItemEffectRangeType(item);
	
	if( typeof item.custom.OT_MinRange === 'number' ) {
		Range = item.custom.OT_MinRange;
	}
	
	switch( effectRangeType ) {
		case OT_EffectRangeType.LINE:
		case OT_EffectRangeType.HORIZONTALLINE:
		case OT_EffectRangeType.BREATH:
			if(Range < 1) {
				Range = 1;
			}
			break;
			
		default:
			if(Range < 0) {
				Range = 0;
			}
			break;
	}

	return Range;
};

// 終了射程を取得
OT_getCustomItemRangeMax = function(item) {
	//var endRange = OT_EffectRangeItemDefault.MaxRange;
	var endRange = 0;
	
	var rangeValue = item.getRangeValue();
	var rangeType = item.getRangeType();

	if (rangeType === SelectionRangeType.SELFONLY) {
		endRange = 0;
	}
	else if (rangeType === SelectionRangeType.MULTI) {
		endRange = rangeValue;
	}
	else if (rangeType === SelectionRangeType.ALL) {
		endRange = CurrentMap.getWidth() + CurrentMap.getHeight();
		
		// 拠点などで射程を確認する時は0を返すため大き目の数値を渡す
		if(endRange == 0) {
			endRange = 20;
		}
	}

	return endRange;
};

// 回復系かを取得
OT_getCustomItemRecovery = function(item) {
	var value = false;
	if( typeof item.custom.OT_Recovery === 'boolean' )
	{
		value = item.custom.OT_Recovery;
	}

	return value;
};

// 使用後のダメージ量をテキスト形式で取得
// 数字部分は絶対値で返す
OT_getCustomItemUseDamageText = function(item) {
	var value = '0';
	if( typeof item.custom.OT_UseDamage === 'number' ) {
		value = String(Math.abs(item.custom.OT_UseDamage));
	} else if( typeof item.custom.OT_UseDamage === 'string' ) {
		var str = item.custom.OT_UseDamage;
		var regex = /^(\-?)(.*)$/;
		if (str.match(regex)) {
			var mainasu = RegExp.$1;
			var val = RegExp.$2;
			val = val.replace(/M/g, '最大HPの');
			
			value = val;
		}
	}
	return value;
};

// 使用後のダメージ量についてプラスかマイナスか確認
// 未設定の場合は0を返す
OT_getCustomItemisUseDamageSign = function(item) {
	var value = 0;
	if( typeof item.custom.OT_UseDamage === 'number' ) {
		value = item.custom.OT_UseDamage;
	} else if( typeof item.custom.OT_UseDamage === 'string' ) {
		var str = item.custom.OT_UseDamage;
		var regex = /^(\-?)(.*)$/;
		if (str.match(regex)) {
			var mainasu = RegExp.$1;
			if( mainasu == '-' ) {
				return -1;
			} else {
				return 1;
			}
		}
	}
	
	if(value > 0) {
		return 1;
	} else if(value < 0) {
		return -1;
	} else {
		return 0;
	}
};

// 使用後のダメージ量を取得
OT_getCustomItemUseDamage = function(item, unit) {
	var value = 0;
	if( typeof item.custom.OT_UseDamage === 'number' )
	{
		value = item.custom.OT_UseDamage;
	}
	else if(unit != null)
	{
		// 文字列で指定されてた場合
		if( typeof item.custom.OT_UseDamage === 'string' )
		{
			var str = item.custom.OT_UseDamage;
			var regex = /^(\-?)([0-9]+)\%$/;
			var regexM = /^(\-?)M([0-9]+)\%$/;
			if (str.match(regex))
			{
				var hp = unit.getHp();
				var val = parseInt(RegExp.$2);
				value = Math.floor( hp * (val / 100) );
				
				if(RegExp.$1 == '-')
				{
					value *= -1;
				}
			}
			else if (str.match(regexM))
			{
				var hp = ParamBonus.getMhp(unit);
				var val = parseInt(RegExp.$2);
				value = Math.floor( hp * (val / 100) );
				
				if(RegExp.$1 == '-')
				{
					value *= -1;
				}
			}
		}
	}

	return value;
};

// 使用後に消えるステートを取得
OT_getCustomItemUseDelState = function(item) {
	var value = [];
	var list = root.getBaseData().getStateList();

	if( typeof item.custom.OT_UseDelState === 'object' )
	{
		val = item.custom.OT_UseDelState;
		var add, k;
		
		for( key in val )
		{
			k = key;
			break;
		}

		// 文字列で指定されてた場合
		if( k == 'BadState' )
		{
			for( var i=0 ; i<list.getCount() ; i++ )
			{
				add = list.getDataFromId(i);
				if( add === null ) continue;
				if( add.isBadState() )
				{
					value.push( new Array( add, val[key] ) );
				}
			}
		}
		else if( k == 'GoodState' )
		{
			for( var i=0 ; i<list.getCount() ; i++ )
			{
				add = list.getDataFromId(i);
				if( add === null ) continue;
				if( add.isBadState() == false )
				{
					value.push( new Array( add, val[key] ) );
				}
			}
		}
		else if( k == 'AllState' )
		{
			for( var i=0 ; i<list.getCount() ; i++ )
			{
				add = list.getDataFromId(i);
				if( add === null ) continue;
				value.push( new Array( add, val[key] ) );
			}
		}
		else
		{
			try {
				for( key in val )
				{
					add = list.getDataFromId(key);
					if( add != null ) value.push( new Array( add, val[key] ) );
				}
			} catch(e) {
				root.msg('[範囲攻撃]解除ステートの指定が不正です。\nアイテムID:' + item.getId());
				root.endGame();
			}
		}
	}

	return value;
};

// 使用後に付与されるステートを取得
OT_getCustomItemUseAddState = function(item) {
	var value = [];
	var list = root.getBaseData().getStateList();

	if( typeof item.custom.OT_UseAddState === 'object' )
	{
		val = item.custom.OT_UseAddState;
		var add, k;
		
		for( key in val )
		{
			if(key == 'BadState' || key == 'GoodState' || key == 'AllState') {
				root.msg('[範囲攻撃]OT_UseAddStateの指定が不正です。\nOT_UseAddStateにはAllState、BadState、GoodStateは指定できません。\nアイテムID:' + item.getId());
				root.endGame();
			}
			
			add = list.getDataFromId(key);
			if( add != null )
			{
				value.push( new Array( add, val[key] ) );
				//root.log(add.getName());
				//root.log(val[key]);
			}
		}
	}

	return value;
};

// ユニットにステートを付与する(現在未使用)
OT_setCustomItemAddState = function(unit, targetUnit, addState) {
	var value = null;

	// ステートの追加
	for( var j=0 ; j<addState.length ; j++)
	{
		if( Probability.getProbability( addState[j][1] ) && StateControl.getTurnState( targetUnit, addState[j][0] ) === null )
		{
			// 耐性ステートを確認
			if (StateControl.isStateBlocked(targetUnit, unit, addState[j][0])) {
				// ステートは無効対象であるため発動しない
				continue;
			}
				
			StateControl.arrangeState(targetUnit, addState[j][0], IncreaseType.INCREASE);
			if( addState[j][0].isBadState() )
			{
				value = value | 0x02;
			}
			else
			{
				value = value | 0x01;
			}
		}
	}
	
	//root.log(value);
	return value;
};

// ユニットのステートを解除する
OT_setCustomItemDelState = function(unit, delState) {
	var value = null;

	// ステートの解除
	for( var j=0 ; j<delState.length ; j++)
	{
		if( Probability.getProbability( delState[j][1] ) && StateControl.getTurnState( unit, delState[j][0] ) !== null )
		{
			StateControl.arrangeState(unit, delState[j][0], IncreaseType.DECREASE);
			if( delState[j][0].isBadState() )
			{
				value = value | 0x01;
			}
			else
			{
				value = value | 0x02;
			}
		}
	}
	
	//root.log(value);
	return value;
};

// グッドステータスが含まれてるか
OT_getCustomItemisGoodState = function(array) {
	for( var i=0 ; i<array.length ; i++)
	{
		if( !array[i][0].isBadState() )
		{
			return true;
		}
	}
	
	return false;
};

// バッドステータスが含まれてるか
OT_getCustomItemisBadState = function(array) {
	for( var i=0 ; i<array.length ; i++)
	{
		if( array[i][0].isBadState() )
		{
			return true;
		}
	}
	
	return false;
};

// アニメの再生時の総カウント数を取得
OT_getCustomItemAnimeFrameCounter = function(anime) {
	
	var id = anime.getMotionIdFromIndex(0);
	var frame = anime.getFrameCount(id);
	var count = 0;

	for( var i=0 ; i<frame ; i++)
	{
		count += anime.getFrameCounterValue(id, i);
	}

	//root.log(id + ':' + frame + ':' + count);
	
	return count;
};

// ステータス取得
OT_GetStatusValue = function(unit, type) {
	var value = 0;
	
	// パラメータが宣言されている事を確認する
	if(!OT_isDefineParam(type))
	{
		return 0;
	}
	
	switch(type)
	{
		case OT_DefineStatus.LV:
			value = unit.getLv();
			break;

		case OT_DefineStatus.HP:
			value = unit.getHp();
			break;

		case OT_DefineStatus.EP:
			value = OT_GetNowEP(unit);
			break;

		case OT_DefineStatus.FP:
			value = OT_GetNowFP(unit);
			break;

		default:
			value = ParamBonus.getBonus(unit, ParamType[type]);
			break;
	}
	//root.log(value);
	return value;
};

OT_isDefineParam = function(type) {
	// レベルはスクリプトの定数で定義されている
	switch(type)
	{
		case OT_DefineStatus.LV:
			return true;
	}

	// 現在値と最大値が分かれているパラメータ
	for( var key in OT_NowStatusMapping )
	{
		if( type == OT_NowStatusMapping[key] )
		{
			if(typeof UnitParameter[key] == 'undefined')
			{
				//root.log(type + 'は未宣言のパラメータです。');
				return false;
			}
			return true;
		}
	}

	// パラメータが宣言されていない
	if(typeof UnitParameter[type] == 'undefined')
	{
		//root.log(type + 'は未宣言のパラメータです。');
		return false;
	}
	
	return true;
};

OT_getParamName = function( type ) {
	// パラメータの定義確認
	if( !OT_isDefineParam(type) )
	{
		return '';
	}

	// レベルはスクリプトの定数で定義されているため定数を返す
	switch(type)
	{
		case OT_DefineStatus.LV:
			return StringTable.Status_Level;
	}

	// 現在値と最大値が分かれているパラメータ
	for( var key in OT_NowStatusMapping )
	{
		if( type == key )
		{
			return '最大' + UnitParameter[key].getParameterName();
		}
		
		if( type == OT_NowStatusMapping[key] )
		{
			return UnitParameter[key].getParameterName();
		}
	}
	
	return UnitParameter[type].getParameterName();
};

//----------------------------------------------------------
// 範囲攻撃用
//----------------------------------------------------------
// 非ダメージ系であるかを取得
OT_getNoDamegeAttack = function(item) {
	var type = OT_getCustomItemType(item);
	var value = OT_getCustomItemDamage(item);
	
	if( type == DamageType.FIXED && value == 0 && OT_getCustomItemWeaponReflection(item) != true )
	{
		return true;
	}
	return false;
};

// アイテムの攻撃力を取得
OT_getCustomItemDamage = function(item) {
	var damage = 0;

	if ( typeof item.custom.IER_Value === 'number' )
	{
		damage = item.custom.IER_Value;
	}

	return damage;
};

// 範囲内のキャラに無差別に攻撃するか取得
OT_getCustomItemIndifference = function(item) {
	var indifference = OT_EffectRangeItemDefault.Indifference;
	
	if( item.custom.IER_Indifference != null )
	{
		indifference = item.custom.IER_Indifference;
	}
	
	return indifference;
};

// 効果範囲を取得
OT_getCustomItemEffectRange = function(item) {
	var startRange = 0;
	var endRange = 1;
	var Range = {};

	var str = item.custom.IER_EffectRange;
	if( typeof str != 'string' ) {
		str = OT_EffectRangeItemDefault.EffectRange;
	} 

	//root.log(str);
	var regex = /^([0-9]+)\-([0-9]+)$/;
	if (str.match(regex))
	{
		startRange = parseInt(RegExp.$1);
		endRange = parseInt(RegExp.$2);
		
		Range[0] = startRange;
		Range[1] = endRange;
		
		return Range;
	}
	
	return null;
};

// 効果範囲最小値を取得
OT_getCustomItemEffectRangeMin = function(item) {
	var Range = 0;
	var RangeData = OT_getCustomItemEffectRange(item);
	
	if( RangeData != null )
	{
		Range = RangeData[0];
	}

	return Range;
};

// 効果範囲最大値を取得
OT_getCustomItemEffectRangeMax = function(item) {
	var Range = 0;
	var RangeData = OT_getCustomItemEffectRange(item);
	
	if( RangeData != null )
	{
		Range = RangeData[1];
	}

	return Range;
};

// 相手に当てた時の取得経験値の倍率取得
OT_getCustomItemEXPMagnification = function(item) {
	var Magnification = OT_EffectRangeItemDefault.EXPMagnification;

	if ( typeof item.custom.IER_EXPMagnification === 'number' )
	{
		Magnification = item.custom.IER_EXPMagnification;
	}

	return Magnification;
};

// 使用した時の取得経験値
OT_getCustomItemGetEXP = function(item) {
	var value = OT_EffectRangeItemDefault.GetEXP;

	if ( typeof item.custom.IER_GetEXP === 'number' )
	{
		value = item.custom.IER_GetEXP;
	}

	return value;
};

// 射程タイプの取得OT_getCustomItemRangeMax
// 範囲タイプがブレスの場合は強制的に十字型にする
// また範囲タイプが全体の場合は強制的に全体にする
OT_getCustomItemRangeType = function(item) {
	var effectRange = OT_getCustomItemEffectRangeType(item);
	if(effectRange == OT_EffectRangeType.BREATH) {
		return OT_EffectRangeType.CROSS; 
	} else if(effectRange == OT_EffectRangeType.ALL) {
		return OT_EffectRangeType.ALL;
	}

	var value = OT_EffectRangeItemDefault.RangeType;
	if ( typeof item.custom.IER_RangeType === 'number' ) {
		value = item.custom.IER_RangeType;
	}

	//var itemRangeType = item.getRangeType();
	//if (itemRangeType === SelectionRangeType.ALL && value == OT_EffectRangeType.NORMAL) {
	//	return OT_EffectRangeType.ALL;
	//}

	return value;
};

// 範囲タイプの取得
OT_getCustomItemEffectRangeType = function(item) {
	var value = OT_EffectRangeItemDefault.EffectRangeType;

	if ( typeof item.custom.IER_EffectRangeType === 'number' )
	{
		value = item.custom.IER_EffectRangeType;
	}

	return value;
};


// 射程の広がり方の調整値の取得
OT_getCustomItemRangeSpread = function(item) {
	var value = 1;

	if ( typeof item.custom.IER_RangeSpread === 'number' )
	{
		value = item.custom.IER_RangeSpread;
	}

	if( value < 1 ) value = 1;

	return value;
};

// 範囲の広がり方の調整値の取得
OT_getCustomItemEffectSpread = function(item) {
	var value = 1;

	if ( typeof item.custom.IER_EffectSpread === 'number' )
	{
		value = item.custom.IER_EffectSpread;
	}

	if( value < 1 ) value = 1;

	return value;
};

// 当たった対象の消えるステートを取得
OT_getCustomItemDelState = function(item) {
	var value = [];
	var list = root.getBaseData().getStateList();

	if( typeof item.custom.IER_DelState === 'object' )
	{
		val = item.custom.IER_DelState;
		var add, k;
		
		for( key in val )
		{
			k = key;
			break;
		}

		// 文字列で指定されてた場合
		if( k == 'BadState' )
		{
			for( var i=0 ; i<list.getCount() ; i++ )
			{
				add = list.getDataFromId(i);
				if( add === null ) continue;
				
				if( add.isBadState() )
				{
					value.push( new Array( add, val[key] ) );
				}
			}
		}
		else if( k == 'GoodState' )
		{
			for( var i=0 ; i<list.getCount() ; i++ )
			{
				add = list.getDataFromId(i);
				if( add === null ) continue;
				
				if( add.isBadState() == false )
				{
					value.push( new Array( add, val[key] ) );
				}
			}
		}
		else if( k == 'AllState' )
		{
			for( var i=0 ; i<list.getCount() ; i++ )
			{
				add = list.getDataFromId(i);
				if( add === null ) continue;
				value.push( new Array( add, val[key] ) );
			}
		}
		else
		{
			try {
				for( key in val )
				{
					add = list.getDataFromId(key);
					if( add != null ) value.push( new Array( add, val[key] ) );
				}
			} catch(e) {
				root.msg('[範囲攻撃]解除ステートの指定が不正です。\nアイテムID:' + item.getId());
				root.endGame();
			}
		}
	}

	return value;
};

// 全解除タイプが含まれているか確認する
OT_getCustomItemDelStateAllType = function(obj) {
	var value = [];
	var list = root.getBaseData().getStateList();

	if( typeof obj === 'object' )
	{
		val = obj;
		var add, k;
		
		for( key in val )
		{
			k = key;
			break;
		}

		// 文字列で指定されてた場合
		if( k == 'BadState' || k == 'GoodState' || k == 'AllState') {
			if( value.indexOf(k) == -1) {
				value[k] = val[k];
			}
		}
	}
	
	if(typeof value['AllState'] != 'undefined') {
		value['BadState']  = value['AllState'];
		value['GoodState'] = value['AllState'];
	}

	return value;
};

// 全解除タイプが含まれているか確認する
OT_getCustomItemDelAllState = function(item) {
	var value = [];

	if( typeof item.custom.IER_DelState === 'object' ) {
		value = OT_getCustomItemDelStateAllType(item.custom.IER_DelState);
	}

	return value;
};

// 使用後に消えるステートで全解除タイプが含まれているか確認する
OT_getCustomItemUseDelAllState = function(item) {
	var value = [];
	var list = root.getBaseData().getStateList();

	if( typeof item.custom.OT_UseDelState === 'object' ) {
		value = OT_getCustomItemDelStateAllType(item.custom.OT_UseDelState);
	}

	return value;
};

// 当たった対象に付与されるステートを取得
OT_getCustomItemAddState = function(item) {
	var value = [];
	var list = root.getBaseData().getStateList();

	if( typeof item.custom.IER_AddState === 'object' )
	{
		val = item.custom.IER_AddState;
		var add, k;
		
		for( key in val )
		{
			if(key == 'BadState' || key == 'GoodState' || key == 'AllState') {
				root.msg('[範囲攻撃]IER_AddStateの指定が不正です。\IER_AddStateにはAllState、BadState、GoodStateは指定できません。\nアイテムID:' + item.getId());
				root.endGame();
			}
			add = list.getDataFromId(key);
			if( add != null )
			{
				value.push( new Array( add, val[key] ) );
				//root.log(add.getName());
				//root.log(val[key]);
			}
		}
	}

	return value;
};

// ユニットの向き取得
OT_getUnitDirection = function(x, y, px, py) {
	var value = 0;
	
	// 相対位置を取得
	var pointX = px - x;
	var pointY = py - y;
	
	// 相対座標が0,0なら-1を返す
	if( pointX == 0 && pointY == 0 ) return -1;

	// 丁度斜めなら絶対値が等しくなる
	if( Math.abs(pointX) == Math.abs(pointY) )
	{
		if( pointX < 0 )
		{
			if( pointY < 0 )
			{
				// 左上
				return OT_SLANTING + 0;
			}
			else if( pointY > 0 )
			{
				// 左下
				return OT_SLANTING + 3;
			}
		}
		else if( pointX > 0 )
		{
			if( pointY < 0 )
			{
				// 右上
				return OT_SLANTING + 1;
			}
			else if( pointY > 0 )
			{
				// 右下
				return OT_SLANTING + 2;
			}
		}
	}
	else if(Math.abs(pointX) > Math.abs(pointY))
	{
		if( pointX < 0 )
		{
			return DirectionType.LEFT;
		}
		else
		{
			return DirectionType.RIGHT;
		}
	}
	else if(Math.abs(pointX) < Math.abs(pointY))
	{
		if( pointY < 0 )
		{
			return DirectionType.TOP;
		}
		else
		{
			return DirectionType.BOTTOM;
		}
	}
	
	return -1;
};

// 斜め方向の識別数字を4～7に変換する
// 配列格納用の処理
OT_getUnitDirectionIndex = function(direction) {
	
	if(direction >= OT_SLANTING) {
		direction = direction - OT_SLANTING + 4;
	}
	
	return direction;
};

// 斜め方向の識別数字を4～7に変換したものの方向を反転させる
// 
OT_getUnitDirectionIndexReverse = function(direction) {

	switch( direction ) {
		case DirectionType.LEFT:
			direction = DirectionType.RIGHT;
			break;
			
		case DirectionType.RIGHT:
			direction = DirectionType.LEFT;
			break;
			
		case DirectionType.TOP:
			direction = DirectionType.BOTTOM;
			break;
			
		case DirectionType.BOTTOM:
			direction = DirectionType.TOP;
			break;
			
		// 左上
		case 4:
			direction = 6;
			break;
			
		// 右上
		case 5:
			direction = 7;
			break;
			
		// 右下
		case 6:
			direction = 4;
			break;
			
		// 左下
		case 7:
			direction = 5;
			break;
	}
	
	return direction;
};

// 命中率がユニットの回避率で変動するか
OT_getCustomItemHitAvoid = function(item) {
	var value = OT_EffectRangeItemDefault.HitAvoid;
	if(OT_getCustomItemRecovery(item)) {
		value = OT_EffectRangeItemDefault.RecoveryHitAvoid;
	}
	
	if( typeof item.custom.IER_HitAvoid === 'boolean' )
	{
		value = item.custom.IER_HitAvoid;
	}

	return value;
};

// 命中率を取得
OT_getCustomItemHitValue = function(item) {
	var value = OT_EffectRangeItemDefault.HitValue;
	if(OT_getCustomItemRecovery(item)) {
		value = OT_EffectRangeItemDefault.RecoveryHitValue;
	}
	
	if( typeof item.custom.IER_HitValue === 'number' ) {
		value = item.custom.IER_HitValue;
	}

	return value;
};

// 命中率がユニット依存か調べる
OT_getCustomItemHITReflectionUnit = function(item) {
	var value = item.custom.IER_HitReflectionUnit;
	
	// 新バージョン用のカスパラを設定していない場合は旧設定のカスパラを使う
	if(typeof value != 'boolean') {
		var Data = item.custom.IER_HitReflection;
		value = OT_EffectRangeItemDefault.HitReflectionUnit;
		
		if(Data != null) {
			if( typeof Data[0] === 'boolean' ) {
				value = Data[0];
			} 
		}
	}
	
	return value;
};

// 命中率が武器依存か調べる
OT_getCustomItemHITReflectionWeapon = function(item) {
	var value = item.custom.IER_HitReflectionWeapon;
	
	// 新バージョン用のカスパラを設定していない場合は旧設定のカスパラを使う
	if(typeof value != 'boolean') {
		var Data = item.custom.IER_HitReflection;
		value = OT_EffectRangeItemDefault.HitReflectionWeapon;
		
		if(Data != null) {
			if( typeof Data[1] === 'boolean' ) {
				value = Data[1];
			}
		}
	}
	
	return value;
};

// 必中設定がされているか
OT_getCustomItemHitMark = function(item) {
	var value = false;
	if( typeof item.custom.IER_HitMark === 'boolean' )
	{
		value = item.custom.IER_HitMark;
	}
	
	return value;
};

// 実際の命中率を取得
OT_getCustomItemHitPercent = function(unit, targetUnit, item) {
	// 必中設定があったら必ず100を返す
	if(OT_getCustomItemHitMark(item)) {
		//root.log("的中設定有");
		return DefineControl.getMaxHitPercent();
	}
	
	var hit, avoid, percent;
	var unitTotalStatus = SupportCalculator.createTotalStatus(unit);
	var targetUnitTotalStatus = SupportCalculator.createTotalStatus(targetUnit);
	var weapon = ItemControl.getEquippedWeapon(unit);
	
	hit = OT_getCustomItemHitValue(item);
	avoid = 0;
	
	// 使用者の命中率が反映される場合は命中率に加算
	if( OT_getCustomItemHITReflectionUnit(item) ) {
		hit += (RealBonus.getSki(unit) * 3);
		if( OT_getCustomItemCheckSupportHit(item) == true ) {
			hit += SupportCalculator.getHit(unitTotalStatus);
		}
	}

	// 武器の命中率が反映される場合は加算させる
	if( OT_getCustomItemHITReflectionWeapon(item) && weapon != null ) {
		hit += weapon.getHit();
	}

	// 相手の回避値が反映される場合は加算
	if( OT_getCustomItemHitAvoid(item) ) {
		avoid = AbilityCalculator.getAvoid(targetUnit);
		if( OT_getCustomItemCheckSupportAgi(item) === true ) {
			avoid += SupportCalculator.getAvoid(targetUnitTotalStatus);
		}
	}

	// 命中率の計算を行う
	percent = hit - avoid;
	
	//root.log("命中支援："+SupportCalculator.getHit(unitTotalStatus));
	//root.log("回避支援："+SupportCalculator.getAvoid(targetUnitTotalStatus));
	//root.log("命中率："+hit);
	//root.log("回避率："+avoid);

	
	//root.log('命中率:'+percent);
	
	return HitCalculator.validValue(unit, targetUnit, weapon, percent);
};

// 命中するかを判定
OT_getCustomItemHitCheck = function(unit, targetUnit, item) {
	return Probability.getProbability( OT_getCustomItemHitPercent(unit, targetUnit, item) );
};


// 支援効果による攻撃補正が反映されるかを判定
OT_getCustomItemCheckSupportAtk = function(item) {
	var value = OT_EffectRangeItemDefault.SupportAtk;
	if( typeof item.custom.IER_SupportAtk === 'boolean' ) {
		value = item.custom.IER_SupportAtk;
	}
	return value;
};

// 支援効果による命中補正が反映されるかを判定
OT_getCustomItemCheckSupportHit = function(item) {
	var value = OT_EffectRangeItemDefault.SupportHit;
	if( typeof item.custom.IER_SupportHit === 'boolean' ) {
		value = item.custom.IER_SupportHit;
	}
	return value;
};

// 支援効果による防御補正が反映されるかを判定
OT_getCustomItemCheckSupportDef = function(item) {
	var value = OT_EffectRangeItemDefault.SupportDef;
	if( typeof item.custom.IER_SupportDef === 'boolean' ) {
		value = item.custom.IER_SupportDef;
	}
	return value;
};

// 支援効果による回避補正が反映されるかを判定
OT_getCustomItemCheckSupportAgi = function(item) {
	var value = OT_EffectRangeItemDefault.SupportAgi;
	if( typeof item.custom.IER_SupportAgi === 'boolean' ) {
		value = item.custom.IER_SupportAgi;
	}
	return value;
};

// 効果範囲内のマップチップを変更する
OT_isCustomItemMapChipChange = function(chip, terrain) {
	var value = false;
	var data = terrain.custom.IER_MapChipChangeGroup;
	
	if( chip[0] == 'ALL' ) return true;
	
	if( typeof data === 'object' )
	{
		for( var i=0 ; i<data.length ; i++ )
		{
			if( chip[0] == data[i] )
			{
				return true;
			}
		}
	}

	return false;
};

// 効果範囲内の変更後のマップチップのデータ
OT_getCustomItemMapChipChangeDate = function(item) {
	var value = null;
	var data = item.custom.IER_MapChipChangeAfter;
	if( typeof data === 'object' )
	{
		value = data;
	}

	return value;
};

// 特定座標が推測射程範囲内に入っているか
OT_getPointinGuessRange = function(x, y, px, py, startRange, endRange) {
	
	var ax = Math.abs( x - px );
	var ay = Math.abs( y - py );
	
	if( startRange <= ax && ax <= endRange )
	{
		if( startRange <= ay && ay <= endRange )
		{
			//root.log(ax+ ':' +ay);
			return true;
		}
	}


	return false;
};

// 範囲攻撃用の座標を設定
OT_getMapAnimationIERPos = function(x, y) {
	x -= 80;
	y -= 160;
	
	return createPos(x, y);
};


// 効果音重複の設定確認
OT_getCustomItemSoundDuplicate = function(item) {
	var value = OT_EffectRangeItemDefault.SoundDuplicate;
	if( typeof item.custom.IER_SoundDuplicate === 'boolean' ) {
		value = item.custom.IER_SoundDuplicate;
	}
	return value;
};

//----------------------------------------------------------
// 効果範囲用のインデックス作成
//----------------------------------------------------------
OT_getRangeIndexNormalize = function(x, y, arrayTmp) {
	var array = [];
	var tmpX, tmpY;
	
	arrayTmp = unique(arrayTmp);
	//root.log('start:');
	for( var i=0 ; i<arrayTmp.length ; i++ ) {
		//root.log('x:'+arrayTmp[i][0]+ ' y:'+arrayTmp[i][1]);
		
		tmpX = arrayTmp[i][0];
		tmpY = arrayTmp[i][1];
		index = CurrentMap.getIndex(x+tmpX, y+tmpY);
		if(index != -1) {
			array.push(index);
		}
	}
	//root.log('end:');
	return array;
};


// 通常型
// このタイプのみは基本的に説明用ウィンドウのインデックス作成用に使う
OT_getNormalIndexArray = function(x, y, startRange, endRange, isGetIndexData) {
	var array = [];
	var index = -1;
	var indexX = 0;
	var indexY = 0;

	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}
	
	array = OT_NormalIndexSearch._SearchStart(x, y, startRange, endRange);
	
	if(isGetIndexData) {
		return unique(array);
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
};

// 通常範囲の配列作成
var OT_NormalIndexSearch = {
	_tmpRangeArray:null,
	_resultArray:null,
	_baseX:0,
	_baseY:0,
	
	_SearchStart: function(x, y, startRange, endRange) {
		this._tmpRangeArray = [];
		this._resultArray = [];
		
		this._baseX = x;
		this._baseY = y;
		
		if(startRange == 0) {
			this._tmpRangeArray[0] = [];
			this._tmpRangeArray[0][0] = endRange;
			this._resultArray.push([0, 0]);
		}
		
		this._Search4(x, y, startRange, endRange);
		
		return this._resultArray;
	},

	_Search4: function(x, y, startRange, endRange) {
		// 上方向
		this._Search(x, y-1, startRange, endRange);
		// 下方向
		this._Search(x, y+1, startRange, endRange);
		// 左方向
		this._Search(x-1, y, startRange, endRange);
		// 右方向
		this._Search(x+1, y, startRange, endRange);
	},

	_Search: function(x, y, startRange, m) {
		var point = Math.abs(this._baseX - x) + Math.abs(this._baseY - y);
		
		if(typeof this._tmpRangeArray[x] == 'undefined') {
			this._tmpRangeArray[x] = [];
		}
		if(typeof this._tmpRangeArray[x][y] == 'undefined') {
			this._tmpRangeArray[x][y] = -100;
		} else {
			if((m-1) <= this._tmpRangeArray[x][y]) {
				return;
			}
		}

		m = m - 1;
		if(m >= 0) {
			this._tmpRangeArray[x][y] = m;
			if(startRange <= point) {
				this._resultArray.push([x, y]);
			}
			
			// 移動量があるのでSearch4を再帰呼びだし
			this._Search4(x, y, startRange, m);
		} 
		//this._tmpRangeArray[x][y] = m;
		//array.push([indexX, indexY]);
	}
};


///// 4方向を調べる
//var OT_NormalIndexSearch4 {
//	if(0<x && x<_xLength && 0<y && y<_zLength) {
//		// 上方向
//		OT_NormalIndexSearch(x, y-1, m);
//		// 下方向
//		OT_NormalIndexSearch(x, y+1, m);
//		// 左方向
//		OT_NormalIndexSearch(x-1, y, m);
//		// 右方向
//		OT_NormalIndexSearch(x+1, y, m);
//	}
//};
//
//OT_NormalIndexSearch = function(int x, int z, int m) {
//	// 探索方向のCellがマップエリア領域内かチェック
//	if(x<0 || _xLength <= x) return;
//	if(z<0 || _zLength <= z) return;
//
//	// すでに計算済みのCellかチェック
//	if((m-1) <= _resultMoveRangeList[z][x]) return;
//
//	m = m + _originalMapList[z][x];
//
//	if(m>0)
//	{
//		// 進んだ位置に現在の移動力を代入
//		_resultMoveRangeList[z][x] = m;
//		// 移動量があるのでSearch4を再帰呼びだし
//		Search4(x,z,m);
//	} 
//	else
//	{
//		m = 0;
//	}
//}

//十字架
OT_getCrossIndexArray = function(x, y, startRange, endRange, spread, isGetIndexData) {
	var array = [];

	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}

	//root.log('CrossStart:');
	for( var i=0 ; i<4 ; i++ )
	{
		Array.prototype.push.apply( array, OT_getLineIndexArray(x, y, startRange, endRange, i, spread, true) );
	}
	//root.log('CrossEnd:');

	if(isGetIndexData) {
		return unique(array);
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
//	return unique(array);
};

//一直線
OT_getLineIndexArray = function(x, y, startRange, endRange, direction, spread, isGetIndexData) {
	var array = [];
	var index = -1;
	var indexX = 0;
	var indexY = 0;

	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}
	
	//root.log('LineStart:');
	for( var j=0 ; j<spread ; j++ )
	{
		for( var i=startRange ; i<=endRange ; i++ )
		{
			switch(direction) {
				case DirectionType.LEFT:
					indexX = -i;
					indexY = -j;
					break;
	
				case DirectionType.TOP:
					indexX = -j;
					indexY = -i;
					break;
	
				case DirectionType.RIGHT:
					indexX = i;
					indexY = -j;
					break;
	
				case DirectionType.BOTTOM:
					indexX = -j;
					indexY = i;
					break;
			}
			array.push([indexX, indexY]);
			//root.log('x:'+ indexX + ' y:' + indexY);

			switch(direction) {
				case DirectionType.LEFT:
					indexX = -i;
					indexY = j;
					break;normalize
	
				case DirectionType.TOP:
					indexX = j;
					indexY = -i;
					break;
	
				case DirectionType.RIGHT:
					indexX = i;
					indexY = j;
					break;
	
				case DirectionType.BOTTOM:
					indexX = j;
					indexY = i;
					break;
			}
			array.push([indexX, indexY]);
			//root.log('x:'+ indexX + ' y:' + indexY);
		}
	}
	//root.log('LineEnd:');
	
	if(isGetIndexData) {
		return unique(array);
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
};

//×型
OT_getXCrossIndexArray = function(x, y, startRange, endRange, spread, isGetIndexData) {
	var array = [];
	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}

	for( var i=0 ; i<4 ; i++ )
	{
		Array.prototype.push.apply( array, OT_getDiagonalIndexArray(x, y, startRange, endRange, i, spread, true) );
	}
	
	if(isGetIndexData) {
		return array;
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
};

//斜め線
OT_getDiagonalIndexArray = function(x, y, startRange, endRange, direction, spread, isGetIndexData) {
	var array = [];
	var indexX = 0;
	var indexY = 0;
	
	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}
	for( var j=0 ; j<spread ; j++ )
	{
		var point1 = Math.floor( (1+j) / 2 );
		var point2 = Math.floor( (j) / 2 );
		for( var i=startRange ; i<=endRange ; i++ )
		{
			switch(direction) {
				//左上
				case DirectionType.LEFT:
					indexX = -i-point2;
					indexY = -i+point1;
					break;
	
				//右上
				case DirectionType.TOP:
					indexX = i-point1;
					indexY = -i-point2;
					break;
	
				//右下
				case DirectionType.RIGHT:
					indexX = i+point2;
					indexY = i-point1;
					break;
	
				//左下
				case DirectionType.BOTTOM:
					indexX = -i-point1;
					indexY = i+point2;
					break;
			}
			array.push([indexX, indexY]);

			switch(direction) {
				//左上
				case DirectionType.LEFT:
					indexX = -i+point1;
					indexY = -i-point2;
					break;
	
				//右上
				case DirectionType.TOP:
					indexX = i+point2;
					indexY = -i+point1;
					break;
	
				//右下
				case DirectionType.RIGHT:
					indexX = i-point1;
					indexY = i+point2;
					break;
	
				//左下
				case DirectionType.BOTTOM:
					indexX = -i-point2;
					indexY = i-point1;
					break;
			}
			
			array.push([indexX, indexY]);
		}
	}
	
	if(isGetIndexData) {
		return unique(array);
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
};

//＋×型
OT_getDoubleCrossIndexArray = function(x, y, startRange, endRange, spread, isGetIndexData) {
	var array = [];
	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}

	for( var i=0 ; i<4 ; i++ )
	{
		Array.prototype.push.apply( array, OT_getLineIndexArray(x, y, startRange, endRange, i, spread, true) );
		Array.prototype.push.apply( array, OT_getDiagonalIndexArray(x, y, startRange, endRange, i, spread, true) );
	}
	
	if(isGetIndexData) {
		return unique(array);
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
};

//ブレス型
OT_getBreathIndexArray = function(x, y, startRange, endRange, direction, spread, isGetIndexData) {
	var array = [];
	var index = -1;
	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}
	
	//root.log('BreathStart:');
	for( var i=startRange ; i<=endRange ; i++ )
	{
		var point = Math.floor( (i + spread - 1) / spread );

		switch(direction) {
			case DirectionType.LEFT:
				Array.prototype.push.apply( array, OT_getBreathLineIndexArray(x, y, -i, 0, 0, point, direction, 1, true) );
				break;

			case DirectionType.TOP:
				Array.prototype.push.apply( array, OT_getBreathLineIndexArray(x, y, 0, -i, 0, point, direction, 1, true) );
				break;

			case DirectionType.RIGHT:
				Array.prototype.push.apply( array, OT_getBreathLineIndexArray(x, y, i, 0, 0, point, direction, 1, true) );
				break;

			case DirectionType.BOTTOM:
				Array.prototype.push.apply( array, OT_getBreathLineIndexArray(x, y, 0, i, 0, point, direction, 1, true) );
				break;
		}
		
	}
	
	if(isGetIndexData) {
		return unique(array);
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
};

//ブレス型(斜め)
//OT_getDiagonalBreathIndexArray = function(x, y, startRange, endRange, direction, spread) {
//	var array = [];
//	var index = -1;
//	
//	for( var i=startRange ; i<=endRange ; i++ )
//	{
//
//		switch(direction) {
//			case DirectionType.LEFT:
//				Array.prototype.push.apply( array, OT_getLineIndexArray(x-i, y-i, 0, endRange-i*2, DirectionType.LEFT, 1 ) );
//				Array.prototype.push.apply( array, OT_getLineIndexArray(x-i, y-i, 0, endRange-i*2, DirectionType.TOP , 1 ) );
//				break;
//
//			case DirectionType.TOP:
//				Array.prototype.push.apply( array, OT_getLineIndexArray(x+i, y-i, 0, endRange-i*2, DirectionType.RIGHT, 1 ) );
//				Array.prototype.push.apply( array, OT_getLineIndexArray(x+i, y-i, 0, endRange-i*2, DirectionType.TOP  , 1 ) );
//				break;
//
//			case DirectionType.RIGHT:
//				Array.prototype.push.apply( array, OT_getLineIndexArray(x+i, y+i, 0, endRange-i*2, DirectionType.RIGHT  , 1 ) );
//				Array.prototype.push.apply( array, OT_getLineIndexArray(x+i, y+i, 0, endRange-i*2, DirectionType.BOTTOM , 1 ) );
//				break;
//
//			case DirectionType.BOTTOM:
//				Array.prototype.push.apply( array, OT_getLineIndexArray(x-i, y+i, 0, endRange-i*2, DirectionType.LEFT   , 1 ) );
//				Array.prototype.push.apply( array, OT_getLineIndexArray(x-i, y+i, 0, endRange-i*2, DirectionType.BOTTOM , 1 ) );
//				break;
//		}
//		
//	}
//	
//	return unique(array);
//};

//ブレス(全方位検索用)
OT_getAllBreathIndexArray = function(x, y, startRange, endRange, spread, isGetIndexData) {
	var array = [];
	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}

	Array.prototype.push.apply( array, OT_getBreathIndexArray( x, y, startRange, endRange, 0, spread, true ) );
	Array.prototype.push.apply( array, OT_getBreathIndexArray( x, y, startRange, endRange, 1, spread, true ) );
	Array.prototype.push.apply( array, OT_getBreathIndexArray( x, y, startRange, endRange, 2, spread, true ) );
	Array.prototype.push.apply( array, OT_getBreathIndexArray( x, y, startRange, endRange, 3, spread, true ) );
	
	if(isGetIndexData) {
		return array;
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
};

//横一文字
OT_getHorizontalLineIndexArray = function(x, y, startRange, endRange, direction, spread, isGetIndexData) {
	var array = [];
	var indexX = 0;
	var indexY = 0;
	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}
	
	for( var j=0 ; j<spread ; j++ )
	{
		for( var i=startRange ; i<=endRange ; i++ )
		{
			switch(direction) {
				case DirectionType.LEFT:
				case DirectionType.RIGHT:
					indexX = -j;
					indexY = -i;
					break;
	
				case DirectionType.TOP:
				case DirectionType.BOTTOM:
					indexX = -i;
					indexY = -j;
					break;
			}
			array.push([indexX, indexY]);

			switch(direction) {
				case DirectionType.LEFT:
				case DirectionType.RIGHT:
					indexX = j;
					indexY = -i;
					break;
	
				case DirectionType.TOP:
				case DirectionType.BOTTOM:
					indexX = -i;
					indexY = j;
					break;
			}
			array.push([indexX, indexY]);
	
			switch(direction) {
				case DirectionType.LEFT:
				case DirectionType.RIGHT:
					indexX = -j;
					indexY = i;
					break;
	
				case DirectionType.TOP:
				case DirectionType.BOTTOM:
					indexX = i;
					indexY = -j;
					break;
			}
			array.push([indexX, indexY]);
			
			switch(direction) {
				case DirectionType.LEFT:
				case DirectionType.RIGHT:
					indexX = j;
					indexY = i;
					break;
	
				case DirectionType.TOP:
				case DirectionType.BOTTOM:
					indexX = i;
					indexY = j;
					break;
			}
			array.push([indexX, indexY]);
		}
	}
	if(isGetIndexData) {
		return unique(array);
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
};

//ブレス用横一文字
OT_getBreathLineIndexArray = function(x, y, px, py, startRange, endRange, direction, spread, isGetIndexData) {
	var array = [];
	var indexX = 0;
	var indexY = 0;
	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}
	
	//root.log('start:');
	for( var j=0 ; j<spread ; j++ )
	{
		for( var i=startRange ; i<=endRange ; i++ )
		{
			switch(direction) {
				case DirectionType.LEFT:
				case DirectionType.RIGHT:
					indexX = px-j;
					indexY = py-i;
					break;
	
				case DirectionType.TOP:
				case DirectionType.BOTTOM:
					indexX = px-i;
					indexY = py-j;
					break;
			}
			array.push([indexX, indexY]);
			//root.log('x:'+indexX+ ' y:'+indexY);

			switch(direction) {
				case DirectionType.LEFT:
				case DirectionType.RIGHT:
					indexX = px+j;
					indexY = py-i;
					break;
	
				case DirectionType.TOP:
				case DirectionType.BOTTOM:
					indexX = px-i;
					indexY = py+j;
					break;
			}
			array.push([indexX, indexY]);
			//root.log('x:'+indexX+ ' y:'+indexY);
	
			switch(direction) {
				case DirectionType.LEFT:
				case DirectionType.RIGHT:
					indexX = px-j;
					indexY = py+i;
					break;
	
				case DirectionType.TOP:
				case DirectionType.BOTTOM:
					indexX = px+i;
					indexY = py-j;
					break;
			}
			array.push([indexX, indexY]);
			//root.log('x:'+indexX+ ' y:'+indexY);
			
			switch(direction) {
				case DirectionType.LEFT:
				case DirectionType.RIGHT:
					indexX = px+j;
					indexY = py+i;
					break;
	
				case DirectionType.TOP:
				case DirectionType.BOTTOM:
					indexX = px+i;
					indexY = py+j;
					break;
			}
			array.push([indexX, indexY]);
			//root.log('x:'+indexX+ ' y:'+indexY);
		}
	}
	if(isGetIndexData) {
		return unique(array);
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
};

//横一文字(斜め)
OT_getDiagonalHorizontalLineIndexArray = function(x, y, startRange, endRange, direction, spread, isGetIndexData) {
	var array = [];
	var indexX = 0;
	var indexY = 0;
	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}
	for( var j=0 ; j<spread ; j++ )
	{
		var point1 = Math.floor( (1+j) / 2 );
		var point2 = Math.floor( (j) / 2 );
		for( var i=startRange ; i<=endRange ; i++ )
		{
			switch(direction) {
				case DirectionType.LEFT:
				case DirectionType.RIGHT:
					indexX = i - point2;
					indexY = -i - point1;
					break;
	
				case DirectionType.TOP:
				case DirectionType.BOTTOM:
					indexX = - i - point1;
					indexY = - i + point2;
					break;
			}
			array.push([indexX, indexY]);

			switch(direction) {
				case DirectionType.LEFT:
				case DirectionType.RIGHT:
					indexX = i + point1;
					indexY =  - i + point2;
					break;
	
				case DirectionType.TOP:
				case DirectionType.BOTTOM:
					indexX = - i + point2;
					indexY = - i - point1;
					break;
			}
			array.push([indexX, indexY]);
	
			switch(direction) {
				case DirectionType.LEFT:
				case DirectionType.RIGHT:
					indexX = - i - point1;
					indexY = i - point2;
					break;
	
				case DirectionType.TOP:
				case DirectionType.BOTTOM:
					indexX = i + point1;
					indexY = i - point2;
					break;
			}
			array.push([indexX, indexY]);
			
			switch(direction) {
				case DirectionType.LEFT:
				case DirectionType.RIGHT:
					indexX = - i + point2;
					indexY = i + point1;
					break;
	
				case DirectionType.TOP:
				case DirectionType.BOTTOM:
					indexX = i - point2;
					indexY = i + point1;
					break;
			}
			array.push([indexX, indexY]);
		}
	}
	if(isGetIndexData) {
		return unique(array);
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
};

//四角
OT_getBoxIndexArray = function(x, y, startRange, endRange, isGetIndexData) {
	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}
	
	var array = [];
	var index = -1;
	var indexX = 0;
	var indexY = 0;
	var count = 1 + endRange*2;
	var ax = 0;
	var ay = 0;
	
	for( var i=-endRange ; i<=endRange ; i++ )
	{
		ax =  Math.abs( i );

		for( var j=-endRange ; j<=endRange ; j++ )
		{
			ay =  Math.abs( j );
			if( startRange > ax  && startRange > ay) continue;
			
			//index = CurrentMap.getIndex(x+i, y+j);
			indexX = i;
			indexY = j;
			//if(index != -1)
			//{
			//	array.push(index);
			//}
			array.push([indexX, indexY]);
		}
	}
	
	if(isGetIndexData) {
		return unique(array);
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
};

//検索用範囲作成
OT_getSearchRectIndexArray = function(x, y, startRange, moveLeft, moveRight, moveTop, moveBottom, isGetIndexData) {
	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}
	
	var array = [];
	var index = -1;
	var indexX = 0;
	var indexY = 0;
	var ax = 0;
	var ay = 0;
	
	for( var i=-moveLeft ; i<=moveRight ; i++ )
	{
		ax =  Math.abs( i );
		if( startRange > ax ) { 
			//root.log('i:' + i + ' NG');
			continue;
		}
		//root.log('i:' + i + ' startRange:' + startRange);

		for( var j=-moveTop ; j<=moveBottom ; j++ )
		{
			ay =  Math.abs( j );
			if( startRange > ay ) {
				//root.log('j:' + j + ' NG');
				continue;
			}
			//root.log('j:' + j + ' startRange:' + startRange);
			
			//index = CurrentMap.getIndex(x+i, y+j);
			indexX = i;
			indexY = j;
			//root.log('indexX:' + indexX + ' indexY:' + indexY);
			//if(index != -1)
			//{
			//	array.push(index);
			//}
			array.push([indexX, indexY]);
		}
	}
	
	if(isGetIndexData) {
		return unique(array);
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
};
//全体型
OT_getAllIndexArray = function(isGetIndexData) {
	var array = [];
	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}
	
	for( var j=0 ; j<CurrentMap.getHeight() ; j++ ) {
		for( var i=0 ; i<CurrentMap.getWidth() ; i++ ) {
			array.push([i, j]);
		}
	}
	
	if(isGetIndexData) {
		return unique(array);
	} else {
		return OT_getRangeIndexNormalize(0, 0, array);
	}
};

// 敵AI用インデックス作成
// 敵の現在位置から射程の予測範囲を作成
OT_GetPredictedRangeArray = function(x, y, mov, item) {
	var indexSearchNormal = false;
	var indexSearchBox = false;
	var indexArray = [];

	var endRange         = OT_getCustomItemRangeMax(item);
	var endEffectRange   = OT_getCustomItemEffectRangeMax(item);
	var rangeType        = OT_getCustomItemRangeType(item);
	var effectRangeType  = OT_getCustomItemEffectRangeType(item);
	var tmpStartRange    = 0;
	var tmpEndRange      = mov + endRange + endEffectRange;
	
	switch( rangeType ) {
		case OT_EffectRangeType.XCROSS:
			indexSearchBox = true;
			break;
			
		case OT_EffectRangeType.DOUBLECROSS:
			indexSearchNormal = true;
			indexSearchBox = true;
			break;

		default:
			indexSearchNormal = true;
			break;
	}
	
	switch( effectRangeType ) {
		case OT_EffectRangeType.XCROSS:
		case OT_EffectRangeType.DOUBLECROSS:
		case OT_EffectRangeType.LINE:
		case OT_EffectRangeType.BOX:
		case OT_EffectRangeType.BREATH:
		case OT_EffectRangeType.HORIZONTALLINE:
			indexSearchBox = true;
			break;
	}
	
	// 射程、範囲1で斜め1マスとなるものの場合は四角
	// それ以外は通常の範囲を予測範囲とする
	if(indexSearchBox) {
		indexArray = OT_getBoxIndexArray(x, y, tmpStartRange, tmpEndRange);
	} else {
		indexArray = IndexArray.getBestIndexArray(x, y, tmpStartRange, tmpEndRange);
	}
	
	return indexArray;
}

//----------------------------------------------------------
// 便利な関数群
//----------------------------------------------------------
// 配列の重複を削除
function unique(array) {
	var storage = {};
	var uniqueArray = [];
	var i,value;
	for ( i=0; i<array.length; i++) {
		value = array[i];
		if (!(value in storage))
		{
			storage[value] = true;
			uniqueArray.push(value);
		}
	}
	return uniqueArray;
};

//----------- デバッグ用 ----------
// コンソール出力
DebugPrint = function(msg) {
	//root.log(msg);
};

// 時間計測
checkTime = function(msg) {
	//root.log(msg + ' :' + (root.getElapsedTime() * 0.001));
	//root.watchTime();
};

})();

