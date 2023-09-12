/**
 * @license Copyright 2019 DENSO
 * 
 * NetworkError(通信エラー)のReducerを定義する。
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
import { CHANGE_NETWORK_ERROR } from './actions.js';

//Reducerの初期値を設定する。
const initialState = {
    isNetworkError: false
};

//Actionの処理を行うReducer

/**
 * isNetworkErrorのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function isNetworkError(state=initialState.isNetworkError, action) {
    switch( action.type ) {

        case CHANGE_NETWORK_ERROR:
            return action.isError;

        default:
            return state;
    }
}

//使用するReducerを列挙
const rootReducers = combineReducers({
    isNetworkError
});

export default rootReducers;
