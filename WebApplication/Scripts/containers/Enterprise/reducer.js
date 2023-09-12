/**
 * Copyright 2017 DENSO Solutions
 * 
 * Reducerを定義する。
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
import { SET_LOADSTATE, SET_LOGIN_USER, SET_ENTERPRISES, SET_EDITED_ENTERPRISES, SET_LOADSTATE_CONDITION, SET_LOADSTATE_RESULT } from './actions.js';

/**
 * 所属一覧画面のReducer
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

function loginUser(state = null, action) {
    switch (action.type) {
        case SET_LOGIN_USER:
            return action.value;

        default:
            return state;
    }
}

function enterprises(state = null, action) {
    switch (action.type) {
        case SET_ENTERPRISES:
            return action.value;

        default:
            return state;
    }
}

function editedEnterprises(state = null, action) {
    switch (action.type) {
        case SET_EDITED_ENTERPRISES:
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
    enterprises,
    editedEnterprises,
    loginUser
});

export default rootReducers;