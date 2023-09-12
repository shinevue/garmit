/**
 * @license Copyright 2021 DENSO
 * 
 * ICCardSearchConditionのAction(ActionCreator)を定義する。
 * 
 */
'use strict';

//Action名の定義
export const SET_ICCARD_SEARCH_CONDITION = 'SET_ICCARD_SEARCH_CONDITION';
export const SET_ICCARD_EDITING_CONDITION = 'SET_ICCARD_EDITING_CONDITION';
export const SET_VALIDATE_ICCARD_CONDITION = 'SET_VALIDATE_ICCARD_CONDITION';

//ActionCenter

/**
 * ICカード検索条件をセットする
 * @param {any} condition 検索条件
 */
export function setICCardSearchCondition(condition) {
    return { type: SET_ICCARD_SEARCH_CONDITION, value: condition };
}

/**
 * 編集中のICカード検索条件をセットする
 * @param {any} searchCondition 検索条件
 * @param {any} validate 入力検証結果
 */
export function setEditingICCardCondition(condition, validate) {
    return { type: SET_ICCARD_EDITING_CONDITION, value: condition, validate };
}

/**
 * ICカード検索条件の入力検証結果をセットする
 * @param {any} validate 入力検証結果
 */
 export function setValidateICCardCondition(validate) {
    return { type: SET_VALIDATE_ICCARD_CONDITION, validate };
}