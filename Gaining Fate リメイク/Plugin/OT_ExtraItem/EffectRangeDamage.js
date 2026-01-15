
/*-----------------------------------------------------------------------------------------------
  
  範囲攻撃を行うアイテムを実装します。
    
  使用方法:
  アイテムでカスタムを選択し、キーワードにOT_ItemEffectRangeを設定し、
  アイテムのカスタムパラメータに各パラメータを設定してください。(readme参照)

  ・渡せるカスタムパラメータ
  readmeを参照
  
  作成者:
  o-to
  
  更新履歴:
  2015/10/11：範囲攻撃アイテムの新規作成(試作型)
  2015/10/13：範囲指定や付加ステータスなど様々な要素を追加
  2015/10/16：公式アップデート1.035に対応するように修正
  2015/10/31：スキルの状態異常無効に対応、敵AIを改善
              ダメージ数値の表示追加、ダメージエフェクトやユニット消滅を同時に再生するよう修正
              ステート付与時のアニメをステートのマップアニメに依存するよう修正
              マップ地形変更効果を追加
              使用時のダメージを敵のダメージと一緒に行うよう変更
  2015/12/04：最新バージョンではエラーで終了してしまうため修正
              ツール側のアニメーション再生に対応
  2016/02/28：
  1.060対応、敵がブロックや味方に囲まれてる場合エラーで終了してしまうため修正
  2016/03/23:
  1.067のエラーの応急手当
  2016/04/25:
  敵が補助オンリーの範囲アイテムを使用しない不具合を修正
  2016/05/03:
  補助オンリー(固定ダメージor固定回復量が0)の場合はダメージ表示とHP回復量の表示が省略されるように修正
  敵AIの行動決定に使用するスコアに倍率を設定可能に
  使用時ダメージにマイナス指定を行うとHP回復するように修正
  与えたダメージのHP吸収率を設定可能に
  2016/07/31:
  1.086対応、使用時にエラーで終了してしまうのを修正

  2016/10/17:
  威力の補正に各ステータスの値が影響する設定ができるように修正
  最終的な攻撃力に補正値を掛ける設定を追加
  一部誤字修正

  2017/01/16:
  Ver 1.109でのステート付与時のエラー対応

  2017/01/29:
  敵がステート付与系の範囲攻撃を行うとエラーとなる問題を修正

  2017/02/05:
  forループ用に使用している変数の宣言忘れしている箇所を修正
  ※同じように宣言忘れしている別スクリプトがあった場合、意図せぬ動作が起こるため

  2017/12/16:
  範囲攻撃アイテムの発動位置選択時にユニットにカーソルを合わせるとエラーで停止する問題を修正

  2018/05/01:
  範囲攻撃で敵を撃破した際にエラーが発生する不具合修正

  2019/10/06:
  OT_UnitReflectionをtrueにしてユニット能力を威力に反映するようにした時、
  「支援効果」による攻撃の補正値が参照されるよう修正。
  ダメージタイプが物理、魔法の場合に「支援効果」による防御の補正値が参照されるよう修正。
  支援効果の攻撃・防御・命中・回避の影響を受けるかどうかをカスパラで設定可能に修正（それぞれのデフォルトはtrue）。

  2020/02/23:
  OT_Recoveryをtrueにしての範囲回復時に使用者が対象に含まれていた場合、
  使用者に対する回復処理が二回行われていた問題を修正。

  2020/04/28:
  必中設定としてIER_HitMarkというカスタムパラメータ追加。
  
  IER_EffectRangeTypeに99を設定すると効果範囲が『全域』になるように修正。
  効果範囲が全域の場合は射程タイプの指定が無効となり、どこでも発動可能になります。
  また、範囲効果のタイプに四角型を追加。
  
  ヒット音などが重複しないようにする設定、IER_SoundDuplicateというカスタムパラメータ追加。
  
  効果範囲のタイプでブレス型の場合、カーソルを使用者の斜めに移動すると極端な処理落ちが発生する問題を修正。
  不具合の元になりそうだった変数名を修正(IndexArray→indexArray)
  また効果範囲のタイプをブレス型にした場合、射程タイプを強制的に十字型になるようになりました。
  
  効果範囲のタイプにボックス型を追加。
  
  アイテムの説明文を分割、game.iniの[keyboard]のSYSTEMで指定したキー(デフォルト:左shift)で表示切替可能に。
  
  効果範囲内のキャラへのダメージや命中率が表示されるようにウィンドウを修正、
  game.iniの[keyboard]のSYSTEMで指定したキー(デフォルト:左shift)で表示切替可能。
  
  敵が範囲攻撃アイテムを使う時のAI処理を大幅修正。処理速度が大幅に改善。
  
  最低限のカスタムパラメータ(威力、射程)で動作するようにデフォルト値を見直し。
  デフォルト値を定義したファイル、EffectRangeItemDefault.jsを作成。
  
  IER_HitReflection(ユニットの技を命中率に加算、武器の命中値を命中率に加算)について
  パラメータをIER_HitReflectionUnit、IER_HitReflectionWeaponに分割。
  (旧型式、新方式どちらの指定でも可能です)

  2020/05/04:
  敵が範囲攻撃アイテムを使う時のAI処理を修正。
  範囲回復や無差別系を使用する時に敵の総数が多いとスコアチェックで重くなっていたため、
  予測射程範囲を確認し射程外に確実になるユニットのスコアチェックをしないように処理を軽減。
  無差別系の時に周囲に敵味方が入り乱れてる状況だと範囲攻撃アイテムを使用しない事があるため
  範囲攻撃のチェック処理を修正。
  デバッグ確認用のログが出力されてたため修正。

  2020/05/06:
  報告でスクリプト競合が原因とされるエラーがあったため、
  報告のあった部分の変数名を修正。
  BaseCombinationCollector._getTargetListArrayが改変されてた場合に影響があるため
  専用の関数で改変されていないBaseCombinationCollector._getTargetListArrayと同じ処理をするように修正。
  デバッグ用のcheckTimeは大本の方でコンソール非出力にしているが念のため、コメントアウト

  2020/09/06:
  カスパラ(OT_EffectAnime)で指定したエフェクトアニメの再生で
  DynamicEventのanimationPlayを使用していたが
  エフェクトの再生が終了してもスキップのキーを押してスキップしない限り次の処理に進まないという
  不具合が発生する可能性があったためDynamicAnimeで再生するように処理を修正

-----------------------------------------------------------------------------------------------*/

