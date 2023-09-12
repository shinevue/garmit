/**
 * @license Copyright 2017 DENSO
 * 
 * XxxPanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

//Action名の定義

export const SET_DISPLAY_STATE = 'SET_DISPLAY_STATE';
export const SET_SEARCH_RESULT = 'SET_SEARCH_RESULT';


//ActionCenter

/**
 * データテーブルの表示設定をセットする
 * @param {object} displayState
 */
export function setDisplayState(displayState) {
    return { type: SET_DISPLAY_STATE, value: displayState };
}

/**
 * 検索結果をセットする
 * @param {object} searchResult
 */
export function setSearchResult(searchResult) {
    return { type: SET_SEARCH_RESULT, value: searchResult };
}