/**
 * @license Copyright 2018 DENSO
 * 
 * UnitPanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';


/********************************************
 * Action名
 ********************************************/
export const SET_MASTERDATA = 'SET_MASTERDATA';
export const SET_UNITIMAGE = 'SET_UNITIMAGE';
export const SET_LOGINUSER = 'SET_LOGINUSER';

export const SET_RACK = 'SET_RACK';
export const SET_DISPSETTING = 'SET_DISPSETTING';

export const SET_UNIT = 'SET_UNIT';
export const SET_EDITING_UNIT = 'SET_EDITING_UNIT';
export const CHANGE_UNIT_OVERVIEW = 'CHANGE_UNIT_OVERVIEW';
export const CHANGE_UNIT_DETAIL = 'CHANGE_UNIT_DETAIL';
export const CHANGE_UNITPOWER = 'CHANGE_UNITPOWER';
export const CHANGE_UNIT_LINK = 'CHANGE_UNIT_LINK';
export const CHANGE_UNIT_NETWORK = 'CHANGE_UNIT_NETWORK';
export const CHANGE_DISPSETTING = 'CHANGE_DISPSETTING';
export const APPLY_TEMPLATE = 'APPLY_TEMPLATE';

export const CLEAR_RACK = 'CLEAR_RACK';

export const SET_EDITMODE = 'SET_EDITMODE';
export const SET_LOADSTATE = 'SET_LOADSTATE';
export const SET_APPLAYTEMPLATE_STATE = 'SET_APPLAYTEMPLATE_STATE';

export const CHANGE_DISPSETTING_STATE = 'CHANGE_DISPSETTING_STATE';
export const CHANGE_SELECTTEMPLATE_STATE = 'CHANGE_SELECTTEMPLATE_STATE';
export const CHANGE_ADDTEMPLATE_STATE = 'CHANGE_ADDTEMPLATE_STATE';
export const CHANGE_CONFIRM_STATE = 'CHANGE_CONFIRM_STATE';
export const CHANGE_MESSAGE_STATE = 'CHANGE_MESSAGE_STATE';
export const CHANGE_REPORTOUTPUT_STATE = 'CHANGE_REPORTOUTPUT_STATE';
export const CHANGE_REPORTHISTORY_STATE = 'CHANGE_REPORTHISTORY_STATE';
export const CHANGE_REPORTFORMAT_STATE = 'CHANGE_REPORTFORMAT_STATE';

/********************************************
 * ActionCenter
 ********************************************/

/**
 * マスタデータを初期化するActionを作成する
 * @param {object} lookup ルックアップ
 */
export function setMasterData(lookup) {
    return { type:SET_MASTERDATA, value:lookup };
}

/**
 * ユニット画像一覧をセットするActionを作成する
 * @param {array} unitImages ユニット画像一覧
 */
export function setUnitImages(unitImages) {
    return { type:SET_UNITIMAGE, value: unitImages };
}

/**
 * ログインユーザー情報をセットするActionを作成する
 * @param {any} user
 */
export function setLoginUser(user) {
    return { type: SET_LOGINUSER, value: user };
}

/**
 * ラック情報をセットするActionを作成する
 * @param {object} rack 読み込んだラック情報
 */
export function setSelectedRack(rack) {
    return { type: SET_RACK, value:rack };
}

/**
 * ラック情報をクリアする
 */
export function clearSelectRack() {
    return { type: CLEAR_RACK };
}

/**
 * ユニット表示設定情報をセットするActionを作成する
 * @param {object} dispSetting 読み込んだユニット表示設定情報
 */
export function setSelectedDispSetting(dispSetting) {
    return { type: SET_DISPSETTING, value:dispSetting };
}

/**
 * ユニット情報をセットするActionを作成する
 * @param {object} unit 読み込んだユニット情報
 */
export function setSelectedUnit(unit) {
    return { type: SET_UNIT, value:unit };
}

/**
 * 編集中のユニット情報をセットするActionを作成する
 * @param {object} unit ユニット情報
 * @param {dispSetting} dispSetting ユニット表示設定情報
 */
export function setEditingUnit(unit, dispSetting) {
    return { type: SET_EDITING_UNIT, value:unit, dispSetting: dispSetting };
}

/**
 * 編集中ユニットのユニット概要を変更する
 * @param {object} unit ユニット情報（ユニット概要のみ）
 * @param {boolean} invalid ユニット概要の保存が無効かどうか
 */
export function changeUnitOverview(unit, invalid) {
    return { type: CHANGE_UNIT_OVERVIEW, unit: unit, invalid: invalid };
}

/**
 * 編集中ユニットの詳細情報を更新する
 * @param {array} detailData ユニット詳細情報
 * @param {boolean} invalid ユニット詳細情報の保存が無効かどうか
 */
export function changeUnitDetail(detailData, invalid) {
    return { type: CHANGE_UNIT_DETAIL, detailData: detailData, invalid: invalid };
}

