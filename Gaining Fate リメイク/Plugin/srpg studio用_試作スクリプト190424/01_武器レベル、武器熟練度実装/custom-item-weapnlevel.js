
/*--------------------------------------------------------------------------
  
  ユニットのアイテム情報に「武器レベル」「武器経験値」という項目を追加します。
  
  使用方法:
  custom-unit-jyukurendo, edit_weapontype-caseと併用して下さい。
  
  武器のカスタムパラメータに{wlv: 6, wexp: 1, wtype: 0}のように設定します。
  {wlv: 6}   武器レベルが6の意味。ユニットの武器熟練度がこの武器レベルを上回る場合に、武器が装備できます。
             ※デフォルトでは{wlv: 1}で設定してあります。
  {wexp: 1}  武器経験値が1の意味。戦闘後に武器経験値*攻撃回数の武器経験値をユニットが取得します。
  {wtype: 0} 武器タイプが0の意味。剣なら0、斧なら1という風に武器タイプ毎に違う値を定義してください。
             ※現状では0(剣),1(槍),2(斧),3(弓),4(魔法)のみ定義しています。
             ※wtypeを設定しない場合、ユニットの武器熟練度を1として判定を行います。
             (デフォルトでは武器レベルが1に設定されるので、カスタムパラメータwlvを渡していない武器は装備可能な状態)
  
  道具に熟練度ボーナスを付加する事も可能です。
  例）斧使いの証という使用不可アイテムを作成し、カスタムパラメータに{axe:10}と設定すると、
      斧使いの証を所持しているユニットの熟練度合計は、ユニットの熟練度＋武器による熟練度補正＋斧使いの証による補正(10)となります。
      なお、一種類の道具による熟練度補正は一度だけです。斧使いの証を2つ所持しても補正は10+10=20とはならず、10のままです。
  
  作成者: CB
  
  更新履歴:
  2015/07/04 新規作成
  2015/07/06 杖の熟練度実装に対応
  2015/08/09 熟練度のクラス上限値に対応
  2015/12/21 所持アイテムに付加された武器熟練度補正値が加算されていなかった為修正（作者じゃないけど）
  2018/12/01 「00_武器タイプ：杖を増やす.js」との併用に対応（作者じゃないけど）
  2019/04/24 説明文を修正
  
--------------------------------------------------------------------------*/

(function() {

var alias2 = ItemControl.isWeaponAvailable;
ItemControl.isWeaponAvailable = function(unit, item) {
	var i, count, n, id, unitWlv, weaponWlv, classBns, itemBns, unitBns, max, totalWlv, weaponType;
	var d = 0;
	var arr = [];
	var weapon = item;
	var weaponType = weapon.custom.wtype;
	var result = alias2.call(this, unit, weapon);
	
	if (!result) {
		// 装備できないため続行しない
		return false;
	}
	
	//武器タイプによって、参照する熟練度を変更する
	classBns = ItemControl.getClassBonus(weaponType, unit);
	itemBns  = ItemControl.getItemBonus(weaponType, item);
	unitBns  = ItemControl.getUnitBonus(weaponType, unit);
	max = AbilityCalculator.getJyukurendoMax(weaponType, unit);
	
	if (typeof classBns === 'number') {
		// クラスの熟練度ボーナスを加算
		d = classBns;
	}
	if (typeof itemBns === 'number') {
		d += itemBns;
	}
	
	// 武器以外の所持アイテムに付加された熟練度ボーナスを加算する
	count = UnitItemControl.getPossessionItemCount(unit);
	for (i = 0; i < count; i++) {
		item = UnitItemControl.getItem(unit, i);
		if (item !== null && !item.isWeapon()) {
			id = item.getId();
			if (arr.indexOf(id) !== -1) {
				// 同一種類の道具による熟練度ボーナス加算は一度だけとする
				continue;
			}
			arr.push(id);
			
			itemBns  = ItemControl.getItemBonus(weaponType, item);
			if (typeof itemBns === 'number') {
				n = itemBns;
			}
			else {
				n = 0;
			}
			
			// ItemControl.isItemUsableを呼び出すことで、
			// 使用が許可されていないユニットに対しての補正は無効にしている。
			if (n !== 0 && ItemControl.isItemUsable(unit, item)) {
				// アイテムの熟練度ボーナスを加算
				d += n;
			}
		}
	}
	arr = [];	// 配列を解放
	
	if (typeof unitBns === 'number') {
		unitWlv = unitBns;
	}
	else {
		unitWlv = 1;
	}
	
	if (typeof weapon.custom.wlv === 'number') {
		weaponWlv = weapon.custom.wlv;
	}
	else {
		weaponWlv = 1;
	}
	
	totalWlv =  unitWlv + d;
	//熟練度の合計がクラスの上限値を上回っている場合、熟練度にクラスの上限値を代入
	if (totalWlv > max) {
		totalWlv = max;
	}
	
	// 武器を装備できるのは、ユニットの熟練度が武器レベルを上回っていることが条件とする
	return totalWlv >= weaponWlv;
};

var WeaponTypeName = defineObject(BaseObject,
{
	getWeapnTypeName: function(item) {
		var name = item.getWeaponType().getName();
		return name;
	}
}
);


var alias3 = ItemInfoWindow._configureWeapon;
ItemInfoWindow._configureWeapon = function(groupArray) {
	alias3.call(this, groupArray);
	groupArray.insertObject(ItemSentence.WeaponLevel, 2);
};

ItemSentence.WeaponLevel = defineObject(BaseItemSentence,
{
	//武器(杖)のヘルプウインドウに武器LVを表示
	drawItemSentence: function(x, y, item) {
		var wlv = 1;
		var textui = root.queryTextUI('default_window');
		var color = textui.getColor();
		var font = textui.getFont();
		var length = 100;
		
		if (typeof item.custom.wlv === 'number') {
			wlv = item.custom.wlv;
		}
		
		var isWand = item.isWand();
		if( typeof isWandTypeExtra !== 'undefined' ) {
			isWand = WandChecker.isWand(item);
		}
		
		if(isWand) {
			// 杖の場合、パラメータ名を'杖'に(杖の熟練度を実装していない場合、意味を成さない)
			text = '杖';
		} else {
			text = item.getWeaponType().getName();
		}
		
		ItemInfoRenderer.drawKeyword(x, y, text);
		x += ItemInfoRenderer.getSpaceX();
		TextRenderer.drawText(x, y + 5, this.replaceWeaponLevel(wlv), length, color, font);
	},
	
	getItemSentenceCount: function(item) {
		return 1;
	}
}
);

//  ↓武器経験値可視化用
//	var alias4 = ItemInfoWindow._configureWeapon;
//	ItemInfoWindow._configureWeapon = function(groupArray) {
//		alias4.call(this, groupArray);
//		groupArray.insertObject(ItemSentence.WeaponExp, 3);
//	};

ItemSentence.WeaponExp = defineObject(BaseItemSentence,
{
//  ↓武器経験値可視化用
//	drawItemSentence: function(x, y, item) {
//		var wexp = 1;
//		var text = this._getText();
//		
//		if (typeof item.custom.wexp === 'number') {
//			wexp = item.custom.wexp;
//		}
//		
//		ItemInfoRenderer.drawKeyword(x, y, text);
//		x += ItemInfoRenderer.getSpaceX();
//		NumberRenderer.drawRightNumber(x, y, wexp);
//	},
//	
//	getItemSentenceCount: function(item) {
//		return 1;
//	},
//	
//	_getText: function() {
//		return '武器EX';
//	}
}
);

})();
