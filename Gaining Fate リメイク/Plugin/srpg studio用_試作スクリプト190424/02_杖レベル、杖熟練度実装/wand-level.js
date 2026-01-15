
/*--------------------------------------------------------------------------
  
  杖の武器レベル、武器経験値、熟練度を実装します。
  
  使用方法:
  custom-unit-jyukurendo、custom-item-weapnlevelと併用して下さい。
  
  杖のカスタムパラメータに{wlv: 6, wexp: 1}のように設定します。
  {wlv: 6}   武器レベルが6の意味。ユニットの武器熟練度がこの武器レベルを上回る場合に、武器が装備できます。
             ※デフォルトでは{wlv: 1}で設定してあります。
  {wexp: 1}  武器経験値が1の意味。戦闘後に武器経験値*攻撃回数の武器経験値をユニットが取得します。
  
  ユニットのカスタムパラメータに{wand: 71, wandGrowthBonus: 80}のように設定します。
  (杖熟練度の初期値が71、成長値が80%の意味)
  
  杖熟練度ボーナスを持たせたいクラスのカスタムパラメータに{wand: 31, wandMax:121}のように設定します。
  {wand: 1}  ユニットがこのクラスに属している場合に、杖熟練度が+31されます。
  {wandMax: 121}  ユニットがこのクラスに属している場合、杖熟練度の上限値が121になります(設定なしの場合251)。
  
  ほぼ全てにおいて武器と同じ仕様(custom-item-weapnlevel参照)ですが、杖の場合はwtypeを設定する必要はありません。
  
  杖の使用時、杖の武器経験値をユニットの杖熟練度に加算します。
  
  作成者: CB
  
  更新履歴:
  2015/07/06 新規作成
  2015/08/09 熟練度のクラス上限値に対応
  2015/10/05 封印のステート処理に対応出来ていなかった部分を修正（作者じゃないけど）
  2015/12/25 武器熟練度Lvアップ表示処理対応に伴い、処理修正（作者じゃないけど）
  2016/01/11 1.048対応（作者じゃないけど）
  2016/07/26 1.085対応（作者じゃないけど）
  2016/09/24 1.094対応（作者じゃないけど）
  2018/12/01 「00_武器タイプ：杖を増やす.js」との併用に対応（作者じゃないけど）
  2019/04/24 説明文を修正
  
--------------------------------------------------------------------------*/

