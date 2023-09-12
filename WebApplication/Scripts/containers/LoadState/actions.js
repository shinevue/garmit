/**
 * @license Copyright 2017 DENSO
 * 
 * ロード状態のAction(ActionCreator)を定義する。
 * 
 */
'use strict';

/********************************************
 * Action名
 ********************************************/
export const CHANGE_LOAD_STATE = 'CHANGE_LOAD_STATE';  

/********************************************
 * ActionCenter
 ********************************************/

/**
 * ロード状態変更Actionを作成する
 */
export function changeLoadState() {
    return { type: CHANGE_LOAD_STATE };
}