(function() {


var alias1 = ItemPackageControl.getCustomItemSelectionObject;
ItemPackageControl.getCustomItemSelectionObject = function(item, keyword) {
	var result = alias1.call(this, item, keyword);
	
	if (keyword === OT_ItemEffectRange_getCustomKeyword()) {
		return OT_ItemEffectRangeSelection;
	}
	
	return result;
};

var alias2 = ItemPackageControl.getCustomItemUseObject;
ItemPackageControl.getCustomItemUseObject = function(item, keyword) {
	var result = alias2.call(this, item, keyword);
	
	if (keyword === OT_ItemEffectRange_getCustomKeyword()) {
		return OT_ItemEffectRangeUse;
	}
	
	return result;
};

var alias3 = ItemPackageControl.getCustomItemInfoObject;
ItemPackageControl.getCustomItemInfoObject = function(item, keyword) {
	var result = alias3.call(this, item, keyword);
	
	if (keyword === OT_ItemEffectRange_getCustomKeyword()) {
		return OT_ItemEffectRangeInfo;
	}
	
	return result;
};

var alias4 = ItemPackageControl.getCustomItemAvailabilityObject;
ItemPackageControl.getCustomItemAvailabilityObject = function(item, keyword) {
	var result = alias4.call(this, item, keyword);
	
	if (keyword === OT_ItemEffectRange_getCustomKeyword()) {
		return OT_ItemEffectRangeAvailability;
	}
	
	return result;
};

var alias5 = ItemPackageControl.getCustomItemAIObject;
ItemPackageControl.getCustomItemAIObject = function(item, keyword) {
	var result = alias5.call(this, item, keyword);
	
	if (keyword === OT_ItemEffectRange_getCustomKeyword()) {
		return OT_ItemEffectRangeAI;
	}
	
	return result;
};

// 経験値取得
var alias6 = ItemExpFlowEntry._getItemExperience;
ItemExpFlowEntry._getItemExperience = function(itemUseParent) {
	var exp = alias6.call(this, itemUseParent);

	if( itemUseParent.OT_SetExp != null )
	{
		exp += itemUseParent.OT_SetExp;
	}
	
	if (exp > 100) {
		exp = 100;
	}
	else if (exp < 0) {
		exp = 0;
	}

	return exp;
};

// アイテム発動位置選択時に相手にカーソル合わせた時に表示される
// ミニウィンドウ情報オブジェクトの設定
var alias7 = ItemPackageControl.getCustomItemPotencyObject;
ItemPackageControl.getCustomItemPotencyObject = function(item, keyword) {
	var result = alias7.call(this, item, keyword);
	
	if (keyword === OT_ItemEffectRange_getCustomKeyword()) {
		return createObject(BaseItemPotency);
	}
	
	return result;
};

// アイテム発動位置選択時に相手にカーソル合わせた時に表示される
// ミニウィンドウ情報オブジェクトの設定
//var alias8 = PosItemWindow.setPosTarget;
//PosItemWindow.setPosTarget = function(unit, item, targetUnit, targetItem, isSrc) {
//	if (item !== null && !item.isWeapon()) {
//		root.log(item.getCustomKeyword());
//		if(item.getCustomKeyword() == OT_ItemEffectRange_getCustomKeyword()) {
//			
//			return;
//		}
//	}
//	
//	//alias8.call(unit, item, targetUnit, targetItem, isSrc);
//};

var OT_ItemEffectRangeSelection = defineObject(BaseItemSelection,
{
	enterItemSelectionCycle: function(unit, item) {
		this._unit = unit;
		this._item = item;
		this._targetUnit = this._unit;
		this._targetPos = createPos(this._unit.getMapX(), this._unit.getMapY());
		this._targetClass = null;
		this._targetItem = null;
		this._isSelection = false;
		this._posSelector = createObject(OT_EffectRangePosSelector);
		
		return this.setInitialSelection();
	},
	setInitialSelection: function() {
		this.setPosSelection();
		
		return EnterResult.OK;
	},

	// アイテムを特定の位置に対して使用する場合に呼ばれる
	setPosSelection: function() {
		var filter = this.getUnitFilter();
		var indexArray = OT_EffectRangeIndexArray.createIndexArray(this._unit.getMapX(), this._unit.getMapY(), this._item);
		
		this._posSelector.setUnitOnly(this._unit, this._item, indexArray, PosMenuType.Item, filter);
		
		this.setFirstPos();
	},

	// アイテム使用時に射程範囲内かを確認
	isPosSelectable: function() {
		this._targetPos = this._posSelector.getSelectorPos(true);
		return this._targetPos !== null;
	},
			
	getUnitFilter: function() {
		var indifference = false;
		return UnitFilterFlag.PLAYER;
	}

}
);

var OT_ItemEffectRangeUseMode = {
	  START          : 0
	, ANIME          : 1
	, DAMAGE         : 2
	, ERASE          : 3
	, FLOWENTRY      : 4
	, FLOW           : 5
	, STATEENTRY     : 6
	, STATE          : 7
	, USEAFTER       : 8
	, END            : 9
};

var OT_ItemEffectRangeAnimeID = {
	  DAMAGE         : 10000
};

var OT_ItemEffectRangeUse = defineObject(BaseItemUse,
{
	_dynamicEvent: null,
	_targetPos: null,
	_itemTargetInfo: null,
	_itemUseParent: null,

	_dynamicAnime: Array(),
	_HitUnit: Array(),
	_AvoidUnit: Array(),
	_deadUnit: Array(),
	_HitDamage: Array(),
	_damageHitFlow: Array(),

	_eraseCounter: 0,
	_dynamicUseAnime: null,
	_FrameCount: 0,
	
	_soundDuplicate:true,
	_soundArray: Array(),
	_soundIdArray: Array(),

	_prepareData: function() {
		this._dynamicAnime = Array();
		this._HitUnit = Array();
		this._AvoidUnit = Array();
		this._deadUnit = Array();
		
		this._HitDamage = Array();
		this._FrameCount = 0;
		this._eraseCounter = createObject(EraseCounter);
		this._damageHitFlow = null;
	},
	
	enterMainUseCycle: function(itemUseParent) {
		this._prepareData();
		
		var generator;
		this._itemUseParent = itemUseParent;
		this._itemTargetInfo = itemUseParent.getItemTargetInfo();
		this._targetPos = this._itemTargetInfo.targetPos;
		var type = this._itemTargetInfo.item.getRangeType();
		var unit = this._itemTargetInfo.targetUnit;
		this._itemUseParent.OT_SetExp = 0;

		// AIによるアイテム使用では、位置が初期化されていないことがある
		if (this._targetPos === null) {
			this._targetPos = createPos(unit.getMapX(), unit.getMapY());
		}
		
		this._dynamicEvent = createObject(DynamicEvent);
		generator = this._dynamicEvent.acquireEventGenerator();

		// カメラ位置変更
		if (type !== SelectionRangeType.SELFONLY) {
			generator.locationFocus(this._targetPos.x, this._targetPos.y, true);
		}

		this._soundInit();
		this._soundDuplicate = OT_getCustomItemSoundDuplicate(this._itemTargetInfo.item);
		
		this.changeCycleMode(OT_ItemEffectRangeUseMode.START);
		this._dynamicEvent.executeDynamicEvent();
		
		return EnterResult.OK;
	},
	
	_drawFlow: function() {
		this._damageHitFlow.drawDamageHitFlowCycle();
	},
	
	_isLosted: function(unit) {
		return unit.getHp() <= 0;
	},
	
	_setDamage: function(unit, damage) {
		var hp;
		
		if (damage < 1) {
			return;
		}
		
		// ダメージ分だけユニットのhpを減らす
		hp = unit.getHp() - damage;
		if (hp <= 0) {
			// ユニットが不死身である場合は、hpを1でとどめる
			if (unit.isImmortal()) {
				unit.setHp(1);
			}
			else {
				unit.setHp(0);
				// 状態を死亡に変更する
				DamageControl.setDeathState(unit);
			}
		}
		else {
			unit.setHp(hp);
		}
	},
	
	_getDamageValue: function() {
		var eventCommandData = root.getEventCommandObject();
		var unit = eventCommandData.getTargetUnit();
		var damage = eventCommandData.getDamageValue();
		var type = eventCommandData.getDamageType();
		
		return Calculator.calculateDamageValue(unit, damage, type, 0);
	},

	moveUseAfter: function() {
		if(this._dynamicEvent.moveDynamicEvent() == MoveResult.END)
		{
			this.changeCycleMode(OT_ItemEffectRangeUseMode.END);
		}
		
		return MoveResult.CONTINUE;
	},

	_soundInit: function() {
		this._soundArray = [];
		this._soundIdArray = [];
	},
	
	_soundStock: function(soundHandle) {
		var soundId = soundHandle.getResourceId();
		if(this._soundDuplicate == true || this._soundIdArray.indexOf(soundId) == -1) {
			this._soundIdArray.push(soundId);
			this._soundArray.push(soundHandle);
		}
	},

	_soundPlay: function() {
		for ( i=0; i < this._soundArray.length; i++ ) {
			MediaControl.soundPlay(this._soundArray[i]);
		}
		
		this._soundArray = [];
		this._soundIdArray = [];
	},

	moveMainUseCycle: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;

		//root.log('test');
		if (mode === OT_ItemEffectRangeUseMode.START) {
			result = this.moveEvent();
			//root.log('start');
		}
		else if (mode === OT_ItemEffectRangeUseMode.ANIME) {
			//result = MoveResult.END;
			result = this.moveAnime();
			//root.log('anime');
		}
		else if (mode === OT_ItemEffectRangeUseMode.DAMAGE) {
			//result = MoveResult.END;
			result = this.moveDamage();
			//root.log('damage');
		}
		else if (mode === OT_ItemEffectRangeUseMode.ERASE) {
			//result = MoveResult.END;
			result = this.moveErase();
			//root.log('damage');
		}
		else if (mode === OT_ItemEffectRangeUseMode.FLOWENTRY) {
			//result = MoveResult.END;
			result = this.moveFlowEntry();
			//root.log('damage');
		}
		else if (mode === OT_ItemEffectRangeUseMode.FLOW) {
			//result = MoveResult.END;
			result = this.moveFlow();
			//root.log('damage');
		}
		else if (mode === OT_ItemEffectRangeUseMode.STATEENTRY) {
			//result = MoveResult.END;
			result = this.moveStateEntry();
			//root.log('damage');
		}
		else if (mode === OT_ItemEffectRangeUseMode.STATE) {
			//result = MoveResult.END;
			result = this.moveState();
			//root.log('damage');
		}
		else if (mode === OT_ItemEffectRangeUseMode.USEAFTER) {
			result = MoveResult.END;
			//result = this.moveUseAfter();
			//root.log('damage');
		}
		else if (mode === OT_ItemEffectRangeUseMode.END) {
			result = MoveResult.END;
			//root.log('end');
		}

		return result;
	},

	drawMainUseCycle: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;

		//root.log('test');
		if (mode === OT_ItemEffectRangeUseMode.ANIME) {
			//this.drawTest();
			this._drawAnime();
			//root.log('start');
		}
		else if (mode === OT_ItemEffectRangeUseMode.DAMAGE) {
			this.drawDamage();
			//root.log('damage');
		}
		else if (mode === OT_ItemEffectRangeUseMode.ERASE) {
			this.drawErase();
		}
		else if (mode === OT_ItemEffectRangeUseMode.FLOW) {
			this.drawFlow();
		}
		else if (mode === OT_ItemEffectRangeUseMode.STATE) {
			this.drawState();
		}
		
	},

	moveEvent: function() {
		var item = this._itemTargetInfo.item;

		if(this._dynamicEvent.moveDynamicEvent() == MoveResult.END)
		{
			// 自環境では再現しなかったが
			// generator.animationPlayのアニメ再生だと再生が終了しても
			// スキップしない限り次の処理に飛ばないという不具合があったという報告あったため
			// DynamicAnimeによる処理でアニメを再生させる
			//var generator = this._dynamicEvent.acquireEventGenerator();
			
			// アニメーション実行
			var x = LayoutControl.getPixelX(this._targetPos.x);
			var y = LayoutControl.getPixelY(this._targetPos.y);
			var anime = OT_getCustomItemAnimeData(item);
			var pos = LayoutControl.getMapAnimationPos(x, y, anime);
	
			this._dynamicUseAnime = createObject(DynamicAnime);
			if( anime !== null ) {
				//generator.animationPlay(anime, pos.x, pos.y, false, AnimePlayType.SYNC, 9999);
				this._dynamicUseAnime.startDynamicAnime(anime, pos.x, pos.y);
			}
			
			this.changeCycleMode(OT_ItemEffectRangeUseMode.ANIME);
			//this._dynamicEvent.executeDynamicEvent();
		}
		
		return MoveResult.CONTINUE;
	},
	
	moveAnime: function() {
		var item = this._itemTargetInfo.item;
		var unit = this._itemTargetInfo.unit;
		
		if(this._dynamicUseAnime.moveDynamicAnime() !== MoveResult.CONTINUE) {
			// サウンド重複無効処理
			if(this._soundDuplicate == false) {
				OT_EffectRangeUseSoundModeEnable();
			}
			var generator = this._dynamicEvent.acquireEventGenerator();
			var indexArray = OT_EffectRangeIndexArray.getEffectRangeItemIndexArray(this._targetPos.x, this._targetPos.y, item, this._itemTargetInfo.unit);

			// ダメージ判定など準備
			var i, index, px, py, targetUnit;
			var length = indexArray.length;
			var damage = OT_getCustomItemFinalDamage(unit, item);
			var damageType  = OT_getCustomItemType(item);
			var damagePoint = 0;
			var totalPoint  = 0;
			//var plus = OT_getCustomItemPlus(this._itemTargetInfo.unit, item);
			var indifference = OT_getCustomItemIndifference(item);
			var ExpMagnification = OT_getCustomItemEXPMagnification(item);
			var isRecovery = OT_getCustomItemRecovery(item);
			var noDamage = OT_getNoDamegeAttack(item);

			// 解除されるステート
			var delState = OT_getCustomItemDelState(item);

			// 追加されるステート
			var addState = OT_getCustomItemAddState(item);
			
			// 変更後のマップチップ
			var changeChip = OT_getCustomItemMapChipChangeDate(item);
			
			// 効果音重複処理
			var soundDuplicate = false;
			var soundArray = [];
			var soundIdArray = [];
			
			// アニメーション実行準備
			var x, y, pos, i;
			
			for (i = 0; i < length; i++) {
				index = indexArray[i];
				px = CurrentMap.getX(index);
				py = CurrentMap.getY(index);
				targetUnit = PosChecker.getUnitFromPos(px, py);

				var terrain = PosChecker.getTerrainFromPos(px, py);
				//var terrainBack = root.getCurrentSession().getTerrainFromPos(px, py, false);
				//var img = terrainBack.getMapChipImage();
				//var terrainID = terrain.getId();
				//var imgID = img.getId();
				//var imgRuntime = img.isRuntime();
				
				//root.log(terrainBack.getName() + ':' + terrainBack.getId() + ':' + img.getId() + ':' + img.isRuntime() + ':' + terrainBack.custom.test);
				//root.log(terrain.getName() + ':' + terrain.getId() + ':' + img.getId() + ':' + img.isRuntime() + ':' + terrainBack.custom.test);
				//root.log(terrain.getName() + ':' + terrain.getId() + ':' + terrain.custom.IER_MapChipChangeGroup[0]);

				if( changeChip != null )
				{
					ChipLength = changeChip.length;
					for( j=0 ; j<ChipLength ; j++ )
					{
						chip = changeChip[j];
						
						if( chip[1] == false && targetUnit != null ) continue;
						
						if( OT_isCustomItemMapChipChange(chip, terrain) )
						{
							var handle2 = root.getCurrentSession().getMapChipGraphicsHandle(px, py, false);
							generator.mapChipChange(px, py, false, handle2);
							if(chip[2].length == 4)
							{
								var handle = root.createResourceHandle(chip[2][0], chip[2][1], 0, chip[2][2], chip[2][3]);
								generator.mapChipChange(px, py, true, handle);
							}
						}
					}
				}
				
				//root.log('x:' + px + ' y:' + py);
				if(targetUnit !== null) {
					// 無差別攻撃じゃなければ味方に当たらないようにする
					if(indifference == false)
					{
						if( this.getUnitTypeAllowed(this._itemTargetInfo.unit, targetUnit, isRecovery) === true ) {
							continue;
						}
					}
					//_targetUnit.push(targetUnit);

					// 当たり判定を確認する
					if( OT_getCustomItemHitCheck(this._itemTargetInfo.unit, targetUnit, item) === false )
					{
						// 回避に成功
						var pushData = [targetUnit, false];
						var anime = OT_getCustomItemMissAnimeData(item);
						
						if( anime != null )
						{
							// ユニットの位置取得
							x = LayoutControl.getPixelX( px );
							y = LayoutControl.getPixelY( py );
							pos = LayoutControl.getMapAnimationPos(x, y, anime);

							// アニメ再生
							var dynamicAnime = createObject(DynamicAnime);
							dynamicAnime.startDynamicAnime(anime, pos.x, pos.y);
							this._dynamicAnime.push(dynamicAnime);
							
							pushData[1] = true;
						}
						this._AvoidUnit.push(pushData);
						continue;
					}
					
					this._HitUnit.push(targetUnit);
				}
				
			}
			
			var hitLength = this._HitUnit.length;
			var avoidLength = this._AvoidUnit.length;
			var useDamage = 0;

			// ヒットしたキャラと回避したキャラの処理を埋め込む
			for ( i = 0; i < hitLength; i++ ) {
				targetUnit = this._HitUnit[i];
				
				x = LayoutControl.getPixelX( targetUnit.getMapX() );
				y = LayoutControl.getPixelY( targetUnit.getMapY() );

				if(!noDamage)
				{
					if(isRecovery)
					{
						// ユニットの回復
						var anime = root.queryAnime('easyrecovery');
						damagePoint = Calculator.calculateRecoveryValue(targetUnit, damage, RecoveryType.SPECIFY, 0) * -1;
						
						if( unit === targetUnit ) {
							useDamage = damagePoint;
						} else {
							// 効果音再生
							var soundHandle = root.querySoundHandle('gaugechange');
							this._soundStock(soundHandle);
							
							generator.hpRecovery( targetUnit, anime, damage, RecoveryType.SPECIFY, true );
							this._HitDamage.push( {unit:targetUnit, value:damagePoint, x:x, y:y} );
						}
						totalPoint += damagePoint;
					}
					else
					{
						// ダメージ値の取得
						//damagePoint = Calculator.calculateDamageValue(targetUnit, damage, damageType, 0);
						damagePoint = OT_getCalculateDamageValue(item, targetUnit, damage, damageType, 0);
						
						if( unit === targetUnit )
						{
							useDamage = damagePoint;
						}
						else
						{
							var anime = OT_getCustomItemHitAnimeData(item);
							
							if(anime == null)
							{
								// 効果音再生
								var soundHandle = root.querySoundHandle('damage');
								this._soundStock(soundHandle);
								
								anime = root.queryAnime('easydamage');
							}
							pos = LayoutControl.getMapAnimationPos(x, y, anime);
		
							// アニメ再生
							var dynamicAnime = createObject(DynamicAnime);
							dynamicAnime.startDynamicAnime(anime, pos.x, pos.y);
							this._dynamicAnime.push(dynamicAnime);
	
							this._HitDamage.push( {unit:targetUnit, value:damagePoint, x:x, y:y} );
						}
						
						totalPoint += damagePoint;
					}
				}
				
				var data = StructureBuilder.buildAttackExperience();
				data.active = this._itemTargetInfo.unit;
				data.activeHp = 0;
				data.activeDamageTotal = 0;
				data.passive = targetUnit;
				data.passiveHp = targetUnit.getHP() - damagePoint;
				data.passiveDamageTotal = damagePoint;
				
				this._itemUseParent.OT_SetExp += Math.floor( ExperienceCalculator.calculateExperience(data) * ExpMagnification );
				//this._itemUseParent.OT_SetExp += Math.floor( ExperienceValueControl.calculateExperience(this._itemTargetInfo.unit, 0, 0, targetUnit, targetUnit.getHP() - damagePoint, damagePoint) * Magnification );
			}
			
			this._itemUseParent.OT_SetExp += OT_getCustomItemGetEXP(item);

			// 使用者を巻き込んでる場合、ダメージ量を一旦退避
			var userPoint = useDamage;

			// 使用後の反動ダメージを加算
			useDamage += OT_getCustomItemUseDamage(item, unit);
			
			// ダメージを吸収する
			useDamage -= OT_getAbsorptionRateValue(item, totalPoint);
			//root.log(userPoint);
			//root.log(useDamage);

			// 反動系の処理
			if( useDamage > 0 ) {
				// ユニットの位置取得
				x = LayoutControl.getPixelX( unit.getMapX() );
				y = LayoutControl.getPixelY( unit.getMapY() );

				var anime = OT_getCustomItemUseDamageAnimeData(item);

				if(anime == null)
				{
					// 効果音再生
					var soundHandle = root.querySoundHandle('damage');
					this._soundStock(soundHandle);
					
					anime = root.queryAnime('easydamage');
				}
				pos = LayoutControl.getMapAnimationPos(x, y, anime);

				// アニメ再生
				var dynamicAnime = createObject(DynamicAnime);
				dynamicAnime.startDynamicAnime(anime, pos.x, pos.y);
				this._dynamicAnime.push(dynamicAnime);

				if( OT_getUseDamageDeath(item) == false )
				{
					var hp = unit.getHp() - useDamage;
					if (hp <= 0) {
						useDamage = unit.getHp() - 1;
						useDamage += userPoint; // 自分がまきこまれた分のダメージ量はちゃんと受ける
					}
				}

				this._HitDamage.push( {unit:unit, value:useDamage, x:x, y:y} );
			} else if( useDamage < 0 ) {
				// ユニットの位置取得
				x = LayoutControl.getPixelX( unit.getMapX() );
				y = LayoutControl.getPixelY( unit.getMapY() );
				//pos = LayoutControl.getMapAnimationPos(x, y);

				// ユニットの回復
				var anime = root.queryAnime('easyrecovery');
				generator.hpRecovery( unit, anime, (useDamage * -1), RecoveryType.SPECIFY, true );

				// 効果音再生
				var soundHandle = root.querySoundHandle('gaugechange');
				this._soundStock(soundHandle);
				
				this._HitDamage.push( {unit:unit, value:useDamage, x:x, y:y} );
			}

			if( this._HitDamage.length == 0 && avoidLength == 0 )
			{
				this.changeCycleMode(OT_ItemEffectRangeUseMode.STATEENTRY);
			}
			else
			{
				this.changeCycleMode(OT_ItemEffectRangeUseMode.DAMAGE);
			}
			
			for ( i=0; i < soundArray.length; i++ ) {
				//root.log(soundArray[i].getResourceId());
				//MediaControl.soundPlay(soundArray[i]);
			}
				
			this._soundPlay();
			this._dynamicEvent.executeDynamicEvent();
		}
		
		return MoveResult.CONTINUE;
	},

	// ダメージ処理
	moveDamage: function() {
		var item = this._itemTargetInfo.item;
		var unit = this._itemTargetInfo.unit;
		var length = this._dynamicAnime.length;
		var hitLength = this._HitDamage.length;
		var avoidLength = this._AvoidUnit.length;
		var isEnd = true;
		var noDamage = OT_getNoDamegeAttack(item);

		for ( var i = 0; i < length; i++ ) {
			if (this._dynamicAnime[i].moveDynamicAnime() == MoveResult.CONTINUE) {
				isEnd = false;
			}
			else
			{
				this._dynamicAnime[i].endEffect();
			}
		}

		if(isEnd)
		{
			// 50フレーム待機
			if( this._FrameCount > 50 )
			{
				this.changeCycleMode(OT_ItemEffectRangeUseMode.STATEENTRY);
				for ( var i = 0; i < hitLength; i++ ) {
					var hit = this._HitDamage[i];

					// ダメージを与える。ここで対象のHPが変化する
					this._setDamage( hit['unit'], hit['value'] );
					
					// 対象が死亡した場合
					if( this._isLosted( hit['unit'] ) ) {
						// ユニットの消去処理で明示的にユニットを描画するために、デフォルト描画を無効
						hit['unit'].setInvisible(true);
						this._deadUnit.push( hit['unit'] );
						this.changeCycleMode(OT_ItemEffectRangeUseMode.ERASE);
					}
				}
				this._FrameCount = 0;
			}
			else
			{
				this._FrameCount++;
			}
		}
		
		return MoveResult.CONTINUE;
	},

	// 死亡キャラの消滅処理
	moveErase: function() {
		if (this._eraseCounter.moveEraseCounter() !== MoveResult.CONTINUE) {
			this.changeCycleMode(OT_ItemEffectRangeUseMode.FLOWENTRY);
		}

		return MoveResult.CONTINUE;
	},

	// 死亡キャラのアイテムドロップやイベントの開始処理
	moveFlowEntry: function() {
		var item = this._itemTargetInfo.item;
		var unit = this._itemTargetInfo.unit;
		var targetUnit = this._deadUnit.shift();

		// 全ての死亡キャラの処理が完了したら状態異常の付与へ
		if( targetUnit == null ) 
		{
			this.changeCycleMode(OT_ItemEffectRangeUseMode.STATEENTRY);
			return MoveResult.CONTINUE;
		}
		
		this._damageHitFlow = createObject(DamageHitFlow);
		if (this._damageHitFlow.enterDamageHitFlowCycle(unit, targetUnit) === EnterResult.NOTENTER)
		{
			return MoveResult.CONTINUE;
		}
		this.changeCycleMode(OT_ItemEffectRangeUseMode.FLOW);

		return MoveResult.CONTINUE;
	},

	moveStateEntry: function() {
		var item = this._itemTargetInfo.item;
		var unit = this._itemTargetInfo.unit;
		var hitLength = this._HitUnit.length;
		this._dynamicAnime = Array();
		var addState, delState, list, isGood, isBad, result1, result2;
		var x, y, pos;
		list = root.getBaseData().getEffectAnimationList(true);

		if( unit.getHP() > 0 )
		{
			x = LayoutControl.getPixelX( unit.getMapX() );
			y = LayoutControl.getPixelY( unit.getMapY() );
	
			// 使用時に追加されるステート
			addState = OT_getCustomItemUseAddState(item);
	
			// 使用時に解除されるステート
			delState = OT_getCustomItemUseDelState(item);
	
			// ステートの追加
			for( var j=0 ; j<addState.length ; j++)
			{
				if( Probability.getProbability( addState[j][1] ) && StateControl.getTurnState( unit, addState[j][0] ) === null )
				{
					// 耐性ステートを確認
					if (StateControl.isStateBlocked(unit, unit, addState[j][0])) {
						// ステートは無効対象であるため発動しない
						continue;
					}
						
					StateControl.arrangeState(unit, addState[j][0], IncreaseType.INCREASE);
					
					// アニメ再生
					var anime = addState[j][0].getEasyAnime();
					pos = LayoutControl.getMapAnimationPos(x, y, anime);
					var dynamicAnime = createObject(DynamicAnime);
					dynamicAnime.startDynamicAnime(anime, pos.x, pos.y);
					this._dynamicAnime.push(dynamicAnime);
				}
			}

			// ステートの解除
			result = OT_setCustomItemDelState(unit, delState);
	
			if( result & 0x01 )
			{
				// アニメ再生
				var anime = OT_getCustomItemUseDeleteBadAnimeData(item);
				pos = LayoutControl.getMapAnimationPos(x, y, anime);
				var dynamicAnime = createObject(DynamicAnime);
				dynamicAnime.startDynamicAnime(anime, pos.x, pos.y);
				this._dynamicAnime.push(dynamicAnime);
			} 
			
			if( result & 0x02 )
			{
				var anime = OT_getCustomItemUseDeleteGoodAnimeData(item);
				pos = LayoutControl.getMapAnimationPos(x, y, anime);
				var dynamicAnime = createObject(DynamicAnime);
				dynamicAnime.startDynamicAnime(anime, pos.x, pos.y);
				this._dynamicAnime.push(dynamicAnime);
			}
		}
			
		// ヒットしたキャラしたキャラに状態異常処理を埋め込む
		for ( var i = 0; i < hitLength; i++ ) {
			var targetUnit = this._HitUnit[i]
			
			if( targetUnit.getHP() <= 0 ) continue;
			
			x = LayoutControl.getPixelX( targetUnit.getMapX() );
			y = LayoutControl.getPixelY( targetUnit.getMapY() );

			// 解除されるステート
			delState = OT_getCustomItemDelState(item);

			// 追加されるステート
			addState = OT_getCustomItemAddState(item);

			// ステートの追加
			for( var j=0 ; j<addState.length ; j++)
			{
				if( Probability.getProbability( addState[j][1] ) && StateControl.getTurnState( targetUnit, addState[j][0] ) === null )
				{
					// 耐性ステートを確認
					if (StateControl.isStateBlocked(targetUnit, unit, addState[j][0])) {
						// ステートは無効対象であるため発動しない
						continue;
					}
						
					StateControl.arrangeState(targetUnit, addState[j][0], IncreaseType.INCREASE);
					
					// アニメ再生
					var anime = addState[j][0].getEasyAnime();
					pos = LayoutControl.getMapAnimationPos(x, y, anime);
					var dynamicAnime = createObject(DynamicAnime);
					dynamicAnime.startDynamicAnime(anime, pos.x, pos.y);
					this._dynamicAnime.push(dynamicAnime);
				}
			}

			// ステートの解除
			result = OT_setCustomItemDelState(targetUnit, delState);
	
			if( result & 0x01 )
			{
				// アニメ再生
				var anime = OT_getCustomItemDeleteBadAnimeData(item);
				pos = LayoutControl.getMapAnimationPos(x, y, anime);
				var dynamicAnime = createObject(DynamicAnime);
				dynamicAnime.startDynamicAnime(anime, pos.x, pos.y);
				this._dynamicAnime.push(dynamicAnime);
			} 
			
			if( result & 0x02 )
			{
				var anime = OT_getCustomItemDeleteGoodAnimeData(item);
				pos = LayoutControl.getMapAnimationPos(x, y, anime);
				var dynamicAnime = createObject(DynamicAnime);
				dynamicAnime.startDynamicAnime(anime, pos.x, pos.y);
				this._dynamicAnime.push(dynamicAnime);
			}
		}
		
		// サウンド重複無効処理
		if(this._soundDuplicate == false) {
			OT_EffectRangeUseSoundModeEnable();
		}
		
		this.changeCycleMode(OT_ItemEffectRangeUseMode.STATE);
		return MoveResult.CONTINUE;
	},

	// ステート付与アニメ
	moveState: function() {
		var item = this._itemTargetInfo.item;
		var unit = this._itemTargetInfo.unit;
		var length = this._dynamicAnime.length;
		var isEnd = true;

		for ( var i = 0; i < length; i++ ) {
			if (this._dynamicAnime[i].moveDynamicAnime() == MoveResult.CONTINUE) {
				isEnd = false;
			}
			else
			{
				this._dynamicAnime[i].endEffect();
			}
		}

		if(isEnd)
		{
			OT_EffectRangeUseSoundModeDisable();
			return MoveResult.END;
		}

		return MoveResult.CONTINUE;
	},
		
	moveFlow: function() {
		if( this._damageHitFlow.moveDamageHitFlowCycle() === MoveResult.END )
		{
			this.changeCycleMode(OT_ItemEffectRangeUseMode.FLOWENTRY);
		}

		return MoveResult.CONTINUE;
	},

	_drawAnime: function() {
		this._dynamicUseAnime.drawDynamicAnime();
	},

	drawDamage: function() {
		var item = this._itemTargetInfo.item;
		var isRecovery = OT_getCustomItemRecovery(item);
		var length = this._dynamicAnime.length;
		var hitLength = this._HitDamage.length;
		var avoidLength = this._AvoidUnit.length;

		for ( var i = 0; i < length; i++ ) {
			this._dynamicAnime[i].drawDynamicAnime();
		}

		// ダメージ値の描写
		for ( var i = 0; i < hitLength; i++ ) {
			var hit = this._HitDamage[i];
			
			if( hit['value'] < 0 )
			{
				TextRenderer.drawText(hit['x']+1, hit['y']+1, -hit['value'], -1, 0x101010, TextRenderer.getDefaultFont() );
				TextRenderer.drawText(hit['x'], hit['y'], -hit['value'], -1, 0x50ff50, TextRenderer.getDefaultFont() );
			}
			else
			{
				TextRenderer.drawText(hit['x']+1, hit['y']+1, hit['value'], -1, 0x101010, TextRenderer.getDefaultFont() );
				TextRenderer.drawText(hit['x'], hit['y'], hit['value'], -1, ColorValue.DEFAULT, TextRenderer.getDefaultFont() );
			}
		}

		// ミスの描写
		for ( var i = 0; i < avoidLength; i++ ) {
			if(this._AvoidUnit[i][1]) continue;
			
			var targetUnit = this._AvoidUnit[i][0];
			var x = LayoutControl.getPixelX( targetUnit.getMapX() );
			var y = LayoutControl.getPixelY( targetUnit.getMapY() );
			
			TextRenderer.drawText(x+1, y+1, 'MISS', -1, 0x101010, TextRenderer.getDefaultFont() );
			TextRenderer.drawText(x, y, 'MISS', -1, 0x5050ff, TextRenderer.getDefaultFont() );
		}
	},

	drawErase: function() {
		var length = this._deadUnit.length;

		// 消滅の描写
		for ( var i = 0; i < length; i++ ) {
			var unit = this._deadUnit[i];
			var x = LayoutControl.getPixelX(unit.getMapX());
			var y = LayoutControl.getPixelY(unit.getMapY());
			var alpha = this._eraseCounter.getEraseAlpha();
			var unitRenderParam = StructureBuilder.buildUnitRenderParam();
			var colorIndex = unit.getUnitType();
			var animationIndex = MapLayer.getAnimationIndexFromUnit(unit);
			
			if (unit.isWait()) {
				colorIndex = 3;
			}
			
			if (unit.isActionStop()) {
				animationIndex = 1;
			}
			
			unitRenderParam.colorIndex = colorIndex;
			unitRenderParam.animationIndex = animationIndex;
			unitRenderParam.alpha = alpha;
			UnitRenderer.drawScrollUnit(unit, x, y, unitRenderParam);
		}
	},
	
	drawFlow: function() {
		if( this._damageHitFlow != null)
			this._damageHitFlow.drawDamageHitFlowCycle();
	},
	
	drawState: function() {
		var length = this._dynamicAnime.length;

		for ( var i = 0; i < length; i++ ) {
			this._dynamicAnime[i].drawDynamicAnime();
		}
	},

	// テスト用
	drawTest: function() {
		NumberRenderer.drawNumber(200, 200, 1000);
		TextRenderer.drawText(200, 250, 'MISS', -1, ColorValue.DEFAULT, TextRenderer.getDefaultFont() );
		
	},

	getUnitTypeAllowed: function(unit, targetUnit, isRecovery) {

		if( isRecovery )
		{
			if( FilterControl.isReverseUnitTypeAllowed(unit, targetUnit) === true )
			{
				return true;
			}
		}
		else
		{
			if( FilterControl.isReverseUnitTypeAllowed(unit, targetUnit) === false )
			{
				return true;
			}
		}

		return false;
	},
	
	// ツール側のアニメーションの再生
	getItemAnimePos: function(itemUseParent, animeData) {
		var targetPos = itemUseParent.getItemTargetInfo().targetPos;
		var unit = itemUseParent.getItemTargetInfo().targetUnit;
		
		// AIによるアイテム使用では、位置が初期化されていないことがある
		if (targetPos === null) {
			targetPos = createPos(unit.getMapX(), unit.getMapY());
		}
		
		var x = LayoutControl.getPixelX(targetPos.x);
		var y = LayoutControl.getPixelY(targetPos.y);
		
		return LayoutControl.getMapAnimationPos(x, y, animeData);
	}	
}
);

