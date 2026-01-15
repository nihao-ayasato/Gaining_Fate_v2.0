
/*--------------------------------------------------------------------------
  
　自軍が攻撃した時に、敵が反撃可能武器に切り替えてくるスクリプト

■概要
自軍ユニットが敵を攻撃した際、敵が所持している武器の中で反撃可能な武器を自動で選択します。
（反撃可能武器の中で一番先に検出した武器を使用します。威力や命中が最適であるかは現在考慮してません）

■カスタマイズ
　１．同盟ユニットも反撃可能な武器を自動で選択するようにしたい
　　　→「var IS_ATTACKABLE_ALLY_ENABLE = false;」のfalseをtrueに書き換えてください

　２．敵（IS_ATTACKABLE_ALLY_ENABLE=trueなら同盟ユニットも）の一部だけ反撃可能な武器を自動で選択するようにしたい
　　　→「var IS_ATTACKABLE_AUTO_ENABLE = true;」のtrueをfalseに書き換えてください
　　　　その上で、キーワードに'sokuou'を入れたカスタムスキルを敵（同盟）ユニットに持たせてください
　　　　（クラススキルでもユニットスキルでも構いません）

　３．カスタムスキルのキーワードを変えたい
　　　→「var ATTACKABLE_SKILL_KEYWORD  = 'sokuou';」のsokuouの部分を違うキーワードに変えてください

　４．反撃武器選択時、反撃可能な中で一番スコアがいい武器を選択したい
　　　→「var IS_CALCULATE_SCORE = false;」のfalseをtrueに書き換えてください



16/11/06  新規作成
16/11/07  設定を幾つか追加
17/04/15  反撃武器選択時、反撃可能な中で一番スコアがいい武器を選択する設定を追加（AIScorer.Weapon.getScore()の値が一番良い武器）
17/11/29  1.164対応
18/01/16  記述ミスにより、自軍ユニットにも「敵が反撃武器選択」の効果が発生していたバグを修正
          （敵が1歩移動して攻撃してきた場合、自分は剣装備で手槍を所持していると発生）
19/04/05  superbow1.2改.txtとの競合対策実施


■対応バージョン
　SRPG Studio Version:1.202


■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/


(function() {

//-----------------------------------
// 設定
//-----------------------------------

// 同盟ユニットが自動反撃武器選択を行うか
var IS_ATTACKABLE_ALLY_ENABLE = true;		// true：自動反撃武器選択を行う false:行わない

// 敵ユニットが（IS_ATTACKABLE_ALLY_ENABLE=trueなら同盟ユニットも）カスタムスキルなしで自動反撃武器選択を行うか
var IS_ATTACKABLE_AUTO_ENABLE = true;		// true：カスタムスキルなしで自動反撃武器選択可能 false:カスタムスキルがないと自動反撃武器選択できない

// 反撃武器選択時、反撃可能な中で一番スコアがいい武器を選択するか
var IS_CALCULATE_SCORE        = false;		// true：スコアが一番良いものを選択 false:反撃可能な一番上の武器を選択

// カスタムスキルのキーワード
var ATTACKABLE_SKILL_KEYWORD  = 'sokuou';	// IS_ATTACKABLE_AUTO_ENABLE = falseの場合、このキーワードのカスタムスキルを所持していないと自動反撃武器選択は行えない




//-------------------------------------
// PosMenuクラス
//-------------------------------------
PosMenu.changePosTarget= function(targetUnit) {
		var targetItem, isLeft;
		
		if (this._unit === null || !this._isTargetAllowed(targetUnit)) {
			this._currentTarget = null;
			return;
		}
		
		this._currentTarget = targetUnit;

		// 攻撃対象がプレイヤーユニットでない場合は、反撃可能な武器を自動選択
		if( ItemControl.isAttackableWeapon(targetUnit) == true ) {
			targetItem = ItemControl.getAttackableWeapon(targetUnit, this._unit);

			if( targetItem != null  ) {
				ItemControl.setEquippedWeapon(targetUnit, targetItem);
			}
		}
		targetItem = ItemControl.getEquippedWeapon(targetUnit);
		
		// srcを常に左側に表示するものとする
		isLeft = Miscellaneous.isUnitSrcPriority(this._unit, targetUnit);
		
		// 自軍を左側に表示することを優先している(左側の方が見やすいと判断)
		// このため、自軍が仕掛けた場合は当然左側に表示されるが、
		// 自軍が仕掛けられた場合でも左側に表示される。
		// 両方、自軍である場合は仕掛けた方を左側に表示する。
		if (isLeft) {
			// 仕掛けたのは自軍であるため、これを_posWindowLeftに指定
			this._posWindowLeft.setPosTarget(this._unit, this._item, targetUnit, targetItem, true);
			this._posWindowRight.setPosTarget(targetUnit, targetItem, this._unit, this._item, false);
		}
		else {
			// 仕掛けたのは自軍ではない。
			// この場合、targetUnitが自軍であるため、これを_posWindowLeftに指定。
			this._posWindowLeft.setPosTarget(targetUnit, targetItem, this._unit, this._item, true);
			this._posWindowRight.setPosTarget(this._unit, this._item, targetUnit, targetItem, false);
		}
}




//-------------------------------------
// ItemControlクラス
//-------------------------------------
// 被攻撃側が、攻撃側に自動反撃可能かどうかの判定
ItemControl.isAttackableWeapon= function(unit) {
		// 自軍ユニットの場合は自動反撃武器選択は行わない
		if( unit.getUnitType() == UnitType.PLAYER ) {
			return false;
		}
		
		// 同盟ユニットの場合、IS_ATTACKABLE_ALLY_ENABLEがtrueでない場合は自動反撃武器選択は行わない
		if( unit.getUnitType() == UnitType.ALLY && IS_ATTACKABLE_ALLY_ENABLE == false ) {
			return true;
		}
		
		// 自動反撃武器選択フラグ（IS_ATTACKABLE_AUTO_ENABLE）がfalse、かつ、
		// キーワード（ATTACKABLE_SKILL_KEYWORD）のカスタムスキル未所持なら自動反撃武器選択は行わない
		if( IS_ATTACKABLE_AUTO_ENABLE == false && !SkillControl.getPossessionCustomSkill(unit, ATTACKABLE_SKILL_KEYWORD) ) {
			return false;
		}
		
		// 自動反撃武器選択フラグ（IS_ATTACKABLE_AUTO_ENABLE）がtrue、または、
		// カスタムスキル名（ATTACKABLE_SKILL_NAME）のスキルを所持するユニットなら自動反撃武器選択を行う
		return true;
}


// 被攻撃側で、攻撃側に反撃可能な武器を探して取得する
// 反撃可能な一番上の武器を使用する場合
if( IS_CALCULATE_SCORE == false ) {
	ItemControl.getAttackableWeapon= function(targetUnit, unit) {
		var indexArray;
		var weapon;
		var count;
		var i;
		var targetweapon;
		var result;
		
		// 反撃が許可されていない場合は処理終了
		if (!Calculator.isCounterattackAllowed(unit, targetUnit)) {
			return null;
		}
		
		weapon = ItemControl.getEquippedWeapon(unit);
		if (weapon !== null && weapon.isOneSide()) {
			// 攻撃側が「一方向」の武器を装備している場合は、反撃出来ない為処理終了
			return null;
		}
		
		count = UnitItemControl.getPossessionItemCount(targetUnit);
		// 所持ている武器の中から、反撃可能な武器を探す
		for (i = 0; i < count; i++) {
			targetweapon = UnitItemControl.getItem(targetUnit, i);
			if (targetweapon !== null && this.isWeaponAvailable(targetUnit, targetweapon)) {
				// 「一方向」の武器は反撃できない
				if (targetweapon.isOneSide()) {
					continue;
				}
				
				// superbow1.2改.txtが無い場合はこちら
				if( typeof SKILL_SUPERBOW_USE_ENABLE === 'undefined' || SKILL_SUPERBOW_USE_ENABLE !== true ) {
					indexArray = IndexArray.createIndexArray(targetUnit.getMapX(), targetUnit.getMapY(), targetweapon);
				}
				// superbow1.2改.txtが入っていれば強弓などを加味する
				else {
					skill_superbow = SkillControl.getPossessionCustomSkill(targetUnit,'superbow');
					skill_proximity = SkillControl.getPossessionCustomSkill(targetUnit,'Proximity_fire');
					indexArray = IndexArray.createsuperbowBySkill(targetUnit.getMapX(), targetUnit.getMapY(), targetweapon, skill_superbow, skill_proximity);
				}
				
				// 反撃側の武器で、攻撃側の座標を攻撃可能ならばその武器を返す
				// 一番最初に検出した反撃可能な武器を返している（最適な武器を取り出していない）
				result = IndexArray.findPos(indexArray, unit.getMapX(), unit.getMapY());
				if( result == true ) {
					return targetweapon;
				}
			}
		}
		
		return null;
	};
}
// スコアが一番良いものを使用する場合
else {
	ItemControl.getAttackableWeapon= function(targetUnit, unit) {
		var indexArray;
		var weapon;
		var count;
		var i;
		var targetweapon;
		var result;
		var skill_superbow;
		var skill_proximity;
		var maxWeapon = null;
		var max_score = 0;
		var score = 0;
		var combination = {};
		combination.targetUnit = unit;
		combination.plusScore  = 0;
		
		// 反撃が許可されていない場合は処理終了
		if (!Calculator.isCounterattackAllowed(unit, targetUnit)) {
			return null;
		}
		
		weapon = ItemControl.getEquippedWeapon(unit);
		if (weapon !== null && weapon.isOneSide()) {
			// 攻撃側が「一方向」の武器を装備している場合は、反撃出来ない為処理終了
			return null;
		}
		
		count = UnitItemControl.getPossessionItemCount(targetUnit);
		// 所持ている武器の中から、反撃可能な武器を探す
		for (i = 0; i < count; i++) {
			targetweapon = UnitItemControl.getItem(targetUnit, i);
			if (targetweapon !== null && this.isWeaponAvailable(targetUnit, targetweapon)) {
				// 「一方向」の武器は反撃できない
				if (targetweapon.isOneSide()) {
					continue;
				}
				
				// superbow1.2改.txtが無い場合はこちら
				if( typeof SKILL_SUPERBOW_USE_ENABLE === 'undefined' || SKILL_SUPERBOW_USE_ENABLE !== true ) {
					indexArray = IndexArray.createIndexArray(targetUnit.getMapX(), targetUnit.getMapY(), targetweapon);
				}
				// superbow1.2改.txtが入っていれば強弓などを加味する
				else {
					skill_superbow = SkillControl.getPossessionCustomSkill(targetUnit,'superbow');
					skill_proximity = SkillControl.getPossessionCustomSkill(targetUnit,'Proximity_fire');
					indexArray = IndexArray.createsuperbowBySkill(targetUnit.getMapX(), targetUnit.getMapY(), targetweapon, skill_superbow, skill_proximity);
				}
				
				// 反撃側の武器で、攻撃側の座標を攻撃可能ならばその武器のスコアを算出し
				// 一番スコアがいい武器を返す
				result = IndexArray.findPos(indexArray, unit.getMapX(), unit.getMapY());
				if( result == true ) {
					combination.item = targetweapon;
					score = AIScorer.Weapon.getScore(targetUnit, combination);
// 反撃可能武器のスコア（デバッグ用）
//root.log(targetweapon.getName()+':'+score);
					if( score > max_score ) {
						max_score = score;
						maxWeapon = targetweapon;
					}
				}
			}
		}
		
// 選んだ反撃可能武器のスコア（デバッグ用）
//if( maxWeapon != null){
//	root.log('result '+maxWeapon.getName()+':'+max_score);
//}
//else{
//	root.log('result maxWeapon null');
//}
		return maxWeapon;
	};
}



//-------------------------------------
// AttackCheckerクラス
//-------------------------------------
// 反撃可能かのチェック（座標単位）※敵AIで、反撃のスコア算出時のみ呼び出されている関数に武器持ち替え処理を追加した
AttackChecker.isCounterattackPos= function(unit, targetUnit, x, y) {
		var indexArray;
		var weapon;
		
		// 敵、同盟ユニットが自動反撃可能ならば反撃可能な武器に持ち替える
		if( ItemControl.isAttackableWeapon(targetUnit) == true ) {
			weapon = ItemControl.getAttackableWeapon(targetUnit, unit);
			if (weapon === null) {
				return false;
			}
			ItemControl.setEquippedWeapon(targetUnit, weapon);
		}
		// 敵、同盟ユニットが自動反撃可能でなければ通常通り
		else {
			weapon = ItemControl.getEquippedWeapon(targetUnit);
			if (weapon === null) {
				return false;
			}
		}
		
		// superbow1.2改.txtが無い場合はこちら
		if( typeof SKILL_SUPERBOW_USE_ENABLE === 'undefined' || SKILL_SUPERBOW_USE_ENABLE !== true ) {
			indexArray = IndexArray.createIndexArray(targetUnit.getMapX(), targetUnit.getMapY(), weapon);
		}
		// superbow1.2改.txtが入っていれば強弓などを加味する
		else {
			var skill_superbow = SkillControl.getPossessionCustomSkill(targetUnit,'superbow');
			var skill_proximity = SkillControl.getPossessionCustomSkill(targetUnit,'Proximity_fire');
			indexArray = IndexArray.createsuperbowBySkill(targetUnit.getMapX(), targetUnit.getMapY(), weapon, skill_superbow, skill_proximity);
		}
		
		return IndexArray.findPos(indexArray, x, y);
}


})();