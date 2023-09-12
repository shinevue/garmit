/**
 * @license Copyright 2017 DENSO
 * 
 * Action(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 */
'use strict';

export const SET_LOAD_STATE = 'SET_LOAD_STATE';
export const SET_IMPORT_TYPE = 'SET_IMPORT_TYPE';
export const SET_SEARCH_DISABLED = 'SET_SEARCH_DISABLED';
export const SET_EXPORT_SET = 'SET_EXPORT_SET';
export const SET_PREV_EXPORT_SET = 'SET_PREV_EXPORT_SET';
export const SET_EXPORT_TYPES = 'SET_EXPORT_TYPES';
export const SET_FORMAT_ONLY = 'SET_FORMAT_ONLY';


export function setLoadState(isLoading) {
    return { type: SET_LOAD_STATE, value: isLoading };
}

export function setImportType(type) {
    return { type: SET_IMPORT_TYPE, value: type };
}

export function setSearchDisabled(disabled, importType) {
    return { type: SET_SEARCH_DISABLED, value: disabled, importType };
}

export function setExportSet(exportSet) {
    return { type: SET_EXPORT_SET, value: exportSet };
}

export function setPrevExportSet(exportSet) {
    return { type: SET_PREV_EXPORT_SET, value: exportSet };
}

export function setExportTypes(exportTypes) {
    return { type: SET_EXPORT_TYPES, value: exportTypes };
}

export function setFormatOnly(isFormatOnly) {
    return { type: SET_FORMAT_ONLY, value: isFormatOnly };
}