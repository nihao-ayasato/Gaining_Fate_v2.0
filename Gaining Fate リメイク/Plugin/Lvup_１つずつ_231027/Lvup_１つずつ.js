
/*--------------------------------------------------------------------------
  
　LVアップ時にステータス上昇を１つずつ表示するスクリプト

■概要
　レベルアップした時に、１つずつステータスの上昇を描画します。
　（FEのレベルアップの時のような感じになります）
　なお、レベルアップ時に決定ボタンを連打していても変化した能力値を全て描画するまでスキップしないように設定を変更しています。

■カスタマイズ
　【レベルアップ時に決定ボタン連打で画面をスキップしたい】
　　　→レベルアップ表示完了まで決定キーを押してもスキップしない？（isLvUpNoSkip = true;）のtrueをfalseに書き換えると
　　　　レベルアップ画面表示途中でも、決定キーで表示がスキップされます。 [false]

　【能力が上限下限に到達していても、成長したら描画するようにしたい】
　　　→成長時に強制描画するか（isMaxMinParamForceDraw = false;）のtrueをfalseに書き換えると
　　　　上限に達した能力が成長したり、下限の能力が低下した時も強制的に成長を描画します。[true]

　【能力変化時に音を鳴らさないようにしたい】
　　　→能力変化時に音を鳴らすか（isParaSound = true;）のtrueをfalseに書き換えると音がならなくなります。[true]

　【LvUp時でパラメータが上昇した時の音を変えたい】
　【LvUp時でパラメータが下降した時の音を変えたい】
　　　→【LvUp時の能力増減の音にオリジナルのSEを使いたい】の項目を参照して下さい

　【LvUp時、パラメータ変化部分に（FE封印の剣のように）アニメを入れたい】
　　　→まず、オリジナルのアニメ画像をpictureに登録して下さい。
　　　　（プロジェクトのgraphics\pictureフォルダに画像をコピーした上で
　　　　　リソース→画像データの確認から、オリジナルのpictureに画像を追加します）

　　　　そして、登録した画像のIDをメモします。
　　　　（リソース→画像データの確認から、オリジナルのpictureの横に出ているIDの値を確認してください。
　　　　　IDが出ていない場合、ツール→オプションで「データ」タブを選択し、「データの名前の横にIDを表示する」のチェックを入れてください）

　　　　その後、オリジナル画像のID（LvUpAnimeOriginalPicID = 0;）の数字部分に、登録した画像のIDを指定します。
　　　　オリジナル画像を使ってアニメ描画するか（LvUpAnimeOriginalPicUse = false;）を
　　　　LvUpAnimeOriginalPicUse =  true; に書き換えます。
　　　　（なお、初期の定義では、アニメ画像は24*24で5コマになっています）

　　　『アニメ画像の位置を調整したい』
　　　　「LvUpAnimeHoseiX = 0;」「LvUpAnimeHoseiY = 0;」の数値部分を弄って下さい

　【LvUp時の能力増減の音にオリジナルのSEを使いたい】
　　　→まず、オリジナルのSEをsoundに登録して下さい。
　　　　（プロジェクトのAudio\soundフォルダにSEをコピーした上で
　　　　　リソース→メディアデータの確認から、オリジナルのsoundにSEを追加します）

　　　　そして、登録したSEのIDをメモします。
　　　　（リソース→メディアデータの確認から、オリジナルのsoundの横に出ているIDの値を確認してください。
　　　　　IDが出ていない場合、ツール→オプションで「データ」タブを選択し、「データの名前の横にIDを表示する」のチェックを入れてください）

　　　　その後、能力上昇時に鳴らすオリジナルSEのID（LvUp_ParaUpOriginalSoundID = 0;）と
　　　　能力低下時に鳴らすオリジナルSEのID（LvUp_ParaDownOriginalSoundID  = 0;）の数字部分に、
　　　　登録したSEのIDを指定します。
　　　　オリジナルSEを使うか（isUseOriginalSound = false;）を
　　　　isUseOriginalSound = true; に書き換えれば、オリジナルのSEが鳴ります。




修正内容
15/9/17　新規作成
15/9/18　アニメ表示機能を追加
15/9/20　レベルアップをスキップしない機能を追加
　　　　 オリジナルSEを鳴らす機能を実装
15/10/11 武器熟練度表示スクリプトによる、レベルアップ時の熟練度非表示対応を反映
15/11/20 少し処理を見直して高速化してみた（つもり）
16/01/11 1.048対応
16/04/20 1.071対応
16/09/24 1.094対応
18/01/07 1.169対応
20/02/15 レベルアップ時のウィンドウで能力値を横に幾つ並べるかの設定を追加
         移動の能力値をレベルアップ時に表示しない設定を追加
20/12/30 (function() {   })();が抜けていた為追加
22/07/17  レベルアップ時のアニメ画像の位置を調整出来るようにした
          【LvUp時でパラメータが上昇した時の音を変えたい】【LvUp時でパラメータが下降した時の音を変えたい】の説明を変更
22/10/10  オリジナルアニメ画像のファイル名を変更（pluginエラー対策）
23/10/27  設定の定義やクラスの宣言位置を修正


■対応バージョン
　SRPG Studio Version:1.287


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

//--------------------------------------------
// 設定
//--------------------------------------------
// 成長時に強制描画するか
isMaxMinParamForceDraw = false;

// 能力変化時に音を鳴らすか
isParaSound     = true;

// レベルアップ表示完了まで決定キーを押してもスキップしない？（true:スキップしない false:スキップ可能）
isLvUpNoSkip    = true;

LvUpStatusCol   = 3;					// レベルアップ時の能力を横に幾つ並べるか（デフォルトは3）
isMovNoDisplay  = false; 				// 移動の能力値をレベルアップ時に表示しないか（true:表示しない false:表示（従来通り））

//-------
// 以下はオリジナル画像(picture)を使う場合に書き換えてください
//-------
// オリジナル画像を使ってアニメ描画するか（オリジナル画像を使う場合true、使わない場合falseにしてください）
LvUpAnimeOriginalPicUse = false;

// オリジナル画像のID（実際に使うオリジナル画像のIDを指定してください）
LvUpAnimeOriginalPicID = 0;

// アニメ画像幅（ドット数）
LvUpAnimeWitdh  = 24;

// アニメ画像高さ（ドット数）
LvUpAnimeHeight = 24;

// アニメ画像のコマ数(多くても8コマくらいにしてください)
LvUpAnimeNum    = 5;

LvUpAnimeHoseiX = 0;		// アニメ画像の描画位置補正X
LvUpAnimeHoseiY = 0;		// アニメ画像の描画位置補正Y




//-------
// 以下はオリジナルSEを使う場合に書き換えてください
//-------
// 能力増減のSEをオリジナルのものにするか（true:能力増減のSEはオリジナル false:従来通り）
isUseOriginalSound = false;

// 能力上昇時に鳴らすオリジナルSEのID
LvUp_ParaUpOriginalSoundID = 0;

// 能力低下時に鳴らすオリジナルSEのID
LvUp_ParaDownOriginalSoundID  = 0;




//--------------------------------------------
// 以下プログラム
//--------------------------------------------

//------------------------------------
// ExperienceParameterWindowクラス
//------------------------------------
ExperienceParameterWindow.moveWindowContent= function() {
		// this._scrollbar.moveInput() === ScrollbarInput.SELECTで判定すると、決定音を検出する
		this._scrollbar.moveScrollbarCursor();

		// レベルアップ表示完了していなくても決定キーを押たらスキップする場合
		if( isLvUpNoSkip === false ) {
			if (InputControl.isSelectAction()) {
				return MoveResult.END;
			}
		}

		// レベルアップ表示完了まで決定キーを押してもスキップしない場合
		else if( this._scrollbar.isLvUpParaDisplayEnd() ) {
			if (InputControl.isSelectAction()) {
				return MoveResult.END;
			}
		}
		return MoveResult.CONTINUE;
};


ExperienceParameterWindow.setExperienceParameterData= function(targetUnit, growthArray) {
		var i;
		var count = growthArray.length;
		var arr = [];
		
		for (i = 0; i < count; i++) {
			arr[i] = growthArray[i];
		}
		
		this._scrollbar = createScrollbarObject(StatusScrollbarLvUp, this);
		this._scrollbar.enableStatusBonus(true);
		this._scrollbar.setStatusFromUnit(targetUnit);
		this._scrollbar.setStatusBonus(arr);
};




//------------------------------------
// StructureBuilderクラス
//------------------------------------
// ステータス格納領域の生成
StructureBuilder.buildStatusEntryLvUp= function() {
		return {
			type: 0,
			param: 0,
			bonus: 0,
			index: 0,
			isRenderable: false,
			max: 0,						// 上限値
			min: 0,						// 下限値
			prev_param: 0				// 成長前のステータス
		}
};




})();
//--------------------------------------------
// 以下は外部宣言クラスなど
//--------------------------------------------




//------------------------------------
// StatusScrollbarLvUpクラス
//------------------------------------
var LvUpParaUpSound = 'commandcursor';	// LvUp時にパラメータが上昇した時の音(RTPの場合)
var LvUpParaDwSound = 'operationblock';	// LvUp時にパラメータが下降した時の音(RTPの場合)

var StatusScrollbarLvUp = defineObject(StatusScrollbar,
{
	_lvup_draw_index: -1,		// LVUP矢印描画位置
	_animeCounter: null,
	_AnimeIndex: -1,
	_AnimeExecuteFlg: false,
	_isLvUpFinished: false,
	_animePic: null,
	_originalSoundHandle : null,
	_originalSoundId : -1,

	moveScrollbarContent: function() {
		if (this._cursorCounter.moveCycleCounter() !== MoveResult.CONTINUE) {
			if (this._riseCursorSrcIndex === 0) {
				this._riseCursorSrcIndex = 1;
			}
			else {
				this._riseCursorSrcIndex = 0;
			}

			// this._lvup_draw_indexのカウントアップ（LVUP矢印描画変化のタイミングでチェックしている）
			var i;
			// とりあえず一つカウントアップ
			var count = this._statusArray.length;
			if( this._lvup_draw_index < count ) {
				this._lvup_draw_index++;
			}

			// 能力が上がらなかったパラメータはスキップして次に変化した能力まで進める
			for (i = this._lvup_draw_index; i < count; i++) {

				// 能力が変化していれば、this._lvup_draw_indexをそのインデックス値にする
				if( this._statusArray[i].bonus != 0 ) {

					if( this._statusArray[i].bonus > 0 ) {
						if ((isMaxMinParamForceDraw === true) || (this._statusArray[i].param < this._statusArray[i].max)) {
							// 能力が上がった時のサウンド
							this._playParaUpSound();

							this._lvup_draw_index = i;

							// アニメ描画実行フラグの設定＆アニメの表示コマ位置初期化
							this._AnimeExecuteFlg = true;
							this._AnimeIndex = -1;
							break;
						}
					}
					else {
						if ((isMaxMinParamForceDraw === true) || (this._statusArray[i].param > this._statusArray[i].min)) {
							// 能力が下がった時のサウンド
							this._playParaDwSound();

							this._lvup_draw_index = i;

							// アニメ描画実行フラグの設定＆アニメの表示コマ位置初期化
							this._AnimeExecuteFlg = true;
							this._AnimeIndex = -1;
							break;
						}
					}
				}
			}
			if (i >= count) {
				this._isLvUpFinished = true;
			}
		}

		if (this._animeCounter.moveCycleCounter() !== MoveResult.CONTINUE) {
			// アニメ描画実行フラグがtrueならアニメの表示コマ位置＋１
			if( this._AnimeExecuteFlg === true ) {
				this._AnimeIndex++;
			}
		}
		
		return MoveResult.CONTINUE;
	},
	
	drawScrollContent: function(x, y, object, isSelect, index) {
		var statusEntry = object;
		var n = statusEntry.param;
		var text = statusEntry.type;
		var textui = this.getParentTextUI();
		var font = textui.getFont();
		var length = this._getTextLength();
		
		TextRenderer.drawKeywordText(x, y, text, length, ColorValue.KEYWORD, font);
		x += this._getNumberSpace();
		
		statusEntry.textui = textui;
		if (statusEntry.isRenderable) {
			ParamGroup.drawUnitParameter(x, y, statusEntry, isSelect, statusEntry.index);
		}
		else {
			if (n < 0) {
				n = 0;
			}
			
			NumberRenderer.drawNumber(x, y, n);
		}
		
		if (statusEntry.bonus > 0) {
			// 上昇した能力値は、先頭から一つずつ描画する
			//（this._lvup_draw_indexはmoveScrollbarContent()でカウントアップしている）
			if (index <= this._lvup_draw_index) {
				// 能力上限に達していた場合、能力上昇を書かない
				if ((isMaxMinParamForceDraw === true) || (statusEntry.param < statusEntry.max)) {
					this._drawBonus(x, y, statusEntry);
				}

				// アニメ描画処理実施
				if( this._AnimeExecuteFlg === true && index === this._lvup_draw_index ) {
					this._drawOriginalAnime(x, y);	// 実際に描画するかどうかはメソッド内でチェックしている

					if( this._AnimeIndex >= (LvUpAnimeNum-1)) {	// 描画枚数分アニメを実施したら停止
						this._AnimeExecuteFlg = false;
					}
				}
			}
		}
		else if (statusEntry.bonus < 0) {
			// 下降した能力値は、先頭から一つずつ描画する
			//（this._lvup_draw_indexはmoveScrollbarContent()でカウントアップしている）
			if (index <= this._lvup_draw_index) {
				// 能力下限に達していた場合、能力下降を書かない
				if ((isMaxMinParamForceDraw === true) || (statusEntry.param > statusEntry.min)) {
					this._drawBonus(x, y, statusEntry);
				}

				// アニメ描画処理実施
				if( this._AnimeExecuteFlg === true && index === this._lvup_draw_index ) {
					this._drawOriginalAnime(x, y);	// 実際に描画するかどうかはメソッド内でチェックしている

					if( this._AnimeIndex >= (LvUpAnimeNum-1)) {	// 描画枚数分アニメを実施したら停止
						this._AnimeExecuteFlg = false;
					}
				}
			}
		}
	},

	setStatusFromUnit: function(unit) {
		var i, j;
		var count = ParamGroup.getParameterCount();
		
		this._statusArray = [];
		
		for (i = 0, j = 0; i < count; i++) {
			if (this._isParameterDisplayable(i)) {
				this._statusArray[j++] = this._createStatusEntry(unit, i);
			}
		}
		
		this.setScrollFormation(this.getDefaultCol(), this.getDefaultRow());
		this.setObjectArray(this._statusArray);

		// カーソル描画用のカウンタの設定
		this._cursorCounter = createObject(CycleCounter);
		this._cursorCounter.setCounterInfo(20);
		this._cursorCounter.disableGameAcceleration();

		// アニメ描画用のカウンタの設定
		this._animeCounter = createObject(CycleCounter);
		this._animeCounter.setCounterInfo(2);
		this._animeCounter.disableGameAcceleration();
	},
	
	getDefaultCol: function() {
		return LvUpStatusCol;
	},
	
	// レベルアップ時のパラメータ表示が完了したか
	isLvUpParaDisplayEnd: function() {
		return this._isLvUpFinished;
	},

	_createStatusEntry: function(unit, index) {
		var statusEntry = StructureBuilder.buildStatusEntryLvUp();
		
		statusEntry.type = ParamGroup.getParameterName(index);
		statusEntry.param = ParamGroup.getClassUnitValue(unit, index);
		statusEntry.bonus = 0;
		statusEntry.index = index;
		statusEntry.isRenderable = ParamGroup.isParameterRenderable(index);
		statusEntry.max   = ParamGroup.getMaxValue(unit, index);	// 上限値
		statusEntry.min   = ParamGroup.getMinValue(unit, index);	// 下限値
		
		return statusEntry;
	},

	_isParameterDisplayable: function(index) {
		if( isMovNoDisplay === true && ParamGroup.getParameterType(index) === UnitParameter.MOV.getParameterType() ) {
			return false;
		}
		
		return StatusScrollbar._isParameterDisplayable.call(this, index);
	},

	// 能力が上がった時のサウンド
	_playParaUpSound: function() {
		if(isParaSound === true) {
			if( isUseOriginalSound === false ) {
				MediaControl.soundDirect(LvUpParaUpSound);
			}
			else {
				this._getOriginalSound(LvUp_ParaUpOriginalSoundID);
			}
		}
	},

	// 能力が下がった時のサウンド
	_playParaDwSound: function() {
		if(isParaSound === true) {
			if( isUseOriginalSound === false ) {
				MediaControl.soundDirect(LvUpParaDwSound);
			}
			else {
				this._getOriginalSound(LvUp_ParaDownOriginalSoundID);
			}
		}
	},

	// オリジナルで作成した効果音の取得
	_getOriginalSound: function(sound_id) {
		if( this._originalSoundId != sound_id ) {
			this._originalSoundId     = sound_id;
			this._originalSoundHandle = root.createResourceHandle(false, this._originalSoundId, 0, 0, 0);
		}

		if( this._originalSoundHandle != null ) {
			MediaControl.soundPlay(this._originalSoundHandle);
		}
		else {
			root.log('オリジナルサウンドID不正:'+this._originalSoundId);
		}
	},

	// オリジナルで作成したアニメ用画像の取得
	_getOriginalAnimePic: function(anime_pic_id) {
		var isRuntime = false;
		var list, count, pic;
		
		list = root.getBaseData().getGraphicsResourceList(GraphicsType.PICTURE, false);
		count = list.getCount();
		if (count !== 0) {
			pic = list.getDataFromId(anime_pic_id);
			if (pic !== null) {
				return pic;
			}
		}
		return null;
	},

	// オリジナルで作成したアニメの描画
	_drawOriginalAnime: function(x, y) {
		if( LvUpAnimeOriginalPicUse === true ) {
			var ySrc = 0;
			var n = this._AnimeIndex;
			if( this._animePic === null ) {
				this._animePic = this._getOriginalAnimePic(LvUpAnimeOriginalPicID);
			}
			var width = LvUpAnimeWitdh;
			var height = LvUpAnimeHeight;
			
			if (this._animePic !== null) {
				this._animePic.drawParts(x-10+LvUpAnimeHoseiX, y+LvUpAnimeHoseiY, width * n, ySrc, width, height);
			}
			else {
				root.log('オリジナルアニメID不正:'+LvUpAnimeOriginalPicID);
			}
		}
	}
}
);


