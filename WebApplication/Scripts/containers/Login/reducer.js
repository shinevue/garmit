/**
 * Copyright 2017 DENSO Solutions
 * 
 * Reducerを定義する。
 * ReducerはActionを受信してStateを更新する
 * 
 */
import { combineReducers } from 'redux';

//Reducerで処理するAction名をインポートします。
import { LOAD_LOGINRESULT, CHANGE_LOADSTATE } from './actions.js';

//Actionの処理をするReducerです。
//関数名は画面に合わせて変更してください。
function loginInfo(state = {}, action) {
    switch (action.type) {
        case LOAD_LOGINRESULT:
            return action.value;

        default:
            return state;
    }
}

function isLoading(state = false, action) {
    switch (action.type) {
        case CHANGE_LOADSTATE:
            return action.value;

        default:
            return state;
    }
}

//Reducerを列挙
const rootReducers = combineReducers({
    loginInfo,
    isLoading
});

export default rootReducers;
