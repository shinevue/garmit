/**
 * @license Copyright 2019 DENSO
 * 
 * ReportSchedulePanelのReducerを定義する。
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
import modalState from 'ModalState/reducer';
import waitingInfo from 'WaitState/reducer';
import isLoading from 'LoadState/reducer.js';

//Reducerで処理するAction名をインポートする。
//一覧画面で使用
import { SET_SELECTED_SCHEDULE_ID, CLEAR_SELECTED_SCHEDULE_ID } from './actions.js';
import { SET_OUTPUTFILE_RESULT, CLEAR_OUTPUTFILE_RESULT } from './actions.js';
import { SET_DELETE_SCHEDULEIDS, SET_DELETE_FILES, CLEAR_DELETE_FILES } from './actions.js';
import { CHANGE_SHOW_DOWNLOAD_MODAL } from './actions.js';
import { START_UPDATE, END_UPDATE } from './actions.js';

//編集画面で使用
import { SET_EDIT, CHANGE_SCHEDULE_OVERVIEW, CHANGE_SCHEDULE_CONDITION, CHANGE_SCHEDULE_OUTPUTINFO, CLEAR_EDIT } from './actions.js';
import { SET_ENTERPRISES } from './actions.js';

import { VALUE_TYPE, REPORT_OUTPUT_TYPE, OUTPUT_SUMMARY_TYPE } from 'constant';
import { omitReportScheduleCondtion, omitReportSchedule } from 'reportScheduleUtility';

//Reducerの初期値を設定する。
const initialState = {
    selectedScheduleId: null,
    reportOutputFileResult: null,
    showDownloadModal: false,
    deleteScheduleIds: [],
    deleteFileListInfo: {
        scheduleId: null,
        fileNos: []
    },
    enterprises: [],
    editReportSchedule: null,
    invalid: {
        overview: false,
        condition: false,
        output: false
    }
};

//#region Actionの処理を行うReducer（一覧画面）

/**
 * selectedScheduleIdのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function selectedScheduleId(state=initialState.selectedScheduleId, action) {
    switch( action.type ) {

        case SET_SELECTED_SCHEDULE_ID:
            return action.value;
            
        case CLEAR_SELECTED_SCHEDULE_ID:
        return initialState.selectedScheduleId;

        default:
            return state;
    }
}



/**
 * editReportScheduleのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function reportOutputFileResult(state=initialState.reportOutputFileResult, action) {
    switch( action.type ) {

        case SET_OUTPUTFILE_RESULT:
            return  Object.assign({}, state, action.value );

        case CLEAR_OUTPUTFILE_RESULT:
            return initialState.reportOutputFileResult;

        default:
            return state;
    }
}

/**
 * showDownloadModalのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function showDownloadModal(state=initialState.showDownloadModal, action) {
    switch( action.type ) {

        case CHANGE_SHOW_DOWNLOAD_MODAL:
            return action.show;

        default:
            return state;
    }
}


/**
 * deleteScheduleIdsのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function deleteScheduleIds (state=initialState.deleteScheduleIds, action) {
    switch( action.type ) {

        case SET_DELETE_SCHEDULEIDS:
            return action.value && _.cloneDeep(action.value);

        default:
            return state;
    }
    
}

/**
 * deleteFileListInfoのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function deleteFileListInfo (state=initialState.deleteFileListInfo, action) {
    switch( action.type ) {

        case SET_DELETE_FILES:
            return {
                scheduleId: action.scheduleId,
                fileNos: action.fileNos
            };

        case CLEAR_DELETE_FILES:
            return initialState.deleteFileListInfo;

        default:
            return state;
    }
    
}

/**
 * 更新中かどうかのReducer
 */
function updating(state = false, action) {
    switch (action.type) {

        case START_UPDATE:
            return true;

        case END_UPDATE:
            return false;

        default:
            return state;
    }
}

//#endregion

//#region Actionの処理を行うReducer（編集）