var EffectRangeInfoType = 0;

var OT_ItemEffectRangeInfo = defineObject(BaseItemInfo,
{
	_nowDrawInfo:null,
	_drawInfoArray:[],
	
	_isAddGoodState:false,
	_isDelGoodState:false,
	_isAddBadState:false,
	_isDelBadState:false,
	_isUseAddGoodState:false,
	_isUseDelGoodState:false,
	_isUseAddBadState:false,
	_isUseDelBadState:false,
	_infoType:0,
	_scrollCount:0,
	_panelSize:16,
	_indexRangeArray:[],
	_indexScopeArray:[],
	_indexWidthSize:1000,
	
	_startRange:0,
	_endRange:0,
	_startEffectRange:0,
	_endEffectRange:0,
	_rangeType:0,
	_effectRangeType:0,
	_addState   :[],
	_delState   :[],
	_useAddState:[],
	_useDelState:[],
	_delAllState   :[],
	_useDelAllState:[],
	_useDamageSign:0,

	_isRecovery           :false,
	_isIndifference       :false,
	_isHitMark            :false,
	_isHitReflectionUnit  :false,
	_isHitReflectionWeapon:false,
	_isHitAvoid           :false,
	_powerMagnification   :1.0,
	_absorptionRate       :0.0,

	setInfoItem: function(item) {
		this._item = item;
		this._startRange       = OT_getCustomItemRangeMin(item);
		this._endRange         = OT_getCustomItemRangeMax(item);
		this._startEffectRange = OT_getCustomItemEffectRangeMin(item);
		this._endEffectRange   = OT_getCustomItemEffectRangeMax(item);

		this._rangeType = OT_getCustomItemRangeType(item);
		this._effectRangeType = OT_getCustomItemEffectRangeType(item);
		this._indexRangeArray = this._GetNormalizeRangeIndexData();
		this._indexScopeArray = this._GetNormalizeScopeIndexData();

		this._addState    = OT_getCustomItemAddState(item);
		this._delState    = OT_getCustomItemDelState(item);
		this._useAddState = OT_getCustomItemUseAddState(item);
		this._useDelState = OT_getCustomItemUseDelState(item);
		
		this._delAllState    = OT_getCustomItemDelAllState(item);
		this._useDelAllState = OT_getCustomItemUseDelAllState(item);
		
		this._infoType = EffectRangeInfoType;
		
		this._drawInfoArray = [];
		this._drawInfoArray.push(this._drawInfoTypeNormal);
		this._drawInfoArray.push(this._drawInfoTypeRange);

		switch(this._effectRangeType) {
			case OT_EffectRangeType.LINE:
			case OT_EffectRangeType.HORIZONTALLINE:
				this._drawInfoArray.push(this._drawInfoTypeEffectRange);
				switch( this._rangeType ) {
					// 直線や一文字で斜め撃ちが可能なもの
					case OT_EffectRangeType.NORMAL:
					case OT_EffectRangeType.XCROSS:
					case OT_EffectRangeType.DOUBLECROSS:
						this._indexScopeSlantingArray = this._GetNormalizeScopeSlantingIndexData();
						this._drawInfoArray.push(this._drawInfoTypeEffectRangeSlanting);
						
						break;
				}
				
				break;
				
			default:
				this._drawInfoArray.push(this._drawInfoTypeEffectRange);
				break;
		}

		if(this._addState.length > 0 || this._delState.length > 0) {
			this._drawInfoArray.push(this._drawInfoTypeAddDelState);
		}
		
		if(this._useAddState.length > 0 || this._useDelState.length > 0) {
			this._drawInfoArray.push(this._drawInfoTypeUseAddDelState);
		}
		
		
		this._isRecovery            = OT_getCustomItemRecovery(item);
		this._isIndifference        = OT_getCustomItemIndifference(item);
		this._useDamageSign         = OT_getCustomItemisUseDamageSign(item);
		this._isHitMark             = OT_getCustomItemHitMark(item);
		this._isHitReflectionUnit   = OT_getCustomItemHITReflectionUnit(item);
		this._isHitReflectionWeapon = OT_getCustomItemHITReflectionWeapon(item);
		this._isHitAvoid            = OT_getCustomItemHitAvoid(item);
		this._powerMagnification    = OT_getCustomItemDamageMagnification(item);
		this._absorptionRate        = OT_getAbsorptionRate(item);
		
		this.setInfoType();
	},

	setInfoType: function() {
		if(this._drawInfoArray.length <= this._infoType) {
			this._infoType = this._drawInfoArray.length - 1;
		}
		EffectRangeInfoType = this._infoType;
	},

	changeInfoType: function() {
		this._infoType += 1;
		if(this._drawInfoArray.length <= this._infoType) {
			this._infoType = 0;
		}
		EffectRangeInfoType = this._infoType;
	},

	// moveItemInfoCycleが反応しないのでここで入力処理
	drawItemInfoCycle: function(x, y) {
		var functionTmp;
		if(InputControl.isInputAction(InputType.BTN4)) {
			MediaControl.soundDirect('menutargetchange');
			this.changeInfoType();
		}

		var i = this._infoType;
		this._drawInfoArray[i].call(this, x, y);

		// 左Shiftで表示切替の部分
		var textui = root.queryTextUI('single_window');
		var pic  = textui.getUIImage();
		var width = 200;
		var height = 24;
		//var px = LayoutControl.getCenterX(-1, width);
		//var py = LayoutControl.getCenterY(-1, height);

		y -= 30;
		WindowRenderer.drawStretchWindow(x-15, y, width, height, pic);
		ItemInfoRenderer.drawKeyword(x, y, 'ページ[' + (this._infoType + 1) + '/' + this._drawInfoArray.length + ']');
	},
	
	// 背景ウィンドウの大きさ
	getInfoPartsCount: function() {
		var count = 7;
		return count;
	},
	
	_drawTitle: function(x, y) {
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();

		var item = this._item;
		var text = '';
		
		if( this._isRecovery )
		{
			text += '特殊回復';
		}
		else
		{
			text += '特殊攻撃';
		}

		if( this._isIndifference )
		{
			text += '(無差別)';
		}
		//text += '[左Shiftで表示切替]';

		ItemInfoRenderer.drawKeyword(x, y, text);
		x += ItemInfoRenderer.getSpaceX();
		x += 40;
	},

	_drawValue: function(x, y) {
		var item = this._item;
		var damage = OT_getCustomItemDamage(item);
		
		ItemInfoRenderer.drawKeyword(x, y, StringTable.Damage_Pow);
		x += ItemInfoRenderer.getSpaceX();

		NumberRenderer.drawRightNumber(x, y, damage);
		x += 40;

		this._drawInfo(x, y);
	},

	_drawInfo: function(x, y) {
		var text;
		var damageType = OT_getCustomItemType(this._item);
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		
		if (damageType === DamageType.FIXED) {
			text = StringTable.DamageType_Fixed;
		}
		else if (damageType === DamageType.PHYSICS) {
			text = StringTable.DamageType_Physics;
		}
		else {
			text = StringTable.DamageType_Magic;
		}
			
		ItemInfoRenderer.drawKeyword(x, y, StringTable.DamageType_Name);
		x += ItemInfoRenderer.getSpaceX();
		TextRenderer.drawKeywordText(x, y, text, -1, color, font);
		x += 40;
	},

	drawRange: function(x, y, rangeValue, rangeType) {
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var minRange = OT_getCustomItemRangeMin(this._item);
		var text = '';
		
		ItemInfoRenderer.drawKeyword(x, y, root.queryCommand('range_capacity'));
		x += ItemInfoRenderer.getSpaceX();
		
		if (rangeType === SelectionRangeType.SELFONLY) {
			TextRenderer.drawKeywordText(x-30, y, StringTable.Range_Self, -1, color, font);
		}
		else if (rangeType === SelectionRangeType.MULTI) {
			text =  minRange + '～' + rangeValue + '(' + OT_getCustomItemRangeSpread(this._item) + ')';
			TextRenderer.drawKeywordText(x-30, y, text, -1, color, font);
		}
		else if (rangeType === SelectionRangeType.ALL) {
			text =  minRange + '～' + '(' + OT_getCustomItemRangeSpread(this._item) + ')';
			TextRenderer.drawKeywordText(x-30, y, text, -1, color, font);
		}
		x += 40;

		var type = OT_getCustomItemRangeType(this._item);
		ItemInfoRenderer.drawKeyword(x, y, '射程ﾀｲﾌﾟ');
		x += ItemInfoRenderer.getSpaceX();

		switch( type )
		{
			case OT_EffectRangeType.CROSS:
				text = '十字型';
				break;
			
			case OT_EffectRangeType.XCROSS:
				text = 'Ｘ型';

			case OT_EffectRangeType.DOUBLECROSS:
				text = '※型';
				break;
			
			default:
				text = '通常';
				break;
		}

		TextRenderer.drawKeywordText(x, y, text, -1, color, font);
	},

	drawEffectRange: function(x, y) {
		var text;
		var damageType = OT_getCustomItemType(this._item);
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();

		ItemInfoRenderer.drawKeyword(x, y, '範囲');
		x += ItemInfoRenderer.getSpaceX();

		var min = OT_getCustomItemEffectRangeMin(this._item);
		var max = OT_getCustomItemEffectRangeMax(this._item);
		text = min + '～' + max + '(' + OT_getCustomItemEffectSpread(this._item) + ')';
		TextRenderer.drawKeywordText(x-30, y, text, -1, color, font);
		x += 40;

		var type = OT_getCustomItemEffectRangeType(this._item);
		ItemInfoRenderer.drawKeyword(x, y, '範囲ﾀｲﾌﾟ');
		x += ItemInfoRenderer.getSpaceX();

		switch( type )
		{
			case OT_EffectRangeType.CROSS:
				text = '十字型';
				break;
			
			case OT_EffectRangeType.XCROSS:
				text = 'Ｘ型';

			case OT_EffectRangeType.DOUBLECROSS:
				text = '※型';
				break;
			
			case OT_EffectRangeType.LINE:
				text = 'レーザー';
				break;

			case OT_EffectRangeType.HORIZONTALLINE:
				text = 'サイド';
				break;

			case OT_EffectRangeType.BREATH:
				text = 'ブレス';
				break;

			default:
				text = '通常';
				break;
		}

		TextRenderer.drawKeywordText(x, y, text, -1, color, font);
	},

	_drawHit: function(x, y) {
		var px = x, py = y;
		var text;
		var damageType = OT_getCustomItemType(this._item);
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var text = '命中率';

		// 必中設定があったら
		if(this._isHitMark) {
			ItemInfoRenderer.drawKeyword(x, y, text);
			x += ItemInfoRenderer.getSpaceX();
			TextRenderer.drawKeywordText(x, y, '必中', -1, color, font);
			return;
		}

		ItemInfoRenderer.drawKeyword(x, y, text);
		x += ItemInfoRenderer.getSpaceX();

		var text = OT_getCustomItemHitValue(this._item);
		
		if( this._isHitReflectionUnit )
		{
			text += '+技×3';
		}

		if( this._isHitReflectionWeapon )
		{
			text += '+武器命中';
		}
		
		if( !this._isHitAvoid  ) {
			text += '(回避率無視)';
		}
		TextRenderer.drawKeywordText(x, y, text, -1, color, font);
	},

	_drawHitBefore: function(x, y) {
		var px = x, py = y;
		var text;
		var damageType = OT_getCustomItemType(this._item);
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var text = '命中率';

		ItemInfoRenderer.drawKeyword(x, y, text);
	},

	_drawHitAfter: function(x, y) {
		var px = x, py = y;
		var text;
		var damageType = OT_getCustomItemType(this._item);
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var text = '';

		var text = OT_getCustomItemHitValue(this._item);
		
		if( this._isHitReflectionUnit )
		{
			text += '+技×3';
		}

		if( this._isHitReflectionWeapon )
		{
			text += '+武器命中';
		}
		
		if( !this._isHitAvoid  ) {
			text += '(回避率無視)';
		}
		TextRenderer.drawKeywordText(x, y, text, -1, color, font);
	},
	
	_drawReflection: function(x, y) {
		var item = this._item;
		var damage = OT_getCustomItemDamage(item);
		var damageType = OT_getCustomItemType(item);
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var reflection = OT_getCustomItemUnitReflection(item);
		var weaponReflection = OT_getCustomItemWeaponReflection(item);
		var StatueReflection = item.custom.OT_StatueReflection;
		var text = '';

		ItemInfoRenderer.drawKeyword(x, y, '威力');
		x += ItemInfoRenderer.getSpaceX() - 25;

		if( reflection == true )
		{
			if(damage != 0) {
				text = damage;
			}
			
			if(StatueReflection == null)
			{
				if(text !== '') text += '+';

				//root.log('OT_StatueReflection未設定');
				if (damageType === DamageType.PHYSICS) {
					text += OT_getParamName('POW');
					//text += root.queryCommand('attack_capacity')
					if(OT_getCustomItemCheckSupportAtk(item)) {
						text += "+支援補正";
					}
				} else if (damageType === DamageType.MAGIC) {
					text += OT_getParamName('MAG');
					//text += root.queryCommand('attack_capacity')
					if(OT_getCustomItemCheckSupportAtk(item)) {
						text += "+支援補正";
					}
				} else {
					text = damage;
				}
			}
			else
			{
				//root.log('OT_StatueReflection設定済');
				for( var key in StatueReflection )
				{
					if( typeof StatueReflection[key] === 'number' )
					{
						if(text !== '') text += '+';
						text += OT_getParamName(key);
						if(StatueReflection[key] != 1.00)
						{
							text += '*' + StatueReflection[key];
						}
					}
				}
			}
		} else {
			text = damage;
		}
		
		if( weaponReflection == true ) {
			if(text !== '') text += '+';
			text += '武器';
		}

		if(this._powerMagnification != 1.00) {
			text = '(' + text + ')*' + this._powerMagnification;
		}
	
		TextRenderer.drawKeywordText(x, y, text, -1, color, font);
	},
	
	_drawState: function(x, y) {
		var px = x, py = y;
		var text;
		var damageType = OT_getCustomItemType(this._item);
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var text = '状態変化';

		ItemInfoRenderer.drawKeyword(x, y, text);
		x += ItemInfoRenderer.getSpaceX();
		text = '';

		if( this._isAddGoodState || this._isDelGoodState )
		{
			text += 'GOOD';
			if( this._isAddGoodState )
			{
				text += '付加　';
			}
	
			if( this._isDelGoodState )
			{
				text += '消滅　';
			}
		}

		if( this._isAddBadState || this._isDelBadState )
		{
			text += '異常';
			
			if( this._isAddBadState )
			{
				text += '付加　';
			}
			if( this._isDelBadState )
			{
				text += '回復';
			}
		}
		
		TextRenderer.drawKeywordText(x, y, text, 200, color, font);
	},

	_drawRecoil: function(x, y) {
		var text;
		var damageType = OT_getCustomItemType(this._item);
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();

		var text = '';
		if(this._useDamageSign > 0) {
			text = '使用後ダメージ';
		} else if(this._useDamageSign < 0) {
			text = '使用後回復量';
		}
		;
		ItemInfoRenderer.drawKeyword(x, y, text);

		x += (ItemInfoRenderer.getSpaceX() * 2);
		text = OT_getCustomItemUseDamageText(this._item);
		TextRenderer.drawKeywordText(x, y, text, 230, color, font);
	},

	_drawAbsorption: function(x, y) {
		var text;
		var damageType = OT_getCustomItemType(this._item);
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		
		var text = '';
		var percentText = Math.floor(this._absorptionRate * 100);
		
		if(this._isRecovery) {
			if( percentText > 0 ) {
				text = '与えた回復量の' + percentText + '%のダメージ';
			} else {
				text = '与えた回復量の' + percentText + '%、回復';
			}
		} else {
			if( percentText > 0 ) {
				text = '与えたダメージの' + percentText + '%、回復';
			} else {
				text = '与えたダメージの' + percentText + '%のダメージ';
			}
		}
		
		ItemInfoRenderer.drawKeyword(x, y, text);
	},
	
	_drawInfoTypeNormal: function(x, y) {
		var px=x, py=y;
		
		this._drawTitle(x, y);
		y += ItemInfoRenderer.getSpaceY();
		
		this._drawInfo(x, y);
		y += ItemInfoRenderer.getSpaceY();
		
		//this.drawRange(x, y, this._item.getRangeValue(), this._item.getRangeType());
		//y += ItemInfoRenderer.getSpaceY();

		//this.drawEffectRange(x, y);
		//y += ItemInfoRenderer.getSpaceY();

		this._drawReflection(x, y);
		y += ItemInfoRenderer.getSpaceY();

		if(    !this._isHitMark
			&&  this._isHitReflectionUnit 
			&&  this._isHitReflectionWeapon
			&& !this._isHitAvoid )
		{
			this._drawHitBefore(x, y);
			y += ItemInfoRenderer.getSpaceY();
			this._drawHitAfter(x, y);
			
		} else {
			this._drawHit(x, y);
		}
		y += ItemInfoRenderer.getSpaceY();

		if( this._useDamageSign != 0 ) {
			this._drawRecoil(x, y);
			y += ItemInfoRenderer.getSpaceY();
		}
		
		if( this._absorptionRate != 0.0) {
			this._drawAbsorption(x, y);
			y += ItemInfoRenderer.getSpaceY();
		}
	},
	
	_drawInfoTypeRange: function(x, y) {
		var i, j, picx, picy, index, value, point;
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();

		ItemInfoRenderer.drawKeyword(x, y, root.queryCommand('range_capacity'));

		var list = root.getBaseData().getGraphicsResourceList(GraphicsType.ICON, true);
		var picIcon = list.getCollectionDataFromId(0, 0);
		var picArea = root.queryUI('move_panel');

		if( this._rangeType == OT_EffectRangeType.ALL) {
			this._drawAllPanelInfo(x, y, picArea, picIcon, 3, 9);
			y += 20;
			TextRenderer.drawKeywordText(x, y, '(全体)', -1, color, font);
		} else {
			this._drawPanelInfo(x, y, this._indexRangeArray, picArea, picIcon, 3, 9);
			y += 20;
			
			var rangeType = this._item.getRangeType();
			var tmpEnd    = this._endRange;
			if (rangeType === SelectionRangeType.ALL) {
				tmpEnd = '∞';
			}
			
			var text = '(' + this._startRange + '～' + tmpEnd + ')';
			TextRenderer.drawKeywordText(x, y, text, -1, color, font);
		}
	},

	_drawInfoTypeEffectRange: function(x, y) {
		var i, picx, picy, point, index, value;
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();

		var list = root.getBaseData().getGraphicsResourceList(GraphicsType.ICON, true);
		var picIcon = list.getCollectionDataFromId(0, 0);
		var picArea = root.queryUI('range_panel');
		
		ItemInfoRenderer.drawKeyword(x, y, '範囲');
		
		if( this._effectRangeType == OT_EffectRangeType.ALL ) {
			if(this._isRecovery) {
				this._drawAllPanelInfo(x, y, picArea, picIcon, 4, 9);
			} else {
				this._drawAllPanelInfo(x, y, picArea, picIcon, 5, 5);
			}
			y += 20;
			TextRenderer.drawKeywordText(x, y, '(全体)', -1, color, font);
		} else {
			if(this._isRecovery) {
				this._drawPanelInfo(x, y, this._indexScopeArray, picArea, picIcon, 4, 9);
			} else {
				this._drawPanelInfo(x, y, this._indexScopeArray, picArea, picIcon, 5, 5);
			}
			y += 20;

			var text = '(' + this._startEffectRange + '～' + this._endEffectRange + ')';
			TextRenderer.drawKeywordText(x, y, text, -1, color, font);
			y += 20;
			
			switch(this._effectRangeType) {
				case OT_EffectRangeType.LINE:
				case OT_EffectRangeType.HORIZONTALLINE:
					text = '(右方向)';
					TextRenderer.drawKeywordText(x, y, text, -1, color, font);
					break;
			}
		}
	},

	_drawInfoTypeEffectRangeSlanting: function(x, y) {
		var i, picx, picy, point, index, value;
		var picArea = root.queryUI('range_panel');
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();

		var list = root.getBaseData().getGraphicsResourceList(GraphicsType.ICON, true);
		var picIcon = list.getCollectionDataFromId(0, 0);
		var text = '';

		ItemInfoRenderer.drawKeyword(x, y, '範囲');
		
		if( this._effectRangeType == OT_EffectRangeType.ALL ) {
			this._drawAllPanelInfo(x, y, picArea, picIcon, 5, 5);
			y += 20;
			ItemInfoRenderer.drawKeywordText(x, y, '(全体)', -1, color, font);
		} else {
			this._drawPanelInfo(x, y, this._indexScopeSlantingArray, picArea, picIcon, 5, 5);
			y += 20;
			text = '(' + this._startEffectRange + '～' + this._endEffectRange + ')';
			TextRenderer.drawKeywordText(x, y, text, -1, color, font);
			y += 20;
			text = '(右上方向)';
			TextRenderer.drawKeywordText(x, y, text, -1, color, font);
		}
	},
	
	_SetPanelSize: function(point) {
		if(point < 3) {
			this._panelSize = 24;
		} else if(point < 6) {
			this._panelSize = 14;
		} else if(point < 10) {
			this._panelSize = 8;
		} else if(point < 15) {
			this._panelSize = 6;
		} else {
			this._panelSize = 4;
		}
	},

	_drawInfoTypeAddDelState: function(x, y) {
		var text = '';
		var state = null;

		//if( OT_getCustomItemisGoodState(delState) ) this._isDelGoodState = true;
		//if( OT_getCustomItemisBadState(delState) ) this._isDelBadState = true;
		
		text = '状態変化';
		ItemInfoRenderer.drawKeyword(x, y, text);
		y += ItemInfoRenderer.getSpaceY();
		
		y = this._drawAddStateName(x, y, this._addState, 'バフ:', 'デバフ:');
		this._drawDelStateName(x, y, this._delState, this._delAllState, '解除:', '回復:');
	},
	
	_drawInfoTypeUseAddDelState: function(x, y) {
		var text = '';
		var state = null;

		//if( OT_getCustomItemisGoodState(delState) ) this._isDelGoodState = true;
		//if( OT_getCustomItemisBadState(delState) ) this._isDelBadState = true;
		
		text = '状態変化(使用者)';
		ItemInfoRenderer.drawKeyword(x, y, text);
		y += ItemInfoRenderer.getSpaceY();
		
		y = this._drawAddStateName(x, y, this._useAddState, 'バフ:', 'デバフ:');
		this._drawDelStateName(x, y, this._useDelState, this._useDelAllState, '解除:', '回復:');
	},
	
	_drawAddStateName: function(x, y, stateArrayTmp, buffText, debuffText) {
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var text = '';
		var state = null;
		var hit   = 0;
		
		if( stateArrayTmp.length ) {
			// グッドステートの追加
			for( var i=0 ; i<stateArrayTmp.length ; i++ ) {
				state = stateArrayTmp[i][0];
				hit   = stateArrayTmp[i][1];
				
				if( !state.isBadState() ) {
					// バフ
					text = buffText;
					TextRenderer.drawKeywordText(x, y, text, 200, color, font);
					text = state.getName() + '(' + hit + '%)';
					TextRenderer.drawKeywordText(x + ItemInfoRenderer.getSpaceX(), y, text, 200, color, font);
					y += ItemInfoRenderer.getSpaceY();
				}
			}

			for( var i=0 ; i<stateArrayTmp.length ; i++ ) {
				state = stateArrayTmp[i][0];
				hit   = stateArrayTmp[i][1];
				
				if( state.isBadState() ) {
					// 状態異常
					text = debuffText;
					TextRenderer.drawKeywordText(x, y, text, 200, color, font);
					text = state.getName() + '(' + hit + '%)';
					TextRenderer.drawKeywordText(x + ItemInfoRenderer.getSpaceX(), y, text, 200, color, font);
					y += ItemInfoRenderer.getSpaceY();
				}
			}
		}
		return y;
	},

	_drawDelStateName: function(x, y, stateArrayTmp, allStateType, buffText, debuffText) {
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var text = '';
		var state = null;
		var hit   = 0;
		

		//if( k == 'BadState' || k == 'GoodState' || k == 'AllState') {
		
		if( stateArrayTmp.length ) {
			// グッドステート
			if(typeof allStateType['GoodState'] != 'undefined') {
				hit   = allStateType['GoodState'];
				text = buffText;
				TextRenderer.drawKeywordText(x, y, text, 200, color, font);
				text = '全バフ(' + hit + '%)';
				TextRenderer.drawKeywordText(x + ItemInfoRenderer.getSpaceX(), y, text, 200, color, font);
				y += ItemInfoRenderer.getSpaceY();
			} else {
				for( var i=0 ; i<stateArrayTmp.length ; i++ ) {
					state = stateArrayTmp[i][0];
					hit   = stateArrayTmp[i][1];
					
					if( !state.isBadState() ) {
						// バフ
						text = buffText;
						TextRenderer.drawKeywordText(x, y, text, 200, color, font);
						text = state.getName() + '(' + hit + '%)';
						TextRenderer.drawKeywordText(x + ItemInfoRenderer.getSpaceX(), y, text, 200, color, font);
						y += ItemInfoRenderer.getSpaceY();
					}
				}
			}

			// バッドステート
			if(typeof allStateType['BadState'] != 'undefined') {
				hit   = allStateType['BadState'];
				text = debuffText;
				TextRenderer.drawKeywordText(x, y, text, 200, color, font);
				text = '全状態異常(' + hit + '%)';
				TextRenderer.drawKeywordText(x + ItemInfoRenderer.getSpaceX(), y, text, 200, color, font);
				y += ItemInfoRenderer.getSpaceY();
				
			} else {
				for( var i=0 ; i<stateArrayTmp.length ; i++ ) {
					state = stateArrayTmp[i][0];
					hit   = stateArrayTmp[i][1];
					
					if( state.isBadState() ) {
						// 状態異常
						text = debuffText;
						TextRenderer.drawKeywordText(x, y, text, 200, color, font);
						text = state.getName() + '(' + hit + '%)';
						TextRenderer.drawKeywordText(x + ItemInfoRenderer.getSpaceX(), y, text, 200, color, font);
						y += ItemInfoRenderer.getSpaceY();
					}
				}
			}
		}
		return y;
	},
	
	_drawPanelInfo: function(x, y, rangeArray, picArea, picIcon, ix, iy) {
		var i, j, picx, picy, index, value;
		
		var list = root.getBaseData().getGraphicsResourceList(GraphicsType.ICON, true);
		var picAreaIcon = list.getCollectionDataFromId(0, 0);
		var point = 0;
		for (i = 0; i < rangeArray.length; i++) {
			index = rangeArray[i];
			picx = this._drawPanelGetX(index) - this._indexWidthSize/2;
			picy = this._drawPanelGetY(index);
			
			point = Math.max(point, Math.abs(picx), Math.abs(picy));
		}
		this._SetPanelSize(point);
		
		x += ItemRenderer.getItemWindowWidth() / 2 - this._panelSize/2;
		y += (this.getInfoPartsCount() * ItemInfoRenderer.getSpaceY()) / 2- this._panelSize/2;
		
		for (i = 0; i < rangeArray.length; i++) {
			index = rangeArray[i];
			value = this._drawPanelGetX(index);
			picx = ((value - this._indexWidthSize/2) * this._panelSize) + x;

			value = this._drawPanelGetY(index);
			picy = (value * this._panelSize) + y;

			this._drawIconData(picx, picy, picAreaIcon, 5, 8);
			this._drawPanelData(picx, picy, picArea);
		}
		
		this._drawIconData(x, y, picIcon, ix, iy);
	},

	_drawAllPanelInfo: function(x, y, picArea, picIcon, ix, iy) {
		var i, j, picx, picy, index, value;
		
		var list = root.getBaseData().getGraphicsResourceList(GraphicsType.ICON, true);
		var picAreaIcon = list.getCollectionDataFromId(0, 0);
		this._SetPanelSize(5);
		
		x += ItemRenderer.getItemWindowWidth() / 2 - this._panelSize/2;
		y += (this.getInfoPartsCount() * ItemInfoRenderer.getSpaceY()) / 2- this._panelSize/2;
		
		//for (i = 0; i < rangeArray.length; i++) {
		//	index = rangeArray[i];
		//	value = this._drawPanelGetX(index);
		//	picx = ((value - this._indexWidthSize/2) * this._panelSize) + x;

		//	value = this._drawPanelGetY(index);
		//	picy = (value * this._panelSize) + y;

		//	this._drawIconData(picx, picy, picAreaIcon, 5, 8);
		//	this._drawPanelData(picx, picy, picArea);
		//}
		
		var size = 64;
		var pSize = Math.floor(this._panelSize / 2);
		var picx = x - size + pSize;
		var picy = y - size + pSize;
		this._drawAllIconData(picx, picy, (size*2), picAreaIcon, 5, 8);
		this._drawAllPanelData(picx, picy, (size*2), picArea);
		
		this._drawIconData(x, y, picIcon, ix, iy);
	},
	
	_drawPanelData: function(x, y, pic) {
		var xDest = x;
		var yDest = y;
		var xSrc = 0;
		var ySrc = 0;
		var graphicsSize = GraphicsRenderer.getGraphicsSize(GraphicsType.MAPCHIP, pic);
		var width = graphicsSize.width;
		var height = graphicsSize.height;
		
		if (pic === null) {
			return;
		}
		
		pic.drawStretchParts(xDest, yDest, this._panelSize, this._panelSize, xSrc, ySrc, width, height);
	},

	_drawIconData: function(x, y, pic, cx, cy) {
		var xDest = x;
		var yDest = y;
		var xSrc = cx * GraphicsFormat.ICON_WIDTH;
		var ySrc = cy * GraphicsFormat.ICON_HEIGHT;
		var graphicsSize = GraphicsRenderer.getGraphicsSize(GraphicsType.ICON, pic);
		var width = graphicsSize.width;
		var height = graphicsSize.height;
		
		if (pic === null) {
			return;
		}
		
		pic.drawStretchParts(xDest, yDest, this._panelSize, this._panelSize, xSrc, ySrc, width, height);
	},

	_drawAllPanelData: function(x, y, size, pic) {
		var xDest = x;
		var yDest = y;
		var xSrc = 0;
		var ySrc = 0;
		var graphicsSize = GraphicsRenderer.getGraphicsSize(GraphicsType.MAPCHIP, pic);
		var width = graphicsSize.width;
		var height = graphicsSize.height;
		
		if (pic === null) {
			return;
		}
		
		pic.drawStretchParts(xDest, yDest, size, size, xSrc, ySrc, width, height);
	},

	_drawAllIconData: function(x, y, size, pic, cx, cy) {
		var xDest = x;
		var yDest = y;
		var xSrc = cx * GraphicsFormat.ICON_WIDTH;
		var ySrc = cy * GraphicsFormat.ICON_HEIGHT;
		var graphicsSize = GraphicsRenderer.getGraphicsSize(GraphicsType.ICON, pic);
		var width = graphicsSize.width;
		var height = graphicsSize.height;
		
		if (pic === null) {
			return;
		}
		
		pic.drawStretchParts(xDest, yDest, size, size, xSrc, ySrc, width, height);
	},

	_GetNormalizeRangeIndexData: function() {
		var arrayTmp = OT_EffectRangeIndexArray.getRangeItemIndexArrayInfo(0, 0, this._item, true);
		return this._GetNormalizeIndexData(arrayTmp);
	},
	
	_GetNormalizeScopeIndexData: function() {
		var arrayTmp = OT_EffectRangeIndexArray.getEffectRangeItemIndexArrayPosInfo(0, 0, this._item, -1, 0, true);
		return this._GetNormalizeIndexData(arrayTmp);
	},

	_GetNormalizeScopeSlantingIndexData: function() {
		var arrayTmp = OT_EffectRangeIndexArray.getEffectRangeItemIndexArrayPosInfo(0, 0, this._item, -1, 1, true);
		return this._GetNormalizeIndexData(arrayTmp);
	},

	_GetNormalizeIndexData: function(arrayTmp) {
		var array = [];
		var arrayT = [];
		var index = 0;
		var tmpX, tmpY;
		//root.log('start:');
		for( var i=0 ; i<arrayTmp.length ; i++ ) {
			tmpX = arrayTmp[i][0];
			tmpY = arrayTmp[i][1];
			index = (Math.abs(tmpY) * this._indexWidthSize) + tmpX;
			if(tmpY < 0) {
				index *= -1;
			}
			index += this._indexWidthSize/2;
			array.push(index);
		}
		
		return unique(array);
	},
	
	_drawPanelGetX: function(index) {
		var value = Math.floor(Math.abs(index) % this._indexWidthSize);
		return value;
	},

	_drawPanelGetY: function(index) {
		var value = Math.floor(index / this._indexWidthSize);
		
		return value;
	}
}
);

