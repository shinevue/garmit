/**
 * @license Copyright 2018 DENSO
 * 
 * アラームトースト関係（alarmToast）
 * 
 */

'use strict';

import { setSessionStorage, getSessionStorage, STORAGE_KEY } from 'webStorage';

/**
 * トースト表示状態
 */
export const TOAST_DISPSTATUS_MAP = {
    none: { value: 0, name: '非表示', iconClass: 'fal fa-bell-slash' },
    error: { value: 1, name: '異常のみ', iconClass: 'fal fa-bell' },
    all: { value: 2, name: '異常＋注意', iconClass: 'fas fa-bell' }
};

/**
 * トースト表示状態（初期値）
 */
export const INITIAL_TOAST_DISPSTATUS = 1;

/**
 * トースト表示状態を変更する
 * @param {number} value トースト表示ステータス値
 */
export function setToastDispStatus(value) {
    setSessionStorage(STORAGE_KEY.toastDispStatus, value);
}

/**
 * トースト表示状態を取得する
 * @returns {object} トースト表示ステータス
 */
export function getToastDispStatus() {
    var toastStatus = getSessionStorage(STORAGE_KEY.toastDispStatus, false);
    var statusId = INITIAL_TOAST_DISPSTATUS;
    if (toastStatus) {
        statusId = parseInt(toastStatus);
    }

    var status = null;
    for (const key in TOAST_DISPSTATUS_MAP) {
        if (TOAST_DISPSTATUS_MAP.hasOwnProperty(key)) {
            const item = TOAST_DISPSTATUS_MAP[key];
            if (item.value === statusId) {
                status = item;
            }
        }
    } 

    return status;
}

/**
 * WebStorageに格納するAlarmCountObjectを作成する
 * @param {object} alarmSummary アラームサマリ情報
 */
export function makeAlarmCountObject(alarmSummary) {
    let alarmCount = { systemErrorCount: 0, errorCount:0, warnCount: 0 };
    if (alarmSummary) {
        const { systemErrorCountItem, errorCountItem, warnCountItem } = alarmSummary;
        alarmCount = {
            systemErrorCount: systemErrorCountItem.alarmCount, 
            errorCount: errorCountItem.alarmCount, 
            warnCount: warnCountItem.alarmCount 
        }
    }
    return alarmCount;
}

/**
 * AlarmCountObjectからAlarmSummaryオブジェクトを作成する
 * @param {object} alarmCount アラームカウント情報
 */
export function makeAlarmSummaryObject(alarmCount) {
    return {
        systemErrorCountItem: { alarmCount: alarmCount.systemErrorCount },
        errorCountItem: { alarmCount: alarmCount.errorCount },
        warnCountItem: { alarmCount: alarmCount.warnCount },
        occuringAlarmToastItems: []
    };
}

/**
 * ページ遷移する
 * @param {string} url 遷移先のURL
 * @param {array} keyPairs 遷移するときのキーとパラメータ
 */
export function transitPage(url, keyPairs) {
   //キーをsessionStorageに格納
   keyPairs.forEach((keyPair) => {
       const paramater = keyPair.paramater.charAt(0).toLowerCase() + keyPair.paramater.slice(1);
       setSessionStorage(paramater, keyPair.key);
   });
   window.location.href = url;         //画面遷移
}
