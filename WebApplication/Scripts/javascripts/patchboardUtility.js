/**
 * @license Copyright 2020 DENSO
 * 
 * 配線盤設定ユーティリティ(patchboardUtility)
 * 
 */

'use strict';

import { validateText, validateTextArea, validateInteger, validateSelect, successResult, errorResult, VALIDATE_STATE } from 'inputCheck';

/**
 * 配線盤名称の最大文字数
 */
export const MAXLENGTH_PATCHBOARD_NAME = 32;

/**
 * 開始終了線番の最大値
 */
export const MAXNUMBER_START_END_NO = 5000;

/**
 * 備考の最大文字数
 */
export const MAXLENGTH_PATCHBOARD_MEMO = 100;

/**
 * childrenプロパティを使って経路名を返却する
 *
 * @export
 * @param {*} path
 * @returns
 */
export function getRouteNameUsingChildren(path){
    let name = path.patchboardName;
    if (path.children && path.children.length > 0) {
        name = name + " " + getRouteNameUsingChildren(path.children[0]);
    }

    return name;
}

/**
 * parentsプロパティを使って経路名を返却する
 *
 * @export
 * @param {*} path
 * @returns
 */
export function getRouteNameUsingParent(path, excludeOwn = false) {
    let name = excludeOwn ? '' : path.patchboardName;
    if (path.parents && path.parents.length > 0) {
        name = getRouteNameUsingParent(path.parents[0]) + " " +  name;
    }

    return name;
}

/**
 * 先祖ツリーから最下層のノードを取得する
 * @param {any} tree
 */
export function getYoungestChildren(tree) {
    if (tree.children && tree.children.length > 0) {
        return getYoungestChildren(tree.children[0]);
    } else {
        return tree;
    }
}

/**
 * 名称の入力検証
 * @module patchboardUtility
 * @param {string} name 名称
 * @returns { state:'', helpText:'' } 検証結果
 */
export function validatePatchboardName(name) {
    return validateText(name, MAXLENGTH_PATCHBOARD_NAME, false);   
}

/**
 * 開始線番入力検証
 * @param {any} startNo
 * @param {any} endNo
 */
export function validateStartNo(startNo, endNo) {
    var result = validateInteger(startNo, 0, MAXNUMBER_START_END_NO, false);
    if (result.state === VALIDATE_STATE.error) {
        return result;
    }
    var result_end = validateInteger(endNo, 0, MAXNUMBER_START_END_NO, false);
    if (result_end.state === VALIDATE_STATE.error) {
        return result;
    }
    if (Number(startNo) > Number(endNo)) {
        return errorResult('開始線番には終了線番より小さい値を入力してください');
    }
    return result;
}

/**
 * 終了線番入力検証
 * @param {any} endNo
 * @param {any} startNo
 */
export function validateEndNo(endNo, startNo) {
    var result = validateInteger(endNo, 0, MAXNUMBER_START_END_NO, false);
    if (result.state === VALIDATE_STATE.error) {
        return result;
    }
    var result_start = validateInteger(startNo, 0, MAXNUMBER_START_END_NO, false);
    if (result_start.state === VALIDATE_STATE.error) {
        return result;
    }
    if (Number(startNo) > Number(endNo)) {
        return errorResult('終了線番には開始線番より大きい値を入力してください');
    }
    return result;
}

/**
 * 配線盤種別入力検証
 *
 * @export
 * @param {*} patchboardTypeId
 * @returns
 */
export function validatePatchboardType(patchboardTypeId){
    return validateSelect(patchboardTypeId);
}

/**
 * ケーブル種別入力検証
 *
 * @export
 * @param {*} cableTypeId
 * @returns
 */
export function validatePatchCableType(cableTypeId){
    return validateSelect(cableTypeId);
}

/**
 * 備考入力検証
 *
 * @export
 * @param {*} memo
 * @returns
 */
export function validatePatchboardMemo(memo){
    return validateTextArea(memo, MAXLENGTH_PATCHBOARD_MEMO, true);
}

/**
 * ロケーションの入力検証
 * @param {object} location ロケーション情報
 */
export function validateLocation(location) {
    return location ? successResult : errorResult('必須項目です'); 
}

/**
 * 親配線盤入力検証
 *
 * @export
 * @param {*} target
 * @param {*} parents
 * @returns
 */
export function validateParent(target, parents){
    const sameParents = parents.filter(parent => { 
        return (parent.patchboardId === target.patchboardId && parent.pathNo === target.pathNo); 
    });

    if (sameParents.length > 1) {
        return errorResult('同じ経路が含まれています。');
    } else {
        return successResult;
    }
}