
/*--------------------------------------------------------------------------
  
  命中率計算式変更（武器熟練度S時のボーナス有り）
  命中率クラスボーナス
  回避率計算式変更
  回避率クラスボーナス
  必殺率計算式変更（武器熟練度S時のボーナス有り）
  必殺率クラスボーナス
  経験値計算式変更
  
  nobu9氏作成の「singleton-calculator-hit-avoid-crt-exp」を大元として、
  それに熟練度S補正について追記した形です。
  
↓以下、nobu9氏作成の「singleton-calculator-hit-avoid-crt-exp」の記述です。
//【使い方】
//Pluginフォルダにコピー
//補正関連はクラスのカスタムパラメータに
//{hitp:10} 命中率補正
//{crt:10} 必殺率補正
//{avo:10} 回避率補正
//などと書き込む
//まとめてなら{hitp:10, crt:10, avo:10}といった感じ
//
//【混ぜるな危険】
//Pluginフォルダに命中率・回避率・必殺率・経験値計算式を変更する
//ほかのスクリプトを入れないこと
//またはコメントアウトすること
//（スクリプトに自信のある方は除く）
↑ここまでコピペです。

  【統合Calとの併用に関して】
  統合Calと併用する場合、そのままだとカスパラhitp, crt, avoの効果が倍になってしまいます。
  効果が倍にならないようにしたい時は、
  本ソースの『var JUKURENDO_USE_CUSTOM_HIT_CRT_AVO = true;』の部分を
  『var JUKURENDO_USE_CUSTOM_HIT_CRT_AVO = false;』に書き換えてください。

  【注意】
  「武器レベル、武器熟練度実装」フォルダ内のスクリプト群と併用してください。
  さもないと、命中、必殺の計算がバグります。
  これは、命中、必殺の計算に「武器ランクS補正」を加えている為です。
  ランクS補正の部分をコメントアウトすれば、単品で使えます。
  
  
  作成者: CB
  
  更新履歴:
  2015/07/06 作成
  2015/08/05 武器レベルS判定の際、
             クラスボーナス、アイテムボーナスが無視されていた問題を修正
  2015/12/24 統合Calと併用した場合、カスパラhitp, crt, avoの効果が倍になってしまう点への対策処理を追加
             命中率とクリティカルの算出で、除算使用時に小数点以下を切り捨てていなかったバグを修正
  2016/07/26 1.085対応（作者じゃないけど）
  2018/02/13 1.175対応（作者じゃないけど）
  
--------------------------------------------------------------------------*/

// カスパラのhitp,avo,crtの有効／無効判定
var JUKURENDO_USE_CUSTOM_HIT_CRT_AVO = true;	// （true:有効、false:無効）


AbilityCalculator.getHit = function(unit, weapon) {
		var cls = unit.getClass();
		var hitb = cls.custom.hitp;
		var value;
		
		// カスパラのhitp,avo,crtが無効ならボーナスを0にする
		if( !JUKURENDO_USE_CUSTOM_HIT_CRT_AVO ) {
			hitb = 0;
		}
		
//クラスのカスタムパラメータのhitpに
//数値が入っていなかったら上の式，
//数値が入っていたら下の式で計算
//（!== 右側でない場合という意味）

		if (typeof cls.custom.hitp !== 'number') {
			// 武器の命中率 + 技 * 2 + 運 * 0.5
			value = weapon.getHit() + RealBonus.getSki(unit) * 2 + Math.floor( (RealBonus.getLuk(unit) * 0.5) );
		}
		else{
			value = weapon.getHit() + RealBonus.getSki(unit) * 2 + Math.floor( (RealBonus.getLuk(unit) * 0.5) ) + hitb;
		}
		
		// 武器の熟練度が251(ランクS)の場合、Sランク補正をつける
		if (AbilityCalculator.getJyukurendo(unit, weapon) >= 251) {
			value = value + 5;
		}
		
		return value;
	};


