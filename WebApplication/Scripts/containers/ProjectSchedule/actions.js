/**
 * @license Copyright 2020 DENSO
 * 
 * Action(ActionCreator)を定義する。
 * 
 */
'use strict';

//#region Action名
//#region sagaへのリクエスト（複数reducer書き換え）
export const REQUEST_REFRESH = 'REQUEST_REFRESH';
export const REQUEST_CHANGE_DISPSETTING = 'REQUEST_CHANGE_DISPSETTING';
//#endregion

//#region scheduleList
export const SET_SCHEDULES = 'SET_SCHEDULES'; 
//#endregion

//#region dispScheduleList
export const SET_DISP_SCHEDULE_LIST = 'SET_DISP_SCHEDULE_LIST'
//#endregion

//#region selectSchedules
export const SET_SELECT = 'SET_SELECT';
export const REMOVE_SELECT = 'REMOVE_SELECT';
export const CLEAR_SELECT = 'CLEAR_SELECT';
export const UPDATE_SELECT = 'UPDATE_SELECT';
//#endregion

//#region dispSetting
export const SET_DISPSETTING = 'SET_DISPSETTING';
//#endregion

//#endregion

//#region ActionCreator
//#region sagaへのリクエスト

/**
 * 表示更新
 * @param {*} startDate 開始日時
 * @param {*} endDate 終了日時
 */
export function requestRefresh(startDate, endDate) {
    return { type: REQUEST_REFRESH, startDate, endDate };
}

/**
 * 表示設定を変更する
 * @param {boolean} visible 表示するかどうか
 * @param {number} scheduleType 変更するスケジュール種別
 */
export function requestChangeDispSetting(visible, scheduleType) {
    return { type: REQUEST_CHANGE_DISPSETTING, visible, scheduleType }
}

//#endregion

/**
 * スケジュール一覧をセットする
 * @param {array} data スケジュール一覧
 */
export function setScheduleList(data) {
    return { type: SET_SCHEDULES, data };
}

/**
 * 表示用スケジュール一覧
 * @param {array} data スケジュール一覧
 */
export function setDispScheduleList(data) {
    return { type: SET_DISP_SCHEDULE_LIST, data }
}

/**
 * スケジュールを選択する
 * @param {object} schedule 選択したスケジュール
 */
export function setSelect(schedule) {
    return { type: SET_SELECT, schedule };
}

/**
 * スケジュールの選択を解除する
 * @param {object} schedule ケジュール
 */
export function removeSelect(schedule) {
    return { type: REMOVE_SELECT, schedule };
}

/**
 * スケジュール選択をクリアする
 */
export function clearSelect() {
    return { type: CLEAR_SELECT };
}

/**
 * 選択中スケジュールを更新する
 * @param {array} schedules 更新後のスケジュール情報
 */
export function updateSelect(schedules) {
    return { type: UPDATE_SELECT, schedules }
}

/**
 * 表示設定を設定する
 * @param {object} dispSetting 表示設定
 */
export function setDispSetting(dispSetting) {
    return { type: SET_DISPSETTING, dispSetting }
}

//#endregion
