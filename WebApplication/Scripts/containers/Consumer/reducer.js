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
import { SET_LOADSTATE, SET_LOADSTATE_CONDITION, SET_LOADSTATE_RESULT, SET_EDITED_CONSUMERS } from './actions.js';

import { convertDateTimeExtendedData } from 'assetUtility';

/**
 * コンシューマー画面のReducer
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

function editedConsumers(state = null, action) {
    switch (action.type) {
        case SET_EDITED_CONSUMERS:
            if (!action.value) {
                return action.value;
            }
            const consumers = action.value;
            return consumers.map((c) => {
                const consumer = Object.assign({}, c);
                consumer.consumerExtendedPages = convertDateTimeExtendedData(consumer.consumerExtendedPages);
                return consumer;
            });

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
    editedConsumers
});

export default rootReducers;

