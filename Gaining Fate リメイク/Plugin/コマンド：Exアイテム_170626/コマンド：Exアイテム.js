
/*--------------------------------------------------------------------------
  
　コマンド：Exアイテム

■概要
　ユニットコマンドにExアイテムというコマンドを追加します。
　Exアイテムコマンドは、１ユニットにつき１マップで１回だけ使える特殊アイテムを使う事が出来ます。
　※有効なのはアイテムだけです。杖や武器をExアイテムにしても使えません。

　カスタムスキルにキーワード'Ex-Item'をつけ、カスタムスキルにカスタムパラメータを設定する事で、一部ユニットだけ使用回数を変化させることも可能です。

■使い方
　１マップで１回だけ使える特殊アイテムについては、あらかじめ自作しておく必要があります。
　通常のようにアイテムを作成し、カスタムパラメータで{exItem:1}を設定することでExアイテムとして使用可能になります。
　なお、Exアイテムとしたアイテムは、アイテムコマンドでは使えません。

　Exアイテムを所持したユニットがユニットコマンドを開くと、Exアイテムのコマンドが表示されます。
　ただし、Exアイテムを1度使うとそのマップではExアイテムのコマンドは表示されません。

■カスタマイズ
　１．コマンド名を変えたい
　　　本ソースの設定にある、『var ExItemCommandName  = 'Exアイテム';』の中にある「Exアイテム」の部分を書き換えてください。
　　　（「Exアイテム」というダサいやつよりは「加護」や「アーティファクト」といったコマンド名の方がいいと思われ）

　２．アイテム情報で表示される(Exｱｲﾃﾑ)の表示を変えたい
　　　本ソースの設定にある、『var ItemInfoExItemText  = '(Exｱｲﾃﾑ)';』の中にある「(Exｱｲﾃﾑ)」の部分を書き換えてください。

　３．Exアイテムコマンドの登録位置を変えたい
　　　本ソースの設定にある、『var EXITEMCOMMAND_INDEX = 5;』の数値部分を書き換えてください。
　　　一番上なら0、上から2番目なら1…と設定します。
　　　※他にユニットコマンドを増やすプラグインが入っている時は位置がずれる場合がありますので、その場合は逐次値を変えて調整してください。

　　　　なお、登録位置を上からn番目ではなく下からn番目にしたい場合、本ソースのUnitCommand.configureCommands()内にある
　　　　		groupArray.insertObject(UnitCommand.ExItem, ex_item_command_index);
　　　　　　　　の先頭に//をつけてコメントとし、

　　　　//		groupArray.insertObject(UnitCommand.ExItem, groupArray.length - ex_item_command_index);
　　　　　　　　の先頭にある//を消して有効にしてください。

　４．Exアイテムコマンドの使用回数を変えたい（自軍ユニット全てで共通）
　　　本ソースの設定にある、『var ExItemUseCount     = 1;』の数値部分を書き換えてください。
　　　（2にすれば、自軍ユニットは2回Exコマンドを使えます）

　５．自軍の一部のユニットだけExアイテムコマンドを使えるようにしたい
　　　本ソースの設定にある、『var ExItemUseCount     = 1;』の数値部分を0に書き換えてください。
　　　その上でカスタムスキルにキーワード'Ex-Item'をつけ、カスタムスキルのカスタムパラメータに{ExItemMax:XX}(XXは使用回数)をつけてください。

　　　※var ExItemUseCount = 1;のままとし、カスタムスキルのカスタムパラメータを{ExItemMax:2}とすれば、
　　　　自軍ユニットは基本1回使用可能で、カスタムスキルを所持しているユニットだけ2回使用出来ます。

　　　　またカスタムスキルを2つ作成し、片方には{ExItemMax:0}もう片方には{ExItemMax:2}とすれば、
　　　　{ExItemMax:2}のカスタムスキルを持つユニットは2回、
　　　　{ExItemMax:0}のカスタムスキルを持つユニットは0回、Exアイテムを使えます。
　　　　（{ExItemMax:2}のカスタムスキルと{ExItemMax:0}のカスタムスキルを1体のユニットに持たせた場合、数字の大きい方が有効(この場合は2回)になります）



16/07/27  新規作成
17/06/26  1.135対応


■対応バージョン
　SRPG Studio Version:1.135


■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/


(function() {



//-------------------------------------------------------
// 設定
//-------------------------------------------------------
var ExItemCommandName   = '奥義';		// ユニットコマンドに表示されるコマンド名

var ExItemUseCount      = 1;				// １マップにおけるExアイテムコマンドの基本使用回数（一部ユニットだけ使用回数を変える時はカスタムスキルを作ってください）

var ExItemSkillKeyWord  = 'Ex-Item';		// Exアイテムコマンドの使用回数を変えたカスタムスキルのキーワード

var EXITEMCOMMAND_INDEX = 2;				// Exアイテムコマンドの登録位置（上からn番目）

var ItemInfoExItemText  = '(奥義)';		// アイテム情報でExアイテムの場合に表示されるテキスト



//-------------------------------------------------------
// 以下、プログラム
//-------------------------------------------------------

//----------------------------------
// UnitCommandクラス
//----------------------------------
var alias1 = UnitCommand.configureCommands;
UnitCommand.configureCommands= function(groupArray) {
		alias1.call(this, groupArray);

		var ex_item_command_index = EXITEMCOMMAND_INDEX;
		if( ex_item_command_index > groupArray.length ) {
			ex_item_command_index = groupArray.length;
		}

		// 下からn番目に登録する、に変える場合はこちらをコメントにしてください
		// コマンドの上からn番目に登録する
		groupArray.insertObject(UnitCommand.ExItem, ex_item_command_index);

		// 下からn番目に登録する、に変える場合はこちらのコメントを外してください
		// コマンドの下からn番目に登録する
//		groupArray.insertObject(UnitCommand.ExItem, groupArray.length - ex_item_command_index);
}




//----------------------------------
// ExItemControlクラス（新規作成）
//----------------------------------
var ExItemControl = {
	isMaxUse:function(unit) {
		var count = this.getUseCount(unit);
		var max   = this.getMaxCount(unit);

		return count >= max;
	},
	
	InclementUseCount: function(unit) {
		var count = this.getUseCount(unit);
		
		if( count < this.getMaxCount(unit) ) {
			count++;
			this.setUseCount(unit, count);
		}
	},
	
	getUseCount:function(unit) {
		if( typeof unit.custom.ExItemCount !== 'number' ) {
			unit.custom.ExItemCount = 0;
		}
		
		return unit.custom.ExItemCount;
	},
	
	setUseCount:function(unit, count) {
		unit.custom.ExItemCount = count;
	},
	
	getMaxCount:function(unit) {
		var max = ExItemUseCount;
		var skill = this.getPossessionExItemSkill(unit, ExItemSkillKeyWord);

		if( skill ) {
			max = skill.custom.ExItemMax;
		}
		return max;
	},
	
	getPossessionExItemSkill: function(unit, keyword) {
		var arr = SkillControl.getDirectSkillArray(unit, SkillType.CUSTOM, keyword);
		
		return this._returnExItemSkill(arr);
	},
	
	_returnExItemSkill: function(arr) {
		var i;
		var count = arr.length;
		var max = -1000;
		var index = -1;
		
		// 同種スキルが複数存在する場合は、発動率が高いスキルを優先する
		for (i = 0; i < count; i++) {
			if (typeof arr[i].skill.custom.ExItemMax === 'number') {
				if (arr[i].skill.custom.ExItemMax > max) {
					max = arr[i].skill.custom.ExItemMax;
					index = i;
				}
			}
		}
		
		if (index === -1) {
			return null;
		}
		
		return arr[index].skill;
	}
};




//----------------------------------
// BaseTurnLogoFlowEntryクラス
//----------------------------------
var alias2 = BaseTurnLogoFlowEntry.doMainAction;
BaseTurnLogoFlowEntry.doMainAction= function(isMusic) {
		var i;
		var list;
		var count;

		// マップ開始時に自軍ユニットのExアイテム使用回数を初期化する
		if (root.getCurrentSession().getTurnType() === TurnType.PLAYER && root.getCurrentSession().getTurnCount() == 0) {
			list  = PlayerList.getSortieList();
			count = list.getCount();

			for (i = 0; i < count; i++) {
				unit = list.getData(i);

				ExItemControl.setUseCount(unit, 0);
			}
		}
		
		alias2.call(this, isMusic);
}




//----------------------------------
// UnitProviderクラス
//----------------------------------
var alias3 = UnitProvider.setupFirstUnit;
UnitProvider.setupFirstUnit= function(unit) {
		alias3.call(this, unit);

		// 登場した自軍ユニットはExアイテム使用回数を0にする
		if( unit.getUnitType() == UnitType.PLAYER ) {
			ExItemControl.setUseCount(unit, 0);
		}
}




//----------------------------------
// UnitCommand.ExItemクラス（UnitCommand.Itemの派生）
//----------------------------------
UnitCommand.ExItem = defineObject(UnitCommand.Item,
{
	// EXアイテムコマンドの表示可否判定
	isCommandDisplayable: function() {
		var unit = this.getCommandTarget();

		// Exアイテムを所持していなければEXアイテムコマンドの表示不可
		if( UnitItemControl.getPossessionExItemCount(unit) <= 0 ) {
			return false;
		}
		
		// Exアイテムの使用回数が上限に達していればEXアイテムコマンドの表示不可
		if( ExItemControl.isMaxUse(unit) ) {
			return false;
		}
		
		return true
	},
	
	getCommandName: function() {
		return ExItemCommandName;
	},
	
	_prepareCommandMemberData: function() {
		this._itemUse = null;
		this._itemSelection = null;
		this._itemSelectMenu = createObject(ItemSelectMenuForExItem);
	},
	
	// EXアイテム使用時の処理
	_moveUse: function() {
		if (this._itemUse.moveUseCycle() !== MoveResult.CONTINUE) {
			// 使用回数を保存
			ExItemControl.InclementUseCount(this.getCommandTarget());

			this.endCommandAction();
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	}
}
);




//----------------------------------
// ItemSelectMenuクラス
//----------------------------------
var alias4 = ItemSelectMenu._isItemUsable;
ItemSelectMenu._isItemUsable= function(item) {
		// コマンド：アイテム２で使用するアイテムは、通常のアイテム使用が出来ない
		if( ItemControl.isExItem(item) ) {
			return false;
		}
		
		return alias4.call(this, item);
}




//----------------------------------
// ItemSelectMenuForExItemクラス（ItemSelectMenuの派生）
//----------------------------------
var ItemSelectMenuForExItem = defineObject(ItemSelectMenu,
{
	setMenuTarget: function(unit) {
		this._unit = unit;
		
		this._itemListWindow = createWindowObject(ItemListWindow, this);
		this._itemInfoWindow = createWindowObject(ItemInfoWindow, this);
		this._itemWorkWindow = createWindowObject(ItemWorkWindow, this);
		this._discardManager = createObject(DiscardManager);
		
		this._itemWorkWindow.setupItemWorkWindow();
		
		this._resetExItemList();
		
		this._processMode(ItemSelectMenuMode.ITEMSELECT);
	},
	
	_moveDiscard: function() {
		var discardResult = this._discardManager.moveWindowManager();
		var result = ItemSelectMenuResult.NONE;
		
		if (discardResult === DiscardWindowResult.DISCARD) {
			this._discardItem();
			if (UnitItemControl.getPossessionExItemCount(this._unit) === 0) {
				ItemControl.updatePossessionItem(this._unit);
				result = ItemSelectMenuResult.CANCEL;
			}
			else {
				this._processMode(ItemSelectMenuMode.ITEMSELECT);
			}
		}
		else if (discardResult === DiscardWindowResult.CANCEL) {
			this._processMode(ItemSelectMenuMode.ITEMSELECT);
		}
		
		return result;
	},
	
	_discardItem: function() {
		var index = this._itemListWindow.getItemIndex();
		
		UnitItemControl.cutItem(this._unit, index);
		
		this._resetExItemList();
		
		this._isDiscardAction = true;
	},
	
	_doWorkAction: function(index) {
		var item = this._itemListWindow.getCurrentItem();
		var result = ItemSelectMenuResult.NONE;
		
		if (item.isWeapon()) {
			if (index === 0) {
				ItemControl.setEquippedWeapon(this._unit, item);
				this._resetExItemList();
				this._processMode(ItemSelectMenuMode.ITEMSELECT);
			}
			else if (index === 1) {
				this._processMode(ItemSelectMenuMode.DISCARD);
			}
		}
		else {
			if (index === 0) {
				result = ItemSelectMenuResult.USE;
			}
			else if (index === 1) {
				this._processMode(ItemSelectMenuMode.DISCARD);
			}
		}
		
		return result;
	},
	
	_isItemUsable: function(item) {
		var obj;
		
		if (!ItemControl.isItemUsable(this._unit, item)) {
			return false;
		}
		
		obj = ItemPackageControl.getItemAvailabilityObject(item);
		if (obj === null) {
			return false;
		}
		
		return obj.isItemAvailableCondition(this._unit, item);
	},
	
	_resetExItemList: function() {
		// unitが所持しているアイテム２の数を返す
		var count = UnitItemControl.getPossessionExItemCount(this._unit);
		var visibleCount = 8;
		
		if (count > visibleCount) {
			count = visibleCount;
		}
		
		this._itemListWindow.setItemFormation(count);
		this._itemListWindow.setUnitExItemFormation(this._unit);
	}
}
);




//----------------------------------
// ItemSentence.Infoクラス
//----------------------------------
var alias5 = ItemSentence.Info.drawItemSentence;
ItemSentence.Info.drawItemSentence= function(x, y, item) {
		alias5.call(this, x, y, item);

		// Exアイテムなら、アイテム詳細の「○○アイテム」の後方に(Exｱｲﾃﾑ)を表示
		// （アイテムの種類が違っても、描画位置は同じ…）
		if( ItemControl.isExItem(item) ) {
			ItemInfoRenderer.drawKeyword(x+156, y, ItemInfoExItemText);
		}
}




//----------------------------------
// ItemListWindowクラス
//----------------------------------
// Exアイテムをアイテムリストにセット
ItemListWindow.setUnitExItemFormation= function(unit) {
		this._scrollbar.setUnitExItemFormation(unit);
}




//----------------------------------
// ItemListScrollbarクラス
//----------------------------------
// Exアイテムをアイテムリストにセット
ItemListScrollbar.setUnitExItemFormation= function(unit) {
		var i, item;
		var maxCount = DataConfig.getMaxUnitItemCount();
		
		this._unit = unit;
		
		this.resetScrollData();
		
		for (i = 0; i < maxCount; i++) {
			item = UnitItemControl.getItem(unit, i);
			if ( ItemControl.isExItem(item) ) {
				this.objectSet(item);
			}
		}
		
		this.objectSetEnd();
		
		this.resetAvailableData();
}




//----------------------------------
// UnitItemControlクラス
//----------------------------------
// unitが所持しているExアイテムの数を返す
UnitItemControl.getPossessionExItemCount= function(unit) {
		var i;
		var count = DataConfig.getMaxUnitItemCount();
		var bringCount = 0;
		var item;
		
		for (i = 0; i < count; i++) {
			item = unit.getItem(i);
			if ( ItemControl.isExItem(item) ) {
				bringCount++;
			}
		}
		
		return bringCount;
}




//----------------------------------
// ItemControlクラス
//----------------------------------
// Exアイテムかどうかの判定
ItemControl.isExItem=function(item) {
		if( item == null ) {
			return false;
		}

		// 杖と武器はExアイテムに含めない
		if( item.isWand() || item.isWeapon() ) {
			return false;
		}

		if( typeof item.custom.exItem !== 'number' ) {
			return false;
		}

		if( item.custom.exItem == 0 ) {
			return false;
		}

		return true;
}


})();