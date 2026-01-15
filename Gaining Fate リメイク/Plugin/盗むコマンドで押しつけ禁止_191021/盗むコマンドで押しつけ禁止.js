
/*--------------------------------------------------------------------------
  
　盗むコマンドで押しつけ禁止

■概要
　盗むコマンドを使う場合に、対象へ何らかの品を押し付ける事が出来なくなります。
　盗みは出来るけど、相手に何かを渡して延々盗みを繰り返すのは嫌だという時にでも

修正内容
19/10/21　新規作成


■対応バージョン
　SRPG Studio Version:1.206


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


var alias01 = UnitItemStealScreen._isTradable;
UnitItemStealScreen._isTradable = function() {
		
		// 盗む条件を既に満たしていなければそのまま終了
		var result = alias01.call(this);
		if( result == false )
		{
			return false;
		}
		
		// 盗む側の、カーソルが指定するアイテムを取り出す
		var item = this._getSelectedItem(this._itemListSrc);
		
		// 盗む側がアイテムを指定していた場合はNG（=盗む側からアイテムを送り込もうとしている）
		if( item !== null ) {
			return false;
		}
		
		return true;
};


})();