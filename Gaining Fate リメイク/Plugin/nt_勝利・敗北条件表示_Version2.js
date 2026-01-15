/*--------------------------------------------------------------------------
  
　勝利条件・敗北条件表示 Version 2

■概要
　マップ開始時に勝利条件・敗北条件をウィンドウに表示します。
　設定項目を大幅に増やしたため、Version 2 として以前のスクリプトとは別管理することにしました。

■使用方法
  イベントコマンドの「イベント系」＞「スクリプトの実行」の「オブジェクト名」に
  
  Show_Vicory_Conditions
  
  と記述します。


■使用例
【例１】ランタイムのテキストウィンドウ素材を使用する場合（使用するテキストウィンドウのID：1）
        ※ UIの「textWindow」に登録されている画像を使用します。

　　「設定」で、以下のように指定してください。
　　　　・var useTextWindow = true;
　　　　・var useRuntimeWindow = true;
　　　　・var textWindowID   = 1;
　　　　・var stretchDrawing = true;
    　　・var sourceWindowSizeX   = 640;
    　　・var sourceWindowSizeY   = 427;

【例２】オリジナルのテキストウィンドウ素材を使用する場合
　　（使用するテキストウィンドウのID：3, ウィンドウ素材の幅 300, 高さ 200）

　　「設定」で、以下のように指定してください。
　　　　・var useTextWindow = true;
　　　　・var useRuntimeWindow = false;
　　　　・var textWindowID   = 3;
　　　　・var stretchDrawing = true;
    　　・var sourceWindowSizeX   = 300;
    　　・var sourceWindowSizeY   = 200;

【例３】Materialフォルダ内の素材をウィンドウとして使用する場合

　　あらかじめ「Material」フォルダ内に「VictoryCondisionsWindow」フォルダを作り、
　　ウィンドウ素材画像を格納しておきます。

　　「設定」で、以下のように指定してください。
　　　　・var useTextWindow = false;

　　　　・MaterialWindowSetting = {
　　　　	Material:'VictoryCondisionsWindow', // フォルダ名
	　　　　Window:  'samplewindow.png' 		// ウィンドウ素材ファイル名 ← ファイル名を指定する
　　　　　}

　　　　・var stretchDrawing = true;
　　　  ・var sourceWindowSizeX   = 640;	// 素材画像の幅
    　　・var sourceWindowSizeY   = 427;	// 素材画像の高さ


■カスタマイズ
　【位置調整（基本）】
　　　「設定」欄にある各項目の値を調整してください。

　【位置調整（マップごと）】
　　　イベントコマンドの「イベント系」＞「スクリプトの実行」の「オブジェクト名」に
　　　Show_Vicory_Conditions
  　　と記述したら、そのテキスト領域に
　　  {
        titleShiftX: -20,
        bodyShiftX: 50
  　　}
　　　のように書くことで、マップごとにタイトルと本文の開始X座標を微調整できます。
　　　「titleShiftX」の数値はタイトル文字列のX座標調整、
　　　「bodyShiftX」の数値は本文文字列のX座標調整です。

　【フォントを変えたい】
　　　「設定」欄で以下のように編集してください。
　　　　・var titleFontID または var bodyFontID の値を使用したいフォントのIDに変える
　　　
　　　※フォントのID確認、新規作成等は「データ設定」＞「コンフィグ」＞「フォント」から行えます。

　【フォントの色を変えたい】
　　　「設定」欄で以下のように編集してください。
　　　　・var titleColor または var bodyColor の値を使用したい色を RGB 16進数 で指定する。


■更新履歴
　2017/11/10　v2 新規作成 (これ以前のバージョンとは設定項目・設定値が大幅に変わるため、別管理とした)

■動作確認バージョン
　SRPG Studio Version:1.159

■作成者: ねぎたま （公式Plugin改変）

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

// 素材の指定
var useTextWindow       = false; // テキストウィンドウ素材を使用する (true:使用する, false:Materialフォルダ内の素材を使用する)

    // テキストウィンドウ素材を使用する場合の設定
    var useRuntimeWindow    = true;	// テキストウィンドウはランタイム素材を使用する（true: ランタイム素材使用, false: オリジナル素材使用）
    var textWindowID        = 1;	// 使用するテキストウィンドウのID

    // Materialフォルダ内の素材を使用する場合の設定
    MaterialWindowSetting = {
	    Material:'VictoryCondisionsWindow', // フォルダ名
	    Window:  'samplewindow.png' 		// ウィンドウ素材ファイル名
    }


// ウィンドウを拡大縮小して描画するか（trueの場合は続く４項目の値も指定する。falseなら指定不要）
var stretchDrawing          = true; // true:拡大縮小描画する, false:素材サイズのまま描画する

    var sourceWindowSizeX   = 640;	// 素材画像の幅
    var sourceWindowSizeY   = 427;	// 素材画像の高さ
    var windowSizeX         = 500;  // 描画するウィンドウの幅
    var windowSizeY         = 250;  // 描画するウィンドウの高さ


// ウィンドウの描画
var windowPosX = 230;   // ウィンドウの描画開始 X座標
var windowPosY = 120;   // ウィンドウの描画開始 Y座標
var alpha      = 0;	    // ウィンドウの透過度（0: 完全に透明、255: 完全に不透明）Material指定のときは機能しないかも

//「勝利条件」「敗北条件」タイトルの描画位置調整
var titlePosX   = 0;	// X方向の調整（表示文字列を左右にずらす。正の値で右、負の値で左）
var titlePosY   = 150;  // Y方向の調整

// 本文の描画位置調整
var bodyPosX    = 290;	// X方向の調整（表示文字列を左右にずらす。正の値で右、負の値で左）

// 間隔調整
var titleBodySpaceY  = 30;   // タイトルと本文の間隔調整
var winLoseSpaceY    = 95;   //「勝利条件」と「敗北条件」の間隔調整

// フォント指定
var titleFontID = 10;		// 「勝利条件」「敗北条件」の文字に使用するフォントのID
var bodyFontID  = 11;		// 勝利条件・敗北条件の内容に使用するフォントのID

var titleColor  = 0xFFF896;	// 「勝利条件」「敗北条件」の文字の色。RGBを16進数で指定する。
var bodyColor   = 0xFFFFFF;	// 勝利条件・敗北条件の内容の文字の色。RGBを16進数で指定する。


//-------------------------------------------------------
// 以下プログラム
//-------------------------------------------------------

// 警告ログの連続出力を避けるためのカウンタ
var i = 0;	
var j = 0;	
var w = 0;


var alias1 = ScriptExecuteEventCommand._configureOriginalEventCommand;
ScriptExecuteEventCommand._configureOriginalEventCommand = function(groupArray) {
	alias1.call(this, groupArray);
	
	groupArray.appendObject(ObjectiveEventCommand);
};

var ObjectiveEventCommand = defineObject(BaseEventCommand, 
{
	_objectiveName: null,	// 勝利条件の文字列

	enterEventCommandCycle: function() {
		this._prepareEventCommandMemberData();
	
		if (!this._checkEventCommand()) {
			return EnterResult.NOTENTER;
		}
		
		return this._completeEventCommandMemberData();
	},
	
	moveEventCommandCycle: function() {
		if (InputControl.isSelectAction()) {
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	drawEventCommandCycle: function() {

        // テキストウィンドウ素材を使用する場合
        if(useTextWindow){
    		// ウィンドウ画像の取得
            var UIList = root.getBaseData().getUIResourceList(1, useRuntimeWindow);

            if(textWindowID < UIList.getCount()){
    		    var pic = UIList.getDataFromId(textWindowID);
            }
            else{
                if(w == 0){
                    root.log("指定されたtextwindowIDは存在しません");
                    w++;
                }
                var pic = root.getBaseData().getUIResourceList(1, true).getDataFromId(0);
            }
        }
        // Materialフォルダ内の素材を使用する場合
        else{
            var pic = root.getMaterialManager().createImage(MaterialWindowSetting.Material, MaterialWindowSetting.Window);
        }
		
		if (pic !== null) {
			// ウィンドウ画像の描画
            if(stretchDrawing){
    			pic.drawStretchParts(windowPosX, windowPosY, windowSizeX, windowSizeY, 
                    0, 0, sourceWindowSizeX, sourceWindowSizeY);
            }
            else{
    			pic.draw(windowPosX, windowPosY);
            }

			// ウィンドウ画像の透過度設定
			pic.setAlpha(alpha);
		}
		
		this._drawFirst();
		this._drawSecond();
	},
	
	getEventCommmandName: function() {
		return 'Show_Vicory_Conditions';
	},
	
	_prepareEventCommandMemberData: function() {
	},
	
	_checkEventCommand: function() {
		return this.isEventCommandContinue();
	},
	
	_completeEventCommandMemberData: function() {
		var session = root.getCurrentSession();
		
		if (session === null) {
			return EnterResult.NOTENTER;
		}
		
		this._prepareShowString();
		
		return EnterResult.OK;
	},
	

	// ---------「勝利条件」「敗北条件」の文字を描画する ------------------
	_drawFirst: function() {
		var x, width;
		var title = StringTable.Objective_Victory;	// 「勝利条件」の文字

		// フォントの取得方法を変更
		var fontList = root.getBaseData().getFontList();
		if (titleFontID < fontList.getCount()){
			var font = fontList.getDataFromId(titleFontID);
		}
		else{
			if(i == 0){
				root.log("指定されたタイトル用のフォントIDは存在しません");
				i++;
			}
			var font = fontList.getDataFromId(0);
		}

		width = TextRenderer.getTextWidth(title, font);
		x = LayoutControl.getCenterX(-1, width);
		
        // イベントコマンド中での位置調整指定の反映
        var titleShiftX = 0; 
        var arg = root.getEventCommandObject().getEventCommandArgument();

        if(typeof arg.titleShiftX === 'number') titleShiftX = arg.titleShiftX;

		// 「勝利条件」を表示する。5番目の引数は色を16進数で指定
		TextRenderer.drawText(x + titlePosX + titleShiftX, titlePosY, title, -1, titleColor, font);

		// 「敗北条件」を表示する
		TextRenderer.drawText(x + titlePosX + titleShiftX, titlePosY + winLoseSpaceY, 
                                "敗北条件", -1, titleColor, font);
	},
	

	// ---------- 勝利条件、敗北条件の内容を描画する ------------------------
	_drawSecond: function() {
		var x, width;

		// フォントの取得方法を変更
		var fontList = root.getBaseData().getFontList();
		if (bodyFontID < fontList.getCount()){
			var font = fontList.getDataFromId(bodyFontID);
		}
		else{
			if(j == 0){
				root.log("指定された本文用のフォントIDは存在しません");
				j++;
			}
			var font = fontList.getDataFromId(0);
		}

        // イベントコマンド中での位置調整指定の反映
        var bodyShiftX = 0; 
        var arg = root.getEventCommandObject().getEventCommandArgument();

        if(typeof arg.bodyShiftX === 'number') bodyShiftX = arg.bodyShiftX;

		// 勝利条件の内容を表示する。位置調整
		TextRenderer.drawText(bodyPosX + bodyShiftX, titlePosY + titleBodySpaceY, 
                                    this._objectiveName, -1, bodyColor, font);

		// 敗北条件の内容を表示する
		TextRenderer.drawText(bodyPosX + bodyShiftX, titlePosY + winLoseSpaceY + titleBodySpaceY, 
                                    this._loseCondition, -1, bodyColor, font);
	},

    // マップ情報に設定された勝利条件・敗北条件を取得する
	_prepareShowString: function() {
		var mapInfo = root.getCurrentSession().getCurrentMapInfo();

		// 勝利条件の文字列を取得。２・３行目も取得するよう変更
		this._objectiveName = mapInfo.getVictoryCondition(0) + "\n"
					+ mapInfo.getVictoryCondition(1) + "\n"
					+ mapInfo.getVictoryCondition(2);

		// 敗北条件の文字列を取得する
		this._loseCondition = mapInfo.getDefeatCondition(0) + "\n"
					+ mapInfo.getDefeatCondition(1) + "\n"
					+ mapInfo.getDefeatCondition(2);

	}
}
);

})();
