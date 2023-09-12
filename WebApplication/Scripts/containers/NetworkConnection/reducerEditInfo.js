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
import { routerReducer, LOCATION_CHANGE } from 'react-router-redux';

import dualRack from 'DualRack/reducer.js';

//Reducerで処理するAction名をインポート
import { SET_NETWORKPATH_ROWS } from './actions.js'
import { SET_EDITING_NETWORKPATH } from './actionsEditInfo.js';
import { SET_UNITDISPSETTING, SET_UNIT, SET_PORT, SET_PORT_INDEX, SET_UNITDISPSETTING_ONLY } from './actionsEditInfo.js';
import { CHANGE_NETWORK_INFO, CHANGE_NETWORK_CONNECT, CLEAR_NETWORK_CONNECT, CLEAR_NETWORK_ONE_SIDE } from './actionsEditInfo.js';
import { SET_EDITMODE } from './actionsEditInfo.js';
import { SET_RACK, CLEAR_RACK } from 'DualRack/actions.js';

import { makeEditingNetworkPath, makeNetworkRackSimpleData, makeNetworkUnitSimpleData, makeNetworkPortSimpleData } from 'assetUtility';
import { clearNetwork } from 'assetUtility';

//Reducerの初期値を設定する。
const initialState = {
    selectedUnitDispSetting: {
        left: null,
        right: null
    },
    selectedUnit: {
        left: null,
        right: null
    },
    selectedPort: {
        left: null,
        right: null
    },
    portIndex: {
        left: null,
        right: null
    },
    editingNetworkPath: null,
    isEditMode: true,
    invalid: {
        connect: false,
        network: false
    },
    canConnect: {
        left: false,
        right: false
    }
};

/********************************************
 * Actionの処理を行うReducer
 ********************************************/

