/**
 * @license Copyright 2020 DENSO
 * 
 * Reducerを定義する。
 * ReducerはActionを受信してStateを更新する
 * 
 */
'use strict';

import { combineReducers } from 'redux';
import { routerReducer, LOCATION_CHANGE } from 'react-router-redux';

import { SET_SCHEDULES, SET_DISP_SCHEDULE_LIST } from './actions.js';
import { SET_SELECT, REMOVE_SELECT, CLEAR_SELECT, UPDATE_SELECT } from './actions.js';
import { SET_DISPSETTING } from './actions.js';

import isLoading from 'LoadState/reducer';
import modalState from 'ModalState/reducer';
import authentication from 'Authentication/reducer';

import { getMatchSchedule } from 'projectScheduleUtility';

//Reducerの初期値を設定する。
const initialState = {
    scheduleList: [],
    dispScheduleList: [],
    selectSchedules: [],
    dispSetting: {
        completeDate: true, 
        openDate: true, 
        closeDate: true, 
        opserveDate: true
    }
};

/**
 * スケジュール一覧のReducer
 */
function scheduleList(state=initialState.scheduleList, action) {
    switch( action.type ) {
        case SET_SCHEDULES:
            return action.data ? _.cloneDeep(action.data) : [];

        default:
            return state;
    }
}

/**
 * 表示用スケジュール一覧のReducer
 */
function dispScheduleList(state=initialState.dispScheduleList, action) {
    switch( action.type ) {
        case SET_DISP_SCHEDULE_LIST:
            return action.data ? _.cloneDeep(action.data) : [];

        default:
            return state;
    }
}

/**
 * 選択中スケジュール一覧のReducer
 */
function selectSchedules(state=initialState.selectSchedules, action) {

    switch (action.type) {

        case SET_SELECT:
            let add = _.cloneDeep(state);
            add.push(_.cloneDeep(action.schedule));
            const sorted=_.sortBy(add, ['scheduleDate', 'projectNo', 'scheduleType']); //日付でソート
            return sorted;

        case REMOVE_SELECT:
            let remove = _.cloneDeep(state);
            _.remove(remove, (sch) => {
                return sch.projectId === action.schedule.projectId && sch.scheduleType === action.schedule.scheduleType;
            })
            return remove;

        case UPDATE_SELECT:
            let update = [];            
            state.forEach((sch) => {
                let updateSchedule = _.cloneDeep(sch);
                const match = getMatchSchedule(action.schedules, sch.projectId, sch.scheduleType);
                if (match) {
                    updateSchedule = match;
                }
                if (action.dispScheduleTypes.indexOf(updateSchedule.scheduleType) >= 0) {
                    update.push(updateSchedule);
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
 * 表示設定のreducer
 */
function dispSetting(state = initialState.dispSetting, action) {

    switch (action.type) {

        case SET_DISPSETTING:
            return _.cloneDeep(action.dispSetting);

        default:
            return state;
    }
}

//Sabdboxで使用するReducerを列挙
const rootReducers = combineReducers({
    scheduleList,
    dispScheduleList,
    selectSchedules,
    dispSetting,
    modalState,
    isLoading,
    routing: routerReducer,
    authentication
});

export default rootReducers;

