/**
 * @license Copyright 2019 DENSO
 * 
 * ElectricLockMapPanelのReducerを定義する。
 * ReducerはActionを受信してStateを更新する。
 * 
 * 注意点
 * ・引数で渡されたstateやactionそのものを変更してはいけません。
 * 　stateを変更するには、previousState を直接いじるのではなく、新しいオブジェクトを作成して返却します。
 * 
 */
'use strict';

import { combineReducers } from 'redux';

import floorMapCommon from 'FloorMapCommon/reducer.js';
import isLoading from 'LoadState/reducer.js';
import modalState from 'ModalState/reducer.js';
import waitingInfo from 'WaitState/reducer.js';
import unlockPurposeInfo from 'UnlockPurpose/reducer.js';
import authentication from 'Authentication/reducer.js';
import networkError from 'NetworkError/reducer.js';

//Reducerで処理するAction名をインポートする。
import { SET_LOOKUP, SET_EMPTY_EXTENDED_PAGES, SET_ELECKEY_OBJECTS, } from './actions.js';
import { SET_SELECT_ELECKEY_OBJECTS, SET_SELECT_ELECKEY_DISPITEMS, CLEAR_SELECT_ELECKEYS } from './actions.js';
import { SET_TEMP_KEY_RACKS, CHANGE_MULTI_RACK_MODAL_STATE } from './actions.js';
import { CHANGE_OPERATION_MEMO, CHANGE_OPERATION_TARGET, CLEAR_OPERATION_INFO, CHANGE_OPERATION_EXTENDED_PAGES } from './actions.js';
import { START_UPDATE, END_UPDATE } from './actions.js';

import { validateOperationMemo, validateOperationTarget, isAllBothTargetOrPhysicalKey, isAllUnlockOrPhysicalKey, isAllSameELockOpLogExtendedPages, isAllSameOpenMemo } from 'electricLockUtility';
import { successResult } from 'inputCheck';
import { convertDateTimeExtendedData, isErrorExtendedData } from 'assetUtility';

//Reducerの初期値を設定する。
const initialState = {
    lookUp: { layouts: null },
    emptyExtendedPages: [],
    elecKeyObjects: null,
    selectKeyRacks: {
        objects: [],
        dispItems: []
    },
    tempMultiKeyRacks: {
        objects: null,
        dispItems: null
    },
    operationExtendedPages: [],
    operationMemo: '',
    operationTarget: { front: true, rear: true },
    memoValidation: successResult,
    targetValidatation: successResult,
    extendedPagesError: false,
    showMultiRackModal: false
};

/**
 * lookUpのReducer
 */
function lookUp(state = initialState.lookUp, action) {
    switch (action.type) {

        case SET_LOOKUP:
            return action.data ? action.data : initialState.lookUp;

        default:
            return state;
    }
}

/**
 * 空の詳細項目ページ情報のReducer
 */
function emptyExtendedPages(state= initialState.emptyExtendedPages, action) {
    switch (action.type) {
        case SET_EMPTY_EXTENDED_PAGES:
            return action.data ? _.cloneDeep(action.data) : initialState.emptyExtendedPages;
    
        default:
            return state;
    }
}

/**
 * 電気錠オブジェクトのReducer
 */
function elecKeyObjects(state = initialState.elecKeyObjects, action) {
    switch (action.type) {

        case SET_ELECKEY_OBJECTS:
            return action.data ? _.cloneDeep(action.data) : initialState.elecKeyObjects;
        
        default:
            return state;
    }
}

/**
 * 選択中の電気錠ラックのReducer
 */
function selectKeyRacks(state = initialState.selectKeyRacks, action) {
    switch (action.type) {

        case SET_SELECT_ELECKEY_OBJECTS:
            const objects = action.data ? action.data : initialState.selectKeyRacks.objects;
            return Object.assign({}, state, {
                objects: _.cloneDeep(objects)
            });

        case SET_SELECT_ELECKEY_DISPITEMS:
            var dispItems = action.data ? action.data : initialState.selectKeyRacks.dispItems;
            dispItems.forEach((item) => {
                item.electricLocks.forEach((lock) => {                    
                    lock.eLockOpLogExtendedPages = lock.eLockOpLogExtendedPages ? convertDateTimeExtendedData(lock.eLockOpLogExtendedPages) : [];
                })
            });
            return Object.assign({}, state, {
                dispItems: _.cloneDeep(dispItems)
            });

        case CLEAR_SELECT_ELECKEYS:
            return initialState.selectKeyRacks;

        default:
            return state;
    }
}

/**
 * 分割ラックの選択前のデータ
 */
