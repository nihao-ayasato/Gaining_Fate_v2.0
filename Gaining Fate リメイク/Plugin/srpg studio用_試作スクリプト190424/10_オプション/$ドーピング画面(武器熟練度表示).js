
/*--------------------------------------------------------------------------
  
　ドーピング画面（武器熟練度表示）

■概要
このスクリプトを入れると、
ドーピングアイテムで武器熟練度を上昇させるものを作って使用した場合に、
熟練度のパラメータ上昇を表示出来るようになります。

　例）ドーピングアイテムに{swdDoping:10}と設定すると、使用する事で剣の熟練度が10上昇します、が…

　　旧来　ドーピングアイテム使用時に通常の能力値だけが描画され、剣に+10された事が表示されません。
　　今回　ドーピングアイテム使用時に武器熟練度が描画され、剣に+10された事が表示されます。

■注意点
ドーピングアイテムが『通常の能力UPアイテム』か『武器熟練度を上げるドーピングアイテム』かの判定は、以下のようになっています。
『通常の能力値（HP～移動力）に加えて、武器熟練度も上昇させるドーピングアイテム』を作ると正しく表示されなくなるので注意してください。

　『武器熟練度を上げるドーピングアイテム』
　　　武器熟練度（移動力より後ろのパラメータ）を上昇させるドーピングアイテム

　『通常の能力UPアイテム』
　　　武器熟練度を上げるドーピングアイテム以外のドーピングアイテム




15/12/23 新規作成
16/01/11 1.048対応（作者じゃないけど）
16/11/27 CC時に上限LVを現在LVプラス設定値にするスクリプトとの併用に対応

■対応バージョン
　SRPG Studio Version:1.101


■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/

(function () {


ParameterChangeWindow.setParameterChangeData= function(targetUnit, parameterChangeCommand) {
		this._scrollbar = createScrollbarObject(StatusScrollbar, this);
		this._scrollbar.enableStatusBonus(true);

		// 通常のドーピングアイテムの場合
		if( this._isJyukurendoDoping(parameterChangeCommand) != true ) {
			this._scrollbar.setStatusFromUnit(targetUnit);
		}
		// 武器熟練度を上昇させるドーピングアイテムの場合
		else {
			this._scrollbar.setJyukurendoStatusFromUnit(targetUnit);
		}
		
		this._targetUnit = targetUnit;
		
		this._setBonusStatus(parameterChangeCommand);
		this._playParameterChangeSound();


		var item = parameterChangeCommand;
		if ( typeof item.custom._maxlv_plus === 'number' ) {
			this._old_maxlv = Miscellaneous.getMaxLv(targetUnit);
			this._new_maxlv = Miscellaneous.getMaxLv(targetUnit) + item.custom._maxlv_plus;

			if ( typeof item.custom._maxlv_limit === 'number' ) {
				if ( this._new_maxlv > item.custom._maxlv_limit ) {
					this._new_maxlv = item.custom._maxlv_limit;
				}
			}
		}
};


ParameterChangeWindow._setBonusStatus= function(parameterChangeCommand) {
		var i,j;
		var count;
		var bonusArray = [];
		
		// 通常のドーピングアイテムの場合
		if( this._isJyukurendoDoping(parameterChangeCommand) != true ) {
			j = 0;										// パラメータ先頭
			count = ParamGroup.getMainStatusCount();	// 移動力まで

			// ドーピングする値を取得（通常のドーピングアイテムなので、パラメータ先頭からデータを取り出す）
			for (i = 0; j < count; i++, j++) {
				bonusArray[i] = ParamGroup.getDopingParameter(parameterChangeCommand, j);
			}
			
			this._scrollbar.setStatusBonus(bonusArray);
		}

		// 武器熟練度を上昇させるドーピングアイテムの場合
		else {
			j = ParamGroup.getMainStatusCount();		// 移動力の次の位置
			count = ParamGroup.getParameterCount();		// パラメータ終端

			// ドーピングする値を取得（武器熟練度用ドーピングアイテムなので、移動力の次からデータを取り出す）
			for (i = 0; j < count; i++, j++) {
				bonusArray[i] = ParamGroup.getDopingParameter(parameterChangeCommand, j);
			}
			
			// 武器熟練度ボーナス値の設定
			this._scrollbar.setStatusBonusJyukurendo(bonusArray);
		}
};


// ドーピングアイテムが武器熟練度を上昇させるものかどうかの判定
ParameterChangeWindow._isJyukurendoDoping= function(parameterChangeCommand) {
		var i = ParamGroup.getMainStatusCount();
		var count = ParamGroup.getParameterCount();
		var bonusArray = [];
		
		for (; i < count; i++) {
			// 武器熟練度（移動力よりも後ろにあるステータス）を変化（上昇or下降）させるアイテムは、
			// 武器熟練度を上昇させるドーピングアイテムとしている
			if( ParamGroup.getDopingParameter(parameterChangeCommand, i) != 0 ) {
				return true;
			}
		}
		return false;
};




// 武器熟練度パラメータをスクロールバーに設定
StatusScrollbar.setJyukurendoStatusFromUnit= function(unit) {
		var j;
		var i = ParamGroup.getMainStatusCount();	// メインステータス終端＋１（移動力の次）の位置取得
		var count = ParamGroup.getParameterCount();
		this._statusArray = [];
		
		// 武器熟練度は移動力以降にある為、移動力の次から終端のパラメータを取り出して配列に設定
		for (j = 0; i < count; i++) {
			this._statusArray[j++] = this._createStatusEntry(unit, i);
		}
		
		this.setScrollFormation(this.getDefaultCol(), this.getDefaultRow());
		this.setObjectArray(this._statusArray);
};


// 武器熟練度ボーナス値の設定
StatusScrollbar.setStatusBonusJyukurendo= function(bonusArray) {
		var i;
		var count = bonusArray.length;
		
		// 武器熟練度ボーナスを設定
		for (i = 0; i < count; i++) {
			this._statusArray[i].bonus = bonusArray[i];
		}
};



})();