/*--------------------------------------------------------------------------
  
　各種コマンド色変え

■概要
　コマンド名の戦闘に\C[0]のように色変え用の文字を入れておくと
　コマンドの色が変わります。

　現在は\C[0]～\C[7]が使用可能です。
　色についてはCommandColorTableで指定しています。

■ソースコード内でコマンド名を記述するプラグインにおいて色変えする方法
　※フュージョン交代.jsなど、プラグイン内にコマンド名を記述出来るプラグインの場合は
　　'\\C[1]交代'のように\を二つ続けて記述すればコマンドの色が変化するようになります。


修正内容
20/01/28　新規作成
21/11/19　■ソースコード内でコマンド名を記述するプラグインにおいて色変えする方法、を追記
23/06/24　01コマンドの幅調整.jsとの併用処理追加


■対応バージョン
　SRPG Studio Version:1.284


■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/

(function () { 


//-------------------------------------------------
// 設定
//-------------------------------------------------

// コマンド用の色テーブル（\C[0]～\C[7]を使用した場合の色テーブル）
//                         白        水色      黄色      緑色      赤        紫        灰色     黒
var CommandColorTable = [0xffffff, 0x10efff, 0xefff00, 0x20ff40, 0xff5040, 0xff10ef, 0x7f7f8f, 0x0];




//-------------------------------------------------
// 以下、プログラム
//-------------------------------------------------

//--------------------------
// ListCommandScrollbarクラス
//--------------------------
ListCommandScrollbar.drawScrollContent= function(x, y, object, isSelect, index) {
		var textui = this.getParentInstance().getCommandTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var pic = textui.getUIImage();
		var text = object.getCommandName();
		
		// 色変えを行っている場合
		if( TextColorGetter.isColorText(text) === true ) {
			// 色を取得
			color = TextColorGetter.getColor(text, textui);
			// \C[XX]を取り除いた文字列を取得
			text = TextColorGetter.getText(text, textui);
		}
		
		if( typeof this.drawFixedTitleText === 'undefined' ) {
			TextRenderer.drawFixedTitleText(x, y - 10, text, color, font, TextFormat.CENTER, pic, this._getPartsCount());
		}
		else {
			this.drawFixedTitleText(x, y - 10, text, color, font, TextFormat.CENTER, pic, this._getPartsCount(), isSelect);
		}
}




//--------------------------
// MarshalCommandScrollbarクラス
//--------------------------
MarshalCommandScrollbar.drawScrollContent= function(x, y, object, isSelect, index) {
		var text = object.getCommandName();
		var length = this._getTextLength();
		var textui = this.getParentTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		
		// 色変えを行っている場合
		if( TextColorGetter.isColorText(text) === true ) {
			// 色を取得
			color = TextColorGetter.getColor(text, textui);
			// \C[XX]を取り除いた文字列を取得（文字列から色指定を取り除く為、色を取得した後で行う事）
			text = TextColorGetter.getText(text, textui);
		}
		
		TextRenderer.drawKeywordText(x, y, text, length, color, font);
}




//--------------------------
// TextColorGetterクラス
//--------------------------
var TextColorGetter = {
	// 色変えを行っているか
	isColorText: function(text) {
		var key = this.getKey();
		var convert = text.match(key);
		
		// 色指定しているかを返す
		return (convert != null);
	},
	
	// 色変え用文字列を取り除いた文字を返す
	getText: function(text, textui) {
		var key = this.getKey();
		
		// \C[XX]を取り除く
		return text.replace(key, '');
	},
	
	// 指定した色を返す
	getColor: function(text, textui) {
		var colorTable = CommandColorTable;
		var count = colorTable.length;
		var key = this.getKey();
		var convert = text.match(key);
		var colorIndex = Number(convert[1]);
		
		if (colorIndex < 0 || colorIndex > count - 1) {
			return textui.getColor();
		}
		
		return colorTable[colorIndex];
	},
	
	// 色変えのキー（\C[XX]）を返す
	getKey: function() {
		// 「\C[1]攻撃」のように記述すると、攻撃が水色で描画される
		var key = /\\C\[(\d+)\]/;
		
		return key;
	}
}


})();