/**
 * @license Copyright 2018 DENSO
 * 
 * MainSidebarPanelのReducerを定義する。
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
import { SET_MENU_INFO } from './actions.js';

//Reducerの初期値を設定する。
const initialState = {
    loginUser : {
        userId: '',
        userName: ''
    },
    menus: []
};

/********************************************
 * Actionの処理を行うReducer
 ********************************************/

/**
 * menuInfoを更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function menuInfo(state=initialState, action) {
    switch( action.type ) {

        case SET_MENU_INFO:
            return action.value ? Object.assign({}, state, action.value ) : Object.assign({}, initialState);

        default:
            return state;
    }
}

//使用するReducerを列挙
const rootReducers = combineReducers({
    menuInfo
});

export default rootReducers;
