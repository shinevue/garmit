/**
 * @license Copyright 2018 DENSO
 * 
 * 文字列ユーティリティ(stringUtility.js)
 * 
 */

'use strict';

/**
 * キャメルケースに変換する sampleString
 * @param {string} str 変換文字列
 * @return {string} 変換後の文字列
 */
export function convertCamelCase(str){
    str = str.charAt(0).toLowerCase() + str.slice(1);
    return str.replace(/[-_](.)/g, (match, group1) => {
        return group1.toUpperCase();
    });
}

/**
 * スネークケースに変換 sample_string
 * @param {string} str 変換文字列
 * @return {string} 変換後の文字列
 */
export function convertSnakeCase(str){
    var camel = convertCamelCase(str);
    return camel.replace(/[A-Z]/g, (s) => {
        return "_" + s.charAt(0).toLowerCase();
    });
}

/**
 * パスカルケースへ変換 SampleString
 * @param {string} str 変換文字列
 * @return {string} 変換後の文字列
 */
export function convertPascalCase(str){
    var camel = convertCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
}


/**
 * 文字列の長さをバイト数で取得する（Shift_JISで半角1バイト全角2バイトで計算）
 * @param {string} str 判定文字列
 * @return {string} バイト数
 */
export function getByte(str) {
    var length = 0;
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        if ((c >= 0x0 && c < 0x81) || (c === 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
            length += 1;
        } else {
            length += 2;
        }
    }
    return length;
}

/**
 * 文字列を指定されたバイト数になるように先頭からカットする（Shift_JISで半角1バイト全角2バイトで計算）
 * @param {string} str 判定文字列
 * @return {string} バイト数
 */
export function cutStringByByte(str, byte) {
    var trimStr = "";
    var length = 0;
    var i = 0;
    //for (var i = 0; i <= byte; i++) {
    while (length <= byte) {
        var c = str.charCodeAt(i);
        if ((c >= 0x0 && c < 0x81) || (c === 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
            length += 1;
        } else {
            length += 2;
        }
        trimStr += str.substr(i, 1);
        i++;
    }
    return trimStr;
}

/**
 * HTMLエスケープする
 * @param {string} string エスケープ処理する対象文字列
 */
export function escapeHtml(string) {
    if (typeof string !== 'string') {
        return string;
    }
    return string.replace(/[&'`"<>]/g, function(match) {
        return {
          '&': '&amp;',
          "'": '&#x27;',
          '`': '&#x60;',
          '"': '&quot;',
          '<': '&lt;',
          '>': '&gt;',
        }[match]
    });
}

/**
 * 正規表現エスケープする
 * @param {string} string エスケープ処理する対象文字列
 */
export function escapeRegExp(string) {
    if (typeof string !== 'string') {
        return string;
    }
    return string.replace(/[.*+?^=!:${}()|[\]\/\\]/g, '\\$&');
}