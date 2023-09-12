/**
 * @license Copyright 2021 DENSO
 * 
 * XxxPanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

//Action名の定義

//sagaへのリクエスト
export const REQUEST_INIT_INFO = 'REQUEST_INIT_INFO';
export const REQUEST_SEARCH_ICCARD_LIST = 'REQUEST_SEARCH_ICCARD_LIST';
export const REQUEST_GET_ICCARD = 'REQUEST_GET_ICCARD';
export const REQUEST_GET_ICCARDS = 'REQUEST_GET_ICCARDS';
export const REQUEST_SAVE_ICCARD = 'REQUEST_SAVE_ICCARD';
export const REQUEST_SAVE_ICCARDS = 'REQUEST_SAVE_ICCARDS';
export const REQUEST_DELETE_ICCARDS = 'REQUEST_DELETE_ICCARDS';
export const REQUEST_CHANGE_ENTERPRISE = 'REQUEST_CHANGE_ENTERPRISE';

export const SET_SEARCH_DISABLED = 'SET_SEARCH_DISABLED';
export const SET_EDIT_ICCARD = 'SET_EDIT_ICCARD';
export const SET_EDIT_ICCARDS = 'SET_EDIT_ICCARDS';
export const CHANGE_EDIT_ICCARD = 'CHANGE_EDIT_ICCARD';
export const CHANGE_BULK_ICCARD = 'CHANGE_BULK_ICCARD';
export const CLEAR_EDIT = 'CLEAR_EDIT';
export const SET_DELETE_ICCARD_NOS = 'SET_DELETE_ICCARD_NOS';
export const SET_LOGINUSER_ERACK_LOCATIONS = 'SET_LOGINUSER_ERACK_LOCATIONS';
export const SET_ERACK_LOCATIONS = 'SET_ERACK_LOCATIONS';
export const SET_LOGIN_USERS = 'SET_LOGIN_USERS';
export const CHANGE_USE_ENTERPEISE = 'CHANGE_USE_ENTERPEISE';
export const CHANGE_USE_LOGINUSER = 'CHANGE_USE_LOGINUSER';
export const CHANGE_IS_INVALID = 'CHANGE_IS_INVALID';

//#region ActionCenter

//#region sagaへのリクエスト

/**
 * 初期化のリクエスト
 */
export function requestInitInfo() {
    return { type:REQUEST_INIT_INFO };
}


/**
 * ICカード検索のリクエスト
 * @param {*} condition 検索条件
 */
export function requestSearchList(showNoneMessage = true) {
    return { type: REQUEST_SEARCH_ICCARD_LIST, showNoneMessage };
}

/**
 * ICカード情報取得リクエスト
 * @param {number} cardNo カード番号
 * @param {function} callback コールバック関数
 */
export function requestGetICCard(cardNo, callback) {
    return { type: REQUEST_GET_ICCARD, cardNo, callback, isRegister: false };
}

/**
 * 新規ICカード情報取得リクエスト
 * @param {function} callback コールバック関数
 */
export function requestGetNewICCard(callback) {
    return { type: REQUEST_GET_ICCARD, cardNo: null, callback, isRegister: true };
}

/**
 * ICカード情報取得リクエスト（複数）
 * @param {array} cardNos カード番号
 * @param {function} callback コールバック関数
 */
export function requestGetICCards(cardNos, callback) {
    return { type: REQUEST_GET_ICCARDS, cardNos, callback };
}

/**
 * ICカード保存リクエスト
 */
export function requestSaveICCard() {
    return { type: REQUEST_SAVE_ICCARD };
}

/**
 * ICカード保存リクエスト（複数）
 */
export function requestSaveICCards() {
    return { type: REQUEST_SAVE_ICCARDS };
}

/**
 * ICカード削除のリクエスト
 */
export function requestDeleteICCards() {
    return { type: REQUEST_DELETE_ICCARDS };
}


/**
 * ロケーションを変更する
 * @param {number} enterpriseId 所属ID
 */
export function requestChnageEnterprise(enterpriseId) {
    return { type: REQUEST_CHANGE_ENTERPRISE, enterpriseId };
}

//#endregion

/**
 * 検索ボタン操作不可かどうかをセットする
 * @param {boolean} disabled 操作不可かどうか
 */
export function setSearchDisabled(disabled) {
    return { type: SET_SEARCH_DISABLED, disabled };
}

/**
 * 編集中のICカード情報をセットする（単体）
 * @param {object} data ICカード情報
 * @param {boolean} isRegister 新規かどうか
 */
export function setEditICCard(data, isRegister = false) {
    return { type: SET_EDIT_ICCARD, data, isRegister };
}

/**
 * 編集中のICカード情報をセットする（複数）
 * @param {object} data ICカード情報
 */
export function setEditICCards(data) {
    return { type: SET_EDIT_ICCARDS, data };
}

/**
 * 編集中のICカード情報を変更する
 * @param {string} key 編集するキー
 * @param {object} value 編集データ
 * @param {boolean} isError 入力エラーかどうか
 */
export function changeEditICCard(key, value, isError) {
    return { type: CHANGE_EDIT_ICCARD, key, value, isError }
}

/**
 * 編集中のICカード情報を一括変更する
 * @param {array} keys 編集するキー
 * @param {object} value 変更後のデータ
 * @param {boolean} isError 入力エラーかどうか
 */
 export function changeEditBulkICCard(keys, value, isError) {
    return { type: CHANGE_BULK_ICCARD, keys, value, isError }
}

/**
 * 編集情報クリア
 */
export function clearEditInfo() {
    return { type: CLEAR_EDIT };
}

/**
 * 削除するカード番号一覧をセットする
 * @param {array} data カード番号一覧
 */
export function setDeleteICCardNos(nos) {
    return { type: SET_DELETE_ICCARD_NOS, nos };
}

/**
 * ログインユーザーの電気錠ラックロケーション一覧をセットする（マスタ）
 * @param {array} locations 電気錠ラックロケーション一覧
 */
export function setLoginUserERackLocations(locations) {
    return { type: SET_LOGINUSER_ERACK_LOCATIONS, locations };
}


/**
 * 電気錠ラックロケーション一覧をセットする（編集画面のロケーション選択で使用）
 * @param {array} locations 電気錠ラックロケーション一覧
 */
export function setERackLocations(locations) {
    return { type: SET_ERACK_LOCATIONS, locations };
}

/**
 * ログインユーザー一覧をセットする（編集画面のユーザー選択で使用）
 * @param {array} loginUsers ログインユーザー一覧
 */
export function setLoginUsers(loginUsers) {
    return { type: SET_LOGIN_USERS, loginUsers };
}

/**
 * 「所属から選択する」フラグ変更
 * @param {boolean} useEnterprise 所属から選択するかどうか
 */
 export function changeUseEnterprise(useEnterprise) {
    return { type: CHANGE_USE_ENTERPEISE, useEnterprise };
}

/**
 * 「ユーザーから選択する」フラグ変更
 * @param {boolean} useLoginUser ユーザーから選択するかどうか
 */
 export function changeUseLoginUser(useLoginUser) {
    return { type: CHANGE_USE_LOGINUSER, useLoginUser };
}

/**
 * 保存不可フラグ変更
 * @param {boolean} value 保存不可かどうか
 */
export function chanegeInvalid(value) {
    return { type: CHANGE_IS_INVALID, value }
}

//#endregion

