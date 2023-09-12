/**
 * @license Copyright 2017 DENSO
 * 
 * LocationMaintenancePanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

//Action名の定義
export const SET_LOCATION_LIST = 'SET_LOCATION_LIST';
export const SET_LOOKUP = 'SET_LOOKUP';
export const SET_SELECT_LOCATION    ='SET_SELECT_LOCATION';
export const SET_SORT_LOCATIONS = 'SET_SORT_LOCATIONS';
export const SET_EDIT_LOCATION = 'SET_EDIT_LOCATION';
export const CHANGE_LOCATION_ORDER  ='CHANGE_LOCATION_ORDER';
export const CHANGE_LOCATION_NAME   ='CHANGE_LOCATION_NAME';
export const CHANGE_IS_RACK         ='CHANGE_IS_RACK';
export const CHANGE_RACK_INFO       = 'CHANGE_RACK_INFO';

//ActionCenter

/**
 * ロケーション一覧設定
 * @param {*} loations 
 */
export function setLocationList(loations) {
    return { type: SET_LOCATION_LIST, value: loations };
}

/**
 * lookUp設定
 * @param {*} lookUp
 */
export function setLookUp(lookUp) {
    return { type: SET_LOOKUP, value: lookUp };
}

/**
 * 選択ロケーション設定
 * @param {*} loation 
 */
export function setSelectLocation(info) {
    return { type: SET_SELECT_LOCATION, location: info.location, position:info.position };
}

/**
 * 並べ替え対象ロケーション設定
 * @param {*} loations 
 */
export function setSortLocations(locations) {
    return { type: SET_SORT_LOCATIONS, value: locations };
}

/**
 * 編集対象ロケーション設定
 * @param {*} location
 */
export function setEditLocation(location) {
    return { type: SET_EDIT_LOCATION, value: location };
}

/**
 * ロケーション名称変更
 * @param {*} name 
 */
export function changeLocationName(name) {
    return { type: CHANGE_LOCATION_NAME, value: name };
}

/**
 * ラックとして登録するかどうか変更
 * @param {*} isRack 
 */
export function changeIsRack(isRack) {
    return { type: CHANGE_IS_RACK, value: isRack };
}

/**
 * ラックス情報変更
 * @param {*} rack
 */
export function changeRackInfo(rack) {
    return { type: CHANGE_RACK_INFO, value: rack };
}