var OT_ItemEffectRangeAvailability = defineObject(BaseItemAvailability,
{
	isUnitTypeAllowed: function(unit, targetUnit) {
		return FilterControl.isReverseUnitTypeAllowed(unit, targetUnit);
	},

	// メニューで『使う』が何時でも選択できるように
	isItemAvailableCondition: function(unit, item) {
		return true;
	}
}
);

// 範囲攻撃用の敵AI
ActionTargetType.OT_EFFECT_RANGE = 100;
var OT_ItemEffectRangeAI = defineObject(BaseItemAI,
{
	getItemScore: function(unit, combination) {
		if( combination.OT_EffectFlag != true )
		{
			return 15;
		}
		
		var item = combination.item;
		var score = combination.addScore * OT_getAIScoreRate(item);
		return score;
	},

	_getTotalScore: function(unit, combination) {
		var n;
		var score = 0;
		var item = combination.item;
		var targetUnit = null;
		
		for(var i=0 ; i<combination.hitUnit.length ; i++) {
			targetUnit = combination.hitUnit[i];
			//root.msg('test1:' + targetUnit.getId());
			n = this._getDamageScore(unit, targetUnit, item);
			if (n === 0 && !DataConfig.isAIDamageZeroAllowed()) {
				continue;
			}
			score += n;
			
			//root.msg('test2');
			n = this._getHitScore(unit, targetUnit, item);
			if (n === 0 && !DataConfig.isAIHitZeroAllowed()) {
				continue;
			}
			score += n;
			
			//score += this._getCriticalScore(unit, combination);
			//root.msg('test3');
			score += this._getStateScore(unit, targetUnit, item);
		}
		
		if( score == 0 ) {
			score = -1;
		}
		
		// 与えれるダメージが7、命中率が80、クリティカル確率が10の場合、
		// 42 (7 * 6) 6はMiscellaneous.convertAIValue
		// 16 (80 / 5)
		// 2 (10 / 5)
		// 合計60のscoreになる
		
		return score;
	},
		
	getUnitFilter: function(unit, item) {
		var unitType = unit.getUnitType();
		
		if( OT_getCustomItemRecovery(item) ) {
			return FilterControl.getNormalFilter(unitType);
		}
		
		return FilterControl.getReverseFilter(unitType);
	},

	_getDamageScore: function(unit, targetUnit, item) {
		var damage = OT_getCustomItemFinalDamage(unit, item);
		var damageType = OT_getCustomItemType(item);

		if(OT_getCustomItemRecovery(item)) {
			return Calculator.calculateRecoveryValue(targetUnit, damage, RecoveryType.SPECIFY, 0);
		}
		
		return OT_getCalculateDamageValue(item, targetUnit, damage, damageType, 0);
	},

	_getValue: function(unit, item, targetUnit) {
		var damage = OT_getCustomItemFinalDamage(unit, item);
		var damageType = OT_getCustomItemType(item);

		if(OT_getCustomItemRecovery(item)) {
			return Calculator.calculateRecoveryValue(targetUnit, damage, RecoveryType.SPECIFY, 0);
		}
		
		return OT_getCalculateDamageValue(item, targetUnit, damage, damageType, 0);
	},

	_getHitScore: function(unit, targetUnit, item) {
		var hit = OT_getCustomItemHitPercent(unit, targetUnit, item);
		
		//root.log(hit);
		// 命中率を優先する場合は数値を下げる
		return Math.floor(hit / 5);
	},
	
	_getStateScore: function(unit, targetUnit, item) {
		var point;
		var score = 0;

		// 解除されるステート
		var delState = OT_getCustomItemDelState(item);

		// 追加されるステート
		var addState = OT_getCustomItemAddState(item);

		// ステートの追加
		for( var i=0 ; i<addState.length ; i++ )
		{
			var state = addState[i][0];
			// 敵対者にグッドステートを付与させるような事があった場合
			if( !state.isBadState() )
			{
				//root.log('■1');
				continue;
			}

			point = StateScoreChecker.getScore(unit, targetUnit, state);
			
			if( point > -1 )
			{
				//root.log('■2');
				score += point;
			}
		}

		// ステートの解除
		for( var i=0 ; i<delState.length ; i++ )
		{
			var state = delState[i][0];

			// 敵対者のバッドステートを解除させるような事があった場合
			if( state.isBadState() )
			{
				//root.log('■3');
				continue;
			}
			
			if(StateControl.getTurnState( targetUnit, state ) !== null )
			{
				//root.log('■4');
				score += 20 + targetUnit.getLv();
			}
		}
		
		return score;
	},

	_getStateScoreModeRecovery: function(unit, targetUnit, item) {
		var point;
		var score = 0;

		// 解除されるステート
		var delState = OT_getCustomItemDelState(item);

		// 追加されるステート
		var addState = OT_getCustomItemAddState(item);

		// ステートの追加
		for( var i=0 ; i<addState.length ; i++ )
		{
			var state = addState[i][0];
			
			// 味方にバッドステートを付与させるような事があった場合
			if( state.isBadState() )
			{
				//root.log('■');
			}

			// 相手が既にそのステートを与えられている場合は、アイテムを使用しない
			if (StateControl.getTurnState(targetUnit, state) !== null) {
				continue;
			}
			
			point = StateScoreChecker.getScore(unit, targetUnit, state);

			if( point > -1 )
			{
				//root.log('■1');
				score += point;
			}
		}

		// ステートの解除
		for( var i=0 ; i<delState.length ; i++ )
		{
			var state = delState[i][0];

			// 味方のグッドステートを解除させるような事があった場合
			if( !state.isBadState() )
			{
				//root.log('■2');
				continue;
			}
			
			if(StateControl.getTurnState( targetUnit, state ) !== null )
			{
				//root.log('■3');
				score += 20 + targetUnit.getLv();
			}
		}
		
		return score;
	},
		
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
		
	getActionTargetType: function(unit, item) {
		return ActionTargetType.OT_EFFECT_RANGE;
	}
}
);

