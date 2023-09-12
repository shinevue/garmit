/**
 * @license Copyright 2017 DENSO
 * 
 * ReportDataPanelのReducerを定義する。
 * ReducerはActionを受信してStateを更新する。
 * 
 * 注意点
 * ・引数で渡されたstateやactionそのものを変更してはいけません。
 * 　stateを変更するには、previousState を直接いじるのではなく、新しいオブジェクトを作成して返却します。
 * 
 */
'use strict';

import { combineReducers } from 'redux';

import authentication from 'Authentication/reducer.js';

import { validateDate } from 'inputCheck';
import { omitDataReport } from 'makeOmitData';

//Reducerで処理するAction名をインポートする。
import {
    SET_INIT_LOOKUP,
    SET_LOGIN_USER,
    SET_MDATA_TYPE,
    SET_DATE,
    SET_SUMMARY_TYPE,
    SET_REPORT_TYPE,
    SET_REPORT_INTERVAL,
    SET_SEARCH_RESULT,
    SET_REFINE,
    SET_CSV_FILENAME,
    SET_SEARCH_CONDITION,
    SET_IS_CONVERT
} from './actions.js';

import { MDATA_TYPE_OPTIONS, DATE_TIME_FORMAT, SUMMARY_TYPE, REPORT_TYPE_OPTIONS, EXPORT_SPAN } from 'constant';


//初期化時の条件
const initCondition = {
    measuredDataType: MDATA_TYPE_OPTIONS.realTime,
    startDate: moment().startOf('day'),            //開始時刻
    endDate: null,              //終了時刻
    showEnd: false,             //終了時刻フォームを表示するかどうか
    summaryType: SUMMARY_TYPE.max.toString(),
    reportType: REPORT_TYPE_OPTIONS.daily.value,
    reportInterval: EXPORT_SPAN.none.value,
    format: DATE_TIME_FORMAT.date,   //画面のみで使用する
    isConvert: false
}

//バリデーション情報の初期状態
const initValidation = {
    canSearch: true,
    startDate: getValidateDate(initCondition.startDate, initCondition.format)
}

//期間条件の最大の差分（単位：秒）
const MAX_DIFF_DATECONDITION = 86400

//Actionの処理を行うReducer

/**
 * initLookUpのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function initLookUp(state=null, action) {
    switch( action.type ) {

        case SET_INIT_LOOKUP:
            return action.value;

        default:
            return state;
    }
}

/**
 * loginUserのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function loginUser(state=null, action) {
    switch( action.type ) {

        case SET_LOGIN_USER:
            return action.value;

        default:
            return state;
    }
}

/**
 * conditionのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function condition(state = initCondition, action) {
    switch (action.type) {

        case SET_MDATA_TYPE:
            return Object.assign({}, initCondition, { measuredDataType: action.value, startDate: moment().startOf('day') });

        case SET_DATE:
            return Object.assign({}, state, { startDate: action.start, endDate:action.end, showEnd:action.showEnd });

        case SET_SUMMARY_TYPE:
            return Object.assign({}, state, { summaryType: action.value });

        case SET_REPORT_TYPE:
            return Object.assign({}, state, { reportType: action.reportType, format: action.format, startDate:action.start, endDate: action.end, showEnd:action.showEnd });

        case SET_REPORT_INTERVAL:
            return Object.assign({}, state, { reportInterval: action.value });

        case SET_IS_CONVERT:
            return Object.assign({}, state, { isConvert: action.value });
        
        default:
            return state;
    }
}

/**
 * searchResultのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function searchResult(state = null, action) {
    switch (action.type) {

        case SET_SEARCH_RESULT:
            return omitDataReport(action.value.reportResult);

        default:
            return state;
    }
}

/**
 * displayInfoのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function displayInfo(state = null, action) {
    switch (action.type) {

        case SET_REFINE:
            return action.value;

        default:
            return state;
    }
}

/**
 * validationのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function validation(state = initValidation, action) {
    switch (action.type) {
        case SET_MDATA_TYPE:
            return Object.assign({}, initValidation);

        case SET_REPORT_TYPE:
        case SET_DATE:
            //入力チェックを実施            
            return Object.assign({}, state, getValidateDateInfo(action.start, action.end, action.format, action.showEnd, action.isRealTime));

        default:
            return state;
    }
}

/**
 * CSV出力ファイル名称を取得
 */
function csvFileName(state = null, action) {
    switch (action.type) {
        case SET_CSV_FILENAME:
            return action.value;

        default:
            return state;
    }
}

/**
 * 検索条件を取得
 */
function searchCondition(state = null, action) {
    switch (action.type) {
        case SET_SEARCH_CONDITION:
            return action.value;

        default:
            return state;
    }
}

//使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    initLookUp,
    loginUser,
    condition,
    searchResult,
    displayInfo,
    validation,
    csvFileName,
    searchCondition
});

export default rootReducers;


//#region 入力チェック関連
/**
 * バリデート情報取得
 */
function getValidateDateInfo(start, end, format, showEnd, isRealTime) {
    const startValidation = getValidateDate(start, format);
    const endValidation = showEnd ? getValidateDateEnd(end, format, startValidation.state === "success" && start, isRealTime) : { state: "success" };
    const canSearch = endValidation.state === "success" && startValidation.state === "success" ? true : false;
    return {
        startDate: startValidation,
        endDate: endValidation,
        canSearch: canSearch
    };
}

/**
 * 日時情報の入力チェックを取得
 */
function getValidateDate(date, format) {
    return validateDate(date, format, false);
}

/**
 * 終了日時情報の入力チェックを取得
 */
function getValidateDateEnd(endDate, format, startDate, isRealTime) {
    let validation = validateDate(endDate, format, false);    
    if (startDate && validation.state === "success") { 
        if (startDate >= endDate) {
            return { state: "error", helpText: "終了日時は開始日時以降となるように設定してください。" };
        } else if (isRealTime && endDate.diff(startDate, 'seconds', true) > MAX_DIFF_DATECONDITION) {
            return { state: "error", helpText: "期間は最大24時間となるように設定してください。" };
        }
    }
    return validation;
}
//#endregion
