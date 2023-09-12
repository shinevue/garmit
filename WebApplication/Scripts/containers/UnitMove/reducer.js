/**
 * @license Copyright 2017 DENSO
 * 
 * UnitMovePanelのReducerを定義する。
 * ReducerはActionを受信してStateを更新する。
 * 
 * 注意点
 * ・引数で渡されたstateやactionそのものを変更してはいけません。
 * 　stateを変更するには、previousState を直接いじるのではなく、新しいオブジェクトを作成して返却します。
 * 
 */
'use strict';

import { combineReducers } from 'redux';

import dualRack from 'DualRack/reducer.js';
import authentication from 'Authentication/reducer.js';
import waitingInfo from 'WaitState/reducer.js';

//Reducerで処理するAction名をインポートする。
import { SET_LOCATIONS, SET_LAYOUTS, SET_MOVING_INFO, SET_TARGET_POSITION  } from './actions.js';
import { CLEAR_MOVING_INFO, CLEAR_TARGET_INFO } from './actions.js';
import { UNITSELECT_MODAL_STATE, COMPLETED_MODAL_STATE, MESSAGE_MODAL_STATE } from './actions.js'
import { SET_LOADSTATE, CHANGE_MODE } from './actions.js';

//Reducerの初期値を設定する。
const initialState = {
    locations: [],
    layouts: [],
    movingInfo: {
        unitDispSetting: null,
        rack: null,
        isLeft: true
    },
    targetInfo: {
        rack: null,
        dispSetId: null,
        position: null,
        isLeft: false
    },
    isLoading: false,
    modalInfo: {
        unitSelect: {
            show: false
        },
        saveCompleted: {
            show: false,
            locationId: null,
            dispSetId: null
        },
        message: {
            show: false,
            title: '',
            message: '',
            attenstion: ''
        }
    },
    mode: 1
};

/********************************************
 * Actionの処理を行うReducer
 ********************************************/

/**
 * locations(ロケーションリスト)のReducer
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @return {object} 更新後のstate
 */
function locations(state=initialState.locations, action) {
    switch( action.type ) {

        case SET_LOCATIONS:
            return  Object.assign([], state, action.locations );

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
 * movingInfo(移動元情報)のReducer
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @return {object} 更新後のstate
 */
function movingInfo(state=initialState.movingInfo, action) {
    switch( action.type ) {

        case SET_MOVING_INFO:
            return  Object.assign({}, state, {
                unitDispSetting: Object.assign({}, action.dispSetting),
                rack: Object.assign({}, action.sourceRack),
                isLeft: !action.isLeftDirection
            });

        case CLEAR_MOVING_INFO:
        case CHANGE_MODE:
            return initialState.movingInfo;

        default:
            return state;
    }
}

/**
 * targetInfo(移動対象情報)のReducer
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @return {object} 更新後のstate
 */
function targetInfo(state=initialState.targetInfo, action) {
    switch( action.type ) {

        case SET_MOVING_INFO:
            return Object.assign({}, state, {
                rack: Object.assign({}, action.targetRack),
                dispSetId: null,
                position: null,
                isLeft: action.isLeftDirection
            });
            
        case SET_TARGET_POSITION:
            return  Object.assign({}, state, {
                dispSetId: action.dispSetId,
                position: action.position
            });

        case CLEAR_TARGET_INFO:
        case CLEAR_MOVING_INFO:
        case CHANGE_MODE:
            return initialState.targetInfo;

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

        case UNITSELECT_MODAL_STATE: 
            return Object.assign({}, state, {
                unitSelect: {
                    show: action.value
                }
            });

        case COMPLETED_MODAL_STATE:
            return Object.assign({}, state, {
                saveCompleted: {
                    show: action.value,
                    locationId: action.locationId,
                    dispSetId: action.dispSetId
                }
            });

        case MESSAGE_MODAL_STATE:
            return Object.assign({}, state, {
                message: {
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

function mode(state=initialState.mode, action) {
    switch( action.type ) {

        case CHANGE_MODE: 
            return action.mode;

        default:
            return state;
    }

}

//使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    dualRack,
    locations,
    layouts,
    movingInfo,
    targetInfo,
    isLoading,
    modalInfo,
    mode,
    waitingInfo
});

export default rootReducers;
