/**
 * Copyright 2017 DENSO Solutions
 * 
 * FloorMapPanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 */

/**********************************
* 
* action types
* 
**********************************/
export const REQUEST_INIT_INFO = 'REQUEST_INIT_INFO';
export const REQUEST_RACK_VIEW = 'REQUEST_RACK_VIEW';
export const REQUEST_CHANGE_MAP = 'REQUEST_CHANGE_MAP';
export const REQUEST_TEMP_MAP = 'REQUEST_TEMP_MAP';
export const REQUEST_UPDATE = 'REQUEST_UPDATE';
export const SET_LOOKUP = 'SET_LOOKUP';
export const SET_INCIDENT = 'SET_INCIDENT';
export const SET_RACK_VIEW = 'SET_RACK_VIEW';
export const SET_TREND_GRAPH = 'SET_TREND_GRAPH';
export const SET_TEMPMAP_PATH = 'SET_TEMPMAP_PATH';
export const START_UPDATE = 'START_UPDATE';
export const END_UPDATE = 'END_UPDATE';
export const SET_DISABLED_RACK_FUNCTION = 'SET_DISABLED_RACK_FUNCTION';

/**********************************
* 
* action creators
* 
**********************************/
export function requestInitInfo(data) {
    return { type: REQUEST_INIT_INFO, data };
}
export function requestRackView(data) {
    return { type: REQUEST_RACK_VIEW, data };
}
export function requestChangeMap(data) {
    return { type: REQUEST_CHANGE_MAP, data };
}
export function requestUpdate(data) {
    return { type: REQUEST_UPDATE, data };
}
export function requestTempMap(data) {
    return { type: REQUEST_TEMP_MAP, data };
}

export function setLookUp(data) {
    return { type: SET_LOOKUP, data };
}
export function setIncident(data) {
    return { type: SET_INCIDENT, data };
}

export function setRackView(data) {
    return { type: SET_RACK_VIEW, data };
}

export function setTempmapPath(info) {
    return { type: SET_TEMPMAP_PATH, info };
}

export function startUpdate(data) {
    return { type: START_UPDATE, data };
}
export function endUpdate(data) {
    return { type: END_UPDATE, data };
}
export function setDisabledRackFunction(disabled) {
    return { type: SET_DISABLED_RACK_FUNCTION, disabled };
}