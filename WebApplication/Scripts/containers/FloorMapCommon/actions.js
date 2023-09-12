/**
 * Copyright 2017 DENSO Solutions
 * 
 * FloorMapCommonのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 */

//#region action types
/**********************************
* 
* action types
* 
**********************************/
//saga request
export const REQUEST_MAP_TRANSITION = 'REQUEST_MAP_TRANSITION';
export const REQUEST_SELECT_LAYOUT = 'REQUEST_SELECT_LAYOUT';
export const REQUEST_OBJECT_LINK = 'REQUEST_OBJECT_LINK';

//selectLayout
export const SET_SELECT_LAYOUT = 'SET_SELECT_LAYOUT';
export const UPDATE_LAYOUT = 'UPDATE_LAYOUT';

//selectedLayoutList
export const CHANGE_INDEX = 'CHANGE_INDEX';
export const ADD_LAYOUT_LOG = 'ADD_LAYOUT_LOG';

//floorMapOptionInfo
export const CHANGE_CHECK_STATE = 'CHANGE_CHECK_STATE';
export const SET_OPTIONS = 'SET_OPTIONS';
export const UNCHECK_OPTIONS = 'UNCHECK_OPTIONS';
export const CHANGE_SWITCH_STATE = 'CHANGE_SWITCH_STATE';

//layoutObjects
export const SET_LAYOUT_OBJ = 'SET_LAYOUT_OBJ';

//selectObjectInfo
export const SET_SELECT_OBJECT = 'SET_SELECT_OBJECT';
export const SET_OBJECT_LINK = 'SET_OBJECT_LINK';
export const CLEAR_SELECT_OBJECT = 'CLEAR_SELECT_OBJECT';

//drawingArea
export const SET_DRAWING_AREA = 'SET_DRAWING_AREA';

//isConvert
export const SET_IS_CONVERT = 'SET_IS_CONVERT';
//#endregion

//#region action creators
/**********************************
* 
* action creators
* 
**********************************/
//#region saga request
export function requestMapTransition(data) {
    return { type: REQUEST_MAP_TRANSITION, data };
}
export function requestSelectLayout(data, option) {
    return { type: REQUEST_SELECT_LAYOUT, data, option };
}
export function requestObjectLink(data) {
    return { type: REQUEST_OBJECT_LINK, data };
}
//#endregion

//#region selectLayout
export function setSelectLayout(data) {
    return { type: SET_SELECT_LAYOUT, data };
}
export function updateLayout(data) {
    return { type: UPDATE_LAYOUT, data };
}
//#endregion

//#region selectedLayoutList
export function changeIndex(data) {
    return { type: CHANGE_INDEX, data };
}
export function addLayoutLog(data) {
    return { type: ADD_LAYOUT_LOG, data }
}
//#endregion

//#region floorMapOptionInfo
export function changeCheckState(data) {
    return { type: CHANGE_CHECK_STATE, data };
}
export function setOptions(options, titles) {
    return { type: SET_OPTIONS, options, titles };
}
export function uncheckOptions(data) {
    return { type: UNCHECK_OPTIONS, data };
}
//#endregion

//#region layoutObjects
export function setLayoutObject(data) {
    return { type: SET_LAYOUT_OBJ, data };
}
//#endregion

//#region selectObjectInfo
export function setSelectObject(data) {
    return { type: SET_SELECT_OBJECT, data }
}
export function setObjectLink(data) {
    return { type: SET_OBJECT_LINK, data }
}
export function clearSelectObject(data) {
    return { type: CLEAR_SELECT_OBJECT, data }
}
//#endregion

//#region eGroupObjects
export function setEgroupObject(data) {
    return { type: SET_EGROUP_OBJ, data }
}
//#endregion

//#region drawingArea
export function setDrawingArea(data) {
    return { type: SET_DRAWING_AREA, data };
}
//#endregion

//#region isConvert
export function setIsConvert(data) {
    return { type: SET_IS_CONVERT, data };
}
//#endregion

//#endregion