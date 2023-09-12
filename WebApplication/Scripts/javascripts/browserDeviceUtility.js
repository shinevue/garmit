/**
 * @license Copyright 2018 DENSO
 * 
 * デバイスやブラウザに関係する関数を管理（browserDeviceUtility）
 * 
 */

'use strict';

/**
 * タッチデバイスかどうか
 * @returns {boolean} タッチデバイスかどうか
 */
export function isTouchDevice() {
    if ("ontouchstart" in window) {
        return true;
    }
    return false;
}