/**
 * Copyright 2017 DENSO Solutions
 * 
 * Reducerを定義する。
 * ReducerはActionを受信してStateを更新する
 * 
 */
import { combineReducers } from 'redux';

import authentication from 'Authentication/reducer.js';
import waitingInfo from 'WaitState/reducer.js';
import networkError from 'NetworkError/reducer.js';

//メニュー用のReducerをインポート
import {
    SET_LOADSTATE, SET_LOADSTATE_CONDITION, SET_LOADSTATE_RESULT,
    SET_LOOKUP, SET_LAST_SEARCH_CONDITON, SET_ALARM_RESULT, SET_CONTACT_CHANGE_RESULT,
    SET_ALARM_RESULT_DISPLAY_STATE, SET_CONTACT_CHANGE_RESULT_DISPLAY_STATE
} from './actions.js';

/**
 * インシデントログ画面のReducer
 */
function isLoading(state = { condition: false, result: false }, action) {
    switch (action.type) {
        case SET_LOADSTATE:
            return action.value;

        case SET_LOADSTATE_CONDITION:
            return Object.assign({}, state, {
                condition: action.value
            });

        case SET_LOADSTATE_RESULT:
            return Object.assign({}, state, {
                result: action.value
            });

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

function lastSearchCondition(state = null, action) {
    switch (action.type) {
        case SET_LAST_SEARCH_CONDITON:
            return action.value;

        default:
            return state;
    }
}

function alarmResult(state = null, action) {
    switch (action.type) {
        case SET_ALARM_RESULT:
            return action.value;

        default:
            return state;
    }
}

function contactChangeResult(state = null, action) {
    switch (action.type) {
        case SET_CONTACT_CHANGE_RESULT:
            return action.value;

        default:
            return state;
    }
}

function alarmResultDisplayState(state = null, action) {
    switch (action.type) {
        case SET_ALARM_RESULT_DISPLAY_STATE:
            return action.value;

        default:
            return state;
    }
}

function contactChangeResultDisplayState(state = null, action) {
    switch (action.type) {
        case SET_CONTACT_CHANGE_RESULT_DISPLAY_STATE:
            return action.value;

        default:
            return state;
    }
}

//インシデントログ画面で使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    isLoading,
    waitingInfo,
    lookUp,
    lastSearchCondition,
    alarmResult,
    contactChangeResult,
    alarmResultDisplayState,
    contactChangeResultDisplayState,
    networkError
});

export default rootReducers;
