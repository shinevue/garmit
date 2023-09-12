/**
 * @license Copyright 2018 DENSO
 * 
 * 数値ユーティリティ
 * 
 */

'use strict';

/**
 * 数字をフォーマットした文字列に変更する。（小数点以下の有効桁数に変更する）
 * @param {string|number} value 対象の値（数値もしくは文字列）
 * @param {number} effectiveDigit 小数点以下の有効桁数
 * @returns {string} フォーマット後の文字列
 */
export function changeNumbarFormat(value, effectiveDigit){
    var number;
    if (value !== undefined) {
        number = convertNumber(value).toFixed(effectiveDigit);    
    }
    return number;
}

/**
 * 数値に変換する
 * @param {number} value 対象の文字列（数字の場合はそのまま返す）
 * @returns {number} 変換後の数字（valueが空の場合は0を返す）
 */
export function convertNumber(value){
    if (value) {
        return isNumber(value) ? value : parseFloat(value);
    }
    return 0;
}

/**
 * 数値型かどうかチェックする
 * @param {any} value 対象の値
 * @returns {boolean} 数値かどうか 
 */
export function isNumber(value){
    return (typeof value === 'number');
}