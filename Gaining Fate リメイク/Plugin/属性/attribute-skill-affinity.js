/*
--------------------------------------------------------------------------------
スキルに属性を付与し、相性に応じて次を「加算」できる拡張。

- 与ダメージ (attackerDamage)
- 命中率 (attackerHit)
- クリティカル率 (attackerCritical)
- 被ダメージ (defenderDamage)
- 回避率 (defenderAvoid)
- クリティカル回避率 (defenderCriticalAvoid)

前提:
- 同フォルダの attribute-main.js の AttributeControl を利用します。
- 属性タイプは AttributeControl.getUnitAttackType(unit) で判定されます
  (ユニット/クラス/武器/アイテム/スキル/地形/ステートを考慮)。

設定方法:
下記 AFFINITY_TABLE を編集してください。インデックスは属性タイプ番号です。
未定義は0として扱われ、加算は行われません。

例: 火(1)で水(2)に強い場合に、与ダメ+3, 命中+10 したいなら
AFFINITY_TABLE[1][2] = { attackerDamage: 3, attackerHit: 10 };

作成: you
--------------------------------------------------------------------------------
*/

(function() {
	// 行: 攻撃側の属性タイプ, 列: 防御側の属性タイプ
	// 値はすべて「加算」値。省略時は0。
	// キー:
	//  attackerDamage, attackerHit, attackerCritical,
	//  defenderDamage, defenderAvoid, defenderCriticalAvoid
	var AFFINITY_TABLE = [];

	// 初期化: 既存の属性数に合わせて0埋め
	var _initAffinityTable = function() {
		var i, j, n = AttributeControl.getCount();
		for (i = 0; i < n; i++) {
			if (!AFFINITY_TABLE[i]) AFFINITY_TABLE[i] = [];
			for (j = 0; j < n; j++) {
				if (!AFFINITY_TABLE[i][j]) AFFINITY_TABLE[i][j] = {};
			}
		}
	};

	// 名前からタイプ番号を引くヘルパ
	var _getTypeByName = function(name) {
		var i, n = AttributeControl.getCount();
		for (i = 0; i < n; i++) {
			if (AttributeControl.getName(i) === name) return i;
		}
		return -1;
	};

	// ユニットが特定のスキルIDを持っているかチェック
	var _hasSkill = function(unit, skillId) {
		if (!unit) return false;
		var weapon = ItemControl.getEquippedWeapon(unit);
		var list = SkillControl.getSkillMixArray(unit, weapon, -1, '');
		var i, count = list.length;
		for (i = 0; i < count; i++) {
			if (list[i].skill.getId() === skillId) {
				return true;
			}
		}
		return false;
	};

	// 感情属性スキルの倍率を取得
	var _getEmotionSkillMultiplier = function(unit, emotionType) {
		// スキルIDと感情属性のマッピング
		// 喜: typeJoy, 怒: typeAnger, 哀: typeSorrow, 楽: typePleasure
		var typeJoy = _getTypeByName('喜');
		var typeAnger = _getTypeByName('怒');
		var typeSorrow = _getTypeByName('哀');
		var typePleasure = _getTypeByName('楽');
		
		var multiplier = 1.0;
		
		// 2倍スキル
		if (emotionType === typeJoy && _hasSkill(unit, 44)) multiplier = 2.0;
		if (emotionType === typeAnger && _hasSkill(unit, 45)) multiplier = 2.0;
		if (emotionType === typeSorrow && _hasSkill(unit, 46)) multiplier = 2.0;
		if (emotionType === typePleasure && _hasSkill(unit, 47)) multiplier = 2.0;
		
		// 半分スキル
		if (emotionType === typeJoy && _hasSkill(unit, 48)) multiplier = 0.5;
		if (emotionType === typeAnger && _hasSkill(unit, 49)) multiplier = 0.5;
		if (emotionType === typeSorrow && _hasSkill(unit, 50)) multiplier = 0.5;
		if (emotionType === typePleasure && _hasSkill(unit, 51)) multiplier = 0.5;
		
		return multiplier;
	};

	// ユーティリティ: 相性オブジェクト取得 (存在しないキーは0で扱う)
	var _getAffinity = function(attackerType, defenderType, attackerUnit) {
		var row = AFFINITY_TABLE[attackerType] || [];
		var baseAff = row[defenderType] || {};
		
		// 感情属性スキルの倍率を適用
		if (attackerUnit) {
			var multiplier = _getEmotionSkillMultiplier(attackerUnit, attackerType);
			if (multiplier !== 1.0) {
				// 倍率を適用した新しいオブジェクトを作成
				var adjustedAff = {};
				var keys = ['attackerDamage', 'attackerHit', 'attackerCritical', 
				           'defenderDamage', 'defenderAvoid', 'defenderCriticalAvoid'];
				var i, key;
				for (i = 0; i < keys.length; i++) {
					key = keys[i];
					if (typeof baseAff[key] === 'number') {
						adjustedAff[key] = Math.floor(baseAff[key] * multiplier);
					}
				}
				return adjustedAff;
			}
		}
		
		return baseAff;
	};

	// 攻撃側/防御側のタイプを取得
	var _getTypes = function(active, passive) {
		var atkType = 0;
		var defType = 0;
		if (typeof AttributeControl !== 'undefined' && AttributeControl.getUnitAttackType) {
			atkType = AttributeControl.getUnitAttackType(active) || 0;
			defType = AttributeControl.getUnitAttackType(passive) || 0;
		}
		return { atkType: atkType, defType: defType };
	};

	// ここから各種計算へフックして加算

	// 与ダメージ加算/被ダメージ加算は最終値確定直前の validValue で行う
	var _alias_DamageCalculator_validValue = DamageCalculator.validValue;
	DamageCalculator.validValue = function(active, passive, weapon, damage) {
		var t = _getTypes(active, passive);
		var aff = _getAffinity(t.atkType, t.defType, active);

		// 与ダメージ加算
		if (typeof aff.attackerDamage === 'number') {
			damage += aff.attackerDamage;
		}
		// 被ダメージ加算 (防御側にとっての被ダメージ増減)
		if (typeof aff.defenderDamage === 'number') {
			damage += aff.defenderDamage; // マイナスで軽減、プラスで増加
		}

		return _alias_DamageCalculator_validValue.call(this, active, passive, weapon, damage);
	};

	// 命中率: 攻撃側ボーナスを calculateSingleHit に、回避側ボーナスを calculateAvoid に加算
	var _alias_HitCalculator_calculateSingleHit = HitCalculator.calculateSingleHit;
	HitCalculator.calculateSingleHit = function(active, passive, weapon, totalStatus) {
		var value = _alias_HitCalculator_calculateSingleHit.call(this, active, passive, weapon, totalStatus);
		var t = _getTypes(active, passive);
		var aff = _getAffinity(t.atkType, t.defType, active);
		if (typeof aff.attackerHit === 'number') {
			value += aff.attackerHit;
		}
		return value;
	};

	var _alias_HitCalculator_calculateAvoid = HitCalculator.calculateAvoid;
	HitCalculator.calculateAvoid = function(active, passive, weapon, totalStatus) {
		// 注意: active=攻撃側, passive=回避計算対象(防御側)
		var value = _alias_HitCalculator_calculateAvoid.call(this, active, passive, weapon, totalStatus);
		var t = _getTypes(active, passive);
		var aff = _getAffinity(t.atkType, t.defType, active);
		if (typeof aff.defenderAvoid === 'number') {
			value += aff.defenderAvoid;
		}
		return value;
	};

	// クリティカル率/回避率
	var _alias_CriticalCalculator_calculateSingleCritical = CriticalCalculator.calculateSingleCritical;
	CriticalCalculator.calculateSingleCritical = function(active, passive, weapon, totalStatus) {
		var value = _alias_CriticalCalculator_calculateSingleCritical.call(this, active, passive, weapon, totalStatus);
		var t = _getTypes(active, passive);
		var aff = _getAffinity(t.atkType, t.defType, active);
		if (typeof aff.attackerCritical === 'number') {
			value += aff.attackerCritical;
		}
		return value;
	};

	var _alias_CriticalCalculator_calculateCriticalAvoid = CriticalCalculator.calculateCriticalAvoid;
	CriticalCalculator.calculateCriticalAvoid = function(active, passive, weapon, totalStatus) {
		// 注意: active=攻撃側, passive=防御側(回避計算対象)
		var value = _alias_CriticalCalculator_calculateCriticalAvoid.call(this, active, passive, weapon, totalStatus);
		var t = _getTypes(active, passive);
		var aff = _getAffinity(t.atkType, t.defType, active);
		if (typeof aff.defenderCriticalAvoid === 'number') {
			value += aff.defenderCriticalAvoid;
		}
		return value;
	};

	// 実行時にテーブルを属性数へ合わせて初期化
	_initAffinityTable();

	// --- 感情属性の相性設定 ---
	var typeJoy = _getTypeByName('喜');
	var typeAnger = _getTypeByName('怒');
	var typeSorrow = _getTypeByName('哀');
	var typePleasure = _getTypeByName('楽');

	// 有利な相性のボーナス（攻撃側のみ）
	var advantageBonus = {
		attackerDamage: 2,
		attackerHit: 10,
		attackerCritical: 10
	};

	// 不利な相性のペナルティ（攻撃側のみ）
	var disadvantagePenalty = {
		attackerDamage: -2,
		attackerHit: -10,
		attackerCritical: -10
	};

	// 喜→怒, 怒→哀, 哀→楽, 楽→喜 に有利
	if (typeJoy >= 0 && typeAnger >= 0) {
		AFFINITY_TABLE[typeJoy][typeAnger] = advantageBonus;
		AFFINITY_TABLE[typeAnger][typeJoy] = disadvantagePenalty;
	}
	if (typeAnger >= 0 && typeSorrow >= 0) {
		AFFINITY_TABLE[typeAnger][typeSorrow] = advantageBonus;
		AFFINITY_TABLE[typeSorrow][typeAnger] = disadvantagePenalty;
	}
	if (typeSorrow >= 0 && typePleasure >= 0) {
		AFFINITY_TABLE[typeSorrow][typePleasure] = advantageBonus;
		AFFINITY_TABLE[typePleasure][typeSorrow] = disadvantagePenalty;
	}
	if (typePleasure >= 0 && typeJoy >= 0) {
		AFFINITY_TABLE[typePleasure][typeJoy] = advantageBonus;
		AFFINITY_TABLE[typeJoy][typePleasure] = disadvantagePenalty;
	}

})();



