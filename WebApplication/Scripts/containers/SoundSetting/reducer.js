/**
 * @license Copyright 2017 DENSO
 * 
 * Reducerを定義する。
 * ReducerはActionを受信してStateを更新する
 * 
 */
'use strict';

import { combineReducers } from 'redux';

import authentication from 'Authentication/reducer.js';
import waitingInfo from 'WaitState/reducer.js';
import isLoading from 'LoadState/reducer.js';

//メニュー用のReducerをインポート
import { SET_SYSTEM_SET, SET_DATA_TYPES, SET_SOUND_DIRECTORY, SET_SOUND_FILE_LIST } from './actions.js';

/**
 * サウンド設定画面のReducer
 */
function systemSet(state = null, action) {
    switch (action.type) {
        case SET_SYSTEM_SET:
            return action.value;

        default:
            return state;
    }
}

function dataTypes(state = null, action) {
    switch (action.type) {
        case SET_DATA_TYPES:
            return action.value;

        default:
            return state;
    }
}

function soundDirectory(state = null, action) {
    switch (action.type) {
        case SET_SOUND_DIRECTORY:
            return action.value;

        default:
            return state;
    }
}

function soundFileList(state = [], action) {
    switch (action.type) {
        case SET_SOUND_FILE_LIST:
            return action.value;

        default:
            return state;
    }
}


//Sabdboxで使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    isLoading,
    waitingInfo,
    systemSet,
    dataTypes,
    soundDirectory,
    soundFileList
});

export default rootReducers;