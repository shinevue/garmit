/**
 * @license Copyright 2020 DENSO
 *
 * TopPanelのAction(ActionCreator)を定義する。
 *
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 *
 */
'use strict';

/********************************************
 * Action名
 ********************************************/

export const SET_DASHBOARDINFO = 'SET_DASHBOARDINFO';
export const SET_INFORMATIONS = 'SET_INFORMATIONS';
export const SET_SCHEDULES = 'SET_SCHEDULES';
export const SET_INCIDENTLOG = 'SET_INCIDENTLOG';
export const SET_OPERATIONLOG = 'SET_OPERATIONLOG';
export const SET_LOADSTATE = 'SET_LOADSTATE';
export const SET_LOADSTATE_CONDITION = 'SET_LOADSTATE_CONDITION';
export const SET_LOADSTATE_RESULT = 'SET_LOADSTATE_RESULT';

/********************************************
 * ActionCenter
 ********************************************/

/**
 * ダッシュボードのすべてのデータをセットする
 * @param {any} dashboardInfo
 */
export function setDashboardInfo(dashboardInfo) {
    return { type: SET_DASHBOARDINFO, value: dashboardInfo };
}

/**
 * ダッシュボードのお知らせをセットする
 * @param {any} informations
 */
export function setInformations(informations) {
    return { type: SET_INFORMATIONS, value: informations };
}

/**
 * ダッシュボードのスケジュールをセットする
 * @param {any} schedules
 */
export function setSchedules(schedules) {
    return { type: SET_SCHEDULES, value: schedules };
}

/**
 * ダッシュボードのインシデントログをセットする
 * @param {any} incidentLog
 */
export function setIncidentLog(incidentLog) {
    return { type: SET_INCIDENTLOG, value: incidentLog };
}

/**
 * ダッシュボードのオペレーションログをセットする
 * @param {any} operationLog
 */
export function setOperationLog(operationLog) {
    return { type: SET_OPERATIONLOG, value: operationLog };
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