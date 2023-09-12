/**
 * @license Copyright 2023 DENSO
 * 
 * XxxPanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

//Action名の定義
//TODO：Action名を定義する。下記はサンプルのため、正しいAction名称に修正してください。
export const INITIAL_PANELINFO = 'INITIAL_PANELINFO';
export const REQUEST_INITIAL_INFO = 'REQUEST_INITIAL_INFO';

//ActionCenter
//TODO：定義したActionを作成するメソッド（ActionCenter）を下記に追加してください。
//TODO：下記はサンプルのため、ただしいActionCenterに修正してください。

/**
 * 画面初期化リクエスト（Saga呼び出し）
 * @param {*} initialValue 
 */
export function requestInitPanelInfo(initialValue) {
    return { type:REQUEST_INITIAL_INFO, value:initialValue };
}

/**
 * 画面初期化
 * @param {*} initialValue 
 */
export function initPanelInfo(initialValue) {
    return { type:INITIAL_PANELINFO, value:initialValue };
}
