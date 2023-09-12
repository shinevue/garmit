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

//メニュー用のReducerをインポート
import { SET_LOADSTATE, SET_MAIL_TEMPLATE, SET_LOOKUP } from './actions.js';

function isLoading(state = false, action) {
    switch (action.type) {
        case SET_LOADSTATE:
            return action.value;

        default:
            return state;
    }
}

function lookUp(state = null, action) {
    switch (action.type) {
        case SET_LOOKUP:
            return action.value;

        default:
            return state;
    }
}

function mailTemplate(state = null, action) {
    switch (action.type) {
        case SET_MAIL_TEMPLATE:
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
    lookUp,
    mailTemplate
});

export default rootReducers;
