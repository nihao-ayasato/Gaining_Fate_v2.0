
/*--------------------------------------------------------------------------
  
  ユニットメニューの下ウインドウに2ページ目を追加します。
  ユニットウインドウの2ページ目に武器(杖)熟練度を表示します。
  
  ■カスタマイズしたい
  　・立ち絵を表示したい
  　　　→立ち絵表示スクリプトをプラグインに入れた状態であれば、立ち絵を表示することが可能です。

  　　　　本ソースの設定項目にある、立ち絵を表示するか（var isDisplayStatusPicture_WeaponLevelWindow = false;）の部分を
  　　　　var isDisplayStatusPicture_WeaponLevelWindow = true;にすると、立ち絵を表示します。

  　　　　（立ち絵の表示位置や、ウィンドウの手前/奥に表示するかといった設定は、
  　　　　　立ち絵表示スクリプト内の立ち絵表示_ステータス画面.jsでの設定項目を利用して表示するようになっています）

  　・バーゲージを表示したい
　　　　事前準備としてMaterialフォルダへのコピーが必要です。
　　　　　Materialフォルダへ$JukurendoBarフォルダをコピーし、フォルダ名をJukurendoBarに書換えてください。
　　　　　（$JukurendoBarとなっているのは、そのままプラグインフォルダに突っ込まれてエラーになるのを防ぐためです）

　　　　その上で本ソース内の「var useJukurendoBar = false;」のfalseをtrueに書き換えてください。

　　　　※バー画像の仕様
　　　　　　幅30ピクセル、高さ11ピクセルの画像を縦に11枚描画してあります。
　　　　　　これは上から順に熟練度が次のレベルまで0%、10%、20%、30%、40%、50%、60%、70%、80%、90%、100%分溜まっている時の画像になっています。

　　　　　　なお、バー画像の幅や高さ、画像名は変更が可能です。

　　　　　　『バー画像1枚当たりの幅を変えたい場合』
　　　　　　　　JUKURENDO_BAR_SETTINGの中のPicWidth: 30の部分を画像1枚当たりの幅に合わせて変更してください。

　　　　　　『バー画像1枚当たりの高さを変えたい場合』
　　　　　　　　JUKURENDO_BAR_SETTINGの中のPicHeight: 11の部分を画像1枚当たりの高さに合わせて変更してください。

　　　　　　『バー画像のファイル名を変えたい場合』
　　　　　　　　JUKURENDO_BAR_SETTINGの中のGaugeImg: 'jukurendo_bar.png'の「jukurendo_bar.png」を変えたいファイル名に変更してください。
　　　　　　　　そして画像をMaterial\JukurendoBarフォルダの中へ入れてください。



  作成者: CB
  
  更新履歴:
  2015/07/03 新規作成
  2015/07/06 杖の熟練度実装に対応
  2015/10/05 ステータス画面で熟練度が表示されないよう修正（作者じゃないけど）
  2015/11/05 1.037対応（作者じゃないけど）
  2016/01/11 1.048対応（作者じゃないけど）
  2016/04/21 立ち絵表示スクリプトを組み込んでいる場合、立ち絵表示が可能となる設定を追加（作者じゃないけど）
  2016/06/09 バーゲージ表示対応（作者じゃないけど）
             ※JukurendoBarフォルダをMaterialフォルダ内にコピーする必要があります。
  2016/08/01 バーゲージ画像を差し替えた場合の設定を簡易に行えるように修正（作者じゃないけど）
  
--------------------------------------------------------------------------*/

