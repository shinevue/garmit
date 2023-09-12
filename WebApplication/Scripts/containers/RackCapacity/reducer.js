/**
 * Copyright 2017 DENSO Solutions
 * 
 * RackCapacityPanelのReducerを定義する。
 * ReducerはActionを受信してStateを更新する
 * 
 */
import { combineReducers } from 'redux';

import floorMapCommon from 'FloorMapCommon/reducer.js';
import isLoading from 'LoadState/reducer.js';
import modalState from 'ModalState/reducer.js';

//Reducerをインポート
import { SET_SELECT_LAYOUT } from 'FloorMapCommon/actions.js';
import { SET_LOOKUP,SET_RACKSTATUS_OBJ, SET_EMPGROUP_LIST, SET_SELECT_EMPGROUP, SET_RACKPOWER_INFO, SET_LINK_EGOBJ } from './actions.js';

import { makeMapLayoutObjectData } from 'makeOmitData';

const lookUpInit = { layouts: null, rackStatuses: null, rackTypes: null };
/**
 * lookUpのReducer
 */
function lookUp(state = lookUpInit, action) {
    switch (action.type) {

        case SET_LOOKUP:
            return action.data ? action.data:lookUpInit;

        default:
            return state;
    }
}

/**
 * ラックステータス描画用情報のReducer
 */
function rackStatusObjects(state = null, action) {
    switch (action.type) {

        case SET_RACKSTATUS_OBJ:
            return action.data;

        default:
            return state;
    }
}

/**
 * 空きラックグループ一覧情報のReducer
 */
function emptyRackGroupList(state = [], action) {
    switch (action.type) {

        case SET_EMPGROUP_LIST:
            return action.data ? action.data:[];

        default:
            return state;
    }
}

/**
 * 選択空きラックグループ情報のReducer
 */
function selectEmptyRackGroup(state = null, action) {
    switch (action.type) {

        case SET_SELECT_EMPGROUP:
            return action.data;

        default:
            return state;
    }
}

/**
 * 選択空きラックグループに紐づく分電盤情報テーブル情報のReducer
 */
function rackPowerResult(state = null, action) {
    switch (action.type) {

        case SET_RACKPOWER_INFO:
            return action.data;

        default:
            return state;
    }
}

/**
 * 選択空きラックグループに紐づく分電盤オブジェクト情報のReducer
 */
function egroupObjects(state = null, action) {
    switch (action.type) {

        case SET_SELECT_EMPGROUP:
            return action.data;

        default:
            return state;
    }
}


/**
 * 分電盤オブジェクト描画用情報のReducer
 */
function linkEgroupObjects(state = null, action) {
    switch (action.type) {

        case SET_LINK_EGOBJ:
            return action.data;

        default:
            return state;
    }
}

//FloorMapで使用するReducerを列挙
const capacityInfo = combineReducers({
    emptyRackGroupList,
    selectEmptyRackGroup,
    linkEgroupObjects
});


//FloorMapで使用するReducerを列挙
const rootReducers = combineReducers({
    lookUp,
    floorMapCommon,
    rackStatusObjects,
    rackPowerResult,
    capacityInfo,
    isLoading,
    modalState
});

export default rootReducers;
