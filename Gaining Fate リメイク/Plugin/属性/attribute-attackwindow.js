//戦闘前ウィンドウに属性による威力上昇(↑)or低下(↓)を表示

(function() {

// 喜怒哀楽の相性判定
var _getEmotionAffinity = function(attackerType, defenderType) {
	// 名前ベースでタイプを取得し直す必要はないため、タイプ番号のまま判定
	// マップ: 喜→怒, 怒→哀, 哀→楽, 楽→喜 が「有利」
	// 逆は「不利」
	var nameA = AttributeControl.getName(attackerType);
	var nameD = AttributeControl.getName(defenderType);
	var isEmotion = function(n){ return n === '喜' || n === '怒' || n === '哀' || n === '楽'; };
	if (!isEmotion(nameA) || !isEmotion(nameD)) return 0;
	var advantage = {
		'喜': '怒',
		'怒': '哀',
		'哀': '楽',
		'楽': '喜'
	};
	if (advantage[nameA] === nameD) return 1; // 有利
	// 不利(相手が自分に有利)
	if (advantage[nameD] === nameA) return -1;
	return 0;
};

var alias1 = AttackChecker.getAttackStatusInternal;
AttackChecker.getAttackStatusInternal = function(unit, weapon, targetUnit) {
	var arr = alias1.call(this, unit, weapon, targetUnit);
	arr[3] = AttributeControl.checkMagnification(unit, targetUnit);
	// 喜怒哀楽の相性(有利=1/不利=-1/その他=0)を追加格納
	var atkType = AttributeControl.getUnitAttackType(unit);
	var defType = AttributeControl.getUnitAttackType(targetUnit);
	arr[4] = _getEmotionAffinity(atkType, defType);
	return arr;
};

var alias2 = StatusRenderer.drawAttackStatus;
StatusRenderer.drawAttackStatus = function(x, y, arr, color, font, space) {
	var i, text, pic, width, height;
	var length = this._getTextLength ? this._getTextLength() : 35;
	var numberSpace = DefineControl.getNumberSpace();
	var buf = ['attack_capacity', 'hit_capacity', 'critical_capacity'];

	// 喜怒哀楽の相性で色を決定 (0=通常, 有利=緑, 不利=赤)
	var emo = arr[4] || 0;
	var colorIndex = 0;
	if (emo === 1) {
		colorIndex = 2; // 緑(想定)
	}
	else if (emo === -1) {
		colorIndex = 1 // 赤(想定)
	}

	// ラベル + 数値の再描画（元実装準拠）
	for (i = 0; i < 3; i++) {
		text = root.queryCommand(buf[i]);
		TextRenderer.drawKeywordText(x, y, text, length, color, font);
		x += 28 + numberSpace;
		
		if (arr[i] >= 0) {
			if (colorIndex === 0) {
				NumberRenderer.drawNumber(x, y, arr[i]);
			}
			else {
				NumberRenderer.drawNumberColor(x, y, arr[i], colorIndex, 255);
			}
		}
		else {
			TextRenderer.drawSignText(x - 5, y, StringTable.SignWord_Limitless);
		}
		
		x += space;
	}

	// 上昇/低下アイコンは従来通り表示
	var check = arr[3];
	if(check !== 0) {
		pic = root.queryUI('parameter_risecursor');
		width = UIFormat.RISECURSOR_WIDTH / 2;
		height = UIFormat.RISECURSOR_HEIGHT / 2;
		
		if (pic !== null) {
			if(check === 1) {
				pic.drawParts(x- space*3 + 43, y, width * 1, 0, width-2, height);
			}
			else if(check === -1) {
				pic.drawParts(x- space*3 + 43, y, width * 1, height * 1, width-2, height);
			}
		}
	}
};

})();