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
import { SET_SYSTEM_SET, SET_DATA_TYPES } from './actions.js';

/**
 * デフォルト設定画面のReducer
 */
function systemSet(state = null, action) {
    switch (action.type) {
        case SET_SYSTEM_SET:
            return action.value;

        default:
            return state;
    }
}

function dataTypes(state = null, action) {
    switch (action.type) {
        case SET_DATA_TYPES:
            return action.value;

        default:
            return state;
    }
}


//Sabdboxで使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    isLoading,
    systemSet,
    dataTypes,
    waitingInfo
});

export default rootReducers;
