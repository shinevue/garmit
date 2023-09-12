/**
 * @license Copyright 2017 DENSO
 * 
 * Action(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 */
'use strict';

export const SET_DATAGATES = 'SET_DATAGATES';
export const SET_GATE_STATUS = 'SET_GATE_STATUS';
export const SET_EDITED_DATAGATE = 'SET_EDITED_DATAGATE';
export const SET_DATABASES = 'SET_DATABASES';

export function setDatagates(datagates) {
    return { type: SET_DATAGATES, value: datagates };
}

export function setGateStatus(gateStatus) {
    return { type: SET_GATE_STATUS, value: gateStatus };
}

export function setEditedDatagate(datagate) {
    return { type: SET_EDITED_DATAGATE, value: datagate };
}

export function setDatabases(databases) {
    return { type: SET_DATABASES, value: databases };
}