/**
 * @license Copyright 2020 DENSO
 * 
 * ProjectPanelのAction(ActionCreator)を定義する。
 * 
 */
'use strict';

//#region Action名の定義

//sagaへのリクエスト
export const REQUEST_INIT_INFO = 'REQUEST_INIT_INFO';
export const REQUEST_GET_PROJECT_LIST = 'REQUEST_GET_PROJECT_LIST';
export const REQUEST_GET_PROJECTS = 'REQUEST_GET_PROJECTS';
export const REQUEST_INIT_PATCHCABLE_SELECTIONS = 'REQUEST_INIT_PATCHCABLE_SELECTIONS';
export const REQUEST_ADD_PATCHCABLE_SELECTIONS = 'REQUEST_ADD_PATCHCABLE_SELECTIONS';
export const REQUEST_SET_FIRST_IDFSELECTION = 'REQUEST_SET_FIRST_IDFSELECTION';
export const REQUEST_SERACH_LINE = 'REQUEST_SERACH_LINE';
export const REQUEST_CHANGE_TEMP_TYPE = 'REQUEST_CHANGE_TEMP_TYPE';
export const REQUEST_CHANGE_SHEARCH_TYPE = 'REQUEST_CHANGE_SHEARCH_TYPE';
export const REQUEST_SAVE_PROJECT_FORM = 'REQUEST_SAVE_PROJECT_FORM';
export const REQUEST_SAVE_PROJECTS = 'REQUEST_SAVE_PROJECTS';

export const SET_SEARCH_DISABLED = 'SET_SEARCH_DISABLED';
export const SET_EDIT_PROJECT_FORM = 'SET_EDIT_PROJECT_FORM';
export const SET_EDIT_PROJECTS = 'SET_EDIT_PROJECTS';
export const CHANGE_PROJECT = 'CHANGE_PROJECT';
export const CHANGE_PROJECT_LINE = 'CHANGE_PROJECT_LINE';
export const CHANGE_EXTENDED_PAGES = 'CHANGE_EXTENDED_PAGES';
export const CHANGE_LINES = 'CHANGE_LINES';
export const CHANGE_BULK_PROJECT = 'CHANGE_BULK_PROJECT';
export const CLEAR_EDIT = 'CLEAR_EDIT';

export const SET_SAVE_FIEXED = 'SET_SAVE_FIEXED';
export const SET_DATE_OVERWRITE = 'SET_DATE_OVERWRITE';

//回線選択用
export const SET_IN_PATCH_CABLES = 'SET_IN_PATCH_CABLES';
export const SET_IDF_PATCH_CABLES = 'SET_IDF_PATCH_CABLES';
export const ADD_LINE_SELECTION_SERIES = 'ADD_LINE_SELECTION_SERIES'; 
export const CLEAR_LINE_SELECTION_SERIES = 'CLEAR_LINE_SELECTION_SERIES';
export const CLEAR_IN_PATCHCABLES_SELECTIONS = 'CLEAR_IN_PATCHCABLES_SELECTIONS';
export const CLAER_IDF_PATCHCABLE_SELECTIONS = 'CLAER_IDF_PATCHCABLE_SELECTIONS';
export const CLAER_LINE_PATCHCABLE_SELECTIONS = 'CLAER_LINE_PATCHCABLE_SELECTIONS';
export const RESET_IDF_PATCHCABLE_SELECTIONS = 'RESET_IDF_PATCHCABLE_SELECTIONS';
export const SET_EDIT_SERACHED_LINE = 'SET_EDIT_SERACHED_LINE';
export const SET_BEFORE_LINE_PATCH_CABLES = 'SET_BEFORE_LINE_PATCH_CABLES';

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
 * 案件一覧取得のリクエスト
 * @param {boolean} showNoneMessage 検索結果なしのメッセージを表示するかどうか
 */
export function requestGetProjectList(functionId, updateConditionList = false, showNoneMessage = true) {
    return { type: REQUEST_GET_PROJECT_LIST, showNoneMessage,updateConditionList, functionId };
}

/**
 * 案件情報取得
 * @param {array} projectIds 案件IDリスト
 * @param {boolean} isRegister 新規作成かどうか
 * @param {function} callback コールバック関数
 */
