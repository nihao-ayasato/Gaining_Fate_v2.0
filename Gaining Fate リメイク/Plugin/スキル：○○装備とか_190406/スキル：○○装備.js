
/*--------------------------------------------------------------------------
  
　『○○装備』系のスキルを作るスクリプト

■概要
剣装備などの、通常装備できない武器を装備するスキルを作れます。
スキル種類としてカスタムを選択し、キーワードに以下の値を入れると、対応する武器を装備できるようになります。
スキルはユニットスキル、クラススキル、武器以外の道具についたスキル、ステートで付与したスキルに対応しています。
（武器についたスキルとフュージョンによるスキルについては現在除去しています）

--------------------------------------
　　武器タイプの名称※　対応キーワード
--------------------------------------
　　　剣　　　　　　　　'equip_swd'
　　　槍　　　　　　　　'equip_spr'
　　　斧　　　　　　　　'equip_axe'
　　　弓　　　　　　　　'equip_bow'
　　　魔法　　　　　　　'equip_mgc'

　　※武器タイプの名称とは、データ設定→コンフィグ→武器タイプを選択した時に出てくる、各武器につけた名称のことです。

■！！！！！！！！！！注意事項！！！！！！！！！！
ユニットの系統（戦士系、弓系、魔法系）と、装備可能武器のスキルにずれが無いようにしてください。
戦士系なら、剣、槍、斧といった近接武器、弓系は弓、魔法系は魔法しか装備できません。
これは公式のツールの仕様で『近接武器しか使えないクラスで弓や魔法を使おうとするとモーションが無い為エラーになる』のを防ぐ仕組みがある為です。

例）剣と魔法が使える剣士を作る場合、『魔法のモーションも追加した剣士』というオリジナルのモーションデータが必要になります。
！！！！！！！！！！！！！！！！！！！！！！！！！


■カスタマイズ
　【武器タイプの名称を変更したい】
　　本ソースの設定で、武器タイプの名称と書かれている部分の名称を変えてください。

　　例）武器タイプ：剣を武器タイプ長剣にしたい
　　　　→『var weapon_type_name_swd = '剣';』を『var weapon_type_name_swd = '長剣';』にします。

　【指定するキーワードを変えたい】
　　本ソースの設定で、スキルに設定するキーワードと書かれている部分のキーワードを変えてください。
　　（スキルに設定するキーワードも一致させてください）

　　例）武器タイプ：剣に対応するキーワードを'equip_sword'にしたい
　　　　→『var weapon_keyword_swd = 'equip_swd';』を『var weapon_keyword_swd = 'equip_sword';』にします。
　　　　　その上で、スキル種類としてカスタムでキーワードに'equip_sword'を入れてください。

　【武器タイプを増やしたい】
　　本ソースに増やしたい武器タイプを追加してください。



15/10/06 新規作成
16/01/13 武器以外の道具についたスキル、ステートで付与したスキル、フュージョンで得たスキルに対応
16/10/15 1.097対応
         フュージョンで得たスキルを対応から一旦外した
         ○○装備のスキルアイコンを、ステータスの装備可能武器アイコンの横に表示するようにした
17/03/05 メンバ変数の定義ミスにより、他のスクリプトと組み合わせると異常動作を起こす事があったのを修正
19/04/06 weapon-attacklimit.jsとの競合対策処理を追加


■対応バージョン
　SRPG Studio Version:1.202


■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/
//----------------------------------------
// 設定(外部)
//----------------------------------------
var Skill_ExtraWeaponEquip = true;


(function() {

//----------------------------------------
// 設定
//----------------------------------------
// 武器タイプの名称
var weapon_type_name_swd = '剣';		// タイプ：剣
var weapon_type_name_spr = '槍';		// タイプ：槍
var weapon_type_name_axe = '斧';		// タイプ：斧
var weapon_type_name_bow = '弓';		// タイプ：弓
var weapon_type_name_mgc = '魔法';		// タイプ：魔法

// スキルに設定するキーワード
var weapon_keyword_swd = 'equip_swd';	// タイプ：剣に対応するキーワード
var weapon_keyword_spr = 'equip_spr';	// タイプ：槍に対応するキーワード
var weapon_keyword_axe = 'equip_axe';	// タイプ：斧に対応するキーワード
var weapon_keyword_bow = 'equip_bow';	// タイプ：弓に対応するキーワード
var weapon_keyword_mgc = 'equip_mgc';	// タイプ：魔法に対応するキーワード


// キーワードの配列（ソース内部にて使用）
var weapon_keyword_tbl = [
	weapon_keyword_swd,
	weapon_keyword_spr,
	weapon_keyword_axe,
	weapon_keyword_bow,
	weapon_keyword_mgc
];




//----------------------------------------
// UnitMenuBottomWindowクラス
//----------------------------------------
// ステ画面の装備武器アイコン欄に○○装備のスキルアイコンも表示する
var alias1 = UnitMenuBottomWindow._drawWeaponTypeArea;
UnitMenuBottomWindow._drawWeaponTypeArea= function(xBase, yBase) {
		alias1.call(this, xBase, yBase);
		
		var dy = this._itemInteraction.getInteractionScrollbar().getScrollbarHeight() + 14;
		WeaponTypeRenderer.drawClassWeaponListEx(xBase, yBase + dy, this._unit);
}




//----------------------------------------
// WeaponTypeRendererクラス
//----------------------------------------
// クラスの装備武器アイコンの横に、○○装備のスキルアイコンを表示
WeaponTypeRenderer.drawClassWeaponListEx= function(x, y, unit) {
		var i, data, handle;
		var list = unit.getClass().getEquipmentWeaponTypeReferenceList();
		var j;
		var tbl_max = weapon_keyword_tbl.length;
		var count;
		var skill;
		var skill_arr = [];

		for (i = 0; i < tbl_max; i++) {
			skill = SkillControl.getCustomSkill_Unit_Class_Item_State_Fusion(unit,weapon_keyword_tbl[i]);
			if( skill ) {
				skill_arr.push( skill );
			}
		}
		
		j = list.getTypeCount();
		count = skill_arr.length;
		for (i = 0; i < count; i++) {
			handle = skill_arr[i].getIconResourceHandle();
			GraphicsRenderer.drawImage(x + ((i+j) * 30), y, handle, GraphicsType.ICON);
		}
}




//----------------------------------------
// ItemControlクラス
//----------------------------------------
var alias2 = ItemControl.isWeaponAvailable;
ItemControl.isWeaponAvailable= function(unit, item) {
		if( alias2.call(this, unit, item) == true ){
			return true;
		}

		if (item === null) {
			return false;
		}
		
		// itemが武器でない場合は装備できない
		if (!item.isWeapon()) {
			return false;
		}
		
		// 「熟練度」を調べる
		if (!this._isWeaponLevel(unit, item)) {
			return false;
		}
		
		// 「戦士系」などが一致するか調べる
		if (!this._compareTemplateAndCategory(unit, item)) {
			return false;
		}
		
		// ○○装備のスキルをチェック
		if (!this.isWeaponEquipedEx(unit, item)) {
			return false;
		}
		
		if (item.getWeaponCategoryType() === WeaponCategoryType.MAGIC) {
			// 「魔法攻撃」が禁止されているか調べる
			if (StateControl.isBadStateFlag(unit, BadStateFlag.MAGIC)) {
				return false;
			}
		}
		else {
			// 「物理攻撃」が禁止されているか調べる
			if (StateControl.isBadStateFlag(unit, BadStateFlag.PHYSICS)) {
				return false;
			}
		}
		
		return true;
}


var alias3 = ItemControl.isWeaponTypeAllowed;
ItemControl.isWeaponTypeAllowed= function(refList, weapon, unit) {

	// ここまでのisWeaponTypeAllowed()を呼び出し、その結果がtrueであれば装備可能なのでtrueを返す。
	if( alias3.call(this, refList, weapon) == true ){
		return true;
	}

	// 疑似オーバーロード処理（javascriptは引数の数が違う同一名関数をオーバーロード出来ないので、引数の数をチェックして疑似的に処理した）
	// 引数2個のケース(従来の呼び出し方法)ならばfalseを返す
	if (arguments.length == 2) {
		return false;
	}

	// ○○装備のスキルをチェック
	return ItemControl.isWeaponEquipedEx(unit, weapon);
}


// ○○装備のスキルをチェック
ItemControl.isWeaponEquipedEx= function(unit, item) {

	// 武器タイプの名称を取得
	var wpn_type_name = item.getWeaponType().getName();

	// 武器タイプ：剣なら剣に対応するキーワードをチェック
	if( wpn_type_name == weapon_type_name_swd ){
		var custom_skill = SkillControl.getCustomSkill_Unit_Class_Item_State_Fusion(unit,weapon_keyword_swd);
		if( custom_skill != null ){
				return true;
		}
	}
	// 武器タイプ：槍なら槍に対応するキーワードをチェック
	if( wpn_type_name == weapon_type_name_spr ){
		var custom_skill = SkillControl.getCustomSkill_Unit_Class_Item_State_Fusion(unit,weapon_keyword_spr);
		if( custom_skill != null ){
			return true;
		}
	}
	// 武器タイプ：斧なら斧に対応するキーワードをチェック
	if( wpn_type_name == weapon_type_name_axe ){
		var custom_skill = SkillControl.getCustomSkill_Unit_Class_Item_State_Fusion(unit,weapon_keyword_axe);
		if( custom_skill != null ){
			return true;
		}
	}
	// 武器タイプ：弓なら弓に対応するキーワードをチェック
	if( wpn_type_name == weapon_type_name_bow ){
		var custom_skill = SkillControl.getCustomSkill_Unit_Class_Item_State_Fusion(unit,weapon_keyword_bow);
		if( custom_skill != null ){
			return true;
		}
	}
	// 武器タイプ：魔法なら魔法に対応するキーワードをチェック
	if( wpn_type_name == weapon_type_name_mgc ){
		var custom_skill = SkillControl.getCustomSkill_Unit_Class_Item_State_Fusion(unit,weapon_keyword_mgc);
		if( custom_skill != null ){
			return true;
		}
	}

	// 増やしたい装備スキルがあれば、以下に追加してください。

	return false;
}




//----------------------------------------
// SkillControlクラス(自作)
//----------------------------------------
// ユニット、クラス、武器以外の道具、ステートから、キーワードに対応したカスタムスキルを取得する(フュージョンは対象外)
// SkillControl.getPossessionCustomSkill()を使うと、武器取得関数内からgetPossessionCustomSkill()を呼ぶことになり、無限ループ発生→スタックオーバーフローで落ちる
SkillControl.getCustomSkill_Unit_Class_Item_State_Fusion= function(unit, keyword) {
		var i, count, item, list;
		var arr = [];
		var cls = unit.getClass();

		// キーワードに合致するスキルの取得（ユニット）
		this._pushSkillValue(unit, ObjectType.UNIT, arr, SkillType.CUSTOM, keyword);
		// キーワードに合致するスキルの取得（クラス）
		this._pushSkillValue(cls, ObjectType.CLASS, arr, SkillType.CUSTOM, keyword);

		count = UnitItemControl.getPossessionItemCount(unit);
		for (i = 0; i < count; i++) {
			item = UnitItemControl.getItem(unit, i);
			if (item !== null && ItemControl.isItemUsable(unit, item)) {
				// アイテムを使用できる場合は、スキルを追加する
				this._pushSkillValue(item, ObjectType.ITEM, arr, SkillType.CUSTOM, keyword);
			}
		}
		
		// ユニットにかかっているステートのスキルを追加する
		list = unit.getTurnStateList();
		count = list.getCount();
		for (i = 0; i < count; i++) {
			this._pushSkillValue(list.getData(i).getState(), ObjectType.STATE, arr, SkillType.CUSTOM, keyword);
		}
		
		// フュージョンによって得たスキルは取得方法が変わっていたので一旦除外した


		// 重複スキルを取り除く
		var valid_arr = this._getValidSkillArray(arr);

		// スキルを１つ返す
		return this._returnSkill(SkillType.CUSTOM, valid_arr);
};


})();