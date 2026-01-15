
/*--------------------------------------------------------------------------
  
  ユニットのステータスに武器毎の熟練度を追加します。GBA版FEの武器レベルのようなものです。
  公式で配布されている、熟練度を追加するスクリプトとは併用しないで下さい。
  
  使用方法:
  custom-item-weapnlevelと併用してください。
  
  ユニットのカスタムパラメータに{swd: 71, swdGrowthBonus: 80}のように設定します。
  (剣熟練度の初期値が71、成長値が80%の意味)
  
  剣熟練度ボーナスを持たせたいクラスのカスタムパラメータに{swd: 1, swdMax: 121}のように設定します。
  剣熟練度ボーナスを持たせたいクラスのカスタムパラメータに{swd: 31, swdMax:121}のように設定します。
  {swd: 1}  ユニットがこのクラスに属している場合に、剣熟練度が+31されます。
  {swdMax: 121}  ユニットがこのクラスに属している場合、剣熟練度の上限値が121になります(設定なしの場合251)。
  
  武器や道具のカスタムパラメータに{swd: 71}のように設定すると、以下の効果があります。
    武器　{swd: 71} この武器を"装備"している場合、剣熟練度+71。武器タイプによって変わります。初期値は0
    道具　{swd: 71} この道具を"所持"している場合、剣熟練度+71（同一種類の道具を複数所持しても効果は重複しません）

  ドーピングアイテムのカスタムパラメータに{swdDoping: 71}のように設定すると、以下の効果があります。
    ・このドーピングアイテムを使用すると、ユニットの剣熟練度に+71されます。
      以下のカスタムパラメータが使用可能です（XXには数値が入ります）
        剣熟練度のドーピング  　{swdDoping:XX}
        槍熟練度のドーピング  　{lncDoping:XX}
        斧熟練度のドーピング  　{axeDoping:XX}
        弓熟練度のドーピング  　{arwDoping:XX}
        魔法熟練度のドーピング　{mgcDoping:XX}

  熟練度を設定していない武器タイプについては、熟練度1として扱われます。
  (デフォルトでは武器レベルが1に設定されるので、カスタムパラメータwlvを渡していない武器は装備可能な状態)
  
  パラメータ名(getParameteNameのreturn値)は、対応する武器タイプの名前と同じにして下さい。
  unitmenu-weaponlevelwindowで、正しく熟練度を表示できなくなります。
  
  新たに武器熟練度を作成したい場合は、この内容をコピーして作って下さい。
  また、新たに武器熟練度を作成した場合は、edit_weapontype-caseの編集が必要です。
  
  作成者: CB
  
  更新履歴:
  2015/07/04 新規作成
  2015/10/05 ステータス画面で熟練度が表示されないよう修正（作者じゃないけど）
  2016/01/11 1.048対応（作者じゃないけど）
  2016/07/26 1.085対応（作者じゃないけど）
  2016/09/24 1.094対応（作者じゃないけど）
  2019/04/24 説明文を修正
  
  
--------------------------------------------------------------------------*/

