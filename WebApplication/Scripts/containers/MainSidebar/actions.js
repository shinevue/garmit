/**
 * @license Copyright 2018 DENSO
 * 
 * MainSidebarPanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

/********************************************
 * Action名
 ********************************************/
export const SET_MENU_INFO = 'SET_MENU_INFO';       

/********************************************
 * ActionCenter
 ********************************************/

/**
 * メニューサイドバーに表示する情報をセットするActionを作成する
 * @param {object} info メニュー情報
 */
export function setMenuInfo(info) {
    return { type:SET_MENU_INFO, value:info };
}
