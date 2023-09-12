/**
 * @license Copyright 2017 DENSO
 * 
 * Action(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 */
'use strict';

export const SET_SYSTEM_SET = 'SET_SYSTEM_SET';
export const SET_DATA_TYPES = 'SET_DATA_TYPES';

export function setSystemSet(systemSet) {
    return { type: SET_SYSTEM_SET, value: systemSet };
}

export function setDataTypes(dataTypes) {
    return { type: SET_DATA_TYPES, value: dataTypes };
}