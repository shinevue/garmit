/**
 * @license Copyright 2017 DENSO
 * 
 * RackUnitMaintenanceのReducerを定義する。
 * ReducerはActionを受信してStateを更新する。
 * 
 * 注意点
 * ・引数で渡されたstateやactionそのものを変更してはいけません。
 * 　stateを変更するには、previousState を直接いじるのではなく、新しいオブジェクトを作成して返却します。
 * 
 */
'use strict';

import { combineReducers } from 'redux';

import { SET_EXTENDED_DATA } from './actions.js';
import { SET_EDIT_PAGE } from './actions.js';
import { CHANGE_PAGENAME, CHANGE_TYPE, CHANGE_ITEMS, CHANGE_ITEM, CHANGE_HEADER_CHECK } from './actions.js';
import { CHANGE_LIST } from './actions.js';
import { PROCESS_ITEM_INFO } from './actions.js';
import { CHANGE_VALIDATION, VALIDATE_PAGENAME } from './actions.js';
import { TYPE, DATETIME_INIT_FORMAT, REAL_INIT_FORMAT, COLUMN_INDEX } from 'extendedDataUtility';

//Actionの処理を行うReducer

/**
 * ExtendedData(ページ一覧)のReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function extendedData(state = null, action) {

    switch (action.type) {

        case SET_EXTENDED_DATA:
            return action.value;

        default:
            return state;
    }
}

/**
 * editPageのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function editPage(state = {pageNo:-1, pageName:null}, action) {
    //更新の場合は更新対象データを取得
    let newItem = action.itemId ? getMatchObj(state, action.itemId) : null;

    switch (action.type) {

        case SET_EDIT_PAGE:
            return action.data;

        default:
            return state;
    }
}

/**
 * processedEditPageのReducer(コンポーネント表示用に加工した編集中ページ情報)
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function processedEditPage(state = null, action) {
    switch (action.type) {
        case CHANGE_PAGENAME:
            let pageNameChanged = _.cloneDeep(state);
            pageNameChanged.pageInfo.pageName = action.value;
            return pageNameChanged;

        case CHANGE_TYPE:
            let typeChanged = _.cloneDeep(state);
            typeChanged.pageInfo.unitTypes.selected = action.value;
            return typeChanged;

        case CHANGE_ITEMS:
            let itemsChanged = _.cloneDeep(state);
            itemsChanged.extendedItems= action.value;
            return itemsChanged;

        case CHANGE_ITEM:
            let itemChanged = _.cloneDeep(state);
            const index = _.findIndex(itemChanged.extendedItems, { 'itemId': action.value.itemId });
            itemChanged = _.set(itemChanged, ['extendedItems', index], action.value);
            return itemChanged;

        case CHANGE_HEADER_CHECK:
            let headerChanged = _.cloneDeep(state);
            headerChanged.isAllEnable = _.every(headerChanged.extendedItems, ["columnInfo." + COLUMN_INDEX.enableCheck + ".checked", true]);
            const enableItems = _.filter(headerChanged.extendedItems, { 'rowClassName': "" });
            headerChanged.isAllSearchable = enableItems.length > 0 && _.every(enableItems, ["columnInfo." + COLUMN_INDEX.searchableCheck + ".checked", true]);
            headerChanged.isAllSysAdmin = enableItems.length > 0 && _.every(enableItems, ["columnInfo." + COLUMN_INDEX.isSysAdmin + ".checked", true]);
            return headerChanged;

        case PROCESS_ITEM_INFO:
            return action.value;

        default:
            return state;
    }
}

/**
 * saveStateのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function saveState(state = { canSave: false }, action) {
    let saveState = _.cloneDeep(state);
    switch (action.type) {
        case CHANGE_VALIDATION:
            return action.value;

        case VALIDATE_PAGENAME:            
            saveState.detail.pageName = action.value;
            if (_.every(saveState.detail.itemRows, 'canSave') && saveState.detail.pageName) {
                saveState.canSave = true;
            }
            else {
                saveState.canSave = false;
            }
            return saveState;

        case CHANGE_LIST:
            const changedIndex = _.findIndex(saveState.detail.itemRows, { 'itemId': action.itemId });
            saveState.detail.itemRows[changedIndex] = action.value;
            if (_.every(saveState.detail.itemRows, 'canSave') && saveState.detail.pageName) {
                saveState.canSave = true;
            }
            else {
                saveState.canSave = false;
            }
            return saveState;

        default:
            return state;
    }
}

//#region private関数
/**
 * 一致するオブジェクトを取得する
 * @param {array} state 更新対象の配列
 * @param {number} index 更新する要素のインデックス
 * @return {array} 更新した配列
 */
function getMatchObj(state, itemId) {
    const extendedItems = _.cloneDeep(state.extendedItems);
    return state.extendedItems.find((item) => {
        return item.itemId === itemId;
    });
}
//#endregion

//使用するReducerを列挙
const rackUnitMaintenance = combineReducers({
    extendedData,
    editPage,
    processedEditPage,
    saveState
});

export default rackUnitMaintenance;
