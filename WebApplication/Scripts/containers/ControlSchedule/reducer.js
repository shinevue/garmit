/**
 * @license Copyright 2019 DENSO
 * 
 * ControlSchedulePanelのReducerを定義する。
 * ReducerはActionを受信してStateを更新する。
 * 
 */
'use strict';

import { combineReducers } from 'redux';
import { routerReducer, LOCATION_CHANGE } from 'react-router-redux';

import { SET_SCHEDULE_PLANS } from "./actions.js";
import { SET_SELECT, REMOVE_SELECT, CLEAR_SELECT, UPDATE_SELECT } from './actions.js';
import { SET_EDIT, CHANGE_SCHEDULE, CHANGE_SCHEDULE_COMMANDS, CHANGE_VALIDATE, CHANGE_INVALID_SCHEDULE, CLEAR_EDIT } from "./actions.js";
import { SET_USER_INFO, SET_LOCATIONS, SET_CONTROL_COMMANDS } from "./actions.js";

import isLoading from 'LoadState/reducer';
import modalState from 'ModalState/reducer';
import waitingInfo from 'WaitState/reducer';
import authentication from 'Authentication/reducer';

import { getMatchSchedule, getChanagedSchedule, validateSchedule, changeValidateSchedule, invalidSchedule } from 'controlScheduleUtility';

//Reducerの初期値を設定する。
const initialState = {
    schedulePlans: [],
    selectSchedules: [],
    editing: null,
    validate: {
        name: { state: null, helpText: null },
        enterprises: { state: null, helpText: null },
        startDateTime: { state: null, helpText: null },
        endDateTime: { state: null, helpText: null },
        operation: {
            startTime: { state: null, helpText: null },
            endTime: { state: null, helpText: null },
            week: { state: null, helpText: null },
            day: { state: null, helpText: null },
        },
        memo: { state: null, helpText: null }
    },
    invalid: {
        schedule: false,
        commands: false
    },
    locations: [],
    controlCommands: [],
    userInfo: {
        mainEnterprise: null,
        enterprises: []
    }
};


/**
 * スケジュール一覧（表示用）のReducer
 */
function schedulePlans(state=initialState.schedulePlans, action) {
    switch( action.type ) {
        case SET_SCHEDULE_PLANS:
            return action.data;

        default:
            return state;
    }
}

/**
 * 選択中スケジュール一覧のReducer
 */
function selectSchedules(state = initialState.selectSchedules, action) {

    switch (action.type) {

        case SET_SELECT:
            let add = _.cloneDeep(state);
            add.push(action.data);
            const sorted=_.sortBy(add, ['startDate', 'endDate', 'name']); //日付でソート
            return sorted;

        case REMOVE_SELECT:
            let remove = _.cloneDeep(state);
            _.remove(remove, (sch) => {
                return sch.controlScheduleId === action.scheduleId;
            })
            return remove;

        case UPDATE_SELECT:
            let update = [];
            state.forEach((sch) => {
                const match = getMatchSchedule(action.schedulePlans, sch.controlScheduleId);
                if (match) {
                    update.push(match);
                }
            })
            return update;

        case CLEAR_SELECT:
            return [];

        default:
            return state;
    }
}


/**
 * 編集中スケジュールのReducer
 */
function editing(state = initialState.editing, action) {

    switch (action.type) {

        case SET_EDIT:
            return action.data && _.cloneDeep(action.data);

        case CHANGE_SCHEDULE:
            return getChanagedSchedule(state, action.key, action.value);

        case CHANGE_SCHEDULE_COMMANDS:
            let update = _.cloneDeep(state);
            update.controlCommands = action.commands && _.cloneDeep(action.commands);   
            return update;

        case CLEAR_EDIT:
            return initialState.editing;

        default:
            return state;
    }
}

/**
 * 入力検証結果のReducer 
 */
function validate(state = initialState.validate, action) {

    switch (action.type) {

        case SET_EDIT:
            return action.data && validateSchedule(action.data);

        case CHANGE_VALIDATE:
            return changeValidateSchedule(state, action.key, action.schedule);

        case CLEAR_EDIT:
            return initialState.validate;

        default:
            return state;
    }
}

/**
 * 保存が無効かどうかのReducer
 */
function invalid(state = initialState.invalid, action) {

    switch (action.type) {

        case SET_EDIT:
            if (action.isRegister) {
                return { schedule: true, commands: true };
            } else {
                return { schedule: false, commands: false };        //編集時は保存できる
            }       

        case CHANGE_SCHEDULE_COMMANDS:
            var update = _.cloneDeep(state);
            update.commands = action.isError;
            return update;

        case CHANGE_INVALID_SCHEDULE:
            var update = _.cloneDeep(state);
            update.schedule = invalidSchedule(action.validate);
            return update;

        case CLEAR_EDIT:
            return initialState.invalid;

        default:
            return state;
    }
}

/**
 * userInfoのreducer
 */
function userInfo(state = initialState.userInfo, action) {

    switch (action.type) {

        case SET_USER_INFO:
            return {
                mainEnterprise: action.mainEnterprise && _.cloneDeep(action.mainEnterprise),
                enterprises: action.enterprises && _.cloneDeep(action.enterprises)
            };

        default:
            return state;
    }
}

/**
 * locationsのreducer
 */
function locations(state = initialState.locations, action) {

    switch (action.type) {

        case SET_LOCATIONS:
            return action.data ? _.cloneDeep(action.data) : [];

        default:
            return state;
    }
}

/**
 * controlCommandsのreducer
 */
function controlCommands(state = initialState.controlCommands, action) {

    switch (action.type) {

        case SET_CONTROL_COMMANDS:
            return action.data ? _.cloneDeep(action.data) : [];

        default:
            return state;
    }
}

//使用するReducerを列挙
const rootReducers = combineReducers({
    routing: routerReducer,
    schedulePlans,
    selectSchedules,
    editing,
    validate,
    invalid,
    userInfo,
    locations,
    controlCommands,
    modalState,
    isLoading,
    waitingInfo,
    authentication
});

export default rootReducers;
