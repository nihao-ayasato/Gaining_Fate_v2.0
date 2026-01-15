/*--------------------------------------------------------------------------
聖戦のスキル再現

◆作者：F-man

◆利用規約
・SRPGStudio以外の使用はＮＧ
　公式の利用規約「http://srpgstudio.com/guide/rules.html」に準じております
・素材の使用は自己責任
・報告は任意
　あると個人的にうれしい
・商用非商用R18作品の利用おｋ
　ただし政治・宗教活動目的に使うのはＮＧ
・素材の名前をかえるのおｋ　ただし作者を騙って再配布するのはＮＧ
　素材名被ってたらゴメス
・改変加工おｋ
　ガンガンやろうぜ　
・改変加工からの配布おｋ。　ただし作者「F-man」の素材である事の旨を入れる事

※３行で説明
「公式の利用規約を守ってかつ、
　政治・宗教活動以外の目的であれば
　責任とらんけど良識の範囲で自由に使ってね」

◆使用方法
１．対象の支援スキルのカスタムパラメータに「hp_pray:true」を入れる
　　スキル効果で設定した値×(11-現在HP)分増える仕組み　※HP11以上の場合は発揮しない

　　対象を「自身」にして回避値を10にすれば原作の祈りと同様の効果になる
　　
　　また、対象を全域、指定範囲にすれば自身以外のユニットに効果を与えるので
　　ピンチになると周囲のユニットが強くなる嫌がらせ敵とか、
　　味方のお嬢様がピンチになると周りの護衛がパワーアップする様な表現も可能
　　

２．カスタムスキルのキーワードに「Pray」を入れる
　　(11-現在HP)×10 だけ回避が直接増える仕組み　※HP11以上の場合は発揮しない

１と２の違い
１は支援効果の補正、２は自身の回避力として扱われるので
コンフィグにある「AIが支援効果を考慮して行動する」にチェックを入れないなら１の効果を無視して行動するので
支援効果込みで回避が100以上になっても通常の回避率が100未満なら敵は後者と解釈して攻撃してくる　※実質命中 0%でも
　　
--------------------------------------------------------------------------*/
(function() {
// カスタムワードの定義
var PrayWord_1 = 'Pray';
//--------------------------------------
// AbilityCalculatorクラス
//--------------------------------------
	//回避率　計算
	var alias1 = AbilityCalculator.getAvoid;
	AbilityCalculator.getAvoid = function(unit) {
		var avoid, terrain;
		var weapon = ItemControl.getEquippedWeapon(unit);
		var cls = unit.getClass();

		avoid = alias1.call(this, unit);
		// ユニットが祈りを持っている場合　
		if( SkillControl.getPossessionCustomSkill(unit, PrayWord_1) != null ) {
			if(unit.getHp() < 11)
			avoid += 10*(11 - unit.getHp() );
		}		
		// パラメータが 0以下なら 0にする
		if(avoid < 0){
			avoid = 0;
		}
		return avoid;
	}


//--------------------------------------
// SupportCalculatorクラス
//--------------------------------------
	var alias11 = SupportCalculator._checkSkillStatus;
	SupportCalculator._checkSkillStatus = function(unit, targetUnit, isSelf, totalStatus) {
		var i, skill, isSet, indexArray;
		var arr = SkillControl.getDirectSkillArray(unit, SkillType.SUPPORT, '');
		var count = arr.length;

		alias11.call(this, unit, targetUnit, isSelf, totalStatus);
		for (i = 0; i < count; i++) {
			skill = arr[i].skill;
			isSet = false;
			
			if (isSelf) {
				if (skill.getRangeType() === SelectionRangeType.SELFONLY) {
					isSet = true;
				}
			}
			else {
				if (skill.getRangeType() === SelectionRangeType.ALL) {
					// 「全域」の場合は、常に支援が有効
					isSet = true;
				}
				else if (skill.getRangeType() === SelectionRangeType.MULTI) {
					indexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, skill.getRangeValue());
					// 「指定範囲」の場合は、indexArray内の位置にunitが存在しているか調べる
					isSet = IndexArray.findUnit(indexArray, targetUnit);
				}
			}
			
			if (isSet && this._isSupportable(unit, targetUnit, skill) && skill.custom.hp_pray) {
				this._subStatus(unit,totalStatus, skill.getSupportStatus());
				this._addStatus2(unit,totalStatus, skill.getSupportStatus());
			}
		}
	}
	//祈り効果用　加算
	SupportCalculator._addStatus2 = function(unit, totalStatus, supportStatus) {
		var value = 11 - unit.getHp();
		if(value > 0){
			totalStatus.powerTotal += value * supportStatus.getPower();
			totalStatus.defenseTotal += value *  supportStatus.getDefense();
			totalStatus.hitTotal += value *  supportStatus.getHit();
			totalStatus.avoidTotal += value *  supportStatus.getAvoid();
			totalStatus.criticalTotal += value *  supportStatus.getCritical();
			totalStatus.criticalAvoidTotal += value *  supportStatus.getCriticalAvoid();
		}
	}
	//祈り効果用の加算が　alias化した元の関数で足されてしまった分を減らす
	SupportCalculator._subStatus = function(unit, totalStatus, supportStatus) {
		totalStatus.powerTotal -=supportStatus.getPower();
		totalStatus.defenseTotal -=supportStatus.getDefense();
		totalStatus.hitTotal -=supportStatus.getHit();
		totalStatus.avoidTotal -=supportStatus.getAvoid();
		totalStatus.criticalTotal -=supportStatus.getCritical();
		totalStatus.criticalAvoidTotal -=supportStatus.getCriticalAvoid();
	}
})();
