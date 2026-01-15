
/*--------------------------------------------------------------------------

無限杖

■概要
　杖をいくら使っても減らなくなるカスタムスキル：無限杖と
　道具をいくら使っても減らなくなるカスタムスキル：無限道具が作れるようになります。
　（無限武器の道具/杖版です）
　※無限道具のスキルを所持している場合、鍵や扉を開けた時は発動率%で鍵が消費されなくなりました（非戦闘時なので、スキルが発動しても発動表示はありません）

　なおスキルの発動確率は、カスタムスキルに設定した発動率が使われます。
　※データ設定→コンフィグ→ユーザー拡張の中にある「スキル発動条件でパラメータボーナスを考慮する」にチェックが入っていない場合
　　クラスボーナスやアイテム類による能力ボーナスは考慮されません。注意してください。


■準備
　本スクリプトをプラグインに入れた上で、以下を行う必要があります。

　１．カスタムスキルを作成し、無限杖の場合はキーワードに'wand-mugen'を入れてください。
　　　無限道具の場合はキーワードに'item-mugen'を入れてください。
　２．自軍のユニットに１のスキルを持たせてください。


■カスタマイズ
　・カスタムスキルのキーワードを変えたい
　　（キーワードを変えた場合、カスタムスキル側のキーワードも差し替える必要があります）
　　　無限杖の場合、設定にある　var WAND_MUGEN_SKILL_NAME = 'wand-mugen';の「wand-mugen」を書き換えてください。
　　　無限道具の場合、設定にある　var ITEM_MUGEN_SKILL_NAME = 'item-mugen';の「item-mugen」を書き換えてください。


■カスタマイズ



修正内容
16/07/14　新規作成
18/12/01 「00_武器タイプ：杖を増やす.js」との併用に対応
19/02/09　無限道具のスキルを所持していても、鍵によって扉や宝箱を開けた場合は鍵を消費してしまうバグを修正

■対応バージョン
　SRPG Studio Version:1.198


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


//-----------------------------
// 設定
//-----------------------------
var WAND_MUGEN_SKILL_NAME = 'wand-mugen';		// カスタムスキル：無限杖に入れるキーワード
var ITEM_MUGEN_SKILL_NAME = 'item-mugen';		// カスタムスキル：無限道具に入れるキーワード




//-----------------------------
// ItemUseParentクラス
//-----------------------------
ItemUseParent.decreaseItem= function() {
		var skill;
		var isDecrement = true;

		if (!this._isItemDecrementDisabled) {
			var isWand = this._itemTargetInfo.item.isWand();
			if( typeof isWandTypeExtra !== 'undefined' ) {
				// 武器タイプ追加の場合
				isWand = WandChecker.isWand(this._itemTargetInfo.item);
			}

			if( isWand ) {
				skill = SkillControl.getPossessionCustomSkill(this._itemTargetInfo.unit, WAND_MUGEN_SKILL_NAME);
			}
			else {
				skill = SkillControl.getPossessionCustomSkill(this._itemTargetInfo.unit, ITEM_MUGEN_SKILL_NAME);
			}

			
			if( SkillRandomizer.isMugenSkillInvokedInternal(this._itemTargetInfo.unit, skill) ) {
				isDecrement = false;
			}

			// アイテムの耐久を減らす
			if( isDecrement == true ) {
				ItemControl.decreaseItem(this._itemTargetInfo.unit, this._itemTargetInfo.item);
			}
		}
}




//-----------------------------
// SkillRandomizerクラス
//-----------------------------
// 無限杖、無限道具の発動判定
SkillRandomizer.isMugenSkillInvokedInternal= function(active, skill) {
		// スキルが指定されていない場合は発動しない
		if( skill == null ) {
			return false;
		}
		
		var type = skill.getInvocationType();
		var value = skill.getInvocationValue();
		
		// valueを「発動率」として計算する
		var result = Probability.getInvocationProbability(active, type, value);
		return result;
}




//-----------------------------
// KeyTrophyFlowEntryクラス
//-----------------------------
KeyTrophyFlowEntry._completeMemberData= function(keyNavigator) {
		var unit = keyNavigator.getUnit();
		var keyData = keyNavigator.getKeyData();
		var skill;
		var isItemDecrease = true;
		
		if (keyData.item !== null) {
			skill = SkillControl.getPossessionCustomSkill(unit, ITEM_MUGEN_SKILL_NAME);
			if( skill && SkillRandomizer.isMugenSkillInvokedInternal(unit, skill) ) {
				// 無限道具のスキルを所持しており、発動判定に成功した場合は鍵を消費しない
				isItemDecrease = false;
			}
			if( isItemDecrease === true ) {
				ItemControl.decreaseItem(unit, keyData.item);
			}
		}
		
		return this._eventTrophy.enterEventTrophyCycle(unit, keyNavigator.getPlaceEvent());
}


})();