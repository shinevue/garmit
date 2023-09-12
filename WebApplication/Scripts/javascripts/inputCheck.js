/**
 * @license Copyright 2018 DENSO
 * 
 * 入力チェック
 * 
 */

'use strict';

import { isDate } from 'datetimeUtility';

/********************************************
 * 定数
 ********************************************/

/**
 * 検証結果のステータス（export可能）
 */
export const VALIDATE_STATE = {
    success: 'success',
    warning: 'warning',
    error: 'error'
};

/**
 * メールフォーマットのエラーステータス
 */
const MAIL_ERROR_STATE = {
    illegalStringError: 'illegalStringError',
    formatError: 'formatError'
};

/**
 * 数値のタイプ
 */
const NUMBER_TYPE = {
    integer: 'integer',
    real: 'real'
};

/**
 * 検証結果（エラー）
 * @param {string} helpText ヘルプテキストに表示する文字列
 */
export const errorResult = (helpText) => {
    return {
        state: VALIDATE_STATE.error,
        helpText: helpText ? helpText : ''
    }
};

/**
 * 検証結果（正常）
 */
export const successResult = {
    state: VALIDATE_STATE.success,
    helpText: ''
};

/********************************************
 * public関数
 ********************************************/

/**
 * 文字列が有効かどうかチェックする。
 * 結果を、TextFormで扱いやすい形式で返します。
 * { state:"", helpText:"" }
 * state -- success, error, warning, ...
 * helpText -- ヘルプメッセージ
 * @param {string} text チェック対象文字列
 * @param {string} maxLength 最大文字数
 * @param {boolean} acceptBlank trueの場合空白を許可する
 * @return { state:"", helpText:"" } 検証結果
 */
export function validateText(text, maxLength, acceptBlank) {

    return validateString(text, 0, maxLength, acceptBlank, true);
}

/**
 * 文字列（複数行）が有効かどうかチェックする。
 * 結果を、TextAreaFormで扱いやすい形式で返します。
 * { state:"", helpText:"" }
 * state -- success, error, warning, ...
 * helpText -- ヘルプメッセージ
 * @param {string} text チェック対象文字列
 * @param {string} maxLength 最大文字数
 * @param {boolean} acceptBlank trueの場合空白を許可する
 * @return { state:"", helpText:"" } 検証結果
 */
export function validateTextArea(text, maxLength, acceptBlank) {

    return validateString(text, 0, maxLength, acceptBlank, true, true);
}

/**
 * 文字列が有効な整数値かどうかチェックする。
 * 結果を、TextFormで扱いやすい形式で返す。
 * { state:"", helpText:"" }
 * state -- success, error, warning, ...
 * helpText -- ヘルプメッセージ
 * @param {string} text チェック対象文字列
 * @param {number} min 最小値
 * @param {number} max 最大値
 * @param {boolean} acceptBlank trueの場合空白を許可する
 * @return { state:"", helpText:"" } 検証結果
 */
export function validateInteger(text, min, max, acceptBlank ) {

    return validateNumber(NUMBER_TYPE.integer, text, min, max, acceptBlank);

}

/**
 * 文字列が有効な実数値かどうかチェックする
 * 結果を、TextFormで扱いやすい形式で返す。
 * { state:"", helpText:"" }
 * state -- success, error, warning, ...
 * helpText -- ヘルプメッセージ
 * @param {string} text チェック対象文字列
 * @param {number} min 最小値
 * @param {number} max 最大値
 * @param {boolean} acceptBlank trueの場合空白を許可する
 * @param {number} effectiveDigit 小数点以下の有効桁数 ※指定なしの場合はチェックしない
 * @return { state:"", helpText:"" } 検証結果
 */
export function validateReal(text, min, max, acceptBlank, effectiveDigit) {

    return validateNumber(NUMBER_TYPE.real, text, min, max, acceptBlank, effectiveDigit);
}

/**
 * 文字列が有効な実数値かどうかをチェックする。
 * データフォーマットで小数点以下をチェックできる。
 * 結果を、TextFormで扱いやすい形式で返す。
 * { state:"", helpText:"" }
 * state -- success, error, warning, ...
 * helpText -- ヘルプメッセージ
 * @param {string} text チェック対象文字列
 * @param {number} min 最小値
 * @param {number} max 最大値
 * @param {boolean} acceptBlank trueの場合空白を許可する
 * @param {string} format データフォーマット（数値形式のみに対応）
 */
