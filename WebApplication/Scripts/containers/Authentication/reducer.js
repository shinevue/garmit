/**
 * @license Copyright 2017 DENSO
 * 
 * 認証情報（authentication）のReducerを定義する。
 * ReducerはActionを受信してStateを更新する。
 * 
 * 注意点
 * ・引数で渡されたstateやactionそのものを変更してはいけません。
 * 　stateを変更するには、previousState を直接いじるのではなく、新しいオブジェクトを作成して返却します。
 * 
 */
'use strict';

import { combineReducers } from 'redux';
import { ALLOW_TYPE_NO } from 'authentication';

//Reducerで処理するAction名をインポートする。
import { SET_AUTH } from './actions.js';

//Reducerの初期値を設定する。
const initialState = {
    isReadOnly: true,
    level: 0,
    loadAuthentication: false
};

/********************************************
 * Actionの処理を行うReducer
 ********************************************/

/**
 * isReadOnly(読み取り専用かどうか)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function isReadOnly(state=initialState.isReadOnly, action) {
    switch( action.type ) {
        case SET_AUTH:
            return action.value ? (action.value.function.allowTypeNo === ALLOW_TYPE_NO.readOnly) : true;

        default:
            return state;
    }
}

/**
 * lavel(権限レベル)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function level(state=initialState.level, action) {
    switch( action.type ) {
        case SET_AUTH:
            return action.value&&action.value.level ? action.value.level : initialState.level;

        default:
            return state;
    }
}

/**
 * loadAuthentication(権限が読み込まれたか)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function loadAuthentication(state=initialState.level, action) {
    switch( action.type ) {
        case SET_AUTH:
            return true;

        default:
            return state;
    }
}

//使用するReducerを列挙
const authentication = combineReducers({
    isReadOnly,
    level,
    loadAuthentication
});

export default authentication;
