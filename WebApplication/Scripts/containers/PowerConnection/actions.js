/**
 * @license Copyright 2017 DENSO
 * 
 * DispPowerSystemPanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

//Action名の定義
export const SET_EGROUP_LIST      ='SET_EGROUP_LIST';
export const SET_SELECT_EGROUP 　 ='SET_SELECT_EGROUP';
export const SET_VALUE_LAVEL_DATA ='SET_VALUE_LAVEL_DATA';
export const SET_RIGHT_BREAKER    ='SET_RIGHT_BREAKER';
export const SET_LEFT_BREAKER     ='SET_LEFT_BREAKER';


//ActionCenter
/**
 * 電源系統一覧
 * @param {*} egroupList
 */
export function setEgroupList(egroupList) {
    return { type: SET_EGROUP_LIST, value: egroupList };
}
/**
 * 選択中電源系統
 * @param {*} egroup
 */
export function setSelectedEgroup(egroup) {
    return { type: SET_SELECT_EGROUP, value: egroup };
}
/**
 * 表示中電源系統計測値ラベルデータ
 * @param {*} values
 */
export function setValueLabelData(values) {
    return { type: SET_VALUE_LAVEL_DATA, value: values };
}
/**
 * 右側選択中ブレーカー情報
 * @param {*} data
 */
export function setRightBreaker(data) {
    return { type: SET_RIGHT_BREAKER, value: data };
}
/**
 * 左側選択中ブレーカー情報
 * @param {*} data
 */
export function setLeftBreaker(data) {
    return { type: SET_LEFT_BREAKER, value: data };
}
