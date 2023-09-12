/**
 * @license Copyright 2019 DENSO
 * 
 * ControlSettingPanelのReducerを定義する。
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
import { SET_COMMAND_STATUSES } from './actions.js';
import { SET_CONTROL_CONDITION, SET_EDIT_CONTROL_CONDITION, SET_EDIT_CONDITION_MODE, SET_EDIT_CONDITION_STATUS, CLEAR_EDIT_CONDITION_STATUS } from './actions.js';
import { SET_DELETE_CONTROLIDS } from './actions.js'
import { SET_CONTROL_COMMANDS, SET_TRIGGER_CONTROLS } from './actions.js';
import { CHANGE_CONTROL_COMMANDS, CHANGE_TRIGGER_CONTROLS, CHANGE_CONTROL_OPERATIONS, CLEAR_EDIT } from './actions.js';
import { CHANGE_BULK_CONTROL_COMMAND, CHANGE_BULK_TRIGGER_CONTROL } from './actions.js';
import { SET_LOCATION_COMMANDS, SET_TRIGGER_TYPES, SET_DEMAND_SET, SET_THRESHOLDS, SET_CHNAGE_DEMANDSET_FLG } from './actions.js';

import { CONTROL_MODE } from 'constant';
import { VALIDATE_STATE, validateMultiSelect } from 'inputCheck';
import { PULSE_SET , OUTPUT_VALUE, getChnagedControlCommands, getChnagedTriggerControls } from 'controlSettingUtility';

//Reducerの初期値を設定する。
const initialState = {
    commandStatuses: [],
    controlCondition: { 
        mode: CONTROL_MODE.command,
        statuses: []
    },
    editControlCondition: {
        mode: CONTROL_MODE.command,
        statuses: [],
        validateStatus: {
            state: VALIDATE_STATE.success,
            helpText: ''
        }
    },
    triggerTypes: [],
    editMode: CONTROL_MODE.command,
    editControlCommands: null,
    editTriggerControls: null,
    editTriggerControlOperations: null,
    editBulkKeys: [],
    bulkControlCommand: {
        pulseSet: PULSE_SET.oneShot,
        pulseWidth: 1,
        output: OUTPUT_VALUE.on
    },
    bulkTriggerControl: {
        blindTime: null
    },
    deleteControlIds: [],
    controlOperations: null,
    controlLocations: null,
    demandSet: null,
    thresholds: null,
    invalid: {
        controlCommnand: false,
        triggerControl: false,
        triggerControlOperations: false
    },
    isChangeDemandSet: false
};

//Actionの処理を行うReducer

//#region 一覧画面用

/**
 * 制御コマンドのステータスの選択肢（マスタ）
 * @param {*} state 
 * @param {*} action 
 */
function commandStatuses(state=initialState.commandStatuses, action) {
    switch( action.type ) {

        case SET_COMMAND_STATUSES:
            return action.statuses &&  _.cloneDeep(action.statuses);

        default:
            return state;
    }
}

