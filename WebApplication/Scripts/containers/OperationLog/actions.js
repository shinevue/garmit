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

export const SET_LOOKUP = 'SET_LOOKUP';
export const SET_OPERATIONLOG_RESULT = 'SET_OPERATIONLOG_RESULT';
export const SET_LOADSTATE = 'SET_LOADSTATE';
export const SET_LOADSTATE_CONDITION = 'SET_LOADSTATE_CONDITION';
export const SET_LOADSTATE_RESULT = 'SET_LOADSTATE_RESULT';

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
 * オペレーションログ一覧をセットする
 * @param {any} result
 */
export function setOperationLogResult(result) {
    return { type: SET_OPERATIONLOG_RESULT, value: result };
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