export function validateRealFormat(text, min, max, acceptBlank, format) {

    return validateNumber(VALIDATE_STATE.real, text, min, max, acceptBlank, null, format);
}

/**
 * 文字列が半角英数字かどうかチェックします
 * 結果を、TextFormで扱いやすい形式で返す。
 * @param {string} text チェック対象文字列
 * @param {number} minLength 最小文字数
 * @param {number} maxLength 最大文字数
 * @param {bool} acceptBlank 空欄を許容するか
 * @return { state:"", helpText:"" } 検証結果
 */
export function validateAlphanumeric(text, minLength, maxLength, acceptBlank) {

    var result = validateString(text, minLength, maxLength, acceptBlank, true);

    if (!isSuccess(result)||result.acceptBlank) {
        return result;
    }

    if (!isAlphanumericString(text)) {
        return errorResult('半角英数字で入力してください');
    }

    return successResult;
}

/**
 * 選択値が有効かどうかをチェックする。valueにマイナスの値が入っていたら、エラーとする）
 * 結果を、SelectFormで扱いやすい形式で返す。
 * @param {number|string} value 選択値
 * @return { state:"", helpText:"" } 検証結果
 */ 
export function validateSelect(value) {

    if (isBlankError(value) ) {
        return errorResult('必須項目です');
    }

    var num;
    if ( !isNumerialString(value) ) {
        num = parseFloat(value);
    } else {
        num = value;
    }

    if (num < 0) {
        return errorResult('必須項目です');
    }

    return successResult;
}

/**
 * 文字列がURLかどうかチェックする
 * 結果を、TextFormで扱いやすい形式で返します。
 * @param {string} url URL文字列
 * @param {number} maxLength 最大文字数
 * @return { state:'', helpText:'' } 検証結果
 */
export function validateUrl(url, maxLength) {

    var result = validateString(url, 0, maxLength, false, false);

    if (!isSuccess(result)) {
        return result;
    }

    if( isUrlError(url) && isNetworkPathError(url) ) {
        return errorResult('有効なURLを入力してください');
    }

    return successResult;
}

/**
 * 文字列がEmailどうかチェックする。
 * 結果を、TextFormで扱いやすい形式で返します。
 * { state:"", helpText:"" }
 * state -- success, error, warning, ...
 * helpText -- ヘルプメッセージ
 * @param {string} text チェック対象文字列
 * @param {number} maxLength 最大文字数
 * @param {boolean} acceptBlank trueの場合空白を許可する
 * @return { state:'', helpText:'' }　検証結果
 */
export function validateEmail(text, maxLength, acceptBlank) {

    var result = validateString(text, 0, maxLength, acceptBlank, false);

    if (!isSuccess(result)||result.acceptBlank) {
        return result;
    }

    var errorType = isMailFormatError( text );
    switch (errorType) {
        case MAIL_ERROR_STATE.illegalStringError:
            return errorResult('使用不可文字が含まれています');
        case MAIL_ERROR_STATE.formatError:
            return errorResult('メールアドレスの形式になっていません');
    }

    return successResult;
}

/**
 * 文字列がIPアドレスかどうかチェックする
 * @param {any} text チェック対象文字列
 * @param {any} acceptBlank trueの場合空白を許可する
 */
export function validateIpAddress(text, acceptBlank) {
    //空欄チェック
    if (isBlankError(text)) {
        if (acceptBlank) {
            return successResult;
        }
        return errorResult('必須項目です');
    }

    // IPアドレス形式チェック
    if (isIpAddressError(text)) {
        return errorResult('IPアドレスの形式になっていません');
    }
    return successResult;
}

/**
 * 文字列がホスト名（ドメイン名）かどうかチェックする
 * @param {any} text
 * @param {any} maxLength
 * @param {any} acceptBlank
 */
export function validateHostName(text, maxLength, acceptBlank) {
    var result = validateString(text, 0, maxLength, acceptBlank, false);

    if (!isSuccess(result) || result.acceptBlank) {
        return result;
    }

    if (text.match(/[^0-9a-zA-Z.\-]/)) {
        return errorResult('使用不可文字が含まれています');
    }

    return successResult;
}

