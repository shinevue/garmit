/**
 * @license Copyright 2020 DENSO
 *
 * ELockOpLogPanelのAction(ActionCreator)を定義する。
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
export const SET_ICCARD_TYPE = 'SET_ICCARD_TYPE';
export const SET_LOGIN_USER = 'SET_LOGIN_USER';
export const SET_ELOCKOPLOG_RESULT = 'SET_ELOCKOPLOG_RESULT';
export const SET_LOADSTATE = 'SET_LOADSTATE';
export const SET_LOADSTATE_CONDITION = 'SET_LOADSTATE_CONDITION';
export const SET_LOADSTATE_RESULT = 'SET_LOADSTATE_RESULT';
export const SET_SEARCH_CONDITION = 'SET_SEARCH_CONDITION';
export const SET_IS_CARD_OPERATION = 'SET_IS_CARD_OPERATION';

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
 * ICカード種別をセットする
 * @param {number} icCardType ICカード種別
 */
export function setICCardType(icCardType) {
    return { type: SET_ICCARD_TYPE, icCardType };
}

/**
 * ログインユーザー情報
 * @param {*} loginUser
 */
export function setLoginUser(loginUser) {
    return { type: SET_LOGIN_USER, value:loginUser };
}

/**
 * 電気錠ログ一覧をセットする
 * @param {any} result
 */
export function setELockOpLogResult(result) {
    return { type: SET_ELOCKOPLOG_RESULT, value: result };
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
 * 表示中検索結果の検索条件
 * @param {*} data
 */
export function setSearchCondition(data) {
    return { type: SET_SEARCH_CONDITION, value: data };
}

/**
 * カード操作条件かどうかをセットする
 * @param {boolean} isCardOperation カード操作条件を選択しているかどうか
 */
export function setIsCardOperation(isCardOperation) {
    return { type: SET_IS_CARD_OPERATION, value: isCardOperation };
}
