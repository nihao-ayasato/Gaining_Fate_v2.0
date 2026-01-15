
/*-----------------------------------------------------------------------------------------------
  
  範囲攻撃アイテムのカスタムパラメータ未設定時のデフォルト設定
    
  作成者:
  o-to
  
  更新履歴:
  2020/04/28:
  新規作成

-----------------------------------------------------------------------------------------------*/
(function() {

// カスパラ未設定時のデフォルト設定
OT_EffectRangeItemDefault = {
	  DamageType          : 2			// 攻撃タイプ(1:物理、2:魔法、0:固定ダメージ)
	, MinRange            : 0			// 最小射程
	, EffectRange         : '0-1'		// 効果範囲
	, RangeType           : 0			// 射程の形
	, EffectRangeType     : 0			// 効果範囲の形
	, UnitReflection      : true		// 威力にユニットの能力加算
	, WeaponReflection    : false		// 威力に武器攻撃力加算
	, HitValue            : 70			// 攻撃タイプに設定した場合の命中率
	, RecoveryHitValue    : 100			// 回復タイプに設定した場合の命中率
	, HitReflectionUnit   : true		// 命中率に使用者の技×3を加算
	, HitReflectionWeapon : false		// 命中率に装備武器の命中値を加算
	, HitAvoid            : true		// 上記の命中率に対して対象の回避値で減算するか
	, RecoveryHitAvoid    : false		// 上記の命中率に対して対象の回避値で減算するか(回復系にした場合のデフォルト)
	, Indifference        : false		// 無差別攻撃
	, SupportAtk          : true		// 威力にユニット能力が反映される場合に支援効果による攻撃補正が反映
	, SupportHit          : true		// 命中率に技補正が入る場合に支援効果による命中補正が反映
	, SupportDef          : true		// 攻撃タイプが物理か魔法の場合に支援効果による防御補正が反映
	, SupportAgi          : true		// 命中率に対して対象の回避値で減算がされる場合に支援効果による回避補正も反映
	, EXPMagnification    : 0.75		// 経験値倍率、取得経験値は効果範囲内にいる対象ユニット数が多いほど増加し、また対象の強さに応じて増減する
	, GetEXP              : 10			// 使用時に必ず入る経験値の量
	, SoundDuplicate      : false		// ヒット時等のサウンド重複
};

// 旧バージョンのデフォルト値
OT_EffectRangeItemDefaultOld = {
	  DamageType          : 0			// 攻撃タイプ(1:物理、2:魔法、0:固定ダメージ)
	, MinRange            : 0			// 最小射程
	, EffectRange         : '0-0'		// 効果範囲
	, RangeType           : 0			// 射程の形
	, EffectRangeType     : 0			// 効果範囲の形
	, UnitReflection      : false		// 威力にユニットの能力加算
	, WeaponReflection    : false		// 威力に武器攻撃力加算
	, HitValue            : 100			// 命中率
	, RecoveryHitValue    : 100			// 回復タイプに設定した場合の命中率
	, HitReflectionUnit   : false		// 命中率に使用者の技×3を加算
	, HitReflectionWeapon : false		// 命中率に装備武器の命中値を加算
	, HitAvoid            : false		// 上記の命中率に対して対象の回避値で命中率を減算
	, RecoveryHitAvoid    : false		// 上記の命中率に対して対象の回避値で減算するか(回復系にした場合のデフォルト)
	, Indifference        : false		// 無差別攻撃
	, SupportAtk          : true		// 威力にユニット能力が反映される場合に支援効果による攻撃補正が反映
	, SupportHit          : true		// 命中率に技補正が入る場合に支援効果による命中補正が反映
	, SupportDef          : true		// 攻撃タイプが物理か魔法の場合に支援効果による防御補正が反映
	, SupportAgi          : true		// 命中率に対して対象の回避値で減算がされる場合に支援効果による回避補正も反映
	, EXPMagnification    : 1.0			// 経験値倍率、取得経験値は効果範囲内にいる対象ユニット数が多いほど増加し、また対象の強さに応じて増減する
	, GetEXP              : 0			// 使用時に必ず入る経験値の量
	, SoundDuplicate      : true		// ヒット時等のサウンド重複
};

//旧バージョンのデフォルト値を使いたい場合はOT_EffectRangeItemDefaultの中身を書き換えるか
//↓のコメントアウト(//の部分)を消してください。
//OT_EffectRangeItemDefault = OT_EffectRangeItemDefaultOld;

})();

