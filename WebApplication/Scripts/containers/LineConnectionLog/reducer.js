/**
 * @license Copyright 2018 DENSO
 * 
 * LineConnectionLogPanelのReducerを定義する。
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
import waitingInfo from 'WaitState/reducer.js';

import { SET_LOOKUP, SET_CONDITION_LIST, SET_LINECONNECTIONLOG_RESULT, SET_LINECONNECTIONLOG_DISPLAY_STATE, SET_LOADSTATE, SET_LOADSTATE_CONDITION, SET_LOADSTATE_RESULT, SET_LOADSTATE_CONDITION_LIST } from './actions.js';

//Reducerの初期値を設定する。
const initialState = null;

//Actionの処理を行うReducer

/**
 * lookUp
 */
function lookUp(state = null, action) {
    switch (action.type) {
        case SET_LOOKUP:
            return action.value;

        default:
            return state;
    }
}

/**
 * 登録済み検索条件一覧（検索条件保存機能で保存済みの検索条件一覧）
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
 function conditionList(state = [], action) {
    switch (action.type) {
        case SET_CONDITION_LIST:
            return action.value && Object.assign([], action.value);
    
        default:
            return state;
    }
}

/**
 * LineConnectionLogのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function lineConnectionLogResult(state=initialState, action) {
    switch( action.type ) {
        case SET_LINECONNECTIONLOG_RESULT:
            return action.value;
        default:
            return state;
    }
}

/**
 * データテーブルの表示状態を更新する（昇順/降順等）
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
 function displayState(state = null, action) {
    switch (action.type) {
        case SET_LINECONNECTIONLOG_DISPLAY_STATE:
            return action.value;

        default:
            return state;
    }
}

/**
 * ロード中かどうか
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function isLoading(state = { condition: false, result: false, conditionList: false }, action) {
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

        case SET_LOADSTATE_CONDITION_LIST:
            return Object.assign({}, state, {
                conditionList: action.value
            });

        default:
            return state;
    }
}


//使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    waitingInfo,
    lookUp,
    conditionList,
    lineConnectionLogResult,
    displayState,
    isLoading
});

export default rootReducers;
