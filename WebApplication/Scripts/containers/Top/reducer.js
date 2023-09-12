/**
 * @license Copyright 2020 DENSO
 *
 * TopPanelのReducerを定義する。
 * ReducerはActionを受信してStateを更新する。
 *
 * 注意点
 * ・引数で渡されたstateやactionそのものを変更してはいけません。
 * 　stateを変更するには、previousState を直接いじるのではなく、新しいオブジェクトを作成して返却します。
 *
 */
'use strict';

import { combineReducers } from 'redux';

import authentication from 'Authentication/reducer.js';

import {
    SET_DASHBOARDINFO,
    SET_INFORMATIONS,
    SET_SCHEDULES,
    SET_INCIDENTLOG,
    SET_OPERATIONLOG,
}  from "./actions";

/**
 * TopPanelのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function dashboardInfo(state = null, action) {
    switch (action.type) {
        case SET_DASHBOARDINFO:
            return action.value;
        case SET_INFORMATIONS:
            return Object.assign({}, state, { informations: action.value });
        case SET_SCHEDULES:
            return Object.assign({}, state, { schedules: action.value });
        case SET_INCIDENTLOG:
            return Object.assign({}, state, { incidentLog: action.value });
        case SET_OPERATIONLOG:
            return Object.assign({}, state, { operationLog: action.value });
        default:
            return state;
    }
}

//使用するReducerを列挙
const rootReducers = combineReducers({
    dashboardInfo
});

export default rootReducers;