function OT_ItemEffectRange_getCustomKeyword() {
	return 'OT_ItemEffectRange';
};


//----------------------------------------------------------
// 敵専用射程判定
//----------------------------------------------------------
var alias101 = CombinationCollector.Item._setCombination;
CombinationCollector.Item._setCombination = function(misc) {
	alias101.call(this, misc);

	var actionTargetType = misc.actionTargetType;
	
	if (actionTargetType === ActionTargetType.OT_EFFECT_RANGE) {
		CombinationCollector.Item.OT_setEffectRangeCombination(misc);
	}
};

CombinationCollector.Item.OT_setEffectRangeCombination = function(misc) {
	var i, j, k, l, x, y, index, indexArray, list, obj, targetUnit, targetCount, combination;
	var direction;
	var unit = misc.unit;
	var item = misc.item;
	obj = ItemPackageControl.getItemAIObject(item);
	if (obj === null) {
		return;
	}
	
	// どの位置でどこに放つのかが一番重要であるため
	// 近場の再検索は行わないようにする
	if(misc.isForce == true) {
		return;
	}

	// 移動のみを行う場合、一番近くの相手を検索する
	if( misc.isEffectRangeMove ) {
		//敵が移動するときのみは一番近い敵を検索する
		//root.log('検索範囲がマップ全域2');
		//misc.actionTargetType = ActionTargetType.UNIT;
		this._setUnitCombination(misc);
		return;
	}
	var nearTargetCount, distantTargetCount, outRangeTargetCount;
	var isIndifference = OT_getCustomItemIndifference(item); // 無差別系か
	var nearMovePoint, distantMovePoint;

	var startRange = OT_getCustomItemRangeMin(item);
	var endRange = OT_getCustomItemRangeMax(item);
	var startEffectRange = OT_getCustomItemEffectRangeMin(item);
	var endEffectRange = OT_getCustomItemEffectRangeMax(item);
	var rangeType = OT_getCustomItemRangeType(item);
	var effectRangeType = OT_getCustomItemEffectRangeType(item);
	var moveCount = ParamBonus.getMov(unit);  // 移動力

	var avoidScoreArray = [];
	
	var numEndRange = endRange + endEffectRange;
	var count = 0;

	var simulator = root.getCurrentSession().createMapSimulator();
	simulator.startSimulation(unit, moveCount);
	
	// 敵が移動可能な場所とそこに行くまでの必要な移動力、距離を配列に格納
	// また、消費移動力の最大値と一番移動できるマス数を記録する
	var myX = unit.getMapX();
	var myY = unit.getMapY();

	var unitMapPosArray = []; 
	var unitMapMovePointArray = [];
	var unitPointDistanceArray = [];
	var maxMove = 0;
	var maxDistance = 0;
	var tmpMovePoint = 0;
	var point = 0;
	
	// simulator.getSimulationIndexArrayでは敵対陣営のユニットや障害物での移動不可は検知できるが
	// 自陣営のユニットが居る事での移動不可は検知できない
	// this._createCostArrayで実際に移動不可能な場所を検索して配列に格納
	misc.targetUnit = null;
	misc.indexArray = misc.simulator.getSimulationIndexArray();
	misc.costArray = this._createCostArray(misc);

	//root.log('移動可能位置確認:' + misc.costArray.length);
	for(i=0 ; i<misc.costArray.length ; i++) {
		index = misc.costArray[i].posIndex;
		x = CurrentMap.getX(index);
		y = CurrentMap.getY(index);
		
		unitMapPosArray.push(index);
		
		tmpMovePoint = misc.costArray[i].movePoint;
		unitMapMovePointArray[index] = tmpMovePoint;  // 移動可能な場所までに必要な移動力

		point = Math.abs(myX - x) + Math.abs(myY - y);  
		unitPointDistanceArray[index] = point;  // 移動可能な場所までのマス数
		
		maxMove = Math.max(maxMove, tmpMovePoint);   // 使用可能移動力の最大値
		maxDistance = Math.max(maxDistance, point);  // 最大移動可能マス数

		//root.log('index:' + index + ' tmpMovePoint:' + tmpMovePoint + ' tmpPoint:' + point);
	}

	//checkTime('check time0: ');
	
	var predictedRangeArray = [];	// 予測射程範囲
	var entryUnitArray = [];		// 予測射程範囲に届く可能性が高いユニット情報
	var unitScoreArray = [];		// ユニットごとのスコア情報
	var unitIndexScoreArray = [];	// ユニットの位置をキーとしてスコアを格納
	var score = 0;
	//var score = this._checkTargetScore(unit, targetUnit);

	// 対象になりえるユニットの
	var filter = OT_EffectRangeGetFilter(unit, item);
	var listArrayOT = this._getTargetListArrayERD(filter, misc);
	var listCountOT = listArrayOT.length;
	
	nearTargetCount = 0;
	distantTargetCount = 0;
	outRangeTargetCount = 0;

	//// 敵対側のユニットの大多数が近くにいるのか遠くにいるのかを確認
	var distantTargetRange = Math.floor((numEndRange) / 2);

	nearMovePoint = 999;    // 一番近い相手に必要な移動量
	distantMovePoint = 0; // 一番遠い相手に必要な移動量

	//root.log('行動チェック中:' + unit.getName());
	if(effectRangeType != OT_EffectRangeType.ALL) {
		
		// まず使用者の位置から大体の予測範囲を計算
		// 予測範囲内にいるユニットは遠くの方にいるのは本当に射程内なのか不明だが
		// 使用者の中心に近づくほど高確率で射程圏内にいる可能性が大きくなるのに対して
		// 予測範囲にすら引っかからないユニットは確実に射程圏外にいるため
		// そのユニットに対しての判定は行うだけ無駄（負荷）になるので
		// 対象になる可能性があるユニットだけを判定するように処理を行う
		predictedRangeArray = OT_GetPredictedRangeArray(myX, myY, maxDistance, item);
		for (i = 0; i < listCountOT; i++) {
			list = listArrayOT[i];
			targetCount = list.getCount();
			for (j = 0; j < targetCount; j++) {
				targetUnit = list.getData(j);
				x = targetUnit.getMapX();
				y = targetUnit.getMapY();
				index = CurrentMap.getIndex(x, y);
				
				if(predictedRangeArray.indexOf(index) == -1) {
					continue;
				}
				
				//point = Math.abs(myX - x) + Math.abs(myY - y);
				//if(point <= ParamBonus.getMov(unit)) {
				//	// 最大射程と最大範囲の合計値の半分以下なら近くの敵としてカウント
				//	nearTargetCount++;
				//} else if( point > ParamBonus.getMov(unit) && point <= (numEndRange)) {
				//	// 最大射程と最大範囲の合計値の半分より上ならば遠くの敵としてカウント
				//	distantTargetCount++;
				//} else {
				//	// 最大射程と最大範囲の合計値より上ならば対象外としてカウント
				//	outRangeTargetCount++;
				//}
				//nearMovePoint = Math.min(nearMovePoint, point);
				//distantMovePoint = Math.max(distantMovePoint, point);
		
				score = OT_EffectRangeAIScoreCalculation._getTotalScore(unit, targetUnit, item);
				unitScoreArray[targetUnit.getId()] = score;
				
				if(unit == targetUnit) {
					//root.log('使用者');
					continue;
				}
				
				unitIndexScoreArray[index] = score;
				entryUnitArray.push(targetUnit);
			}
		}

		
		//checkTime('check time1: ');
		//return;
		//root.log('nearMovePoint:' + nearMovePoint + ' distantMovePoint:' + distantMovePoint);

		
		var chkResultArray = [];
		var targetIndex;
		// targetUnit(自分ではなく相手)の現在位置をベースに、
		// 移動後にアイテムの射程と効果範囲が届く可能性がある位置を検索する
		
		
		for (i = 0; i < entryUnitArray.length ; i++) {
			targetUnit = entryUnitArray[i];

			if(unit == targetUnit) continue;
			
			//root.log('test:' + targetUnit.getName());

			x = targetUnit.getMapX();
			y = targetUnit.getMapY();
			targetIndex = CurrentMap.getIndex(x, y);
			point = Math.abs(myX - x) + Math.abs(myY - y);  // 敵と検索相手の距離
			var moveAfterNearPoint = point - maxDistance;
			var moveAfterDistantPoint = point + maxDistance;
			
			//var tmpEndRange = endRange;
			var tmpEndRange = endRange + endEffectRange;
			var tmpStartRange = startRange;

			//if(moveAfterNearPoint > tmpStartRange) {
			//	tmpStartRange = moveAfterNearPoint;
			//}

			//if(moveAfterDistantPoint < tmpEndRange) {
			//	tmpEndRange = moveAfterDistantPoint;
			//}

			if(tmpStartRange > tmpEndRange) {
				continue;
			} else if( tmpStartRange <= 0 ) {
				tmpStartRange = 1;
			}
			
			var indexSearchNormal = false;
			var indexSearchBox = false;
			
			switch( rangeType ) {
				case OT_EffectRangeType.XCROSS:
					indexSearchBox = true;
					break;
					
				case OT_EffectRangeType.DOUBLECROSS:
					indexSearchNormal = true;
					indexSearchBox = true;
					break;

				default:
					indexSearchNormal = true;
					break;
			}
			
			switch( effectRangeType ) {
				case OT_EffectRangeType.XCROSS:
				case OT_EffectRangeType.DOUBLECROSS:
				case OT_EffectRangeType.LINE:
				case OT_EffectRangeType.BOX:
				case OT_EffectRangeType.BREATH:
				case OT_EffectRangeType.HORIZONTALLINE:
					indexSearchBox = true;
					break;
			}
			if(indexSearchNormal && indexSearchBox) {
				indexArray = OT_getBoxIndexArray(targetUnit.getMapX(), targetUnit.getMapY(), tmpStartRange, tmpEndRange);
				Array.prototype.push.apply( indexArray, IndexArray.getBestIndexArray(targetUnit.getMapX(), targetUnit.getMapY(), tmpStartRange, tmpEndRange) );
				unique(indexArray);
			} else if(indexSearchBox) {
				indexArray = OT_getBoxIndexArray(targetUnit.getMapX(), targetUnit.getMapY(), tmpStartRange, tmpEndRange);
			} else {
				indexArray = IndexArray.getBestIndexArray(targetUnit.getMapX(), targetUnit.getMapY(), tmpStartRange, tmpEndRange);
			}
			
			// 
			//checkTime('check time1-1: ');
			var posArray = ArrayOverlap(unitMapPosArray, indexArray);

			
			// 敵の周辺で範囲攻撃が届く可能性のある位置に移動できる事を確認し、
			// 移動できる位置なら位置情報を保持しておく
			score = 0;
			if( unitScoreArray[targetUnit.getId()] != null ) {
				score = unitScoreArray[targetUnit.getId()];
			} else {
				//root.log('error:' + targetUnit.getId() + '/' + targetUnit.getName());
			}

			//checkTime('check time1-Start: ');
			for (k = 0; k < posArray.length; k++) {
				index = posArray[k];
				x = CurrentMap.getX(index);
				y = CurrentMap.getY(index);

				direction = 0;

				// 向きに応じて効果範囲が変わる場合、向き情報も記録する必要がある
				switch( effectRangeType ) {
					case OT_EffectRangeType.HORIZONTALLINE:
					case OT_EffectRangeType.LINE:
					case OT_EffectRangeType.BREATH:
						direction = OT_getUnitDirection(x, y, targetUnit.getMapX(), targetUnit.getMapY());
						direction = OT_getUnitDirectionIndex(direction);
						break;
				}

				// 0:アイテム使用時のユニットの位置インデックス
				// 1:使用時の向き(ブレス系など向きに応じて効果範囲が変わるタイプ用のデータ、
				//   0:左 1:上 2:右 3:下 4:左上 5:右上 6:右下 7:左下 変わらないタイプは0を格納)
				// 2:対象ユニットの位置インデックス配列
				// 3:対象ユニット数(暫定最大巻き込み数)
				// 4:対象ユニットを全員巻き込めた場合の暫定最大スコア
				// 5:地形効果などの追加スコア
				var emptyChk = true;
				for (l = 0; l < chkResultArray.length; l++) {
					if(chkResultArray[l][0] == index && chkResultArray[l][1] == direction) {
						chkResultArray[l][2].push(targetIndex);
						chkResultArray[l][3] += 1;
						chkResultArray[l][4] += score;
						emptyChk = false;
						break;
					}
				}
				
				if(emptyChk) {
					var insertArray = [index, direction, [targetIndex],  1, score, 0];
					chkResultArray.push(insertArray);
				}
			}
		}		
		
		//checkTime('check time2: ');

		if(chkResultArray.length > 0) {
			//root.log('numArray:'+chkResultArray.length);
			
			//for (i = 0; i < entryUnitArray.length; i++) {
			//	// スコアを記録
			//	//checkTime('check time2-1: ');
			//	var targetUnit = entryUnitArray[i];
			//	score = OT_EffectRangeAIScoreCalculation._getTotalScore(unit, targetUnit, item);
			//	unitScoreArray[targetUnit.getId()] = score;
			//	//checkTime('check time2-2: ');
			//}
			//checkTime('check time3: ');
			
			var myScore = 0;
			var tmpScore;
			var tmpX = 0;
			var tmpY = 0;

			// 自身が対象になる可能性がある場合
			// 暫定最大スコアに自身が対象になった時のスコアを入れる
			if(OT_EffectRangeCheckFilter(unit, filter)) {
				myScore = unitScoreArray[unit.getId()];
			}
			
			for (i = 0; i < chkResultArray.length; i++) {
				index    = chkResultArray[i][0];
				x = CurrentMap.getX(index);
				y = CurrentMap.getY(index);
				
				tmpX = unit.getMapX();
				tmpY = unit.getMapY();
				
				unit.setMapX(x);
				unit.setMapY(y);
				// 発動時のユニット位置の回避値を取得
				tmpScore = AbilityCalculator.getAvoid(unit);
				unit.setMapX(tmpX);
				unit.setMapY(tmpY);
				
				chkResultArray[i][4] += myScore;
				chkResultArray[i][5] = tmpScore;
			}

			//checkTime('check time4: ');

			// スコア順で確認するため降順ソート
			chkResultArray.sort(function(a,b){ 
				if(b[4] > a[4]) return 1;
				if(b[4] < a[4]) return -1;
				if(b[5] > a[5]) return 1;
				if(b[5] < a[5]) return -1;
				return 0;
			});
			
			count = 0;
			var tmpChkArray;
			var tmpResult;
			var tmpArray;
			var tmpIndex;
			var tmpCount;
			var maxScore = -9999;
			var maxAddScore = 0;
			var isInvolved = false;
			var isReCheck  = false;

			var isFirstCheck  = true;
			for (i = 0; i < chkResultArray.length; i++) {
				var tmpAddScore = chkResultArray[i][5];
				
				//root.log('移動位置:' + chkResultArray[i][0] + ' 向き:' + chkResultArray[i][1] + ' sc:' + chkResultArray[i][4] + ' addsc:' + tmpAddScore);
				//root.log('対象ユニット位置:');
				//root.log(chkResultArray[i][2]);
				
				// 範囲と射程が大き目かつ、1射程が斜めマスのタイプだと
				// 周りに自軍が密集している時は予測スコアがマイナス点になる可能性が高い
				// そのため1度だけは判定をやってみる
				if(isFirstCheck == false) {
					// 効果が無い時は0、
					// 巻き込み系で自分たちの被害が大きくなりそうな場合は0以下になる
					// この時はチェックしない
					if(chkResultArray[i][4] <= myScore) {
						//root.log('効果無し');
						continue;
					}
	
					// 暫定最大スコアが実際の最大スコアより低い場合か
					// 暫定最大スコアが実際の最大スコアが同値の時に
					// 追加得点が記録されている追加得点の最大値を超えていない場合は処理しない
					if(chkResultArray[i][4] < maxScore || (chkResultArray[i][4] == maxScore && tmpAddScore <= maxAddScore) ) {
						//root.log('スコア論外');
						continue;
					}
				}
				isFirstCheck = false;

				index = chkResultArray[i][0];	// 使用者の移動位置
				x = CurrentMap.getX(index);
				y = CurrentMap.getY(index);
				
				tmpChkArray = {};
				tmpResult = [];
				tmpReverseDirection = OT_getUnitDirectionIndexReverse(chkResultArray[i][1]);
				var singleFlag = 0;
				for (j = 0 ; j < chkResultArray[i][2].length ; j++) {
					targetIndex = chkResultArray[i][2][j];	// 対象ユニット位置
					tmpX = CurrentMap.getX(targetIndex);
					tmpY = CurrentMap.getY(targetIndex);
					
					//var tmpArray = OT_EffectRangeIndexArray.getRangeItemIndexArray(tmpX, tmpY, item);
					tmpArray = OT_EffectRangeIndexArray.getAIEffectRangeItemIndexArray(tmpX, tmpY, item, tmpReverseDirection);
					
					for (k = 0 ; k < tmpArray.length ; k++) {
						tmpIndex = tmpArray[k];
						if(tmpChkArray[tmpIndex] == null) {
							tmpChkArray[tmpIndex] = [];		// キーにアイテムの発動位置のインデックス情報
							tmpChkArray[tmpIndex][0] = 0;	// 実際に巻き込めるユニット数
							tmpChkArray[tmpIndex][1] = 0;	// スコア合計
						}
						tmpChkArray[tmpIndex][0] += 1;
						tmpChkArray[tmpIndex][1] += unitIndexScoreArray[targetIndex];
					}
				}
				
				// キー：インデックス、値：カウント
				tmpArray = [];
				var tmpMaxScore = 0;
				for(var key in tmpChkArray) {
					tmpIndex = parseInt(key); // 連想配列のキーは文字列扱いになってるため数値に直す
					tmpCount = tmpChkArray[key][0]; // 実際に巻き込めるユニット数
					tmpScore = tmpChkArray[key][1]; // スコア合計
					
					tmpMaxScore = Math.max(tmpMaxScore, tmpScore);
					if(tmpScore < maxScore || (tmpScore == maxScore && tmpAddScore <= maxAddScore)) {
						continue;
					}
					
					if(tmpArray.indexOf(tmpChkArray[key][0]) == -1) {
						tmpArray.push([tmpCount, tmpScore, tmpIndex]);
					}
				}
				
				if(tmpArray.length == 0) {
					//root.log('最大スコア越え無し:' + tmpMaxScore);
					continue;
				}
				
				tmpArray.sort(function (a,b){
					return b[1] - a[1];
				});
				
				var tmpSearchArray = [];
				
				// 移動位置を中心に射程計測
				tmpSearchArray = OT_EffectRangeIndexArray.getRangeItemIndexArray(x, y, item, false);
				for (j = 0 ; j < tmpArray.length ; j++) {
					tmpCount = tmpArray[j][0];
					tmpScore = tmpArray[j][1]; // スコア合計
					targetIndex = tmpArray[j][2]; // アイテム使用位置インデックス
					//root.log('count/score/target:');
					//root.log(tmpArray[j]);

					//DebugPrint('移動位置index:' + index + ' 使用場所:' + targetIndex + ' sc:' + tmpScore + '/' + maxScore );
					// スコアが大きくなりそうにない場合は中断
					if(tmpScore < maxScore || (tmpScore == maxScore && tmpAddScore <= maxAddScore)) {
						continue;
					}
					
					// 移動位置からの射程が目標に届く場合は処理を行う
					tmpResult = ArrayOverlap([targetIndex], tmpSearchArray);
					if(tmpResult.indexOf(targetIndex) != -1) {
						tmpX = CurrentMap.getX(targetIndex);
						tmpY = CurrentMap.getY(targetIndex);
						
						// 自身も対象だった場合
						isInvolved = false;
						if(OT_EffectRangeCheckFilter(unit, filter)) {
							//root.log('自分も対象になる可能性あり:' + index + ':' + targetIndex);
							var indifferenceArray = OT_EffectRangeIndexArray.getEffectRangeItemIndexArrayPosInfo(tmpX, tmpY, item, x, y);
							var chk = ArrayOverlap([index], indifferenceArray);
							if(chk.length > 0) {
								tmpScore += myScore;
								//root.log('自分も巻き込まれたためスコア再計算:' + tmpScore + '/' + maxScore );
								
								// 巻き込まれない位置を再確認
								if(myScore < 0) {
									isInvolved = true;
									//isReCheck  = true;
								}

								// スコアが大きくなりそうにない場合は中断
								if(tmpScore <= 0 || tmpScore < maxScore || (tmpScore == maxScore && tmpAddScore <= maxAddScore)) {
									continue;
								}
							}
						}
						
						// 移動用の情報を作成
						misc.targetUnit = null;
						misc.indexArray = [index]; // 移動する場所
						misc.rangeMetrics = StructureBuilder.buildRangeMetrics();
						misc.costArray = this._createCostArray(misc);
						
						// ユニットが発動位置で発動できる場所に移動できる事を念のため確認
						// これを確認せず行動パターンに含めると範囲外から撃ててしまう可能性がある
						if (misc.costArray.length !== 0) {
							combination = this._createAndPushCombination(misc);
							combination.targetPos = createPos(tmpX, tmpY); // アイテム使用位置
							combination.single = false;
							combination.OT_EffectFlag = true;
							combination.addScore = tmpScore + tmpAddScore; // 追加スコア
							
							maxScore = tmpScore;
							maxAddScore = tmpAddScore;
							
							//DebugPrint('最大スコア:' + maxScore +'/' + maxAddScore);
							
							// 巻き込まれちゃってる場合は再度検索を行う
							if(!isInvolved) {
								break;
							}
						}
					}
				}
			}
		}
		//checkTime('check time5: ');

		
	} else {
		// 効果範囲が全体の場合は何処で撃っても全体にかかるため
		// 無駄な検索を行わないようにする
		
		var tmpScore = 0;
		for (i = 0; i < listCountOT; i++) {
			list = listArrayOT[i];
			targetCount = list.getCount();
			for (j = 0; j < targetCount; j++) {
				targetUnit = list.getData(j);
				score = OT_EffectRangeAIScoreCalculation._getTotalScore(unit, targetUnit, item);
				tmpScore += score;
			}
		}

		misc.targetUnit = null;
		if (misc.costArray.length !== 0) {
			//root.log(unit.getName());
			//組み合わせを作成する
			combination = this._createAndPushCombination(misc);
			combination.targetUnit = unit;
			combination.single = false;
			combination.OT_EffectFlag = true;
			combination.addScore = tmpScore; // 追加スコア
		}
	}

	//root.log('==END==');

	//root.log(cnt);

};

