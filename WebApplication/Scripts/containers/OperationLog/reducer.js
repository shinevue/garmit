/**
 * Copyright 2017 DENSO Solutions
 * 
 * Reducerを定義する。
 * ReducerはActionを受信してStateを更新する
 * 
 */
import { combineReducers } from 'redux';

import authentication from 'Authentication/reducer.js';

//メニュー用のReducerをインポート
import { SET_LOOKUP, SET_OPERATIONLOG_RESULT, SET_LOADSTATE, SET_LOADSTATE_CONDITION, SET_LOADSTATE_RESULT } from './actions.js';

/**
 * オペレーションログ画面のReducer
 */
function lookUp(state = null, action) {
    switch (action.type) {
        case SET_LOOKUP:
            return action.value;

        default:
            return state;
    }
}

function operationLogResult(state = null, action) {
    switch (action.type) {
        case SET_OPERATIONLOG_RESULT:
            return action.value;

        default:
            return state;
    }
}

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

//オペレーションログ画面で使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    lookUp,
    operationLogResult,
    isLoading
});

export default rootReducers;
