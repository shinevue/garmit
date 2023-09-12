 /**
 * @license Copyright 2019 DENSO
 * 
 * 電気錠関連のユーティリティ(electricLockUtility.js)
 * 
 */

'use strict';

import { validateTextArea, successResult, errorResult } from 'inputCheck';

/**
 * 操作メモの検証
 * @param {string} memo メモ
 */
export function validateOperationMemo(memo) {
    return validateTextArea(memo, 300);
}

/**
 * 操作対象の検証結果
 * @param {boolean} front 前面
 * @param {boolean} rear 背面
 */
export function validateOperationTarget(front, rear) {
    if (front === false && rear === false) {
        return errorResult('前面か背面どちらかは選択してください。');
    }
    return successResult;
}
