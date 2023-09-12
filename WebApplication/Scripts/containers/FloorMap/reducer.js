/**
 * Copyright 2017 DENSO Solutions
 * 
 * FloorMapPanelのReducerを定義する。
 * ReducerはActionを受信してStateを更新する
 * 
 */
import { combineReducers } from 'redux';

import floorMapCommon from 'FloorMapCommon/reducer.js';
import isLoading from 'LoadState/reducer.js';
import modalState from 'ModalState/reducer.js';
import authentication from 'Authentication/reducer.js';
import networkError from 'NetworkError/reducer.js';

//Reducerをインポート
import { SET_LOOKUP } from './actions.js';
import { SET_INCIDENT } from './actions.js';
import { SET_RACK_VIEW } from './actions.js';
import { SET_TEMPMAP_PATH } from './actions.js';
import { START_UPDATE, END_UPDATE } from './actions.js';
import { SET_DISABLED_RACK_FUNCTION } from './actions.js';

const lookUpInit = { layouts: null };

/**
 * lookUpのReducer
 */
function lookUp(state = lookUpInit, action) {

    switch (action.type) {
        case SET_LOOKUP:
            return (action.data || lookUpInit);

        default:
            return state;
    }
}

/**
 * インシデントログ情報のReducer
 */
function incidentInfo(state = [], action) {

    switch (action.type) {
        case SET_INCIDENT:
            return action.data;

        default:
            return state;
    }
}

/**
 * 温度分布図描画用情報のReducer
 */
function tempmapImagePath(state = null, action) {
    switch (action.type) {

        case SET_TEMPMAP_PATH:
            return action.data;

        default:
            return state;
    }
}

/**
 * 選択中ラック情報のReducer
 */
function rackView(state = null, action) {

    switch (action.type) {

        case SET_RACK_VIEW:
            return action.data;

        default:
            return state;
    }
}

/**
 * 更新中かどうかのReducer
 */
function updating(state = false, action) {
    switch (action.type) {

        case START_UPDATE:
            return true;

        case END_UPDATE:
            return false;

        default:
            return state;
    }
}

/**
 * ラック画面が利用不可かどうかのReducer（利用不可であればtrue）
 */
function disabledRackFunc(state=true, action) {
    switch (action.type) {

        case SET_DISABLED_RACK_FUNCTION:
            return action.disabled;

        default:
            return state;
    }
    
}

//FloorMapで使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    lookUp,
    floorMapCommon,
    incidentInfo,
    tempmapImagePath,
    updating,
    rackView,
    disabledRackFunc,
    isLoading,
    modalState,
    networkError
});

export default rootReducers;
