
/*--------------------------------------------------------------------------
  
　盗むコマンドで、装備品が盗めなくなるスクリプト

■概要
　盗むコマンドを使う場合に、対象が現在装備している武器を盗めなくなります。
　武器も盗めるようにしておきたいけど、ボスが武器を盗まれてフルボッコは避けたい…なんていう場合に使ってください

　装備品が盗めてしまうという報告がありました為、判定の強化とコンソールへのログ出力を追加しました
　（装備品を盗もうとした、などの情報がコンソールに出力されます）
　テストプレイ時はデバッグ→コンソールの表示をONとしておくことを推奨します

修正内容
15/10/1　新規作成
15/11/17 1.040対応
18/04/15 装備品の盗みに関して判定強化＆デバッグコンソールにログを強化
18/04/15b 盗む際にカーソルを、敵側で装備品選択→自軍ユニットで敵装備品と違う位置にある品、とすると装備が盗めるバグを修正


■対応バージョン
　SRPG Studio Version:1.181


■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/

(function () {


var alias1 = UnitItemStealScreen._isTradable;
UnitItemStealScreen._isTradable = function() {
		var item, unit, index;

		// 盗む条件を既に満たしていなければそのまま終了
		var result = alias1.call(this);
		if( result == false )
		{
			return false;
		}

		var unitSrc = this._getTargetUnit(this._isSrcSelect);
		var unitDest = this._getTargetUnit(this._isSrcScrollbarActive);
		var srcIndex = this._selectIndex;
		var destIndex = this._getTargetIndex();
		var itemSrc = unitSrc.getItem(srcIndex);
		var itemDest = unitDest.getItem(destIndex);

		unit = this._unitDest;
		// カーソル元が盗む対象ユニットなら、カーソル元が指定するアイテムと位置を取り出す
		if( unit == unitSrc ) {
			item = itemSrc;
			index = srcIndex;
		}
		// カーソル先が盗む対象ユニットなら、カーソル先が指定するアイテムと位置を取り出す
		else{
			item = itemDest;
			index = destIndex;
		}

		// 盗もうとしたアイテムが装備品の場合、盗めないのでfalseを返す
		if( UnitItemControl.isEquippedItem(unit, item, index) ) {
			return false;
		}
		return true;
};


// 指定アイテムが装備品かチェック
UnitItemControl.isEquippedItem= function(unit, targetItem, index) {
		var i, weapon, count, weaponIndex;
		
		if (unit === null) {
			return false;
		}
		
		if (targetItem === null) {
			return false;
		}
		
		root.log('盗み対象品:'+targetItem.getName());
		
		weapon = ItemControl.getEquippedWeapon(unit);
		if (weapon == null) {
			return false;
		}

		// targetItemをunitが装備しているかを調べる
		if (weapon === targetItem) {
			root.log('装備を盗もうとしました');
			return true;
		}

		weaponIndex = ItemControl.getEquippedWeaponIndexForSteal(unit);
		root.log('装備位置:'+weaponIndex+' 盗み位置:'+index);

		if (weaponIndex != -1 && index === weaponIndex ) {
			root.log('装備を盗もうとしました(位置判定)');
			return true;
		}

		root.log('装備品では無い為、盗めます');

		return false;
}


// ユニットの装備武器のインデックスを返す
ItemControl.getEquippedWeaponIndexForSteal= function(unit) {
		var i, item, count;
		
		if (unit === null) {
			return null;
		}
		
		count = UnitItemControl.getPossessionItemCount(unit);
		
		// 装備している武器とは、アイテム欄の中で先頭の武器
		for (i = 0; i < count; i++) {
			item = UnitItemControl.getItem(unit, i);
			if (item !== null && this.isWeaponAvailable(unit, item)) {
				// 装備している武器のインデックスを返す
				return i;
			}
		}
		
		// 装備武器なしなら-1を返す
		return -1;
}


})();