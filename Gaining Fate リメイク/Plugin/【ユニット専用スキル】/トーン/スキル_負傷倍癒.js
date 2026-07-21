/*--------------------------------------------------------------------------

  トーン専用スキル「負傷倍癒」

  自分のHPがダメージを受けている（最大HP未満）とき、
  杖で他ユニットを回復する量が倍増する。

  使用方法:
  1. データベースでスキルを作成し、種類を「カスタム」にする
  2. キーワードに [Tone_WandBoost] を設定する
  3. 対象ユニット（トーン）にスキルを所持させる

  備考:
  ・杖の使用者（トーン）がスキルを所持している必要があります
  ・トーン自身のHPが最大未満のときのみ発動します
  ・杖（isWand）による回復のみ対象です（通常の回復アイテムは対象外）
  ・全回復タイプの杖は既に最大まで回復するため、見た目上の変化はありません
  ・回復量予測表示にも反映されます

  カスタムパラメータ（任意）:
  {
      rate: 2   // 倍率（未指定時は2）
  }

--------------------------------------------------------------------------*/

(function() {

var TONE_WAND_BOOST_KEYWORD = 'Tone_WandBoost';
var DEFAULT_RATE = 2;

var alias1 = Calculator.calculateRecoveryItemPlus;
Calculator.calculateRecoveryItemPlus = function(unit, targetUnit, item) {
	var plus = alias1.call(this, unit, targetUnit, item);
	var skill, rate, recoveryInfo, recoveryValue, recoveryType;

	if (!item.isWand()) {
		return plus;
	}

	skill = SkillControl.getPossessionCustomSkill(unit, TONE_WAND_BOOST_KEYWORD);
	if (skill === null) {
		return plus;
	}

	// 使用者のHPが最大のときは発動しない
	if (unit.getHp() >= ParamBonus.getMhp(unit)) {
		return plus;
	}

	recoveryInfo = ToneWandBoostControl.getRecoveryInfo(item);
	if (recoveryInfo === null) {
		return plus;
	}

	recoveryType = recoveryInfo.getRecoveryType();
	if (recoveryType === RecoveryType.MAX) {
		return plus;
	}

	rate = DEFAULT_RATE;
	if (typeof skill.custom.rate === 'number') {
		rate = skill.custom.rate;
	}

	recoveryValue = recoveryInfo.getRecoveryValue();

	// (回復量 + plus) * rate になるよう plus を調整する
	// 最終値 = recoveryValue + newPlus = (recoveryValue + plus) * rate
	// newPlus = (recoveryValue + plus) * rate - recoveryValue
	return (recoveryValue + plus) * rate - recoveryValue;
};

var ToneWandBoostControl = {
	getRecoveryInfo: function(item) {
		var itemType = item.getItemType();

		if (itemType === ItemType.RECOVERY) {
			return item.getRecoveryInfo();
		}
		if (itemType === ItemType.ENTIRERECOVERY) {
			return item.getEntireRecoveryInfo();
		}

		return null;
	}
};

})();
