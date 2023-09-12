/**
 * @license Copyright 2020 DENSO
 * 
 * ELockOpLogPanelのReducerを定義する。
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

import { SET_LOOKUP, SET_ICCARD_TYPE, SET_LOGIN_USER, SET_ELOCKOPLOG_RESULT, SET_LOADSTATE, SET_LOADSTATE_CONDITION, SET_LOADSTATE_RESULT, SET_IS_CARD_OPERATION } from './actions.js';
import {SET_SEARCH_CONDITION} from "../DataReport/actions";
import { ICCARD_TYPE } from 'constant';

//Reducerの初期値を設定する。
const initialState = null;

//Actionの処理を行うReducer
/**
 * オペレーションログ画面のReducer
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
 * ELockOpLogのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function eLockOpLogResult(state=initialState, action) {
    switch( action.type ) {
        case SET_ELOCKOPLOG_RESULT:
            return action.value;
        default:
            return state;
    }
}

/**
 * loginUserのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function loginUser(state=null, action) {
    switch( action.type ) {

        case SET_LOGIN_USER:
            return action.value;

        default:
            return state;
    }
}

/**
 * icCardTypeのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function icCardType(state=ICCARD_TYPE.FELICA, action) {
    switch( action.type ) {
        
        case SET_ICCARD_TYPE:
            return  action.icCardType;

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

/**
 * 検索条件を取得
 */
function searchCondition(state = null, action) {
    switch (action.type) {
        case SET_SEARCH_CONDITION:
            return action.value;

        default:
            return state;
    }
}

/**
 * isCardOperationのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function isCardOperation(state = false, action) {
    switch (action.type) {
        case SET_IS_CARD_OPERATION:
            return action.value;

        default:
            return state;
    }
}

//使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    icCardType,
    loginUser,
    lookUp,
    isLoading,
    searchCondition,
    eLockOpLogResult,
    isCardOperation
});

export default rootReducers;
