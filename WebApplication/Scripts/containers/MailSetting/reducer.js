/**
 * @license Copyright 2017 DENSO
 * 
 * Reducerを定義する。
 * ReducerはActionを受信してStateを更新する
 * 
 */
'use strict';

import { combineReducers } from 'redux';

import authentication from 'Authentication/reducer.js';
import waitingInfo from 'WaitState/reducer.js';
import isLoading from 'LoadState/reducer.js';

//メニュー用のReducerをインポート
import { SET_SYSTEM_SET, SET_MAIL_TEMPLATE } from './actions.js';

function systemSet(state = null, action) {
    switch (action.type) {
        case SET_SYSTEM_SET:
            return action.value;

        default:
            return state;
    }
}

//Sabdboxで使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    waitingInfo,
    isLoading,
    systemSet
});

export default rootReducers;
