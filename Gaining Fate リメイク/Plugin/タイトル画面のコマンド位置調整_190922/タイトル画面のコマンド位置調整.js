
/*--------------------------------------------------------------------------
  
　タイトル画面のコマンド位置調整

■概要
　タイトル画面のロゴの位置とコマンドの位置を変更する事が出来ます。
　またコマンドの並びを縦一列以外（縦二列とか縦三列とか）に変更可能です。

■使用法（基本）
　　１．ロゴの位置を変えたい
　　　　→基本の設定の中にある「var TiTleLogoHoseiX = 0;」「var TiTleLogoHoseiY = 0;」の数字部分を変えて下さい。

　　２．コマンドの列数を変えたい
　　　　→基本の設定の中にある「var TiTleCommandColmn = 1;」の数字部分を変えて下さい。
　　　　　2にすれば縦二列、3にすれば縦3列になります（5や6にすればコマンドが横一列に並びます）
　　　　　※縦書きにする際（後述）はコマンドの列数は1のままで構いません（プラグイン側で調整しています）

　　３．コマンドの位置を変えたい
　　　　→基本の設定の中にある「var TiTleCommandHoseiX = 0;」「var TiTleCommandHoseiY = 0;」の数字部分を変えて下さい。
　　　　　※コマンドの列数を変えると、この値を弄らなくても位置が変わる事があります。
　　　　　　先にコマンド列数を変えてからこちらの値を変更して下さい。

　　４．カーソルの位置を変えたい
　　　　→基本の設定の中にある「var TiTleCursorHoseiX = 0;」「var TiTleCursorHoseiY = 0;」の数字部分を変えて下さい。

　　５．文字の色を変えたい
　　　　→基本の設定の中にある「var TiTleTextColor = 0xffffff;」のffffffの部分を変えて下さい（16進数で、左から2桁ずつRGBの値となっています）
　　　　　選択不可能な場合の色は「var TiTleTextColorDisable = 0x808080;」の808080の部分を変えて下さい（16進数で、左から2桁ずつRGBの値となっています）
　　　　　（例）赤色：0xff0000、緑色：0x00ff00、青色：0x0000ff、黄色：0xffff00、紫：0xff00ff、水色：0x00ffff、黒：0x000000
　　　　　　　　暗い赤色：0x800000、暗い緑色：0x008000、暗い青色：0x000080、暗い黄色：0x808000、暗い紫：0x800080、暗い水色：0x008080

　　６．縦書きにしたい
　　　　→基本の設定の中にある「var isVirticalText = false;」のfalseの部分をtrueに変えて下さい
　　　　　※縦書きにする際はコマンドの列数は1のままで構いません（プラグイン側で調整しています）
　　　　　　基本的にこのスイッチをtrueにするだけで縦横は自動で変更されますが、カーソルは別途位置調整する必要があります。

　　　　　【注意事項】
　　　　　　　コマンドの表示X座標補正（TiTleCommandHoseiX）とコマンドの表示Y座標補正（TiTleCommandHoseiY）の値によっては
　　　　　　　縦書きにした場合にコマンドが画面外に出て一切見えなくなることがあります。
　　　　　　　そういう場合はTiTleCommandHoseiXとTiTleCommandHoseiYの値を0に戻したあとで再度調整してみて下さい。

　　７．カーソルを縦方向にしたい
　　　　→基本の設定の中にある「var isVirticalCursor = false;」のfalseの部分をtrueに変えて下さい


■使用法（拡張）
　 ※判らない場合はデフォルトの値のままとして弄らないでください

　　１．コマンド枠の描画サイズ（横幅）を変えたい
　　　　→拡張設定の中にある「var TiTleCommandParts = 5;」の数字部分を4や3に減らして下さい。
　　　　　※コマンド枠の描画は、ツール側で1パーツ30ドットの枠画像を、この値+2個分描画する事で行うようになっています。
　　　　　　（左枠、中央枠×パーツ数、右枠を描画することでコマンド枠が作られます）

　　２．コマンドの文字描画開始位置を変えたい
　　　　→拡張設定の中にある「var TiTleCommandPartsHoseiX = 30;」の数字部分を変えて下さい。
　　　　　※コマンドの文字は、本来はツール側で右に30ドットずらして描画しています。
　　　　　　これはコマンドの左枠部分に文字を被せない為の処理ですが、シンプルな枠の場合は余白があるので30より小さい値すれば左側に文字を寄せる事が出来ます。

　　３．文字描画幅を変えたい
　　　　→拡張設定の中にある「var TiTleCommandTextRangeWidth = TiTleCommandParts*30;」の「TiTleCommandParts*30」の部分を変えて下さい。
　　　　　※コマンドの文字描画幅は、本来は150ドット（パーツ数5*30ドット）になっています。
　　　　　　ですが「さいしょからはじめる」のようにコマンド文字数を増やすと勝手に改行されてしまう事があります。そういう時はこの値を大きくすることである程度改行を防ぐことが出来ます。

　　４．コマンド枠幅・高さを変えたい
　　　　→拡張設定の中にある「var TiTleCommandWidth = 220;」の「var TiTleCommandHeight = 45;」の数字部分を変えて下さい。
　　　　　※これはプログラム側で管理している、コマンド枠の幅と高さです。
　　　　　　コマンド枠の描画サイズ（横幅）を増やすと横の隙間が大きくなることがある為、そういう場合はTiTleCommandWidthの数値を減らせば隙間を減らす事が出来ます。
　　　　　　（TiTleCommandHeightはコマンド枠の高さです。この数値を減らせば縦の隙間を減らす事が出来ます）


19/09/20  新規作成
19/09/22  縦書き設定を追加。文字色を変えられるようにした

■対応バージョン
　SRPG Studio Version:1.205


■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/
(function() {


//--------------------------------------------
// 設定
//--------------------------------------------
// 基本の設定
var TiTleLogoHoseiX = 0;  				// ロゴの表示X座標補正（増やすと右に移動し、マイナスにすると左に移動します）
var TiTleLogoHoseiY = 20;  				// ロゴの表示Y座標補正（増やすと下に移動し、マイナスにすると上に移動します）

var TiTleCommandColmn  = 1;				// コマンドの列数（デフォルトは1（縦に1列））※2にすると2列、3にすると3列になります

var TiTleCommandHoseiX = 0;  			// コマンドの表示X座標補正
var TiTleCommandHoseiY = 0;  			// コマンドの表示Y座標補正

var TiTleCursorHoseiX = 0;				// カーソルの表示X座標補正
var TiTleCursorHoseiY = 0;				// カーソルの表示Y座標補正

var TiTleTextColor = 0xffffff;			// コマンドの文字色（通常）
var TiTleTextColorDisable = 0x808080;	// コマンドの文字色（選択不可時）

var isVirticalText = false;				// 縦書きか
var isVirticalCursor = false;			// カーソルが縦か


// 拡張設定 ※判らない場合はデフォルトの値のままとして弄らないでください
var TiTleCommandParts          = 5;		// パーツ数（デフォルトは5。パーツ1つにつき30ドット。実際には左枠＋中央枠×パーツ数＋右枠を描画するので30+30*5+30で210ドットになる）

var TiTleCommandPartsHoseiX    = 30;	// コマンドの文字描画開始位置（デフォルトは30。コマンドの文字を枠より指定ドット右の位置から描画する）
var TiTleCommandTextRangeWidth = TiTleCommandParts*30;	// 文字描画幅（デフォルトは150ドット[本来はコマンド枠（中央）のパーツ数×30ドットだが、微調整可能にしている]
var TiTleCommandTextRangeHeight= 60;	// 文字描画高さ（デフォルトは60ドット

var TiTleCommandWidth  = 220;			// コマンド枠幅（デフォルトは220。こちらはプログラム上の幅）
var TiTleCommandHeight = 45;			// コマンド枠高さ（デフォルトは45。こちらはプログラム上の高さ）




//--------------------------------------------
// 以下、プログラム
//--------------------------------------------

//----------------------------------
// TitleSceneクラス
//----------------------------------
var alias01 = TitleScene._completeSceneMemberData;
TitleScene._completeSceneMemberData= function() {
		alias01.call(this);
		
		// ここで、タイトル画面で表示するコマンドの列数を変更する
		
			// 従来（横書き）
		if( isVirticalText !== true ) {
			this._scrollbar.setScrollFormation(TiTleCommandColmn, this._commandArray.length);
		}
		else {
			// 縦横書き
			this._scrollbar.setScrollFormation(this._commandArray.length, TiTleCommandColmn);
		}
		this._scrollbar.setObjectArray(this._commandArray);
		this._setFirstIndex();
}


// ロゴ描画
TitleScene._drawLogo= function() {
		var x, y;
		var pic = root.queryUI('gamelogo_frame');
		
		if (pic !== null) {
			x = LayoutControl.getRelativeY(8) - 60;
			y = LayoutControl.getRelativeY(6) - 40;
			pic.draw(x + TiTleLogoHoseiX, y + TiTleLogoHoseiY);
		}
}




//----------------------------------
// TitleScreenScrollbarクラス
//----------------------------------
var alias10 = TitleScreenScrollbar.drawScrollbar;
TitleScreenScrollbar.drawScrollbar= function(xStart, yStart) {
		var x = xStart + TiTleCommandHoseiX;
		var y = yStart + TiTleCommandHoseiY;
		
		alias10.call(this, x, y);
}


TitleScreenScrollbar.drawScrollContent= function(x, y, object, isSelect, index) {
		var text = object.getCommandName();
		var textui = this.getScrollTextUI();
		var color = TiTleTextColor;				// コマンドの文字色（通常）
		var font = textui.getFont();
		var pic = textui.getUIImage();
		var parts = TiTleCommandParts;
		var hoseiX = TiTleCommandPartsHoseiX;
		var rangeW = TiTleCommandTextRangeWidth;
		var rangeH = TiTleCommandTextRangeHeight;
		
		if (!object.isSelectable()) {
			color = TiTleTextColorDisable;		// コマンドの文字色（選択不可）
		}
		
		// タイトルでのコマンド描画処理（拡張したやつ）を呼び出す
		TextRenderer.drawFixedTitleTextWidthHosei(x, y, text, color, font, TextFormat.CENTER, pic, parts, hoseiX, rangeW, rangeH);
}


TitleScreenScrollbar.drawCursor= function(x, y, isActive) {
		var pic = this.getCursorPicture();
		
		y = y - (32 - this._objectHeight) / 2;
		
		if( isVirticalCursor == true ) {
			pic.setDegree(90);
		}

		this._commandCursor.drawCursor(x + TiTleCursorHoseiX, y + TiTleCursorHoseiY, isActive, pic);
}


TitleScreenScrollbar.getObjectWidth= function() {
//		return 220;
		
		if( isVirticalText == true ) {
			return TiTleCommandHeight;
		}
		
		return TiTleCommandWidth;
}


TitleScreenScrollbar.getObjectHeight= function() {
//		return 45;
		
		if( isVirticalText == true ) {
			return TiTleCommandWidth;
		}
		
		return TiTleCommandHeight;
}




//----------------------------------
// TextRendererクラス
//----------------------------------
// タイトルでのコマンド描画処理（拡張したやつ）
TextRenderer.drawFixedTitleTextWidthHosei= function(x, y, text, color, font, format, pic, count, partsHoseiX, textRangeWidth, textRangeHeight) {
		var range;
		var width = TitleRenderer.getTitlePartsWidth();
		var height = TitleRenderer.getTitlePartsHeight();
		
		// 横書きの場合
		if( isVirticalText !== true ) {
			if (pic !== null) {
				TitleRenderer.drawTitle(pic, x, y, width, height, count);
			}
			
			range = createRangeObject(x + partsHoseiX, y,  textRangeWidth, textRangeHeight);
			this.drawRangeText(range, format, text, -1, color, font);
		}
		// 縦書きの場合
		else {
			if (pic !== null) {
				TitleRenderer.drawTitleVirtical(pic, x, y, width, height, count);
			}
			
			// 縦書きにする
			text = this._cnvVirticalText(text);
			
			// 縦書きの場合Rangeオブジェクトの幅と高さをひっくり返す
			// また、partsHoseiXの値はY座標への補正値にする
			range = createRangeObject(x, y + partsHoseiX, textRangeHeight, textRangeWidth);
			this.drawRangeText(range, format, text, -1, color, font);
		}
}


// 文字を縦書きに
TextRenderer._cnvVirticalText= function(text) {
		var virticaltext = '';
		var i;
		var count = text.length;
		
		if( count === 0 ) {
			return virticaltext;
		}
		
		// 縦書きになるよう1文字ごとに改行を入れた文字列にする（はじめから→は\nじ\nめ\nか\nら　にしている）
		virticaltext = text.charAt(0);
		
		for (i = 1; i < count; i++) {
			virticaltext = virticaltext + '\n' + text.charAt(i);
		}
		
		return virticaltext;
}




//----------------------------------
// TitleRendererクラス
//----------------------------------
// タイトル枠を縦に描画する
TitleRenderer.drawTitleVirtical= function(pic, x, y, width, height, count) {
		var picCache, graphicsManager;
		
		if (pic === null) {
			return;
		}
		
		// 縦書きなので幅と高さを入れ替えて取得処理を行う
		picCache = CacheControl.getCacheGraphics(height, width * (count + 2), pic);
		if (picCache !== null) {
			if (picCache.isCacheAvailable()) {
				// キャッシュの中身が有効な場合は、キャッシュを描画する
				picCache.draw(x, y);
			}
			return;
		}
		else {
			// 縦書きなので幅と高さを入れ替えて生成
			picCache = CacheControl.createCacheGraphics(height, width * (count + 2), pic);
		}
		
		graphicsManager = root.getGraphicsManager();
		
		// 描画対象を画面ではなくキャッシュに変更する
		graphicsManager.setRenderCache(picCache);
		
		// 見出しはキャッシュに描画される
		this._drawTitleInternalVirtical(pic, 0, 0, width, height, count);
		
		// キャッシュへの描画を無効にする
		graphicsManager.resetRenderCache();
		
		// キャッシュの中身が画面に描画される
		picCache.draw(x, y);
}


// 見出しを縦に描画する
TitleRenderer._drawTitleInternalVirtical= function(pic, x, y, width, height, count) {
		var i;
		
		if (pic === null) {
			return;
		}
		
		// ※従来処理では幅90高さ60の画像を左30ドット（左枠）、中央30ドット、右30ドット（右枠）にわけて描画している
		//   1パーツは幅60高さ60
		
		// 元画像を90度回転させ、縦にして描画するのだが
		// 画像が正方形でないせいかこちらのやり方がわるいのか、1パーツを正方形幅30高さ30にしないと上手く描画できなかった
		var top = 0;				// 上パーツの元画像位置（元は左パーツ）
		var mid = width;			// 中央パーツの元画像位置
		var btm = width * 2;		// 下パーツの元画像位置（元は右パーツ）
		var SizeW = width;			// 元画像の幅（正方形にする為幅30をセット）
		var SizeH = width;			// 元画像の高さ（正方形にする為幅30をセット）
		var partsL = width;			// 縦にした時の右半分パーツの元画像位置
		var partsR = 0;				// 縦にした時の左半分パーツの元画像位置
		var posR   = width;			// 右半分画像の描画先補正位置
		var posL   = 0;				// 左半分画像の描画先補正位置
		
		// 上パーツの描画(30*30の正方形サイズで二度描画する)
		pic.setDegree(90);
		pic.drawParts(x+posR, y, top, partsR, SizeW, SizeH);	// 右半分描画
		pic.setDegree(90);
		pic.drawParts(x+posL, y, top, partsL, SizeW, SizeH);	// 左半分描画
		
		y += width;
		
		// 中央パーツの描画(30*30の正方形サイズで二度描画する)
		for (i = 0; i < count; i++) {
			pic.setDegree(90);
			pic.drawParts(x+posR, y, mid, partsR, SizeW, SizeH);	// 右半分描画
			pic.setDegree(90);
			pic.drawParts(x+posL, y, mid, partsL, SizeW, SizeH);	// 左半分描画
			
			y += width;
		}
		
		// 下パーツの描画(30*30の正方形サイズで二度描画する)
		pic.setDegree(90);
		pic.drawParts(x+posR, y, btm, partsR, SizeW, SizeH);	// 右半分描画
		pic.setDegree(90);
		pic.drawParts(x+posL, y, btm, partsL, SizeW, SizeH);	// 左半分描画
}


})();