/**
 * enterprisesのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function enterprises (state=initialState.enterprises, action) {
    switch( action.type ) {
        case SET_ENTERPRISES:
            return action.value && _.cloneDeep(action.value);

        default:
            return state;
    }
}

/**
 * editReportScheduleのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function editReportSchedule(state=initialState.editReportSchedule, action) {
    switch( action.type ) {
        case SET_EDIT:
            return action.value && omitReportSchedule(action.value);

        case CHANGE_SCHEDULE_OVERVIEW:
            return getChnagedOverview(state, action.key, action.value);

        case CHANGE_SCHEDULE_OUTPUTINFO:
            return getChangedOutputInfo(state, action.key, action.value);

        case CHANGE_SCHEDULE_CONDITION:
            return omitReportScheduleCondtion(state, action.value);

        case CLEAR_EDIT:
        return initialState.editReportSchedule;

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
        case SET_EDIT:
            if (action.isRegister) {
                return { overview: true, condition: true, output: true };
            } else {
                return { overview: false, condition: false, output: false };
            }

        case CHANGE_SCHEDULE_OVERVIEW:
            return Object.assign({}, state, {
                overview: action.isError
            });

        case CHANGE_SCHEDULE_CONDITION:
            return Object.assign({}, state, {
                condition: action.isError
            });

        case CHANGE_SCHEDULE_OUTPUTINFO:
            return Object.assign({}, state, {
                output: action.isError
            });

        case CLEAR_EDIT:
            return initialState.invalid;

        default:
            return state;
    }
    
}

//#endregion

//#region その他関数

/**
 * スケジュール概要の変更を反映した情報を取得する
 * @param {object} before 変更前のデータ
 * @param {string} key キー
 * @param {*} value 変更後の値
 */
function getChnagedOverview(before, key, value) {
    let update = _.cloneDeep(before);
    if (key !== 'enterprise') {
        _.set(update, key, value);
    } else {
        _.set(update, 'enterpriseId', value&&value.enterpriseId);
        _.set(update, 'enterpriseName', value&&value.enterpriseName);
    }
    return update;
}

/**
 * 出力情報の変更を反映した情報を取得する
 * @param {object} before 変更前のデータ
 * @param {string} key キー
 * @param {*} value 変更後の値
 */
function getChangedOutputInfo(before, key, value) {
    let update = _.cloneDeep(before);
    _.set(update, key, value);
    switch (key) {
        case 'valueType':
            if (before.valueType !== value) {
                update = Object.assign({}, update, {
                    outputType: REPORT_OUTPUT_TYPE.daily,
                    outputStartDay: null,
                    outputEndDay:  null,
                    recordInterval: null,
                    summaryType: (value === VALUE_TYPE.summary) ? OUTPUT_SUMMARY_TYPE.max : null
                });
            }
            break;
        case 'outputType':
            if (before.outputType !== value) {
                update = Object.assign({}, update, {
                    outputStartDay: (parseInt(value) === REPORT_OUTPUT_TYPE.period) ? 1 : null,
                    outputEndDay:  (parseInt(value) === REPORT_OUTPUT_TYPE.period) ? 2 : null
                });
            }
            break;
    }
    return update;
}

//#endregion

//使用するReducerを列挙
const rootReducers = combineReducers({
    routing: routerReducer,
    authentication,
    waitingInfo,
    isLoading,
    modalState,
    selectedScheduleId,
    searchResult,               //スケジュール一覧
    reportOutputFileResult,     //出力ファイル一覧（SearchResult）
    showDownloadModal,          //出力ファイル一覧モーダルの表示状態
    editReportSchedule,         //編集するレポートスケジュール
    searchCondition,            //検索条件（編集時に必要）
    enterprises,                //ログインユーザーが所属する所属一覧
    deleteScheduleIds,          //削除するスケジュールID一覧
    deleteFileListInfo,         //削除するファイル情報一覧
    invalid,
    updating                    //スケジュール一覧が更新中かどうか   
});

export default rootReducers;
