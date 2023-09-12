/**
 * Copyright 2017 DENSO Solutions
 * 
 * Reducerを定義する。
 * ReducerはActionを受信してStateを更新する
 * 
 */
import { combineReducers } from 'redux';

import authentication from 'Authentication/reducer.js';
import searchCondition from 'SearchCondition/reducer.js';
import networkError from 'NetworkError/reducer.js';

//メニュー用のReducerをインポート
import {
    CHANGE_LOADSTATE, CHANGE_LOADSTATE_CONDITION, CHANGE_LOADSTATE_REALTIMEDATA,
    SET_CURRENT_DATA, SET_LAST_DATA, SET_CURRENT_CONVERTED_DATA, SET_LAST_CONVERTED_DATA
} from './actions.js';

/**
 * リアルタイムモニタ画面のReducer
 */
function currentData(state = null, action) {
    switch (action.type) {
        case SET_CURRENT_DATA:
            return action.value;

        default:
            return state;
    }
}

function lastData(state = null, action) {
    switch (action.type) {
        case SET_LAST_DATA:
            return action.value;

        default:
            return state;
    }
}

function currentConvertedData(state = null, action) {
    switch (action.type) {
        case SET_CURRENT_CONVERTED_DATA:
            return action.value;

        default:
            return state;
    }
}

function lastConvertedData(state = null, action) {
    switch (action.type) {
        case SET_LAST_CONVERTED_DATA:
            return action.value;

        default:
            return state;
    }
}

function isLoading(state = { condition: false, realtimeData: false }, action) {
    switch (action.type) {
        case CHANGE_LOADSTATE:
            return {
                condition: action.value,
                realtimeData: action.value
            };

        case CHANGE_LOADSTATE_CONDITION:
            return Object.assign({}, state, {
                condition: action.value
            });

        case CHANGE_LOADSTATE_REALTIMEDATA:
            return Object.assign({}, state, {
                realtimeData: action.value
            });

        default:
            return state;
    }
}

//リアルタイムモニタ画面で使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    searchCondition,
    isLoading,
    currentData,
    lastData,
    currentConvertedData,
    lastConvertedData,
    networkError
});

export default rootReducers;
