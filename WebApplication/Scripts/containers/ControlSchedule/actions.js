/**
 * @license Copyright 2019 DENSO
 * 
 * ControlSchedulePanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

//#region Action名の定義

//#region sagaへのリクエスト
export const REQUEST_REFRESH = 'REQUEST_REFRESH';
export const REQUEST_EDIT_SCHEDULE = 'REQUEST_EDIT_SCHEDULE';
export const REQUEST_SAVE ='REQUEST_SAVE';
export const REQUEST_DELETE = 'REQUEST_DELETE';
export const REQUEST_RELATED_CONTROL_COMMANDS = 'REQUEST_RELATED_CONTROL_COMMANDS';
export const REQUEST_CHANGE_SCHEDULE = 'REQUEST_CHANGE_SCHEDULE';
//#endregion

//#region schedulePlans
export const SET_SCHEDULE_PLANS = 'SET_SCHEDULE_PLANS'; 
//#endregion

//#region selectSchedules
export const SET_SELECT = 'SET_SELECT';
export const REMOVE_SELECT = 'REMOVE_SELECT';
export const CLEAR_SELECT = 'CLEAR_SELECT';
export const UPDATE_SELECT = 'UPDATE_SELECT';
//#endregion

//#region editing
export const SET_EDIT = 'SET_EDIT';
export const CHANGE_SCHEDULE = 'CHANGE_SCHEDULE';
export const CHANGE_SCHEDULE_COMMANDS = 'CHANGE_SCHEDULE_COMMANDS';
export const CLEAR_EDIT = 'CLEAR_EDIT';
export const CHANGE_VALIDATE = 'CHANGE_VALIDATE';
export const CHANGE_INVALID_SCHEDULE = 'CHANGE_INVALID_SCHEDULE';
//#endregion

//#region userInfo
export const SET_USER_INFO = 'SET_USER_INFO';
//#endregion

//#region location
export const SET_LOCATIONS = 'SET_LOCATIONS';
//#endregion

//#region controlCommands
export const SET_CONTROL_COMMANDS = 'SET_CONTROL_COMMANDS';
//#endregion

//#endregion

//#region ActionCenter

//#region sagaへのリクエスト

/**
 * スケジュール表示画面リフレッシュのリクエスト
 */
export function requestRefresh() {
    return { type: REQUEST_REFRESH };
}

/**
 * 編集中スケジュール情報設定のリクエスト
 * @param {number} scheduleId スケジュールID
 */
export function requestSetEditSchedule(scheduleId, isRegister = false, startDate = null, callback = null) {
    return { type: REQUEST_EDIT_SCHEDULE, scheduleId, isRegister, startDate, callback };
}

/**
 * スケジュール保存のリクエスト
 * @param {obejct} data スケジュール情報
 */
export function requestSave(data) {
    return { type: REQUEST_SAVE, data  };
}

/**
 * スケジュールを削除する
 * @param {array} scheduleId スケジュールID（選択中のすべてのスケジュールを削除するときは指定なし）
 */
export function requestDelete(scheduleId) {
    return { type: REQUEST_DELETE, scheduleId };
}

/**
 * 所属選択時に関連するデータを変更するリクエスト
 * @param {array} enterpriseIds 所属IDリスト
 */
export function requestChangeRelatedControlCommands(enterpriseIds) {
    return { type: REQUEST_RELATED_CONTROL_COMMANDS, enterpriseIds };
}

/**
 * スケジュールを変更するリクエスト
 * @param {string} key キー項目
 * @param {*} value 変更後の値
 */
export function requestChangeSchedule(key, value) {
    return { type: REQUEST_CHANGE_SCHEDULE, key, value };
}

//#endregion

//#region schedulePlans

/**
 * スケジュール表示一覧を設定する
 * @param {array} data スケジュール表示一覧
 */
export function setSchedulePlans(data) {
    return { type: SET_SCHEDULE_PLANS, data };
}

//#endregion

//#region selectSchedules
/**
 * 選択中スケジュール情報をセットする
 * @param {object} data 追加するスケジュール情報
 */
export function setSelect(data) {
    return { type: SET_SELECT, data };
}

/**
 * 選択中スケジュールから1件削除する
 * @param {object} scheduleId 削除するスケジュールID
 */
export function removeSelect(scheduleId) {
    return { type: REMOVE_SELECT, scheduleId };
}

/**
 * 選択中スケジュールをクリアする
 */
export function clearSelect() {
    return { type: CLEAR_SELECT };
}

/**
 * 選択中スケジュールを更新する
 * @param {array} schedulePlans 更新後のスケジュール情報
 */
export function updateSelect(schedulePlans) {
    return { type: UPDATE_SELECT, schedulePlans }
}
//#endregion

//#region editing
/**
 * 編集中スケジュールを設定する
 * @param {object} data スケジュール情報
 */
export function setEdit(data, isRegister = false ) {
    return { type: SET_EDIT, data, isRegister };
}

/**
 * 編集中スケジュール情報を変更する
 * @param {string} key 編集するキー
 * @param {object} value 編集データ
 * @param {boolean} isError 入力エラーかどうか
 */
export function changeSchedule(key, value) {
    return { type: CHANGE_SCHEDULE, key, value };
}

/**
 * 編集中スケジュール情報の実行コマンドを変更する
 * @param {array} commands 編集後のコマンド一覧
 * @param {boolean} isError 入力エラーかどうか
 */
export function changeScheduleCommands(commands, isError) {
    return { type: CHANGE_SCHEDULE_COMMANDS, commands, isError };
}

/**
 * 編集中スケジュール情報をクリアする
 */
export function clearEdit() {
    return { type: CLEAR_EDIT };
}

/**
 * 入力検証の変更
 * @param {string} key 編集するキー
 * @param {object} schedule 編集後のスケジュール情報
 */
export function changeValidate(key, schedule) {
    return { type: CHANGE_VALIDATE, schedule }
}

/**
 * スケジュール情報（制御コマンドリスト以外）の無効状態を変更する
 * @param {object} validate 入力検証結果
 */
export function changeInvalidSchedule(validate){
    return { type: CHANGE_INVALID_SCHEDULE, validate }
}
//#endregion

//#region enterprises
/**
 * 所属一覧（ツリー）を設定する
 * @param {object} mainEnterprise ログインユーザーのメイン所属
 * @param {array} enterprises 所属一覧
 */
export function setUserInfo(mainEnterprise, enterprises) {
    return { type: SET_USER_INFO, mainEnterprise, enterprises };
}
//#endregion

//#region location
/**
 * ロケーション一覧を設定する
 * @param {array} data ロケーション一覧
 */
export function setLocations(data) {
    return { type: SET_LOCATIONS, data };
}
//#endregion

//#region controlCommands
/**
 * 制御コマンド一覧を設定する
 * @param {array} data 制御コマンド一覧
 */
export function setControlCommands(data) {
    return { type: SET_CONTROL_COMMANDS, data };
}
//#endregion

//#endregion