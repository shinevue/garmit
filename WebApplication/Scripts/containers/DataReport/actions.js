/**
 * @license Copyright 2017 DENSO
 * 
 * ReportDataPanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

//Action名の定義
export const SET_INIT_LOOKUP     = 'SET_INIT_LOOKUP     ';
export const SET_LOGIN_USER      = 'SET_LOGIN_USER';
export const SET_MDATA_TYPE      = 'SET_MDATA_TYPE      ';  
export const SET_DATE            = 'SET_DATE            ';  
export const SET_GROUP_RACK      = 'SET_GROUP_RACK      ';  
export const SET_SUMMARY_TYPE    = 'SET_SUMMARY_TYPE    ';   
export const SET_REPORT_TYPE     = 'SET_REPORT_TYPE     ';
export const SET_REPORT_INTERVAL = 'SET_REPORT_INTERVAL ';
export const SET_SEARCH_RESULT   = 'SET_SEARCH_RESULT   ';   
export const SET_REFINE          = 'SET_REFINE          ';  
export const SET_CSV_FILENAME    = 'SET_CSV_FILENAME    ';
export const SET_SEARCH_CONDITION = 'SET_SEARCH_CONDITION';
export const SET_IS_CONVERT      =  'SET_IS_CONVERT';

//ActionCenter

/**
 * 初期表示ルックアップ情報
 * @param {*} data
 */
export function setInitLookUp(data) {
    return { type: SET_INIT_LOOKUP, value:data };
}

/**
 * ログインユーザー情報
 * @param {*} loginUser
 */
export function setLoginUser(loginUser) {
    return { type: SET_LOGIN_USER, value:loginUser };
}

/**
 * 検索条件（計測値種別）
 * @param {*} data
 */
export function setMDataType(data) {
    return { type: SET_MDATA_TYPE, value: data };
}

/**
 * 検索条件（日時）
 * @param {*} data
 */
export function setDate(data) {
    return { type: SET_DATE, start: data.start, end: data.end, format: data.format, showEnd: data.showEnd, isRealTime: data.isRealTime };
}

/**
 * 検索条件（ラックごとにまとめるか）
 * @param {*} data
 */
export function setGroupRack(data) {
    return { type: SET_GROUP_RACK, value: data };
}

/**
 * 検索条件（積算種別）
 * @param {*} data
 */
export function setSummaryType(data) {
    return { type: SET_SUMMARY_TYPE, value: data };
}

/**
 * 検索条件（レポート種別）
 * @param {*} data
 */
export function setReportType(data) {
    return { type: SET_REPORT_TYPE, reportType: data.type, format: data.format, start: data.start, end: data.end, showEnd: data.showEnd };
}

/**
 * 検索条件（レポート間隔種別）
 * @param {*} data
 */
export function setReportInterval(data) {
    return { type: SET_REPORT_INTERVAL, value: data };
}

/**
 * 検索結果
 * @param {*} data
 */
export function setSearchResult(data) {
    return { type: SET_SEARCH_RESULT, value: data };
}

/**
 * 絞り込み状態
 * @param {*} data
 */
export function setRefine(data) {
    return { type: SET_REFINE, value: data };
}

/**
 * CSV出力ファイル名称
 * @param {*} name
 */
export function setCsvFileName(data) {
    return { type: SET_CSV_FILENAME, value: data };
}

/**
 * 表示中検索結果の検索条件
 * @param {*} name
 */
export function setSearchCondition(data) {
    return { type: SET_SEARCH_CONDITION, value: data };
}

/**
 * 検索条件（換算する）
 * @param {*} isConvert 換算するかどうか
 */
export function setIsConvert(isConvert) {
    return { type: SET_IS_CONVERT, value: isConvert };
}