/**
 * @license Copyright 2017 DENSO
 * 
 * Reducerを定義する。
 * ReducerはActionを受信してStateを更新する
 * 
 */
'use strict';

import { combineReducers } from 'redux';
import { routerReducer, LOCATION_CHANGE } from 'react-router-redux';

import authentication from 'Authentication/reducer.js';
import waitingInfo from 'WaitState/reducer.js';
import isLoading from 'LoadState/reducer.js';

//メニュー用のReducerをインポート
import { SET_UNIT_IMAGES, SET_UNIT_TYPES, SET_EDITED_UNIT_IMAGE } from './actions.js';

/**
 * ユニット画像メンテナンス画面のReducer
 */
function unitImages(state = null, action) {
    switch (action.type) {
        case SET_UNIT_IMAGES:
            return action.value;

        default:
            return state;
    }
}

function unitTypes(state = null, action) {
    switch (action.type) {
        case SET_UNIT_TYPES:
            return action.value;

        default:
            return state;
    }
}

function editedUnitImage(state = null, action) {
    switch (action.type) {
        case SET_EDITED_UNIT_IMAGE:
            return action.value;

        default:
            return state;
    }
}

//Sabdboxで使用するReducerを列挙
const rootReducers = combineReducers({
    routing: routerReducer,
    authentication,
    isLoading,
    waitingInfo,
    unitImages,
    unitTypes,
    editedUnitImage
});

export default rootReducers;
