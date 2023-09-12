/**
 * Copyright 2017 DENSO Solutions
 * 
 * Action(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 */


//Action 名の定義
//Action名は、一意になるように注意してください
export const SET_LOADSTATE = 'SET_LOADSTATE';
export const SET_LOADSTATE_CONDITION = 'SET_LOADSTATE_CONDITION';
export const SET_LOADSTATE_RESULT = 'SET_LOADSTATE_RESULT';

export const SET_LOOKUP = 'SET_LOOKUP';
export const SET_LAST_SEARCH_CONDITON = 'SET_LAST_SEARCH_CONDITON';
export const SET_ALARM_RESULT = 'SET_ALARM_RESULT';
export const SET_CONTACT_CHANGE_RESULT = 'SET_CONTACT_CHANGE_RESULT';
export const SET_ALARM_RESULT_DISPLAY_STATE = 'SET_ALARM_RESULT_DISPLAY_STATE';
export const SET_CONTACT_CHANGE_RESULT_DISPLAY_STATE = 'SET_CONTACT_CHANGE_RESULT_DISPLAY_STATE';


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
 * マスタデータをセットする
 * @param {any} lookUp
 */
export function setLookUp(lookUp) {
    return { type: SET_LOOKUP, value: lookUp };
}

/**
 * 前回の検索条件をセットする
 * @param {any} condition
 */
export function setLastSearchCondition(condition) {
    return { type: SET_LAST_SEARCH_CONDITON, value: condition };
}

/**
 * アラーム一覧をセットする
 * @param {any} alarmResult
 */
export function setAlarmResult(alarmResult) {
    return { type: SET_ALARM_RESULT, value: alarmResult };
}

/**
 * 接点状態変化一覧をセットする
 * @param {any} contactChangeResult
 */
export function setContactChangeResult(contactChangeResult) {
    return { type: SET_CONTACT_CHANGE_RESULT, value: contactChangeResult };
}

/**
 * アラーム一覧の表示状態をセットする
 * @param {any} state
 */
export function setAlarmResultDisplayState(state) {
    return { type: SET_ALARM_RESULT_DISPLAY_STATE, value: state };
}

/**
 * 接点状態変化一覧の表示状態をセットする
 * @param {any} state
 */
export function setContactChangeResultDisplayState(state) {
    return { type: SET_CONTACT_CHANGE_RESULT_DISPLAY_STATE, value: state };
}