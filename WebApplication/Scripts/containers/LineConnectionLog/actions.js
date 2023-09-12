/**
 * @license Copyright 2018 DENSO
 * 
 * LineConnectionLogPanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

/********************************************
 * Action名
 ********************************************/

export const SET_LOOKUP = 'SET_LOOKUP';
export const SET_CONDITION_LIST = 'SET_CONDITION_LIST';
export const SET_LINECONNECTIONLOG_RESULT = 'SET_LINECONNECTIONLOG_RESULT';
export const SET_LOADSTATE = 'SET_LOADSTATE';
export const SET_LOADSTATE_CONDITION = 'SET_LOADSTATE_CONDITION';
export const SET_LOADSTATE_RESULT = 'SET_LOADSTATE_RESULT';
export const SET_LOADSTATE_CONDITION_LIST = 'SET_LOADSTATE_CONDITION_LIST';
export const SET_LINECONNECTIONLOG_DISPLAY_STATE = 'SET_LINECONNECTIONLOG_DISPLAY_STATE';

/********************************************
 * ActionCenter
 ********************************************/

/**
 * マスタデータをセットする
 * @param {any} lookUp
 */
export function setLookUp(lookUp) {
    return { type: SET_LOOKUP, value: lookUp };
}

/**
 * 登録済み検索条件リストをセットする
 * @param {array} conditionList 検索条件リスト
 * @returns 
 */
export function setConditionList(conditionList) {
    return { type: SET_CONDITION_LIST, value: conditionList }
}

/**
 * 回線接続履歴一覧をセットする
 * @param {any} result
 */
export function setLineConnectionLogResult(result) {
    return { type: SET_LINECONNECTIONLOG_RESULT, value: result };
}

/**
 * 回線接続一覧の表示状態をセットする
 * @param {any} setting 設定情報
 */
export function setLineConnectionLogDisplayState(setting) {
    return { type: SET_LINECONNECTIONLOG_DISPLAY_STATE, value: setting };
}

/**
 * ロード中の状態をセットする
 * @param isLoad ロード中かどうか
 */
export function setLoadState(isLoad) {
    return { type: SET_LOADSTATE, value: isLoad };
}

/**
 * 検索条件のロード中の状態をセットする
 * @param {any} isLoad
 */
export function setLoadState_condition(isLoad) {
    return { type: SET_LOADSTATE_CONDITION, value: isLoad };
}

/**
 * 検索結果のロード中の状態をセットする
 * @param {any} isLoad
 */
export function setLoadState_result(isLoad) {
    return { type: SET_LOADSTATE_RESULT, value: isLoad };
}

/**
 * 保存済み検索条件一覧のロード中の状態をセットする
 * @param {any} isLoad ロード中かどうか
 */
export function setLoadState_coditionList(isLoad) {
    return { type: SET_LOADSTATE_CONDITION_LIST, value: isLoad };
}