export function requestGetProjects(projectIds, isRegister, callback) {
    return { type: REQUEST_GET_PROJECTS, projectIds, isRegister, callback };
}

/**
 * 案件を保存する
 */
export function requestSaveProjectForm() {
    return { type: REQUEST_SAVE_PROJECT_FORM };
}

/**
 * 案件を一括保存する
 */
export function requestSaveProjects() {
    return { type: REQUEST_SAVE_PROJECTS };
}

//#region 線番情報取得

/**
 * 線番選択の選択肢の初期化
 * @param {number} projectType 工事種別
 * @param {number} tempType 仮登録方法
 * @param {boolean} hasTemp 仮登録ありかどうか
 * @param {number} searchType 検索方法
 * @param {boolean} isEdit 編集かどうか
 * @param {array} lineConnections 選択中の線番
 */
export function requestInitLinePatchCableSelections(projectType, tempType, hasTemp, searchType, isEdit, lineConnections) {
    return { type: REQUEST_INIT_PATCHCABLE_SELECTIONS, projectType, tempType, hasTemp, searchType, isEdit, lineConnections };    
}

/**
 * 線番選択肢を追加する
 * @param {number} seriesNo 局入系統No
 * @param {number} patchboardId 配線盤ID
 */
export function requestAddPatchCableSelection(seriesNo, patchboardId, callback) {
    return { type: REQUEST_ADD_PATCHCABLE_SELECTIONS, seriesNo, patchboardId, callback };
}

/**
 * 一番目のIDF線番の選択肢をセットする
 * @param {number} seriesNo 局入系統No
 * @param {number} patchboardId 配線盤ID
 */
export function requestSetFirstIdfPatchCableSelection(seriesNo, patchboardId) {
    return { type: REQUEST_SET_FIRST_IDFSELECTION, seriesNo, patchboardId };
}

/**
 * 回線情報検索
 * @param {number} patchboardId 配線盤ID
 * @param {number} patchCableNo 線番
 * @param {number} projectType 工事種別
 * @param {number} tempType 仮登録方法
 * @param {number} searchType 検索方法
 */
export function requestSearchLine(patchboardId, patchCableNo, projectType, tempType, searchType) {
    return { type: REQUEST_SERACH_LINE, patchboardId, patchCableNo, projectType, tempType, searchType }
}

/**
 * 仮登録方法を変更する
 * @param {number} projectType 工事種別
 * @param {number} tempType 仮登録方法
 * @param {boolean} hasTemp 仮登録ありか
 * @param {boolean} hasWireType ワイヤありか
 */
export function requestChangeTempType(projectType, tempType, hasTemp, hasWireType) {
    return { type: REQUEST_CHANGE_TEMP_TYPE, projectType, tempType, hasTemp, hasWireType }
}

/**
 * 仮登録方法を変更する
 * @param {number} projectType 工事種別
 * @param {number} searchType 検索方法
 * @param {boolean} hasWireType ワイヤありか
 */
