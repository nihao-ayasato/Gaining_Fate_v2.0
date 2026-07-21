/*--------------------------------------------------------------------------

  ルメンテ専用スキル「必外」

  戦闘時、10%の確率でスキルが発動し、
  スキル所持者の攻撃が必ず外れる。

  使用方法:
  1. データベースでスキルを作成し、種類を「カスタム」にする
  2. キーワードに [Lumente_ForceMiss] を設定する
  3. 発動の種類を「絶対」、発動値を 10 にする（＝10%）
  4. 「発動時に表示する」を有効にすると、戦闘中にスキル名が表示される
  5. 対象ユニット（ルメンテ）にスキルを所持させる

  備考:
  ・発動率はスキルの「発動」設定を使用します（推奨: 絶対 10）
  ・必中スキルより優先して外れます
  ・反撃時にも判定されます（所持者の攻撃回ごとに判定）

--------------------------------------------------------------------------*/

(function() {

var LUMENTE_FORCE_MISS_KEYWORD = 'Lumente_ForceMiss';

var alias1 = SkillRandomizer.isCustomSkillInvokedInternal;
SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
	if (keyword === LUMENTE_FORCE_MISS_KEYWORD) {
		return this._isSkillInvokedInternal(active, passive, skill);
	}

	return alias1.call(this, active, passive, skill, keyword);
};

// 命中判定より前に必外を判定し、発動時は攻撃を必ず外す
var alias2 = AttackEvaluator.HitCritical.evaluateAttackEntry;
AttackEvaluator.HitCritical.evaluateAttackEntry = function(virtualActive, virtualPassive, attackEntry) {
	if (SkillControl.checkAndPushCustomSkill(virtualActive.unitSelf, virtualPassive.unitSelf, attackEntry, true, LUMENTE_FORCE_MISS_KEYWORD) !== null) {
		attackEntry.isHit = false;
		attackEntry.isCritical = false;
		attackEntry.damagePassive = 0;
		attackEntry.damageActive = 0;
		attackEntry.damagePassiveFull = 0;
		return;
	}

	alias2.call(this, virtualActive, virtualPassive, attackEntry);
};

})();
