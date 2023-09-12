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
export const SET_POINTS = 'SET_POINTS';
export const SET_EDITED_POINTS = 'SET_EDITED_POINTS';
export const SET_MAINTENANCE_SCHEDULES = 'SET_MAINTENANCE_SCHEDULES';


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
 * ポイント情報をセットする
 * @param {any} points
 */
export function setPoints(points) {
    return { type: SET_POINTS, value: points };
}

/**
 * 編集中のポイントをセットする
 * @param {any} points
 */
export function setEditedPoints(points) {
    return { type: SET_EDITED_POINTS, value: points };
}

/**
 * メンテナンススケジュールをセットする
 * @param {any} schedules
 */
export function setMaintenanceSchedules(schedules) {
    return { type: SET_MAINTENANCE_SCHEDULES, value: schedules };
}