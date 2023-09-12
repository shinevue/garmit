/**
 * Copyright 2017 DENSO Solutions
 * 
 * ポイント画面のReducerを定義する。
 * ReducerはActionを受信してStateを更新する
 * 
 */
import { combineReducers } from 'redux';
import { routerReducer, LOCATION_CHANGE } from 'react-router-redux';

import authentication from 'Authentication/reducer.js';
import searchCondition from 'SearchCondition/reducer.js';
import searchResult from 'SearchResult/reducer.js';
import waitingInfo from 'WaitState/reducer.js';


//メニュー用のReducerをインポート
import { SET_LOADSTATE, SET_LOADSTATE_CONDITION, SET_LOADSTATE_RESULT, SET_POINTS, SET_EDITED_POINTS, SET_MAINTENANCE_SCHEDULES } from './actions.js';

/**
 * ポイント画面のReducer
 */
function isLoading(state = { condition: false, result: false }, action) {
    switch (action.type) {
        case SET_LOADSTATE:
            return {
                condition: action.value,
                result: action.value
            };

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

function points(state = null, action) {
    switch (action.type) {
        case SET_POINTS:
            return action.value;

        default:
            return state;
    }
}

function editedPoints(state = null, action) {
    switch (action.type) {
        case SET_EDITED_POINTS:
            return action.value;

        default:
            return state;
    }
}

function maintenanceSchedules(state = null, action) {
    switch (action.type) {
        case SET_MAINTENANCE_SCHEDULES:
            return action.value;

        default:
            return state;
    }
}

//Sabdboxで使用するReducerを列挙
const rootReducers = combineReducers({
    routing: routerReducer,
    authentication,
    searchCondition,
    searchResult,
    isLoading,
    waitingInfo,
    points,
    editedPoints,
    maintenanceSchedules
});

export default rootReducers;