(function() {

//剣熟練度の作成
// 既存の数値と一致しない値に設定
ParamType.SWD = 9000;

UnitParameter.SWD = defineObject(BaseUnitParameter,
{
	getParameterType: function() {
		return ParamType.SWD;
	},
	
	isParameterDisplayable: function(unitStatusType) {
		return false;
	},
	
	getUnitValue: function(unit) {
		var swd;
		
		if (typeof unit.custom.swd === 'number') {
			swd = unit.custom.swd;
		}
		else {
			swd = 1;
		}
		
		return swd;
	},
	
	setUnitValue: function(unit, value) {
		unit.custom.swd = value;
	},
	
	getParameterBonus: function(obj) {
		var swd;
		
		if (typeof obj.custom.swd === 'number') {
			swd = obj.custom.swd;
		}
		else {
			swd = 0;
		}
		
		return swd;
	},
	
	getGrowthBonus: function(obj) {
		var swd;
		
		if (typeof obj.custom.swdGrowthBonus === 'number') {
			swd = obj.custom.swdGrowthBonus;
		}
		else {
			swd = 0;
		}
		
		return swd;
	},
	
	getDopingParameter: function(obj) {
		var swd;
		
		if (typeof obj.custom !== 'object') {
			return 0;
		}
		
		if (typeof obj.custom.swdDoping === 'number') {
			swd = obj.custom.swdDoping;
		}
		else {
			swd = 0;
		}
		
		return swd;
	},
	
	getAssistValue: function(obj) {
		return 0;
	},
	
	getMaxValue: function(unit) {
		var swdMax;
		
		if (DataConfig.isClassLimitEnabled()) {
			if (typeof unit.getClass().custom.swdMax === 'number') {
				swdMax = unit.getClass().custom.swdMax;
			}
			else {
				swdMax = 251;
			}
		}
		else {
			if (typeof root.getMetaSession().global.swdMax === 'number') {
				swdMax = root.getMetaSession().global.swdMax;
			}
			else {
				swdMax = 251;
			}
		}
		
		return swdMax;
	},
	
	getMinValue: function(unit) {
		return 0;
	},
	
	getParameterName: function() {
		return '剣';
	}
}
);

// 槍熟練度の作成
// 既存の数値と一致しない値に設定
ParamType.LNC = 9001;

UnitParameter.LNC = defineObject(BaseUnitParameter,
{
	getParameterType: function() {
		return ParamType.LNC;
	},
	
	isParameterDisplayable: function(unitStatusType) {
		return false;
	},
	
	getUnitValue: function(unit) {
		var lnc;
		
		if (typeof unit.custom.lnc === 'number') {
			lnc = unit.custom.lnc;
		}
		else {
			lnc = 1;
		}
		
		return lnc;
	},
	
	setUnitValue: function(unit, value) {
		unit.custom.lnc = value;
	},
	
	getParameterBonus: function(obj) {
		var lnc;
		
		if (typeof obj.custom.lnc === 'number') {
			lnc = obj.custom.lnc;
		}
		else {
			lnc = 0;
		}
		
		return lnc;
	},
	
	getGrowthBonus: function(obj) {
		var lnc;
		
		if (typeof obj.custom.lncGrowthBonus === 'number') {
			lnc = obj.custom.lncGrowthBonus;
		}
		else {
			lnc = 0;
		}
		
		return lnc;
	},
	
	getDopingParameter: function(obj) {
		var lnc;
		
		if (typeof obj.custom !== 'object') {
			return 0;
		}
		
		if (typeof obj.custom.lncDoping === 'number') {
			lnc = obj.custom.lncDoping;
		}
		else {
			lnc = 0;
		}
		
		return lnc;
	},
	
	getAssistValue: function(obj) {
		return 0;
	},
	
	getMaxValue: function(unit) {
		var lncMax;
		
		if (DataConfig.isClassLimitEnabled()) {
			if (typeof unit.getClass().custom.lncMax === 'number') {
				lncMax = unit.getClass().custom.lncMax;
			}
			else {
				lncMax = 251;
			}
		}
		else {
			if (typeof root.getMetaSession().global.lncMax === 'number') {
				lncMax = root.getMetaSession().global.lncMax;
			}
			else {
				lncMax = 251;
			}
		}
		
		return lncMax;
	},
	
	getMinValue: function(unit) {
		return 0;
	},
	
	getParameterName: function() {
		return '槍';
	}
}
);

// 斧熟練度の作成
// 既存の数値と一致しない値に設定
ParamType.AXE = 9002;

UnitParameter.AXE = defineObject(BaseUnitParameter,
{
	getParameterType: function() {
		return ParamType.AXE;
	},
	
	isParameterDisplayable: function(unitStatusType) {
		return false;
	},
	
	getUnitValue: function(unit) {
		var axe;
		
		if (typeof unit.custom.axe === 'number') {
			axe = unit.custom.axe;
		}
		else {
			axe = 1;
		}
		
		return axe;
	},
	
	setUnitValue: function(unit, value) {
		unit.custom.axe = value;
	},
	
	getParameterBonus: function(obj) {
		var axe;
		
		if (typeof obj.custom.axe === 'number') {
			axe = obj.custom.axe;
		}
		else {
			axe = 0;
		}
		
		return axe;
	},
	
	getGrowthBonus: function(obj) {
		var axe;
		
		if (typeof obj.custom.axeGrowthBonus === 'number') {
			axe = obj.custom.axeGrowthBonus;
		}
		else {
			axe = 0;
		}
		
		return axe;
	},
	
	getDopingParameter: function(obj) {
		var axe;
		
		if (typeof obj.custom !== 'object') {
			return 0;
		}
		
		if (typeof obj.custom.axeDoping === 'number') {
			axe = obj.custom.axeDoping;
		}
		else {
			axe = 0;
		}
		
		return axe;
	},
	
	getAssistValue: function(obj) {
		return 0;
	},
	
	getMaxValue: function(unit) {
		var axeMax;
		
		if (DataConfig.isClassLimitEnabled()) {
			if (typeof unit.getClass().custom.axeMax === 'number') {
				axeMax = unit.getClass().custom.axeMax;
			}
			else {
				axeMax = 251;
			}
		}
		else {
			if (typeof root.getMetaSession().global.axeMax === 'number') {
				axeMax = root.getMetaSession().global.axeMax;
			}
			else {
				axeMax = 251;
			}
		}
		
		return axeMax;
	},
	
	getMinValue: function(unit) {
		return 0;
	},
	
	getParameterName: function() {
		return '斧';
	}
}
);

// 格闘熟練度の作成
// 既存の数値と一致しない値に設定
ParamType.PUG = 9003;

UnitParameter.PUG = defineObject(BaseUnitParameter,
{
	getParameterType: function() {
		return ParamType.PUG;
	},
	
	isParameterDisplayable: function(unitStatusType) {
		return false;
	},
	
	getUnitValue: function(unit) {
		var pug;
		
		if (typeof unit.custom.pug === 'number') {
			pug = unit.custom.pug;
		}
		else {
			pug = 1;
		}
		
		return pug;
	},
	
	setUnitValue: function(unit, value) {
		unit.custom.pug = value;
	},
	
	getParameterBonus: function(obj) {
		var pug;
		
		if (typeof obj.custom.pug === 'number') {
			pug = obj.custom.pug;
		}
		else {
			pug = 0;
		}
		
		return pug;
	},
	
	getGrowthBonus: function(obj) {
		var pug;
		
		if (typeof obj.custom.pugGrowthBonus === 'number') {
			pug = obj.custom.pugGrowthBonus;
		}
		else {
			pug = 0;
		}
		
		return pug;
	},
	
	getDopingParameter: function(obj) {
		var pug;
		
		if (typeof obj.custom !== 'object') {
			return 0;
		}
		
		if (typeof obj.custom.pugDoping === 'number') {
			pug = obj.custom.pugDoping;
		}
		else {
			pug = 0;
		}
		
		return pug;
	},
	
	getAssistValue: function(obj) {
		return 0;
	},
	
	getMaxValue: function(unit) {
		var pugMax;
		
		if (DataConfig.isClassLimitEnabled()) {
			if (typeof unit.getClass().custom.pugMax === 'number') {
				pugMax = unit.getClass().custom.pugMax;
			}
			else {
				pugMax = 251;
			}
		}
		else {
			if (typeof root.getMetaSession().global.pugMax === 'number') {
				pugMax = root.getMetaSession().global.pugMax;
			}
			else {
				pugMax = 251;
			}
		}
		
		return pugMax;
	},
	
	getMinValue: function(unit) {
		return 0;
	},
	
	getParameterName: function() {
		return '格闘';
	}
}
);

// 弓熟練度の作成
// 既存の数値と一致しない値に設定
ParamType.ARW = 9004;

UnitParameter.ARW = defineObject(BaseUnitParameter,
{
	getParameterType: function() {
		return ParamType.ARW;
	},
	
	isParameterDisplayable: function(unitStatusType) {
		return false;
	},
	
	getUnitValue: function(unit) {
		var arw;
		
		if (typeof unit.custom.arw === 'number') {
			arw = unit.custom.arw;
		}
		else {
			arw = 1;
		}
		
		return arw;
	},
	
	setUnitValue: function(unit, value) {
		unit.custom.arw = value;
	},
	
	getParameterBonus: function(obj) {
		var arw;
		
		if (typeof obj.custom.arw === 'number') {
			arw = obj.custom.arw;
		}
		else {
			arw = 0;
		}
		
		return arw;
	},
	
	getGrowthBonus: function(obj) {
		var arw;
		
		if (typeof obj.custom.arwGrowthBonus === 'number') {
			arw = obj.custom.arwGrowthBonus;
		}
		else {
			arw = 0;
		}
		
		return arw;
	},
	
	getDopingParameter: function(obj) {
		var arw;
		
		if (typeof obj.custom !== 'object') {
			return 0;
		}
		
		if (typeof obj.custom.arwDoping === 'number') {
			arw = obj.custom.arwDoping;
		}
		else {
			arw = 0;
		}
		
		return arw;
	},
	
	getAssistValue: function(obj) {
		return 0;
	},
	
	getMaxValue: function(unit) {
		var arwMax;
		
		if (DataConfig.isClassLimitEnabled()) {
			if (typeof unit.getClass().custom.arwMax === 'number') {
				arwMax = unit.getClass().custom.arwMax;
			}
			else {
				arwMax = 251;
			}
		}
		else {
			if (typeof root.getMetaSession().global.arwMax === 'number') {
				arwMax = root.getMetaSession().global.arwMax;
			}
			else {
				arwMax = 251;
			}
		}
		
		return arwMax;
	},
	
	getMinValue: function(unit) {
		return 0;
	},
	
	getParameterName: function() {
		return '弓';
	}
}
);

//魔法熟練度の作成
// 既存の数値と一致しない値に設定
// ParamType.MGC = 9005;

// UnitParameter.MGC = defineObject(BaseUnitParameter,
// {
// 	getParameterType: function() {
// 		return ParamType.MGC;
// 	},
// 	
// 	isParameterDisplayable: function(unitStatusType) {
// 		return false;
// 	},
// 	
// 	getUnitValue: function(unit) {
// 		var mgc;
// 		
// 		if (typeof unit.custom.mgc === 'number') {
// 			mgc = unit.custom.mgc;
// 		}
// 		else {
// 			mgc = 1;
// 		}
// 		
// 		return mgc;
// 	},
// 	
// 	setUnitValue: function(unit, value) {
// 		unit.custom.mgc = value;
// 	},
// 	
// 	getParameterBonus: function(obj) {
// 		var mgc;
// 		
// 		if (typeof obj.custom.mgc === 'number') {
// 			mgc = obj.custom.mgc;
// 		}
// 		else {
// 			mgc = 0;
// 		}
// 		
// 		return mgc;
// 	},
// 	
// 	getGrowthBonus: function(obj) {
// 		var mgc;
// 		
// 		if (typeof obj.custom.mgcGrowthBonus === 'number') {
// 			mgc = obj.custom.mgcGrowthBonus;
// 		}
// 		else {
// 			mgc = 0;
// 		}
// 		
// 		return mgc;
// 	},
// 	
// 	getDopingParameter: function(obj) {
// 		var mgc;
// 		
// 		if (typeof obj.custom !== 'object') {
// 			return 0;
// 		}
// 		
// 		if (typeof obj.custom.mgcDoping === 'number') {
// 			mgc = obj.custom.mgcDoping;
// 		}
// 		else {
// 			mgc = 0;
// 		}
// 		
// 		return mgc;
// 	},
// 	
// 	getAssistValue: function(obj) {
// 		return 0;
// 	},
// 	
// 	getMaxValue: function(unit) {
// 		var mgcMax;
// 		
// 		if (DataConfig.isClassLimitEnabled()) {
// 			if (typeof unit.getClass().custom.mgcMax === 'number') {
// 				mgcMax = unit.getClass().custom.mgcMax;
// 			}
// 			else {
// 				mgcMax = 251;
// 			}
// 		}
// 		else {
// 			if (typeof root.getMetaSession().global.mgcMax === 'number') {
// 				mgcMax = root.getMetaSession().global.mgcMax;
// 			}
// 			else {
// 				mgcMax = 251;
// 			}
// 		}
// 		
// 		return mgcMax;
// 	},
// 	
// 	getMinValue: function(unit) {
// 		return 0;
// 	},
// 	
// 	getParameterName: function() {
// 		return '魔法';
// 	}
// }
// );

// 炎熟練度の作成
// 既存の数値と一致しない値に設定
ParamType.FIRE = 9006;

UnitParameter.FIRE = defineObject(BaseUnitParameter,
{
	getParameterType: function() {
		return ParamType.FIRE;
	},
	
	isParameterDisplayable: function(unitStatusType) {
		return false;
	},
	
	getUnitValue: function(unit) {
		var fire;
		
		// 炎武器の場合は直接クラスのfire値を取得
		if (typeof unit.getClass().custom.fire === 'number') {
			fire = unit.getClass().custom.fire;
		} else {
			fire = 0; // 設定なし：装備できない（0:Cランク）
		}
		
		return fire;
	},
	
	setUnitValue: function(unit, value) {
		unit.custom.fire = value;
	},
	
	getParameterBonus: function(obj) {
		var fire;

		// 炎武器の場合はクラスのfire値を直接使用
		if (typeof obj.custom.fire === 'number') {
			fire = obj.custom.fire;
		}
		else {
			fire = 0;
		}

		return fire;
	},
	
	getGrowthBonus: function(obj) {
		var fire;
		
		if (typeof obj.custom.fireGrowthBonus === 'number') {
			fire = obj.custom.fireGrowthBonus;
		}
		else {
			fire = 0;
		}
		
		return fire;
	},
	
	getDopingParameter: function(obj) {
		var fire;
		
		if (typeof obj.custom !== 'object') {
			return 0;
		}
		
		if (typeof obj.custom.fireDoping === 'number') {
			fire = obj.custom.fireDoping;
		}
		else {
			fire = 0;
		}
		
		return fire;
	},
	
	getAssistValue: function(obj) {
		return 0;
	},
	
	getMaxValue: function(unit) {
		var fireMax;
		
		if (DataConfig.isClassLimitEnabled()) {
			if (typeof unit.getClass().custom.fireMax === 'number') {
				fireMax = unit.getClass().custom.fireMax;
			}
			else {
				fireMax = 251;
			}
		}
		else {
			if (typeof root.getMetaSession().global.fireMax === 'number') {
				fireMax = root.getMetaSession().global.fireMax;
			}
			else {
				fireMax = 251;
			}
		}
		
		return fireMax;
	},
	
	getMinValue: function(unit) {
		return 0;
	},
	
	getParameterName: function() {
		return '炎';
	}
}
);

// 雷熟練度の作成
// 既存の数値と一致しない値に設定
ParamType.THUNDER = 9007;

UnitParameter.THUNDER = defineObject(BaseUnitParameter,
{
	getParameterType: function() {
		return ParamType.THUNDER;
	},
	
	isParameterDisplayable: function(unitStatusType) {
		return false;
	},
	
	getUnitValue: function(unit) {
		var thunder;
		
		// 雷武器の場合は直接クラスのthunder値を取得
		if (typeof unit.getClass().custom.thunder === 'number') {
			thunder = unit.getClass().custom.thunder;
		} else {
			thunder = 0; // 設定なし：装備できない
		}
		
		return thunder;
	},
	
	setUnitValue: function(unit, value) {
		unit.custom.thunder = value;
	},
	
	getParameterBonus: function(obj) {
		// 雷武器の場合はクラスのthunder値を直接使用
		if (typeof obj.custom.thunder === 'number') {
			return obj.custom.thunder;
		}
		return 0;
	},
	
	getGrowthBonus: function(obj) {
		var thunder;
		
		if (typeof obj.custom.thunderGrowthBonus === 'number') {
			thunder = obj.custom.thunderGrowthBonus;
		}
		else {
			thunder = 0;
		}
		
		return thunder;
	},
	
	getDopingParameter: function(obj) {
		var thunder;
		
		if (typeof obj.custom !== 'object') {
			return 0;
		}
		
		if (typeof obj.custom.thunderDoping === 'number') {
			thunder = obj.custom.thunderDoping;
		}
		else {
			thunder = 0;
		}
		
		return thunder;
	},
	
	getAssistValue: function(obj) {
		return 0;
	},
	
	getMaxValue: function(unit) {
		var thunderMax;
		
		if (DataConfig.isClassLimitEnabled()) {
			if (typeof unit.getClass().custom.thunderMax === 'number') {
				thunderMax = unit.getClass().custom.thunderMax;
			}
			else {
				thunderMax = 251;
			}
		}
		else {
			if (typeof root.getMetaSession().global.thunderMax === 'number') {
				thunderMax = root.getMetaSession().global.thunderMax;
			}
			else {
				thunderMax = 251;
			}
		}
		
		return thunderMax;
	},
	
	getMinValue: function(unit) {
		return 0;
	},
	
	getParameterName: function() {
		return '雷';
	}
}
);

// 氷熟練度の作成
// 既存の数値と一致しない値に設定
ParamType.ICE = 9008;

UnitParameter.ICE = defineObject(BaseUnitParameter,
{
	getParameterType: function() {
		return ParamType.ICE;
	},
	
	isParameterDisplayable: function(unitStatusType) {
		return false;
	},
	
	getUnitValue: function(unit) {
		var ice;
		
		// 氷武器の場合は直接クラスのice値を取得
		if (typeof unit.getClass().custom.ice === 'number') {
			ice = unit.getClass().custom.ice;
		} else {
			ice = 0; // 設定なし：装備できない
		}
		
		return ice;
	},
	
	setUnitValue: function(unit, value) {
		unit.custom.ice = value;
	},
	
	getParameterBonus: function(obj) {
		// 氷武器の場合はクラスのice値を直接使用
		if (typeof obj.custom.ice === 'number') {
			return obj.custom.ice;
		}
		return 0;
	},
	
	getGrowthBonus: function(obj) {
		var ice;
		
		if (typeof obj.custom.iceGrowthBonus === 'number') {
			ice = obj.custom.iceGrowthBonus;
		}
		else {
			ice = 0;
		}
		
		return ice;
	},
	
	getDopingParameter: function(obj) {
		var ice;
		
		if (typeof obj.custom !== 'object') {
			return 0;
		}
		
		if (typeof obj.custom.iceDoping === 'number') {
			ice = obj.custom.iceDoping;
		}
		else {
			ice = 0;
		}
		
		return ice;
	},
	
	getAssistValue: function(obj) {
		return 0;
	},
	
	getMaxValue: function(unit) {
		var iceMax;
		
		if (DataConfig.isClassLimitEnabled()) {
			if (typeof unit.getClass().custom.iceMax === 'number') {
				iceMax = unit.getClass().custom.iceMax;
			}
			else {
				iceMax = 251;
			}
		}
		else {
			if (typeof root.getMetaSession().global.iceMax === 'number') {
				iceMax = root.getMetaSession().global.iceMax;
			}
			else {
				iceMax = 251;
			}
		}
		
		return iceMax;
	},
	
	getMinValue: function(unit) {
		return 0;
	},
	
	getParameterName: function() {
		return '氷';
	}
}
);

//作成した熟練度をユニットパラメータに追加
var alias1 = ParamGroup._configureUnitParameters;
ParamGroup._configureUnitParameters = function(groupArray) {
	alias1.call(this, groupArray);
	groupArray.appendObject(UnitParameter.SWD);
	groupArray.appendObject(UnitParameter.LNC);
	groupArray.appendObject(UnitParameter.AXE);
	groupArray.appendObject(UnitParameter.PUG);
	groupArray.appendObject(UnitParameter.ARW);
	// groupArray.appendObject(UnitParameter.MGC);
	groupArray.appendObject(UnitParameter.FIRE);
	groupArray.appendObject(UnitParameter.THUNDER);
	groupArray.appendObject(UnitParameter.ICE);
};

})();
