/**
 * @license Copyright 2019 DENSO
 * 
 * デマンド設定関係のユーティリティ
 * 
 */

'use strict';

/**
 * SOCトリガーかどうか
 * @param {any} triggerId
 */
export function isSocTrigger(triggerId) {
    return 21 <= triggerId && triggerId <= 24;
}
