/**
 * @license Copyright 2018 DENSO
 * 
 * NetworkListPanel及びNetworkEditPanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

/********************************************
 * Action名
 ********************************************/
export const REQUEST_INITIAL_INFO = 'REQUEST_INITIAL_INFO';
export const REQUEST_NETWORKPATH_ROWS = 'REQUEST_NETWORKPATH_ROWS';
export const REQUEST_SELECT_NETWORK = 'REQUEST_SELECT_NETWORK';
export const REQUEST_EDIT_NETWORK = 'REQUEST_EDIT_NETWORK';
export const REQUEST_DELETE_NETWORK_ROWS = 'REQUEST_DELETE_NETWORK_ROWS';

export const SET_NETWORKPATH_ROWS = 'SET_NETWORKPATH_ROWS';
export const SET_NETWORKPATH_LIST = 'SET_NETWORKPATH_LIST'; 
export const SET_NETWORKPATH = 'SET_NETWORKPATH'; 
export const CLEAR_NETWORKPATH = 'CLEAR_NETWORKPATH';

export const SET_LAYOUTS = 'SET_LAYOUTS';
export const SET_CABLETYPES = 'SET_CABLETYPES';
export const SET_LOADSTATE = 'SET_LOADSTATE';
export const CHANGE_DELETEMESSAGE_STATE = 'CHANGE_DELETEMESSAGE_STATE';
export const CHANGE_MESSAGE_STATE = 'CHANGE_MESSAGE_STATE';
export const CHANGE_CONFIRM_STATE = 'CHANGE_CONFIRM_STATE';
export const SET_TABLE_DISPLAYSTATE = 'SET_TABLE_DISPLAYSTATE';
 
/********************************************
 * ActionCenter
 ********************************************/

//#region sagaへのリクエスト

/**
 * 初期情報のリクエスト
 */
export function requestInitialInfo() {
    return { type:REQUEST_INITIAL_INFO };
}

/**
 * ネットワーク経路一覧取得のリクエスト
 * @param {object} lookUp 検索条件
 */
export function requestGetNetworkPathRows() {
    return { type:REQUEST_NETWORKPATH_ROWS };
}

/**
 * 選択中ネットワーク情報のリクエスト
 * @param {object} networkRow ネットワーク行情報
 */
export function requestSelectNetworkInfo(networkRow) {
    return { type:REQUEST_SELECT_NETWORK, networkRow };
}

/**
 * 編集中ネットワーク情報のリクエスト
 * @param {object} networkRow ネットワーク行情報
 */
export function requestEditNetworkInfo(networkRow, callback) {
    return { type:REQUEST_EDIT_NETWORK, networkRow, callback };
}

/**
 * ネットワーク情報削除のリクエスト（複数）
 * @param {array} networkRows 削除するネットワーク情報
 */
export function requestDeleteNetworks(networkRows, callback) {
    return { type:REQUEST_DELETE_NETWORK_ROWS, networkRows, callback };
}

//#endregion

/**
 * ネットワーク経路一覧表をセットするActionを作成する
 * @param {array} networkPathRows ネットワーク一覧
 */
export function setNetworkPathRows(networkPathRows) {
    return { type:SET_NETWORKPATH_ROWS, networkPathRows };
}

/**
 * ネットワーク一覧をセットするActionを作成する
 * @param {} networkPaths ネットワーク一覧
 */
export function setNetworkPaths(networkPaths) {
    return { type:SET_NETWORKPATH_LIST, networkPaths:networkPaths };
}

/**
 * 選択中のネットワーク情報をセットするActionを作成する
 * @param {object} networkRow ネットワーク経路一覧の行情報
 * @param {object} networkPath ネットワーク情報
 */
export function setNetworkPath(networkRow, networkPath) {
    return { type:SET_NETWORKPATH, networkRow, networkPath };
}

/**
 * 選択中のネットワーク情報をクリアする
 */
export function clearNetworkPath(){
    return { type: CLEAR_NETWORKPATH };
}

/**
 * レイアウトリストをセットするActionを作成する
 * @param {array} layouts レイアウトリスト
 */
export function setLayouts(layouts) {
    return { type:SET_LAYOUTS, layouts };
}

/**
 * ケーブル種別をセットするActionを作成する
 * @param {array} cableTypes ケーブル種別リスト
 */
export function setCableTypes(cableTypes) {
    return { type: SET_CABLETYPES, value:cableTypes };
}

/**
 * ロード状態をセットするActionを作成する
 * @param {boolean} isLoading ロード中かどうか
 */
export function setLoadState(isLoading) {
    return { type: SET_LOADSTATE, value:isLoading };
}

/**
 * 削除確認モーダルの表示状態をセットするActionを作成する
 * @param {boolean} show 表示するかどうか
 * @param {string} title タイトル
 * @param {element} message メッセージ
 * @param {array} targets 削除対象ネットワーク一覧
 */
export function changeDeleteComfirmModalState(show, message, targets) {
    return { type: CHANGE_DELETEMESSAGE_STATE, value:show, message:message, targets: targets };
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
 * @param {function} callback コールバック関数 
 */
export function changeConfirmModalState(show, title, message, callback) {
    return { type: CHANGE_CONFIRM_STATE, value:show, title:title, message:message, callback: callback };
}

/**
 * ネットワーク一覧の表示設定をセットするActionを作成する
 * @param {object} displayState ネットワーク一覧
 */
export function setTableDisplayState(displayState) {
    return { type:SET_TABLE_DISPLAYSTATE, displayState:displayState };
}