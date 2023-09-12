/**
 * @license Copyright 2018 DENSO
 * 
 * 左右のラック、ロケーション選択用のAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

/********************************************
 * Action名
 ********************************************/
export const SET_LOCATION = 'SET_LOCATION';
export const SET_LAYOUT_OBJECT = 'SET_LAYOUT_OBJECT';
export const SET_RACK = 'SET_RACK';
export const CLEAR_RACK = 'CLEAR_RACK';
export const SET_RACKPOWER_VALUES = 'SET_RACKPOWER_VALUES';


/********************************************
 * ActionCenter
********************************************/

/**
 * ロケーションを選択する
 * @param {object} location 選択したロケーション
 * @param {array} position ロケーションの位置
 * @param {boolean} isLeft 左側のロケーションかどうか
 */
export function setLocation(location, position, isLeft) {
    return { type:SET_LOCATION, location:location, position: position, isLeft: isLeft };
}

/**
 * 選択中のレイアウトオブジェクトをセットする
 * @param {object} layoutObject レイアウトオブジェクト
 * @param {boolean} isLeft 左側のロケーションかどうか
 */
export function setLayoutObject(layoutObject, isLeft) {
    return { type:SET_LAYOUT_OBJECT, layoutObject, isLeft };
}

/**
 * ラックを選択する
 * @param {object} rack 選択したラック
 * @param {boolean} isLeft 左側のロケーションかどうか
 */
export function setRack(rack, isLeft) {
    return { type:SET_RACK, rack:rack, isLeft: isLeft };
}

/**
 * ラック電源の定格値や実測値をセットするActionを作成する
 * @param {object} rackPowerValues 読み込んだラック電源の使用状況
 * @param {boolean} isLeft 左側のロケーションかどうか
 */
export function setRackPowerValues(rackPowerValues, isLeft) {
    return { type: SET_RACKPOWER_VALUES, values:rackPowerValues, isLeft: isLeft };
}

/**
 * ラック選択をクリアする
 * @param {boolean} isLeft 左側のロケーションかどうか
 */
export function clearRack(isLeft) {
    return { type:CLEAR_RACK, isLeft: isLeft };
}