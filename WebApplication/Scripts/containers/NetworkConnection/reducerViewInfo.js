/**
 * @license Copyright 2018 DENSO
 * 
 * NetworkListPanel及びNetworkEditPanelのReducerを定義する。
 * ReducerはActionを受信してStateを更新する。
 * 
 * 注意点
 * ・引数で渡されたstateやactionそのものを変更してはいけません。
 * 　stateを変更するには、previousState を直接いじるのではなく、新しいオブジェクトを作成して返却します。
 * 
 */
'use strict';

import { combineReducers } from 'redux';

//Reducerで処理するAction名をインポート
import { SET_VIEW_NETWORKPATH, CLEAR_VIEW_NETWORKPATH, SET_VIEW_SELECTED_NETWORKPATH, CLEAR_VIEW_SELECTED_NETWORKPATH } from './actionsViewInfo.js'
import { makeOmitNetworkPathView, omitNetworkRackDataForView, omitNetworkUnitDataForView, omitNetworkPortDataForView } from 'assetUtility';

//Reducerの初期値を設定する。
const initialState = {
    networkPath: null,
    selectedNetworkPath: null
};

/********************************************
 * Actionの処理を行うReducer
 ********************************************/

/**
 * 経路表示するネットワークのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function networkPath(state=initialState.networkPath, action) {
    switch( action.type ) {

        case SET_VIEW_NETWORKPATH:
            const networkPath = action.networkPath;
            if (networkPath) {
                return makeOmitNetworkPathView(networkPath);
            } else {
                return null;
            }

        case CLEAR_VIEW_NETWORKPATH:
            return initialState.networkPath;

        default:
            return state;
    }
}

/**
 * selectedNetworkPath(選択中のネットワーク)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function selectedNetworkPath(state=initialState.selectedNetworkPath, action){
    switch( action.type ) {

        case SET_VIEW_SELECTED_NETWORKPATH:
            networkPath = action.networkPath && JSON.parse(JSON.stringify(action.networkPath));
            if (networkPath) {
                if (action.isExchange) {
                    networkPath.rackFrom = action.networkPath.rackTo && JSON.parse(JSON.stringify(action.networkPath.rackTo));
                    networkPath.unitFrom = action.networkPath.unitTo && JSON.parse(JSON.stringify(action.networkPath.unitTo));
                    networkPath.portFrom = action.networkPath.portTo && JSON.parse(JSON.stringify(action.networkPath.portTo));
                    networkPath.portIndexFrom = action.networkPath.portIndexTo;
                    networkPath.rackTo = action.networkPath.rackFrom && JSON.parse(JSON.stringify(action.networkPath.rackFrom));
                    networkPath.unitTo = action.networkPath.unitFrom && JSON.parse(JSON.stringify(action.networkPath.unitFrom));
                    networkPath.portTo = action.networkPath.portFrom && JSON.parse(JSON.stringify(action.networkPath.portFrom));
                    networkPath.portIndexTo = action.networkPath.portIndexFrom;
                } else {
                    networkPath.rackFrom = omitNetworkRackDataForView(networkPath.rackFrom);
                    networkPath.unitFrom = omitNetworkUnitDataForView(networkPath.unitFrom);
                    networkPath.portFrom = omitNetworkPortDataForView(networkPath.portFrom);
                    networkPath.rackTo = omitNetworkRackDataForView(networkPath.rackTo);
                    networkPath.unitTo = omitNetworkUnitDataForView(networkPath.unitTo);
                    networkPath.portTo = omitNetworkPortDataForView(networkPath.portTo);
                }
            }
            return networkPath;

        case CLEAR_VIEW_NETWORKPATH:
        case CLEAR_VIEW_SELECTED_NETWORKPATH:
            return initialState.selectedNetworkPath;

        default:
            return state;
    }
}

//使用するReducerを列挙
const viewInfo = combineReducers({
    networkPath,
    selectedNetworkPath
});

export default viewInfo;
