/**
 * @license Copyright 2020 DENSO
 * 
 * PatchboardPanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

//Action 名の定義
//Action名は、一意になるように注意してください
export const SET_LOADSTATE = 'SET_LOADSTATE';
export const SET_LOADSTATE_CONDITION = 'SET_LOADSTATE_CONDITION';
export const SET_LOADSTATE_RESULT = 'SET_LOADSTATE_RESULT';
export const SET_LOADSTATE_CONDITION_LIST = 'SET_LOADSTATE_CONDITION_LIST';
export const SET_PATCHBOARD_LIST = 'SET_PATCHBOARD_LIST';
export const SET_PATCHBOARD_FORM = 'SET_PATCHBOARD_FORM';
export const SET_PATCHBOARDS = 'SET_PATCHBOARDS';
export const SET_BULKMODE = 'SET_BULKMODE';
export const SET_DISP_PATCHBOARD_ID = 'SET_DISP_PATCHBOARD_ID';
export const SET_ANCESTORS_TREE = 'SET_ANCESTORS_TREE';
export const SET_CHILDREN_PATCHBOARDS = 'SET_CHILDREN_PATCHBOARDS';

/**
 * ロード中の状態をセットする
 * @param isLoad ロード中かどうか
 */
export function setLoadState(isLoad) {
    return { type: SET_LOADSTATE, value: isLoad };
}

/**
 * 検索条件のロード中の状態をセットする
 * @param {any} isLoad
 */
export function setLoadState_condition(isLoad) {
    return { type: SET_LOADSTATE_CONDITION, value: isLoad };
}

/**
 * 検索結果のロード中の状態をセットする
 * @param {any} isLoad
 */
export function setLoadState_result(isLoad) {
    return { type: SET_LOADSTATE_RESULT, value: isLoad };
}

/**
 * 保存済み検索条件一覧のロード中の状態をセットする
 * @param {any} isLoad ロード中かどうか
 */
 export function setLoadState_coditionList(isLoad) {
    return { type: SET_LOADSTATE_CONDITION_LIST, value: isLoad };
}

/**
 * 配線盤のマスターリストをセットする
 * @param {any} list
 */
export function setPatchboardList(list) {
    return { type: SET_PATCHBOARD_LIST, value: list };
}

/**
 * 配線盤編集情報をセットする
 * @param {any} form
 */
export function setPatchboardForm(form) {
    return { type: SET_PATCHBOARD_FORM, value: form };
}

/**
 * 配線盤情報をセットする
 * @param {any} patchboards
 */
export function setPatchboards(patchboards) {
    return { type: SET_PATCHBOARDS, value: patchboards };
}

/**
 * 一括編集モードかどうかをセットする
 * @param {any} isBulk
 */
export function setBulkMode(isBulk) {
    return { type: SET_BULKMODE, value: isBulk };
}

/**
 * 系統表示する配線盤のIDをセットする
 * @param {any} patchboardId
 */
export function setDispPatchboardId(patchboardId) {
    return { type: SET_DISP_PATCHBOARD_ID, value: patchboardId };
}

/**
 * 先祖ツリーをセットする
 * @param {any} trees
 */
export function setAncestorsTree(trees) {
    return { type: SET_ANCESTORS_TREE, value: trees };
}

/**
 * 子配線盤をセットする
 * @param {any} patchboards
 */
export function setChildrenPatchboards(patchboards) {
    return { type: SET_CHILDREN_PATCHBOARDS, value: patchboards };
}