/**
 * @license Copyright 2019 DENSO
 * 
 * ReportSchedulePanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

//#region Action名の定義

//sagaへのリクエスト（複数reducer書き換え）
export const REQUEST_INITIAL_INFO = 'REQUEST_INITIAL_INFO';
export const REQUEST_REFRESH_SCHEDULE_RESULT = 'REQUEST_REFRESH_SCHEDULE_RESULT'
export const REQUEST_EDIT_SCHEDULE = 'REQUEST_EDIT_SCHEDULE';
export const REQUEST_CLEAR_EDIT_SCHEDULE = 'REQUEST_CLEAR_EDIT_SCHEDULE';
export const REQUEST_SAVE = 'REQUEST_SAVE';
export const REQUEST_DELETE = 'REQUEST_DELETE';
export const REQUEST_OUTPUTFILE_RESULT  = 'REQUEST_OUTPUTFILE_RESULT';
export const REQUEST_DELETE_FILES = 'REQUEST_DELETE_FILES';
export const REQUEST_CHANGE_ENTERPRISE = 'REQUEST_CHANGE_ENTERPRISE';

export const SET_EDIT = 'SET_EDIT';
export const CHANGE_SCHEDULE_OVERVIEW = 'CHANGE_SCHEDULE_OVERVIEW';
export const CHANGE_SCHEDULE_CONDITION = 'CHANGE_SCHEDULE_CONDITION';
export const CHANGE_SCHEDULE_OUTPUTINFO = 'CHANGE_SCHEDULE_OUTPUTINFO';
export const CLEAR_EDIT = 'CLEAR_EDIT';
export const SET_SELECTED_SCHEDULE_ID = 'SET_SELECTED_SCHEDULE_ID';
export const CLEAR_SELECTED_SCHEDULE_ID = 'CLEAR_SELECTED_SCHEDULE_ID';
export const SET_OUTPUTFILE_RESULT = 'SET_OUTPUTFILE_RESULT';
export const CLEAR_OUTPUTFILE_RESULT = 'CLEAR_OUTPUTFILE_RESULT';
export const CLEAR_OUTPUTFILES = 'CLEAR_OUTPUTFILES';
export const SET_ENTERPRISES = 'SET_ENTERPRISES';
export const SET_DELETE_SCHEDULEIDS = 'SET_DELETE_SCHEDULEIDS';
export const SET_DELETE_FILES = 'SET_DELETE_FILES';
export const CLEAR_DELETE_FILES = 'CLEAR_DELETE_FILES';
export const CHANGE_SHOW_DOWNLOAD_MODAL = 'CHANGE_SHOW_DOWNLOAD_MODAL';
export const START_UPDATE = 'START_UPDATE';
export const END_UPDATE = 'END_UPDATE';

//#endregion

//#region ActionCenter

//#region sagaへのリクエスト

/**
 * 初期化のリクエスト
 */
export function requestInitialInfo() {
    return { type: REQUEST_INITIAL_INFO };
}

/**
 * スケジュール一覧リフレッシュのリクエスト
 * @param {*} data 
 */
export function requestRefreshSchedlueList(data) {
    return { type: REQUEST_REFRESH_SCHEDULE_RESULT, data };
}

/**
 * 編集スケジュールセットのリクエスト
 * @param {number} scheduleId スケジュールID
 */
export function requestEditSchedule(scheduleId, isRegister, callback) {
    return { type: REQUEST_EDIT_SCHEDULE, scheduleId: scheduleId, isRegister, callback };
}

/**
 * 編集スケジュールクリアのリクエスト
 */
export function requestClearEditSchedule(){
    return { type: REQUEST_CLEAR_EDIT_SCHEDULE };
}

/**
 * 所属変更するリクエスト
 * @param {number} enterprise 選択所属情報
 * @param {boolean} isError エラーかどうか
 */
export function requestChangeEnterprise(enterprise, isError) {
    return { type: REQUEST_CHANGE_ENTERPRISE, enterprise, isError };
}

/**
 * スケジュール保存のリクエスト
 */
export function requestSave() {
    return { type: REQUEST_SAVE };
}