/**
 * 検索時の制御用検索条件
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function controlCondition(state=initialState.controlCondition, action) {
    switch( action.type ) {

        case SET_CONTROL_CONDITION:
            return action.condition && Object.assign({}, state, action.condition );

        case SET_COMMAND_STATUSES:
            return setStatusCondition(action.statuses, state);

        default:
            return state;
    }
}

/**
 * 編集中の制御用検索条件
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function editControlCondition(state=initialState.editControlCondition, action) {
    switch( action.type ) {

        case SET_COMMAND_STATUSES:
            return setStatusCondition(action.statuses, state);

        case SET_EDIT_CONTROL_CONDITION:
            return action.condition &&  Object.assign({}, state, action.condition );

        case SET_EDIT_CONDITION_MODE:
            var allStatuses = getStatusesKeys(action.statuses);
            return Object.assign({}, state, { 
                mode: action.mode, 
                statuses: allStatuses || state.statuses,
                validateStatus: allStatuses ? validateMultiSelect(allStatuses) : validateMultiSelect(state.statuses) 
            });
        
        case SET_EDIT_CONDITION_STATUS:
            return Object.assign({}, state, { 
                statuses: action.statuses, 
                validateStatus: validateMultiSelect(action.statuses) 
            });

        case CLEAR_EDIT_CONDITION_STATUS:
            var allStatuses = getStatusesKeys(action.statuses);
            return  Object.assign({}, state, { 
                statuses: allStatuses || state.statuses,
                validateStatus: allStatuses ? validateMultiSelect(allStatuses) : validateMultiSelect(state.statuses) 
            });

        default:
            return state;
    }
}

/**
 * deleteControlIdsのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function deleteControlIds(state=initialState.deleteControlIds, action) {
    switch( action.type ) {
        case SET_DELETE_CONTROLIDS:
            return action.ids ? _.cloneDeep(action.ids) : initialState.deleteControlIds;

        default:
            return state;
    }
}

//#endregion

//#region 編集画面用

/**
 * 編集中の制御コマンド情報
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function editMode(state=initialState.editMode, action) {
    switch( action.type ) {

        case SET_CONTROL_COMMANDS:
            return CONTROL_MODE.command;

        case SET_TRIGGER_CONTROLS:
            return CONTROL_MODE.trigger;
            
        case CLEAR_EDIT:
            return initialState.editMode;

        default:
            return state;
    }
}

/**
 * 編集中の制御コマンド情報
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function editControlCommands(state=initialState.editControlCommands, action) {
    switch( action.type ) {

        case SET_CONTROL_COMMANDS:
            return action.data && _.cloneDeep(action.data);

        case CHANGE_CONTROL_COMMANDS:
            return getChnagedControlCommands(state, action.key, action.value);
            
        case CLEAR_EDIT:
            return initialState.editControlCommands;

        default:
            return state;
    }
}

/**
 * 編集中のトリガー制御情報
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function editTriggerControls(state=initialState.editTriggerControls, action) {
    switch( action.type ) {

        case SET_TRIGGER_CONTROLS:
            return action.data && _.cloneDeep(action.data);

        case CHANGE_TRIGGER_CONTROLS:
            return getChnagedTriggerControls(state, action.key, action.value);
            
        case CLEAR_EDIT:
            return initialState.editTriggerControls;

        default:
            return state;
    }
}
 
/**
 * トリガー制御の実行制御一覧（複数トリガーの一括編集時はnull）
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function editTriggerControlOperations(state=initialState.editTriggerControlOperations, action) {
    switch( action.type ) {

        case SET_TRIGGER_CONTROLS:
            return action.controls && _.cloneDeep(action.controls);
            
        case CHANGE_CONTROL_OPERATIONS:
            return action.value ? _.cloneDeep(action.value) : [];

        case CLEAR_EDIT:
            return initialState.editTriggerControlOperations;

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
        case SET_CONTROL_COMMANDS:
        case SET_TRIGGER_CONTROLS:
        case CLEAR_EDIT:
            return initialState.editBulkKeys;

        case CHANGE_BULK_CONTROL_COMMAND:
        case CHANGE_BULK_TRIGGER_CONTROL:
            return action.keys && action.keys.concat();
            
        default:
            return state;
    }
}

/**
 * 一括編集用制御コマンド情報
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function bulkControlCommand(state=initialState.bulkControlCommand, action) {
    switch( action.type ) {
        case SET_CONTROL_COMMANDS:
        case SET_TRIGGER_CONTROLS:
        case CLEAR_EDIT:
            return _.cloneDeep(initialState.bulkControlCommand);

        case CHANGE_BULK_CONTROL_COMMAND:
            return action.value && Object.assign(state, {}, action.value);
            
        default:
            return state;
    }
}

/**
 * 一括編集用制御コマンド情報
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function bulkTriggerControl(state=initialState.bulkTriggerControl, action) {
    switch( action.type ) {
        case SET_CONTROL_COMMANDS:
        case SET_TRIGGER_CONTROLS:
        case CLEAR_EDIT:
            return _.cloneDeep(initialState.bulkTriggerControl);

        case CHANGE_BULK_TRIGGER_CONTROL:
            return action.value && Object.assign(state, {}, action.value);
            
        default:
            return state;
    }
}

/**
 * トリガー制御の実行制御一覧の選択肢（マスタ）
 * @param {*} state 
 * @param {*} action 
 */
