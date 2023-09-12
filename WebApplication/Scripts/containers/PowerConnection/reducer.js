/**
 * @license Copyright 2017 DENSO
 * 
 * PowerConnectionPanelのReducerを定義する。
 * ReducerはActionを受信してStateを更新する。
 * 
 * 注意点
 * ・引数で渡されたstateやactionそのものを変更してはいけません。
 * 　stateを変更するには、previousState を直接いじるのではなく、新しいオブジェクトを作成して返却します。
 * 
 */
'use strict';

import { combineReducers } from 'redux';
import modalState from 'ModalState/reducer.js';
import isLoading from 'LoadState/reducer.js';
import networkError from 'NetworkError/reducer.js';

//Reducerで処理するAction名をインポートする。
import { SET_EGROUP_LIST      } from './actions.js';
import { SET_SELECT_EGROUP    } from './actions.js';
import { SET_VALUE_LAVEL_DATA } from './actions.js';
import { SET_RIGHT_BREAKER    } from './actions.js';
import { SET_LEFT_BREAKER     } from './actions.js';

//Reducerの初期値を設定する。
const initialState = {
};

//Actionの処理を行うReducer

/**
 * egroupListのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function egroupList(state=null, action) {
    switch( action.type ) {

        case SET_EGROUP_LIST:
            return action.value;

        default:
            return state;
    }
}

/**
 * selectedEgroupのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function selectedEgroup(state = null, action) {
    switch (action.type) {

        case SET_SELECT_EGROUP:
            if (action.value) {
                return Object.assign({}, state, action.value);
            }
            else {
                return null;
            }

        default:
            return state;
    }
}

/**
 * rightBreakerのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function rightBreaker(state = null, action) {
    switch (action.type) {

        case SET_RIGHT_BREAKER:
            return action.value;

        case SET_SELECT_EGROUP:
            return null;

        default:
            return state;
    }
}

/**
 * leftBreakerのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function leftBreaker(state = null, action) {
    switch (action.type) {

        case SET_LEFT_BREAKER:
            return action.value;

        case SET_SELECT_EGROUP:
            return null;

        default:
            return state;
    }
}

/**
 * valueLabelDataのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function valueLabelData(state = null, action) {
    switch (action.type) {

        case SET_VALUE_LAVEL_DATA:
            return Object.assign([], state, action.value);

        case SET_SELECT_EGROUP:
            return null;

        default:
            return state;
    }
}

//使用するReducerを列挙
const rootReducers = combineReducers({
    egroupList,
    selectedEgroup,
    rightBreaker,
    leftBreaker,
    valueLabelData,
    modalState,
    isLoading,
    networkError
});

export default rootReducers;
