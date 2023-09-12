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
import { SET_LOADSTATE, SET_TAGS, SET_LOOK_UP, SET_LOOK_UP_OF_ENTERPRISE } from './actions.js';

/**
 * タグメンテナンス画面のReducer
 */
function isLoading(state = false, action) {
    switch (action.type) {
        case SET_LOADSTATE:
            return action.value;

        default:
            return state;
    }
}

function tags(state = null, action) {
    switch (action.type) {
        case SET_TAGS:
            return action.value;

        default:
            return state;
    }
}

function lookUp(state = null, action) {
    switch (action.type) {
        case SET_LOOK_UP:
            return action.value;

        default:
            return state;
    }
}

function lookUpOfEnterprise(state = null, action) {
    switch (action.type) {
        case SET_LOOK_UP_OF_ENTERPRISE:
            return action.value;

        default:
            return state;
    }
}

//Sabdboxで使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    isLoading,
    tags,
    lookUp,
    lookUpOfEnterprise,
    waitingInfo
});

export default rootReducers;
