/**
 * @license Copyright 2018 DENSO
 * 
 * ロケーション選択のAction(ActionCreator)を定義する。
 * 
 */
'use strict';

//------------Action名の定義------------

export const SET_LOCATIONS = 'SET_LOCATIONS';
export const SET_LAYOUTS = 'SET_LAYOUTS';
export const SELECT_LOCATION = 'SELECT_LOCATION';
export const CLEAR_LOCATION = 'CLEAR_LOCATION';
export const SELECT_LAYOUT_OBJECT = 'SELECT_LAYOUT_OBJECT';
export const CLEAR_LAYOUT_OBJECT = 'SELECT_LAYOUT_OBJECT';

//------------ActionCenter------------

/**
 * ロケーションリストをセットするAction
 * @param {array} locations 読み込んだロケーションリスト
 */
export function setLocations(locations) {
    return { type:SET_LOCATIONS, value:locations };
}

/**
 * レイアウトリストをセットするAction
 * @param {array} layouts 読み込んだレイアウトリスト
 */
export function setLayouts(layouts) {
    return { type:SET_LAYOUTS, value:layouts };
}

/**
 * ロケーションを選択する
 * @param {object} location 選択したロケーション
 * @param {array} position ロケーションの位置
 */
export function selectLocation(location, position) {
    return { type:SELECT_LOCATION, value:location, position: position };
}

/**
 * ロケーション選択をクリアする
 */
export function clearLocation() {
    return { type:CLEAR_LOCATION, value:[] };
}

/**
 * 選択中のレイアウトオブジェクトをセットする
 * @param {object} layoutObject レイアウトオブジェクト
 */
export function selectLayoutObject(layoutObject) {
    return { type:SELECT_LAYOUT_OBJECT, value:layoutObject };
}

/**
 * 選択中のレイアウトオブジェクトをクリアする
 */
export function clearLayoutObject() {
    return { type:CLEAR_LAYOUT_OBJECT };
}