/**
 * 編集中ユニットのユニット電源を更新する
 * @param {array} powers ユニット電源
 * @param {boolean} invalid ユニット電源の保存が無効かどうか
 */
export function changeUnitPowers(powers, invalid) {
    return { type: CHANGE_UNITPOWER, powers: powers, invalid: invalid };
}

/**
 * 編集中ユニットのリンク設定情報を更新する
 * @param {array} links ユニットのリンク情報
 * @param {boolean} invalid リンク情報の保存が無効かどうか
 */
export function changeUnitLinks(links, invalid) {
    return { type: CHANGE_UNIT_LINK, links: links, invalid: invalid };
}

/**
 * 編集中ユニットのネットワーク情報を更新する
 * @param {*} network 変更したネットワーク情報
 * @param {string} key ネットワーク情報のキー
 * @param {boolean} invalid ネットワーク情報の保存が無効かどうか
 */
export function changeUnitNetwork(network, key, invalid) {
    return { type: CHANGE_UNIT_NETWORK, network: network, key: key, invalid: invalid };
}

/**
 * 編集中ユニットの表示設定ID情報を更新する
 * @param {string} dispSetting 表示設定グループ
 * @param {array} margingDispSettings 結合する表示設定グループ配列
 */
export function changeUnitDispSetting(dispSetting, margingDispSettings) {
    return { type: CHANGE_DISPSETTING, dispSetting: dispSetting, margingDispSettings: margingDispSettings };
}

/**
 * 編集中ユニットにテンプレートを適用する
 * @param {object} template 適用するテンプレート
 */
export function applyTemplate(template) {
    return { type: APPLY_TEMPLATE, template: template }
}

/**
 * 編集中状態をセットするActionを作成する
 * @param {boolean} isEditing 編集中かどうか
 */
export function setEditMode(isEditing) {
    return { type: SET_EDITMODE, value:isEditing };
}

/**
 * ロード状態をセットするActionを作成する
 * @param {boolean} isLoading ロード中かどうか
 */
export function setLoadState(isLoading) {
    return { type: SET_LOADSTATE, value:isLoading };
}

/**
 * テンプレート適用中フラグをセットするActionを作成する
 * @param {boolean} isApplayTemplate テンプレート適用中フラグ
 */
export function setApplayTemplateState(isApplayTemplate){
    return { type: SET_APPLAYTEMPLATE_STATE, value:isApplayTemplate };

}

/**
 * テンプレート選択モーダルの表示状態をセットするActionを作成する
 * @param {boolean} show 表示するかどうか
 */
export function changeDispSettingModalState(show) {    
    return { type: CHANGE_DISPSETTING_STATE, value:show };
}

/**
 * テンプレート選択モーダルの表示状態をセットするActionを作成する
 * @param {boolean} show 表示するかどうか
 */
export function changeSelectTemplateModalState(show) {    
    return { type: CHANGE_SELECTTEMPLATE_STATE, value:show };
}

/**
 * テンプレート追加モーダルの表示状態をセットするActionを作成する
 * @param {boolean} show 表示するかどうか
 */
export function changeAddTemplateModalState(show) {
    return { type: CHANGE_ADDTEMPLATE_STATE, value:show };
}

/**
 * 確認モーダルの表示状態をセットするActionを作成する
 * @param {boolean} show 表示するかどうか
 * @param {string} title タイトル
 * @param {srting} message メッセージ
 * @param {string} attenstion 注意喚起メッセージ
 * @param {string} type 確認モーダルの種別
 */
export function changeConfirmModalState(show, title, message, attenstion, type) {
    return { type: CHANGE_CONFIRM_STATE, value:show, title:title, message:message, attenstion:attenstion, confirmType: type };
}

/**
 * メッセージモーダルの表示状態をセットするActionを作成する
 * @param {boolean} show 表示するかどうか
 * @param {string} title タイトル
 * @param {srting} message メッセージ
 * @param {function} callback コールバック関数 
 */
export function changeMessageModalState(show, title, message, callback) {
    return { type: CHANGE_MESSAGE_STATE, value:show, title:title, message:message, callback: callback };
}

/**
 * 帳票出力確認モーダルの表示状態をセットするActionを作成する
 * @param {boolean} show 表示するかどうか
 */
export function changeReportOutputModalState(show) {
    return { type: CHANGE_REPORTOUTPUT_STATE, value: show };
}

/**
 * 帳票履歴モーダルの表示状態をセットするActionを作成する
 * @param {any} show
 */
export function changeReportHistoryModalState(show) {
    return { type: CHANGE_REPORTHISTORY_STATE, value: show };
}

/**
 * 帳票フォーマットモーダルの表示状態をセットするActionを作成する
 * @param {any} show
 */
export function changeReportFormatModalState(show) {
    return { type: CHANGE_REPORTFORMAT_STATE, value: show };
}