// 範囲攻撃の射程外の時にフラグを追加して処理を軽減
var alias102 = CombinationBuilder.createMoveCombinationArray;
CombinationBuilder.createMoveCombinationArray = function(misc) {
	misc.isEffectRangeMove = true;
	return alias102.call(this, misc);
};

// BaseCombinationCollector._getTargetListArrayが改変されてた場合に影響があるため
// 専用関数にて処理
CombinationCollector.Item._getTargetListArrayERD = function(filter, misc) {
	var i, unit, arr, count, flag, list;
	
	if (misc.blockList === null) {
		return FilterControl.getListArray(filter);
	}
	
	arr = [];
	count = misc.blockList.getCount();
	for (i = 0; i < count; i++) {
		unit = misc.blockList.getData(i);
		flag = FilterControl.getNormalFilter(unit.getUnitType());
		if (flag & filter) {
			arr.push(unit);
		}
	}
	
	list = StructureBuilder.buildDataList();
	list.setDataArray(arr);
	
	return [list];
};

//----------------------------------------------------------
// サウンド重複対応
//----------------------------------------------------------
var alias200 = AnimeMotion._checkSound;
AnimeMotion._checkSound = function() {
	if(OT_EffectRangeUseSoundMode) {
		var soundHandle;
		if (!this._isLockSound && this._animeData.isSoundFrame(this._motionId, this._frameIndex)) {
			var id = this._animeData.getId();
			var frameNo = this._frameIndex;
			
			//root.log('id:' + id + ' indexOf:'+OT_EffectRangeUseSoundModeArray.indexOf(id));
			
			
			for ( var i=0; i<OT_EffectRangeUseSoundModeArray.length; i++) {
				if(OT_EffectRangeUseSoundModeArray[i][0] == id && OT_EffectRangeUseSoundModeArray[i][1] == frameNo) {
					return;
				}
			}
			
			OT_EffectRangeUseSoundModeArray.push([id, frameNo]);
			
			//root.log('id:' + id + ' add');
			OT_EffectRangeUseSoundModeArray.push(id);

			soundHandle = this._animeData.getSoundHandle(this._motionId, this._frameIndex);
			MediaControl.soundPlay(soundHandle);
		}
		return;
	}
	
	alias200.call(this);
};

