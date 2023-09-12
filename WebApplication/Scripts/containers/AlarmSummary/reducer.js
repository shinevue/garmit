/**
 * @license Copyright 2018 DENSO
 * 
 * アラームサマリのReducerを定義する。
 * ReducerはActionを受信してStateを更新する。
 * 
 * 注意点
 * ・引数で渡されたstateやactionそのものを変更してはいけません。
 * 　stateを変更するには、previousState を直接いじるのではなく、新しいオブジェクトを作成して返却します。
 * 
 */
'use strict';

import { combineReducers } from 'redux';

//Reducerで処理するAction名をインポートする。
import { SET_ALARM_SUMMARY } from './actions.js';

//Reducerの初期値を設定する。
const initialState = {
    errorCountItem: { alarmCount: 0 },
    warnCountItem: { alarmCount: 0 },
    systemErrorCountItem: { alarmCount: 0 },
    occuringAlarmToastItems: [],
    isAllowIncidentLog: false
};

/********************************************
 * Actionの処理を行うReducer
 ********************************************/

/**
 * 異常個数を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function errorCountItem(state=initialState.errorCountItem, action) {
    switch( action.type ) {

        case SET_ALARM_SUMMARY:
            return Object.assign({}, state, action.value.errorCountItem );

        default:
            return state;
    }
}

/**
 * 注意個数を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function warnCountItem(state=initialState.warnCountItem, action) {
    switch( action.type ) {

        case SET_ALARM_SUMMARY:
            return Object.assign({}, state, action.value.warnCountItem );

        default:
            return state;
    }
}

/**
 * システムエラー個数を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function systemErrorCountItem(state=initialState.systemErrorCountItem, action) {
    switch( action.type ) {

        case SET_ALARM_SUMMARY:
            return Object.assign({}, state, action.value.systemErrorCountItem );

        default:
            return state;
    }
}

/**
 * 発生中アラームパネル情報を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function occuringAlarmToastItems(state=initialState.occuringAlarmToastItems, action) {
    switch( action.type ) {

        case SET_ALARM_SUMMARY:
            return action.value.occuringAlarmToastItems ? _.cloneDeep(action.value.occuringAlarmToastItems) : [];

        default:
            return state;
    }
}

/**
 * インシデントログの権限があるかどうかを更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function isAllowIncidentLog(state=initialState.isAllowIncidentLog, action) {
    switch( action.type ) {

        case SET_ALARM_SUMMARY:
            return action.value.isAllowIncidentLog ? action.value.isAllowIncidentLog : false;

        default:
            return state;
    }    
}

//使用するReducerを列挙
const alarmSummary = combineReducers({
    errorCountItem,
    warnCountItem,
    systemErrorCountItem,
    occuringAlarmToastItems,
    isAllowIncidentLog
});

export default alarmSummary;