function tempMultiKeyRacks(state = initialState.tempMultiKeyRacks, action) {
    
    switch (action.type) {

        case SET_TEMP_KEY_RACKS:
            return action.data ? _.cloneDeep(action.data) : initialState.tempMultiKeyRacks;

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
 * 電気錠ラック操作時のメモ
 */
function operationMemo(state = initialState.operationMemo, action) {
    switch (action.type) {
        case CHANGE_OPERATION_MEMO:
            return action.data;

        case SET_SELECT_ELECKEY_DISPITEMS:
            const dispItems = action.data ? action.data : initialState.selectKeyRacks.dispItems;
            if (action.canChanged && isAllUnlockOrPhysicalKey(dispItems) && isAllSameOpenMemo(dispItems)) {
                return dispItems[0].electricLocks[0].openMemo;
            }
            return state;
        
        case CLEAR_OPERATION_INFO:
            return initialState.operationMemo;

        default:
            return state;
    }
}

/**
 * 電気錠ラック操作時の詳細ページ（項目）
 */
function operationExtendedPages(state = initialState.operationExtendedPages, action) {
    switch (action.type) {
        case CHANGE_OPERATION_EXTENDED_PAGES:
            return action.data;
    
        case SET_SELECT_ELECKEY_DISPITEMS:
            const dispItems = action.data ? action.data : initialState.selectKeyRacks.dispItems;
            if (action.canChanged && isAllUnlockOrPhysicalKey(dispItems) && isAllSameELockOpLogExtendedPages(dispItems)) {
                return convertDateTimeExtendedData(dispItems[0].electricLocks[0].eLockOpLogExtendedPages);
            }
            return state;

        case CLEAR_OPERATION_INFO:
            return action.extendedPages ? _.cloneDeep(action.extendedPages): initialState.operationExtendedPages;
            
        default:
            return state;
    }
}

/**
 * 電気錠ラック操作時の操作対象
 */
function operationTarget(state = initialState.operationTarget, action) {
    switch (action.type) {
        case CHANGE_OPERATION_TARGET:
            return { front: action.front, rear: action.rear };

        case SET_SELECT_ELECKEY_DISPITEMS:
            const dispItems = action.data ? action.data : initialState.selectKeyRacks.dispItems;
            if (action.canChanged && isAllBothTargetOrPhysicalKey(dispItems)) {
                return { front: true, rear: true };
            }
            return state;       //前後以外のラックが含まれていたら、変更はなし

        case CLEAR_OPERATION_INFO:
            return Object.assign({}, initialState.operationTarget);

        default:
            return state;
    }
}

/**
 * メモの検証結果
 */
function memoValidation(state = initialState.memoValidation, action) {
    switch (action.type) {
        case CHANGE_OPERATION_MEMO:
            return validateOperationMemo(action.data);

        case SET_SELECT_ELECKEY_DISPITEMS:
            const dispItems = action.data ? action.data : initialState.selectKeyRacks.dispItems;
            if (action.canChanged && isAllUnlockOrPhysicalKey(dispItems) && isAllSameOpenMemo(dispItems)) {
                return validateOperationMemo(dispItems[0].electricLocks[0].openMemo);
            }
            return state;

        case CLEAR_OPERATION_INFO:
            return successResult;

        default:
            return state;
    }
}

/**
 * 詳細ページ（項目）で入力エラーとなっているかどうか
 */
function extendedPagesError(state = initialState.extendedPagesError, action) {
    switch (action.type) {
        case CHANGE_OPERATION_EXTENDED_PAGES:
            return action.isError;
            
        case SET_SELECT_ELECKEY_DISPITEMS:
            const dispItems = action.data ? action.data : initialState.selectKeyRacks.dispItems;
            if (action.canChanged && isAllUnlockOrPhysicalKey(dispItems) && isAllSameELockOpLogExtendedPages(dispItems)) {
                return isErrorExtendedData(dispItems[0].electricLocks[0].eLockOpLogExtendedPages);
            }
            return state;
            
        case CLEAR_OPERATION_INFO:
            return isErrorExtendedData(action.extendedPages);
            
        default:
            return state;
    }
}

/**
 * 操作対象の検証結果
 */
function targetValidatation(state = initialState.targetValidatation, action) {
    switch (action.type) {
        case CHANGE_OPERATION_TARGET:
            return validateOperationTarget(action.front, action.rear);

        case SET_SELECT_ELECKEY_DISPITEMS:
            const dispItems = action.data ? action.data : initialState.selectKeyRacks.dispItems;
            if (isAllBothTargetOrPhysicalKey(dispItems)) {
                return successResult;
            }
            return state;       //前後以外のラックが含まれていたら、変更はなし

        case CLEAR_OPERATION_INFO:
            return successResult;

        default:
            return state;
    }
}

/**
 * 分割ラック選択モーダル表示
 */
function showMultiRackModal(state = initialState.showMultiRackModal, action) {
    switch (action.type) {
        case CHANGE_MULTI_RACK_MODAL_STATE:
            return action.show;

        default:
            return state;
    }
}

const operationInfo = combineReducers({
    operationMemo,
    operationTarget,
    operationExtendedPages,
    memoValidation,
    targetValidatation,
    extendedPagesError
})

//使用するReducerを列挙
const rootReducers = combineReducers({
    lookUp,
    emptyExtendedPages,
    floorMapCommon,
    elecKeyObjects,
    selectKeyRacks,
    tempMultiKeyRacks,
    operationInfo,
    showMultiRackModal,
    isLoading,
    updating,
    modalState,
    waitingInfo,
    unlockPurposeInfo,
    authentication,
    networkError
});

export default rootReducers;
