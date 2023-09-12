/**
 * @license Copyright 2018 DENSO
 * 
 * 日付時刻ユーティリティ
 * 
 */

'use strict';

/**
 * 日付時刻に変換する。日付時刻に変換できない場合は、そのまま文字列を返却する
 * @param {moment|date|string} value 対象の値（日付時刻）
 * @param {string} fromat フォーマット
 * @param {boolean} isStrict フォーマットを厳密に確認するか
 * @returns {moment|string} 変換後の文字列、もしくは元の文字列
 */
export function convertDate(value, format, isStrict = true){
    if (value) {
        const fromatStr = toMomentjsFormat(format);
        return isDate(value, fromatStr, isStrict) ? moment(value, fromatStr, isStrict) : value;
    }
    return value;
}

/**
 * 日付型かどうか
 * @param {moment|string} value 対象の値
 * @param {string} fromat フォーマット
 * @param {boolean} isStrict フォーマットを厳密に確認するか
 * @returns {boolean} 日付型かどうか
 */
export function isDate(value, format, isStrict = true){
    const momentDate = moment(value, toMomentjsFormat(format), isStrict);         //厳密なフォーマットでチェックする
    if (momentDate.isValid()){
        return true;
    }

    return false;
}

/**
 * C#形式の日付指定フォーマットを、momentjs形式に変換します。
 * 変換対象は、年（y -> Y） 日付（d -> D）のみです。
 * @param {string} formatString フォーマット文字列
 */
export function toMomentjsFormat(formatString) {
    return formatString && formatString.replace(/y/g, 'Y')
                                       .replace(/d/g, 'D');
}

/**
 * 時間用のフォーマットがあるかどうか
 * @param {string} format 日付フォーマット
 * @returns 時間用のフォーマットがあるかどうか
 */
export function hasTimeFormat(format) {        
    if (format&&format.match(/(H|h|m|s)/) ) {
        return true;
    }
    return false;
}

/**
 * 日付フォーマットを取得する
 * H|h|m|sのいずれかが最初に見つかったところまでを日付フォーマットとする
 * @param {*} formatString フォーマット文字列
 */
export function getDateFormat(formatString) {
    var index = formatString.search(/H|h|m|s/g);
    return (index >= 0) ? formatString.substring(0, index).trim() : formatString.trim();
}

/**
 * 時刻フォーマットを取得する
 * H|h|m|sのいずれかが最初に見つかったところから時刻フォーマットとする
 * @param {*} formatString フォーマット文字列
 */
export function getTimeFormat(formatString) {
    var index = formatString.search(/H|h|m|s/g);
    return formatString.substr(index).trim();
}

/**
 * Json日時文字列からmomentに変換する
 * @param {string} value 元の値
 * @param {string} format フォーマット
 */
export function convertJsonDateToMoment(value, format) {
    const timeStr = moment(value).format(format);
    return moment(timeStr, format);
} 
