/**
 * @license Copyright 2017 DENSO
 * 
 * ロード状態のAction(ActionCreator)を定義する。
 * 
 */
'use strict';

/********************************************
 * Action名
 ********************************************/
export const CHANGE_MODAL_STATE = 'CHANGE_MODAL_STATE';  
export const CLOSE_MODAL = 'CLOSE_MODAL';  
export const CONFIRM_DELETE = 'CONFIRM_DELETE'; 
export const CONFIRM_CANCEL = 'CONFIRM_CANCEL'; 
export const CONFIRM_SAVE = 'CONFIRM_SAVE'; 
export const SUCCESS_SAVE = 'SUCCESS_SAVE'; 
export const SUCCESS_DELETE = 'SUCCESS_DELETE'; 
export const SHOW_ERROR_MESSAGE = 'SHOW_ERROR_MESSAGE'; 
export const REQUEST_SHOW_MODAL = 'REQUEST_SHOW_MODAL';
export const SHOW_NETWORK_ERROR_MESSAGE = 'SHOW_NETWORK_ERROR_MESSAGE';
export const CONFIRM_OVERWRITE = 'CONFIRM_OVERWRITE';

/********************************************
 * ActionCenter
 ********************************************/

/**
 * メッセージモーダルの状態変更Actionを作成する
 */
export function changeModalState(data) {
    return { type: CHANGE_MODAL_STATE, data };
}

/**
 * メッセージモーダルクローズActionを作成する
 */
export function closeModal() {
    return { type: CLOSE_MODAL };
}

/**
 * 削除確認用Actionを作成する
 */
export function confirmDelete(data) {
    return { type: CONFIRM_DELETE, ...data };
}

/**
 * キャンセル確認用Actionを作成する
 */
export function confirmCancel(data) {
    return { type: CONFIRM_CANCEL, ...data };
}

/**
 * 保存確認用Actionを作成する
 */
export function confirmSave(data) {
    return { type: CONFIRM_SAVE, ...data };
}

/**
 * 保存成功用Actionを作成する
 */
export function successSave(data) {
    return { type: SUCCESS_SAVE, ...data };
}

/**
 * 削除確認用Actionを作成する
 */
export function successDelete(data) {
    return { type: SUCCESS_DELETE, ...data };
}

/**
 * エラーメッセージ表示用Actionを作成する
 */
export function showErrorMessage(data) {
    return { type: SHOW_ERROR_MESSAGE, ...data };
}

/**
 * 確認メッセージモーダル表示
 * @param {*} data 
 */
export function requestShowModal(data) {
    return { type: REQUEST_SHOW_MODAL, data };
}

/**
 * ネットワークエラーのメッセージモーダルを表示する
 */
export function showNetworkErrorMessage() {
    return { type: SHOW_NETWORK_ERROR_MESSAGE };
}


/**
 * 上書き確認用Actionを作成する
 */
export function confirmOverwrite(data) {
    return { type: CONFIRM_OVERWRITE, ...data };
}