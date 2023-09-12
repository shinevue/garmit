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
export const LOAD_LOGINRESULT = 'LOAD_LOGINRESULT';
export const CHANGE_LOADSTATE = 'CHANGE_LOADSTATE';

/**
 * ログイン結果を読み込む
 * @param {any} result
 */
export function loadLoginResult(result) {
    return { type: LOAD_LOGINRESULT, value: result };
}

/**
 * ロード中の状態変更のActionオブジェクトを作成します。
 * @param isLoad ロード中かどうか
 */
export function changeLoadState(isLoad) {
    return { type: CHANGE_LOADSTATE, value: isLoad };
}