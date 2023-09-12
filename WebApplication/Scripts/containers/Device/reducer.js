/**
 * @license Copyright 2017 DENSO
 * 
 * Reducerを定義する。
 * ReducerはActionを受信してStateを更新する
 * 
 */
'use strict';

import { combineReducers } from 'redux';
import { routerReducer, LOCATION_CHANGE } from 'react-router-redux';

import authentication from 'Authentication/reducer.js';
import searchResult from 'SearchResult/reducer.js';
import waitingInfo from 'WaitState/reducer.js';
import isLoading from 'LoadState/reducer.js';
import networkError from 'NetworkError/reducer.js';

//メニュー用のReducerをインポート
import { SET_DATAGATES, SET_GATE_STATUS, SET_EDITED_DATAGATE, SET_DATABASES } from './actions.js';

/**
 * 機器メンテナンス画面のReducer
 */
function datagates(state = null, action) {
    switch (action.type) {
        case SET_DATAGATES:
            return action.value;

        default:
            return state;
    }
}

function gateStatus(state = null, action) {
    switch (action.type) {
        case SET_GATE_STATUS:
            return action.value;

        default:
            return state;
    }
}

function editedDatagate(state = null, action) {
    switch (action.type) {
        case SET_EDITED_DATAGATE:
            return action.value;

        default:
            return state;
    }
}

function databases(state = [], action) {
    switch (action.type) {
        case SET_DATABASES:
            return action.value;

        default:
            return state;
    }
}

//Sabdboxで使用するReducerを列挙
const rootReducers = combineReducers({
    routing: routerReducer,
    authentication,
    searchResult,
    waitingInfo,
    isLoading,
    datagates,
    gateStatus,
    editedDatagate,
    databases,
    networkError
});

export default rootReducers;
