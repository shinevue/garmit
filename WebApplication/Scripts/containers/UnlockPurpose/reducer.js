/**
 * @license Copyright 2019 DENSO
 * 
 * UnlockPurposeのReducerを定義する。
 * ReducerはActionを受信してStateを更新する。
 * 
 * 注意点
 * ・引数で渡されたstateやactionそのものを変更してはいけません。
 * 　stateを変更するには、previousState を直接いじるのではなく、新しいオブジェクトを作成して返却します。
 * 
 */
'use strict';

import { combineReducers } from 'redux';

//Reducerで処理するAction名をインポート
import { SET_UNLOCK_PURPOSE_LIST, SET_SELECTED_UNLCOKPURPOSE, CLEAR_SELECTED_UNLCOKPURPOSE } from './actions.js';

/**
 * 開錠目的リスト
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function unlockPurposes(state=[], action) {
    switch( action.type ) {

        case SET_UNLOCK_PURPOSE_LIST:
            return action.data ? _.cloneDeep(action.data) : [];

        default:
            return state;
    }
}


/**
 * 選択中の開錠目的
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function selectedUnlockPurpose(state=null, action) {
    switch( action.type ) {

        case SET_SELECTED_UNLCOKPURPOSE:
            return action.data ? _.cloneDeep(action.data) : null;

        case CLEAR_SELECTED_UNLCOKPURPOSE:
            return null;

        default:
            return state;
    }
}

/**
 * 選択中の開錠目的
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
 function isError(state=false, action) {
    switch( action.type ) {

        case SET_SELECTED_UNLCOKPURPOSE:
            return action.data ? false : true;

        case CLEAR_SELECTED_UNLCOKPURPOSE:
            return true;

        default:
            return state;
    }
}

//使用するReducerを列挙
const rootReducers = combineReducers({
    unlockPurposes,
    selectedUnlockPurpose,
    isError
});

export default rootReducers;
