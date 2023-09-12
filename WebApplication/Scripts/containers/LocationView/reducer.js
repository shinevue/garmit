/**
 * @license Copyright 2018 DENSO
 * 
 * RobotControlPanelのReducerを定義する。
 * ReducerはActionを受信してStateを更新する。
 * 
 * 注意点
 * ・引数で渡されたstateやactionそのものを変更してはいけません。
 * 　stateを変更するには、previousState を直接いじるのではなく、新しいオブジェクトを作成して返却します。
 * 
 */
'use strict';

import { combineReducers } from 'redux';
import { closeModalInfo } from 'messageModalUtility';
import authentication from 'Authentication/reducer.js';

//Reducerで処理するAction名をインポートする。
import {
    SET_LAYOUT_LIST,
    SET_LAYOUT_INFO,
    SET_CAMERA_LIST,
    SET_CAMERA_INFO,
    SET_CAMERA_HEIGHT,
    SET_CAMERA_MODE,
    SET_SETTING_LIST, SET_SETTING,
    CHANGE_LOAD_STATE,
    CHANGE_MODAL_STATE
} from './actions.js';

//Actionの処理を行うReducer
/**
 * layoutInfoのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function layoutInfo(state = {}, action) {
    switch (action.type) {

        case SET_LAYOUT_LIST:
            return _.set(_.cloneDeep(state), "layoutList", action.value);

        case SET_LAYOUT_INFO:
            return _.set(_.cloneDeep(state), "selectLayout", action.value);

        default:
            return state;
    }
}

/**
 * cameraInfoのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function cameraList(state=[], action) {
    switch( action.type ) {

        case SET_CAMERA_LIST:
            return action.value;

        default:
            return state;
    }
}

/**
 * selectCameraInfoのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function selectCamera(state = { id: null, cameraMode:null, height:null }, action) {
    switch (action.type) {

        case SET_CAMERA_INFO:
            if (action.value) {
                return Object.assign({}, action.value, { cameraMode: { main: "camera", sub: "front" } });
            }
            return { id: null, cameraMode: null, height: null };

        case SET_CAMERA_HEIGHT:
            return Object.assign({}, state, action.value, { height: action.value });

        case SET_CAMERA_MODE:
            return Object.assign({}, state, action.value, { cameraMode: action.value });

        default:
            return state;
    }
}

/**
 * settingのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function setting(state = [], action) {
    switch (action.type) {

        case SET_SETTING_LIST:
            return action.value;

        case SET_SETTING:
            const index = _.findIndex(state.setting, ['id', action.key]);
            return _.set(_.cloneDeep(state), [index, "value"], action.value);

        default:
            return state;
    }
}

/**
 * panelStateのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function panelState(state = { isLoading: false, modalState: closeModalInfo}, action) {
    switch (action.type) {

        case CHANGE_LOAD_STATE:
            return Object.assign({}, state, { isLoading: action.value });

        case CHANGE_MODAL_STATE:
            return Object.assign({}, state, { modalState: action.value });

        default:
            return state;
    }
}

//使用するReducerを列挙
const rootReducers = combineReducers({
    layoutInfo,
    authentication,
    cameraList,
    selectCamera,
    setting,
    panelState
});

export default rootReducers;
