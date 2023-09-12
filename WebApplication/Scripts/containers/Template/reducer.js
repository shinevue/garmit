/**
 * @license Copyright 2017 DENSO
 * 
 * TemplatePanelのReducerを定義する。
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
import waitingInfo from 'WaitState/reducer.js';

//Reducerで処理するAction名をインポート
import { SET_TEMPLATE_TYPE, SET_DELETE_TEMPLATE_IDS, CHANGE_MODAL_STATE, SET_LOADSTATE } from './actions.js';

import { TEMPLATE_TYPE } from 'constant';

//Reducerの初期値を設定する。
const initialState = {
    templateType: TEMPLATE_TYPE.rack,
    deleteTemplateIds: [],
    isLoading: false,
    modalState: {
        show: false,
        title: '',
        message: '',
        type: '',
        callback: null
    }
};

//Actionの処理を行うReducer

/**
 * テンプレート種別のReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function templateType(state=initialState.templateType, action) {
    switch( action.type ) {

        case SET_TEMPLATE_TYPE:
            return action.templateType;

        default:
            return state;
    }
}

/**
 * 削除するテンプレートID（deleteTemplateIds）のReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function deleteTemplateIds(state=initialState.deleteTemplateIds, action) {
    switch( action.type ) {

        case SET_DELETE_TEMPLATE_IDS:
            return action.templateIds.slice();

        default:
            return state;
    }
}

/**
 * modalInfo(モーダル情報)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function modalState(state=initialState.modalState, action) {
    switch( action.type ) {

        case CHANGE_MODAL_STATE:
            return Object.assign({}, state, {
                        show: action.show,
                        title: action.title,
                        message: action.message,
                        type: action.modalType,
                        callback: action.callback
                    });

        default:
            return state;
    }
}


/**
 * isLoading(ロード中)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function isLoading(state=initialState.isLoading, action) {
    switch( action.type ) {

        case SET_LOADSTATE:
            return action.value;
            
        default:
            return state;
    }

}

//使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    searchCondition,
    searchResult,
    templateType,
    deleteTemplateIds,
    modalState,
    isLoading,
    waitingInfo
});

export default rootReducers;
