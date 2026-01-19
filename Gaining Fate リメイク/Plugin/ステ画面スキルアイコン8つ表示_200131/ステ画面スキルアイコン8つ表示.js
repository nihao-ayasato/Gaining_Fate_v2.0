
/*--------------------------------------------------------------------------
  
　ステ画面スキルアイコン8つ表示のスクリプト

■概要
　ステータス画面のスキルアイコン表示で、8つのスキルアイコンがウィンドウ枠をはみ出さずに表示されるようになります。

■カスタマイズ
　１．スキルアイコンを横に9つ並べたい
　　　→設定にある「var SKILL_ICON_COLUMN = 8;」の8を9に変えれば横に9つ並びます
　　　　（ステータス画面からはみ出さないようにしたい場合は「目視で調整：ステータス画面項目位置.js」と併用してください）

　２．スキルアイコンを縦に2列並べたい
　　　→設定にある「var SKILL_ICON_ROW = 1;」の1を2に変えれば縦に2列並べたい並びます
　　　　（ステータス画面からはみ出さないようにしたい場合は「目視で調整：ステータス画面項目位置.js」と併用してください）

　３．スキルアイコンの表示間隔（横）を弄りたい
　　　→設定にある「var SKILL_ICON_WIDTH  = 24;」の数値部分を変えるとスキルアイコンの表示間隔（横）が変わります

　４．スキル名を表示したい
　　　→「var SKILL_TEXT_DISPLAY = false;」のfalseをtrueにしてください
　　　※SKILL_ICON_DISPLAYとSKILL_TEXT_DISPLAYの両方をtrueにすると、スキルアイコンとスキル名が表示されます。
　　　　SKILL_ICON_DISPLAYをfalseにしてSKILL_TEXT_DISPLAYをtrueにすると、スキル名のみ表示されます。

　　　　スキルアイコンの表示幅は「var SKILL_ICON_WIDTH = 24;」で設定しています。
　　　　スキル名の表示幅は「var SKILL_TEXT_AREA_WIDTH = 120;」で設定しています。
　　　　SKILL_ICON_DISPLAYとSKILL_TEXT_DISPLAYの両方をtrueにした場合、１つのスキルの表示幅はSKILL_ICON_WIDTH+SKILL_TEXT_AREA_WIDTH分になります。
　　　　SKILL_ICON_DISPLAYをfalseにしてSKILL_TEXT_DISPLAYをtrueにすると、１つのスキルの表示幅はSKILL_TEXT_AREA_WIDTH分になります。

　５．スキルの表示位置を変えたい
　　　→目視で調整：ステータス画面項目位置.jsを導入して下さい

　６．スキル名のフォントを変えたい
　　　→「var SKILL_TEXT_FONT_ID = 0;」の数字部分を変えて下さい。
　　　　※データ設定→コンフィグの中にあるフォントを選択し、指定したいフォントのIDを調べて入力して下さい。
　　　　　（サイズは指定したIDのフォントに設定してあるサイズをそのまま使用します。欲しいサイズが無い場合はフォントの作成で新たに作成してサイズを合わせて下さい）


修正内容
17/01/22　新規作成
18/06/28　設定項目を追加
19/10/07　スキル名表示用の設定を追加。スキルアイコン表示/非表示の設定を追加。
19/10/07b スキル名表示のフォント設定を追加。
20/01/31　「アイテムの使用」画面のスキルアイコンの並びがステータス画面と同じになるよう修正


■対応バージョン
　SRPG Studio Version:1.205


■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/
(function() {

//-------------------------------------------------------
// 設定
//-------------------------------------------------------
var SKILL_ICON_COLUMN = 8;			// 列（スキルアイコンが横に並ぶ数）
var SKILL_ICON_ROW    = 2;			// 行（スキルアイコンが縦に並ぶ数）

var SKILL_ICON_DISPLAY = true;		// スキルアイコンを表示（true：表示　false：表示しない）
var SKILL_ICON_WIDTH   = 24;		// アイコン画像の幅（元々はアイコン幅30ドット）
var SKILL_ICON_HEIGHT  = 24;		// アイコン画像の高さ
var SKILL_ICON_SIZ     = 24;		// アイコンの描画サイズ（通常は24ドット）


var SKILL_TEXT_DISPLAY    = false;	// スキル名を表示（true：表示　false：表示しない）
var SKILL_TEXT_AREA_WIDTH = 120;		// スキル名表示部分の幅
var SKILL_TEXT_FONT_ID    = 0;		// スキル名のフォントID


//-------------------------------------------------------
// 以下、プログラム
//-------------------------------------------------------
//--------------------------------
// IconItemScrollbarクラス
//--------------------------------
IconItemScrollbar.getObjectWidth= function() {
		var width = SKILL_ICON_WIDTH;		// スキルアイコンの幅
		
		if( SKILL_ICON_DISPLAY == false && SKILL_TEXT_DISPLAY == true ) {
			width = SKILL_TEXT_AREA_WIDTH;
		}
		else if( SKILL_ICON_DISPLAY == true && SKILL_TEXT_DISPLAY == true ) {
			width = SKILL_ICON_WIDTH + SKILL_TEXT_AREA_WIDTH-11;
		}
		
		return width;
}

IconItemScrollbar.getObjectHeight= function() {
		return SKILL_ICON_HEIGHT;
}



// スキルアイコン描画＋スキル名描画
//var alias01 = IconItemScrollbar.drawScrollContent;
IconItemScrollbar.drawScrollContent= function(x, y, object, isSelect, index) {
		var handle = object.skill.getIconResourceHandle();
		var siz = SKILL_ICON_SIZ;
		
		if( SKILL_ICON_DISPLAY == true ) {
//			alias01.call(this, x, y, object, isSelect, index);
//			GraphicsRenderer.drawImage(x, y, handle, GraphicsType.ICON);
			GraphicsRenderer.drawSkillIconShrink(x, y, handle, GraphicsType.ICON, siz, siz);
			x += SKILL_ICON_WIDTH;	// スキルアイコンの幅ドット横へずらす
		}
		
		// SKILL_TEXT_DISPLAYがtrueならスキル名を描画
		if( SKILL_TEXT_DISPLAY == true ) {
			this._drawSkillText(x, y, object.skill.getName());
		}
}


// スキル名描画用下位関数
IconItemScrollbar._drawSkillText= function(x, y, text) {
		var font = root.getBaseData().getFontList().getDataFromId(SKILL_TEXT_FONT_ID);		// フォントID
		var color = ColorValue.DEFAULT
		var range = createRangeObject();
		
		range.x = x;
		range.y = y;
		range.width = SKILL_TEXT_AREA_WIDTH;
		range.height = GraphicsFormat.ICON_HEIGHT;
		TextRenderer.drawRangeText(range, TextFormat.LEFT, text, SKILL_TEXT_AREA_WIDTH, color, font);
}




//--------------------------------
// SkillInteractionクラス
//--------------------------------
var alias10 = SkillInteraction.initialize;
SkillInteraction.initialize= function() {
		alias10.call(this);

		this._scrollbar.setScrollFormation(SKILL_ICON_COLUMN, SKILL_ICON_ROW);
}




//--------------------------------
// SkillInteractionLongクラス
//--------------------------------
var alias20 = SkillInteractionLong.initialize;
SkillInteractionLong.initialize= function() {
		alias20.call(this);

		this._scrollbar.setScrollFormation(SKILL_ICON_COLUMN, SKILL_ICON_ROW);
}




//--------------------------------
// GraphicsRendererクラス
//--------------------------------
// スキルアイコン描画（サイズ変更可能）
GraphicsRenderer.drawSkillIconShrink= function(xDest, yDest, handle, graphicsType, width, height) {
		var pic = this.getGraphics(handle, graphicsType);
		var xSrc = handle.getSrcX();
		var ySrc = handle.getSrcY();
		var size = this.getGraphicsSize(graphicsType, pic);
		
		if (pic !== null) {
			pic.drawStretchParts(xDest, yDest, width, height, xSrc * GraphicsFormat.ICON_WIDTH, ySrc * GraphicsFormat.ICON_HEIGHT, GraphicsFormat.ICON_WIDTH, GraphicsFormat.ICON_HEIGHT);
		}
}



})();