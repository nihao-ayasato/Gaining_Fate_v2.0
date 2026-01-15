
/*--------------------------------------------------------------------------
  
　ユニット同士の距離を算出するスクリプト

■概要
本プラグインをいれてスクリプトを実行すると、
指定したユニット同士の距離を求める事ができます。

■使い方
イベントの実行条件でスクリプトを選択し、スクリプトの実行条件のチェックボックスをONします。
その後、下部のテキストボックスに以下を書き込んでください。

『関数一覧』
　　// param1のID:unitidのユニットと、param2のID:targetidのユニットの距離を求める
　　UnitDistCalculator.getDist(param1, unitid, param2, targetid);
        param1,2に指定するパラメータ
            UnitDistValue.PLAYER_UNIT             // プレイヤーユニット
            UnitDistValue.GUEST_UNIT              // ゲストユニット
            UnitDistValue.GUEST_EVENT_UNIT        // ゲストイベントユニット
            UnitDistValue.ENEMY_INIT_UNIT         // 初期配置の敵ユニット
            UnitDistValue.ENEMY_EVENT_UNIT        // イベント敵ユニット
            UnitDistValue.ALLY_INIT_UNIT          // 初期配置の同盟ユニット
            UnitDistValue.ALLY_EVENT_UNIT         // 同盟イベントユニット


　　// param1のID:unitidのユニットと、x, y で指定したマップ座標との距離を求める
　　UnitDistCalculator.getDistByPos(param1, unitid, x, y);
        param1に指定するパラメータ
            UnitDistValue.PLAYER_UNIT             // プレイヤーユニット
            UnitDistValue.GUEST_UNIT              // ゲストユニット
            UnitDistValue.GUEST_EVENT_UNIT        // ゲストイベントユニット
            UnitDistValue.ENEMY_INIT_UNIT         // 初期配置の敵ユニット
            UnitDistValue.ENEMY_EVENT_UNIT        // イベント敵ユニット
            UnitDistValue.ALLY_INIT_UNIT          // 初期配置の同盟ユニット
            UnitDistValue.ALLY_EVENT_UNIT         // 同盟イベントユニット


　　// 変数ページtablepageのID:tableidにユニットIDを入れたユニットと、x, y で指定したマップ座標との距離を求める
　　UnitDistCalculator.getDistByPosFromVA(tablepage, tableid, x, y);
        tablepageに指定するパラメータ：変数のページ
            変数ページ1の場合：0
            変数ページ2の場合：1
            変数ページ3の場合：2
            変数ページ4の場合：3
            変数ページ5の場合：4


17/03/19 新規作成
17/03/31 内部処理でUnitDistValueを使うべきところを誤って違う定義値（UnitDirValue）を使っていたバグを修正


■対応バージョン
　SRPG Studio Version:1.119


■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/


//----------------------------------
// 指定用の定義値
//----------------------------------
var UnitDistValue = {
	// param1,2に指定するパラメータ
	PLAYER_UNIT         : 0x0101,	// プレイヤーユニット指定     (0x0101=10進だと257)
	GUEST_UNIT          : 0x0102,	// ゲストユニット指定         (0x0102=10進だと258)
	GUEST_EVENT_UNIT    : 0x0103,	// ゲストイベントユニット指定 (0x0103=10進だと259)
	ENEMY_INIT_UNIT     : 0x0204,	// 初期配置の敵ユニット指定   (0x0204=10進だと516)
	ENEMY_EVENT_UNIT    : 0x0205,	// イベント敵ユニット指定     (0x0205=10進だと517)
	ENEMY_REINFORCE_UNIT: 0x0206,	// 援軍敵ユニット指定         (0x0206=10進だと518) ※援軍の向きは変えられないので実際には無意味
	ALLY_INIT_UNIT      : 0x0304,	// 初期配置の同盟ユニット指定 (0x0304=10進だと772)
	ALLY_EVENT_UNIT     : 0x0305	// 同盟イベントユニット       (0x0305=10進だと773)
};


//----------------------------------
// 備考：ユニットの所属・種類別のID補正値
//----------------------------------
// 自軍              :IDそのまま
// 敵ユニット        :ID+65536  (65536*1)
// イベント敵ユニット:ID+131072 (65536*2)
// 同盟              :ID+196608 (65536*3)
// 同盟イベント      :ID+262144 (65536*4)
// 援軍敵ユニット    :ID+327680 (65536*5)
// ゲスト            :ID+393216 (65536*6)
// ゲストイベント    :ID+458752 (65536*7)




//----------------------------------
// UnitDistCalculatorクラス
//----------------------------------
var UnitDistCalculator = {
	// 指定ユニットと対象ユニットとの距離を求める
	getDist: function(param1, unitid, param2, targetid) {
		var unit       = this._getUnit(param1, unitid);
		var targetunit = this._getUnit(param2, targetid);

		if( unit == null ){
			root.log('ユニット取得失敗 param1:0x'+param1.toString(16)+' ID:'+unitid);
			return -1;
		}

		if( targetunit == null ){
			root.log('ユニット取得失敗 param2:0x'+param2.toString(16)+' ID:'+targetid);
			return -1;
		}

		return this._getDistance(unit.getMapX(), unit.getMapY(), targetunit.getMapX(), targetunit.getMapY());
	},
	
	// 指定ユニットと対象座標との距離を求める
	getDistByPos: function(param1, unitid, x, y) {
		var unit = this._getUnit(param1, unitid);

		if( unit == null ){
			root.log('ユニット取得失敗 param1:0x'+param1.toString(16)+' ID:'+unitid);
			return -1;
		}

		return this._getDistance(unit.getMapX(), unit.getMapY(), x, y);
	},
	
	// 指定ページの指定ID変数に格納したユニットIDと対象座標との間の距離を求める
	getDistByPosFromVA: function(tablepage, tableid, x, y) {
		var unitid = this._getVATable(tablepage, tableid);
		var unit   = this._getUnitFromId(unitid);

		if( unit == null ){
			root.log('ユニット取得失敗 ID:'+unitid);
			return -1;
		}

		return this._getDistance(unit.getMapX(), unit.getMapY(), x, y);
	},
	
	// 指定変数の取得
	_getVATable: function(tablepage, tableid) {
		var table = root.getMetaSession().getVariableTable(tablepage);
		var index = table.getVariableIndexFromId(tableid);
		return table.getVariable(index);
	},
	
	//-----------------------
	// 以下、下位関数
	//-----------------------
	
	// 指定のユニットを取得する
	_getUnit: function(param, unitid) {
		switch(param) {
			case UnitDistValue.PLAYER_UNIT:
				return this._getPlayerUnit(unitid);
				break;
			case UnitDistValue.GUEST_UNIT:
				return this._getGuestUnit(unitid);
				break;
			case UnitDistValue.GUEST_EVENT_UNIT:
				return this._getGuestEventUnit(unitid);
				break;
			case UnitDistValue.ENEMY_INIT_UNIT:
				return this._getInitEnemyUnit(unitid);
				break;
			case UnitDistValue.ENEMY_EVENT_UNIT:
				return this._getEnEnemyUnit(unitid);
				break;
			case UnitDistValue.ENEMY_REINFORCE_UNIT:
				return this._getReEnemyUnit(unitid);
				break;
			case UnitDistValue.ALLY_INIT_UNIT:
				return this._getInitAllyUnit(unitid);
				break;
			case UnitDistValue.ALLY_EVENT_UNIT:
				return this._getPaAllyUnit(unitid);
				break;
		}

		root.log('パラメータparam不正:0x'+param.toString(16));
		return null;
	},
	
	// 指定idのユニットを取得する
	_getUnitFromId: function(unitid) {
		// 自軍、ゲスト、ゲストイベント
		if( unitid < 65536 || unitid >= 393216 ) {
			return this._getPlayerUnitFromID(unitid);
		}
		// 敵、敵イベント、援軍
		if( (unitid >= 65536 && unitid < 196608) || (unitid >= 327680 && unitid < 393216) ) {
			return this._getEnemyUnitFromID(unitid);
		}
		// 同盟、同盟イベント
		if( (unitid >= 196608 && unitid < 327680) ) {
			return this._getAllyUnitFromID(unitid);
		}
		// それ以外はnull
		return null;
	},
	
	// ユニットの向きを変える（）
	_getDistance: function(src_x, src_y, dst_x, dst_y) {
		// 基準位置と目標位置のXの差、Yの差を求める
		var x = src_x - dst_x;
		var y = src_y - dst_y;
		// Xの差、Yの差を絶対値にする
		var absx = Math.abs(x);
		var absy = Math.abs(y);

		// ユニットの向きを返す
		return (absx+absy);
	},
	
	//-----------------------
	// 自軍関連
	//-----------------------
	// 指定IDのプレイヤーユニットを取得
	_getPlayerUnit: function(unitid) {
		return this._getPlayerUnitFromID(unitid);
	},
	
	// 指定IDのゲストユニットを取得
	_getGuestUnit: function(unitid) {
		return this._getPlayerUnitFromID(unitid+393216);	// ゲストユニットのID 0は393216となっている
	},
	
	// 指定IDのゲストイベントユニットを取得
	_getGuestEventUnit: function(unitid) {
		return this._getPlayerUnitFromID(unitid+458752);	// ゲストイベントユニットのID 0は458752となっている
	},
	
	//-----------------------
	// 敵関連
	//-----------------------
	// 指定IDの敵ユニットを取得（初期配置の敵のみ）
	_getInitEnemyUnit: function(unitid) {
		return this._getEnemyUnitFromID(unitid+65536);		// 敵ユニットのID 0は65536となっている
	},
	
	// 指定IDのイベント敵ユニットを取得
	_getEnEnemyUnit: function(unitid) {
		return this._getEnemyUnitFromID(unitid+131072);	// イベント敵ユニットのID 0は131072となっている
	},
	
	// 指定IDの援軍の敵ユニットを取得
	_getReEnemyUnit: function(unitid) {
		return this._getEnemyUnitFromID(unitid+327680);	// 援軍敵ユニットのID 0は327680となっている
	},
	
	//-----------------------
	// 同盟関連
	//-----------------------
	// 指定IDの同盟ユニットを取得（初期配置の同盟のみ）
	_getInitAllyUnit: function(unitid) {
		return this._getAllyUnitFromID(unitid+196608);	// 初期配置の同盟ユニットのID 0は196608となっている
	},
	
	// 指定IDの同盟イベントを取得
	_getPaAllyUnit: function(unitid) {
		return this._getAllyUnitFromID(unitid+262144);	// 同盟イベントユニットのID 0は262144となっている
	},
	
	//-----------------------
	// 最下位関数
	//-----------------------
	// 指定ユニットIDの自軍ユニットを取得
	_getPlayerUnitFromID: function(unitid) {
		var unitlist = root.getCurrentSession().getPlayerList();
		var unit = unitlist.getDataFromId(unitid); 
		return unit;
	},
	
	// 指定ユニットIDの敵軍ユニットを取得
	_getEnemyUnitFromID: function(unitid) {
		var unitlist = root.getCurrentSession().getEnemyList();
		var unit = unitlist.getDataFromId(unitid); 
		return unit;
	},
	
	// 指定ユニットIDの同盟ユニットを取得
	_getAllyUnitFromID: function(unitid) {
		var unitlist = root.getCurrentSession().getAllyList();
		var unit = unitlist.getDataFromId(unitid); 
		return unit;
	}
};



