/**
 * @license Copyright 2019 DENSO
 * 
 * Edge対応関係のユーティリティ
 * 
 */

'use strict';


/**
 * ブラウザがEdgeかどうか
 * @returns {boolean} Edgeかどうか
 */
export function isEdge() {
    let userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.indexOf('edge') < 0) {
        return false;       //edge以外
    }
    return true;
}