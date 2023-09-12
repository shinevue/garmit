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
import searchCondition from 'SearchCondition/reducer.js';
import icCardSearchCondition from 'ICCardSearchCondition/reducer.js';
import waitingInfo from 'WaitState/reducer.js';

//メニュー用のReducerをインポート
import { SET_LOAD_STATE, SET_IMPORT_TYPE, SET_SEARCH_DISABLED, SET_EXPORT_SET, SET_PREV_EXPORT_SET, SET_EXPORT_TYPES, SET_FORMAT_ONLY } from './actions.js';

import { IMPORT_TYPE, EXPORT_TYPE } from 'constant';

const initialStateSarchDisabled = {
    point: false,
    rack: false,
    unit: false,
    icCard: false
}

/**
 * インポート画面のReducer
 */
function isLoading(state = false, action) {
    switch (action.type) {
        case SET_LOAD_STATE:
            return action.value;

        default:
            return state;
    }
}

function importType(state = IMPORT_TYPE.point, action) {

    switch( action.type ) {

        case SET_IMPORT_TYPE:
            return action.value;

        default:
            return state;
    }
}

function searchDisabled(state = initialStateSarchDisabled, action) {
    switch (action.type) {
        case SET_SEARCH_DISABLED:
            var disabled = _.cloneDeep(state);
            switch (action.importType) {
                case IMPORT_TYPE.rack:
                    disabled.rack = action.value;
                    break;
                case IMPORT_TYPE.unit:
                    disabled.unit = action.value;
                    break;
                case IMPORT_TYPE.icCard:
                    disabled.icCard = action.value;
                    break;
            }

            if (action.importType) {
                return disabled;
            } else {
                return {
                    point: action.value,
                    rack: action.value,
                    unit: action.value,
                    icCard: action.value
                };
            }

        default:
            return state;
    }
}

function exportSet(state = null, action) {
    switch (action.type) {
        case SET_EXPORT_SET:
            return action.value;

        default:
            return state;
    }
}

function prevExportSet(state = null, action) {
    switch (action.type) {
        case SET_PREV_EXPORT_SET:
            return action.value;

        default:
            return state;
    }
}

function exportTypes(state = [EXPORT_TYPE.point, EXPORT_TYPE.rack, EXPORT_TYPE.unit, EXPORT_TYPE.icCard], action) {
    switch (action.type) {
        case SET_EXPORT_TYPES:
            return action.value;

        default:
            return state;
    }
}

function isFormatOnly(state = false, action){
    switch (action.type) {
        case SET_FORMAT_ONLY:
            return action.value;

        default:
            return state;
    }
}

//Sabdboxで使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    searchCondition,
    icCardSearchCondition,
    isLoading,
    waitingInfo,
    importType,
    searchDisabled,
    exportSet,
    prevExportSet,
    isFormatOnly,
    exportTypes
});

export default rootReducers;