/**
 * 編集中のネットワークのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function editingNetworkPath(state=initialState.editingNetworkPath, action) {
    switch( action.type ) {

        case SET_NETWORKPATH_ROWS:
            return initialState.editingNetworkPath;
            
        case SET_EDITING_NETWORKPATH:
            const networkPath = action.networkPath;
            if (networkPath) {
                return makeEditingNetworkPath(networkPath);
            } else {
                return null;
            }

        case CHANGE_NETWORK_INFO:
            var networkPath = Object.assign({}, state);
            networkPath.network = Object.assign({}, action.network);
            return networkPath;

        case CHANGE_NETWORK_CONNECT:
            return Object.assign({}, state, {
                rackFrom: makeNetworkRackSimpleData(action.rackFrom),
                unitFrom: makeNetworkUnitSimpleData(action.unitFrom),
                portFrom: makeNetworkPortSimpleData(action.portFrom),
                portIndexFrom: action.portIndexFrom,
                rackTo: makeNetworkRackSimpleData(action.rackTo),
                unitTo: makeNetworkUnitSimpleData(action.unitTo),
                portTo: makeNetworkPortSimpleData(action.portTo),
                portIndexTo: action.portIndexTo
            });
        
        case CLEAR_NETWORK_CONNECT:
            var networkPath = Object.assign({}, state);
            return Object.assign({}, state, {
                network: clearNetwork(networkPath&&networkPath.network),
                rackFrom: null,
                unitFrom: null,
                portFrom: null,
                portIndexFrom: null,
                rackTo: null,
                unitTo: null,
                portTo: null,
                portIndexTo: null
            });
        case CLEAR_NETWORK_ONE_SIDE:
            var networkPath = Object.assign({}, state);
            if (action.isFrom) {
                networkPath.rackFrom = null;
                networkPath.unitFrom = null;
                networkPath.portFrom = null;
                networkPath.portIndexFrom = null;
            } else {
                networkPath.rackTo = null;
                networkPath.unitTo = null;
                networkPath.portTo = null;
                networkPath.portIndexTo = null;
            }

            return networkPath;

        default:
            return state;
    }
}

/**
 * selectedUnitDispSetting(選択中の表示設定グループ)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function selectedUnitDispSetting(state=initialState.selectedUnitDispSetting, action){
    switch( action.type ) {

        case SET_UNITDISPSETTING:
        case SET_UNITDISPSETTING_ONLY:
            var key = action.isLeft ? 'left' : 'right';
            var dispSetting = Object.assign({}, state);
            if (action.unitDispSetting) {
                dispSetting[key] = Object.assign({}, action.unitDispSetting);
            } else {
                dispSetting[key] = null;
            }            
            return dispSetting;

        case SET_RACK:
        case CLEAR_RACK:
            var key = action.isLeft ? 'left' : 'right';
            var dispSetting = Object.assign({}, state);
            dispSetting[key] = null;
            return dispSetting;
            
        default:
            return state;
    }
}

/**
 * selectedUnit(選択中のユニット)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function selectedUnit(state=initialState.selectedUnit, action){
    switch( action.type ) {

        case SET_UNIT:
            var key = action.isLeft ? 'left' : 'right';
            var unit = Object.assign({}, state);
            if (action.unit) {
                unit[key] = Object.assign({}, action.unit);
            } else {
                unit[key] = null;
            }
            return unit;

        case SET_RACK:
        case SET_UNITDISPSETTING:
        case CLEAR_RACK:
            var key = action.isLeft ? 'left' : 'right';
            var unit = Object.assign({}, state);
            unit[key] = null;
            return unit;

        default:
            return state;
    }
}

/**
 * selectedPort(選択中のポート)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function selectedPort(state=initialState.selectedPort, action){
    switch( action.type ) {

        case SET_PORT:
            var key = action.isLeft ? 'left' : 'right';
            var port = Object.assign({}, state);
            if (action.port) {
                port[key] = Object.assign({}, action.port);
            } else {
                port[key] = null;
            }
            return port;

        case SET_RACK:
        case SET_UNITDISPSETTING:
        case SET_UNIT:
        case CLEAR_RACK:
            var key = action.isLeft ? 'left' : 'right';
            var port = Object.assign({}, state);
            port[key] = null;
            return port;

        default:
            return state;
    }
}

/**
 * portIndex(ポートインデックス)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function portIndex(state=initialState.portIndex, action){
    switch( action.type ) {
        
        case SET_RACK:
        case SET_UNITDISPSETTING:
        case SET_UNIT:
        case CLEAR_RACK:
            var key = action.isLeft ? 'left' : 'right';
            var portIndex = Object.assign({}, state);
            portIndex[key] = null;
            return portIndex;

        case SET_PORT:
            var key = action.isLeft ? 'left' : 'right';
            var portIndex = Object.assign({}, state);
            if (action.portIndex) {
                portIndex[key] = action.portIndex;
            } else {
                portIndex[key] = null;
            }
            return portIndex;

        case SET_PORT_INDEX:
            var key = action.isLeft ? 'left' : 'right';
            var portIndex = Object.assign({}, state);
            portIndex[key] = action.portIndex;
            return portIndex;

        default:
            return state;
    }
}

/**
 * canConnect(接続できるか)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function canConnect(state=initialState.canConnect, action){
    switch( action.type ) {
        case SET_RACK:
        case SET_UNITDISPSETTING:
        case CLEAR_RACK:
            var key = action.isLeft ? 'left' : 'right';
            var canConnect = Object.assign({}, state);
            canConnect[key] = false;
            return canConnect;

        case SET_UNIT:
        case SET_PORT:
        case SET_PORT_INDEX:
            var key = action.isLeft ? 'left' : 'right';
            var canConnect = Object.assign({}, state);
            canConnect[key] = action.canConnect;
            return canConnect;
        default:
            return state;
    }
}

/**
 * isEditMode(編集モードかどうか)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function isEditMode(state=initialState.isEditMode, action){
    switch( action.type ) {
        case SET_EDITMODE:
            return action.isEditMode;

        default:
            return state;
    }
}

/**
 * invalid(保存が無効かどうか)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function invalid(state=initialState.invalid, action){
    switch( action.type ) {

        case SET_EDITING_NETWORKPATH:
            const networkPath = action.networkPath;
            if (!networkPath || !networkPath.network) {
                //新規作成
                return { 
                    connect: true, 
                    network: true 
                };
            } else {
                //編集
                return { 
                    connect: networkPath.rackTo ? false : true, 
                    network: networkPath.network ? false : true 
                };
            }

        case CHANGE_NETWORK_INFO:
            return Object.assign({}, state, {
                network: action.invalid
            });

        case CHANGE_NETWORK_CONNECT:
            return Object.assign({}, state, {
                connect: false
            });
        
        case CLEAR_NETWORK_CONNECT:
            return Object.assign({}, state, {
                connect: true
            });
        
        case CLEAR_NETWORK_ONE_SIDE:
            return Object.assign({}, state, {
                connect: true
            });

        default:
            return state;
    }
}


//使用するReducerを列挙
const editInfo = combineReducers({
    dualRack,
    selectedUnitDispSetting,
    selectedUnit,
    selectedPort,
    portIndex,
    editingNetworkPath,
    isEditMode,
    invalid,
    canConnect
});

export default editInfo;
