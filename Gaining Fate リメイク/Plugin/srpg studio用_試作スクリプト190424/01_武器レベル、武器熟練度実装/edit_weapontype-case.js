
/*--------------------------------------------------------------------------
  
  attackorder_weaponexp, custom-item-weapnlevel, singleton-calculator_custom から呼び出されるメソッドが入っています。
  
  使用方法：
  武器熟練度を作成した場合は、getClassBonus,getItemBonus,getUnitBonus,_addWeaponExp,getJyukurendoの内容を追加する。
  
  例：「斧」について
  UnitParameter.AXE
  武器タイプを、カスタムパラメータ{wtype: 2}
  武器熟練度を、カスタムパラメータaxe
  クラスボーナスを、カスタムパラメータaxe
  アイテムボーナスを、カスタムパラメータaxe
  として作成した場合、
  	getClassBonuscase → case 2 : bonus = unit.getClass().custom.axe; break;
  	getItemBonus → case 2 : bonus = item.custom.axe; break;
  	getUnitBonus → case 2 : bonus = unit.custom.axe; break;
  	_addWeaponExp → case 2  : UnitParameter.AXE.setUnitValue(unit, wexp + UnitParameter.AXE.getUnitValue(unit)); break;
  	getJyukurendoMax → case 2  : UnitParameter.AXE.getMaxValue(unit); break;
  上記のように、それぞれswitch文の中に追加する。
  
  ※replaceWeaponLevelについて
  ItemSentence.WeaponLevel.replaceWeaponLevel は、
  武器レベル、武器熟練度毎に表示するランクを定義しています。
  デフォルトの場合、1～30がランクE, 31～70がランクD, … ,251がランクS,という感じです。
  なので、例えば武器ランクがDの武器を作りたい場合は、武器のカスタムパラメータに{wlv:31}と記載すればいいです。
  
  作成者: CB
  
  更新履歴:
  2015/07/06 新規作成
  2015/07/08 使用方法に追記
  2015/08/09 熟練度のクラス上限値に対応
             ※getJyukurendoMaxメソッドを追加。こちらも武器タイプに応じて編集が必要です（上記参照）。
  2016/06/09 バーゲージ表示対応（作者じゃないけど）
  
--------------------------------------------------------------------------*/

