/**
 * Copyright 2017 DENSO Solutions
 * 
 * フロアマップ関連のデータ送受信
 * 
 */

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';


/**
* フロアマップオプションを指定してレイアウトオブジェクト情報を取得する
* @param {int} layoutInfo           取得するレイアウトのレイアウト情報
* @param {bool} isConvert           換算値で表示するかどうか
* @param {object} floorMapOption    フロアマップオプション
* @param {bool} isCapacity          キャパシティ画面かどうか
* @param {func} callback
*/
export function getLayoutInfo(layoutInfo, isConvert, floorMapOption, isCapacity, callback) {
    let result = null;
    let postData = {
        layoutInfo: layoutInfo,
        isConvert : isConvert,
        floorMapOption: !isCapacity ? floorMapOption:null,
        rackCapacityOption:isCapacity ? floorMapOption:null,
        isCapacity:isCapacity
    };
    sendData(EnumHttpMethod.post, 'api/floorMap/layoutInfo', postData, (data, networkError) => {
        if (networkError) {
            result = { isSuccess: false, data: getMessageModalInfo("エラー", NETWORKERROR_MESSAGE) };
        } else if (data) {
            result = getResult(data);
        } else {
            result = { isSuccess: false, data: getMessageModalInfo("エラー", "マップ情報の取得に失敗しました。") };
        }
        callback && callback(result);
    });
}

/**
* オブジェクトのリンク先情報を取得する
* @param {object} selectObject   選択中オブジェクト情報
* @param {bool} isConvert        換算値で表示するかどうか
* @param {func} callback
*/
export function getObjectLink(selectObject, isConvert, callback) {
    const postInfo = {
        SelectObject: selectObject,
        IsConvert: isConvert
    };
    let result = null;
    sendData(EnumHttpMethod.post, 'api/floorMap/objectLink', postInfo, (data, networkError) => {
        if (networkError) {
            result = { isSuccess: false, data: getMessageModalInfo("エラー", NETWORKERROR_MESSAGE) };
        } else if (data) {
            result = getResult(data);
        } else {
            result = { isSuccess: false, data: getMessageModalInfo("エラー", "リンク先情報の取得に失敗しました。") };
        }
        callback && callback(result);
    });
}

//#region 結果オブジェクト取得
/**
* 取得したデータから取得結果オブジェクトの形式にして返す
* @param {object} data 取得したデータ
*/
export function getResult(data) {
    //if(data.requestResult.isSuccess){
    if (data) {
        return { isSuccess: true, data: data };
    }
    else if (!data.requestResult.isSuccess) {
    //else {
        //return { isSuccess: true, data: getMessageModalInfo(data.requestResult.type, data.requestResult.message) };
        return { isSuccess: false, data: getMessageModalInfo(data.requestResult.type, data.requestResult.message) };
    }
}

/**
* メッセージモーダル情報取得
* @param {string} title 取得したデータ
* @param {string} message エラーメッセージ
*/
export function getMessageModalInfo(title, message) {
    return { show: true, title: title, message: message };
}
//#endregion