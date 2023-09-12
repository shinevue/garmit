/**
 * @license Copyright 2019 DENSO
 * 
 * ControlLogPanelのReducerを定義する。
 * ReducerはActionを受信してStateを更新する。
 * 
 * 注意点
 * ・引数で渡されたstateやactionそのものを変更してはいけません。
 * 　stateを変更するには、previousState を直接いじるのではなく、新しいオブジェクトを作成して返却します。
 * 
 */
'use strict';

import { combineReducers } from 'redux';

import searchCondition from 'SearchCondition/reducer.js';
import searchResult from 'SearchResult/reducer.js';

import authentication from 'Authentication/reducer.js';
import isLoading from 'LoadState/reducer';
import modalState from 'ModalState/reducer';

//Reducerで処理するAction名をインポート
import { SET_MASTER_DATA, SET_EDIT_DATE, SET_EDIT_CONTROLTYPE_CONDITION, SET_SPECIFIC_CONDITION, CLEAR_EDIT_SPECIFIC_CONDITION, SET_INVAILD_SEARCH } from './actions.js';

//Reducerの初期値を設定
const initialState = {
    controlTypes: {},
    specificCondition: {
        startDate: null,
        endDate: null,
        controlTypes: null
    },
    editSpecificCondition: {
        startDate: null,
        endDate: null,
        controlTypes: null
    },
    invaildSearch: false
};

//Actionの処理を行うReducer


/**
 * controlTypesのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function controlTypes(state=initialState.controlTypes, action) {
    switch( action.type ) {
        case SET_MASTER_DATA:
            return action.controlTypes ? _.cloneDeep(action.controlTypes) : [];
        default:
            return state;

    }
}

/**
 * specificConditionのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function specificCondition(state=initialState.specificCondition, action) {
    switch( action.type ) {

        case SET_SPECIFIC_CONDITION:
            return action.condition && Object.assign({}, state, action.condition );

        default:
            return state;
    }
}

/**
 * specificConditionのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function editSpecificCondition(state=initialState.editSpecificCondition, action) {
    switch( action.type ) {

        case SET_EDIT_DATE:
            return Object.assign({}, state, { startDate: action.startDate, endDate: action.endDate } );

        case SET_EDIT_CONTROLTYPE_CONDITION:
            return Object.assign({}, state, { controlTypes: action.controlTypes });

        case CLEAR_EDIT_SPECIFIC_CONDITION:
            const nowTime = moment().second(0).millisecond(0);
            return  Object.assign({}, state, { 
                controlTypes: action.controlTypes ? _.cloneDeep(action.controlTypes) : state.controlTypes,
                startDate: nowTime,
                endDate: moment(nowTime).add(1, 'h')
            });

        default:
            return state;
    }
}


/**
 * 検索が無効かどうかのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function invaildSearch(state=initialState.invaildSearch, action) {
    switch( action.type ) {

        case SET_INVAILD_SEARCH:
            return action.invaild;

        case CLEAR_EDIT_SPECIFIC_CONDITION:
            return false;

        default:
            return state;
    }
}

//使用するReducerを列挙
const rootReducers = combineReducers({
    controlTypes,
    searchCondition,
    specificCondition,
    editSpecificCondition,
    searchResult,
    invaildSearch,
    authentication,
    isLoading,
    modalState
});

export default rootReducers;
