/**
 * @license Copyright 2017 DENSO
 * 
 * XxxPanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

/********************************************
 * Action名
 ********************************************/
export const INITIAL_PANELINFO = 'INITIAL_PANELINFO';   

export const SET_TEMPLATE_TYPE = 'SET_TEMPLATE_TYPE';
export const SET_DELETE_TEMPLATE_IDS = 'SET_DELETE_TEMPLATE_IDS';
export const CHANGE_MODAL_STATE = 'CHANGE_MODAL_STATE';
export const SET_LOADSTATE = 'SET_LOADSTATE';



/********************************************
 * ActionCenter
 ********************************************/

/**
 * 削除対象テンプレートIDをセットするActionを作成する
 * @param {array} templateIds 削除対象のテンプレートID群
 */
export function setTemplateType(templateType) {
    return { type: SET_TEMPLATE_TYPE, templateType:templateType };
}

/**
 * 削除対象テンプレートIDをセットするActionを作成する
 * @param {array} templateIds 削除対象のテンプレートID群
 */
export function setDeleteTemplateIds(templateIds) {
    return { type: SET_DELETE_TEMPLATE_IDS, templateIds:templateIds };
}

/**
 * ロード状態をセットするActionを作成する
 * @param {boolean} isLoading ロード中かどうか
 */
export function setLoadState(isLoading) {
    return { type: SET_LOADSTATE, value:isLoading };
}

/**
 * メッセージモーダルの表示状態をセットするActionを作成する
 * @param {boolean} show 表示するかどうか
 * @param {string} title タイトル
 * @param {srting} message メッセージ
 * @param {string} modalType モーダルの種別
 * @param {function} callback コールバック関数 
 */
export function changeModalState(show, title, message, modalType, callback) {
    return { type: CHANGE_MODAL_STATE, show:show, title:title, message:message, modalType:modalType, callback: callback };
}
