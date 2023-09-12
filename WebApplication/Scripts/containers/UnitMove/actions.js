/**
 * @license Copyright 2017 DENSO
 * 
 * UnitMovePanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

/********************************************
 * Action名
 ********************************************/
export const SET_LOCATIONS = 'SET_LOCATIONS';
export const SET_LAYOUTS = 'SET_LAYOUTS';
export const SET_MOVING_INFO = 'SET_MOVING_INFO';
export const SET_TARGET_POSITION = 'SET_TARGET_POSITION';
export const CLEAR_MOVING_INFO = 'CLEAR_MOVING_INFO';
export const CLEAR_TARGET_INFO = 'CLEAR_TARGET_INFO';
export const UNITSELECT_MODAL_STATE = 'UNITSELECT_MODAL_STATE';
export const COMPLETED_MODAL_STATE = 'COMPLETED_MODAL_STATE';
export const MESSAGE_MODAL_STATE = 'MESSAGE_MODAL_STATE';
export const SET_LOADSTATE = 'SET_LOADSTATE';
export const CHANGE_MODE = 'CHANGE_MODE';

export const CLEAR_MOVING_DSIPSETTING = 'CLEAR_MOVING_DSIPSETTING';
export const CLEAR_TARGET_POSITION = 'CLEAR_TARGET_POSITION';

/********************************************
 * ActionCenter
********************************************/

/**
 * ロケーションリストをセットするActionを作成する
 * @param {array} locations ロケーションリスト
 */
export function setLocations(locations) {
    return { type:SET_LOCATIONS, locations:locations };
}

/**
 * レイアウトリストをセットするActionを作成する
 * @param {array} layouts レイアウトリスト
 */
export function setLayouts(layouts) {
    return { type:SET_LAYOUTS, layouts };
}

/**
 * 移動情報（ユニット位置以外）をセットするActionを作成する
 * @param {object} dispSetting 表示設定グループ
 * @param {object} sourceRack 移動元ラック
 * @param {object} targetRack 移動先ラック
 * @param {boolean} isLeftDirection 移動方向が左方向かどうか
 */
export function setMovingInfo(dispSetting, sourceRack, targetRack, isLeftDirection) {
    return { type:SET_MOVING_INFO, dispSetting:dispSetting, sourceRack: sourceRack, targetRack: targetRack, isLeftDirection: isLeftDirection };
}

/**
 * 移動対象の表示設定IDと位置をセットするActionを作成する
 * @param {string} dispSetId 表示設定ID
 * @param {object} position 移動対象のユニット位置
 */
export function setTargetPosition(dispSetId, position) {
    return { type:SET_TARGET_POSITION, dispSetId:dispSetId, position: position };
}

/**
 * 移動情報（対象ラック、位置、移動ユニットなど）をクリアするActionを作成する
 */
export function clearMovingInfo() {
    return { type:CLEAR_MOVING_INFO };
}

/**
 * 移動対象をクリアするActionを作成する
 */
export function clearTargetInfo() {
    return { type:CLEAR_TARGET_INFO };
}

/**
 * ロード状態をセットするActionを作成する
 * @param {boolean} isLoading ロード中かどうか
 */
export function setLoadState(isLoading) {
    return { type: SET_LOADSTATE, value:isLoading };
}

/**
 * ユニット選択モーダルの表示状態をセットするActionを作成する
 * @param {boolean} show 表示するかどうか
 */
export function changeUnitSelectModalState(show) {    
    return { type: UNITSELECT_MODAL_STATE, value:show };
}

/**
 * 保存完了モーダルの表示状態をセットするActionを作成する
 * @param {boolean} show 表示するかどうか
 * @param {number} locationId 保存したロケーションID
 * @param {string} dispSetId 保存した表示設定ID
 */
export function changeSaveCompletedModalState(show, locationId, dispSetId) {    
    return { type: COMPLETED_MODAL_STATE, value:show, locationId: locationId, dispSetId: dispSetId };
}

/**
 * メッセージモーダルの表示状態をセットするActionを作成する
 * @param {boolean} show 表示するかどうか
 * @param {string} title タイトル
 * @param {srting} message メッセージ
 * @param {function} callback コールバック関数 
 */
export function changeMessageModalState(show, title, message, callback) {
    return { type: MESSAGE_MODAL_STATE, value:show, title:title, message:message, callback: callback };
}

/**
 * モードを変更するActionを作成する
 * @param {number} mode モード番号
 */
export function changeMode(mode) {
    return { type: CHANGE_MODE, mode: mode };
}
