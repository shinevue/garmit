/**
 * @license Copyright 2021 DENSO
 * 
 * ICカードのReducerを定義する。
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

import searchCondition from 'SearchCondition/reducer.js';
import icCardSearchCondition from 'ICCardSearchCondition/reducer.js';
import searchResult from 'SearchResult/reducer.js';
import authentication from 'Authentication/reducer.js';
import waitingInfo from 'WaitState/reducer.js';
import isLoading from 'LoadState/reducer';
import modalState from 'ModalState/reducer';

import { SET_SEARCH_DISABLED } from './actions.js';
import { SET_EDIT_ICCARD, CHANGE_EDIT_ICCARD, CHANGE_IS_INVALID } from './actions.js';
import { SET_EDIT_ICCARDS, CHANGE_BULK_ICCARD } from './actions.js';
import { CLEAR_EDIT, SET_DELETE_ICCARD_NOS } from './actions.js';
import { SET_LOGINUSER_ERACK_LOCATIONS, SET_ERACK_LOCATIONS, SET_LOGIN_USERS } from './actions.js';
import { CHANGE_USE_ENTERPEISE, CHANGE_USE_LOGINUSER } from './actions.js';

import { getEmptyBulkICCard, getChangedICCard, changeICCardEntityByUseEnterprise, changeICCardEntityByUseLoginUser, hasEnterprise, KEY_ICCARD_IS_ADMIN } from 'iccardUtility';

//Reducerの初期値を設定する。
const initialState = {
    searchDisabled: false,
    editICCard: null,
    useEnterprise: false,
    useLoginUser: false,
    editICCards: null,
    invalid: false,
    editBulkKeys: [],
    bulkICCard: {
        cardName: '',
        validStartDate: null,
        validEndDate: null,
        isInvalid: false
    },
    deleteICCardNos: [],
    loginUserERackLocations: [],
    eRackLocations: [],
    loginUsers: []
};

//Actionの処理を行うReducer

//#region 一覧画面用

/**
 * searchDisabledのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function searchDisabled(state=initialState.searchDisabled, action) {
    switch( action.type ) {
        
        case SET_SEARCH_DISABLED:
            return  action.disabled;

        default:
            return state;
    }
}

/**
 * 削除するカード番号リストのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function deleteICCardNos(state=initialState.deleteICCardNos, action) {
    switch( action.type ) {
        case SET_DELETE_ICCARD_NOS:
            return action.nos ? _.cloneDeep(action.nos) : initialState.deleteICCardNos;

        default:
            return state;
    }
}

//#endregion

//#region 編集画面用

/**
 * 編集中のICカード情報
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function editICCard(state=initialState.editICCard, action) {
    switch( action.type ) {

        case SET_EDIT_ICCARD:
            return action.data && _.cloneDeep(action.data);

        case CHANGE_EDIT_ICCARD:
            return getChangedICCard(state, action.key, action.value);

        case CHANGE_USE_ENTERPEISE:            
            return {
                icCardEntity: changeICCardEntityByUseEnterprise(state.icCardEntity),
                allowLocations: []
            };

        case CHANGE_USE_LOGINUSER:       
            return {
                icCardEntity: changeICCardEntityByUseLoginUser(state.icCardEntity),
                allowLocations: state.allowLocations && _.cloneDeep(state.allowLocations)
            };

        case CLEAR_EDIT:
            return initialState.editICCard;

        default:
            return state;
    }
}

/**
 * 「所属から選択する」フラグ
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function useEnterprise (state=initialState.useEnterprise, action) {
    switch( action.type ) {
        case SET_EDIT_ICCARD:
            if (action.isRegister || !hasEnterprise(action.data.icCardEntity.enterpriseId)) {
                return false;
            } else {
                return true;
            }
            
        case CHANGE_EDIT_ICCARD:
            if (action.key === KEY_ICCARD_IS_ADMIN) {
                return true;
            }
            return state;

        case CHANGE_USE_ENTERPEISE:
            return action.useEnterprise;
        
        case CLEAR_EDIT:
            return initialState.useEnterprise;

        default:
            return state;
    }
    
}

/**
 * 「ユーザーから選択する」フラグ
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function useLoginUser (state=initialState.useLoginUser, action) {
    switch( action.type ) {
        case SET_EDIT_ICCARD:
            if (action.isRegister || !action.data.icCardEntity.userId) {
                return false;
            } else {
                return true;
            }
        case CHANGE_USE_LOGINUSER:
            return action.useLoginUser;
        
        case CLEAR_EDIT:
            return initialState.useLoginUser;

        default:
            return state;
    }
    
}

/**
 * invalidのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function invalid (state=initialState.invalid, action) {
    switch( action.type ) {
        case SET_EDIT_ICCARD:
            return action.isRegister;

        case SET_EDIT_ICCARDS:
            return true;

        case CHANGE_EDIT_ICCARD:
        case CHANGE_BULK_ICCARD:
            return action.isError;

        case CHANGE_USE_ENTERPEISE:
            return true;

        case CHANGE_IS_INVALID:
            return action.value;
        
        case CLEAR_EDIT:
            return initialState.invalid;

        default:
            return state;
    }
    
}

//#region 一括編集

/**
 * 編集中のICカード情報（一括編集用）
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
 function editICCards(state=initialState.editICCards, action) {
    switch( action.type ) {

        case SET_EDIT_ICCARDS:
            return action.data && _.cloneDeep(action.data);
            
        case CLEAR_EDIT:
            return initialState.editICCards;

        default:
            return state;
    }
}

/**
 * 一括編集対象のキー
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function editBulkKeys(state=initialState.editBulkKeys, action) {
    switch( action.type ) {
        case SET_EDIT_ICCARDS:
        case CLEAR_EDIT:
            return _.cloneDeep(initialState.editBulkKeys);

        case CHANGE_BULK_ICCARD:
            return action.keys && action.keys.concat();
            
        default:
            return state;
    }
}

/**
 * 一括編集用案件情報
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function bulkICCard(state=initialState.bulkICCard, action) {
    switch( action.type ) {
        case SET_EDIT_ICCARDS:
            return getEmptyBulkICCard();
            
        case CLEAR_EDIT:
            return _.cloneDeep(initialState.bulkICCard);

        case CHANGE_BULK_ICCARD:
            return action.value && Object.assign(state, {}, action.value);
            
        default:
            return state;
    }
}

//#endregion


/**
 * ログインユーザーの電気錠ラックロケーション一覧のReducer（マスタとして保持）
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
 function loginUserERackLocations(state=initialState.loginUserERackLocations, action) {
    switch( action.type ) {
        
        case SET_LOGINUSER_ERACK_LOCATIONS:
            return  action.locations ? _.cloneDeep(action.locations) : [];

        default:
            return state;
    }
}

/**
 * 電気錠ラックロケーション一覧のReducer（編集画面のロケーション選択用）
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
 function eRackLocations(state=initialState.eRackLocations, action) {
    switch( action.type ) {
        case SET_ERACK_LOCATIONS:
            return action.locations ? _.cloneDeep(action.locations) : [];

        default:
            return state;
    }
}

/**
 *ログインユーザーリストのReducer（編集画面のユーザー選択用）
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
 function loginUsers(state=initialState.loginUsers, action) {
    switch( action.type ) {
        case SET_LOGIN_USERS:
            return action.loginUsers ? _.cloneDeep(action.loginUsers) : [];

        default:
            return state;
    }
}

//#endregion

//使用するReducerを列挙
const rootReducers = combineReducers({    
    routing: routerReducer,
    authentication,
    waitingInfo,
    isLoading,
    modalState,
    searchCondition,
    icCardSearchCondition,
    searchResult,
    searchDisabled,
    editICCard,
    invalid,
    editICCards,
    editBulkKeys,
    bulkICCard,
    deleteICCardNos,
    loginUserERackLocations,
    eRackLocations,
    loginUsers,
    useEnterprise,
    useLoginUser
});

export default rootReducers;
