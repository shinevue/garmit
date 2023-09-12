/**
 * Copyright 2019 DENSO
 * 
 * デマンド設定画面のReducerを定義する。
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
import { SET_LOADSTATE, SET_LOADSTATE_CONDITION, SET_LOADSTATE_RESULT, SET_EDITED_DEMANDSETS } from './actions.js';

/**
 * デマンド設定画面のReducer
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

function editedDemandSets(state = null, action) {
    switch (action.type) {
        case SET_EDITED_DEMANDSETS:
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
    editedDemandSets
});

export default rootReducers;
