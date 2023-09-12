/**
 * @license Copyright 2018 DENSO
 * 
 * AssetReportPanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

//Action名の定義
export const SET_REPORT_TYPE = 'SET_REPORT_TYPE';
export const SET_SEARCH_DISABLED = 'SET_SEARCH_DISABLED';
export const SET_SHOW_MESSAGE = 'SET_SHOW_MESSAGE'; 

//ActionCenter

/**
 * 出力対象をセットする
 * @param {string} reportType 出力種別
 */
export function setReportType(reportType) {
    return { type:SET_REPORT_TYPE, value:reportType };
}

/**
 * 検索無効をセットする
 * @param {boolean} disabled 無効かどうか
 */
export function setSearchDisabled(disabled) {
    return { type:SET_SEARCH_DISABLED, value:disabled };
}

/**
 * メッセージモーダル表示状態をセットする
 * @param {boolean} show 表示するかどうか
 * @param {string} title タイトル
 * @param {string} message メッセージ
 */
export function setMessageModalState(show, title, message) {
    return { type:SET_SHOW_MESSAGE, show:show, title:title, message:message };
}