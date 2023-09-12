/**
 * @license Copyright 2020 DENSO
 * 
 * DashboardEditPanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

/********************************************
 * Action名
 ********************************************/

export const SET_DASHBOARDEDITINFO = 'SET_DASHBOARDEDITINFO';
export const SET_DISPSETTINGS = 'SET_DISPSETTINGS';

export const SET_INFORMATIONS = 'SET_INFORMATIONS';
export const SET_NAVIGATIONS = 'SET_NAVIGATIONS';
export const SET_OPERATIONLOGSETTING = 'SET_OPERATIONLOGSETTING';
export const SET_LINKS = 'SET_LINKS';

export const SET_LOADSTATE = 'SET_LOADSTATE';
export const SET_LOADSTATE_CONDITION = 'SET_LOADSTATE_CONDITION';
export const SET_LOADSTATE_RESULT = 'SET_LOADSTATE_RESULT';

/********************************************
 * ActionCenter
 ********************************************/

/**
 * マスタデータをセットする
 * @param {any} setDashboardEditInfo
 */
export function setDashboardEditInfo(dashboardEditInfo) {
    return { type: SET_DASHBOARDEDITINFO, value: dashboardEditInfo };
}

/**
 * 表示設定を更新する
 * @param {any} setDispSettings
 */

export function setDispSettings(dispSettings) {
    return { type: SET_DISPSETTINGS, value: dispSettings };
}


/**
 * ダッシュボードのお知らせをセットする
 * @param {any} informations
 */
export function setInformations(informations) {
    return { type: SET_INFORMATIONS, value: informations };
}

/**
 * ダッシュボードのナビゲーションをセットする
 * @param {any} navigations
 */
export function setNavigations(navigations) {
    return { type: SET_NAVIGATIONS, value: navigations };
}

/**
 * ダッシュボードのオペレーションログの設定値をセットする
 * @param {any} operationLogSetting
 */
export function setOperationLogSetting(operationLogSetting) {
    return { type: SET_OPERATIONLOGSETTING, value: operationLogSetting };
}

/**
 * ダッシュボードのリンクをセットする
 * @param {any} links
 */
export function setLinks(links) {
    return { type: SET_LINKS, value: links };
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