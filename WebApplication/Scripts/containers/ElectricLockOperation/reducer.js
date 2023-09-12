/**
 * @license Copyright 2019 DENSO
 * 
 * Reducerを定義する。
 * ReducerはActionを受信してStateを更新する
 * 
 */
'use strict';

import { combineReducers } from 'redux';
import { routerReducer, LOCATION_CHANGE } from 'react-router-redux';

import authentication from 'Authentication/reducer.js';
import searchCondition from 'SearchCondition/reducer.js';
import searchResult from 'SearchResult/reducer.js';
import waitingInfo from 'WaitState/reducer.js';
import unlockPurposeInfo from 'UnlockPurpose/reducer.js';

import { SET_LOADSTATE, SET_LOADSTATE_CONDITION, SET_LOADSTATE_RESULT } from './actions.js';
import { SET_EMPTY_EXTENDED_PAGES, SET_EXTENDED_PAGES, SET_INITAIL_OPEN_MEMO } from './actions.js';

/**
 * ロード中のReducer
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

/**
 * 施解錠詳細項目情報（マスタ）のReducer
 */
function emptyELockOpLogExtendedPages (state = [], action) {
    switch (action.type) {
        case SET_EMPTY_EXTENDED_PAGES:
            return action.data ? _.cloneDeep(action.data) : [];
        default:
            return state;
    }
}

/**
 * 選択中の電気錠リストのReducer
 */
function eLockOpLogExtendedPages(state = [], action) {
    switch (action.type) {
        case SET_EXTENDED_PAGES:
            return action.data ? _.cloneDeep(action.data) : []; 

        default:
            return state;
    }
}


/**
 * 初期表示時の開錠メモ
 */
function initialOpenMemo(state = "", action) {
    switch (action.type) {
        case SET_INITAIL_OPEN_MEMO:
            return action.data;

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
    waitingInfo,
    isLoading,
    unlockPurposeInfo,
    emptyELockOpLogExtendedPages,
    eLockOpLogExtendedPages,
    initialOpenMemo
});

export default rootReducers;