(function() {

//武器タイプ毎に参照するクラスボーナスを設定。
ItemControl.getClassBonus = function(weaponType, unit){
	var bonus;
	switch(weaponType) {
		case 0 : bonus = unit.getClass().custom.swd; break;
		case 1 : bonus = unit.getClass().custom.lnc; break;
		case 2 : bonus = unit.getClass().custom.axe; break;
		case 3 : bonus = unit.getClass().custom.pug; break;
		case 4 : bonus = unit.getClass().custom.arw; break;
		// case 5 : bonus = unit.getClass().custom.mgc; break;
		case 5 : bonus = unit.getClass().custom.fire; break; // 武器タイプ5も炎武器として扱う
		case 6 : bonus = unit.getClass().custom.fire; break;
		case 7 : bonus = unit.getClass().custom.thunder; break;
		case 8 : bonus = unit.getClass().custom.ice; break;
		case 9 : bonus = unit.getClass().custom.light; break;
		default : bonus = 0 ; break;
	}
	
	if(typeof bonus !== 'number') {
		bonus = 0;
	}
	
	return bonus;
};

//武器タイプ毎に参照するアイテムボーナスを設定。
ItemControl.getItemBonus = function(weaponType, item){
	var bonus;
	switch(weaponType) {
		case 0  : bonus = 0; break; // 剣武器はアイテムボーナスなし
		case 1  : bonus = 0; break; // 槍武器はアイテムボーナスなし
		case 2  : bonus = 0; break; // 斧武器はアイテムボーナスなし
		case 3  : bonus = 0; break; // 格闘武器はアイテムボーナスなし
		case 4  : bonus = 0; break; // 弓武器はアイテムボーナスなし
		// case 5  : bonus = item.custom.mgc; break;
		case 5  : bonus = 0; break; // 武器タイプ5（炎武器）はアイテムボーナスなし
		case 6  : bonus = 0; break; // 炎武器はアイテムボーナスなし
		case 7  : bonus = 0; break; // 雷武器はアイテムボーナスなし
		case 8  : bonus = 0; break; // 氷武器はアイテムボーナスなし
		case 9  : bonus = 0; break; // 光武器はアイテムボーナスなし
		default : bonus = 0 ; break;
	}
	
	if(typeof bonus !== 'number') {
		bonus = 0;
	}
	
	return bonus;
};

//武器タイプ毎に参照するユニットボーナスを設定。
ItemControl.getUnitBonus = function(weaponType, unit){
	var bonus;
	switch(weaponType) {
		case 0  : bonus = 0; break; // 剣武器はユニットボーナスなし
		case 1  : bonus = 0; break; // 槍武器はユニットボーナスなし
		case 2  : bonus = 0; break; // 斧武器はユニットボーナスなし
		case 3  : bonus = 0; break; // 格闘武器はユニットボーナスなし
		case 4  : bonus = 0; break; // 弓武器はユニットボーナスなし
		// case 5  : bonus = unit.custom.mgc; break;
		case 5  : bonus = 0; break; // 武器タイプ5（炎武器）はユニットボーナスなし
		case 6  : bonus = 0; break; // 炎武器はユニットボーナスなし
		case 7  : bonus = 0; break; // 雷武器はユニットボーナスなし
		case 8  : bonus = 0; break; // 氷武器はユニットボーナスなし
		case 9  : bonus = 0; break; // 光武器はユニットボーナスなし
		default : bonus = 1 ; break;
	}
	
	if(typeof bonus !== 'number') {
		bonus = 1;
	}
	
	return bonus;
};

// 武器タイプ毎に対応する熟練度に、武器経験値を加算する。
NormalAttackOrderBuilder._addWeaponExp = function(unit, wexp, wtype){
	switch(wtype) {
		case 0  : UnitParameter.SWD.setUnitValue(unit, wexp + UnitParameter.SWD.getUnitValue(unit)); break;
		case 1  : UnitParameter.LNC.setUnitValue(unit, wexp + UnitParameter.LNC.getUnitValue(unit)); break;
		case 2  : UnitParameter.AXE.setUnitValue(unit, wexp + UnitParameter.AXE.getUnitValue(unit)); break;
		case 3  : UnitParameter.PUG.setUnitValue(unit, wexp + UnitParameter.PUG.getUnitValue(unit)); break;
		case 4  : UnitParameter.ARW.setUnitValue(unit, wexp + UnitParameter.ARW.getUnitValue(unit)); break;
		// case 5  : UnitParameter.MGC.setUnitValue(unit, wexp + UnitParameter.MGC.getUnitValue(unit)); break;
		case 5  : UnitParameter.FIRE.setUnitValue(unit, wexp + UnitParameter.FIRE.getUnitValue(unit)); break; // 武器タイプ5も炎武器として扱う
		case 6  : UnitParameter.FIRE.setUnitValue(unit, wexp + UnitParameter.FIRE.getUnitValue(unit)); break;
		case 7  : UnitParameter.THUNDER.setUnitValue(unit, wexp + UnitParameter.THUNDER.getUnitValue(unit)); break;
		case 8  : UnitParameter.ICE.setUnitValue(unit, wexp + UnitParameter.ICE.getUnitValue(unit)); break;
		case 9  : UnitParameter.LIGHT.setUnitValue(unit, wexp + UnitParameter.LIGHT.getUnitValue(unit)); break;
		default : break;
	}
	return true;
};

// ↓★2015/8/9追加
// 武器タイプに対応した熟練度の上限値を取得する。
AbilityCalculator.getJyukurendoMax = function(weaponType, unit) {
	var maxValue = 251;
	
	switch(weaponType) {
		case 0  : maxValue =UnitParameter.SWD.getMaxValue(unit); break;
		case 1  : maxValue =UnitParameter.LNC.getMaxValue(unit); break;
		case 2  : maxValue =UnitParameter.AXE.getMaxValue(unit); break;
		case 3  : maxValue =UnitParameter.PUG.getMaxValue(unit); break;
		case 4  : maxValue =UnitParameter.ARW.getMaxValue(unit); break;
		// case 5  : maxValue =UnitParameter.MGC.getMaxValue(unit); break;
		case 5  : maxValue =UnitParameter.FIRE.getMaxValue(unit); break; // 武器タイプ5も炎武器として扱う
		case 6  : maxValue =UnitParameter.FIRE.getMaxValue(unit); break;
		case 7  : maxValue =UnitParameter.THUNDER.getMaxValue(unit); break;
		case 8  : maxValue =UnitParameter.ICE.getMaxValue(unit); break;
		case 9  : maxValue =UnitParameter.LIGHT.getMaxValue(unit); break;
		default : break;
	}
	return maxValue;
};

// 武器タイプに対応した熟練度を取得する。
AbilityCalculator.getJyukurendo = function(unit, weapon) {
	var weaponType = weapon.custom.wtype;
	var classBns = ItemControl.getClassBonus(weaponType, unit);
	var itemBns  = ItemControl.getItemBonus(weaponType, weapon);
	var unitBns  = ItemControl.getUnitBonus(weaponType, unit);
	var totalValue = classBns + itemBns + unitBns;
	var MaxValue = AbilityCalculator.getJyukurendoMax(weaponType, unit);
	
	// 杖の場合は最初に処理
	if (weapon && typeof weapon.isWand === 'function' && weapon.isWand()) {
		// 杖の場合、クラスのカスタムパラメータのみを使用
		var wandValue = unit.getClass().custom.wand || 0;
		// 0:C, 1:B, 2:A, 3:S に変換
		totalValue = wandValue + 1;
		return totalValue;
	}
	
	// すべての武器タイプでクラスのカスタムパラメータのみを使用
	if (weaponType === 0) {
		// 剣武器の場合
		var swdValue = unit.getClass().custom.swd || 0;
		// 0:C, 1:B, 2:A, 3:S に変換
		totalValue = swdValue + 1;
	} else if (weaponType === 1) {
		// 槍武器の場合
		var lncValue = unit.getClass().custom.lnc || 0;
		// 0:C, 1:B, 2:A, 3:S に変換
		totalValue = lncValue + 1;
	} else if (weaponType === 2) {
		// 斧武器の場合
		var axeValue = unit.getClass().custom.axe || 0;
		// 0:C, 1:B, 2:A, 3:S に変換
		totalValue = axeValue + 1;
	} else if (weaponType === 3) {
		// 格闘武器の場合
		var pugValue = unit.getClass().custom.pug || 0;
		// 0:C, 1:B, 2:A, 3:S に変換
		totalValue = pugValue + 1;
	} else if (weaponType === 4) {
		// 弓武器の場合
		var arwValue = unit.getClass().custom.arw || 0;
		// 0:C, 1:B, 2:A, 3:S に変換
		totalValue = arwValue + 1;
	} else if (weaponType === 5) {
		// 武器タイプ5（炎武器）の場合
		var fireValue = unit.getClass().custom.fire || 0;
		// 0:C, 1:B, 2:A, 3:S に変換
		totalValue = fireValue + 1;
	} else if (weaponType === 6) {
		// 炎武器の場合
		var fireValue = unit.getClass().custom.fire || 0;
		// 0:C, 1:B, 2:A, 3:S に変換
		totalValue = fireValue + 1;
	} else if (weaponType === 7) {
		// 雷武器の場合
		var thunderValue = unit.getClass().custom.thunder || 0;
		// 0:C, 1:B, 2:A, 3:S に変換
		totalValue = thunderValue + 1;
	} else if (weaponType === 8) {
		// 氷武器の場合
		var iceValue = unit.getClass().custom.ice || 0;
		// 0:C, 1:B, 2:A, 3:S に変換
		totalValue = iceValue + 1;
	} else if (weaponType === 9) {
		// 光武器の場合
		var lightValue = unit.getClass().custom.light || 0;
		// 0:C, 1:B, 2:A, 3:S に変換（+1しない）
		totalValue = lightValue;
	}
	
	
	// すべての武器タイプでクラスのカスタムパラメータのみを使用する場合
	if (weaponType === 0 || weaponType === 1 || weaponType === 2 || weaponType === 3 || weaponType === 4 || weaponType === 5 || weaponType === 6 || weaponType === 7 || weaponType === 8 || weaponType === 9) {
		return totalValue;
	}
	
	// ↓2015/8/9追加
	//熟練度の合計がクラスの上限値を上回っている場合、熟練度にクラスの上限値を代入
	if (totalValue > MaxValue) {
		totalValue = MaxValue;
	}
	
	return totalValue;
};

// 武器レベル、熟練度の値毎に表示する文字を設定
ItemSentence.WeaponLevel.replaceWeaponLevel = function(wlv) {
	var string = wlv;

	// 武器レベル(熟練度)の値に応じて、表示する文字を設定
	// if (wlv >= 1 && wlv <= 1) { string = 'C'; }
	// else if (wlv >= 2 && wlv <= 2) { string = 'B'; }
	// else if (wlv >= 3 && wlv <= 3) { string = 'A'; }
	// else if (wlv >= 4) { string = 'S'; }
	// else { string = 'ERR'; }

	if (wlv == 0) { string = 'C'; }
	else if (wlv == 1) { string = 'B'; }
	else if (wlv == 2) { string = 'A'; }
	else if (wlv == 3) { string = 'S'; }
	else { string = 'ERR'; }
	
	return string;
}

// 武器レベル、熟練度の値毎に表示する文字を設定
ItemSentence.WeaponLevel.getNowWeaponLevelMin = function(wlv) {
	// 武器レベル(熟練度)の値に応じて、表示する文字を設定
	if (wlv < 1) {
		return 1;
	}
	if (wlv >= 1 && wlv <= 1) {
		return 2;
	}
	if (wlv >= 2 && wlv <= 2) {
		return 3;
	}
	if (wlv >= 3 && wlv <= 3) {
		return 4;
	}
//	else if (wlv >= 251) {
//	}
	return 5;
}

// 武器レベル、熟練度の値毎に表示する文字を設定
ItemSentence.WeaponLevel.getNowWeaponLevelMax = function(wlv) {
	// 武器レベル(熟練度)の値に応じて、表示する文字を設定
	if (wlv < 1) {
		return 2;
	}
	if (wlv >= 1 && wlv <= 1) {
		return 3;
	}
	if (wlv >= 2 && wlv <= 2) {
		return 4;
	}
	if (wlv >= 3 && wlv <= 3) {
		return 5;
	}
//	else if (wlv >= 251) {
//	}
	return 6;
}

})();
