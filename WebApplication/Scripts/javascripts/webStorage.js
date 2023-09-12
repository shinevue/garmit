/**
 * @license Copyright 2018 DENSO
 * 
 * WebStorageに関する関数
 * 
 */

'use strict';

export const STORAGE_KEY = {
    locationId : 'locationId',
    rackId: 'rackId',
    unitId: 'unitId',
    dispSetId: 'dispSetId',
    egroupId:'egroupId',
    layoutId: 'layoutId',
    pointNo: 'pointNo',
    startDate: 'startDate',
    endDate: 'endDate',
    dispAlarmId: 'dispAlarmId',
    toastDispStatus: 'toastDispStatus',
    gateId: 'gateId',
    alarmCount: 'alarmCount',
    scheduleId: 'scheduleId',
    consumerId: 'consumerId',
    projectId: 'projectId',
    patchboardId: 'patchboardId',
    cableNo: 'cableNo',
    functionId: 'functionId'
};

/**
 * sessionStorageにデータをセットする
 * @param {string} key キー
 * @param {string} value 保存する値
 * @param {boolean} occurEvent イベントを発生させるか
 */
export function setSessionStorage(key, value, occurEvent = false){
    if (useSessionStorage()) {
        let oldValue = sessionStorage.getItem(key);
        sessionStorage.setItem(key, value);
        if (occurEvent) {
            triggerStorageEvent(key, oldValue, value);
        }
        return true;
    }
    return false;
}

/**
 * セッションストレージのデータを取得する
 * @param {string} key キー文字列
 * @param {boolean} isRemove 取得したキーのデータ
 * @returns {string} sessionStorageに保存されたデータ
 */
export function getSessionStorage(key, isRemove = true){
    var value;
    if (useSessionStorage()) {
        value = sessionStorage.getItem(key);

        if (isRemove) {
           sessionStorage.removeItem(key);
        }
    }
    return value;
}

/**
 * セッションストレージのデータを取得する（複数）
 * @param {array} keys キー文字列もしくはキー配列
 * @param {boolean} isRemove 取得したキーのデータをクリアするかどうか
 * @returns {object} sessionStorageに保存されたデータ（連想配列）
 */
export function getMultiSessionStorage(keys, isRemove = true){
    var value;
    if (useSessionStorage()) {
        value = {};
        keys.forEach((k) => {
            value[k] = sessionStorage.getItem(k);
            if (isRemove) {
                sessionStorage.removeItem(k);
             }
        });
    }
    return value;
}

/**
 * sessionStorageのデータを削除する
 * @param {string} key キー
 */
export function removeSessionStorage(key){
    if (useSessionStorage()) {
        sessionStorage.removeItem(key);
        return true;
    }
    return false;
}

/**
 * sessionStorageのデータをすべてクリアする
 */
export function clearSessionStorage(){
    if (useSessionStorage()) {
        sessionStorage.clear();
        return true;
    }
    return false;
}

/**
 * ストレージイベントのトリガー
 * @param {*} key キー
 * @param {*} oldValue キーに対する以前の値
 * @param {*} newValue キーに対する新しい値
 */
export function triggerStorageEvent(key, oldValue, newValue) { 
    var evt = document.createEvent('StorageEvent'); 
    evt.initStorageEvent('storage', false, false, key, oldValue, newValue, 
                         location.href,
                         sessionStorage); 
    window.dispatchEvent(evt); 
}


/**
 * sessionStorageを使用できるかどうか
 */
function useSessionStorage() {
    return ('sessionStorage' in window) && (sessionStorage !== null);
}