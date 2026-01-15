
/*--------------------------------------------------------------------------
  
　メインステータス数を取得するプラグイン

■概要
ステータス画面(移動力表示).jsやLvUp時の熟練度非表示.jsの内部で使用する
ParamGroup.getMainStatusCount()を外部に切り出したものです。


15/10/11 新規作成
16/01/11 1.048対応（作者じゃないけど）


■対応バージョン
　SRPG Studio Version:1.048


■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/


// メインステータス数（熟練度ではないステータス数）の取得
var ParaGroupMainStatusLast = 'bld_param';
ParamGroup.getMainStatusCount= function() {

		var i;
		var count = this.getParameterCount();
		var main_para_last = root.queryCommand(ParaGroupMainStatusLast);

		for( i = 0;i < count;i++ ) {
			if( this.getParameterName(i) == main_para_last ){
				return (i+1);
			}
		}
		return count;
};


