/**
 * @license Copyright 2018 DENSO
 * 
 * GraphicPanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

//#region Action名の定義
//リクエストアクション
export const REQUEST_INITIAL_INFO = 'REQUEST_INITIAL_INFO';
export const REQUEST_SELECT_LAYOUT = 'REQUEST_SELECT_LAYOUT';
export const REQUEST_DELETE_LAYOUT = 'REQUEST_DELETE_LAYOUT';
export const REQUEST_SAVE_LAYOUT = 'REQUEST_SAVE_LAYOUT';
export const REQUEST_ADD_OBJECT = 'REQUEST_ADD_OBJECT';
export const REQUEST_DELETE_OBJECT = 'REQUEST_DELETE_OBJECT';
export const REQUEST_APPLY_CHANGE = 'REQUEST_APPLY_CHANGE';
export const REQUEST_OBJBOX_EDITMODE = 'REQUEST_OBJBOX_EDITMODE';
export const REQUEST_CANCEL_SETTING = 'REQUEST_CANCEL_SETTING';
export const REQUEST_CHANGE_OBJECT = 'REQUEST_CHANGE_OBJECT';
export const REQUEST_CHANGE_MODE = 'REQUEST_CHANGE_MODE';
export const REQUEST_DESELECT_OBJECTS = 'REQUEST_DESELECT_OBJECTS';
export const REQUEST_CHANGE_MAP = 'REQUEST_CHANGE_MAP';
export const REQUEST_REDO = 'REQUEST_REDO';
export const REQUEST_UNDO = 'REQUEST_UNDO';

//isReadOnly変更アクション
export const SET_IS_READONLY = 'SET_IS_READONLY';

//initialInfo変更アクション
export const SET_LOOKUP = 'SET_LOOKUP';

//selectLayout変更アクション
export const SET_SELECT_LAYOUT = 'SET_SELECT_LAYOUT';

//editing変更アクション
export const SET_EDITING = 'SET_EDITING';
export const CHANGE_LAYOUT_SETTING = 'CHANGE_LAYOUT_SETTING';
export const CHANGE_MAP_OBJECT = 'CHANGE_MAP_OBJECT';
export const APPLY_OBJECT_SETTING = 'APPLY_OBJECT_SETTING';
export const DELETE_OBJECTS = 'DELETE_OBJECTS';
export const ADD_OBJECTS = 'ADD_OBJECTS';
export const SET_OBJECTS = 'SET_OBJECTS';

//selectObjects変更アクション
export const CHANGE_SELECT_OBJECTS = 'CHANGE_SELECT_OBJECTS';
export const BULK_SELECT_OBJECTS = 'BULK_SELECT_OBJECTS';
export const RESET_SELECT_OBJECTS = 'RESET_SELECT_OBJECTS';

//isOnlySelectValueLabel変更アクション
export const CHANGE_ISONLY_VALUELABEL = 'CHANGE_ISONLY_VALUELABEL';

//mapSetting変更アクション
export const CHANGE_MAP_SETTING = 'CHANGE_MAP_SETTING';

//objectSettingBox変更アクション
export const SET_OBJECT_SETTING = 'SET_OBJECT_SETTING';
export const CHANGE_OBJECT_SETTING = 'CHANGE_OBJECT_SETTING';
export const SET_OBJECT_VALIDATE = 'SET_OBJECT_VALIDATE';
export const CHANGE_OBJECT_VALIDATE = 'CHANGE_OBJECT_VALIDATE';
export const CHANGE_OBJBOX_MODE = 'CHANGE_OBJBOX_MODE';
export const CHANGE_MULTI_APPLY = 'CHANGE_MULTI_APPLY';

//isEditMode変更アクション
export const CHANGE_MODE = 'CHANGE_MODE';

//log変更アクション
export const RECORD_LOG = 'RECORD_LOG';
export const MOVE_LOG_POINTER = 'MOVE_LOG_POINTER';
export const CLEAR_LOG = 'CLEAR_LOG';
//#endregion

//ActionCenter
//#region リクエストアクション(saga)
/**
 * 画面初期情報リクエスト
 * @param {*} data 
 */
export function requestInitialInfo(data) {
    return { type: REQUEST_INITIAL_INFO, data };
}

/**
 * レイアウト選択・変更リクエスト
 * @param {*} data 
 */
export function requestSelectLayout(data) {
    return { type: REQUEST_SELECT_LAYOUT, data };
}

/**
 * レイアウト削除
 * @param {*} data 
 */
export function requestDeleteLayout(data) {
    return { type: REQUEST_DELETE_LAYOUT, data };
}

/**
 * レイアウト保存
 * @param {*} data 
 */
export function requestSaveLayout(data) {
    return { type: REQUEST_SAVE_LAYOUT, data };
}

/**
 * オブジェクト追加リクエスト
 * @param {*} data 
 */
export function requestAddObject(data) {
    return { type: REQUEST_ADD_OBJECT, data };
}

/**
 * オブジェクト削除リクエスト
 * @param {*} data 
 */
export function requestDeleteObject(data) {
    return { type: REQUEST_DELETE_OBJECT, data };
}

/**
 * オブジェクト変更適用リクエスト
 * @param {*} data 
 */
export function requestApplyChange(data) {
    return { type: REQUEST_APPLY_CHANGE, data };
}

/**
 * オブジェクト設定ボックス編集モードリクエスト
 * @param {*} data 
 */
export function requestObjBoxEditMode(data) {
    return { type: REQUEST_OBJBOX_EDITMODE, data };
}

/**
 * オブジェクト設定編集内容キャンセルリクエスト
 * @param {*} data 
 */
export function requestCancelSetting(data) {
    return { type: REQUEST_CANCEL_SETTING, data}
}

/**
 * オブジェクト設定ボックス情報変更リクエスト
 * @param {*} data 
 */
export function requestChangeObject(data) {
    return { type: REQUEST_CHANGE_OBJECT, data };
}

/**
 * （編集⇔閲覧）モード変更リクエスト
 * @param {*} data 
 */
export function requestChangeMode(data) {
    return { type: REQUEST_CHANGE_MODE, data };
}

/**
 * オブジェクト選択解除リクエスト
 * @param {*} data 
 */
export function requestDeselectObjects(data) {
    return { type: REQUEST_DESELECT_OBJECTS, data };
}

/**
 * マップオブジェクト変更リクエスト
 * @param {*} data 
 */
export function requestChangeMap(data) {
    return { type: REQUEST_CHANGE_MAP, data };
}

/**
 * 進むリクエスト
 * @param {*} data 
 */
export function requestRedo(data) {
    return { type: REQUEST_REDO, data };
}

/**
 * 戻るリクエスト
 * @param {*} data 
 */
export function requestUndo(data) {
    return { type: REQUEST_UNDO, data };
}
//#endregion

//#region 画面から直接呼び出すアクション
/**
 * レイアウト設定変更
 * @param {*} data 
 */
export function changeLayoutSetting(data) {
    return { type: CHANGE_LAYOUT_SETTING, data };
}

/**
 * マップ設定変更
 * @param {*} data 
 */
export function changeMapSetting(data) {
    return { type: CHANGE_MAP_SETTING, data };
}

/**
 * 複数オブジェクト適用設定
 * @param {*} data 
 */
export function changeMultiApply(data) {
    return { type: CHANGE_MULTI_APPLY, data };
}
//#endregion
