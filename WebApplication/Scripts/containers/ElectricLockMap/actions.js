/**
 * @license Copyright 2019 DENSO
 * 
 * ElectricLockMapPanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

//Action名の定義
export const REQUEST_INIT_INFO = 'REQUEST_INIT_INFO';
export const REQUEST_UPDATE = 'REQUEST_UPDATE';
export const REQUEST_ELECKEY_MAPTRANSITION = 'REQUEST_ELECKEY_MAPTRANSITION';
export const REQUEST_ELECKEY_OPERATION = 'REQUEST_ELECKEY_OPERATION';
export const REQUEST_SELECT_ELECKEYS = 'REQUEST_SELECT_ELECKEYS';
export const REQUEST_REMOVE_SELECT_ELECKEYS = 'REQUEST_REMOVE_SELECT_ELECKEYS';
export const REQUEST_APPLY_MULTI_RACKS_SELECT = 'REQUEST_APPLY_MULTI_RACKS_SELECT';
export const REQUEST_CLEAR_SELECT_ELECKEYS = 'REQUEST_CLEAR_SELECT_ELECKEYS';

export const SET_LOOKUP = 'SET_LOOKUP';
export const SET_EMPTY_EXTENDED_PAGES = 'SET_EMPTY_EXTENDED_PAGES';
export const START_UPDATE = 'START_UPDATE';
export const END_UPDATE = 'END_UPDATE';
export const SET_ELECKEY_OBJECTS = 'SET_ELECKEY_OBJECTS';
export const SET_SELECT_ELECKEY_OBJECTS = 'SET_SELECT_ELECKEY_OBJECTS';
export const SET_SELECT_ELECKEY_DISPITEMS = 'SET_SELECT_ELECKEY_DISPITEMS';
export const CLEAR_SELECT_ELECKEYS = 'CLEAR_SELECT_ELECKEYS';
export const SET_TEMP_KEY_RACKS = 'SET_TEMP_KEY_RACKS';
export const CHANGE_MULTI_RACK_MODAL_STATE = 'CHANGE_MULTI_RACK_MODAL_STATE';
export const CHANGE_OPERATION_MEMO = 'CHANGE_OPERATION_MEMO';
export const CHANGE_OPERATION_TARGET = 'CHANGE_OPERATION_TARGET';
export const CHANGE_OPERATION_EXTENDED_PAGES = 'CHANGE_OPERATION_EXTENDED_PAGES';
export const CLEAR_OPERATION_INFO = 'CLEAR_OPERATION_INFO';

//ActionCenter

//#region Sagaリクエスト

/**
 * 画面初期化をリクエストする
 * @param {number} layoutId 初期表示時に表示するレイアウトID
 */
export function requestInitInfo(layoutId) {
    return { type: REQUEST_INIT_INFO, layoutId };
}

/**
 * 更新をリクエストする
 * @param {*} data 
 */
export function requestUpdate(data) {
    return { type: REQUEST_UPDATE, data };
}

/**
 * マップ遷移をリクエストする
 * @param {*} data 遷移種別
 */
export function requestElectricLockMapTransition(data) {
    return { type: REQUEST_ELECKEY_MAPTRANSITION , data };
}

/**
 * 電気錠ラック選択をリクエストする
 * @param {*} data 選択した電気錠オブジェクトリスト
 * @param {*} isMultiRack 分割ラックかどうか
 */
export function requestSelectElecKeys(data, isMultiSelect = false ,isMultiRack = true) {
    return { type: REQUEST_SELECT_ELECKEYS, data, isMultiSelect, isMultiRack };
}

/**
 * 電気錠ラックの選択解除をリクエストする
 * @param {*} data  選択した電気錠（表示用）
 */
export function requestRemoveSelectElecKeys(data) {
    return { type: REQUEST_REMOVE_SELECT_ELECKEYS, data }
}

/**
 * 選択中電気錠ラックに分割ラック選択を適用する
 * @param {*} dispItems 追加する電気錠ラック
 */
export function requestApplyMultiRackSelect(dispItems) {
    return { type: REQUEST_APPLY_MULTI_RACKS_SELECT, dispItems };
}

/**
 * 電気錠操作をリクエストする
 * @param {*} isLock ロックするかどうか
 */
export function requestElecKeyOperation(isLock) {
    return { type: REQUEST_ELECKEY_OPERATION, isLock };
}

/**
 * 選択中の電気錠の全クリアをリクエストする
 */
export function requestClearSelectElecKey() {
    return { type: REQUEST_CLEAR_SELECT_ELECKEYS }
}
//#endregion

/**
 * ルックアップをセットする
 * @param {*} data ルックアップ
 */
export function setLookUp(data) {
    return { type: SET_LOOKUP, data };
}

/**
 * 空の詳細項目情報（詳細情報マスタ）をセットする
 * @param {*} data 空の詳細項目情報
 */
export function setEmptyExtendedPages(data) {
    return { type: SET_EMPTY_EXTENDED_PAGES, data };
}

/**
 * 電気錠オブジェクト群をセットする
 * @param {*} data 電気錠オブジェクト
 */
export function setElecKeyObjects(data) {
    return { type: SET_ELECKEY_OBJECTS, data };
}

/**
 * 選択中の電気錠オブジェクト群をセットする
 * @param {*} data 電気錠オブジェクト
 */
export function setSelectElecKeyRackObjects(data) {
    return { type: SET_SELECT_ELECKEY_OBJECTS, data };
}

/**
 * 選択中の電気錠ラック表示情報をセットする
 * @param {*} data 電気錠表示アイテムリスト
 * @param {boolean} canChanged 自動変更可能とするか
 */
export function setSelectElecKeyDispItems(data, canChanged) {
    return { type: SET_SELECT_ELECKEY_DISPITEMS, data, canChanged };
}

/**
 * 選択中の電気錠ラックをクリアする
 */
export function clearSelectElecKey() {
    return { type: CLEAR_SELECT_ELECKEYS };
}

/**
 * 分割ラックの選択前の電気錠ラックリストをセットする
 * @param {*} data 分割ラックの電気錠ラックリスト
 */
export function setTempMultiElecKeyRacks(data) {
    return { type: SET_TEMP_KEY_RACKS, data };
}

/**
 * 分割ラック選択モーダルの表示状態を変更する
 * @param {*} show 表示するかどうか
 */
export function changeMultiRackSelectModalState(show) {
    return { type: CHANGE_MULTI_RACK_MODAL_STATE, show }
}

/**
 * メモを変更する
 * @param {*} data メモ
 */
export function changeOperatioMemo(data) {
    return { type: CHANGE_OPERATION_MEMO, data };
}

/**
 * 詳細項目情報を変更する
 * @param {*} data 詳細項目情報
 * @param {*} isError エラーかどうか
 */
export function changeOperatioExtendedPages(data, isError) {
    return { type: CHANGE_OPERATION_EXTENDED_PAGES, data, isError };
} 

/**
 * 操作対象を変更する
 * @param {*} front 前面
 * @param {*} rear 背面
 */
export function changeOperatioTarget(front, rear) {
    return { type: CHANGE_OPERATION_TARGET, front, rear };
}

/**
 * 操作情報をクリアする
 */
export function clearOperationInfo(extendedPages) {
    return { type: CLEAR_OPERATION_INFO, extendedPages };    
}

/**
 * 更新中の状態とする
 */
export function startUpdate() {
    return { type: START_UPDATE };
}

/**
 * 更新していない状態とする
 */
export function endUpdate() {
    return { type: END_UPDATE };
}