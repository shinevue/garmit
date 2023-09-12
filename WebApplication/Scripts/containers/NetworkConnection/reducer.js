/**
 * @license Copyright 2018 DENSO
 * 
 * NetworkListPanel、NetworkEditPanel及びNetworkViewPanelのReducerを定義する。
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
import editInfo from './reducerEditInfo.js';
import viewInfo from './reducerViewInfo.js';
import authentication from 'Authentication/reducer.js';
import waitingInfo from 'WaitState/reducer.js';

//Reducerで処理するAction名をインポート
import { SET_NETWORKPATH_ROWS, SET_NETWORKPATH, CLEAR_NETWORKPATH, SET_TABLE_DISPLAYSTATE } from './actions.js';
import { SET_LAYOUTS, SET_CABLETYPES, SET_LOADSTATE } from './actions.js';
import { CHANGE_DELETEMESSAGE_STATE, CHANGE_MESSAGE_STATE, CHANGE_CONFIRM_STATE } from './actions.js';
import { makeOmitSelectNetworkPath } from 'assetUtility';

//Reducerの初期値を設定する。
const initialState = {
    networkPathRows: null,
    networkPaths: null,
    selectedNetworkPath: null,
    deleteNetworkPaths: null,
    layouts: [],
    cableTypes:[], 
    isLoading: false,
    modalInfo: {
        delete: {
            show: false,
            title: '',
            message: null,
            targets: null
        },
        confirm: {
            show: false,
            title: '',
            message: '',
            callback: null
        },
        message: {
            show: false,
            title: '',
            message: '',
            callback: null
        }
    },
    tableDisplayState: null
};

/********************************************
 * Actionの処理を行うReducer
 ********************************************/

/**
 * ネットワーク経路一覧表のReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function networkPathRows(state=initialState.networkPathRows, action) {
    switch (action.type) {
        case SET_NETWORKPATH_ROWS:
            return action.networkPathRows ? _.cloneDeep(action.networkPathRows) : null;
        default:
            return state;
    }
}

/**
 * 選択中のネットワークのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function selectedNetworkPath(state=initialState.selectedNetworkPath, action) {
    switch( action.type ) {

        case SET_NETWORKPATH:
            var networkPath = action.networkPath && makeOmitSelectNetworkPath(action.networkPath);
            //ラックの設置場所を登録
            if (networkPath) {
                networkPath.rackFrom.position = makeLocationPosition(networkPath.rackFrom.location);
                if (networkPath.rackTo) {
                    networkPath.rackTo.position = makeLocationPosition(networkPath.rackTo.location);
                }
            }
            return {
                networkPathRow: action.networkRow && _.cloneDeep(action.networkRow),
                networkPath: networkPath
            }

        case CLEAR_NETWORKPATH:
            return initialState.selectedNetworkPath;
        
        default:
            return state;
    }
}

/**
 * layouts(レイアウトリスト)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @return {object} 更新後のstate
 */
function layouts(state=initialState.layouts, action) {
    switch( action.type ) {

        case SET_LAYOUTS:
            return action.layouts ? _.cloneDeep(action.layouts) : [];

        default:
            return state;
    }    
}

/**
 * cableTypes(ケーブル種別)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function cableTypes(state=initialState.cableTypes, action) {
    switch( action.type ) {

        case SET_CABLETYPES:
            return action.value ? action.value.slice() : [];
            
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

/**
 * modalInfo(モーダル情報)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function modalInfo(state=initialState.modalInfo, action) {
    switch( action.type ) {

        case CHANGE_DELETEMESSAGE_STATE:
            return Object.assign({}, state, {
                delete: {
                    show: action.value,
                    message: action.message,
                    targets: action.targets && JSON.parse(JSON.stringify(action.targets))
                }
            });
            
        case CHANGE_MESSAGE_STATE:
            return Object.assign({}, state, {
                message: {
                    show: action.value,
                    title: action.title,
                    message: action.message,
                    callback: action.callback
                }
            });
            
        case CHANGE_CONFIRM_STATE:
            return Object.assign({}, state, {
                confirm: {
                    show: action.value,
                    title: action.title,
                    message: action.message,
                    callback: action.callback
                }
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
function tableDisplayState(state=initialState.tableDisplayState, action) {
    switch( action.type ) {

        case SET_TABLE_DISPLAYSTATE:
            return action.displayState ? Object.assign({}, action.displayState) : null;
            
        default:
            return state;
    }

}

/**
 * ロケーションの配置を取得する
 */
function makeLocationPosition(location){
    var position = [];
    position.unshift(location);
    if(location.parent){
        position.unshift(...makeLocationPosition(location.parent))
    }
    return position;
}

//使用するReducerを列挙
const rootReducers = combineReducers({
    routing: routerReducer,
    authentication,
    searchCondition,
    networkPathRows,
    selectedNetworkPath,
    tableDisplayState,
    layouts,
    cableTypes,
    isLoading,
    modalInfo,
    editInfo,
    viewInfo,
    waitingInfo
});

export default rootReducers;
