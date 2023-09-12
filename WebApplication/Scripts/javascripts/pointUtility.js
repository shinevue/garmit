/**
 * @license Copyright 2018 DENSO
 * 
 * point関係のユーティリティ
 * 
 */

'use strict';

import { validateText, validateTextArea, validateSelect, validateInteger, validateReal, validateFormatString, successResult, errorResult, VALIDATE_STATE } from 'inputCheck';
import { POINT_TYPE } from 'constant';

export const maxLength = {
    pointName: 32,
    dispName: 32,
    unit: 10,
    convertUnit: 10,
    address: 512,
    onMessage: 20,
    offMessage: 20,
    comment: 100,
    format: 10,
    convertFormat: 10
}

const acceptBlank = {
    pointName: false,
    dispName: true,
    unit: true,
    convertUnit: true,
    address: true,
    onMessage: true,
    offMessage: true,
    comment: true,
    format: false,
    convertFormat: false
}

/**
 * 入力チェックする
 * @param {any} val 値
 * @param {any} key ポイントのキー
 */
export function checkValidation(val, key, point, bulk = false) {
    switch (key) {
        case 'pointName':
        case 'dispName':
        case 'unit':
        case 'convertUnit':
        case 'onMessage':
        case 'offMessage':
            return validateText(val, maxLength[key], acceptBlank[key]);

        case 'comment':
        case 'address':
            return validateTextArea(val, maxLength[key], acceptBlank[key]);

        case 'format':
        case 'convertFormat':
            return validateFormatString(val, maxLength[key], acceptBlank[key]);

        case 'subGateId':
            return validateInteger(val, 0, 32767, true);

        case 'recordInterval':
            let min = 1;
            let max = 3600;

            if (application.appSettings) {
                if (application.appSettings.recordIntervalMinSec) {
                    min = parseFloat(application.appSettings.recordIntervalMinSec);
                }
                if (application.appSettings.recordIntervalMaxSec) {
                    max = parseFloat(application.appSettings.recordIntervalMaxSec);
                }
            }

            return validateReal(val, min, max, point.calcPoint != POINT_TYPE.normal, 3);

        case 'errorOccurBlindTime':
        case 'alarmOccurBlindTime':
        case 'errorRecoverBlindTime':
        case 'alarmRecoverBlindTime':
            return validateInteger(val, 0, 2147483647, true);

        case 'loopMaxValue':
            return validateInteger(val, 0, 2147483647, true);

        case 'upperErrorPercentage':
        case 'upperAlarmPercentage':
        case 'lowerAlarmPercentage':
        case 'lowerErrorPercentage':
            return validateReal(val, 0, 100, true);

        case 'scale':
        case 'bufferScale':
            return validateReal(val, 0, 1000, true, 6);

        case 'datatype':
            return validateSelect(val && val.dtType);

        case 'database':
            return validateSelect(val && val.dbId);

        case 'calcPoint':
        case 'enterpriseMail':
        case 'useFlg':
        case 'detectedFlg':
        case 'maintMode':
            return validateSelect(val.toString());

        case 'upperError':         
        case 'upperAlarm':
        case 'lowerAlarm':
        case 'lowerError':
            return validateThereshold(val, key, point);
            
        case 'locations':
            return (val && val.length) ? successResult : errorResult('必須項目です');

        case 'convertCoefficients':
            return validateConvertCoefficients(val);

        case 'tags':
        case 'datagate':
        case 'pointType':
            return successResult;

        case 'onValue':
        case 'offValue':
            return validateInteger(val, 0, 255, !(bulk || (point.datatype && point.datatype.isContact)));

        default:
            return successResult;
    }
}

/**
 * 換算情報の入力チェック
 * @param {any} coefficients
 */
export function validateConvertCoefficients(coefficients) {
    let inputCheck = coefficients.map((item, i, array) => {
        let convertType = validateSelect(item.convertType);
        let coefficientValue = validateReal(item.coefficientValue, -99999999, 99999999, false);

        if (item.convertType == 3 && item.coefficientValue != '' && Number(item.coefficientValue) === 0) {
            coefficientValue = errorResult('0で除算はできません');
        }

        return { convertType: convertType, coefficientValue: coefficientValue }
    });

    const state = inputCheck.some((item) =>
        item.convertType.state === VALIDATE_STATE.error || item.coefficientValue.state === VALIDATE_STATE.error
    ) ? VALIDATE_STATE.error : VALIDATE_STATE.success;

    return { state: state, inputCheck: inputCheck };
}

/**
 * 閾値の入力チェックをする
 * @param {any} val
 * @param {any} key
 * @param {any} point
 */
export function validateThereshold(val, key, point) {
    // 空欄の場合
    if (val == null) {
        return successResult;
    }

    const validation = validateReal(val, -999999, 999999, true);
    if (validation.state === VALIDATE_STATE.error) {
        return validation;
    }

    // 順序（上限異常>上限注意>下限注意>下限異常）をチェック
    if (isValidOrder(point)) {
        return successResult;
    } else {
        return errorResult('');
    }  
}

/**
 * 他の閾値の設定値に対して適正な値か
 * @param {any} val
 * @param {any} key
 * @param {any} point
 */
function isValidOrder(point) {
    if (parseFloat(point.upperError) <= parseFloat(point.upperAlarm)) return false;
    if (parseFloat(point.upperError) <= parseFloat(point.lowerAlarm)) return false;
    if (parseFloat(point.upperError) <= parseFloat(point.lowerError)) return false;
    if (parseFloat(point.upperAlarm) <= parseFloat(point.lowerAlarm)) return false;
    if (parseFloat(point.upperAlarm) <= parseFloat(point.lowerError)) return false;
    if (parseFloat(point.lowerAlarm) <= parseFloat(point.lowerError)) return false;
    return true;
}