/**
 * Copyright 2019 DENSO
 * 
 * Reducerを定義する。
 * ReducerはActionを受信してStateを更新する
 * 
 */
import { combineReducers } from 'redux';
import { MEASURED_DATA_TYPE } from 'constant';

import authentication from 'Authentication/reducer.js';
import waitingInfo from 'WaitState/reducer.js';
import networkError from 'NetworkError/reducer.js';

//メニュー用のReducerをインポート
import { SET_LOADSTATE, SET_LOADSTATE_CONDITION, SET_LOADSTATE_DEMANDGRAPH, SET_LOOKUP, SET_LAST_CONDITION, SET_DEMANDGRAPH, SET_MEASURED_DATA_TYPE } from './actions.js';

/**
 * デマンドグラフ画面のReducer
 */
function isLoading(state = { condition: false, demandGraph: false }, action) {
    switch (action.type) {
        case SET_LOADSTATE:
            return {
                condition: action.value,
                demandGraph: action.value
            };

        case SET_LOADSTATE_CONDITION:
            return Object.assign({}, state, {
                condition: action.value
            });

        case SET_LOADSTATE_DEMANDGRAPH:
            return Object.assign({}, state, {
                demandGraph: action.value
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

function lastCondition(state = null, action) {
    switch (action.type) {
        case SET_LAST_CONDITION:
            return action.value;

        default:
            return state;
    }
}

function demandGraph(state = null, action) {
    switch (action.type) {
        case SET_DEMANDGRAPH:
            return action.value;

        default:
            return state;
    }
}

function measuredDataType(state = MEASURED_DATA_TYPE.realTime, action) {
    switch (action.type) {
        case SET_MEASURED_DATA_TYPE:
            return action.value;

        default:
            return state;
    }
}

//デマンドグラフ画面で使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    waitingInfo,
    isLoading,
    lookUp,
    lastCondition,
    demandGraph,
    measuredDataType,
    networkError
});

export default rootReducers;
