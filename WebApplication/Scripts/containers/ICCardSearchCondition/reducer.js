/**
 * @license Copyright 2017 DENSO
 * 
 * ICカード検索条件のReducerを定義する。
 * 
 */
'use strict';

import { combineReducers } from 'redux';
import { LOCATION_CHANGE } from 'react-router-redux';

//Reducerで処理するAction名をインポートする。
import { SET_ICCARD_SEARCH_CONDITION, SET_ICCARD_EDITING_CONDITION, SET_VALIDATE_ICCARD_CONDITION } from './actions.js';
import { successResult } from 'inputCheck';

//Reducerの初期値を設定する。
const initialState = {
    condition: {
        dateSpecified: true,
        dateFrom: null,
        dateTo: null,
        isAdmin: true,
        isNonAdmin: true,
        isValid: true,
        isInvalid: true
    },
    validate: {
        dateFrom: successResult,
        dateTo: successResult,
    }
};

/**
 * 検索条件を更新する(検索で使用した検索条件。検索ボタン押下時の検索条件となる。)
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function conditions(state = Object.assign({}, initialState.condition), action) {
    switch (action.type) {
        case SET_ICCARD_SEARCH_CONDITION:
            return action.value;

        default:
            return state;
    }
}

/**
 * 編集中の検索条件を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function editingCondition(state = Object.assign({}, initialState.condition), action) {
    switch (action.type) {
        case SET_ICCARD_EDITING_CONDITION:
            return action.value && Object.assign({}, action.value);
            
        default:
            return state;
    }
}

/**
 * 検索条件の検証結果
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function validate(state = initialState.validate, action) {    
    switch (action.type) {
        case SET_VALIDATE_ICCARD_CONDITION:
        case SET_ICCARD_EDITING_CONDITION:
            return action.validate ? Object.assign({}, action.validate) : Object.assign({}, initialState.validate);
            
        default:
            return state;
    }
}

//使用するReducerを列挙
const icCardSearchCondition = combineReducers({
    conditions,
    editingCondition,
    validate
});

export default icCardSearchCondition;