/**
 * スケジュール削除のリクエスト
 * @param {number} scheduleId スケジュールID 
 */
export function requestDelete() {
    return { type: REQUEST_DELETE };
}

/**
 * 出力ファイル一覧取得のリクエスト
 * @param {number} scheduleId スケジュールID
 */
export function requestOutputFileResult(scheduleId) {
    return { type: REQUEST_OUTPUTFILE_RESULT, scheduleId: scheduleId };
}

/**
 * 出力ファイル削除のリクエスト
 */
export function requestDeleteFiles() {
    return { type: REQUEST_DELETE_FILES };
}

//#endregion


/**
 * 編集中スケジュールをセットする
 * @param {object} schedule スケジュール情報
 * @param {boolean} isRegister 新規作成かどうか
 */
export function setEditSchedule(schedule, isRegister) {
    return { type:SET_EDIT, value: schedule, isRegister: isRegister };
}

/**
 * 編集中スケジュール(スケジュール概要)を変更する
 * @param {string} key 編集するキー
 * @param {object} value 編集データ
 * @param {boolean} isError 入力エラーかどうか
 */
export function changeEditScheduleOutview(key, value, isError) {
    return { type:CHANGE_SCHEDULE_OVERVIEW, key: key, value: value, isError: isError };
}


/**
 * 編集中スケジュール(検索条件)を変更する
 * @param {string} key 編集するキー
 * @param {object} value 編集データ
 * @param {boolean} isError 入力エラーかどうか
 */
export function changeEditScheduleCondition(value, isError) {
    return { type:CHANGE_SCHEDULE_CONDITION, value: value, isError: isError };
}

/**
 * 編集中スケジュール(出力情報)を変更する
 * @param {string} key 編集するキー
 * @param {object} value 編集データ
 * @param {boolean} isError 入力エラーかどうか
 */
export function changeEditScheduleOutputInfo(key, value, isError) {
    return { type:CHANGE_SCHEDULE_OUTPUTINFO, key: key, value: value, isError: isError };
}

/**
 * 編集中スケジュールをクリアする
 */
export function clearEditSchedule() {
    return { type:CLEAR_EDIT };
}

/**
 * 選択中のスケジュールIDをセットする
 * @param {number} scheduleId スケジュールID
 */
export function setSelectedScheduleId(scheduleId) {
    return { type:SET_SELECTED_SCHEDULE_ID, value: scheduleId };
}

/**
 * 選択中のスケジュールIDをクリアする
 */
export function clearSelectedScheduleId() {
    return { type:CLEAR_SELECTED_SCHEDULE_ID };
}

/**
 * 出力ファイル一覧（SearchResult）をセットする
 * @param {object} result 出力ファイル一覧
 */
export function setOutputFileResult(result) {
    return { type:SET_OUTPUTFILE_RESULT, value: result };
}

/**
 * 出力ファイル一覧（SearchResult）をクリアする
 */
export function clearOutputFileResult() {
    return { type:CLEAR_OUTPUTFILE_RESULT };
}

/**
 * 出力ファイル一覧モーダル表示を切り替える
 * @param {boolean} show 表示するかどうか
 */
export function changeShowDownloadModal(show) {
    return { type: CHANGE_SHOW_DOWNLOAD_MODAL, show: show };
}

/**
 * 所属一覧をセットする
 * @param {array} value 所属一覧
 */
export function setEnterprises(value) {
    return { type: SET_ENTERPRISES, value: value };
}

/**
 * 削除対象のID群をセットする
 * @param {array} scheduleIds スケジュールIDリスト
 */
export function setDeleteScheduleIds(scheduleIds) {
    return { type: SET_DELETE_SCHEDULEIDS, value: scheduleIds };
}

/**
 * 削除対象のファイル一覧情報をセットする
 * @param {array} scheduleIds スケジュールIDリスト
 */
export function setDeleteFileListInfo(scheduleId, fileNos) {
    return { type: SET_DELETE_FILES, scheduleId: scheduleId, fileNos: fileNos };
}

/**
 * 削除対象のファイル一覧情報をクリアする
 */
export function clearDeleteFileListInfo(){
    return { type: CLEAR_DELETE_FILES };
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

//#endregion