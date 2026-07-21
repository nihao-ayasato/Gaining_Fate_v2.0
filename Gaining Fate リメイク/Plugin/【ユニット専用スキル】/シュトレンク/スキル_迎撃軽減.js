/*--------------------------------------------------------------------------

  シュトレンク専用スキル「迎撃軽減」

  相手から攻撃を仕掛けられた戦闘で、自分の被ダメージが-1される。
  （自分が仕掛けた戦闘では、反撃で受けるダメージには適用されない）

  使用方法:
  1. データベースでスキルを作成し、種類を「カスタム」にする
  2. キーワードに [Strenk_InitDef] を設定する
  3. 対象ユニット（シュトレンク）にスキルを所持させる

  備考:
  ・戦闘開始側でない場合にのみ、受けるダメージが軽減されます
  ・戦闘予測のダメージ表示にも反映されます
  ・最小ダメージを下回ることはありません

  カスタムパラメータ（任意）:
  {
      damageReduce: 1   // 軽減量（未指定時は1）
  }

--------------------------------------------------------------------------*/

(function() {

var STRENK_INIT_DEF_KEYWORD = 'Strenk_InitDef';
var DEFAULT_DAMAGE_REDUCE = 1;

var StrenkInitDefControl = {
	_battlePassiveIsDest: null,
	_predictionSrc: null,

	isReductionActive: function(passive) {
		if (this._battlePassiveIsDest === true) {
			return true;
		}
		if (this._battlePassiveIsDest === false) {
			return false;
		}
		if (this._predictionSrc !== null) {
			return passive !== this._predictionSrc;
		}

		// AI等の単独計算では、被ダメージ側にスキルがあれば軽減する
		return true;
	}
};

// 実戦: 被ダメージ側が戦闘開始側かどうかを記録
var alias1 = AttackEvaluator.HitCritical.calculateDamage;
AttackEvaluator.HitCritical.calculateDamage = function(virtualActive, virtualPassive, attackEntry) {
	StrenkInitDefControl._battlePassiveIsDest = !virtualPassive.isSrc;
	var damage = alias1.call(this, virtualActive, virtualPassive, attackEntry);
	StrenkInitDefControl._battlePassiveIsDest = null;
	return damage;
};

// 戦闘予測: 仕掛けた側を記録
var alias2 = PosAttackWindow.setPosTarget;
PosAttackWindow.setPosTarget = function(unit, item, targetUnit, targetItem, isSrc) {
	StrenkInitDefControl._predictionSrc = isSrc ? unit : targetUnit;
	alias2.call(this, unit, item, targetUnit, targetItem, isSrc);
	StrenkInitDefControl._predictionSrc = null;
};

var alias3 = DamageCalculator.calculateDamage;
DamageCalculator.calculateDamage = function(active, passive, weapon, isCritical, activeTotalStatus, passiveTotalStatus, trueHitValue) {
	var damage = alias3.call(this, active, passive, weapon, isCritical, activeTotalStatus, passiveTotalStatus, trueHitValue);
	var skill, reduce;

	// HP最小などの特殊値はそのまま返す
	if (damage < 0) {
		return damage;
	}

	skill = SkillControl.getPossessionCustomSkill(passive, STRENK_INIT_DEF_KEYWORD);
	if (skill === null) {
		return damage;
	}

	if (!StrenkInitDefControl.isReductionActive(passive)) {
		return damage;
	}

	reduce = DEFAULT_DAMAGE_REDUCE;
	if (typeof skill.custom.damageReduce === 'number') {
		reduce = skill.custom.damageReduce;
	}

	damage -= reduce;
	if (damage < DefineControl.getMinDamage()) {
		damage = DefineControl.getMinDamage();
	}

	return damage;
};

})();