/**
 * パスワードのフォーマットに合っているかかチェックする
 * 結果を、TextFormで扱いやすい形式で返します。
 * @param {any} text チェックする対象文字列
 * @param {any} minLength 最小文字数
 * @param {any} maxLength 最大文字数
 * @return { state:'', helpText:'' }　検証結果
 */
export function validatePassword(text, minLength, maxLength, acceptBlank) {
    //空欄チェック
    if (isBlankError(text)) {
        return acceptBlank ? successResult : errorResult('必須項目です');
    }

    //禁止文字列
    var IllegalString = new RegExp(/[^a-zA-Z0-9@_\-\.\*!#$%&’\+/=\?\^\{\|\}]/g);
    if (text.match(IllegalString)) {
        return errorResult('使用不可文字が含まれています')
    }

    //最大文字数チェック
    if (isTextLengthOver(text, maxLength)) {
        return errorResult(maxLength.toString() + '文字以下で入力してください')
    }

    //文字数不足チェック
    if (isTextLengthShortage(text, minLength)) {
        return errorResult(minLength.toString() + '文字以上で入力してください')
    }

    //使用文字種チェック
    if (isCharacterTypeSyortage(text)) {
        return errorResult('数字、大文字、小文字、その他記号のうち3種類以上使用してください');
    }

    return successResult;
}


/**
 * ユーザーID重複エラーかどうかチェックする
 * 結果を、TextFormで扱いやすい形式で返します。
 * @param text チェックする文字列
 * @param userList 重複しているかチェックするユーザー情報のリスト
 * @return { state:'', helpText:'' }　検証結果
 */
export function validateUserIdDupulicateError(text, userList) {
    for (var i = 0 ; userList.length > i ; i++) {
        if (text === userList[i].userId) {
            return errorResult('ユーザーIDが重複しています');
        }
    }
    return successResult;
}

/**
 * パスワードと確認用パスワード不一致エラーかどうかチェックする
 * 結果を、TextFormで扱いやすい形式で返します。
 * @param {string} password パスワード
 * @param {string} confirmPassword 確認用パスワード
 * @return { state:'', helpText:'' }　検証結果
 */
export function validatePasswordMatchError(password,confirmPassword){
    if (password !== confirmPassword
        && !(!password && !confirmPassword)) {
        return errorResult('パスワードが一致していません');
    }
    else {
        return successResult;
    }
}

/**
 * 現在のパスワードの入力チェックを行う（パスワード変更用）
 * @param {string} password パスワード
 * @param {number} maxLength 最大文字数
 * @return { state:'', helpText:'' }　検証結果
 */
export function validateCurrentPassword(password, maxLength) {

    //空欄チェック
    if (isBlankError(password)) {
        return errorResult('必須項目です');
    }

    //最大文字数チェック
    if (isTextLengthOver(password, maxLength)) {
        return errorResult(maxLength.toString() + '文字以下で入力してください')
    }

    return successResult;
}

/**
 * データフォーマットの指定文字列の入力チェックを行う
 * @param {any} text　チェックする文字列
 * @param {any} maxLength　最大文字数
 * @param {any} acceptBlank　空欄を許容するか
 * @return { state:'', helpText:'' }　検証結果
 */
export function validateFormatString(text, maxLength, acceptBlank) {

    var result = validateString(text, 0, maxLength, acceptBlank, false);

    if (!isSuccess(result) || result.acceptBlank) {
        return result;
    }

    if (!isDataFormatString(text)) {
        return errorResult('有効なフォーマットの形式で入力してください');
    }

    return successResult;
}

/**
 * 日付の入力チェックを行う
 * @param {moment|string} value チェック対象
 * @param {string} format フォーマット
 * @param {boolean} acceptBlank 空欄を許可するかどうか
 * @return { state:'', helpText:'' }　検証結果
 */
export function validateDate(value, format, acceptBlank = false) {
    
    //空欄チェック
    if (isBlankError(value)) {
        if (acceptBlank) {
            return { 
                ...successResult,
                acceptBlank: acceptBlank
            };
        }
        return errorResult('必須項目です');
    }

    //文字列の場合はエラーとする
    if (!isDate(value, format)) {
        return errorResult('有効な日付形式(' + format + ')で入力してください');
    }

    return successResult;
}

/**
 * ファイル名の入力チェックを行う
 * @param {string} text チェック対象文字列
 * @param {string} maxLength 最大文字数
 * @param {boolean} acceptBlank trueの場合空白を許可する
 * @return { state:"", helpText:"" } 検証結果
 */
export function validateFileName(text, maxLength, acceptBlank) {
    var result = validateString(text, 0, maxLength, acceptBlank, true);

    if (!isSuccess(result) || result.acceptBlank) {
        return result;
    }

    if (isFileNameError(text)) {
        return errorResult('ファイル名に\\ \/ : \* ? " < > \| は使用できません');
    }
    
    return successResult;
}

/**
 * 数値入力エラーかどうか
 * @param string チェックする文字列
 * @return {boolean} エラーかどうか
 */
export function isNumberError(string) {
    var IllegalString = new RegExp(/[^0-9 \- \. e ‐]/g);
    if (string.match(IllegalString)) {  //数値以外の値が返された（含まれている）場合
        return true;
    }
    else {
        return false;
    }
}

/**
 * マルチ選択フォームで選択肢が有効化どうかチェックする。何も選択されていなかった場合は、エラーとする
 * 結果はMultiSelectFromで扱いやすい形式とする
 * @param {array} values 
 * @return { state:'', helpText:'' }　検証結果
 */
export function validateMultiSelect(values) {
    if (values && values.length > 0) {
        return successResult;
    } else {
        return errorResult('必須項目です');
    }
}

/**
 * 文字列が全角カタカナかどうかチェックします（フリガナ用）
 * 結果を、TextFormで扱いやすい形式で返す。
 * @param {string} text チェック対象文字列
 * @param {number} minLength 最小文字数
 * @param {number} maxLength 最大文字数
 * @param {bool} acceptBlank 空欄を許容するか
 * @return { state:"", helpText:"" } 検証結果
 */
 export function validateKana(text, maxLength, acceptBlank) {

    var result = validateString(text, 0, maxLength, acceptBlank, true);

    if (!isSuccess(result)||result.acceptBlank) {
        return result;
    }

    if (!isKanaString(text)) {
        return errorResult('全角カタカナで入力してください');
    }

    return successResult;
}

/********************************************
 * private関数
 ********************************************/

/**
 * 文字列が有効かどうかをチェックする
 * @param {string} text チェック対象文字列
 * @param {number} minLength 最小文字数
 * @param {number} maxLength 最大文字数
 * @param {boolean} acceptBlank trueの場合空白を許可する
 * @param {boolean} checkIllegalString 禁止文字列チェックを行うかどうか
 * @param {boolean} allowMultiline 複数行を許可するかどうか
 * @returns { state:'', helpText:'', acceptBlank: boolean } 検証結果
 */
function validateString(text, minLength, maxLength, acceptBlank, checkIllegalString = true, allowMultiline = false) {

    //空欄チェック
    if (isBlankError(text)) {
        if (acceptBlank) {
            return { 
                ...successResult,
                acceptBlank: acceptBlank
            };
        }
        return errorResult('必須項目です');
    }

    //禁止文字列
    if (checkIllegalString&&isIllegalStringError(text, allowMultiline)) {
        return errorResult('使用不可文字が含まれています')
    }

    //最大文字数チェック
    if (isTextLengthOver(text, maxLength)) {
        return errorResult(maxLength.toString() + '文字以下で入力してください')
    }

    //文字数不足チェック
    if (isTextLengthShortage(text, minLength)) {
        return errorResult(minLength.toString() + '文字以上で入力してください')
    }

    return successResult;
}

/**
 * 数字文字列が有効かどうかをチェックする
 * @param {string} type データ種別
 * @param {string} text チェック対象文字列
 * @param {number} min 最小値
 * @param {number} max 最大値
 * @param {boolean} acceptBlank trueの場合空白を許可する
 * @param {number} effectiveDigit 有効桁数
 * @param {string} format 書式フォーマット
 * @returns { state:'', helpText:'' } 検証結果
 */
function validateNumber(type, text, min, max, acceptBlank, effectiveDigit, format ) {
    
    //空欄チェック
    if (isBlankError(text)) {
        if (acceptBlank) {            
            return { 
                ...successResult,
                acceptBlank: acceptBlank
            };
        }
        return errorResult('必須項目です');
    }
    
    //数値かどうか
    var num;
    if (type === NUMBER_TYPE.integer) {
        if (!isIntegerString(text)) {
            return errorResult('整数値を入力してください');
        }        
        num = parseInt(text, 10);
    } else {
        if (!isNumerialString(text)) {
            return errorResult('数値を入力してください');
        }
        num = parseFloat(text, 10);
        
        //有効桁数かどうか
        if(effectiveDigit&&isEffectiveDigitError(text, effectiveDigit)){
            return errorResult('小数点以下' + effectiveDigit.toString() + '桁の数値を入力してください');
        }

        //フォーマットで有効桁数をチェック
        if(format&&isFormatNumberError(num, format)){
            return errorResult('フォーマット「' + format + '」の数値を入力してください');

        }
    }

    //範囲チェック
    if ( !(min <= num && num <= max) ) {
        return errorResult(min.toString() + '～' + max.toString() + 'までの数値を入力してください');
    }

    return successResult;

}

/**
 * 入力文字数超過エラーかどうか
 * @param {string} string チェックする文字列
 * @param {number} maxLength 最大入力文字数
 * @return {boolean} エラーかどうか
 */
function isTextLengthOver(string, maxLength) {
    if (string.length > maxLength) {
        return true;
    }
    else {
        return false;
    }
}

/**
 * 入力文字数不足エラーかどうか
 * @param {string} string チェックする文字列
 * @param {number} leastLength 最小入力文字数
 * @return {boolean} エラーかどうか
 */
function isTextLengthShortage(string, leastLength) {
    if (string.length < leastLength) {
        return true;
    }
    else {
        return false;
    }
}

/**
 * 入力禁止文字列エラーかどうか
 * @param {string} string チェックする文字列
 * @param {boolean} allowMultiline 複数行を許可するかどうか
 * @return {boolean} エラーかどうか
 */
export function isIllegalStringError(string, allowMultiline) {
    var target = string;
    if (allowMultiline) {
        target = target.replace(/\r?\n/g, '');
    }    

    //不正文字列の正規表現(AppSettingが設定されていたら、そこから読み込む)
    var IllegalString = new RegExp(/[^\wＡ-Ｚａ-ｚ０-９\u3041-\u3096\u30A1-\u30FA\u30FC\u3005\u3400-\u9FFF℃\()?\（）:. 　@#・/%_-]/);
    if (application.appSettings && application.appSettings.illegalString) {
        IllegalString = new RegExp(application.appSettings.illegalString);
    }
    
    if (target.match(IllegalString)) {
        return true;
    }
    else{
        return false;
    }
}

/**
 * 文字列が、数値かどうか
 * @param {string} string チェックする文字列
 * @return {boolean} 数値文字列の場合true
 */
function isNumerialString(string) {

    if ( typeof string === 'number' ) {
        return true;
    }

    var numberPattern = new RegExp(/^[-]?([1-9]\d*|0)(\.\d+)?$/);
    if (string.match(numberPattern)) {
        return true;
    }
    else{
        return false;
    }
}

/**
 * 文字列が、整数値かどうか
 * @param {string} string チェックする文字列
 * @return {boolean} 整数値文字列の場合true
 */
export function isIntegerString(string) {

    if ( typeof string === 'number' ) {
        return true;
    }

    var numberPattern = new RegExp(/^[-]?([1-9]\d*|0)$/);
    if (string.match(numberPattern)) {
        return true;
    }
    else{
        return false;
    }
}

/**
 * 小数点以下の桁数が指定以下エラーかどうか
 * @param {number} num チェックする数値
 * @param {number} effectiveDigit 小数点以下の有効桁数 
 * @return {boolean} エラーかどうか
 */
function isEffectiveDigitError(num, effectiveDigit){
    var numbers = num.toString().split('.');
    if(numbers.length > 1 && !(numbers[1].length <= effectiveDigit)){
        return true;
    }
    return false;
}

/**
 * 小数点以下の桁数がフォーマットと異なっているかどうか
 * @param {number} num チェックする数値
 * @param {string} format フォーマット形式
 * @return {boolean} エラーかどうか
 */
function isFormatNumberError(num, format){
    var numberArray = num.toString().split('.');
    var formatArray = format.split('.');

    //小数点以下がある場合
    if (formatArray.length> 1) {
        return (numberArray.length > 1 && !(numberArray[1].length <= formatArray[1].length));
    } else {
        //小数点以下がない場合は整数表示となる
        return !(numberArray.length === 1);
    }
}

/**
 * 空欄エラーかどうか
 * @param {string} string チェックする文字列
 * @return {boolean} エラーかどうか
 */
export function isBlankError(string) {
    if (!string) {
        if (!(string === 0) || (string === false)){     //0またはfalseは空欄エラーとしない
            return true;
        }
    }
    return false;
}

/**
 * 文字列がURLかどうか
 * @param {string} urlString チェックするURL文字列
 * @return {boolean} エラーかどうか
 */
function isUrlError(urlString) {

    if( urlString.match(/^(https?)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)$/) ) {
        return false;
    }

    return true;
}

/**
 * 文字列がネットワークパスかどうか
 * @param {string} pathString チェックするパス文字列
 * @return {boolean} エラーかどうか
 */
function isNetworkPathError( pathString ) {
    if ( pathString.match( /^(\\\\[\w\()\（）. 　@#・%\$_-Ａ-Ｚａ-ｚ０-９\u3041-\u3096\u30A1-\u30FA\u30FC\u3005\u3400-\u9FFF\\\.]+)$/ ) ||
         pathString.match( /^("\\\\[\w\()\（）. 　@#・%\$_-Ａ-Ｚａ-ｚ０-９\u3041-\u3096\u30A1-\u30FA\u30FC\u3005\u3400-\u9FFF\.].*")$/ )) {
        return false;
    }
    return true;
}

/**
 * メールフォーマットエラーかどうか
 * @param {string} string チェックする文字列
 * @return {string} エラーの場合はエラー内容、エラー出ない場合は何も返さない
 */
function isMailFormatError(string) {
    if (string.match(/[^@a-zA-Z0-9._-]/)) {
        return MAIL_ERROR_STATE.illegalStringError;
    }
    else if (string.match(/\.\.|\.@|@\.|^[\._-]/)) {
        return MAIL_ERROR_STATE.formatError;
    }
    else if (!string.match(/^[\.a-zA-Z0-9_-]{1,64}@[a-zA-Z0-9_-]+\.[\.a-zA-Z0-9_-]+$/)) {
        return MAIL_ERROR_STATE.formatError;
    }
    else{
        return;
    }
}

/**
 * 文字列がIPアドレスの形式になっているかどうか
 * @param {any} string 文字列
 * @return {boolean} エラーかどうか
 */
function isIpAddressError(string) {
    if (string.match(/^(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/)) {
        return false;
    }
    return true;
}

/**
 * 使用文字種不足エラーかどうか
 * @param {string} string チェックする文字列
 * @return {boolean} エラーかどうか
 */
function isCharacterTypeSyortage(string) {
    var characterTypeCounter = 0;
    //使用している文字の種類をチェック
    if (string.match(/[0-9０-９]/)) {
        characterTypeCounter++;
    }
    if (string.match(/[A-ZＡ-Ｚ]/)) {
        characterTypeCounter++;
    }
    if (string.match(/[a-zａ-ｚ]/)) {
        characterTypeCounter++;
    }
    if (string.match(/[@_\-\.\*!#$%&’\+/=\?\^\{\|\}]/)) {
        characterTypeCounter++;
    }

    if (characterTypeCounter < 3) {
        return true;
    }
    else {
        return false;
    }
}

/**
 * 文字列が半角英数字かどうか
 * @param {string} string チェックする文字列
 * @return {boolean} エラーかどうか
 */
function isAlphanumericString(string) {
    if (string.match(/^[0-9a-zA-Z]+$/)) {
        return true;
    }
    return false;
}

/**
 * データフォーマットの書式に一致するか
 * @param {any} string
 */
function isDataFormatString(string) {
    if (string.match(/^#?0+(.0)?0*$/)) {
        return true;
    }
    return false;
}
/**
 * ファイル名エラーかどうか
 * @param {string} fileNameString ファイル名文字列
 * @return {boolean} エラーかどうか
 */
function isFileNameError(fileNameString) {
    if (fileNameString.match(/[\\\/:\*?"<>\|]/)) {       
        return true;
    }
    return false;
}

/**
 * 文字列が全角カタカナかどうか（半角/全角スペースは許可）
 * @param {string} string チェックする文字列
 * @return {boolean} エラーかどうか
 */
 function isKanaString(string) {
    if (string.match(/^[ァ-ヶー 　]*$/)) {
        return true;
    }
    return false;
}

/**
 * 成功したかどうか
 * @param {object} validationState 検証結果
 * @return {boolean} 成功したかどうか
 */
function isSuccess(validationState){
    return validationState.state === VALIDATE_STATE.success;
}
