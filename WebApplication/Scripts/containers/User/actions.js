/**
 * @license Copyright 2017 DENSO
 * 
 * Action(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 */


//Action 名の定義
//Action名は、一意になるように注意してください
export const SET_LOADSTATE = 'SET_LOADSTATE';
export const SET_LOADSTATE_CONDITION = 'SET_LOADSTATE_CONDITION';
export const SET_LOADSTATE_RESULT = 'SET_LOADSTATE_RESULT';
export const SET_LOGINUSERS = 'SET_LOGINUSERS';
export const SET_EDITED_USERS = 'SET_EDITED_USERS';
export const SET_SYSTEMSET = 'SET_SYSTEMSET';

/**
 * ロード中の状態をセットする
 * @param isLoad ロード中かどうか
 */
export function setLoadState(isLoad) {
    return { type: SET_LOADSTATE, value: isLoad };
}

/**
 * 検索条件のロード中の状態をセットする
 * @param {any} isLoad
 */
export function setLoadState_condition(isLoad) {
    return { type: SET_LOADSTATE_CONDITION, value: isLoad };
}

/**
 * 検索結果のロード中の状態をセットする
 * @param {any} isLoad
 */
export function setLoadState_result(isLoad) {
    return { type: SET_LOADSTATE_RESULT, value: isLoad };
}

/**
 * ユーザー情報をセットする
 * @param {any} loginUsers
 */
export function setLoginUsers(loginUsers) {
    return { type: SET_LOGINUSERS, value: loginUsers };
}

/**
 * 編集中ユーザーをセットする
 * @param {any} users
 */
export function setEditedUsers(users) {
    return { type: SET_EDITED_USERS, value: users };
}

/**
 * システム設定をセットする
 * @param {any} systemSet
 */
export function setSystemSet(systemSet) {
    return { type: SET_SYSTEMSET, value: systemSet };
}