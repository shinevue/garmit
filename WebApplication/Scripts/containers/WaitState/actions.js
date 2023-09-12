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
export const SET_WAITING_STATE = 'SET_WAITING_STATE';  

/********************************************
 * ActionCenter
 ********************************************/

/**
 * ロード状態変更Actionを作成する
 * @param {boolean} 待ち状態かどうか
 * @param {string} 待ち状態種別(save/delete)
 */
export function setWaitingState(isWaiting, waitingType = null) {
    return { type: SET_WAITING_STATE, isWaiting: isWaiting, waitingType: waitingType };
}

