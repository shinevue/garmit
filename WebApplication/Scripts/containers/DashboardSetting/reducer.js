/**
 * @license Copyright 2020 DENSO
 * 
 * DashboardEditPanelのReducerを定義する。
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
    SET_DASHBOARDEDITINFO,
    SET_DISPSETTINGS,
    SET_INFORMATIONS,
    SET_NAVIGATIONS,
    SET_OPERATIONLOGSETTING,
    SET_LINKS,
    SET_LOADSTATE, SET_LOADSTATE_CONDITION, SET_LOADSTATE_RESULT
} from "./actions";
import modalState from "../ModalState/reducer";

/**
 * DashboardEditのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function dashboardEditInfo(state = null, action) {
    switch (action.type) {
        case SET_DASHBOARDEDITINFO:
            return action.value;
        case SET_DISPSETTINGS:
            return Object.assign({}, state, { dispSettings: action.value });
        case SET_INFORMATIONS:
            return Object.assign({}, state, { informations: action.value });
        case SET_NAVIGATIONS:
            return Object.assign({}, state, { navigations: action.value });
        case SET_OPERATIONLOGSETTING:
            return Object.assign({}, state, { operationLogSetting: action.value });
        case SET_LINKS:
            return Object.assign({}, state, { links: action.value });
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

//使用するReducerを列挙
const rootReducers = combineReducers({
    dashboardEditInfo,
    modalState,
    authentication,
    isLoading
});

export default rootReducers;
