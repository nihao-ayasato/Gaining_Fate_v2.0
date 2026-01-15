
/*--------------------------------------------------------------------------
  
　レベルアップ時、武器熟練度の上昇を表示するスクリプト

■概要
　レベルアップ時に武器熟練度が上昇すると簡易ウィンドウを表示し、
　『熟練度 ？？  が上昇した。』と表示されるようになります。

修正内容
15/11/17 新規作成


■対応バージョン
　SRPG Studio Version:1.040


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



// レベルアップビューのデータ初期化処理
var alias1 = LevelupView._prepareMemberData;
LevelupView._prepareMemberData= function(levelupViewParam) {
		alias1.call(this, levelupViewParam);

		this._jukurendoUpWindow = createWindowObject(JukurendoUpWindow, this);
};

// レベルアップビューのデータ設定処理
var alias2 = LevelupView._completeMemberData;
LevelupView._completeMemberData= function(levelupViewParam) {
		alias2.call(this, levelupViewParam);

		this._jukurendoUpWindow.setJukurendoParameterData(this._targetUnit, this._growthArray);
};


// レベルアップによる成長の描画
LevelupView._drawGrowth= function() {
		var x = LayoutControl.getCenterX(-1, this._experienceParameterWindow.getWindowWidth());
		var y = LayoutControl.getNotifyY();
		
		this._experienceParameterWindow.drawWindow(x, y);

		// 熟練度上昇が発生していれば、熟練度上昇ウィンドウを描画
		if( this._jukurendoUpWindow.isJukurendoUp() ) {
			this._jukurendoUpWindow.drawWindow(x, y+160);
		}
};




//-----------------------------------------------
// 熟練度上昇ウィンドウクラス
//-----------------------------------------------
var JukurendoColMax = 9;	// 熟練度の項目表示数（一行に表示する数）
var JukurendoMsgPls = 2;	// 'が上昇した。'の部分の幅は熟練度項目２つ分に相当

var JukurendoUpWindow = defineObject(BaseWindow,
{
	_jukurendoArr:null,
	_jukurendoNameArr:null,

	// パラメータの設定
	setJukurendoParameterData: function(targetUnit, growthArray) {
		var i,j;
		var count = growthArray.length - ParamGroup.getMainStatusCount();
		this._jukurendoArr = [];
		this._jukurendoNameArr = [];
		
		for (i = 0,j = ParamGroup.getMainStatusCount(); i < count; i++,j++) {
			this._jukurendoArr.push(growthArray[j]);
			this._jukurendoNameArr.push(ParamGroup.getParameterName(j));
		}
	},
	
	// 描画処理
	drawWindowContent: function(x, y) {
		var i;
		var count = this._jukurendoArr.length;

		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var length = -1;

		var xx = x;
		var yy = y;
		var colomn_cnt = 0;	// 一行に表示する熟練度項目数のカウンタ

		// '熟練度'の描画
		TextRenderer.drawText(xx, yy, '熟練度', length, ColorValue.KEYWORD, font);
		yy += 20;

		// 上昇した熟練度名称の描画
		for (i = 0; i < count; i++) {
			if( this._jukurendoArr[i] > 0 ) {
				TextRenderer.drawText(xx, yy, this._jukurendoNameArr[i], length, color, font);
				xx += 48;
				colomn_cnt++;

				// 一行に表示する熟練度項目数のカウンタが熟練度の項目表示数を超えたら改行処理を行う
				if( colomn_cnt >= JukurendoColMax ) {
					// 改行処理
					xx  = x;			// x座標を初期位置へ
					yy += 20;			// 改行（y座標を+16）
					colomn_cnt = 0;		// カウンタを初期化
				}
			}
		}

		// 'が上昇した。'の描画
		if( colomn_cnt > (JukurendoColMax-JukurendoMsgPls) ) {
			// 改行処理
			xx  = x;			// x座標を初期位置へ
			yy += 20;			// 改行（y座標を+16）
			colomn_cnt = 0;		// カウンタを初期化
		}
		TextRenderer.drawText(xx, yy, 'が上昇した。', length, color, font);
	},
	
	// 熟練度が上昇したかの判定処理
	isJukurendoUp: function() {
		var i;
		var count = this._jukurendoArr.length;
		
		for (i = 0; i < count; i++) {
			if( this._jukurendoArr[i] > 0 ) {
				return true;
			}
		}
		return false;
	},
	
	// ウィンドウ幅
	getWindowWidth: function() {
		return 452;
	},
	
	// ウィンドウ高さ
	getWindowHeight: function() {
		var column_cnt = Math.floor((this._jukurendoArr.length+JukurendoMsgPls)/JukurendoColMax);
		return ((20*(2+column_cnt))+(this.getWindowYPadding() * 2));
	}
}
);


})();