(function() {

//杖熟練度の作成
// 既存の数値と一致しない値に設定
ParamType.WAND = 9999;

UnitParameter.WAND = defineObject(BaseUnitParameter,
{
	getParameterType: function() {
		return ParamType.WAND;
	},
	
	isParameterDisplayable: function(unitStatusType) {
		return false;
	},
	
	getUnitValue: function(unit) {
		var wand;
		
		if (typeof unit.custom.wand === 'number') {
			wand = unit.custom.wand;
		}
		else {
			wand = 1;
		}
		
		return wand;
	},
	
	setUnitValue: function(unit, value) {
		unit.custom.wand = value;
	},
	
	getParameterBonus: function(obj) {
		var wand;
		
		if (typeof obj.custom.wand === 'number') {
			wand = obj.custom.wand;
		}
		else {
			wand = 0;
		}
		
		return wand;
	},
	
	getGrowthBonus: function(obj) {
		var wand;
		
		if (typeof obj.custom.wandGrowthBonus === 'number') {
			wand = obj.custom.wandGrowthBonus;
		}
		else {
			wand = 0;
		}
		
		return wand;
	},
	
	getDopingParameter: function(obj) {
		var wand;
		
		if (typeof obj.custom !== 'object') {
			return 0;
		}
		
		if (typeof obj.custom.wandDoping === 'number') {
			wand = obj.custom.wandDoping;
		}
		else {
			wand = 0;
		}
		
		return wand;
	},
	
	getAssistValue: function(obj) {
		return 0;
	},
	
	getMaxValue: function(unit) {
		var wandMax;
		
		if (DataConfig.isClassLimitEnabled()) {
			if (typeof unit.getClass().custom.wandMax === 'number') {
				wandMax = unit.getClass().custom.wandMax;
			}
			else {
				wandMax = 251;
			}
		}
		else {
			if (typeof root.getMetaSession().global.wandMax === 'number') {
				wandMax = root.getMetaSession().global.wandMax;
			}
			else {
				wandMax = 251;
			}
		}
		
		return wandMax;
	},
	
	getMinValue: function(unit) {
		return 0;
	},
	
	getParameterName: function() {
		return '杖';
	}
}
);

// 作成した杖熟練度をユニットパラメータに追加
var alias1 = ParamGroup._configureUnitParameters;
ParamGroup._configureUnitParameters = function(groupArray) {
	alias1.call(this, groupArray);
	groupArray.insertObject(UnitParameter.WAND, 99);
};

// アイテムのヘルプウインドウに表示する情報を設定
var alias3 = ItemInfoWindow._configureItem;
ItemInfoWindow._configureItem = function(groupArray) {
	alias3.call(this, groupArray);
	
	var isWand = this._item.isWand();
	
	// 武器タイプ追加の場合
	if( typeof isWandTypeExtra !== 'undefined' ) {
		isWand = WandChecker.isWand(this._item);
	}
	
	if(isWand) {
		groupArray.appendObject(ItemSentence.WeaponLevel);
		groupArray.appendObject(ItemSentence.WeaponExp);
	}
};


// アイテムの使用可否
var alias2 = ItemControl.isItemUsable;
ItemControl.isItemUsable = function(unit, item) {

	// ここまでのItemControl.isItemUsable()処理（オリジナルの判定処理など）を呼び出す
	var result = alias2.call(this, unit, item);

	// falseの場合ここまでの処理で使用不可の結果が出ているので、falseを返して終了
	if( result == false ) {
		return false;
	}

	// 以降、杖レベルによる使用可否判定を実施
	// （杖を使用出来るクラスか？といった標準の判定はalias2.call実施時にオリジナルで判定されている筈なので、以降では省略している）

	var wand = UnitParameter.WAND;
	// 杖の場合はクラスのカスタムパラメータのみを使用
	var unitwand = unit.getClass().custom.wand || 0;
	var unitwandMax = wand.getMaxValue(unit);
	var wlv = 1;
	
	// ↓2015/8/9追加
	//熟練度の合計がクラスの上限値を上回っている場合、熟練度にクラスの上限値を代入
	if(unitwand > unitwandMax) {
		unitwand = unitwandMax;
	}
	
	if(typeof item.custom.wlv === 'number') {
		wlv = item.custom.wlv;
	}
	
	var isWand = item.isWand();
	// 武器タイプ追加の場合
	if( typeof isWandTypeExtra !== 'undefined' ) {
		isWand = WandChecker.isWand(item);
	}
	
	if (isWand) {
		// 杖を使用できるのは、ユニットの熟練度が杖の武器レベルを上回っていることが条件とする
		if (unitwand < wlv) {
			return false;
		}
	}
	
	return true;
};


// 杖使用時の処理
var alias4 = ItemExpFlowEntry._completeMemberData;
ItemExpFlowEntry._completeMemberData = function(itemUseParent) {
	var result = alias4.call(this, itemUseParent);

	var itemTargetInfo = itemUseParent.getItemTargetInfo();
	var wexp = 1;

	var isWand = itemTargetInfo.item.isWand();
	// 武器タイプ追加の場合
	if( typeof isWandTypeExtra !== 'undefined' ) {
		isWand = WandChecker.isWand(itemTargetInfo.item);
	}
	
	// ↓杖の武器経験値を加算する処理
	if (isWand) {
		// 武器熟練度加算前のデータを退避
		itemTargetInfo._unitPlayerOldArr = [];
		itemTargetInfo._unitPlayerOldArr = ParamGroup.getParamJukurendoArray(itemTargetInfo.unit);

		// 武器熟練度加算前の自軍ユニットを退避
		if(typeof itemTargetInfo.item.custom.wexp === 'number') {
			wexp = itemTargetInfo.item.custom.wexp;
		}
		UnitParameter.WAND.setUnitValue(itemTargetInfo.unit, wexp + UnitParameter.WAND.getUnitValue(itemTargetInfo.unit));
	}
	// ↑杖の武器経験値を加算する処理
	
	return result;
};


})();