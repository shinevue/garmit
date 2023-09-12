/**
 * @license Copyright 2020 DENSO
 * 
 * 回線画面のReducerを定義する。
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
import searchResult from 'SearchResult/reducer.js';
import authentication from 'Authentication/reducer.js';
import waitingInfo from 'WaitState/reducer.js';
import isLoading from 'LoadState/reducer';
import modalState from 'ModalState/reducer';

//Reducerで処理するAction名をインポートする。
import { SET_SEARCH_DISABLED, SET_IN_USE_ONLY } from './actions.js';
import { SET_EDIT_PATCHCABLE_FORM, CHANGE_PATCHCABLE_DATA, CHANGE_EXTENDED_PAGES, CLEAR_EDIT } from './actions.js';
import { SET_LINE_FILE_RESULT, SET_SHOW_FILE_MODAL } from './actions.js';
import { SET_UPLOAD_MODAL_INFO } from './actions.js';
import { getChangedPatchCableData } from 'lineUtility';

//Reducerの初期値を設定する。
const initialState = {
    searchDisabled: false,
    inUseOnly: false,
    editPatchCableFrom: null,
    invalid: {
        patchCableData: false,
        extendedPages: false
    },
    fileModalInfo: {
        show: false,
        fileResult: null,
        patchCableParameter: {
            patchboardId: null,
            cableNo: null
        }
    },
    uploadModalInfo: {
        show: false,
        patchCableParameters: [] 
    }
};

//Actionの処理を行うReducer

//#region 一覧画面用

/**
 * searchDisabled(検索無効)のReducer
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
 * inUseOnly(使用中のみとするか)のReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function inUseOnly(state=initialState.inUseOnly, action) {
    switch( action.type ) {
        case SET_IN_USE_ONLY:
            return  action.inUseOnly;

        default:
            return state;
    }
}

//#endregion


//#region 編集画面用

/**
 * 編集中の回線情報
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function editPatchCableFrom(state=initialState.editPatchCableFrom, action) {
    switch( action.type ) {

        case SET_EDIT_PATCHCABLE_FORM:
            return action.data && _.cloneDeep(action.data);

        case CHANGE_PATCHCABLE_DATA:
            return Object.assign(state, {}, {
                patchCableData: getChangedPatchCableData(state.patchCableData, action.key, action.value)
            });

        case CHANGE_EXTENDED_PAGES:
            return Object.assign(state, {}, {
                extendedPages: _.cloneDeep(action.pages)
            });

        case CLEAR_EDIT:
            return initialState.editPatchCableFrom;

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
        case SET_EDIT_PATCHCABLE_FORM:
            return {
                patchCableData: false,
                extendedPages: false
            };

        case CHANGE_PATCHCABLE_DATA:
            return Object.assign({}, state, {
                patchCableData: action.isError
            });
        
        case CHANGE_EXTENDED_PAGES:
            return Object.assign({}, state, {
                extendedPages: action.isError
            });

        case CLEAR_EDIT:
            return initialState.invalid;

        default:
            return state;
    }
    
}

//#endregion

//#region ファイル一覧

/**
 * showFileModal(ファイル一覧モーダル表示)のReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function showFileModal(state=initialState.fileModalInfo.show, action) {
    switch( action.type ) {
        case SET_SHOW_FILE_MODAL:
            return  action.show;

        default:
            return state;
    }    
}

/**
 * fileList(ファイル一覧)のReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function fileResult(state=initialState.fileModalInfo.fileResult, action) {
    switch( action.type ) {
        case SET_LINE_FILE_RESULT:
            return  action.data && _.cloneDeep(action.data);

        default:
            return state;
    }
}

/**
 * filePatchCableParameterのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function filePatchCableParameter(state=initialState.fileModalInfo.patchCableParameter, action) {
    switch( action.type ) {
        case SET_SHOW_FILE_MODAL:
            return  action.patchCableParameter ? _.cloneDeep(action.patchCableParameter) : { patchboardId: null, cableNo: null };

        default:
            return state;
    }
}

//#endregion

//#region ファイル追加モーダル関係

/**
 * showUploadModal(ファイルアップロードの表示状態)のReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function showUploadModal(state=initialState.uploadModalInfo.show, action) {
    switch( action.type ) {
        case SET_UPLOAD_MODAL_INFO:
            return  action.show
        default:
            return state;
    }
}

/**
 * patchCableParameters(ファイルアップロードする対象の線番情報)のReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function uploadPatchCableParameters(state=initialState.uploadModalInfo.patchCableParameters, action) {
    switch( action.type ) {
        case SET_UPLOAD_MODAL_INFO:
            return  action.patchCableParameters ? _.cloneDeep(action.patchCableParameters) : [];
        default:
            return state;
    }
}

//#endregion

/**
 * ファイル一覧モーダル情報
 */
const fileModalInfo = combineReducers({
    show: showFileModal,
    fileResult,
    patchCableParameter: filePatchCableParameter
});

/**
 * ファイル追加モーダル情報
 */
const uploadModalInfo = combineReducers({
    show: showUploadModal,
    patchCableParameters: uploadPatchCableParameters
});

//使用するReducerを列挙
const rootReducers = combineReducers({
    routing: routerReducer,
    authentication,
    waitingInfo,
    isLoading,
    modalState,
    searchCondition,
    searchResult,
    searchDisabled,
    inUseOnly,
    editPatchCableFrom,
    invalid,
    fileModalInfo,
    uploadModalInfo
});

export default rootReducers;
