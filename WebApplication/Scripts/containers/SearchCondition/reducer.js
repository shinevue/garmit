/**
 * @license Copyright 2017 DENSO
 * 
 * 検索条件のReducerを定義する。
 * 
 */
'use strict';

import { combineReducers } from 'redux';
import { LOCATION_CHANGE } from 'react-router-redux';

//Reducerで処理するAction名をインポートする。
import { SET_LOOKUP, CLEAR_LOOKUP, SET_SEARCH_CONDITION, SET_EDITING_CONDITION, SET_CONDITION_LIST, SET_ICCARD_TYPE } from './actions.js';
import { omitEgroupWithBreaker } from 'makeOmitData';
import { ICCARD_TYPE } from 'constant';

//Actionの処理を行うReducer

/**
 * 検索条件に表示するデータ（lookUp）を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function lookUp(state = null, action) {
    switch (action.type) {
        case SET_LOOKUP:
            const lookUp = action.value;
            //検索条件に必要なデータのみを格納する
            return  { 
                        locations: lookUp.locations, 
                        enterprises: lookUp.enterprises,
                        functions: lookUp.functions,
                        tags: lookUp.tags,
                        loginUsers: lookUp.loginUsers,
                        egroups: omitEgroupWithBreaker(lookUp.egroups),
                        dataTypes: lookUp.dataTypes,
                        datagates: lookUp.datagates,
                        databases: lookUp.databases,
                        rackConditionItems: lookUp.rackConditionItems,
                        unitConditionItems: lookUp.unitConditionItems,
                        consumerConditionItems: lookUp.consumerConditionItems,
                        consumers: lookUp.consumers,
                        pointTypes: lookUp.pointTypes,
                        triggerTypes: lookUp.triggerTypes,
                        patchboardTypes: lookUp.patchboardTypes,
                        patchCableTypes: lookUp.patchCableTypes,
                        patchboardConditionItems: lookUp.patchboardConditionItems,
                        lineTypes: lookUp.lineTypes,
                        wiringTypes: lookUp.wiringTypes,
                        projectConditionItems: lookUp.projectConditionItems,
                        patchCableConditionItems: lookUp.patchCableConditionItems,
                        inConnects: lookUp.inConnects,
                        idfConnects: lookUp.idfConnects,
                        icTerminals: lookUp.icTerminals
                    };
        
        case CLEAR_LOOKUP:
            return null;

        default:
            return state;
    }
}

/**
 * 検索条件を更新する(検索で使用した検索条件。検索ボタン押下時の検索条件となる。)
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function conditions(state = null, action) {
    switch (action.type) {
        case SET_SEARCH_CONDITION:
            return action.value;

        case LOCATION_CHANGE:
            //画面遷移時に何か処理が必要な場合はこちらに記載する
            return state;

        case CLEAR_LOOKUP:
            return null;

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
function editingCondition(state = null, action) {
    switch (action.type) {
        case SET_EDITING_CONDITION:
            return action.value && Object.assign({}, action.value);
                      
        case CLEAR_LOOKUP:
            return null;
            
        default:
            return state;
    }    
}

/**
 * 登録済み検索条件一覧（検索条件保存機能で保存済みの検索条件一覧）
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function conditionList(state = [], action) {
    switch (action.type) {
        case SET_CONDITION_LIST:
            return action.value && Object.assign([], action.value);
    
        default:
            return state;
    }
}

/**
 * icCardTypeのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function icCardType(state=ICCARD_TYPE.FELICA, action) {
    switch( action.type ) {
        
        case SET_ICCARD_TYPE:
            return  action.icCardType;

        default:
            return state;
    }
}

//使用するReducerを列挙
const searchCondition = combineReducers({
    lookUp,
    conditions,
    editingCondition,
    conditionList,
    icCardType
});

export default searchCondition;
