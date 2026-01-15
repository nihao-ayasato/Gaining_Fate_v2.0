
/*--------------------------------------------------------------------------
  
　範囲を持つステート

■概要
　ステートを付与したユニットを中心に、周囲１マスに同じステートの効果が発生するようになります

■使い方
　１．周囲１マスに付与したいステートを用意
　　　　「フィアー」のステートの場合　：力、魔力を３ターンの間、７減らす、で設定
　　　　「ナムネス」のステートの場合　：技、速さ、幸運を３ターンの間、７減らす、で設定
　　　　「ブリートル」のステートの場合：守備、魔防を３ターンの間、７減らす、で設定
　　　　「キヨラ」のステートの場合　　：全能力を５減らす。ターン回復無し、で設定

　２．ステート付与の杖を作成する
　　　　それぞれ、使用効果に対応する↑のステートを設定
　　　　フィルタを敵軍にセット
　　　　杖のカスタムパラメータに{stateRange:1}をセットすると、ステートを付加した対象の周囲1マスにステートの効果が発生します
　　　　※ステートの効果発生範囲は{stateRange:XX}のXXに設定した値です
　　　　　杖のカスタムパラメータに{stateRange:2}をセットすれば周囲2マス、{stateRange:3}をセットすれば周囲3マスとなります

■対象にかかるステートと別のステートを周囲に付与する方法
　範囲を持たせるステートカスタムパラメータ{aroundStateId:XX}を記述すると、
　対象には範囲ステートのステート、周囲のユニットにはaroundStateIdで指定したIDのステートがかかるようになります。
　（対象に「周囲護衛」のステートをかけ、周囲に防御をアップするステートを付与したり出来ます）


■注意事項
　１．イベントコマンド「ユニットの消去」で敵を消している面があり、
　　　その敵に上記のステートを付与出来る場合は以下のようにしてください
　　　（ユニットの消去は非公開の処理の為、本プラグインで自動処理出来ません）

　　　「ユニットの消去」実行後に
　　　「スクリプトの実行」→コード実行でRangeStateControl.upDateAll();を呼び出してください


　２．イベントコマンド「ユニットの移動」で敵を動かしている面があり、
　　　その敵に上記のステートを付与出来る場合は以下のようにしてください
　　　（ユニットの移動は非公開の処理の為、本プラグインで自動処理出来ません）

　　　ａ．「ユニットの移動」実行前に
　　　　　「スクリプトの実行」→コード実行でRangeStateControl.clearRangeStateAll();を呼び出す
　　　ｂ．「ユニットの移動」実行後に
　　　　　「スクリプトの実行」→コード実行でRangeStateControl.upDateAndCopy();を呼び出す

　３．イベントコマンド「ユニットの所属変更」で敵の所属を変更している面があり、
　　　その敵に上記のステートを付与出来る場合は以下のようにしてください
　　　（ユニットの消去は非公開の処理の為、本プラグインで自動処理出来ません）

　　　ａ．「ユニットの所属変更」実行前に
　　　　　「スクリプトの実行」→コード実行でRangeStateControl.clearRangeStateAll();を呼び出す
　　　ｂ．「ユニットの所属変更」実行後に
　　　　　「スクリプトの実行」→コード実行でRangeStateControl.upDateAndCopy();を呼び出す


修正内容
18/09/01　新規作成
18/09/12　拠点でロードするとエラー落ちするバグを修正
18/09/16　ゲームを新規開始するとエラー落ちするバグを修正
19/07/20　戻り値ミスを修正
21/01/01　1.160以降の場合ダメージイベントで死亡したユニットに付与されていた範囲ステートが解除されなかったのを修正
21/05/08　拠点テストで開始スクリプトエラーが出ていた為修正
21/05/26　1.230対応
21/06/04　範囲を持つステートの効果がある道具を使用直後にスキップすると、範囲ステートが付与されないバグを修正
21/12/05　ステートにカスタムパラメータを設定する事で対象にかかるステートと、周囲にかかるステートを変更出来るようにした
21/12/23　stateIdと書くべきところをstateidと記述した為、範囲にID:0のステートが付与されていたバグを修正
22/02/15　敵ターン時、範囲ステートで魔法封印を受ける位置に移動してきた敵が魔法を使用してしまうバグを修正
22/10/09　カスタムパラメータに{stateRange:1}の説明に効果範囲を広げる方法を記述（説明のみ修正した）
23/04/14　1.280対応
23/04/30　1.281対応


■対応バージョン
　SRPG Studio Version:1.157/1.281


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

//---------------------------------------------------------------
// 設定
//---------------------------------------------------------------




//---------------------------------------------------------------
// プログラム関連
//---------------------------------------------------------------


//---------------------------------------
// StateItemUseクラス
//---------------------------------------
var alias10 = StateItemUse.enterMainUseCycle;
StateItemUse.enterMainUseCycle= function(itemUseParent) {
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		// 範囲を持つステートの場合、フラグをセット（先にセットしておかないとスキップされた時にちゃんと動作しない）
		RangeStateControl.setRangeFlagToUnit(itemTargetInfo.targetUnit, itemTargetInfo.item, itemTargetInfo.unit);
		
		var result = alias10.call(this, itemUseParent);
		
		return result;
}




//---------------------------------------
// UnitStateAdditionEventCommandクラス
//---------------------------------------
var alias20 = UnitStateAdditionEventCommand.mainEventCommand;
UnitStateAdditionEventCommand.mainEventCommand= function() {
		alias20.call(this);
		
		// 付与されたのが範囲ステートか？（フラグをチェックする）
		if( RangeStateControl.hasRangeFlag(this._targetUnit) ) {
			// 範囲ステートが命中していた場合は範囲ステートのデータを設定する
			if (this._isHit && StateControl.getTurnState(this._targetUnit, this._targetState) !== null) {
				RangeStateControl.createRangeData(this._targetUnit, this._targetState);
				RangeStateControl.clearRangeStateAll();
				RangeStateControl.upDateAndCopy();
			}
			// 付与した/しないに関わらず範囲ステート付加用のフラグをクリア
			RangeStateControl.clearRangeFlag(this._targetUnit);
		}
}




//---------------------------------------
// SimulateMoveクラス
//---------------------------------------
// 移動前に周囲の範囲ステート削除
var alias30 = SimulateMove.startMove;
SimulateMove.startMove = function(unit, moveCource) {
		RangeStateControl.clearRangeStateAll();
		
		alias30.call(this, unit, moveCource);
}




// 移動完了時に周囲の範囲ステート付加
var alias40 = SimulateMove._endMove;
SimulateMove._endMove= function(unit) {
		alias40.call(this, unit);
		
		RangeStateControl.copyRangeStateAll();
}




//---------------------------------------
// PlayerTurnクラス
//---------------------------------------
// 移動キャンセル時に周囲の範囲ステートをクリア→再付加
var alias50 = PlayerTurn.setPosValue;
PlayerTurn.setPosValue= function(unit) {
		RangeStateControl.clearRangeStateAll();
		
		alias50.call(this, unit);
		
		RangeStateControl.copyRangeStateAll();
}




//---------------------------------------
// TurnChangeStartクラス
//---------------------------------------
// ターン開始時
var alias60 = TurnChangeStart._checkStateTurn;
if( typeof alias60 !== 'undefined' ) {
	TurnChangeStart._checkStateTurn= function() {
		alias60.call(this);
		
		// 範囲を持つステートにかかっているユニットを取得し、範囲ステートを更新
		RangeStateControl.clearRangeStateAll();
		RangeStateControl.upDateAndCopy();
	}
}




//---------------------------------------
// TurnChangeStartクラス
//---------------------------------------
if( typeof StateTurnFlowEntry !== 'undefined' ) {
	var alias65 = StateTurnFlowEntry._checkStateTurn;
	StateTurnFlowEntry._checkStateTurn= function() {
		alias65.call(this);
		
		// 範囲を持つステートにかかっているユニットを取得し、範囲ステートを更新
		RangeStateControl.clearRangeStateAll();
		RangeStateControl.upDateAndCopy();
	}
}




//---------------------------------------
// DamageHitEventCommandクラス
//---------------------------------------
// 死んだ時（その１）
// （簡易戦闘は戦闘時にユニットを非表示にしている為、DamageControl.setDeathStateで処理を行うと
//   倒したユニットに付加された範囲ステートが消えなくなってしまう）

// 死んだユニットがいたら周囲の範囲ステートをクリア→再付加（イベントコマンド「ダメージを与える」）
// ※1.159以前はダメージイベントの死亡処理をここで行っている
var alias70 = DamageHitEventCommand._setDamage;
DamageHitEventCommand._setDamage= function() {
		alias70.call(this);

		if( this._targetUnit.getHp() <= 0 ) {
			RangeStateControl.clearRangeStateAll();
			RangeStateControl.upDateAndCopy();
		}
}




//---------------------------------------
// DamageEraseFlowEntryクラス　※1.160以降の場合ダメージイベントの死亡処理をここで行っている
//---------------------------------------
if( typeof DamageEraseFlowEntry !== 'undefined' ) {
	var alias75 = DamageEraseFlowEntry._doAction;
	DamageEraseFlowEntry._doAction= function(damageData) {
		alias75.call(this, damageData);

		if( damageData.targetUnit.getHp() <= 0 ) {
			RangeStateControl.clearRangeStateAll();
			RangeStateControl.upDateAndCopy();
		}
	}
}




//---------------------------------------
// UnitDeathFlowEntryクラス
//---------------------------------------
// 死んだ時（その２）
// 死んだユニットがいたら周囲の範囲ステートをクリア→再付加（リアル戦闘）
var alias80 = UnitDeathFlowEntry._doEndAction;
UnitDeathFlowEntry._doEndAction= function() {
		alias80.call(this);

		if( this._activeUnit.getHp() <= 0 && RangeStateControl.isStateRangeUnit(this._activeUnit) ){
			RangeStateControl.clearRangeStateAll();
			RangeStateControl.deleteInRangeState(this._activeUnit, this._passiveUnit);
			RangeStateControl.upDateAndCopy();
		}
		else if( this._passiveUnit.getHp() <= 0 && RangeStateControl.isStateRangeUnit(this._passiveUnit) ){
			RangeStateControl.clearRangeStateAll();
			RangeStateControl.deleteInRangeState(this._passiveUnit, this._activeUnit);
			RangeStateControl.upDateAndCopy();
		}
}




//---------------------------------------
// LoserMessageFlowEntryクラス
//---------------------------------------
// 死んだ時（その３）
// 死んだユニットがいたら周囲の範囲ステートをクリア→再付加（戦闘スキップ/簡易戦闘）
var alias90 = LoserMessageFlowEntry._completeMemberData;
LoserMessageFlowEntry._completeMemberData= function(preAttack) {
		var result = alias90.call(this, preAttack);

		var unit = preAttack.getPassiveUnit();
		var actUnit = preAttack.getActiveUnit();

		if (unit.getHp() <= 0 && RangeStateControl.isStateRangeUnit(unit) && actUnit != null ) {
			RangeStateControl.clearRangeStateAll();
			RangeStateControl.deleteInRangeState(unit, actUnit);
			RangeStateControl.upDateAndCopy();
		}
		else if ( (actUnit != null && actUnit.getHp() <= 0) && RangeStateControl.isStateRangeUnit(actUnit) ) {
			RangeStateControl.clearRangeStateAll();
			RangeStateControl.deleteInRangeState(actUnit, unit);
			RangeStateControl.upDateAndCopy();
		}
		
		return result;
}




//---------------------------------------
// CatchFusionActionクラス
//---------------------------------------
// ユニットがキャッチされた時
var alias100 = CatchFusionAction._doCatchAction;
CatchFusionAction._doCatchAction= function() {
		RangeStateControl.clearRangeStateAll();
		RangeStateControl.upDateAndCopy();

		alias100.call(this);
}




//---------------------------------------
// ReleaseFusionActionクラス
//---------------------------------------
// ユニットがリリースされた時
var alias110 = ReleaseFusionAction._doEndSlideAction;
ReleaseFusionAction._doEndSlideAction= function() {
		var type = this._fusionData.getFusionReleaseType();

		alias110.call(this);

		// リリース時に消去以外の場合は範囲ステートによる更新処理を行う
		if (type !== FusionReleaseType.ERASE) {
			RangeStateControl.clearRangeStateAll();
			RangeStateControl.upDateAndCopy();
		}
}




//---------------------------------------
// SlideObjectクラス
//---------------------------------------
var alias120 = SlideObject.updateUnitPos;
SlideObject.updateUnitPos= function() {
		RangeStateControl.clearRangeStateAll();

		alias120.call(this);

		RangeStateControl.upDateAndCopy();
}




//---------------------------------------
// TeleportationItemUseクラス
//---------------------------------------
// 瞬間移動杖で転移した時
var alias130 = TeleportationItemUse.enterMainUseCycle
TeleportationItemUse.enterMainUseCycle= function(itemUseParent) {
		// 転移前に周囲の範囲ステートをクリア
		RangeStateControl.clearRangeStateAll();

		return alias130.call(this, itemUseParent);
}


var alias131 = TeleportationItemUse.mainAction;
TeleportationItemUse.mainAction= function() {
		alias131.call(this);

		// 転移後に周囲の範囲ステートを再付加
		RangeStateControl.upDateAndCopy();
}




//---------------------------------------
// RescueItemUseクラス
//---------------------------------------
// 救出杖で転移した時
var alias140 = RescueItemUse.enterMainUseCycle;
RescueItemUse.enterMainUseCycle= function(itemUseParent) {
		// 転移前に周囲の範囲ステートをクリア
		RangeStateControl.clearRangeStateAll();

		return alias140.call(this, itemUseParent);
}


var alias141 = RescueItemUse.mainAction;
RescueItemUse.mainAction= function() {
		alias141.call(this);

		// 転移後に周囲の範囲ステートを再付加
		RangeStateControl.upDateAndCopy();
}




//---------------------------------------
// ScriptCall_Loadクラス
//---------------------------------------
// ロードした時
var alias150 = ScriptCall_Load;
ScriptCall_Load = function() {
		alias150.call(this);

		if( root.getBaseScene() !== SceneType.REST && root.getBaseScene() !== SceneType.TITLE ) {
			// 1.280でのカスタムシーン判定
			if( root.getScriptVersion() === 1280 ) {
				// カスタムシーン以外なら実施
				if( typeof SceneType.CUSTOM === 'undefined' || scene !== SceneType.CUSTOM ) {
					// 範囲ステートが付与されているユニットを取得しておく
					RangeStateControl.upDate();
				}
			}
			// 1.281以降のカスタムシーン判定
			else if( root.getScriptVersion() >= 1281 ) {
				// カスタムシーン以外なら実施
				if( SceneManager.isCustomScene(root.getBaseScene()) !== true ) {
					// 範囲ステートが付与されているユニットを取得しておく
					RangeStateControl.upDate();
				}
			}
		}
}




//---------------------------------------
// ScriptCall_AppearEventUnitクラス
//---------------------------------------
//ユニット登場時
var alias160 = ScriptCall_AppearEventUnit;
ScriptCall_AppearEventUnit = function(unit) {
		alias160.call(this, unit);
		
		var scene = root.getBaseScene();
		
		// 拠点、タイトル以外でのみ実施
		if( scene !== SceneType.REST && scene !== SceneType.TITLE ) {
			if( root.getScriptVersion() >= 1281 ) {
				// 拠点、タイトル以外でも、マップテストや拠点テストの場合シーン番号SceneType.RESERVEDより大きな値で始まる事があるらしい
				// root.getCurrentSession().getTerrainFromPos(0,0,true)がnullならば拠点テストなので以下の処理は行わない
				if( scene <= SceneType.RESERVED || (root.getCurrentSession().getTerrainFromPos(0,0,true) != null) ) {
					// 範囲ステートによる更新処理を行う
					RangeStateControl.clearRangeStateAll();
					RangeStateControl.upDateAndCopy();
				}
			}
			else {
				// 拠点、タイトル以外でも、マップテストや拠点テストの場合シーン番号31で始まる事があるらしい
				// root.getCurrentSession().getTerrainFromPos(0,0,true)がnullならば拠点テストなので以下の処理は行わない
				if( scene !== 31 || (root.getCurrentSession().getTerrainFromPos(0,0,true) != null) ) {
					// 範囲ステートによる更新処理を行う
					RangeStateControl.clearRangeStateAll();
					RangeStateControl.upDateAndCopy();
				}
			}
		}
}




//---------------------------------------
// WeaponAutoActionクラス
//---------------------------------------
var alias170 = WeaponAutoAction.enterAutoAction;
WeaponAutoAction.enterAutoAction= function() {
		var unit = this._unit;
		var weapon = this._weapon;
		
		// 行動時にバッドステートで魔法が封印されていて、武器カテゴリが魔法なら処理せず終了
		if( StateControl.isBadStateFlag(unit, BadStateFlag.MAGIC) === true ) {
			if( weapon.getWeaponCategoryType() === WeaponCategoryType.MAGIC ) {
				return EnterResult.NOTENTER;
			}
		}
		// 行動時にバッドステートで物理が封印されていて、武器カテゴリが魔法以外なら処理せず終了
		else if( StateControl.isBadStateFlag(unit, BadStateFlag.PHYSICS) === true ) {
			if( weapon.getWeaponCategoryType() !== WeaponCategoryType.MAGIC ) {
				return EnterResult.NOTENTER;
			}
		}
		
		return alias170.call(this);
}




//---------------------------------------
// ItemAutoActionクラス
//---------------------------------------
var alias180 = ItemAutoAction.enterAutoAction;
ItemAutoAction.enterAutoAction= function() {
		var unit = this._unit;
		var item = this._item;
		
		// 行動時にバッドステートでアイテムが封印されていれば処理せず終了（アイテム封印は杖道具両方無効）
		if( StateControl.isBadStateFlag(unit, BadStateFlag.ITEM) === true ) {
			return EnterResult.NOTENTER;
		}
		// 行動時にバッドステートで杖が封印され、使用する道具が杖ならば処理せず終了
		else if( StateControl.isBadStateFlag(unit, BadStateFlag.WAND) === true ) {
			if( item.isWand() === true ) {
				return EnterResult.NOTENTER;
			}
		}
		
		return alias180.call(this);
}


})();


//-------------------------------------------------------------------
// 外部参照可能なクラス（スクリプトの実行から呼び出す事も可能です）
//-------------------------------------------------------------------


//---------------------------------------
// RangeStateControlクラス
//---------------------------------------
var RangeStateControl = {
	_rangeStateUnitArray: [],		// 範囲ステートユニットの配列

	// 範囲ステートによる一括更新（スクリプトの実行での使用を想定してます）
	upDateAll: function() {
		this.clearRangeStateAll();
		this.upDate();
		this.copyRangeStateAll();
	},
	
	upDateAndCopy: function() {
		this.upDate();
		this.copyRangeStateAll();
	},
	
	// 範囲ステートの更新
	upDate: function() {
		this._initList();
		this._addRangeStateUnitFromList(PlayerList.getSortieList());
		this._addRangeStateUnitFromList(EnemyList.getAliveList());
		this._addRangeStateUnitFromList(AllyList.getAliveList());
	},
	
	// 範囲ステートが設定されたユニットの周囲にいるユニットから該当する範囲ステートを削除
	clearRangeStateAll: function(){
		var i, j, arrayCnt, unit, indexArray, stateRangeDataArray, stateRangeData;
		var rangeStateUnitCnt = this._rangeStateUnitArray.length;

		for( i = 0;i < rangeStateUnitCnt;i++ ) {
			// エラー落ちをなるべく回避する為、ユニットIDを元にユニットを取り直している
			unit = this._getUnitFromId(this._rangeStateUnitArray[i].getId());
			stateRangeDataArray = this._getStateRangeDataArray(unit);
			arrayCnt = stateRangeDataArray.length;

			for( j = 0;j < arrayCnt;j++ ) {
				stateRangeData = stateRangeDataArray[j];
				indexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, stateRangeData.stateRange);
				this.clearRangeStateFromIndexArray(stateRangeData, indexArray);
			}
		}
	},
	
	// IndexArrayにいるユニットから、stateRangeDataに合致するステートを削除
	clearRangeStateFromIndexArray: function(stateRangeData, indexArray) {
		var i, index, x, y, targetUnit;
		var count = indexArray.length;
		var stateRangeFilter = stateRangeData.stateRangeFilter;
		var state = this.getChildState(stateRangeData);
		
		if( state == null ) {
			return;
		}
		
		for (i = 0; i < count; i++) {
			index = indexArray[i];
			x = CurrentMap.getX(index);
			y = CurrentMap.getY(index);
			targetUnit = PosChecker.getUnitFromPos(x, y);
			if ( targetUnit !== null ) {
				if (this._checkFilter(targetUnit, stateRangeFilter)) {
					if (!this._hasSameRangeState(targetUnit, stateRangeData)) {
						StateControl.arrangeState(targetUnit, state, IncreaseType.DECREASE);
					}
				}
			}
		}
	},
	
	// 範囲ステートが設定されたユニットの周囲にいるユニットに該当する範囲ステートをコピー
	copyRangeStateAll: function(){
		var i, j, arrayCnt, unit, indexArray, stateRangeDataArray, stateRangeData;
		var rangeStateUnitCnt = this._rangeStateUnitArray.length;
		
		for( i = 0;i < rangeStateUnitCnt;i++ ) {
			// エラー落ちをなるべく回避する為、ユニットIDを元にユニットを取り直している
			unit = this._getUnitFromId(this._rangeStateUnitArray[i].getId());
			if( unit == null ) {
				continue;
			}
			
			// フュージョンの子だった場合は範囲ステート処理を実施しない
			if( FusionControl.getFusionParent(unit) ) {
				continue;
			}

			// 非表示ユニットの場合は範囲ステート処理を実施しない
			if( unit.isInvisible() ) {
				continue;
			}
			
			stateRangeDataArray = this._getStateRangeDataArray(unit);
			arrayCnt = stateRangeDataArray.length;

			for( j = 0;j < arrayCnt;j++ ) {
				stateRangeData = stateRangeDataArray[j];
				indexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, stateRangeData.stateRange);
				this.copyRangeStateFromIndexArray(stateRangeData, indexArray);
			}
		}
	},
	
	// IndexArrayにいるユニットへ、stateRangeDataに合致するステートをコピーする
	copyRangeStateFromIndexArray: function(stateRangeData, indexArray) {
		var i, index, x, y, targetUnit;
		var count = indexArray.length;
		var stateRangeFilter = stateRangeData.stateRangeFilter;
		var state = this.getChildState(stateRangeData);
		
		if( state == null ) {
			return;
		}
		
		for (i = 0; i < count; i++) {
			index = indexArray[i];
			x = CurrentMap.getX(index);
			y = CurrentMap.getY(index);
			targetUnit = PosChecker.getUnitFromPos(x, y);
			if ( targetUnit !== null ) {
				if (this._checkFilter(targetUnit, stateRangeFilter)) {
					if (!this._hasSameRangeState(targetUnit, stateRangeData)) {
						// ステートを無効に出来るかチェック
						if (StateControl.isStateBlocked(targetUnit, null, state)) {
							// ステートは無効化されるため発動しない
							continue;
						}
						
						// 無効に出来なければステートを付与
						StateControl.arrangeState(targetUnit, state, IncreaseType.INCREASE);
						
						// 持続ターンをマスター側の値で更新
						this._setStateTurn(targetUnit, state, stateRangeData.stateTurn);
					}
				}
			}
		}
	},
	
	// srcUnitの持つ範囲ステートのうち、dstUnitが範囲に入っているステートを削除する
	deleteInRangeState: function(srcUnit, dstUnit) {
		var i, stateRangeData, state;
		var range = Math.abs(srcUnit.getMapX() - dstUnit.getMapX()) + Math.abs(srcUnit.getMapY() - dstUnit.getMapY());
		var stateRangeDataArray = this._getStateRangeDataArray(srcUnit);
		var arrayCnt = stateRangeDataArray.length;
		
		for( i = 0;i < arrayCnt;i++ ) {
			stateRangeData = stateRangeDataArray[i];
			if( range <= stateRangeData.stateRange ) {
				if (!this._hasSameRangeState(dstUnit, stateRangeData)) {
					state = this.getChildState(stateRangeData);
					StateControl.arrangeState(dstUnit, state, IncreaseType.DECREASE);
				}
			}
		}
	},
	
	// 範囲ステートユニットの配列に登録済みのユニットかチェック
	isFindUnit: function(unit) {
		var i;
		var length = this._rangeStateUnitArray.length;
		
		if( unit == null ) {
			return false;
		}
		
		for( i = 0;i < length;i++ ) {
			// 同一ユニットが登録済みであれば取り除く
			if( this._rangeStateUnitArray[i].getId() == unit.getId() ) {
				return true;
			}
		}
		
		return false;
	},
	
	// 指定IDのステートの取得
	getStateFromId: function(stateId) {
		var list = root.getBaseData().getStateList();
		
		return list.getDataFromId(stateId);
	},
	
	// 子に付与するステートを取得
	getChildState: function(stateRangeData) {
		// aroundStateIdがあればそのステートを取得
		if( typeof stateRangeData.aroundStateId !== 'undefined' ) {
			return this.getStateFromId(stateRangeData.aroundStateId);
		}
		
		// なければstateIdのステートを取得
		return this.getStateFromId(stateRangeData.stateId);
	},
	
	// 範囲ステート用のデータを生成してセットする
	// （複数ステートを掛けられた場合に備え、オブジェクト化したものを配列保持する）
	// 呼び出す前に、hasRangeFlag関数を呼び出して範囲ステートフラグが存在する事を確認しておくこと
	createRangeData: function(unit, state) {
		var i, cnt, obj;

		unit.custom.stateRangeId = state.getId();
		obj = {};
		obj.stateId          = state.getId();					// ステートID
		obj.stateTurn        = state.getTurn();					// ターン数
		obj.stateRange       = unit.custom.stateRange;			// 範囲
		obj.stateRangeFilter = unit.custom.stateRangeFilter;	// 対象（setRangeFlagToUnit()で作成する情報）
		if( typeof state.custom.aroundStateId !== 'undefined' ) {
			obj.aroundStateId = state.custom.aroundStateId;		// 周囲に付与されるステートのID
		}

		this._updateSameRangeState(unit, obj);
	},
	
	// 範囲ステートフラグのセット（範囲ステート設定用）
	setRangeFlagToUnit: function(targetUnit, item, unit) {
		// 杖の使用者がnullなら終了
		if( unit == null ) {
			return;
		}
		
		// 範囲ステートを付与するアイテムでなければ終了
		if( typeof item.custom.stateRange !== 'number' ) {
			return;
		}
		
		// 範囲が1未満なら終了
		var range = item.custom.stateRange;
		if( range < 1 ) {
			return;
		}
		
		// フラグとしてstateRangeとstateRangeFilterを設定
		targetUnit.custom.stateRange       = item.custom.stateRange;
		targetUnit.custom.stateRangeFilter = FilterControl.getBestFilter(unit.getUnitType(), item.getFilterFlag());
	},
	
	// 範囲ステートフラグを持つユニットか（範囲ステート設定用）
	hasRangeFlag: function(unit) {
		if( typeof unit.custom.stateRange !== 'number' ) {
			return false;
		}
		
		return true;
	},
	
	// 範囲ステートフラグのクリア（範囲ステート設定用）
	clearRangeFlag: function(unit) {
		delete unit.custom.stateRange;
		delete unit.custom.stateRangeFilter;
	},
	
	// 範囲ステートを所持するユニットか
	isStateRangeUnit: function(unit) {
		if( unit == null ) {
			return false;
		}
		
		if( typeof unit.custom.stateRangeDataArray === 'undefined' ) {
			return false;
		}
		return true;
	},
	
	// 指定IDのユニット取得
	_getUnitFromId: function(unitid) {
		var unitlist, unit, i, index;

		// 自軍、ゲスト、ゲストイベント
		if( unitid < 65536 || unitid >= 393216 ) {
			index = 0;
		}
		// 敵、敵イベント、援軍
		if( (unitid >= 65536 && unitid < 196608) || (unitid >= 327680 && unitid < 393216) ) {
			index = 1;
		}
		// 同盟、同盟イベント
		if( (unitid >= 196608 && unitid < 327680) ) {
			index = 2;
		}
		
		for( i = 0;i < 3;i++ ) {
			if( index == 0 ) {
				unitlist = PlayerList.getMainList();
			}
			else if( index == 1 ) {
				unitlist = root.getCurrentSession().getEnemyList();
			}
			else {
				unitlist = root.getCurrentSession().getAllyList();
			}
			unit = unitlist.getDataFromId(unitid); 
			
			if( unit != null ) {
				return unit;
			}
			index++;
			if( index >= 3 ) {
				index = 0;
			}
		}
		
		return null;
	},
	
	// // 範囲ステートユニットの配列クリア
	_initList: function() {
		this._rangeStateUnitArray = [];
	},
	
	// 範囲ステートを所持するユニットをリストから取得し、保持しておく
	_addRangeStateUnitFromList: function(list) {
		var unit, i, count;
		
		count = list.getCount();
		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			if( this.isStateRangeUnit(unit) ) {
				if( this._removeAlreadyEndRangeState(unit) != 0 ) {
					this._rangeStateUnitArray.push(unit);
				}
			}
		}
	},
	
	// 既に終了した範囲ステートを管理情報から消し、残った数を返す（0になったら範囲ステート持ちではなくなる）
	_removeAlreadyEndRangeState: function(unit) {
		var i, j, obj, turnState, turnStateId;
		var newArr = [];
		
		if( unit == null ) {
			return 0;
		}
		
		var arr = this._getStateRangeDataArray(unit);
		var length = arr.length;
		var list = unit.getTurnStateList();
		var count = list.getCount();
		
		for (i = 0; i < count; i++) {
			turnState   = list.getData(i);
			turnStateId = turnState.getState().getId();
			
			for( j = 0;j < length;j++ ) {
				obj = arr[j];
				// ターンステートと同一の範囲ステートがあれば新しい範囲ステートに登録
				if( obj.stateId == turnStateId ) {
					obj.stateTurn = turnState.getTurn();	// ステートの残り持続ターンを更新
					newArr.push(obj);
					break;
				}
			}
		}
		
		// 新しい範囲ステートが0なら範囲ステートの管理情報を消す
		var newLength = newArr.length
		if( newLength == 0 ) {
			this._clearStateRangeDataArray(unit);
			return 0;
		}
		
		// 新しい範囲ステートが1以上あれば再セット
		this._setStateRangeDataArray(unit, newArr);
		return newLength;
	},
	
	// 範囲ステートを受けるユニットの、ステート持続ターン更新（範囲ステート持ちのステートターン数と合わせる）
	_setStateTurn: function(unit, state, turn) {
		var i, count, list, turnState, stateId;
		
		list = unit.getTurnStateList();
		count = list.getCount();
		stateId = state.getId();
		
		for (i = 0; i < count; i++) {
			turnState = list.getData(i);

			if( turnState.getState().getId() == stateId ) {
				turnState.setTurn(turn);
				return;
			}
		}
	},
	
	// 範囲ステートの対象か、filterをチェックする
	_checkFilter: function(unit, filter) {
		var type = unit.getUnitType();
		
		if (filter & UnitFilterFlag.PLAYER) {
			if (type === UnitType.PLAYER) {
				return true;
			}
		}
		
		if (filter & UnitFilterFlag.ENEMY) {
			if (type === UnitType.ENEMY) {
				return true;
			}
		}
		
		if (filter & UnitFilterFlag.ALLY) {
			if (type === UnitType.ALLY) {
				return true;
			}
		}
		
		return false;
	},
	
	// 範囲ステート情報の更新（同一ステートがあれば上書き、なければ追加）
	_updateSameRangeState: function(unit, obj) {
		var i;
		var arr = this._getStateRangeDataArray(unit);
		var length = arr.length;
		
		for( i = 0;i < length;i++ ) {
			// 同一ステートであれば上書きする（付与ステートは同じだが範囲が違う場合も上書きされる）
			if( arr[i].stateId == obj.stateId ) {
				arr[i] = obj;
				break;
			}
		}
		
		if( i >= length ) {
			arr.push(obj);
		}
		
		this._setStateRangeDataArray(unit, arr);
	},
	
	// 指定の範囲ステートと同じ範囲ステートを所持しているか（同じ範囲ステートである別の親ユニットか）
	_hasSameRangeState: function(unit, obj) {
		var i;
		var arr = this._getStateRangeDataArray(unit);
		var length = arr.length;
		
		// 範囲ステートを所持していないならfalse
		if( length == 0 ) {
			return false;
		}

		for( i = 0;i < length;i++ ) {
			// 同一ステートなら同じ範囲ステートを所持しているのでtrue
			if( arr[i].stateId == obj.stateId ) {
				return true;
			}
		}
		
	// 範囲ステートを所持していないならfalse
		return false;
	},
	
	// 範囲ステートのクリア
	_clearStateRangeDataArray: function(unit) {
		if( unit != null ) {
			delete unit.custom.stateRangeDataArray;
		}
	},
	
	// 範囲ステートの取得
	_getStateRangeDataArray: function(unit) {
		var arr = [];
		
		if( unit != null && typeof unit.custom.stateRangeDataArray !== 'undefined' ) {
			arr = unit.custom.stateRangeDataArray;
		}
		return arr;
	},
	
	// 範囲ステートのセット
	_setStateRangeDataArray: function(unit, arr) {
		unit.custom.stateRangeDataArray = arr;
	}
};


