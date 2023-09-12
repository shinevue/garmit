/**
 * @license Copyright 2019 DENSO
 * 
 * Action(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 */
'use strict';

//Action 名の定義
export const SET_LOADSTATE = 'SET_LOADSTATE';
export const SET_LOADSTATE_CONDITION = 'SET_LOADSTATE_CONDITION';
export const SET_LOADSTATE_RESULT = 'SET_LOADSTATE_RESULT';

export const SET_EMPTY_EXTENDED_PAGES = 'SET_EMPTY_EXTENDED_PAGES';
export const SET_EXTENDED_PAGES = 'SET_EXTENDED_PAGES';
export const SET_INITAIL_OPEN_MEMO = 'SET_INITAIL_OPEN_MEMO';

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
 * 空の施解錠詳細項目情報をセットする
 * @param {array} extendedPages 空の施解錠設定項目情報リスト
 */
export function setEmptyELockOpLogExtendedPages(extendedPages) {
    return { type: SET_EMPTY_EXTENDED_PAGES, data: extendedPages };
}


/**
 * 施解錠詳細項目情報をセットする
 * @param {array} extendedPages 施解錠設定項目情報リスト
 */
export function setELockOpLogExtendedPages(extendedPages) {
    return { type: SET_EXTENDED_PAGES, data: extendedPages }
}

/**
 * 初期表示時の開錠メモをセットする
 * @param {string} openMemo 開錠メモ
 */
export function setInitialOpenMemo(openMemo) {
    return { type: SET_INITAIL_OPEN_MEMO, data: openMemo }
}
