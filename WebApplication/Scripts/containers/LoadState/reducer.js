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

//Reducerで処理するAction名をインポートする。
import { CHANGE_LOAD_STATE } from './actions.js';

/********************************************
 * Actionの処理を行うReducer
 ********************************************/

/**
 * ロード状態を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function isLoading(state=false, action) {
    switch( action.type ) {
        case CHANGE_LOAD_STATE:
            return !state;

        default:
            return state;
    }
}

export default isLoading;
