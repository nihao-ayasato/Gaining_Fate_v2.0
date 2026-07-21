/*--------------------------------------------------------------------------

  シラヌイ専用スキル「乱気」

  戦闘時、HP・移動力以外のいずれかのステータスがランダムで-1または+1される。
  （力／魔力／技／速さ／幸運／守備／魔防）

  戦闘開始時に、変化した能力と増減を情報ウィンドウで表示します。

  使用方法:
  1. データベースでスキルを作成し、種類を「カスタム」にする
  2. キーワードに [Shiranui_Chaos] を設定する
  3. 対象ユニット（シラヌイ）にスキルを所持させる

  備考:
  ・戦闘に入る直前に抽選され、その戦闘中のみ有効です
  ・戦闘予測時点では未確定のため、予測には反映されません
  ・両者がスキルを所持している場合は、それぞれ独立して抽選されます

  カスタムパラメータ（任意）:
  {
      value: 1   // 変動量の絶対値（未指定時は1）
  }

--------------------------------------------------------------------------*/

(function() {

var SHIRANUI_CHAOS_KEYWORD = 'Shiranui_Chaos';
var DEFAULT_VALUE = 1;

var SHIRANUI_PARAM_LIST = [
	ParamType.POW,
	ParamType.MAG,
	ParamType.SKI,
	ParamType.SPD,
	ParamType.LUK,
	ParamType.DEF,
	ParamType.MDF
];

var ShiranuiChaosControl = {
	isSkillActive: function(unit) {
		return SkillControl.getPossessionCustomSkill(unit, SHIRANUI_CHAOS_KEYWORD) !== null;
	},

	getMod: function(unit) {
		return unit.custom.tmpShiranuiChaos || null;
	},

	clearMod: function(unit) {
		if (unit !== null && typeof unit.custom !== 'undefined') {
			delete unit.custom.tmpShiranuiChaos;
		}
	},

	clearBattleMods: function(unitSrc, unitDest) {
		this.clearMod(unitSrc);
		this.clearMod(unitDest);
	},

	applyBattleMods: function(unitSrc, unitDest) {
		this.clearBattleMods(unitSrc, unitDest);
		this._rollAndSet(unitSrc);
		this._rollAndSet(unitDest);
	},

	getBonus: function(unit, paramType) {
		var mod = this.getMod(unit);
		if (mod === null || mod.paramType !== paramType) {
			return 0;
		}
		return mod.value;
	},

	buildNoticeMessages: function(unitSrc, unitDest) {
		var messages = [];
		var text;

		text = this._createNoticeText(unitSrc);
		if (text !== null) {
			messages.push(text);
		}

		text = this._createNoticeText(unitDest);
		if (text !== null) {
			messages.push(text);
		}

		return messages;
	},

	_rollAndSet: function(unit) {
		var skill, absValue, paramType, sign, index;

		if (unit === null || !this.isSkillActive(unit)) {
			return;
		}

		skill = SkillControl.getPossessionCustomSkill(unit, SHIRANUI_CHAOS_KEYWORD);
		absValue = DEFAULT_VALUE;
		if (typeof skill.custom.value === 'number') {
			absValue = skill.custom.value;
		}

		index = root.getRandomNumber() % SHIRANUI_PARAM_LIST.length;
		paramType = SHIRANUI_PARAM_LIST[index];
		sign = (root.getRandomNumber() % 2 === 0) ? 1 : -1;

		unit.custom.tmpShiranuiChaos = {
			paramType: paramType,
			value: absValue * sign
		};
	},

	_createNoticeText: function(unit) {
		var mod, paramName;

		if (unit === null) {
			return null;
		}

		mod = this.getMod(unit);
		if (mod === null) {
			return null;
		}

		paramName = ParamGroup.getParameterName(ParamGroup.getParameterIndexFromType(mod.paramType));

		if (mod.value > 0) {
			return unit.getName() + '：' + paramName + ' ' + mod.value + ' Up！';
		}

		return unit.getName() + '：' + paramName + ' ' + Math.abs(mod.value) + ' Down...';
	}
};

// 戦闘シミュレーション開始前に抽選（命中・必殺・ダメージ計算に反映）
var alias1 = NormalAttackOrderBuilder._startVirtualAttack;
NormalAttackOrderBuilder._startVirtualAttack = function() {
	ShiranuiChaosControl.applyBattleMods(this._attackInfo.unitSrc, this._attackInfo.unitDest);
	alias1.call(this);
};

// RealBonusへ加算
var aliasGetStr = RealBonus.getStr;
RealBonus.getStr = function(unit) {
	return aliasGetStr.call(this, unit) + ShiranuiChaosControl.getBonus(unit, ParamType.POW);
};

var aliasGetMag = RealBonus.getMag;
RealBonus.getMag = function(unit) {
	return aliasGetMag.call(this, unit) + ShiranuiChaosControl.getBonus(unit, ParamType.MAG);
};

var aliasGetSki = RealBonus.getSki;
RealBonus.getSki = function(unit) {
	return aliasGetSki.call(this, unit) + ShiranuiChaosControl.getBonus(unit, ParamType.SKI);
};

var aliasGetSpd = RealBonus.getSpd;
RealBonus.getSpd = function(unit) {
	return aliasGetSpd.call(this, unit) + ShiranuiChaosControl.getBonus(unit, ParamType.SPD);
};

var aliasGetLuk = RealBonus.getLuk;
RealBonus.getLuk = function(unit) {
	return aliasGetLuk.call(this, unit) + ShiranuiChaosControl.getBonus(unit, ParamType.LUK);
};

var aliasGetDef = RealBonus.getDef;
RealBonus.getDef = function(unit) {
	return aliasGetDef.call(this, unit) + ShiranuiChaosControl.getBonus(unit, ParamType.DEF);
};

var aliasGetMdf = RealBonus.getMdf;
RealBonus.getMdf = function(unit) {
	return aliasGetMdf.call(this, unit) + ShiranuiChaosControl.getBonus(unit, ParamType.MDF);
};

// 戦闘開始時に変化内容を表示
var ShiranuiChaosNoticeFlowEntry = defineObject(BaseFlowEntry,
{
	_infoWindow: null,
	_messages: null,
	_index: 0,

	enterFlowEntry: function(coreAttack) {
		var attackInfo;

		if (this.isFlowSkip() || coreAttack.isBattleCut()) {
			return EnterResult.NOTENTER;
		}

		attackInfo = coreAttack.getAttackFlow().getAttackInfo();
		this._messages = ShiranuiChaosControl.buildNoticeMessages(attackInfo.unitSrc, attackInfo.unitDest);
		if (this._messages.length === 0) {
			return EnterResult.NOTENTER;
		}

		this._index = 0;
		this._infoWindow = createWindowObject(InfoWindow, this);
		this._infoWindow.setInfoMessageAndType(this._messages[this._index], InfoWindowType.INFORMATION);
		return EnterResult.OK;
	},

	moveFlowEntry: function() {
		if (this._infoWindow.moveWindow() !== MoveResult.CONTINUE) {
			this._index++;
			if (this._index >= this._messages.length) {
				return MoveResult.END;
			}
			this._infoWindow.setInfoMessageAndType(this._messages[this._index], InfoWindowType.INFORMATION);
		}

		return MoveResult.CONTINUE;
	},

	drawFlowEntry: function() {
		var x = LayoutControl.getCenterX(-1, this._infoWindow.getWindowWidth());
		var y = LayoutControl.getCenterY(-1, this._infoWindow.getWindowHeight());
		this._infoWindow.drawWindow(x, y);
	}
}
);

var alias2 = AttackFlow._pushFlowEntriesStart;
AttackFlow._pushFlowEntriesStart = function(straightFlow) {
	alias2.call(this, straightFlow);
	straightFlow.pushFlowEntry(ShiranuiChaosNoticeFlowEntry);
};

// 戦闘終了後に補正をクリア
var alias3 = AttackFlow._pushFlowEntriesEnd;
AttackFlow._pushFlowEntriesEnd = function(straightFlow) {
	alias3.call(this, straightFlow);
	straightFlow.pushFlowEntry(ShiranuiChaosClearFlowEntry);
};

var ShiranuiChaosClearFlowEntry = defineObject(BaseFlowEntry,
{
	enterFlowEntry: function(coreAttack) {
		var attackInfo = coreAttack.getAttackFlow().getAttackInfo();
		ShiranuiChaosControl.clearBattleMods(attackInfo.unitSrc, attackInfo.unitDest);
		return EnterResult.NOTENTER;
	}
}
);

})();
