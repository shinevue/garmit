/**
 * @license Copyright 2017 DENSO
 * 
 * PowerPanelのReducerを定義する。
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
import isLoading from 'LoadState/reducer.js';

//Reducerで処理するAction名をインポートする。
import { SET_EDITMODE, SET_LOOKUP, SET_EGROUPS } from './actions.js';

//Actionの処理を行うReducer

/**
 * 編集モードかどうか
 * @param {any} state
 * @param {any} action
 */
function isEditMode(state = false, action) {
    switch (action.type) {
        case SET_EDITMODE:
            return action.value;

        default:
            return state;
    }
}

/**
 * マスタデータ
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function lookUp(state = null, action) {
    switch( action.type ) {

        case SET_LOOKUP:
            return action.value;

        default:
            return state;
    }
}

/**
 * 電源系統
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function egroups(state = [], action) {
    switch (action.type) {

        case SET_EGROUPS:
            return action.value;

        default:
            return state;
    }
}

//使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    isLoading,
    waitingInfo,
    isEditMode,
    lookUp,
    egroups
});

export default rootReducers;
