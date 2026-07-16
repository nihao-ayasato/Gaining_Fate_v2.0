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
  - グローバルスイッチ: OFF時は _False 設定、ON時は _True 設定で画像を差し替え
  - TerrainSideImage_GlobalSwitchName に名前を書くとIDを自動検索（空なら ID を使用）
  - TerrainSideImage_GlobalSwitchId: 0＝1番目のグローバルスイッチ、1＝2番目…

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

// グローバルスイッチ: OFF時=_False設定、ON時=_True設定で画像を差し替え
// 名前を指定すると起動時にIDを自動検索（見つからなければ下のIDを使用）
var TerrainSideImage_GlobalSwitchName = '属性すくみ表示';
var TerrainSideImage_GlobalSwitchId = 11;  // 0=1番目のグローバルスイッチ、1=2番目…
var TerrainSideImage_ResolvedSwitchId = -1;  // 名前検索の結果（内部用）

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

// グローバルスイッチがONなら true
function isTerrainSideImageEnabled() {
	var info = getTerrainSideImageSwitchInfo();
	return info.isOn;
}

// スイッチ名からIDを検索（見つからなければ -1）
function findTerrainSideImageSwitchIdByName(switchTable, switchName) {
	if (switchName === undefined || switchName === null || switchName === '') {
		return -1;
	}
	var count = switchTable.getSwitchCount();
	var i;
	for (i = 0; i < count; i++) {
		if (switchTable.getSwitchName(i) === switchName) {
			return i;
		}
	}
	return -1;
}

// 使用するスイッチIDを解決（名前優先、なければ手動ID）
function resolveTerrainSideImageSwitchId(switchTable) {
	if (TerrainSideImage_ResolvedSwitchId >= 0) {
		return TerrainSideImage_ResolvedSwitchId;
	}
	if (switchTable !== null && TerrainSideImage_GlobalSwitchName !== '') {
		var foundId = findTerrainSideImageSwitchIdByName(switchTable, TerrainSideImage_GlobalSwitchName);
		if (foundId >= 0) {
			TerrainSideImage_ResolvedSwitchId = foundId;
			return foundId;
		}
	}
	TerrainSideImage_ResolvedSwitchId = TerrainSideImage_GlobalSwitchId;
	return TerrainSideImage_GlobalSwitchId;
}

// スイッチの状態と名前を取得（ログ用）。{ switchId, switchName, isOn }
function getTerrainSideImageSwitchInfo() {
	var result = { switchId: -1, switchName: '', isOn: false };
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
	var switchId = resolveTerrainSideImageSwitchId(switchTable);
	result.switchId = switchId;
	if (switchId < 0 || switchId >= switchTable.getSwitchCount()) {
		result.switchName = '(ID範囲外: ' + switchId + ')';
		return result;
	}
	result.isOn = switchTable.isSwitchOn(switchId);
	result.switchName = switchTable.getSwitchName(switchId);
	if (result.switchName === undefined || result.switchName === '') {
		result.switchName = '(ID:' + switchId + ')';
	}
	return result;
}

// デバッグ: グローバルスイッチ一覧を一度だけ出力
var TerrainSideImage_SwitchListLogged = false;
function logTerrainSideImageSwitchListOnce() {
	if (!TerrainSideImage_DebugLog || TerrainSideImage_SwitchListLogged) {
		return;
	}
	var session = root.getMetaSession();
	if (session === null) {
		return;
	}
	var switchTable = session.getGlobalSwitchTable();
	if (switchTable === null) {
		return;
	}
	TerrainSideImage_SwitchListLogged = true;
	var count = switchTable.getSwitchCount();
	var i;
	root.log('地形横画像: グローバルスイッチ一覧 (' + count + '個)');
	for (i = 0; i < count; i++) {
		root.log('  [' + i + '] ' + switchTable.getSwitchName(i) + ' => ' + (switchTable.isSwitchOn(i) ? 'ON' : 'OFF'));
	}
	var switchId = resolveTerrainSideImageSwitchId(switchTable);
	if (TerrainSideImage_GlobalSwitchName !== '') {
		var foundId = findTerrainSideImageSwitchIdByName(switchTable, TerrainSideImage_GlobalSwitchName);
		if (foundId < 0) {
			root.log('地形横画像: 警告 「' + TerrainSideImage_GlobalSwitchName + '」 が見つかりません。ID=' + TerrainSideImage_GlobalSwitchId + ' を使用します');
		} else {
			root.log('地形横画像: 「' + TerrainSideImage_GlobalSwitchName + '」 => ID ' + foundId);
		}
	}
	root.log('地形横画像: 使用中スイッチ ID=' + switchId + ' 「' + switchTable.getSwitchName(switchId) + '」');
}

//-------------------------------------------------------
// 地形横画像用 MapParts
//-------------------------------------------------------
// スイッチの状態に応じた設定を取得
function getTerrainSideImageSettings() {
	var switchInfo = getTerrainSideImageSwitchInfo();
	var isOn = switchInfo.isOn;
	
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

function loadTerrainSideImageFromSettings(settings, label) {
	var pic;
	if (settings.useMaterialFolder) {
		pic = root.getMaterialManager().createImage(settings.materialFolder, settings.materialFileName);
		if (TerrainSideImage_DebugLog && TerrainSideImage_LogCount < TerrainSideImage_LogLimit) {
			root.log('地形横画像: Material取得(' + label + ') ' + settings.materialFolder + '/' + settings.materialFileName + ' => ' + (pic ? 'OK' : 'null'));
		}
		return pic;
	}
	pic = root.queryUI(settings.uiName);
	if (TerrainSideImage_DebugLog && TerrainSideImage_LogCount < TerrainSideImage_LogLimit) {
		root.log('地形横画像: UI取得(' + label + ') ' + settings.uiName + ' => ' + (pic ? 'OK' : 'null'));
	}
	return pic;
}

function getTerrainSideImageSettingsBySwitch(isOn) {
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
	var switchInfo = getTerrainSideImageSwitchInfo();
	var settings = getTerrainSideImageSettingsBySwitch(switchInfo.isOn);
	var label = switchInfo.isOn ? 'ON' : 'OFF';
	var pic = loadTerrainSideImageFromSettings(settings, label);
	if (pic !== null) {
		return pic;
	}
	if (switchInfo.isOn) {
		var fallbackSettings = getTerrainSideImageSettingsBySwitch(false);
		if (TerrainSideImage_DebugLog && TerrainSideImage_LogCount < TerrainSideImage_LogLimit) {
			root.log('地形横画像: ON用画像が読み込めないため OFF用画像にフォールバック');
		}
		return loadTerrainSideImageFromSettings(fallbackSettings, 'OFF(フォールバック)');
	}
	return null;
}

var TerrainSideImageParts = defineObject(BaseMapParts, {
	drawMapParts: function() {
		logTerrainSideImageSwitchListOnce();
		var switchInfo = getTerrainSideImageSwitchInfo();
		var settings = getTerrainSideImageSettings();
		
		var doLog = TerrainSideImage_DebugLog && (TerrainSideImage_LogLimit === 0 || TerrainSideImage_LogCount < TerrainSideImage_LogLimit);
		if (doLog) {
			TerrainSideImage_LogCount++;
			var statusText = switchInfo.isOn ? 'ON' : 'OFF';
			root.log('地形横画像: グローバルスイッチ ID=' + switchInfo.switchId + ' 「' + switchInfo.switchName + '」 => ' + statusText);
			root.log('地形横画像: 使用画像 ' + settings.materialFolder + '/' + settings.materialFileName);
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
