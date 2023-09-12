/**
 * @license Copyright 2023 DENSO
 * 
 * XxxPanelのReducerを定義する。
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

//Reducerで処理するAction名をインポートする。
//TODO：下記はサンプルのため、ただしいAction名に修正してください。
import { INITIAL_PANELINFO } from './actions.js';

//Reducerの初期値を設定する。
const initialState = {
};

//Actionの処理を行うReducer
//TODO：関数名は画面に合わせて変更してください。

/**
 * XxxのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function xxxReducer(state=initialState, action) {
    switch( action.type ) {

        case INITIAL_PANELINFO:
            return  Object.assign({}, state, action.value );

        default:
            return state;
    }
}

//使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    xxxReducer  //TODO reducer関数と同じ名前にしてください。ドメインオブジェクト等に合わせると良いと思います。
});

export default rootReducers;
