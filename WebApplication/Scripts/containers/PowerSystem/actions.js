/**
 * @license Copyright 2017 DENSO
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
export const SET_EDITMODE = 'SET_EDITMODE';
export const SET_LOOKUP = 'SET_LOOKUP';
export const SET_EGROUPS = 'SET_EGROUPS';


//ActionCenter
//TODO：定義したActionを作成するメソッド（ActionCenter）を下記に追加してください。
//TODO：下記はサンプルのため、ただしいActionCenterに修正してください。
/**
 * 編集モードをセットする
 * @param {any} isEditMode
 */
export function setEditMode(isEditMode) {
    return { type: SET_EDITMODE, value: isEditMode };
}

/**
 * マスターデータをセットする
 * @param {any} lookUp
 */
export function setLookUp(lookUp) {
    return { type: SET_LOOKUP, value: lookUp };
}

/**
 * 電源系統をセットする
 * @param {any} egroups
 */
export function setEgroups(egroups) {
    return { type: SET_EGROUPS, value: egroups };
}