/**
 * @license Copyright 2018 DENSO
 * 
 * AssetReportPanelのReducerを定義する。
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
import isLoading from 'LoadState/reducer.js';

import { ASSET_REPORT_TYPE } from 'constant';

//Reducerで処理するAction名をインポートする。
import { SET_REPORT_TYPE, SET_SEARCH_DISABLED, SET_SHOW_MESSAGE } from './actions.js';

//Reducerの初期値を設定する。
const initialState = {
    reportType: ASSET_REPORT_TYPE.rack,
    searchDisabled: false,
    messageModal: {
        show: false,
        title: '',
        message: ''
    }
};

/********************************************
 * Actionの処理を行うReducer
 ********************************************/

/**
 * reportType(出力種別)のReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function reportType(state=initialState.reportType, action) {
    switch( action.type ) {
        case SET_REPORT_TYPE:
            return  action.value;

        default:
            return state;
    }
}

/**
 * searchDisabled(検索無効)のReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function searchDisabled(state=initialState.searchDisabled, action) {
    switch( action.type ) {
        case SET_SEARCH_DISABLED:
            return  action.value;

        default:
            return state;
    }
}

/**
 * showMessage(メッセージを表示するかどうか)のReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function messageModal(state=initialState.messageModal, action) {
    switch( action.type ) {
        case SET_SHOW_MESSAGE:
            return  {
                show: action.show,
                title: action.title,
                message: action.message
            };

        default:
            return state;
    }

}

//使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    searchCondition,
    searchResult,
    isLoading,
    reportType,
    searchDisabled,
    messageModal
});

export default rootReducers;