export function requestChangeSearchType(projectType, searchType, hasWireType) {
    return { type: REQUEST_CHANGE_SHEARCH_TYPE, projectType, searchType, hasWireType }
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
 * 編集中案件情報をセットする
 * @param {object} data 案件情報
 * @param {boolean} isRegister 新規かどうか
 */
export function setEditProjectFrom(data, isRegister) {
    return { type: SET_EDIT_PROJECT_FORM, data, isRegister }
}

/**
 * 編集中案件情報(複数)をセットする
 * @param {object} data 案件情報
 */
export function setEditProjects(data) {
    return { type: SET_EDIT_PROJECTS, data }
}

/**
 * 編集中の案件を変更する
 * @param {string} key 編集するキー
 * @param {object} value 編集データ
 * @param {boolean} isError 入力エラーかどうか
 */
export function changeEditProject(key, value, isError) {
    return { type: CHANGE_PROJECT, key, value, isError }
}

/**
 * 編集中の案件を変更する（回線情報欄）
 * @param {string} key 編集するキー
 * @param {object} value 編集データ
 * @param {boolean} isError 入力エラーかどうか
 */
export function changeEditProjectLine(key, value, isError) {
    return { type: CHANGE_PROJECT_LINE, key, value, isError }
}

/**
 * 編集中の案件詳細情報を変更する
 * @param {array} pages 変更後の詳細ページ情報
 * @param {boolean} isError 入力エラーかどうか
 */
export function changeEditExtendedPages(pages, isError) {
    return { type: CHANGE_EXTENDED_PAGES, pages, isError }
}

/**
 * 編集中の回線一覧を変更する
 * @param {array} lines 変更後の回線一覧
 */
export function changeEditLines(lines) {
    return { type: CHANGE_LINES, lines }
}

/**
 * 編集中の案件概要情報を一括変更する
 * @param {array} keys 編集するキー
 * @param {object} value 変更後のデータ
 * @param {boolean} isError 入力エラーかどうか
 */
export function changeEditBulkProject(keys, value, isError) {
    return { type: CHANGE_BULK_PROJECT, keys, value, isError }
}

/**
 * 編集情報クリア
 */
export function clearEditInfo() {
    return { type: CLEAR_EDIT };
}

/**
 * 局入線番選択肢をセットする
 * @param {array} inPatchCables 局入線番一覧
 * @param {array} seriesNos 局入系統Noリスト
 */
export function setInPatchCableSelections(inPatchCables, seriesNos) {
    return { type: SET_IN_PATCH_CABLES, inPatchCables, seriesNos };
}

/**
 * IDF線番選択肢をセットする
 * @param {number} seriesNo 局入連番No
 * @param {array} patchCables IDF線番一覧
 */
export function setIdfPatchCableSelections(seriesNo, selections) {
    return { type: SET_IDF_PATCH_CABLES, seriesNo, patchCablesSelections: selections };
}

/**
 * 線番選択肢を追加する
 * @param {number} seriesNo 局入系統No
 * @param {number} tempType 登録方法
 */
export function addLinePatchCableSelections(seriesNo, tempType) {
    return { type: ADD_LINE_SELECTION_SERIES, seriesNo, tempType }
}

/**
 * IDF線番選択肢をクリアする
 * @param {number} seriesNo 局入系統No ※未指定の場合は全て
 * @param {number} seqNo 削除する開始回線線番No ※未指定の場合全て
 */
export function clearIdfPatchCableSelections(seriesNo, seqNo){
    return { type: CLAER_IDF_PATCHCABLE_SELECTIONS, seriesNo, seqNo };
}

/**
 * 線番選択肢をクリアする
 * @param {number} seriesNo 局入系統No
 */
export function clearLinePatchCableSelections(seriesNo) {
    return { type: CLEAR_LINE_SELECTION_SERIES, seriesNo }
}

/**
 * 局入線番選択肢をクリアする（局入系統によらず、どちらも）（新設（構内のみ）のみ）
 */
export function clearInPatchCableSelections() {
    return { type: CLEAR_IN_PATCHCABLES_SELECTIONS }
}

/**
 * 回線線番選択肢をクリアする
 */
export function clearAllLinePatchCableSelections() {
    return { type: CLAER_LINE_PATCHCABLE_SELECTIONS };
}

/**
 * IDF線番選択肢のSeqNoをリセット（SeqNo=2）する
 * @returns 
 */
export function reestIdfPatchCableSelections() {
    return { type: RESET_IDF_PATCHCABLE_SELECTIONS };
}

/**
 * 修正前の線番選択肢をセットする
 * @param {array} patchCables 線番一覧
 */
export function setBeforeLinePatchCableSelections(patchCables) {
    return { type: SET_BEFORE_LINE_PATCH_CABLES, patchCables };
}

/**
 * 検索した回線情報をセットする
 * @param {object} line 回線情報
 */
export function setEditSearchedLine(line) {
    return { type: SET_EDIT_SERACHED_LINE, line }
}

/**
 * 確定保存フラグをセットする
 * @param {boolean} isSaveFixed 確定保存フラグ
 */
export function setIsSaveFixed(isSaveFixed) {
    return { type: SET_SAVE_FIEXED, isSaveFixed }
}

/**
 * 上書き保存フラグをセットする
 * @param {boolean} isDateOverwrite 上書き保存フラグ
 */
export function setIsDateOverwrit(isDateOverwrite) {
    return { type: SET_DATE_OVERWRITE, isDateOverwrite }
}


//#endregion
