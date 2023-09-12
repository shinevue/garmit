/**
 * @license Copyright 2017 DENSO
 * 
 * RackPanelのAction(ActionCreator)を定義する。
 * 
 */
'use strict';

/********************************************
 * Action名
 ********************************************/
export const SET_MASTERDATA = 'SET_MASTERDATA';
export const SET_RACK = 'SET_RACK';
export const SET_RACKPOWER_VALUES = 'SET_RACKPOWER_VALUES';
export const SET_LOGINUSER = 'SET_LOGINUSER';

export const SET_EDITMODE = 'SET_EDITMODE';
export const SET_LOADSTATE = 'SET_LOADSTATE';
export const SET_LOADSTATE_RACK = 'SET_LOADSTATE_RACK';
export const SET_LOADSTATE_POWERBAR = 'SET_LOADSTATE_POWERBAR';

export const CHANGE_SELECTTEMPLATE_STATE = 'CHANGE_SELECTTEMPLATE_STATE';
export const CHANGE_ADDTEMPLATE_STATE = 'CHANGE_ADDTEMPLATE_STATE';
export const CHANGE_DELETEMESSAGE_STATE = 'CHANGE_DELETEMESSAGE_STATE';
export const CHANGE_MESSAGE_STATE = 'CHANGE_MESSAGE_STATE';
export const CHANGE_CONFIRM_STATE = 'CHANGE_CONFIRM_STATE';
export const CHANGE_REPORTOUTPUT_STATE = 'CHANGE_REPORTOUTPUT_STATE';
export const CHANGE_REPORTHISTORY_STATE = 'CHANGE_REPORTHISTORY_STATE';
export const CHANGE_REPORTFORMAT_STATE = 'CHANGE_REPORTFORMAT_STATE';

export const CLEAR_RACK = 'CLEAR_RACK';

//編集用のAction名
export const SET_EDITING_RACK = 'SET_EDITING_RACK';
export const CHANGE_RACK_OVERVIEW = 'CHANGE_RACK_OVERVIEW';
export const CHANGE_RACK_DETAIL = 'CHANGE_RACK_DETAIL';
export const CHANGE_RACKPOWER = 'CHANGE_RACKPOWER';
export const CHANGE_RACK_LINK = 'CHANGE_RACK_LINK';
export const APPLY_TEMPLATE = 'APPLY_TEMPLATE';
export const SET_APPLAYTEMPLATE_STATE = 'SET_APPLAYTEMPLATE_STATE';

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
 * ラック電源の定格値や実測値をセットするActionを作成する
 * @param {object} rackPowerValues 読み込んだラック電源の使用状況
 */
export function setRackPowerValues(rackPowerValues) {
    return { type: SET_RACKPOWER_VALUES, value:rackPowerValues };
}

/**
 * ログインユーザー情報をセットするActionを作成する
 * @param {any} user
 */
export function setLoginUser(user) {
    return { type: SET_LOGINUSER, value: user };
}


/**
 * 編集中のラック情報をセットするActionを作成する
 * @param {object} rack ラック情報
 */
export function setEditingRack(rack) {
    return { type: SET_EDITING_RACK, value:rack };
}

/**
 * 編集中ラックのラック概要を変更する
 * @param {object} rack ラック情報（ラック概要のみ）
 * @param {boolean} invalid ラック概要の保存が無効かどうか
 */
export function changeRackOverview(rack, invalid) {
    return { type: CHANGE_RACK_OVERVIEW, rack: rack, invalid: invalid };
}

/**
 * 編集中ラックの詳細情報を更新する
 * @param {array} detailData ラック詳細情報
 * @param {boolean} invalid ラック詳細情報の保存が無効かどうか
 */
export function changeRackDetail(detailData, invalid) {
    return { type: CHANGE_RACK_DETAIL, detailData: detailData, invalid: invalid };
}

/**
 * 編集中ラックのラック電源を更新する
 * @param {array} powers ラック電源
 * @param {boolean} invalid ラック電源の保存が無効かどうか
 */
export function changeRackPowers(powers, invalid) {
    return { type: CHANGE_RACKPOWER, powers: powers, invalid: invalid };
}

/**
 * 編集中ラックのリンク設定情報を更新する
 * @param {array} links ラックのリンク情報
 * @param {boolean} invalid リンク情報の保存が無効かどうか
 */
export function changeRackLinks(links, invalid) {
    return { type: CHANGE_RACK_LINK, links: links, invalid: invalid };
}

/**
 * 編集中ラックにテンプレートを適用する
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
 * ロード状態（ラックのみ）をセットするActionを作成する
 * @param {boolean} isLoading ロード中かどうか
 */
export function setLoadState_RackOnly(isLoading) {
    return { type: SET_LOADSTATE_RACK, value:isLoading }
}

/**
 * ロード状態（ラックのみ）をセットするActionを作成する
 * @param {boolean} isLoading ロード中かどうか
 */
export function setLoadState_PowerBarOnly(isLoading) {
    return { type: SET_LOADSTATE_POWERBAR, value:isLoading }
}

/**
 * テンプレート選択モーダルの表示状態をセットするActionを作成する
 * @param {boolean} show 表示するかどうか
 */
export function changeSelectTemplateModalState(show) {    
    return { type: CHANGE_SELECTTEMPLATE_STATE, value:show };
}

/**
 * テンプレート選択モーダルの表示状態をセットするActionを作成する
 * @param {boolean} show 表示するかどうか
 */
export function changeAddTemplateModalState(show) {
    return { type: CHANGE_ADDTEMPLATE_STATE, value:show };
}

/**
 * 削除確認モーダルの表示状態をセットするActionを作成する
 * @param {boolean} show 表示するかどうか
 * @param {string} title タイトル
 * @param {srting} message メッセージ
 * @param {string} attenstion 注意喚起メッセージ
 */
export function changeDeleteComfirmModalState(show, message, attenstion) {
    return { type: CHANGE_DELETEMESSAGE_STATE, value:show, message:message, attenstion:attenstion };
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
 * 確認モーダルの表示状態をセットするActionを作成する
 * @param {boolean} show 表示するかどうか
 * @param {string} title タイトル
 * @param {srting} message メッセージ
 * @param {string} type 確認モーダルの種別
 * @param {function} callback コールバック関数 
 */
export function changeConfirmModalState(show, title, message, type, callback) {
    return { type: CHANGE_CONFIRM_STATE, value:show, title:title, message:message,confirmType: type, callback: callback };
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

/**
 * テンプレート適用中フラグをセットするActionを作成する
 * @param {boolean} isApplayTemplate テンプレート適用中フラグ
 */
export function setApplayTemplateState(isApplayTemplate){
    return { type: SET_APPLAYTEMPLATE_STATE, value:isApplayTemplate };

}