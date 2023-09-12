/**
 * @license Copyright 2017 DENSO
 * 
 * Action(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 */
'use strict';

//#region Action名
//#region sagaへのリクエスト（複数reducer書き換え）
export const REQUEST_SAVE        ='REQUEST_SAVE';
export const REQUEST_DELETE = 'REQUEST_DELETE';
export const REQUEST_REFRESH = 'REQUEST_REFRESH';
export const REQUEST_ENTERPRISES = 'REQUEST_ENTERPRISES';
export const REQUEST_SET_EDIT = 'REQUEST_SET_EDIT';
//#endregion

//#region scheduleList
export const SET_SCHEDULE = 'SET_SCHEDULE'; 
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
export const CLEAR_EDIT = 'CLEAR_EDIT';
//#endregion

//#region modalState
export const CONFIRM_SAVE = 'CONFIRM_SAVE';
export const CONFIRM_DELETE = 'CONFIRM_DELETE';
export const SHOW_ERROR_MODAL = 'SHOW_ERROR_MODAL';
export const SHOW_SAVE_RESULT = 'SHOW_SAVE_RESULT';
export const SHOW_DELETE_RESULT = 'SHOW_DELETE_RESULT';
export const CLOSE_MODAL = 'CLOSE_MODAL';
//#endregion

//#region enterprise
export const SET_ENTERPRISES = 'SET_ENTERPRISES';
export const CHANGE_SELECT_ENTERPRISES = 'CHANGE_SELECT_ENTERPRISES';
//#endregion
//#endregion

//#region ActionCreator
//#region sagaへのリクエスト
export function requestSave(data) {
    return { type: REQUEST_SAVE, data  };
}
export function requestDelete(data) {
    return { type: REQUEST_DELETE, data };
}
export function requestRefresh(data) {
    return { type: REQUEST_REFRESH, data };
}
export function requestEnterprises(data) {
    return { type: REQUEST_ENTERPRISES, data };
}
export function requestSetEdit(data) {
    return { type: REQUEST_SET_EDIT, data };
}
//#endregion

//#region scheduleList
export function setSchedule(data) {
    return { type: SET_SCHEDULE, data };
}
//#endregion

//#region selectSchedules
export function setSelect(data) {
    return { type: SET_SELECT, data };
}
export function removeSelect(data) {
    return { type: REMOVE_SELECT, data };
}
export function clearSelect(data) {
    return { type: CLEAR_SELECT, data };
}
export function updateSelect(data) {
    return { type: UPDATE_SELECT, data }
}
//#endregion

//#region editing
export function setEdit(data) {
    return { type: SET_EDIT, data };
}
export function changeSchedule(data) {
    return { type: CHANGE_SCHEDULE, data };
}
export function clearEdit(data) {
    return { type: CLEAR_EDIT, data };
}
//#endregion

//#region modalState
export function confirmSave() {
    return { type: CONFIRM_SAVE }
}
export function confirmDelete(data) {
    return { type: CONFIRM_DELETE, data };
}
export function showErrorModal(data) {
    return { type: SHOW_ERROR_MODAL, data };
}
export function showSaveResult(data) {
    return { type: SHOW_SAVE_RESULT, data };
}
export function showDeleteResult(data) {
    return { type: SHOW_DELETE_RESULT, data };
}
export function closeModal() {
    return { type: CLOSE_MODAL };
}
//#endregion

//#region enterprise
export function setEinterprises(data) {
    return { type: SET_ENTERPRISES, data };
}
export function changeSelectEnterprises(data) {
    return { type: CHANGE_SELECT_ENTERPRISES, data };
}
//#endregion

//#endregion
