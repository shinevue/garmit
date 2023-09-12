/**
 * @license Copyright 2017 DENSO
 * 
 * Action(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 */
'use strict';

export const SET_UNIT_IMAGES = 'SET_UNIT_IMAGES';
export const SET_UNIT_TYPES = 'SET_UNIT_TYPES';
export const SET_EDITED_UNIT_IMAGE = 'SET_EDITED_UNIT_IMAGE';


/**
 * ユニット画像一覧をセットする
 * @param {any} unitImages
 */
export function setUnitImages(unitImages) {
    return { type: SET_UNIT_IMAGES, value: unitImages };
}

/**
 * ユニット種別一覧をセットする
 * @param {any} unitTypes
 */
export function setUnitTypes(unitTypes) {
    return { type: SET_UNIT_TYPES, value: unitTypes };
}

/**
 * 編集対象のユニット画像をセットする
 * @param {any} unitImage
 */
export function setEditedUnitImage(unitImage) {
    return { type: SET_EDITED_UNIT_IMAGE, value: unitImage };
}