/**
 * Copyright 2017 DENSO Solutions
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
export const SET_ENTERPRISES = 'SET_ENTERPRISES';
export const SET_EDITED_ENTERPRISES = 'SET_EDITED_ENTERPRISES';
export const SET_LOGIN_USER = 'SET_LOGIN_USER';


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
 * ログインユーザー情報をセットする
 * @param {any} user
 */
export function setLoginUser(user) {
    return { type: SET_LOGIN_USER, value: user };
}

/**
 * 所属情報をセットする
 * @param {any} enterprises
 */
export function setEnterprises(enterprises) {
    return { type: SET_ENTERPRISES, value: enterprises };
}

/**
 * 編集中の所属をセットする
 * @param {any} enterprises
 */
export function setEditedEnterprises(enterprises) {
    return { type: SET_EDITED_ENTERPRISES, value: enterprises };
}