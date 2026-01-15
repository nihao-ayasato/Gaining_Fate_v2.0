
/*--------------------------------------------------------------------------

ドーピングでステ伸びない時ウィンドウ出さない


■概要
このプラグインをpluginフォルダに入れると、
能力値が上昇しないドーピングアイテムを使った場合に能力上昇ウィンドウが表示されなくなります。

経験値だけ上昇するドーピングアイテムを作ったんだけど…
能力値上がんないのに能力上昇ウィンドウ表示しないで経験値入手のとこだけ表示して欲しい、という時に使って下さい。


修正内容
16/08/28　新規作成
16/11/27　CC時に上限LVを現在LVプラス設定値にするスクリプトとの併用に対応
17/03/05　「アイテムの使用」画面で能力が上昇しないドーピングアイテムを使うと使用回数が無限になるバグを修正

■対応バージョン
　SRPG Studio Version:1.116


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




//-------------------------------------------
// DopingItemUseクラス
//-------------------------------------------


// アイテム使用回数が無限にならないよう、アイテム能力が上昇しない場合も能力上昇処理に一瞬だけ入る（キー管理や描画管理は行わない）


var alias2 =  DopingItemUse.moveMainUseCycle;
DopingItemUse.moveMainUseCycle= function() {
		var itemTargetInfo = this._itemUseParent.getItemTargetInfo();

		// ドーピングしても能力が上昇しないアイテムならキー管理処理を終了
		if( ParameterControl.isPalameterChangeItem(itemTargetInfo.item) != true ) {
			return MoveResult.END;
		}

		// それ以外は通常通りの動作を行う
		return alias2.call(this);
}


var alias3 =  DopingItemUse.drawMainUseCycle;
DopingItemUse.drawMainUseCycle= function() {
		var itemTargetInfo = this._itemUseParent.getItemTargetInfo();

		// ドーピングしても能力が上昇しないアイテムなら描画処理を終了
		if( ParameterControl.isPalameterChangeItem(itemTargetInfo.item) != true ) {
			return;
		}

		// それ以外は通常通りの動作を行う
		alias3.call(this);
}




//-------------------------------------------
// ParameterControlクラス
//-------------------------------------------
// ドーピングアイテムで能力値が変化するかを判定
ParameterControl.isPalameterChangeItem= function(obj) {
		var i;
		var count = ParamGroup.getParameterCount();
		
		for (i = 0; i < count; i++) {
			// ドーピングパラメータが0以外の能力値があれば、それは能力値を上げるドーピングアイテムである
			if( ParamGroup.getDopingParameter(obj, i) != 0 ) {
				return true;
			}
		}

		// カスタムパラメータ_maxlv_plusを持つドーピングアイテムはレベル上限を上げるドーピングアイテム
		if ( typeof obj.custom._maxlv_plus === 'number' ) {
			return true;
		}

		// それ以外は能力値が上がらないドーピングアイテム（経験値だけ上げるやつ）
		return false;
}


})();
