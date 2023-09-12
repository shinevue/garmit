/**
 * Copyright 2019 DENSO
 * 
 * Reducerを定義する。
 * ReducerはActionを受信してStateを更新する
 * 
 */
import { combineReducers } from 'redux';

import authentication from 'Authentication/reducer.js';

//メニュー用のReducerをインポート
import {
    SET_DATERANGE, SET_LOADSTATE, SET_LOADSTATE_CONDITION, SET_LOADSTATE_RESULT, SET_LOADSTATE_DEMANDGRAPH, SET_LOOKUP, SET_LAST_CONDITON, SET_DEMAND_SUMMARY_RESULT, SET_DEMANDGRAPH, SET_LAST_GRAPH_CONDITION
} from './actions.js';

/**
 * デマンドサマリ画面のReducer
 */
export function isLoading(state = { condition: false, result: false, demandGraph: false }, action) {
    switch (action.type) {
        case SET_LOADSTATE:
            return {
                condition: action.value,
                graphData: action.value,
                demandGraph: action.value
            };

        case SET_LOADSTATE_CONDITION:
            return Object.assign({}, state, {
                condition: action.value
            });

        case SET_LOADSTATE_RESULT:
            return Object.assign({}, state, {
                result: action.value
            });

        case SET_LOADSTATE_DEMANDGRAPH:
            return Object.assign({}, state, {
                demandGraph: action.value
            });

        default:
            return state;
    }
}

export function lookUp(state = null, action) {
    switch (action.type) {
        case SET_LOOKUP:
            return action.value;

        default:
            return state;
    }
}

export function lastCondition(state = null, action) {
    switch (action.type) {
        case SET_LAST_CONDITON:
            return action.value;

        default:
            return state;
    }
}

export function demandSummaryResult(state = null, action) {
    switch (action.type) {
        case SET_DEMAND_SUMMARY_RESULT:
            return action.value;

        default:
            return state;
    }
}

export function demandGraph(state = null, action) {
    switch (action.type) {
        case SET_DEMANDGRAPH:
            return action.value;

        default:
            return state;
    }
}

export function lastGraphCondition(state = null, action) {
    switch (action.type) {
        case SET_LAST_GRAPH_CONDITION:
            return action.value;

        default:
            return state;
    }
}

//デマンドグラフ画面で使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    isLoading,
    lookUp,
    lastCondition,
    demandSummaryResult,
    demandGraph,
    lastGraphCondition
});

export default rootReducers;
