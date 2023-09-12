/**
 * Copyright 2017 DENSO Solutions
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
import {
    SET_LOOKUP, SET_GRAPHDATAS, SET_TREND_GRAPH_SET, SET_DATERANGE,
    SET_LOADSTATE, SET_LOADSTATE_CONDITION, SET_LOADSTATE_GRAPHDATA, SET_MEASURED_DATA_TYPE
} from './actions.js';

/**
 * トレンドグラフ画面のReducer
 */
function lookUp(state = null, action) {
    switch (action.type) {
        case SET_LOOKUP:
            return action.value;

        default:
            return state;
    }
}

function graphDatas(state = null, action) {
    switch (action.type) {
        case SET_GRAPHDATAS:
            return action.value;

        default:
            return state;
    }
}

function trendGraphSet(state = null, action) {
    switch (action.type) {
        case SET_TREND_GRAPH_SET:
            return action.value;

        default:
            return state;
    }
}

function dateRange(state = {}, action) {
    switch (action.type) {
        case SET_DATERANGE:
            return action.value;

        default:
            return state;
    }
}

export function isLoading(state = { condition: false, graphData: false }, action) {
    switch (action.type) {
        case SET_LOADSTATE:
            return {
                condition: action.value,
                graphData: action.value
            };

        case SET_LOADSTATE_CONDITION:
            return Object.assign({}, state, {
                condition: action.value
            });

        case SET_LOADSTATE_GRAPHDATA:
            return Object.assign({}, state, {
                graphData: action.value
            });

        default:
            return state;
    }
}

export function measuredDataType(state = MEASURED_DATA_TYPE.realTime, action) {
    switch (action.type) {
        case SET_MEASURED_DATA_TYPE:
            return action.value;

        default:
            return state;
    }
}

//Sabdboxで使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    waitingInfo,
    lookUp,
    graphDatas,
    trendGraphSet,
    dateRange,
    isLoading,
    measuredDataType,
    networkError
});

export default rootReducers;
