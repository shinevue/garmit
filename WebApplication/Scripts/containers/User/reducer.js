/**
 * @license Copyright 2017 DENSO
 * 
 * ユーザー画面Reducerを定義する。
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
import { SET_LOADSTATE, SET_LOADSTATE_CONDITION, SET_LOADSTATE_RESULT, SET_LOGINUSERS, SET_EDITED_USERS, SET_SYSTEMSET } from './actions.js';

/**
 * ユーザー画面のReducer
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

function loginUsers(state = null, action) {
    switch (action.type) {
        case SET_LOGINUSERS:
            return action.value;

        default:
            return state;
    }
}

function editedUsers(state = null, action) {
    switch (action.type) {
        case SET_EDITED_USERS:
            return action.value;

        default:
            return state;
    }
}

function systemSet(state = null, action) {
    switch (action.type) {
        case SET_SYSTEMSET:
            return action.value;

        default:
            return state;
    }
}


//ユーザー一覧画面で使用するReducerを列挙
const rootReducers = combineReducers({
    routing: routerReducer,
    authentication,
    searchCondition,
    searchResult,
    waitingInfo,
    isLoading,
    loginUsers,
    editedUsers,
    systemSet
});

export default rootReducers;

