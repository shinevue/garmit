/**
 * @license Copyright 2017 DENSO
 * 
 * 認証情報（authentication）のReducerを定義する。
 * ReducerはActionを受信してStateを更新する。
 * 
 * 注意点
 * ・引数で渡されたstateやactionそのものを変更してはいけません。
 * 　stateを変更するには、previousState を直接いじるのではなく、新しいオブジェクトを作成して返却します。
 * 
 */
'use strict';

import { combineReducers } from 'redux';

//Reducerで処理するAction名をインポートする。
import { SET_WAITING_STATE } from './actions.js';

/********************************************
 * Actionの処理を行うReducer
 ********************************************/

/**
 * データ更新中の待ち状態かどうか
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function isWaiting(state=false, action) {
    switch( action.type ) {
        case SET_WAITING_STATE:
            return action.isWaiting;

        default:
            return state;
    }
}

/**
 * 待ち状態の種別(save/delete)
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function waitingType(state = null, action) {
    switch (action.type) {
        case SET_WAITING_STATE:
            return action.waitingType;

        default:
            return state;
    }
}

const waitingInfo = combineReducers({
    isWaiting,
    waitingType
});

export default waitingInfo;
