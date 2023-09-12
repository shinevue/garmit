/**
 * @license Copyright 2017 DENSO
 * 
 * UnitMaintenancePanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

//Action名の定義
export const REQUEST_INITIAL_INFO = 'REQUEST_INITIAL_INFO';
export const REQUEST_SELECT_PAGE = 'REQUEST_SELECT_PAGE';
export const REQUEST_SAVE = 'REQUEST_SAVE';
export const EDIT_PAGENAME = 'EDIT_PAGENAME';
export const EDIT_TYPE = 'EDIT_TYPE';
export const EDIT_ORDER = 'EDIT_ORDER';
export const EDIT_ITEM = 'EDIT_ITEM';
export const CHANGE_ALL_STATE = 'CHANGE_ALL_STATE';

export const CHANGE_PAGENAME = 'CHANGE_PAGENAME';
export const CHANGE_TYPE = 'CHANGE_TYPE';
export const CHANGE_ITEMS = 'CHANGE_ITEMS';
export const CHANGE_ITEM = 'CHANGE_ITEM';
export const CHANGE_HEADER_CHECK = 'CHANGE_HEADER_CHECK';

export const SET_EXTENDED_DATA = 'SET_EXTENDED_DATA';
export const SET_EDIT_PAGE = 'SET_EDIT_PAGE';
export const PROCESS_ITEM_INFO = 'PROCESS_ITEM_INFO';

export const CHANGE_VALIDATION = 'CHANGE_VALIDATION';
export const VALIDATE_PAGENAME = 'VALIDATE_PAGENAME';
export const CHANGE_LIST = 'CHANGE_LIST';

//ActionCenter
/**
 * 初期情報リクエスト
 * @param {*} data
 */
export function requestInitialInfo(data) {
    return { type: REQUEST_INITIAL_INFO, data };
}

/**
 * 編集ページ選択リクエスト
 * @param {*} data
 */
export function requestSelectPage(data) {
    return { type: REQUEST_SELECT_PAGE, data };
}

/**
 * 編集ページ保存リクエスト
 * @param {*} data
 */
export function requestSave(data) {
    return { type: REQUEST_SAVE, data };
}

/**
 * 拡張項目データ
 * @param {*} data
 */
export function setExtendedData(data) {
    return { type: SET_EXTENDED_DATA, value: data };
}

/**
 * 編集対象管理項目情報を表示用に加工する
 * @param {*} data
 */
export function processPageInfo(data) {
    return { type: PROCESS_ITEM_INFO, value: data };
}

/**
 * ページ名称編集
 * @param {*} data
 */
export function editPageName(data) {
    return { type: EDIT_PAGENAME, value: data };
}

/**
 * 全カラムの状態を変更する
 * @param {bool} value  変更後の値
 * @param {string} type 変更する種別
 */
export function changeAllState(value, type) {
    return { type: CHANGE_ALL_STATE, changeType: type, value: value };
}

/**
 * 全検索対象状態を変更する
 * @param {*} data
 */
export function changeAllSearchableState(data) {
    return { type: CHANGE_SEARCHABLE_STATE, value: data };
}

/**
 * 種別編集
 * @param {*} data
 */
export function editType(data) {
    return { type: EDIT_TYPE, value: data };
}

/**
 * 管理項目編集
 * @param {*} data
 */
export function editItem(data) {

    return { type: EDIT_ITEM, itemId: data.itemId, valueObj: data.valueObj };
}

/**
 * 管理項目の保存可能状態変更
 * @param {*} data
 */
export function changeListState(data) {

    return { type: CHANGE_LIST, index: data.index, value: data.canSave };
}

/**
 * 管理項目の表示順変更
 * @param {*} data
 */
export function editOrder(data) {

    return { type: EDIT_ORDER, value: data };
}

/**
 * 編集内容の検証結果変更
 * @param {*} data
 */
export function changeValidation(data) {

    return { type: CHANGE_VALIDATION, value: data };
}


