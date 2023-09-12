/**
 * @license Copyright 2017 DENSO
 * 
 * 検索条件のReducerを定義する。
 * 
 */
'use strict';

import { combineReducers } from 'redux';
import { LOCATION_CHANGE } from 'react-router-redux';

//Reducerで処理するAction名をインポートする。
import { SET_DISPLAY_STATE, SET_SEARCH_RESULT } from './actions.js';

//Actionの処理を行うReducer

/**
 * データテーブルの表示状態を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function displayState(state = null, action) {
    switch (action.type) {
        case SET_DISPLAY_STATE:
            return action.value;

        default:
            return state;
    }
}

/**
 * 検索結果を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function result(state = null, action) {
    switch (action.type) {
        case SET_SEARCH_RESULT:
            return action.value;

        default:
            return state;
    }
}

//使用するReducerを列挙
const searchResult = combineReducers({
    displayState,
    result
});

export default searchResult;