function controlOperations(state=initialState.controlOperations, action) {
    switch( action.type ) {

        case SET_LOCATION_COMMANDS:
            return action.commands ? _.cloneDeep(action.commands) : [];

        case CLEAR_EDIT:
            return initialState.controlOperations;

        default:
            return state;
    }
}

/**
 * トリガー制御の実行制御のロケーションの選択肢（マスタ）
 * @param {*} state 
 * @param {*} action 
 */
function triggerTypes(state=initialState.triggerTypes, action) {
    switch( action.type ) {

        case SET_TRIGGER_TYPES:
            return action.types &&  _.cloneDeep(action.types);

        default:
            return state;
    }
}

/**
 * トリガー制御の実行制御のロケーションの選択肢（マスタ）
 * @param {*} state 
 * @param {*} action 
 */
function controlLocations(state=initialState.controlLocations, action) {
    switch( action.type ) {

        case SET_LOCATION_COMMANDS:
            return action.locations ? _.cloneDeep(action.locations) : [];

        case CLEAR_EDIT:
            return initialState.controlLocations;

        default:
            return state;
    }
}

/**
 * デマンド設定情報（マスタ）
 * @param {*} state 
 * @param {*} action 
 */
function demandSet(state=initialState.demandSet, action) {
    switch( action.type ) {

        case SET_DEMAND_SET:
            return action.demandSet && _.cloneDeep(action.demandSet);

        case CLEAR_EDIT:
            return initialState.demandSet;
        default:
            return state;
    }
    
}

/**
 * 閾値情報（マスタ）
 * @param {*} state 
 * @param {*} action 
 */
function thresholds(state=initialState.thresholds, action) {
    switch( action.type ) {

        case SET_THRESHOLDS:
            return action.thresholds && _.cloneDeep(action.thresholds);

        case CLEAR_EDIT:
            return initialState.thresholds;
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
        case SET_CONTROL_COMMANDS:
            return { controlCommnand: action.isRegister || (action.data && action.data.length > 1), triggerControl: false, triggerControlOperations: false };

        case SET_TRIGGER_CONTROLS:
            return { controlCommnand: false, triggerControl: action.isRegister || (action.data && action.data.length > 1), triggerControlOperations: false };

        case CHANGE_CONTROL_COMMANDS:
        case CHANGE_BULK_CONTROL_COMMAND:
            return Object.assign({}, state, {
                controlCommnand: action.isError
            });
        
        case CHANGE_TRIGGER_CONTROLS:
        case CHANGE_BULK_TRIGGER_CONTROL:
            return Object.assign({}, state, {
                triggerControl: action.isError
            });

        case CHANGE_CONTROL_OPERATIONS:
            return Object.assign({}, state, {
                triggerControlOperations: action.isError
            });

        case CLEAR_EDIT:
            return initialState.invalid;

        default:
            return state;
    }
    
}

/**
 * isChangeDemandSetのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function isChangeDemandSet(state=initialState.isChangeDemandSet, action) {
    switch( action.type ) {
        case SET_CHNAGE_DEMANDSET_FLG:
            return action.isChanged;

        default:
            return state;
    }
}

//#endregion

//#region その他関数

/**
 * ステータスの検索条件をセットする
 * @param {*} commandStatuses 全ステータス連想配列
 * @param {*} beforeCondition 更新前の検索条件
 */
function setStatusCondition(commandStatuses, beforeCondition) {
    return commandStatuses ? Object.assign({}, beforeCondition, {
        statuses: getStatusesKeys(commandStatuses)
    }):
    beforeCondition;
}

/**
 * ステータスのキーリストを取得する
 * @param {*} statuses ステータス連想配列
 */
function getStatusesKeys(statuses) {
    return statuses && Object.keys(statuses); 
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
    searchResult,
    commandStatuses,
    controlCondition,
    triggerTypes,
    editMode,
    editControlCondition,
    editControlCommands,
    editTriggerControls,
    editTriggerControlOperations,
    editBulkKeys,
    bulkControlCommand,
    bulkTriggerControl,
    deleteControlIds,
    controlOperations,
    controlLocations,
    demandSet, 
    thresholds,
    invalid,
    isChangeDemandSet
});

export default rootReducers;
