/**
 * @license Copyright 2020 DENSO
 * 
 * PatchboardのReducerを定義する。
 * ReducerはActionを受信してStateを更新する。
 * 
 * 注意点
 * ・引数で渡されたstateやactionそのものを変更してはいけません。
 * 　stateを変更するには、previousState を直接いじるのではなく、新しいオブジェクトを作成して返却します。
 * 
 */
'use strict';

import { combineReducers } from 'redux';
import { routerReducer, LOCATION_CHANGE } from 'react-router-redux';


import authentication from 'Authentication/reducer.js';
import searchCondition from 'SearchCondition/reducer.js';
import searchResult from 'SearchResult/reducer.js';
import waitingInfo from 'WaitState/reducer.js';

import {
    SET_LOADSTATE, SET_LOADSTATE_CONDITION, SET_LOADSTATE_RESULT, SET_LOADSTATE_CONDITION_LIST, SET_PATCHBOARD_LIST, SET_PATCHBOARD_FORM,
    SET_PATCHBOARDS, SET_BULKMODE, SET_DISP_PATCHBOARD_ID, SET_ANCESTORS_TREE, SET_CHILDREN_PATCHBOARDS
} from './actions.js';

import { convertDateTimeExtendedData } from 'assetUtility';

/**
 * 配線盤画面のReducer
 */
function isLoading(state = { condition: false, result: false, conditionList: false  }, action) {
    switch (action.type) {
        case SET_LOADSTATE:
            return action.value;

        case SET_LOADSTATE_CONDITION:
            return Object.assign({}, state, {
                condition: action.value
            });

        case SET_LOADSTATE_RESULT:
            return Object.assign({}, state, {
                result: action.value
            });

        case SET_LOADSTATE_CONDITION_LIST:
            return Object.assign({}, state, {
                conditionList: action.value
            });
            
        default:
            return state;
    }
}

function patchboardList(state = [], action) {
    switch (action.type) {
        case SET_PATCHBOARD_LIST:
            return action.value;

        default:
            return state;
    }
}

function patchboardForm(state = null, action) {
    switch (action.type) {
        case SET_PATCHBOARD_FORM: {
            if (!action.value) {
                return action.value;
            }
            const patchboardForm = Object.assign({}, action.value);
            patchboardForm.extendedPages = convertDateTimeExtendedData(patchboardForm.extendedPages);
            return patchboardForm;
        }
        default:
            return state;
    }
}

function patchboards(state = null, action) {
    switch (action.type) {
        case SET_PATCHBOARDS:
            return action.value;

        default:
            return state;
    }
}

function bulkMode(state = false, action) {
    switch (action.type) {
        case SET_BULKMODE:
            return action.value;

        default:
            return state;
    }
}

function dispPatchboardId(state = null, action) {
    switch (action.type) {
        case SET_DISP_PATCHBOARD_ID:
            return action.value;

        default:
            return state;
    }
}

function ancestorsTree(state = null, action) {
    switch (action.type) {
        case SET_ANCESTORS_TREE:
            return action.value;

        default:
            return state;
    }
}

function childrenPatchboards(state = null, action) {
    switch (action.type) {
        case SET_CHILDREN_PATCHBOARDS:
            return action.value;

        default:
            return state;
    }
}


//使用するReducerを列挙
const rootReducers = combineReducers({
    routing: routerReducer,
    authentication,
    searchCondition,
    searchResult,
    waitingInfo,
    isLoading,
    patchboardList,
    patchboardForm,
    patchboards,
    bulkMode,
    dispPatchboardId,
    ancestorsTree,
    childrenPatchboards
});

export default rootReducers;
