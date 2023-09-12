/**
 * @license Copyright 2017 DENSO
 * 
 * UnitMaintenancePanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

//Action名の定義
export const SET_UNIT_TYPES='SET_UNIT_TYPES';

//ActionCenter

/**
 * ユニット種別選択肢データ
 * @param {*} data
 */
export function setUnitTypes(data) {
    return { type: SET_UNIT_TYPES, value: data };
}


