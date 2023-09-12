/**
 * @license Copyright 2021 DENSO
 * 
 * CardReadLogPanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

//Action名の定義
export const REQUEST_INIT_INFO = 'REQUEST_INIT_INFO';
export const REQUEST_GET_CARD_READ_LOG_LIST = 'REQUEST_GET_CARD_READ_LOG_LIST';

export const SET_EDIT_DATE_CONDITION = 'SET_EDIT_DATE_CONDITION';
export const SET_LAST_SEARCH_CONDITION = 'SET_LAST_SEARCH_CONDITION';

//ActionCenter

/**
 * 初期データ取得リクエスト
 */
 export function requestInitInfo() {
    return { type: REQUEST_INIT_INFO };
}

/**
 * カード読み取りログ一覧取得のリクエスト
 * @param showNoneMessage 制御が0件のときメッセージを表示するか
 */
export function requestGetCardReadLogLis(showNoneMessage = true) {
    return { type: REQUEST_GET_CARD_READ_LOG_LIST, showNoneMessage };
}

/**
 * 編集中の期間条件をセットする
 * @param {*} startDate 開始日時
 * @param {*} endDate 終了日時
 * @param {*} dateSpecified 日付範囲を選択するかどうか
 * @param {*} validate 入力検証結果
 */
export function setEditingDateCondition(startDate, endDate, dateSpecified, validate) {
    return { type: SET_EDIT_DATE_CONDITION, startDate, endDate, dateSpecified, validate };
}

/**
 * 直近の検索時の検索条件をセットする
 * @param {object} condition 検索条件  { lookUp: { ... } , iCCardCondition: { ... } }
 */
export function setLastSearchCondition(condition) {
    return { type: SET_LAST_SEARCH_CONDITION, condition };
}