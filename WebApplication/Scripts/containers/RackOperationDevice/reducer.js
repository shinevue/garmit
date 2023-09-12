/**
 * @license Copyright 2021 DENSO
 * 
 * Reducerを定義する。
 * ReducerはActionを受信してStateを更新する。
 * 
 * 注意点
 * ・引数で渡されたstateやactionそのものを変更してはいけません。
 * 　stateを変更するには、previousState を直接いじるのではなく、新しいオブジェクトを作成して返却します。
 * 
 */
'use strict';

import { combineReducers } from 'redux';
import { routerReducer, LOCATION_CHANGE } from 'react-router-redux';

import searchResult from 'SearchResult/reducer.js';
import authentication from 'Authentication/reducer.js';
import waitingInfo from 'WaitState/reducer.js';
import isLoading from 'LoadState/reducer';
import modalState from 'ModalState/reducer';

//Reducerで処理するAction名をインポートする。
import { SET_EDIT, CHANGE_EDIT_IC_TERMINAL, CLEAR_EDIT } from './actions.js';
import { SET_DELETE_TERM_NOS, SET_LOCATIONS } from './actions.js';
import { START_UPDATE, END_UPDATE } from './actions.js';

import { getChnagedICTerminal } from 'icTerminalUtility';

//Reducerの初期値を設定する。
const initialState = {
    locations: [],
    editICTerminal: null,
    invalid: false,
    deleteTermNos: [],
    updating: false
};

//#region Actionの処理を行うReducer（編集）

/**
 * locationsのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
 function locations (state=initialState.locations, action) {
    switch( action.type ) {
        case SET_LOCATIONS:
            return action.locations && _.cloneDeep(action.locations);

        case CLEAR_EDIT:
            return [];

        default:
            return state;
    }
}

/**
 * editICTerminalのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function editICTerminal(state=initialState.editICTerminal, action) {
    switch( action.type ) {
        case SET_EDIT:
            return action.value && _.cloneDeep(action.value);

        case CHANGE_EDIT_IC_TERMINAL:
            return getChnagedICTerminal(state, action.key, action.value);

        case CLEAR_EDIT:
        return initialState.editICTerminal;

        default:
            return state;
    }
}

/**
 * invalidのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function invalid (state=initialState.invalid, action) {
    switch( action.type ) {
        case SET_EDIT:
            if (action.isRegister) {
                return true;
            } else {
                return false;
            }

        case CHANGE_EDIT_IC_TERMINAL:
            return action.isError;

        case CLEAR_EDIT:
            return initialState.invalid;

        default:
            return state;
    }
    
}

//#endregion

//#region Actionの処理を行うReducer（一覧）

/**
 * deleteTermNosのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
 function deleteTermNos (state=initialState.deleteTermNos, action) {
    switch( action.type ) {

        case SET_DELETE_TERM_NOS:
            return action.termNos ? _.cloneDeep(action.termNos) : [];

        default:
            return state;
    }
    
}

/**
 * 更新中かどうかのReducer
 */
 function updating(state = initialState.updating, action) {
    switch (action.type) {

        case START_UPDATE:
            return true;

        case END_UPDATE:
            return false;

        default:
            return state;
    }
}

//#endregion


//使用するReducerを列挙
const rootReducers = combineReducers({
    routing: routerReducer,
    authentication,
    waitingInfo,
    isLoading,
    modalState,
    searchResult,           //ラック施開錠端末一覧
    locations,              //ロケーションツリー
    editICTerminal,         //編集中のラック施開錠端末
    invalid,                //保存が無効かどうか
    deleteTermNos,          //削除する端末番号一覧
    updating                //ラック施開錠端末一覧が更新中かどうか   
});

export default rootReducers;
