/**
 * @license Copyright 2019 DENSO
 * 
 * BatteryPanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

//#region Action名の定義

//sagaへのリクエスト
export const REQUEST_INIT_INFO = 'REQUEST_INIT_INFO';
export const REQUEST_UPDATE = 'REQUEST_UPDATE';
export const REQUEST_UPDATE_MEASURE_DATA = 'REQUEST_UPDATE_MEASURE_DATA';
export const REQUEST_SELECT_BATTERY = 'REQUEST_SELECT_BATTERY';
export const REQUEST_GET_OUTPUT_LIST ='REQUEST_GET_OUTPUT_LIST';
export const REQUEST_SET_REMEASURE = 'REQUEST_SET_REMEASURE';

export const SET_DATATYPES = 'SET_DATATYPES';
export const SET_DATAGETE_LIST = 'SET_DATAGETE_LIST';
export const SET_SELECTED_BATTERY_DATA = 'SET_SELECTED_BATTERY_DATA';
export const SET_OUTPUT_RESULT = 'SET_OUTPUT_RESULT';
export const START_UPDATE = 'START_UPDATE';
export const END_UPDATE = 'END_UPDATE';

//#endregion

/************************************
 * 
 * ActionCenter
 * 
 ***********************************/

/**
 * 初期化のリクエスト
 */
export function requestInitInfo(data) {
    return { type:REQUEST_INIT_INFO, data };
}

/**
 * 更新のリクエスト
 */
export function requestUpdate(data) {
    return { type: REQUEST_UPDATE, data };
}

/**
 * 更新のリクエスト（測定値一覧のみ）
 */
export function requestUpdateMeasuredData(){
    return { type: REQUEST_UPDATE_MEASURE_DATA };
}

/**
 * バッテリ選択のリクエスト
 */
export function requestSelectBattery(data) {
    return { type: REQUEST_SELECT_BATTERY, data};
}

/**
 * CSV出力内容取得のリクエスト
 */
export function requestGetOutputList(data) {
    return { type: REQUEST_GET_OUTPUT_LIST, data};
}

/**
 * 再測定のリクエスト
 */
export function requestSetRemeasure(data) {
    return { type: REQUEST_SET_REMEASURE, data};
}

/**
 * データ種別を設定する
 */
export function setDataTypes(data) {
    return { type: SET_DATATYPES, data };
}

/**
 * CSV出力情報一覧を設定する
 */
export function setOutputResult(data) {
    return { type: SET_OUTPUT_RESULT, data };
}

/**
 * バッテリーの計測値情報を設定する
 */
export function setSelectedBatteryData(data) {
    return { type: SET_SELECTED_BATTERY_DATA, data };
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