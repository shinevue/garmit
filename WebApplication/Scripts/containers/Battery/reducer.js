/**
 * @license Copyright 2019 DENSO
 * 
 * BatteryPanelのReducerを定義する。
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
import waitingInfo from 'WaitState/reducer.js';
import isLoading from 'LoadState/reducer';
import modalState from 'ModalState/reducer';
import networkError from 'NetworkError/reducer.js';

//Reducerで処理するAction名をインポートする。
import { SET_DATATYPES, SET_DATAGETE_LIST, SET_SELECTED_BATTERY_DATA } from './actions.js';
import { SET_OUTPUT_RESULT } from './actions.js';
import { START_UPDATE, END_UPDATE } from './actions.js';

//Reducerの初期値を設定する。
const initialState = {
    dataTypes: [],
    datagateList: null,
    selectedBatteryData: null,
    allDatagateResult: null,
    datagateResult: null
};

/**
 * データ種別一覧ののReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function dataTypes(state=initialState.dataTypes, action) {
    switch( action.type ) {

        case SET_DATATYPES:
            return action.data;

        default:
            return state;
    }
}

/**
 * バッテリ一覧ののReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function datagateList(state=initialState.datagateList, action) {
    switch( action.type ) {

        case SET_DATAGETE_LIST:
            return action.data;

        default:
            return state;
    }
}

/**
 * 選択中のバッテリー計測値情報のReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function selectedBatteryData(state=initialState.selectedBatteryData, action) {
    switch( action.type ) {

        case SET_SELECTED_BATTERY_DATA:
            return action.data;

        default:
            return state;
    }
}

/**
 * CSV出力情報のReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function outputResult(state=initialState.datagateResult, action) {
    switch( action.type ) {

        case SET_OUTPUT_RESULT:
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

//使用するReducerを列挙
const rootReducers = combineReducers({
    dataTypes,
    datagateList,
    selectedBatteryData,
    outputResult,
    modalState,
    updating,
    isLoading,
    waitingInfo,
    authentication,
    networkError
});

export default rootReducers;