(function() {

//--------------------------------------------------------------------------
// 設定項目（通常はこの部分を設定するだけでOKです）
//--------------------------------------------------------------------------

// 立ち絵を表示するか（true:表示する false:表示しない）
var isDisplayStatusPicture_WeaponLevelWindow = false;

// 熟練度のバーゲージを表示するか（true:表示する false:表示しない）
var useJukurendoBar = false;


// 描画用の定義(Materialフォルダ用)
JUKURENDO_BAR_SETTING = {
	  Folder        : 'JukurendoBar'				// Materialフォルダ内に作ったフォルダ名
	, GaugeImg      : 'jukurendo_bar.png'			// バー表示に使う画像ファイル名
	, PicWidth      : 30							// バー画像1枚あたりの幅
	, PicHeight     : 11							// バー画像1枚あたりの高さ
};




//---------------------------------------------------------------------
// 処理部分
//---------------------------------------------------------------------

var alias1 = UnitMenuScreen._configureBottomWindows;
UnitMenuScreen._configureBottomWindows = function(groupArray) {
	alias1.call(this, groupArray);
	
	groupArray.appendWindowObject(UnitMenuBottomSecondWindow, this);
};

//ユニットウインドウの2ページ目に武器熟練度を表示
var UnitMenuBottomSecondWindow = defineObject(BaseMenuBottomWindow,
{
	_unit: null,

	changeUnitMenuTarget: function(unit) {
		this._unit = unit;
	},
	
	drawWindowContent: function(x, y) {
		this._drawUnitWeaponLv(x, y);

		// 立ち絵を表示する為の処理
		if( isDisplayStatusPicture_WeaponLevelWindow == true && typeof StatusPicture_DispUpperClass !== 'undefined' ) {
			var cls_LH = ClassRank.LOW;		// デフォルトは下級職

			// 上級職になると違う立ち絵を表示する設定が有効な場合、現在のクラスが下級か上級かを設定
			if( StatusPicture_DispUpperClass == true ) {
				cls_LH = this._unit.getClass().getClassRank();
			}

			// 立ち絵の描画処理
			if( StatusPictureIsFront == true ) {
				var idx = ContentRenderer.calcPercentIndex(this._unit, StatusPicture_PercentTbl);

				ContentRenderer.drawUnitImage(StatusPicture_X, StatusPicture_Y, this._unit, StatusPicture_ID[cls_LH][idx], StatusPictureRev, StatusPictureAlpha);
			}
		}
	},
	
	_drawUnitWeaponLv: function(xBase, yBase) {
		var i, c, ParamName, ParamValue;
		var unit = this._unit;
		var textui_name = this._getWindowTextUI_Name();
		var color_name = textui_name.getColor();
		var font_name = textui_name.getFont();
		var textui_param = this._getWindowTextUI_Param();
		var color_param = textui_param.getColor();
		var font_param = textui_param.getFont();
		var length = this._getUnitTextLength();
		var x = xBase + 15;
		var y = yBase + 7;
		var xspace = 0;
		var yspace = 0;
		var col = 4;
		var weapon = ItemControl.getEquippedWeapon(unit); 
		var count = ParamGroup.getParameterCount();
		var min;
		var max;
		var index;
		var pic = root.getMaterialManager().createImage(JUKURENDO_BAR_SETTING.Folder, JUKURENDO_BAR_SETTING.GaugeImg);

		i = ParamGroup.getMainStatusCount();		// 移動力の次のパラメータ位置を取得し、iに入れる

		// HP～移動力を入れないようにして開始する（iには移動力の次のパラメータ位置が入っている）
		for (c = 1, xspace = 0; i < count; i++, c++){
			// パラメータ名（熟練度に対応する武器名）の記述
			ParamName = ParamGroup.getParameterName(i);
			TextRenderer.drawText(x + xspace, y + yspace, ParamName, length, color_name, font_name);
			
			// パラメータの値（熟練度の値）の記述
			//  武器が装備可能か調べる
			if(this._isWeaponTypeEquiped(unit, ParamName)) {
				// 装備可能な場合、ボーナスも加算する
				ParamValue = ParamGroup.getClassUnitValue(unit, i) + ParamGroup.getUnitTotalParamBonus(unit, i, weapon);
				
				// すべての武器タイプでクラスのカスタムパラメータのみを使用
				if(ParamName === '剣') {
					ParamValue = unit.getClass().custom.swd || 0;
				} else if(ParamName === '槍') {
					ParamValue = unit.getClass().custom.lnc || 0;
				} else if(ParamName === '斧') {
					ParamValue = unit.getClass().custom.axe || 0;
				} else if(ParamName === '格闘') {
					ParamValue = unit.getClass().custom.pug || 0;
				} else if(ParamName === '弓') {
					ParamValue = unit.getClass().custom.arw || 0;
				} else if(ParamName === '炎') {
					ParamValue = unit.getClass().custom.fire || 0;
				} else if(ParamName === '雷') {
					ParamValue = unit.getClass().custom.thunder || 0;
				} else if(ParamName === '氷') {
					ParamValue = unit.getClass().custom.ice || 0;
				} else if(ParamName === '光') {
					ParamValue = unit.getClass().custom.light || 0;
				}
				
				// 熟練度の値に応じて、表示する文字を設定
				text = ItemSentence.WeaponLevel.replaceWeaponLevel(ParamValue);
			} else if((ParamName === '杖') && (unit.getClass().getClassOption() & ClassOptionFlag.WAND)){
				// 杖が使用可能な場合、クラスのカスタムパラメータのみを使用
				ParamValue = unit.getClass().custom.wand || 0;
				// 熟練度の値に応じて、表示する文字を設定
				text = ItemSentence.WeaponLevel.replaceWeaponLevel(ParamValue);
			} else {
				// 装備できない場合は、'-'を表示
				text = '-';
			}
			
			xspace += 40;
			TextRenderer.drawText(x + xspace, y + yspace, text, length, color_param, font_param);
			
			// useJukurendoBarがtrue、かつ、装備可能な場合、熟練度のバーゲージを表示
			if( useJukurendoBar && text != '-' ) {
				min = ItemSentence.WeaponLevel.getNowWeaponLevelMin(ParamValue);
				max = ItemSentence.WeaponLevel.getNowWeaponLevelMax(ParamValue);
				if( ParamValue >= 251 ){
					// 熟練度が上限を超えていればバーゲージを満タン固定にする
					index = 10;
				}
				else {
					// 熟練度が上限でなければ、10%刻みの画像でバーゲージを表示
					index = Math.floor((ParamValue - min) * 10 / (max - min));
				}
				pic.drawParts(x + xspace-46, y + yspace+14, 0, index * JUKURENDO_BAR_SETTING.PicHeight, JUKURENDO_BAR_SETTING.PicWidth, JUKURENDO_BAR_SETTING.PicHeight);
			}

			if(c % col === 0) {
				xspace = 0;
				yspace += 30;
			} else {
				xspace += 55;
			}
		}
		
	},
	
	_isWeaponTypeEquiped: function(unit, paramname) {
		var i;
		var list = unit.getClass().getEquipmentWeaponTypeReferenceList();
		var count = list.getTypeCount();
		
		// クラスの装備可能武器のリストに入っているか
		for (i = 0; i < count; i++) {
			root.log(list.getTypeData(i).getName());
			if (paramname === list.getTypeData(i).getName()) {
				break;
			}
		}
		
		if (i === count) {
			return false;
		}
		
		return true;
	},
	
	_getWindowTextUI_Name: function() {
		return root.queryTextUI('infowindow_title');
	},

	_getWindowTextUI_Param: function() {
		return root.queryTextUI('default_window');
	},
	
	_getUnitTextLength: function() {
		return 180;
	}
}
);


})();