var OT_EffectRangeUseSoundMode = false;
var OT_EffectRangeUseSoundModeArray = [];

OT_EffectRangeUseSoundModeEnable = function() {
	OT_EffectRangeUseSoundMode = true;
	OT_EffectRangeUseSoundModeArray = [];
	//root.log('enable');
};

OT_EffectRangeUseSoundModeDisable = function() {
	OT_EffectRangeUseSoundMode = false;
	OT_EffectRangeUseSoundModeArray = [];
	//root.log('disable');
};

//----------------------------------------------------------
// 便利な関数群
//----------------------------------------------------------
// 配列の重複を削除
function unique(array) {
	var storage = {};
	var uniqueArray = [];
	var i,value;
	for ( i=0; i<array.length; i++) {
		value = array[i];
		if (!(value in storage))
		{
			storage[value] = true;
			uniqueArray.push(value);
		}
	}
	return uniqueArray;
};

// 配列の重複を取得
function overlap(array) {
	var storage = {};
	var storage2 = {};
	var uniqueArray = [];
	var overlapArray = [];
	var i,value;
	for ( i=0; i<array.length; i++) {
		value = array[i];
		if ( !(value in storage) )
		{
			storage[value] = true;
			//root.log(value);
		}
		else if( !(value in storage2) )
		{
			storage2[value] = true;
			overlapArray.push(value);
			//root.log(value);
		}
	}
	return overlapArray;
};

// 配列同士を比較して重複を取得
function ArrayOverlap(array, array2) {
	var storage = {};
	var storage2 = {};
	var uniqueArray = [];
	var overlapArray = [];
	var i,value;
	for ( i=0; i<array.length; i++) {
		value = array[i];
		if( array2.indexOf(value) != -1 )
		{
			overlapArray.push(value);
		}
	}
	return overlapArray;
};

//var getArraysIntersect = (array01, array02) => {
//  return [Set(array01)].filter(value => array02.includes(value));
//}

debugIndexPrint = function(msg, IndexArray) {
	for(var i=0; i<IndexArray.length ; i++) {
		root.log(msg + ':' + IndexArray[i]);
	}
};

})();
