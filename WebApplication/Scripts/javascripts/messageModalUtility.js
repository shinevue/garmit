/**
 * @license Copyright 2018 DENSO
 * 
 * MessageModalUtility
 * 
 */

'use strict';

/**
* エラーモーダル表示用データ取得
*/
export function showErrorModalInfo(message) {
    return { show: true, title: "エラー", message: message, buttonStyle:"message" };
}

/**
* 成功メッセージ表示用データ取得
*/
export function showSuccessModalInfo(operation, targetName, message) {
    return { show: true, title: operation + "成功", message: message ? message : targetName+"の"+operation+"に成功しました。", buttonStyle: "message" };
}

/**
* 確認メッセージ表示用データ取得
*/
export function showConfirmInfo(message, handleOK) {
    return { show: true, title: "確認", message: message, buttonStyle: "confirm", onOK: handleOK};
}

/**
* モーダルクローズ用データ取得
*/
export function closeModalInfo() {
    return { show: false, title: "", message: "" };
}