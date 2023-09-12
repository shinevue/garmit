/**
 * @license Copyright 2021 DENSO
 * 
 * CardReadLogPanelのReducerを定義する。
 * 
 */
'use strict';

import { combineReducers } from 'redux';

import searchCondition from 'SearchCondition/reducer.js';
import searchResult from 'SearchResult/reducer.js';

import authentication from 'Authentication/reducer.js';
import isLoading from 'LoadState/reducer';
import modalState from 'ModalState/reducer';

//Reducerで処理するAction名をインポートする。
import { SET_EDIT_DATE_CONDITION, SET_LAST_SEARCH_CONDITION } from './actions.js';
import { successResult, VALIDATE_STATE } from 'inputCheck';

//Reducerの初期値を設定する。
const initialState = {
};

//Actionの処理を行うReducer

/**
 * editingDateConditionnのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
 function editingDateCondition(state={ startDate: null, endDate: null }, action) {
    switch( action.type ) {

        case SET_EDIT_DATE_CONDITION:
            return { 
                startDate: action.startDate, 
                endDate: action.endDate 
            };

        default:
            return state;
    }
}

/**
 * dateSpecifiedのReducer（true: 日付範囲を指定する）
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
 function dateSpecified(state=true, action) {
    switch( action.type ) {

        case SET_EDIT_DATE_CONDITION:
            return action.dateSpecified;

        default:
            return state;
    }
}

/**
 * validateDateのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function validateDate(state={ startDate: successResult,  endDate: successResult }, action) {
    switch( action.type ) {

        case SET_EDIT_DATE_CONDITION:
            return action.validate;

        default:
            return state;
    }
}

/**
 * invaildSearchのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
 function invaildSearch(state=true, action) {
    switch( action.type ) {

        case SET_EDIT_DATE_CONDITION:
            return hasErrorState(action.validate, action.dateSpecified);

        default:
            return state;
    }
}

/**
 * lastSearchConditionのReducer（直近の検索時の検索条件）
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
 function lastSearchCondition(state=null, action) {
    switch( action.type ) {

        case SET_LAST_SEARCH_CONDITION:
            return action.condition && _.cloneDeep(action.condition);

        default:
            return state;
    }
}

//#region その他関数

/**
 * 入力エラーがあるか
 * @param {object} validate 検証結果
 * @param {boolean} dateSpecified 日付範囲を指定するかどうか
 * @returns 
 */
function hasErrorState(validate, dateSpecified) {
    for (let key of Object.keys(validate)) {
        if (!dateSpecified) {
            continue;
        }
        if (validate[key].state === VALIDATE_STATE.error) {
            return true;
        }
    }
    return false;
}

//#endregion


//使用するReducerを列挙
const rootReducers = combineReducers({
    searchCondition,
    editingDateCondition,
    dateSpecified,
    validateDate,
    lastSearchCondition,
    searchResult,
    invaildSearch,
    authentication,
    isLoading,
    modalState
});

export default rootReducers;
