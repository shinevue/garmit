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
export const CHANGE_LOADSTATE = 'CHANGE_LOADSTATE';
export const CHANGE_LOADSTATE_CONDITION = 'CHANGE_LOADSTATE_CONDITION';
export const CHANGE_LOADSTATE_REALTIMEDATA = 'CHANGE_LOADSTATE_REALTIMEDATA';
export const SET_SEARCHCONDITION = 'SET_SEARCHCONDITION';
export const SET_CURRENT_DATA = 'SET_CURRENT_DATA';
export const SET_LAST_DATA = 'SET_LAST_DATA';
export const SET_CURRENT_CONVERTED_DATA = 'SET_CURRENT_CONVERTED_DATA';
export const SET_LAST_CONVERTED_DATA = 'SET_LAST_CONVERTED_DATA';

/**
 * ロード中の状態変更のActionオブジェクトを作成する
 * @param isLoad ロード中かどうか
 */
export function changeLoadState(isLoad) {
    return { type: CHANGE_LOADSTATE, value: isLoad };
}

/**
 * 検索条件のロード状態を変更する
 * @param {any} isLoad
 */
export function changeLoadState_condition(isLoad) {
    return { type: CHANGE_LOADSTATE_CONDITION, value: isLoad };
}

/**
 * リアルタイムデータのロード状態を変更する
 * @param {any} isLoad
 */
export function changeLoadState_realtimeData(isLoad) {
    return { type: CHANGE_LOADSTATE_REALTIMEDATA, value: isLoad };
}

/**
 * 現在の値を変更する
 * @param {any} currentData
 */
export function setCurrentData(currentData) {
    return { type: SET_CURRENT_DATA, value: currentData };
}

/**
 * 前回の値を変更する
 * @param {any} lastData
 */
export function setLastData(lastData) {
    return { type: SET_LAST_DATA, value: lastData };
}

/**
 * 現在の換算値を変更する
 * @param {any} currentConvertedData
 */
export function setCurrentConvertedData(currentConvertedData) {
    return { type: SET_CURRENT_CONVERTED_DATA, value: currentConvertedData };
}

/**
 * 前回の換算値を変更する
 * @param {any} lastConvertedData
 */
export function setLastConvertedData(lastConvertedData) {
    return { type: SET_LAST_CONVERTED_DATA, value: lastConvertedData };
}