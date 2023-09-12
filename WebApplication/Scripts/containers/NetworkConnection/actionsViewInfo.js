/**
 * @license Copyright 2017 DENSO
 * 
 * NetworkListPanel及びNetworkEditPanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

/********************************************
 * Action名
 ********************************************/
export const SET_VIEW_NETWORKPATH = 'SET_VIEW_NETWORKPATH';
export const SET_VIEW_SELECTED_NETWORKPATH = 'SET_VIEW_SELECTED_NETWORKPATH';
export const CLEAR_VIEW_SELECTED_NETWORKPATH = 'CLEAR_VIEW_SELECTED_NETWORKPATH';
export const CLEAR_VIEW_NETWORKPATH = 'CLEAR_VIEW_NETWORKPATH';

/********************************************
 * ActionCenter
 ********************************************/

/**
 * ネットワーク経路表示用のネットワーク経路をセットするActionを作成する
 * @param {array} networkPaths ネットワーク情報一覧
 */
export function setViewNetworkPathList(networkPath) {
    return { type:SET_VIEW_NETWORKPATH, networkPath:networkPath };
}

/**
 * ネットワーク経路表示用のネットワーク経路をクリアするActionを作成する
 */
export function clearViewNetworkPathList() {
    return { type:CLEAR_VIEW_NETWORKPATH };
}

/**
 * ネットワーク経路表示画面で選択されたネットワーク情報をセットするActionを作成する
 * @param {object} networkPath ネットワーク情報
 */
export function setViewNetworkPath(networkPath, isExchange) {
    return { type:SET_VIEW_SELECTED_NETWORKPATH, networkPath:networkPath, isExchange: isExchange };
}

/**
 * ネットワーク経路表示画面で選択されたネットワーク情報をクリアするActionを作成する
 */
export function clearViewNetworkPath() {
    return { type:CLEAR_VIEW_SELECTED_NETWORKPATH };
}
