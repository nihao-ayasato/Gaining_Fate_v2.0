
/*--------------------------------------------------------------------------
  
　武器熟練度Lvアップ表示

■概要
武器、杖を使用した時、武器熟練度Lvが上昇すると（ＥからＤに上がった時など）、LvUpメッセージを表示します。
（『熟練度　剣：E→D』という感じのメッセージが出ます）

■カスタマイズ
　武器熟練度が上昇した時の音については、以下のようにカスタマイズ可能です。

　【武器熟練度Lvが上昇した時の音を変えたい（RTP使用）】
　　　　武器熟練度レベル上昇時に鳴らすSEのID（var JukurendoLvUpSoundID = 10;）の数字部分を、
　　　　RTPに登録されている、使用したいsound IDに変えてください。

　【武器熟練度Lvが上昇した時、オリジナルのSEを鳴らしたい】
　　　→まず、オリジナルのSEをsoundに登録して下さい。
　　　　（プロジェクトのAudio\soundフォルダにSEをコピーした上で
　　　　　リソース→メディアデータの確認から、オリジナルのsoundにSEを追加します）

　　　　そして、登録したSEのIDをメモします。
　　　　（リソース→メディアデータの確認から、オリジナルのsoundの横に出ているIDの値を確認してください。
　　　　　IDが出ていない場合、ツール→オプションで「データ」タブを選択し、「データの名前の横にIDを表示する」のチェックを入れてください）

　　　　その後、武器熟練度レベル上昇時に鳴らすSEのID（var JukurendoLvUpSoundID = 10;）の数字部分に、
　　　　登録したSEのIDを指定します。
　　　　その上でオリジナルSEを使うか（var useJukurendoOriginalSound = false;）を
　　　　var useJukurendoOriginalSound = true; に書き換えれば、オリジナルのSEが鳴ります。


15/12/25 新規作成
16/04/06 戦闘をスキップした際、戦闘で自軍ユニットが死亡して、尚且つ熟練度アップ表示される場合にエラーが出るバグを修正(作者じゃないけど)
16/04/25 戦闘をスキップした際、敵がドロップを落とし、尚且つ熟練度アップ表示される場合にエラーが出るバグを修正(作者じゃないけど)
16/07/31 未定義変数を使用していたバグを修正
17/02/12 熟練度上昇のメッセージテロップに名前が表示されるバグに暫定対応
17/05/22 熟練度上昇のメッセージテロップに名前が表示されるバグに暫定対応２
17/05/30 熟練度上昇のメッセージテロップ表示後にバックログを表示するとハングアップするバグに対応
17/12/10 1.166対応


■対応バージョン
　SRPG Studio Version:1.166


■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/


(function () {


// オリジナルSEを使うか（オリジナルSEを使う場合true、RTPを使う場合falseにしてください）
var useJukurendoOriginalSound = false;

// 武器熟練度レベル上昇時に鳴らすSEのID
var JukurendoLvUpSoundID = 10;	// デフォルトはRTPのsound ID:10（アイテム入手）




//-----------------------------------------------
// AttackFlowクラス
//-----------------------------------------------
var alias1 = AttackFlow._pushFlowEntriesEnd;
AttackFlow._pushFlowEntriesEnd= function(straightFlow) {
		alias1.call(this, straightFlow);
		
		// 登録済みのエントリ数を取得
		var weapon_break_index = straightFlow.getEntryCount();
		// 武器破損処理は最後から2番目に登録されている筈なので、熟練度レベル上昇フロークラスはその１つ手前に登録する
		straightFlow.insertFlowEntry(JyukurendoLevelUpFlowEntry, (weapon_break_index-2));
}




//-----------------------------------------------
// ItemUseParentクラス
//-----------------------------------------------
var alias2 = ItemUseParent._pushFlowEntries;
ItemUseParent._pushFlowEntries= function(straightFlow) {
		alias2.call(this, straightFlow);
		
		// アイテム使用時のフローエントリ（杖使用による熟練度Lv上昇用）を登録
		straightFlow.pushFlowEntry(ItemJyukurendoLevelUpFlowEntry);
}




//-----------------------------------------------
// StraightFlowクラス
//-----------------------------------------------
// 登録済みのエントリ数を取得
StraightFlow.getEntryCount= function() {
	if( this._entryArray != null ) {
		return this._entryArray.length;
	}
	return 0;
};




//-----------------------------------------------
// PreAttackクラス
//-----------------------------------------------
var alias3 = PreAttack._pushFlowEntriesEnd;
PreAttack._pushFlowEntriesEnd= function(straightFlow) {
		alias3.call(this, straightFlow);
		
		// スキップされた場合の熟練度レベル上昇フロークラスを登録
		straightFlow.pushFlowEntry(JyukurendoLevelUpFlowEntryForPreAttack);
}




//-----------------------------------------------
// CoreAttackクラス
//-----------------------------------------------
var alias4 = CoreAttack._prepareMemberData;
CoreAttack._prepareMemberData= function(attackParam) {
		alias4.call(this, attackParam);

		// スキップフラグの初期化
		this._isSkipped = false;
}


var alias5 = CoreAttack._doSkipAction;
CoreAttack._doSkipAction= function() {
		alias5.call(this);

		// スキップされた場合はスキップフラグを設定
		this._isSkipped = true;
}


CoreAttack.isSkipped= function() {
		// スキップされたかどうかを返す
		return this._isSkipped;
}




//-----------------------------------------------
// ParamGroupクラス
//-----------------------------------------------
// レベルが変化した武器熟練度の数を取得（※武器熟練度は１種類しか上昇しない為、実際には０か１しか返らない）
ParamGroup.getChangeLevelCount= function(unit_old_arr, unit_new) {
		var value_old;
		var value_new;
		var i;
		var count = this.getParameterCount();
		var change_rank_count = 0;

		// HP～移動力を入れないようにして開始する（iには移動力の次のパラメータ位置が入っている）
		for (i = ParamGroup.getMainStatusCount(); i < count; i++){
			value_old = unit_old_arr[i];
			value_new = ParamGroup.getJukurendoLevelValue(unit_new, i);

			// 武器熟練度が増加しており、かつ、熟練度に表示する文字が変化している場合は熟練度のレベルが上昇したものとする
			if( value_old < value_new ) {
				if( ItemSentence.WeaponLevel.replaceWeaponLevel(value_old) != ItemSentence.WeaponLevel.replaceWeaponLevel(value_new) ) {
					change_rank_count++;
				}
			}
		}
		return change_rank_count;
};




//-----------------------------------------------
// 熟練度レベル上昇フロークラス
//-----------------------------------------------
var JyukurendoLevelUpFlowEntry = defineObject(BaseFlowEntry,
{
	_coreAttack: null,
	_unitPlayerNew: null,
	_unitPlayerOldArr: null,
	_messageView: null,
	
	enterFlowEntry: function(coreAttack) {
		this._prepareMemberData(coreAttack);
		var result = this._completeMemberData(coreAttack);
		return result;
	},
	
	moveFlowEntry: function() {
		if (this._messageView.moveMessageView() !== MoveResult.CONTINUE) {
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	drawFlowEntry: function() {
		if (this._messageView !== null) {
			this._messageView.drawMessageView();
		}
	},
	
	_prepareMemberData: function(coreAttack) {
		var order = coreAttack.getAttackFlow().getAttackOrder();

		this._coreAttack = coreAttack;
		this._unitPlayerNew = order._unitPlayerNew;
		this._unitPlayerOldArr = order._unitPlayerOldArr;

		this._messageView = createObject(TeropView);
	},
	
	_completeMemberData: function(coreAttack) {
		var changeLevelCount;
		var messageViewParam;
		
		if (this.isFlowSkip()) {
//		if (this.isFlowSkip() || this._coreAttack.isBattleCut()) {
			// スキップ時は、直ちに終了
			return EnterResult.NOTENTER;
		}
		
		if (this._isNoGetWeaponExp()) {
			// 自軍ユニットがいない／武器なしの時は、直ちに終了
			return EnterResult.NOTENTER;
		}
		
		changeLevelCount = ParamGroup.getChangeLevelCount(this._unitPlayerOldArr, this._unitPlayerNew);
		if (changeLevelCount <= 0 ) {
			// 自軍ユニットの武器熟練度ランクに変化が無い場合は直ちに終了
			return EnterResult.NOTENTER;
		}
		
		// 熟練度の表示を行うユニットが死んでいる場合は表示せず処理を終了する
		if( this._unitPlayerNew.getHp() <= 0 ) {
			return EnterResult.NOTENTER;
		}
		
		messageViewParam = this._createMessageViewParam();
		this._messageView.setupMessageView(messageViewParam);
		this._getJukurendoLvUpSound();
		
		return EnterResult.OK;
	},
	
	_isNoGetWeaponExp: function() {
		// 自軍ユニットが未登録ならばtrue
		if( this._unitPlayerNew == null || this._unitPlayerOldArr == null ) {
			return true;
		}
		return false;
	},
	
	// 武器熟練度レベルアップ時のテキスト取得
	_getJukurendoText: function() {
		var i;
		var old_weapon_level;
		var new_weapon_level;
		var value_old;
		var value_new;
		var count = ParamGroup.getParameterCount();
		var text = '';

		// 上昇した熟練度を探す
		for (i = ParamGroup.getMainStatusCount(); i < count; i++){
			value_old = this._unitPlayerOldArr[i];
			value_new = ParamGroup.getJukurendoLevelValue(this._unitPlayerNew, i);

			// 武器熟練度が増加しており、かつ、熟練度に表示する文字が変化している場合は熟練度のレベルが上昇したものとする
			if( value_old < value_new ) {
				old_weapon_level = '';
				old_weapon_level = ItemSentence.WeaponLevel.replaceWeaponLevel(value_old);
				new_weapon_level = '';
				new_weapon_level = ItemSentence.WeaponLevel.replaceWeaponLevel(value_new);

				if( old_weapon_level != new_weapon_level ) {

					// 上昇した熟練度に関するメッセージを組立て、for文を抜ける（『熟練度　剣：E→D』のようなメッセージになる）
					text = '';
					text = '熟練度　'+ParamGroup.getParameterName(i)+'：'+old_weapon_level+'→'+new_weapon_level;
					break;
				}
			}
		}
		
		// 組立てたメッセージを返す
		return text;
	},
	
	// 武器熟練度レベルアップ時の効果音の取得
	_getJukurendoLvUpSound: function() {
		var original_handle = root.createResourceHandle(!useJukurendoOriginalSound, JukurendoLvUpSoundID, 0, 0, 0);

		if( original_handle != null ) {
			MediaControl.soundPlay(original_handle);
		}
		else {
			root.log('オリジナルサウンドID不正:'+this._originalSoundId);
		}
	},
	
	_createMessageViewParam: function() {
		var messageViewParam = StructureBuilder.buildMessageViewParam();
		
		messageViewParam.messageLayout = root.getBaseData().getMessageLayoutList().getData(MessageLayout.TEROP);
		messageViewParam.text = this._getJukurendoText();
		messageViewParam.pos = MessagePos.CENTER;
		messageViewParam.speakerType = SpeakerType.UNIT;
		messageViewParam.handle = null;
		messageViewParam.unit = null;
		messageViewParam.npc = null;
		messageViewParam.facialExpressionId = 0;
		messageViewParam.isNameDisplayable = false;
		messageViewParam.isWindowDisplayable = true;
		
		return messageViewParam;
	}
}
);




//-----------------------------------------------
// 熟練度レベル上昇フロークラス（戦闘スキップ時に呼び出される）
//-----------------------------------------------
var JyukurendoLevelUpFlowEntryForPreAttack = defineObject(JyukurendoLevelUpFlowEntry,
{
	_prepareMemberData: function(preAttack) {
		var order = preAttack._coreAttack.getAttackFlow().getAttackOrder();

		this._coreAttack = preAttack._coreAttack;
		this._unitPlayerNew = order._unitPlayerNew;
		this._unitPlayerOldArr = order._unitPlayerOldArr;

		this._messageView = createObject(TeropView);
	},
	
	_completeMemberData: function(preAttack) {
		var changeLevelCount;
		var messageViewParam;
		
		// 戦闘時にスキップ操作が行われていない時はこちらの処理が不要なので直ちに終了
		if (!this._coreAttack.isSkipped()) {
			return EnterResult.NOTENTER;
		}
		
		if (this._isNoGetWeaponExp()) {
			// 自軍ユニットがいない／武器なしの時は、直ちに終了
			return EnterResult.NOTENTER;
		}
		
		changeLevelCount = ParamGroup.getChangeLevelCount(this._unitPlayerOldArr, this._unitPlayerNew);
		if (changeLevelCount <= 0 ) {
			// 自軍ユニットの武器熟練度ランクに変化が無い場合は直ちに終了
			return EnterResult.NOTENTER;
		}
		
		// 熟練度の表示を行うユニットが死んでいる場合は表示せず処理を終了する
		if( this._unitPlayerNew.getHp() <= 0 ) {
			return EnterResult.NOTENTER;
		}
		
		messageViewParam = this._createMessageViewParam();
		this._messageView.setupMessageView(messageViewParam);
		this._getJukurendoLvUpSound();
		
		return EnterResult.OK;
	}
}
);




//-----------------------------------------------
// アイテム使用時の、熟練度レベル上昇フロークラス
//-----------------------------------------------
var ItemJyukurendoLevelUpFlowEntry = defineObject(JyukurendoLevelUpFlowEntry,
{
	_prepareMemberData: function(itemUseParent) {
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		this._unitPlayerNew = itemTargetInfo.unit;
		this._unitPlayerOldArr = itemTargetInfo._unitPlayerOldArr;

		this._messageView = createObject(TeropView);
	},
	
	_completeMemberData: function(coreAttack) {
		var changeLevelCount;
		var messageViewParam;
		
		// アイテム（杖）使用時はスキップ操作でスキップしない
		// （熟練度レベルアップしていればスキップしても表示するようにしている）
//		if (this.isFlowSkip()) {
//			return EnterResult.NOTENTER;
//		}
		
		if (this._isNoGetWeaponExp()) {
			// 自軍ユニットがいない／武器なしの時は、直ちに終了
			return EnterResult.NOTENTER;
		}
		
		changeLevelCount = ParamGroup.getChangeLevelCount(this._unitPlayerOldArr, this._unitPlayerNew);
		if (changeLevelCount <= 0 ) {
			// 自軍ユニットの武器熟練度ランクに変化が無い場合は直ちに終了
			return EnterResult.NOTENTER;
		}
		
		// 熟練度の表示を行うユニットが死んでいる場合は表示せず処理を終了する
		if( this._unitPlayerNew.getHp() <= 0 ) {
			return EnterResult.NOTENTER;
		}
		
		messageViewParam = this._createMessageViewParam();
		this._messageView.setupMessageView(messageViewParam);
		this._getJukurendoLvUpSound();
		
		return EnterResult.OK;
	}
}
);




// 以下の関数は不要と思われるが、念の為残している

//-----------------------------------------------
// BaseMessageViewクラス
//-----------------------------------------------
var alias10 = BaseMessageView.drawName;
BaseMessageView.drawName= function(x, y) {
		
		// 顔画像が無い時は名前も表示しない
		if( this._faceHandle == null ) {
			return;
		}

		alias10.call(this, x, y);
}


var alias11 = BaseMessageView._setupName;
BaseMessageView._setupName= function(messageViewParam) {
		
		// 顔画像：表示しないの時は名前を設定しない
		if (this._messageLayout.getFaceVisualType() === FaceVisualType.INVISIBLE) {
			this._name = '';
			return;
		}

		alias11.call(this, messageViewParam);
}


})();