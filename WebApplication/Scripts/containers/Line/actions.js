/**
 * @license Copyright 2018 DENSO
 * 
 * LineListPanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

import { func } from "prop-types";


//#region Action名の定義

//sagaへのリクエスト
export const REQUEST_INIT_INFO = 'REQUEST_INIT_INFO';
export const REQUEST_GET_LINE_LIST = 'REQUEST_GET_LINE_LIST';
export const REQUEST_GET_PATCHCABLE_FROM = 'REQUEST_GET_PATCHCABLE_FROM';
export const REQUEST_SAVE_PATCHCABLE_FROM = 'REQUEST_SAVE_PATCHCABLE_FROM';
export const REQUEST_GET_LINE_FILE_LIST = 'REQUEST_LINE_FILE_LIST';
export const REQUEST_UPLOAD_LINE_FILE = 'REQUEST_UPLOAD_LINE_FILE';
export const REQUEST_DELETE_LINE_FILES = 'REQUEST_DELETE_LINE_FILES';

export const SET_SEARCH_DISABLED = 'SET_SEARCH_DISABLED';
export const SET_IN_USE_ONLY = 'SET_IN_USE_ONLY';
export const SET_EDIT_PATCHCABLE_FORM = 'SET_EDIT_PATCHCABLE_FORM';
export const CHANGE_PATCHCABLE_DATA = 'CHANGE_PATCHCABLE_DATA';
export const CHANGE_EXTENDED_PAGES = 'CHANGE_EXTENDED_PAGES';
export const CLEAR_EDIT = 'CLEAR_EDIT';
export const SET_LINE_FILE_RESULT = 'SET_LINE_FILE_RESULT';
export const SET_SHOW_FILE_MODAL = 'SET_SHOW_FILE_MODAL';
export const SET_UPLOAD_MODAL_INFO = 'SET_UPLOAD_MODAL_INFO';

//#endregion

//#region ActionCenter

//#region sagaへのリクエスト

/**
 * 初期化のリクエスト
 */
export function requestInitInfo(functionId) {
    return { type: REQUEST_INIT_INFO, functionId };
}

/**
 * 回線一覧取得のリクエスト
 * @param {boolean} showNoneMessage 検索結果なしのメッセージを表示するかどうか
 */
export function requestGetLineList(functionId, updateConditionList = false, showNoneMessage = true) {
    return { type: REQUEST_GET_LINE_LIST, showNoneMessage, updateConditionList, functionId };
}

/**
 * 回線情報取得のリクエスト
 * @param {number} patchboardId 配線盤ID
 * @param {number} cableNo 線番
 * @param {function} callback コールバック関数
 */
export function requestGetPatchCableForm(patchboardId, cableNo, callback) {
    return { type: REQUEST_GET_PATCHCABLE_FROM, patchboardId, cableNo, callback };
}

/**
 * 回線保存のリクエスト
 */
export function requestSavePatchCableForm() {
    return { type: REQUEST_SAVE_PATCHCABLE_FROM };
}


//#region ファイル関連

/**
 * ファイル一覧取得リクエスト
 * @param {number} patchboardId 配線盤ID
 * @param {number} cableNo 線番
 */
export function requestGetLineFileList(patchboardId, cableNo) {
    return { type: REQUEST_GET_LINE_FILE_LIST, patchboardId, cableNo };
}

/**
 * ファイルアップロードのリクエスト
 * @param {array} patchCableParameters 線番情報のパラメータリスト（patchboardId/cableNo）
 * @param {string} fileName ファイル名称
 * @param {string} dataString データ文字列
 * @param {boolean} overwrite 上書きするか
 */
export function requestUploadLineFile(patchCableParameters, fileName, dataString, overwrite) {
    return { type: REQUEST_UPLOAD_LINE_FILE, patchCableParameters, fileName, dataString, overwrite }
}

/**
 * ファイル削除リクエスト
 * @param {number} patchboardId 配線盤ID
 * @param {number} cableNo 線番
 * @param {number} fileNos ファイル番号リスト
 */
export function requestDeleteLineFiles(patchboardId, cableNo, fileNos) {
    return { type: REQUEST_DELETE_LINE_FILES, patchboardId, cableNo, fileNos }
}

//#endregion

//#endregion

/**
 * 検索ボタンの使用不可状態をセットする
 * @param {boolean} disabled 使用不可かどうか
 */
export function setSearchDisabled(disabled) {
    return { type: SET_SEARCH_DISABLED, disabled };
}

/**
 * 使用中のみフラグをセットする
 * @param {boolean} inUseOnly 使用中のみとするかどうか
 */
export function setInUseOnly(inUseOnly) {
    return { type: SET_IN_USE_ONLY, inUseOnly }
}

/**
 * 編集中案件情報をセットする
 * @param {object} data 回線情報
 */
export function setEditPatchCableForm(data) {
    return { type: SET_EDIT_PATCHCABLE_FORM, data }
}

/**
 * 編集中の回線を変更する
 * @param {string} key 編集するキー
 * @param {object} value 編集データ
 * @param {boolean} isError 入力エラーかどうか
 */
export function changeEditPatchCableData(key, value, isError) {
    return { type: CHANGE_PATCHCABLE_DATA, key, value, isError }
}

/**
 * 編集中の回線詳細情報を変更する
 * @param {array} pages 変更後の詳細ページ情報
 * @param {boolean} isError 入力エラーかどうか
 */
export function changeEditExtendedPages(pages, isError) {
    return { type: CHANGE_EXTENDED_PAGES, pages, isError }
}

/**
 * 編集情報クリア
 */
export function clearEditInfo() {
    return { type: CLEAR_EDIT };
}

/**
 * ファイル一覧をセットする
 * @param {object} data ファイル一覧
 */
export function setLineFileResult(data) {
    return { type: SET_LINE_FILE_RESULT, data }
}

/**
 * ファイル一覧画面を表示するかどうか
 * @param {boolean} show 表示状態
 * @param {object} patchCableParameter 線番情報のパラメータ（patchboardId/cableNo）
 */
export function setShowFileModal(show, patchCableParameter) {
    return { type: SET_SHOW_FILE_MODAL, show, patchCableParameter };
}

/**
 * ファイル追加モーダル情報をセットする
 * @param {boolean} show 表示状態
 * @param {array} patchCableParameters 線番情報のパラメータリスト（patchboardId/cableNo）
 */
export function setUploadModalInfo(show, patchCableParameters) {
    return { type: SET_UPLOAD_MODAL_INFO, show, patchCableParameters }
}

//#endregion
