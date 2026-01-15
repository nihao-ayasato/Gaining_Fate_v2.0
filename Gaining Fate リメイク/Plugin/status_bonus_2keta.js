
/*--------------------------------------------------------------------------
  
　ステータス画面　ボーナス表示(2桁)

■概要
ステータス画面で、武器やアイテムによるボーナス値を能力値の横に表示します。

■数字画像の差し替え
本スクリプトを使う場合、リソースの数字は添付の画像（数字2.png）に差し替えてください。
（差し替えないと、オリジナル画像の色の関係でかなり見辛くなります）

差し替える場合、手順は以下のようになります。
１．自分のプロジェクトのUIフォルダ内に数字2.pngをコピーする
２．SRPG STUDIOを起動する
３．リソース→UIの確認を選び、オリジナルのnumberを選択して数字2.pngを追加してOKを押す
４．ツール→リソース使用箇所を選び、UIタブ内の数字を選んで画像をオリジナルの数字2に差し替えてOKを押す
５．本ソースにあるvar STATE_PLUS_NUMBER_BLUE_USE = true;のtrueをfalseに書き換える

■ステートによる能力ボーナスの非表示機能について
カスタムパラメータ{_notStateDisp:1}のついかステートの能力ボーナスはステータス表示に反映されなくなりました。
ユニットを無限移動で広範囲に移動させたいマップ（酒場など）において、ステートによる移動力加算を表示させたくない場合に使用出来ます。

■カスタマイズ
　１．能力値＋ボーナスの表示を３桁＋３桁にしたい
　　　→設定（外部）にある以下①～③を変更してみてください
　　　　①「var BONUS2KETA_NUMBER_SPACE = 56;」の56を48にする
　　　　②「var BONUS2KETA_VALUE_HOSEI_X = 18;」の18を26にする
　　　　③プロジェクトの「リソース」→「リソース使用箇所」の『文字列』タブを選択して表示名を以下のように変えて下さい
　　　　　『守備力→守備』『魔防力→魔防』『移動力→移動』『熟練度→熟練』（熟練度を使っていない場合は変更不要です）
　　　　※目視で調整：ステータス画面項目位置.jsと併用していて能力値の横幅を広げているのであれば
　　　　　①③は異なる値に調整しないといけない場合もあります

　２．ボーナス値の前にある±記号を変えたい
　　　→「BONUS2KETA_SIGNWORD_PLUS = '+'」「var BONUS2KETA_SIGNWORD_MINUS = '-';」の''の中を変えて下さい
　　　　（'＋'と'－'に書き換えると±記号を全角に出来ます）

　３．ボーナス値の前にある±記号の色を変えたい
　　　→「var BONUS2KETA_SIGN_Color = 0x40bfff;」の数値を変えて下さい
　　　　　（例）赤色：0xff0000、緑色：0x00ff00、青色：0x0000ff、黄色：0xffff00、紫：0xff00ff、水色：0x00ffff、黒：0x000000
　　　　　　　　暗い赤色：0x800000、暗い緑色：0x008000、暗い青色：0x000080、暗い黄色：0x808000、暗い紫：0x800080、暗い水色：0x008080


15/6/29 	【ステータス画面のボーナス表示を2桁に】
			　　ステータス画面表示のボーナス値を2桁表示の位置に調整しました。
			　　（3桁の値を入れると+の文字と重なるので注意）

15/8/4 		【ステータスが上限に達した場合に色変えを行う】
			　　上限になったステータスは赤色で表示するよう修正しました。

15/8/5 		標準のステータス画面と幅が同じになるよう、数値の表示位置を調整しました。
			なお、武器とアイテムによるボーナスは２桁（最大＋９９）までしか正しく表示されなくなっていますので注意してください。
			（武器とアイテムのボーナスが＋１００を超えた場合、'＋'の記号の上から上書きしてしまいます）

15/8/6		1.024にて追加されたステートの値も反映するように変更
			（多分1.023以前のバージョンだとエラーが出て動きません）

15/8/7		色変えを以下の形に変更
			・【能力値】能力上限値に達している場合は緑
			・【ボーナス値】ステート付与でマイナスされている場合は赤
			・【ボーナス値】ステート付与でプラスされている場合は青
			　なお今回の修正に伴い、数字画像の差し替えが必要になります。

15/10/05	熟練度表示スクリプトと組み合わせた時、ステータス画面に熟練度が表示されないよう修正
15/11/04	1.037対応
15/12/04	敵の能力値を見えなくするスクリプトに対応
16/ 1/06	OT_AddStatusスクリプトに対応（まだ完成してないらしいので、仮対応です）
16/ 1/11	1.048対応
			OT_AddStatusスクリプトへの対応を一時削除（1.048の変更の影響がOT_AddStatusスクリプトでも発生すると考えられる為）
16/ 1/16	1.050対応
16/ 3/26	aliasを追加
16/ 9/24	1.094対応
17/ 1/14	アイテムの使用でも上限表示で数値の色を変えるよう対応
　　　　　　ステートによる能力プラス時の色を公式オリジナルの青色数字に変更
　　　　　　クラスボーナスがマイナスの場合、能力上限になっても正しく色が変化しないバグを修正
17/12/23	Officialのcustom-unit.jsとの併用に対応
18/01/07	1.169対応
20/01/25	ステートのカスタムパラメータ{_notStateDisp:1}に対応
21/03/19	能力値の数値とボーナス、±記号の表示位置の設定を追加
22/03/19	±記号の色変え設定を追加
22/03/26	ボーナスの±記号を変更出来るよう設定項目へ追加


■対応バージョン
　SRPG Studio Version:1.256


■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/

//-------------------------------------------------------
// 設定（外部）
//-------------------------------------------------------
var STATE_PLUS_NUMBER_BLUE_USE = true;	// ステートによるプラスボーナスの色に青色を使うか（true:青色 false:濃い青色）

var BONUS2KETA_NUMBER_SPACE = 62;		// 能力値の描画開始位置X補正(デフォルトは56)
var BONUS2KETA_SIGN_HOSEI_X = 14;		// ボーナスの±記号の描画開始位置X補正(デフォルトは11)
var BONUS2KETA_SIGN_Color   = 0x40bfff;	// ±記号の色（デフォルトは0x40bfff）　色（0x000000:黒 0xFF0000:赤 0x00FF00:緑 0x0000FF:青 0xFFFFFF:白）
var BONUS2KETA_SIGNWORD_PLUS = '+'; 	// ボーナスの+記号（'＋'とすれば全角になります）
var BONUS2KETA_SIGNWORD_MINUS = '-'; 	// ボーナスの-記号（'－'とすれば全角になります）
var BONUS2KETA_VALUE_HOSEI_X = 11;		// ボーナス値の表示開始位置X補正(デフォルトは18)

var ITEMUSE2KETA_NUMBER_SPACE = 75;		// アイテムの使用での描画開始位置X補正(デフォルトは75)




(function() {




//-------------------------------------------------------
// UnitMenuBottomWindow
//-------------------------------------------------------
// ステータス画面下部ウィンドウ：ユニットメニューデータの設定
var alias = UnitMenuBottomWindow.setUnitMenuData;
UnitMenuBottomWindow.setUnitMenuData= function() {
		alias.call(this);
		
		// ステータス数値部の描画クラス生成（UnitStatusScrollbar2クラスを生成するようにした）
		delete this._statusScrollbar;
		this._statusScrollbar = createScrollbarObject(UnitStatusScrollbar2, this);
		// ステータスボーナスの描画を許可
		this._statusScrollbar.enableStatusBonus(false);
}




//-------------------------------------------------------
// StructureBuilder
//-------------------------------------------------------
// ステータス格納領域の生成
StructureBuilder.buildStatusEntryEx= function() {
		return {
			type: 0,
			param: 0,
			bonus: 0,
			index: 0,
			isRenderable: false,
			max: 0,		// 上限値
			state: 0	// ステート値
		}
};




//-------------------------------------------------------
// ItemUserWindow
//-------------------------------------------------------
// アイテム使用ウィンドウ
var alias2 = ItemUserWindow.initialize;
ItemUserWindow.initialize= function() {
		alias2.call(this);

		// ステータス数値部の描画クラス生成（ItemUseStatusScrollbar2クラスを生成するようにした）
		delete this._statusScrollbar;
		this._statusScrollbar = createScrollbarObject(ItemUseStatusScrollbar2, this);
}




//-------------------------------------------------------
// TextRenderer
//-------------------------------------------------------
TextRenderer.drawSignTextColor= function(x, y, text, color) {
		var font = this.getDefaultFont();
		
		this.drawKeywordText(x, y, text, -1, color, font);
}


})();




//-------------------------------------------------------
// UnitStatusScrollbar2クラス（UnitStatusScrollbarクラスの派生）
//-------------------------------------------------------
var UnitStatusScrollbar2 = defineObject(UnitStatusScrollbar,
{
	
	drawScrollContent: function(x, y, object, isSelect, index) {
		var statusEntry = object;
		var n = statusEntry.param;
		var text = statusEntry.type;
		var textui = this.getParentTextUI();
		var font = textui.getFont();
		var length = this._getTextLength();
		var max = statusEntry.max;

		x = x - 6;
		TextRenderer.drawKeywordText(x, y, text, length, ColorValue.KEYWORD, font);
		x += this._getNumberSpace();
		
		statusEntry.textui = textui;
		if (statusEntry.isRenderable) {
			ParamGroup.drawUnitParameter(x-4, y, statusEntry, isSelect, statusEntry.index);
		}
		else {
			if (n < 0) {
				n = 0;
			}
			if( n == max )
			{
				// 最大値の場合
				// 数字の描画（色指定付き）
				// ※数字の色に関しては、リソースに画像登録されたものを上から0番、1番…と指定して使用する（リソース参照）
				//   デフォルトの場合、0番目:白、1番目：青、2番目：緑、3番目：赤、4番目：黒、となっている
				NumberRenderer.drawNumberColor(x, y, n, 2, 255);		// 数字を緑で表示
			}
			else
			{
				// 最大値でない場合
				NumberRenderer.drawNumber(x, y, n);
			}
		}
		
		if (statusEntry.bonus !== 0) {
			this._drawBonus(x, y, statusEntry);
		}
	},

	getObjectWidth: function() {
		var width = 80;
		
		if (this._isBonus) {
			width += 20;
			if (this._isCursorDraw) {
				width += 16;
			}
		}
		
		return width;
	},

	// ステータス画面で描画するパラメータの名称、値、ボーナス値を設定する
	_createStatusEntry: function(unit, index, weapon) {
//		var statusEntry = StructureBuilder.buildStatusEntry();
		var statusEntry = StructureBuilder.buildStatusEntryEx();			// ステータスエントリクラスを変更
		
		statusEntry.type = ParamGroup.getParameterName(index);
		statusEntry.param = ParamGroup.getClassUnitValue(unit, index);
//		statusEntry.bonus = 0;
		statusEntry.index = index;
		statusEntry.isRenderable = ParamGroup.isParameterRenderable(index);
		// ボーナス、上限、ステート値をセット
		var n = ParamGroup.getClassUnitValue(unit, index) + ParamGroup.getUnitTotalParamBonus(unit, index, weapon) + this.getStateParameter(unit, index);
		n = FusionControl.getLastValue(unit, index, n);
		statusEntry.bonus = n - statusEntry.param;							// ボーナス＝（フュージョン後の数値－素の値）
		statusEntry.max   = ParamGroup.getMaxValue(unit, index);			// 上限値
		// クラスボーナスがマイナスの場合、その分上限値を下げる
		if( ParamGroup.getParameterBonus(unit.getClass(), index) < 0 ) {
			statusEntry.max += ParamGroup.getParameterBonus(unit.getClass(), index);
		}
		statusEntry.state = this.getStateParameter(unit, index);	// ステート値
		
		return statusEntry;
	},
	
	// ボーナス値の描画
	_drawBonus: function(x, y, statusEntry) {
		var n = statusEntry.bonus;
		var state = statusEntry.state;
		
		x += BONUS2KETA_SIGN_HOSEI_X;
	
		if (statusEntry.bonus > 0) {
			TextRenderer.drawSignTextColor(x, y, BONUS2KETA_SIGNWORD_PLUS, BONUS2KETA_SIGN_Color);
		}
		else {
			// // drawNumberにマイナスは指定できないため、ここで調整
			n = statusEntry.bonus * -1;
			TextRenderer.drawSignTextColor(x, y, BONUS2KETA_SIGNWORD_MINUS, BONUS2KETA_SIGN_Color);
		}
		
		x += BONUS2KETA_VALUE_HOSEI_X;	// ボーナス値の表示開始位置

		// 数字の描画（色指定付き）
		// ※数字の色に関しては、リソースに画像登録されたものを上から0番、1番…と指定して使用する（リソース参照）
		//   デフォルトの場合、0番目:白、1番目：青、2番目：緑、3番目：赤、4番目：黒、となっている

		if( state < 0 )
		{
			// ステート付与によりマイナスの場合
			NumberRenderer.drawNumberColor(x, y, n, 3, 255);		// 数字を赤で表示
		}
		else if( state > 0 )
		{
			if( STATE_PLUS_NUMBER_BLUE_USE == true ) {
				// ステート付与によりプラスの場合
				NumberRenderer.drawNumberColor(x, y, n, 1, 255);		// 数字を青で表示
			}
			else {
				// ステート付与によりプラスの場合
				NumberRenderer.drawNumberColor(x, y, n, 4, 255);		// 数字を濃い青で表示（数値用画像を数字2.pngに差し替えておく必要があります）
			}
		}
		else
		{
			// ステート付与による変化が0の場合
			NumberRenderer.drawNumber(x, y, n);
		}
		
		if (this._isCursorDraw) {
			this._drawRiseCursor(x, y, statusEntry.bonus > 0);
		}
	},
	
	_getNumberSpace: function() {
		return BONUS2KETA_NUMBER_SPACE;
	},
	
	// 「ターン毎のボーナス減少値」を考慮したパラメータ値を取得する
	// （ステートのカスタムパラメータ{_notStateDisp:1}を考慮する）
	getStateParameter: function(unit, index) {
		var i, state, turnState;
		var list = unit.getTurnStateList();
		var count = list.getCount();
		var value = StateControl.getStateParameter(unit, index);	// ステートによる移動力算出処理を呼び出す
		
		for (i = 0; i < count; i++) {
			turnState = list.getData(i);
			state = turnState.getState();
			if( typeof state.custom._notStateDisp !== 'number' ) {
				continue;
			}
			// カスタムパラメータ{_notStateDisp:1}のついたステートによるボーナス分は差し引く
			value -= ParamGroup.getDopingParameter(turnState, index);
		}
		
		return value;
	}
}
);




//-------------------------------------------------------
// ItemUseStatusScrollbar2クラス
//-------------------------------------------------------
var ItemUseStatusScrollbar2 = defineObject(UnitStatusScrollbar2,
{
	getObjectWidth: function() {
		return 120;
	},
	
	getSpaceX: function() {
		return 15;
	},
	
	_getNumberSpace: function() {
		return ITEMUSE2KETA_NUMBER_SPACE;
	}
}
);


