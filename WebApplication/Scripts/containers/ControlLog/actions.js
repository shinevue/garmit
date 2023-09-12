/**
 * @license Copyright 2019 DENSO
 * 
 * ControlLogPanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

//Action名の定義

export const REQUEST_INIT_INFO = 'REQUEST_INIT_INFO';
export const REQUEST_GET_CONTROL_LOG_LIST = 'REQUEST_GET_CONTROL_LOG_LIST';

export const SET_MASTER_DATA = 'SET_MASTER_DATA';
export const SET_SPECIFIC_CONDITION = 'SET_SPECIFIC_CONDITION';
export const SET_EDIT_DATE = 'SET_EDIT_DATE';
export const SET_EDIT_CONTROLTYPE_CONDITION = 'SET_EDIT_CONTROLTYPE_CONDITION';
export const CLEAR_EDIT_SPECIFIC_CONDITION = 'CLEAR_EDIT_SPECIFIC_CONDITION';
export const SET_INVAILD_SEARCH = 'SET_INVAILD_SEARCH';

//ActionCenter

/**
 * 初期データ取得リクエスト
 */
export function requestInitInfo() {
    return { type: REQUEST_INIT_INFO };
}

/**
 * 制御履歴一覧取得のリクエスト
 * @param showNoneMessage 制御が0件のときメッセージを表示するか
 */
export function requestGetControlLogList(showNoneMessage = true) {
    return { type: REQUEST_GET_CONTROL_LOG_LIST, showNoneMessage };
}

/**
 * マスターデータをセットする
 * @param {array} controlTypes 実行種別リスト
 */
export function setMasterData(controlTypes) {
    return { type: SET_MASTER_DATA, controlTypes };
}

/**
 * 日付条件をセットする
 * @param {*} startDate 開始日時
 * @param {*} endDate 終了日時
 */
export function setDateCondition(startDate, endDate) {
    return { type: SET_EDIT_DATE, startDate, endDate };
}

/**
 * 実行種別条件をセットする
 * @param {array} controlTypes 実行種別リスト
 */
export function setControlTypeCondition(controlTypes) {
    return { type: SET_EDIT_CONTROLTYPE_CONDITION, controlTypes };
}

/**
 * 検索時の検索条件をセットする
 * @param {object} condition 検索条件
 */
export function setSpecificCondition(condition) {
    return { type: SET_SPECIFIC_CONDITION, condition };
}

/**
 * 検索時の検索条件をセットする
 * @param {object} condition 検索条件
 */
export function clearSpecificCondition(controlTypes) {
    return { type: CLEAR_EDIT_SPECIFIC_CONDITION, controlTypes };
}

/**
 * 検索の無効をセットする
 * @param {boolean} invaild 無効かどうか
 */
export function setInvaild(invaild) {
    return { type: SET_INVAILD_SEARCH, invaild };
}
