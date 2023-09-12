/**
 * @license Copyright 2021 DENSO
 * 
 * ラック施開錠端末画面のAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';


//#region Action名の定義

//sagaへのリクエスト（複数reducer書き換え）
export const REQUEST_REFRESH_ICTERMINAL_RESULT = 'REQUEST_REFRESH_ICTERMINAL_RESULT'
export const REQUEST_EDIT_ICTERMINAL = 'REQUEST_EDIT_ICTERMINAL';
export const REQUEST_SAVE = 'REQUEST_SAVE';
export const REQUEST_DELETE = 'REQUEST_DELETE';

export const SET_EDIT = 'SET_EDIT';
export const CHANGE_EDIT_IC_TERMINAL = 'CHANGE_EDIT_IC_TERMINAL';
export const CLEAR_EDIT = 'CLEAR_EDIT';
export const SET_LOCATIONS = 'SET_LOCATIONS';
export const SET_DELETE_TERM_NOS = 'SET_DELETE_TERM_NOS';
export const START_UPDATE = 'START_UPDATE';
export const END_UPDATE = 'END_UPDATE';

//#endregion

//#region ActionCenter

//#region sagaへのリクエスト

/**
 * ラック施開錠端末一覧リフレッシュのリクエスト
 */
 export function requestRefreshICTerminalList() {
    return { type: REQUEST_REFRESH_ICTERMINAL_RESULT };
}

/**
 * 編集中のラック施開錠端末情報セットのリクエスト
 * @param {number} termNo 端末番号
 * @param {boolean} isRegister 新規かどうか
 * @param {function} callback コールバック関数
 */
export function requestEditICTerminal(termNo, isRegister, callback) {
    return { type: REQUEST_EDIT_ICTERMINAL, termNo, isRegister, callback };
}

/**
 * ラック施開錠端末保存のリクエスト
 */
 export function requestSave() {
    return { type: REQUEST_SAVE };
}

/**
 * ラック施開錠端末削除のリクエスト
 */
export function requestDelete() {
    return { type: REQUEST_DELETE };
}

//#endregion

/**
 * 編集中ラック施開錠端末情報をセットする
 * @param {object} iCTerminal スケジュール情報
 * @param {boolean} isRegister 新規作成かどうか
 */
 export function setEditICTerminal(iCTerminal, isRegister) {
    return { type:SET_EDIT, value: iCTerminal, isRegister };
}

/**
 * 編集中ラック施開錠端末情報を変更する
 * @param {string} key 編集するキー
 * @param {object} value 編集データ
 * @param {boolean} isError 入力エラーかどうか
 */
export function changeEditICTerminal(key, value, isError) {
    return { type:CHANGE_EDIT_IC_TERMINAL, key, value, isError };
}

/**
 * 編集中ラック施開錠端末情報をクリアする
 */
 export function clearEditICTerminal() {
    return { type:CLEAR_EDIT };
}


/**
 * ロケーション一覧（ロケーションツリー情報）をセットする
 * @param {array} locations ロケーション一覧
 */
 export function setLocations(locations) {
    return { type: SET_LOCATIONS, locations };
}

/**
 * 削除対象の端末番号リストをセットする
 * @param {array} termNos 端末番号リスト
 */
export function setDeleteICTerminalNos(termNos) {
    return { type: SET_DELETE_TERM_NOS, termNos };
}

/**
 * 更新を開始する
 */
export function startUpdate(data) {
    return { type: START_UPDATE, data };
}

/**
 * 更新を終了する 
 */
export function endUpdate(data) {
    return { type: END_UPDATE, data };
}

//#endregion