AbilityCalculator.getAvoid = function(unit) {
		var avoid, terrain;
		var cls = unit.getClass();
		var avob = cls.custom.avo;

		// カスパラのhitp,avo,crtが無効ならボーナスを0にする
		if( !JUKURENDO_USE_CUSTOM_HIT_CRT_AVO ) {
			avob = 0;
		}

		if (typeof cls.custom.avo !== 'number') {
		// 回避は、速さ * 2 + 運 + 地形情報
			avoid = RealBonus.getSpd(unit) * 2 + RealBonus.getLuk(unit);
		}
		else{
			avoid = RealBonus.getSpd(unit) * 2 + RealBonus.getLuk(unit) + avob;
		}

		// クラス系統が、地形情報を考慮するかどうか
		if (cls.getClassType().isTerrainBonusEnabled()) {
			terrain = PosChecker.getTerrainFromPos(unit.getMapX(), unit.getMapY());
			if (terrain !== null) {
				avoid += terrain.getAvoid();
			}
		}
		
		return avoid;
	};


AbilityCalculator.getCritical = function(unit, weapon) {
		var cls = unit.getClass();
		var clb = cls.custom.crt;
		var value;

		// カスパラのhitp,avo,crtが無効ならボーナスを0にする
		if( !JUKURENDO_USE_CUSTOM_HIT_CRT_AVO ) {
			clb = 0;
		}

		if (typeof cls.custom.crt !== 'number') {
		// 技/2 + 武器のクリティカル率
			value = Math.floor( (RealBonus.getSki(unit)/2) ) + weapon.getCritical();
		}
		else {
			value = Math.floor( (RealBonus.getSki(unit)/2) ) + weapon.getCritical() + clb;
		};
		
		// 武器の熟練度が251(ランクS)の場合、Sランク補正をつける
		if (AbilityCalculator.getJyukurendo(unit, weapon) >= 251) {
			value = value + 5;
		}
		return value;
	};

AbilityCalculator.getAgility = function(unit, weapon) {
		var agi, pow, value;
		var spd = RealBonus.getSpd(unit);
		
		// 通常、敏捷は速さと同一
		agi = spd;
		
		// 重さ表示が有効な場合
		if (DataConfig.isItemWeightDisplayable() && weapon !== null) {
			pow = ParamBonus.getStr(unit);
			// 重さ - 力
			value = weapon.getWeight() - pow;
			if (value > 0) {
				// 力が重さより低いため、その差分だけ敏捷を下げる
				agi -= value;
			}
		}
		
		return agi;
	};


// 1.175にてExperienceValueControlクラスが削除されたので無効化
/*
ExperienceValueControl._getNoDamageExperience = function(active, activeHp, activeDamageTotal, passive, passiveHp, passiveDamageTotal) {
		var exp = 1;
		// こちらがダメージを与えられなかったときは経験値1で固定
		return this._getValidExperience(exp);
	};
	
ExperienceValueControl._getVictoryExperience = function(active, activeHp, activeDamageTotal, passive, passiveHp, passiveDamageTotal) {
		var exp;
		var baseExp = this._getBaseExperience();
		var bonusExp = passive.getClass().getBonusExp();
		var lv = passive.getLv() - active.getLv();
		
		// ボーナス経験値がマイナスの場合は、勝利時に経験値を取得しない。
		// これは最終マップのリーダー撃破を想定したものである。
		if (bonusExp < 0) {
			return 0;
		}
		
		// 撃破時の経験値を固定にしているため、
		// クラスの追加経験値をそのまま返す。
		if (DataConfig.isFixedExperience()) {
			return this._getValidExperience(bonusExp);
		}

		// 相手を倒した場合の処理
		if (lv > 0) {
			exp = ((21 + lv) * 0.5) + (baseExp + lv);
			exp = Math.floor(exp);
		}
		else {
			exp = ((21 + lv) * 0.5) + (baseExp + lv);
			exp = Math.floor(exp);
		}
		
		// 相手がリーダー、サブリーダーの場合は経験値を加算
		exp += this._getBonusExperience(passive);
		
		// 相手のクラスの追加経験値を加算
		exp += bonusExp;
		
		// 撃破時の最低経験値は1
		if (exp < 1) {
			exp = 1;
		}
		
		return this._getValidExperience(exp);
	};
	
ExperienceValueControl._getNormalValue = function(active, activeHp, activeDamageTotal, passive, passiveHp, passiveDamageTotal) {
		var exp;
		var lv = passive.getLv() - active.getLv();
		// 	未撃破経験値の基本値は21
		
		exp = (21 + lv) * 0.5;
		exp = Math.floor(exp);
		if (exp < 1) {
			exp = 1;
		}
		
		return this._getValidExperience(exp);
	};
*/
