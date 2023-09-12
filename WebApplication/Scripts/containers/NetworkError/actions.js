/**
 * @license Copyright 2019 DENSO
 * 
 * NetworkError(通信エラー)のAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

//Action名の定義
export const CHANGE_NETWORK_ERROR = 'CHANGE_NETWORK_ERROR';       

//ActionCenter

/**
 * ネットワークエラーを変更する
 * @param {*} isError エラーかどうか
 */
export function changeNetworkError(isError) {
    return { type: CHANGE_NETWORK_ERROR, isError };
}
