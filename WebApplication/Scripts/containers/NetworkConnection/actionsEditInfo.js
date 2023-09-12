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
export const SET_EDITING_NETWORKPATH = 'SET_EDITING_NETWORKPATH';
export const SET_UNITDISPSETTING = 'SET_UNITDISPSETTING';
export const SET_UNIT = 'SET_UNIT';
export const SET_PORT = 'SET_PORT';
export const SET_PORT_INDEX = 'SET_PORT_INDEX';
export const SET_UNITDISPSETTING_ONLY = 'SET_UNITDISPSETTING_ONLY';
export const CHANGE_NETWORK_INFO = 'CHANGE_NETWORK_INFO';
export const CHANGE_NETWORK_CONNECT = 'CHANGE_NETWORK_CONNECT';
export const CLEAR_NETWORK_CONNECT = 'CLEAR_NETWORK_CONNECT';
export const CLEAR_NETWORK_ONE_SIDE = 'CLEAR_NETWORK_ONE_SIDE';
export const SET_EDITMODE = 'SET_EDITMODE';

/********************************************
 * ActionCenter
 ********************************************/
/**
 * 編集中のネットワーク情報をセットするActionを作成する
 * @param {object} networkPath ネットワーク情報
 */
export function setEditingNetworkPath(networkPath) {
    return { type:SET_EDITING_NETWORKPATH, networkPath:networkPath };
}

/**
 * 表示設定グループをセットするActionを作成する
 * @param {object} unitDispSetting 表示設定グループ情報
 * @param {boolean} isLeft 左側かどうか
 */
export function setUnitDispSetting(unitDispSetting, isLeft) {
    return { type:SET_UNITDISPSETTING, unitDispSetting:unitDispSetting, isLeft: isLeft };
}

/**
 * ユニットをセットするActionを作成する
 * @param {object} unit ユニット情報
 * @param {boolean} canConnect 接続できるか
 * @param {boolean} isLeft 左側かどうか
 */
export function setUnit(unit, canConnect, isLeft) {
    return { type:SET_UNIT, unit:unit, canConnect: canConnect, isLeft: isLeft };
}

/**
 * ポートをセットするActionを作成する
 * @param {object} port ポート情報
 * @param {number} portIndex ポートインデックス
 * @param {boolean} canConnect 接続できるか
 * @param {boolean} isLeft 左側かどうか
 */
export function setPort(port, portIndex, canConnect, isLeft) {
    return { type:SET_PORT, port:port, portIndex: portIndex, canConnect: canConnect, isLeft: isLeft };
}

/**
 * ポートインデックスをセットするActionを作成する
 * @param {number} portIndex ポートインデックス
 * @param {boolean} canConnect 接続できるか
 * @param {boolean} isLeft 左側かどうか
 */
export function setPortIndex(portIndex, canConnect, isLeft) {
    return { type:SET_PORT_INDEX, portIndex: portIndex, canConnect: canConnect, isLeft: isLeft };
}

/**
 * 表示設定グループのみをセットするActionを作成する
 * @param {object} unitDispSetting 表示設定グループ情報
 * @param {boolean} isLeft 左側かどうか
 */
export function setUnitDispSettingOnly(unitDispSetting, isLeft) {
    return { type:SET_UNITDISPSETTING_ONLY, unitDispSetting:unitDispSetting, isLeft: isLeft };
}

/**
 * ネットワーク設定情報を変更するActionを作成する
 * @param {object} netwrok ネットワーク情報
 * @param {boolean} invalid 
 */
export function changeNetworkInfo(network, invalid) {
    return { type:CHANGE_NETWORK_INFO, network:network, invalid: invalid };
}

/**
 * ネットワーク接続を変更するActionを作成する
 * @param {object} rackFrom 接続元ラック情報
 * @param {object} unitFrom 接続元ユニット情報
 * @param {object} portFrom 接続元ポート情報
 * @param {object} rackTo 接続先ラック情報
 * @param {object} unitTo 接続先ユニット情報
 * @param {object} portTo 接続先ポート情報
 */
export function changeNetworkConnect(rackFrom, unitFrom, portFrom, portIndexFrom, rackTo, unitTo, portTo, portIndexTo) {
    return { type:CHANGE_NETWORK_CONNECT, rackFrom:rackFrom, unitFrom:unitFrom, portFrom:portFrom, portIndexFrom: portIndexFrom, rackTo:rackTo, unitTo:unitTo, portTo:portTo, portIndexTo: portIndexTo };
}

/**
 * ネットワーク接続をクリアするActionを作成する
 */
export function clearNetworkConnect() {
    return { type:CLEAR_NETWORK_CONNECT };
}

/**
 * ネットワーク接続を片方だけクリアするActionを作成する
 * @param {boolean} isFrom クリア対象が接続元情報かどうか
 */
export function clearNetworkOneSide(isFrom) {
    return { type:CLEAR_NETWORK_ONE_SIDE, isFrom:isFrom };
}

/**
 * 編集モードを変更するActionを作成する
 * @param {boolean} isEditMode 編集モードかどうか
 */
export function setEditMode(isEditMode) {
    return { type:SET_EDITMODE, isEditMode:isEditMode };
}
