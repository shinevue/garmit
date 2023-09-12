/**
 * @license Copyright 2017 DENSO
 * 
 * SearchConditionのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

//Action名の定義
export const SET_LOOKUP = 'SET_LOOKUP';
export const CLEAR_LOOKUP = 'CLEAR_LOOKUP';
export const SET_SEARCH_CONDITION = 'SET_SEARCH_CONDITION';
export const SET_EDITING_CONDITION = 'SET_EDITING_CONDITION';
export const SET_CONDITION_LIST = 'SET_CONDITION_LIST';
export const SET_ICCARD_TYPE = 'SET_ICCARD_TYPE';

export const REQUEST_CONDITION_LIST = 'REQUEST_CONDITION_LIST';

//ActionCenter

/**
 * 検索条件のマスタデータをセットする
 * @param {any} lookUp
 */
export function setLookUp(lookUp) {
    return { type: SET_LOOKUP, value: lookUp };
}

/**
 * 検索条件のマスタデータをクリアする
 */
export function clearLookUp() {
    return { type: CLEAR_LOOKUP };
}

/**
 * 検索条件をセットする
 * @param {any} searchCondition 検索条件
 */
export function setSearchCondition(searchCondition) {
    return { type: SET_SEARCH_CONDITION, value: searchCondition };
}

/**
 * 編集中の検索条件をセットする
 * @param {any} searchCondition 検索条件
 */
export function setEditingCondition(searchCondition) {
    return { type: SET_EDITING_CONDITION, value: searchCondition };
}

/**
 * 登録済み検索条件リストをセットする
 * @param {array} conditionList 検索条件リスト
 * @returns 
 */
export function setConditionList(conditionList) {
    return { type: SET_CONDITION_LIST, value: conditionList }
}

/**
 * 登録済み検索条件一覧を取得する
 * @param {number} functionId 機能番号
 */
export function requestConditionList(functionId) {
    return { type: REQUEST_CONDITION_LIST, functionId };
}

/**
 * ICカード種別をセットする
 * @param {number} icCardType ICカード種別
 */
export function setICCardType(icCardType) {
    return { type: SET_ICCARD_TYPE, icCardType };
}
