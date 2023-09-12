/**
 * Copyright 2017 DENSO Solutions
 * 
 * RackCapacityPanelのAction(ActionCreator)を定義する。
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
export const REQUEST_CHANGE_MAP = 'REQUEST_CHANGE_MAP';
export const REQUEST_EMPTY_RACK = 'REQUEST_EMPTY_RACK';
export const REQUEST_RACK_INFO = 'REQUEST_RACK_INFO';
export const REQUEST_CAPACITY_MAPTRANSITION = 'REQUEST_CAPACITY_MAPTRANSITION';
export const REQUEST_EMPTY_LAYOUT = 'REQUEST_EMPTY_LAYOUT';
export const SET_LOOKUP = 'SET_LOOKUP';
export const SET_RACKSTATUS_OBJ = 'SET_RACKSTATUS_OBJ';
export const SET_EMPGROUP_LIST = 'SET_EMPGROUP_LIST';
export const SET_SELECT_EMPGROUP = 'SET_SELECT_EMPGROUP';
export const SET_RACKPOWER_INFO = 'SET_RACKPOWER_INFO';
export const SET_LINK_EGOBJ = 'SET_LINK_EGOBJ';

/**********************************
* 
* action creators
* 
**********************************/
export function requestInitInfo(info) {
    return { type: REQUEST_INIT_INFO, info };
}
export function requestChangeMap(data) {
    return { type: REQUEST_CHANGE_MAP, data };
}
export function requestEmptyRack(data) {
    return { type: REQUEST_EMPTY_RACK, data };
}
export function requestRackInfo(data) {
    return { type: REQUEST_RACK_INFO, data };
}
export function requestCapacityMapTransition(data) {
    return { type: REQUEST_CAPACITY_MAPTRANSITION, data};
}
export function requestEmptyLayout(data) {
    return { type: REQUEST_EMPTY_LAYOUT, data };
}

export function setLookUp(info) {
    return { type: SET_LOOKUP, info };
}

export function setRackStatusObject(info) {
    return { type: SET_RACKSTATUS_OBJ, info };
}

export function setEmptyGroupList(data) {
    return { type: SET_EMPGROUP_LIST, data };
}

export function setSelectEmptyGroup(data) {
    return { type: SET_SELECT_EMPGROUP, data }
}

export function setRackPowerInfo(data) {
    return { type: SET_RACKPOWER_INFO, data }
}

export function setLinkEGroupObject(data) {
    return { type: SET_LINK_EGOBJ, data}
}
