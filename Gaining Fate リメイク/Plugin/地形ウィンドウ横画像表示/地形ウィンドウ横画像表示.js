/*--------------------------------------------------------------------------
  地形情報ウィンドウ横にPNG画像を表示するプラグイン

  マップエディタ（地形情報ウィンドウ）のそばに、指定したUI画像を表示します。
  Script/map/map-mapeditor.js の MapPartsCollection / MapParts.Terrain の
  表示位置に合わせて、オフセットで配置できます。

■使い方
  【方法A】Materialフォルダで画像を指定（推奨・表示されないときはこちら）
    1. プロジェクトの Material フォルダ内にフォルダを作る（例: TerrainSideImage）
    2. 表示したいPNGをその中に入れる（例: snapshot_11.png）
    3. 下の設定で UseMaterialFolder = true にし、MaterialFolder / MaterialFileName を指定

  【方法B】UIで画像を指定
    1. 表示したいPNGを「リソース→UI」に追加する
    2. TerrainSideImage_UIName にUIで付けた名前を指定（UseMaterialFolder = false のとき）

■設定
  - UseMaterialFolder: true=Materialフォルダの画像を使う, false=UIの画像を使う
  - MaterialFolder: Material内のフォルダ名（例: 'screenframe' または 'TerrainSideImage'）
  - MaterialFileName: 画像ファイル名（例: 'snapshot_11.png'）
  - TerrainSideImage_UIName: UI名（UseMaterialFolderがfalseのときのみ）
  - 地形ウィンドウが「右上」のとき: OffsetX_Top, OffsetY_Top
  - 地形ウィンドウが「右下」のとき: OffsetX_Bottom, OffsetY_Bottom
  - DrawWidth/DrawHeight: 表示サイズ
  - グローバルスイッチ: TerrainSideImage_GlobalSwitchId で指定したスイッチがONのときだけ表示
    （-1 でスイッチ無視＝常に表示。0＝1番目、1＝2番目…）

--------------------------------------------------------------------------*/
(function() {

//-------------------------------------------------------
// 設定（ここを編集）
//-------------------------------------------------------
// 【スイッチOFF（false）の時の設定】
var UseMaterialFolder_False     = true;   // true=Materialフォルダ指定, false=UI名指定
var MaterialFolder_False        = 'zokusei';   // Material内のフォルダ名
var MaterialFileName_False      = 'buki_info_white.png'; // 画像ファイル名（.png まで書く）
var TerrainSideImage_UIName_False   = 'snapshot_11';  // UI指定時のみ使用
// 地形ウィンドウが「右上」のときのオフセット
var TerrainSideImage_OffsetX_Top_False    = -20;
var TerrainSideImage_OffsetY_Top_False   = 80;
// 地形ウィンドウが「右下」のときのオフセット
var TerrainSideImage_OffsetX_Bottom_False = -20;
var TerrainSideImage_OffsetY_Bottom_False = -80;
var TerrainSideImage_DrawWidth_False  = 180;    // 0=画像の実サイズ
var TerrainSideImage_DrawHeight_False = 70;

// 【スイッチON（true）の時の設定】
var UseMaterialFolder_True     = true;   // true=Materialフォルダ指定, false=UI名指定
var MaterialFolder_True        = 'zokusei';   // Material内のフォルダ名
var MaterialFileName_True      = 'all_info_white.png'; // 画像ファイル名（.png まで書く）
var TerrainSideImage_UIName_True   = 'snapshot_11';  // UI指定時のみ使用
// 地形ウィンドウが「右上」のときのオフセット
var TerrainSideImage_OffsetX_Top_True    = -20;
var TerrainSideImage_OffsetY_Top_True   = 77;
// 地形ウィンドウが「右下」のときのオフセット
var TerrainSideImage_OffsetX_Bottom_True = -20;
var TerrainSideImage_OffsetY_Bottom_True = -84;
var TerrainSideImage_DrawWidth_True  = 180;    // 0=画像の実サイズ
var TerrainSideImage_DrawHeight_True = 144;

// グローバルスイッチ: このスイッチがONのときだけ画像を表示。 -1＝常に表示（スイッチ無視）
var TerrainSideImage_GlobalSwitchId = 7;  // 0=1番目のグローバルスイッチ、1=2番目…

// デバッグ: true にすると root.log でコンソールに出力（確認後は false に）
var TerrainSideImage_DebugLog = true;
var TerrainSideImage_LogCount = 0;      // ログ出力回数（毎フレーム出さないため）
var TerrainSideImage_LogLimit = 5;      // この回数だけログを出す（0で無制限）
var TerrainSideImage_LogSwitchOffCount = 0;  // スイッチOFF時のログ回数（同じく出しすぎ防止）
var TerrainSideImage_LogSwitchOffLimit = 3;  // OFFログを出す回数（0で無制限）

//-------------------------------------------------------
// 地形ウィンドウと同じ位置計算（map-mapeditor.js の MapParts.Terrain に合わせる）
//-------------------------------------------------------
var TERRAIN_WINDOW_WIDTH = 140;

function getTerrainBaseX() {
	var dx = LayoutControl.getRelativeX(10) - 54;
	return root.getGameAreaWidth() - TERRAIN_WINDOW_WIDTH - dx;
}

function getTerrainBaseY(imageHeight) {
	var x = LayoutControl.getPixelX(this.getMapPartsX());
	var dx = root.getGameAreaWidth() / 2;
	var y = LayoutControl.getPixelY(this.getMapPartsY());
	var dy = root.getGameAreaHeight() / 2;
	var yBase = LayoutControl.getRelativeY(10) - 28;
	if (x > dx && y < dy) {
		return root.getGameAreaHeight() - imageHeight - yBase;
	}
	return yBase;
}

// 地形ウィンドウが右下なら true、右上なら false（map-mapeditor.js の _getPositionY と同じ判定）
function isTerrainWindowAtBottom(parts) {
	var x = LayoutControl.getPixelX(parts.getMapPartsX());
	var dx = root.getGameAreaWidth() / 2;
	var y = LayoutControl.getPixelY(parts.getMapPartsY());
	var dy = root.getGameAreaHeight() / 2;
	return (x > dx && y < dy);
}

// グローバルスイッチがONなら true（TerrainSideImage_GlobalSwitchId が -1 のときは常に true）
function isTerrainSideImageEnabled() {
	var info = getTerrainSideImageSwitchInfo();
	return info.enabled;
}

// スイッチの状態と名前を取得（ログ用）。{ enabled, switchName, isOn }
function getTerrainSideImageSwitchInfo() {
	var result = { enabled: false, switchName: '', isOn: false };
	if (TerrainSideImage_GlobalSwitchId < 0) {
		result.enabled = true;
		result.switchName = '(スイッチ無視)';
		result.isOn = true;
		return result;
	}
	var session = root.getMetaSession();
	if (session === null) {
		result.switchName = '(セッションなし)';
		return result;
	}
	var switchTable = session.getGlobalSwitchTable();
	if (switchTable === null) {
		result.switchName = '(テーブルなし)';
		return result;
	}
	if (TerrainSideImage_GlobalSwitchId >= switchTable.getSwitchCount()) {
		result.switchName = '(ID範囲外)';
		return result;
	}
	result.isOn = switchTable.isSwitchOn(TerrainSideImage_GlobalSwitchId);
	result.enabled = result.isOn;
	result.switchName = switchTable.getSwitchName(TerrainSideImage_GlobalSwitchId);
	if (result.switchName === undefined || result.switchName === '') {
		result.switchName = '(ID:' + TerrainSideImage_GlobalSwitchId + ')';
	}
	return result;
}

//-------------------------------------------------------
// 地形横画像用 MapParts
//-------------------------------------------------------
// スイッチの状態に応じた設定を取得
function getTerrainSideImageSettings() {
	var switchInfo = getTerrainSideImageSwitchInfo();
	var isOn = switchInfo.enabled;
	
	return {
		useMaterialFolder: isOn ? UseMaterialFolder_True : UseMaterialFolder_False,
		materialFolder: isOn ? MaterialFolder_True : MaterialFolder_False,
		materialFileName: isOn ? MaterialFileName_True : MaterialFileName_False,
		uiName: isOn ? TerrainSideImage_UIName_True : TerrainSideImage_UIName_False,
		offsetX_Top: isOn ? TerrainSideImage_OffsetX_Top_True : TerrainSideImage_OffsetX_Top_False,
		offsetY_Top: isOn ? TerrainSideImage_OffsetY_Top_True : TerrainSideImage_OffsetY_Top_False,
		offsetX_Bottom: isOn ? TerrainSideImage_OffsetX_Bottom_True : TerrainSideImage_OffsetX_Bottom_False,
		offsetY_Bottom: isOn ? TerrainSideImage_OffsetY_Bottom_True : TerrainSideImage_OffsetY_Bottom_False,
		drawWidth: isOn ? TerrainSideImage_DrawWidth_True : TerrainSideImage_DrawWidth_False,
		drawHeight: isOn ? TerrainSideImage_DrawHeight_True : TerrainSideImage_DrawHeight_False
	};
}

function getTerrainSideImage() {
	var settings = getTerrainSideImageSettings();
	var pic;
	if (settings.useMaterialFolder) {
		pic = root.getMaterialManager().createImage(settings.materialFolder, settings.materialFileName);
		if (TerrainSideImage_DebugLog && TerrainSideImage_LogCount < TerrainSideImage_LogLimit) {
			root.log('地形横画像: Material取得 ' + settings.materialFolder + '/' + settings.materialFileName + ' => ' + (pic ? 'OK' : 'null'));
		}
		return pic;
	}
	pic = root.queryUI(settings.uiName);
	if (TerrainSideImage_DebugLog && TerrainSideImage_LogCount < TerrainSideImage_LogLimit) {
		root.log('地形横画像: UI取得 ' + settings.uiName + ' => ' + (pic ? 'OK' : 'null'));
	}
	return pic;
}

var TerrainSideImageParts = defineObject(BaseMapParts, {
	drawMapParts: function() {
		var switchInfo = getTerrainSideImageSwitchInfo();
		// スイッチが無視設定（-1）でない場合、スイッチがOFFの時も表示する（false用の設定で表示）
		// ただし、スイッチが無視設定（-1）の場合は常に表示
		var settings = getTerrainSideImageSettings();
		
		var doLog = TerrainSideImage_DebugLog && (TerrainSideImage_LogLimit === 0 || TerrainSideImage_LogCount < TerrainSideImage_LogLimit);
		if (doLog) {
			TerrainSideImage_LogCount++;
			var statusText = switchInfo.enabled ? 'ON' : 'OFF';
			root.log('地形横画像: グローバルスイッチ 「' + switchInfo.switchName + '」 => ' + statusText);
			root.log('地形横画像: drawMapParts 呼び出し #' + TerrainSideImage_LogCount);
		}
		var pic = getTerrainSideImage();
		if (pic === null) {
			if (doLog) {
				root.log('地形横画像: 画像がnullのため描画スキップ');
			}
			return;
		}
		var w = settings.drawWidth;
		var h = settings.drawHeight;
		if (w <= 0 || h <= 0) {
			if (typeof pic.getWidth === 'function' && typeof pic.getHeight === 'function') {
				w = pic.getWidth();
				h = pic.getHeight();
			} else {
				w = 100;
				h = 100;
			}
		}
		var baseX = getTerrainBaseX();
		var baseY = getTerrainBaseY.call(this, h);
		var isBottom = isTerrainWindowAtBottom(this);
		var offsetX = isBottom ? settings.offsetX_Bottom : settings.offsetX_Top;
		var offsetY = isBottom ? settings.offsetY_Bottom : settings.offsetY_Top;
		var x = baseX + offsetX;
		var y = baseY + offsetY;
		if (doLog) {
			root.log('地形横画像: 描画 ' + (isBottom ? '右下' : '右上') + ' 座標(' + x + ',' + y + ') サイズ(' + w + 'x' + h + ')');
		}
		if (settings.drawWidth > 0 && settings.drawHeight > 0) {
			var srcW = (typeof pic.getWidth === 'function') ? pic.getWidth() : w;
			var srcH = (typeof pic.getHeight === 'function') ? pic.getHeight() : h;
			pic.drawStretchParts(x, y, w, h, 0, 0, srcW, srcH);
		} else {
			if (typeof pic.draw === 'function') {
				pic.draw(x, y);
			} else {
				pic.drawStretchParts(x, y, w, h, 0, 0, w, h);
			}
		}
	}
});

//-------------------------------------------------------
// MapPartsCollection に「地形横画像」を追加
//-------------------------------------------------------
var _MapPartsCollection_configureMapParts = MapPartsCollection._configureMapParts;
MapPartsCollection._configureMapParts = function(groupArray) {
	_MapPartsCollection_configureMapParts.call(this, groupArray);
	groupArray.appendObject(TerrainSideImageParts);
	if (TerrainSideImage_DebugLog) {
		var settings = getTerrainSideImageSettings();
		root.log('地形横画像: プラグイン登録済み (UseMaterialFolder_OFF=' + UseMaterialFolder_False + ', UseMaterialFolder_ON=' + UseMaterialFolder_True + ')');
	}
};

})();
