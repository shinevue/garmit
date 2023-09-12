/**
 * @license Copyright 2019 DENSO
 * 
 * UnlockPurposeのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

//Action名の定義
export const REQUEST_SAVE_UNLOCK_PURPOSE = 'REQUEST_SAVE_UNLOCK_PURPOSE';
export const REQUEST_DELETE_UNLOCK_PURPOSE = 'REQUEST_DELETE_UNLOCK_PURPOSE';

export const SET_UNLOCK_PURPOSE_LIST = 'SET_UNLOCK_PURPOSE_LIST'; 
export const SET_SELECTED_UNLCOKPURPOSE = 'SET_SELECTED_UNLCOKPURPOSE';
export const CLEAR_SELECTED_UNLCOKPURPOSE = 'CLEAR_SELECTED_UNLCOKPURPOSE';

//ActionCenter

/**
 * 開錠目的の保存をリクエストする
 * @param {object} data 保存する開錠目的
 */
export function requestSaveUnlockPurpose(data, functionId, callback) {
    return { type:REQUEST_SAVE_UNLOCK_PURPOSE, data, functionId, callback };
}

/**
 * 開錠目的の削除をリクエストする
 * @param {object} data 削除する開錠目的
 */
export function requestDeleteUnlockPurpose(data) {
    return { type:REQUEST_DELETE_UNLOCK_PURPOSE, data };
}

/**
 * 開錠目的リストをセットする
 * @param {array} data 開錠目的リストを設定する
 */
export function setUnlockPurposeList(data) {
    return { type:SET_UNLOCK_PURPOSE_LIST, data };
}

/**
 * 選択中の開錠目的をセットする
 * @param {object} data 選択した開錠目的
 */
export function setSelectedUnlockPurpose(data) {
    return { type:SET_SELECTED_UNLCOKPURPOSE, data };
}

/**
 * 選択中の開錠目的をクリアする
 */
export function clearSelectedUnlockPurpose() {
    return { type:CLEAR_SELECTED_UNLCOKPURPOSE };
}