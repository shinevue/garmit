/**
 * @license Copyright 2019 DENSO
 * 
 * 制御設定ユーティリティ(controlSettingUtility)
 * 
 */

'use strict';

import { validateText, validateInteger, validateSelect, successResult, errorResult } from 'inputCheck';
import { DATAGATE_PROTOCOL_TYPE, SENDCOMMAND_SEND_MODE, SENDCOMMAND_VALUE_TYPE } from 'constant';

//#region 定数（制御コマンド）

/**
 * パルス設定
 */
export const PULSE_SET = {
	notSet: 0,          //保持
	oneShot: 1,         //1ショット
    demandCycle: 2      //デマンド（30分）
}

/**
 * パルス設定のオプション
 */
export const PULSE_SET_OPTIONS = [
    { value: PULSE_SET.oneShot, name: '1ショット' },
    { value: PULSE_SET.demandCycle, name: 'デマンド（30分）' },
    { value: PULSE_SET.notSet, name: '保持' }
];

/**
 * 出力値
 */
export const OUTPUT_VALUE = {
    off: 0,
    on: 1
}

/**
 * 出力値のオプション
 */
export const OUTPUT_VALUE_OPTIONS = [
    { value: OUTPUT_VALUE.on, name: 'ON(1)' },
    { value: OUTPUT_VALUE.off, name: 'OFF(0)' }
];

/**
 * パルス幅のデフォルト値
 */
export const PULSE_WIDTH_DEFAULT = 1;

/**
 * 制御コマンド実行状態の待機中の値
 */
export const COMMAND_STATUS_WATIING = 0;

//#endregion

//#region 定数（トリガー制御）

/**
 * 制御コマンド名称の最大文字数
 */
export const MAXLENGTH_COMMAND_NAME = 50;

/**
 * パルス幅の最小値
 */
export const MINNUMBER_PALSE_WIDTH = 1;

/**
 * パルス幅の最大値
 */
export const MAXNUMBER_PALSE_WIDTH = 60;

/**
 * トリガー制御名称の最大文字数
 */
export const MAXLENGTH_TRIGGER_CONTROL_NAME = 50;

/**
 * 不感時間の最小値（トリガー制御）
 */
export const MINNUMBER_BLIND_TIME = 0;

/**
 * 不感時間の最大値（トリガー制御）
 */
export const MAXNUMBER_BLIND_TIME = 30;

/**
 * 実行する動作の最大数
 */
export const MAXCOUNT_CONTROL_OPERATION = 100;

//#endregion

//#region 制御コマンド関連

/**
 * 空の制御コマンド（個別制御）情報を取得
 */
export function getEmptyControlCommand() {
    return {
        controlCmdId: -1,
        controlCmdName: '',
        pointNo: null,
        pointName: null,
        pointLocations: null,
        pulseSet: PULSE_SET.oneShot,            //最初は1ショットとしておく
        pulseWidth: PULSE_WIDTH_DEFAULT,
        output: OUTPUT_VALUE.on
    }
}

/**
 * 更新した制御コマンド情報を取得
 * @param {object} before 更新前の情報
 * @param {string} key 変更する項目のキー
 * @param {*} value 変更値
 */
export function getChnagedControlCommands(before, key, value) {
    return before.map((beforeItem) => {
        let update = _.cloneDeep(beforeItem);
        if (key !== 'point') {
            _.set(update, key, value);
            if (key === 'pulseSet' && beforeItem.pulseSet !== value) {
                if (value === PULSE_SET.oneShot) {
                    _.set(update, 'pulseWidth', PULSE_WIDTH_DEFAULT);
                } else {
                    _.set(update, 'pulseWidth', null);
                }
            } else if (key === 'sendMode' && beforeItem.sendMode !== value && 
                       beforeItem.valueType === SENDCOMMAND_VALUE_TYPE.notification) {
                _.set(update, 'valueType', SENDCOMMAND_VALUE_TYPE.integer);     //通知の場合は数値に戻す
            }
        } else {
            _.set(update, 'pointNo', value&&value.pointNo);
            _.set(update, 'pointName', value&&value.pointName);     
            _.set(update, 'pointLocations', value&&value.locations);
            _.set(update, 'protocolType', value&&value.datagate.protocolType);         //プロパティ名を確認する

            if (update.pointNo !== beforeItem.pointNo) {
                _.set(update, 'valueType', SENDCOMMAND_VALUE_TYPE.integer);
                if (update.protocolType === DATAGATE_PROTOCOL_TYPE.snmpv1 ||
                    update.protocolType === DATAGATE_PROTOCOL_TYPE.snmpv2) {    
                    _.set(update, 'sendMode',  SENDCOMMAND_SEND_MODE.set); 
                } else {
                    _.set(update, 'sendMode',  SENDCOMMAND_SEND_MODE.none); 
                }
            }
        }
        return update
    });
}

//#endregion

//#region トリガー制御情報

/**
 * 空のトリガー制御情報を取得
 */
export function getEmptyTriggerControl() {
    return {
        triggerControlId: -1,
        triggerControlName: '',
        blindTime: 20,
        location: null,
        triggerType: null,
        pointNo: null,
        pointName: '',
        isInvalid: false
    }
}

/**
 * 更新した制御コマンド情報を取得
 * @param {object} before 更新前の情報
 * @param {string} key 変更する項目のキー
 * @param {*} value 変更値
 */
export function getChnagedTriggerControls(before, key, value) {
    return before.map((beforeItem) => {
        let update = _.cloneDeep(beforeItem);
        if (key !== 'point') {
            _.set(update, key, value);
        } else {
            _.set(update, 'pointNo', value&&value.pointNo);
            _.set(update, 'pointName', value&&value.pointName);    
        }
        return update
    });
}

//#endregion

//#region その他

/**
 * 編集対象項目のみを変更したデータを取得する
 * @param {array} before 編集前のデータ
 * @param {array} keys 編集対象項目のキー
 * @param {object} value 変更後の制御コマンド情報
 */
export function gatChangedBulkData(before, keys, value) {
    return before.map((beforeItem) => {
        let update = _.cloneDeep(beforeItem);
        keys.forEach((key) => {
            if (key === 'pulseSet' && 
                value[key] !== PULSE_SET.oneShot &&
                keys.indexOf('pulseWidth') < 0) {
                    _.set(update, 'pulseWidth', null);         //パルス設定を変更して、1ショットでなかった場合はパルス幅をクリアしておく
            }
            if (key !== 'point') {
                _.set(update, key, value[key]);
            } else {
                _.set(update, 'pointNo', value[key]&&value[key].pointNo);
                _.set(update, 'pointName', value[key]&&value[key].pointName); 
            }
        })
        return update;
    });    
}

//#endregion

//#region ロケーション情報

/**
 * 配下のロケーション一覧を取得する
 * @param {*} locationTree ロケーションツリー情報
 * @param {*} locationId 対象ロケーションID
 */
export function getChildrenLocationList(locationTree, locationId) {
    const location = getLocation(locationTree, locationId);
    let targetLocations = [];
    if (location) {
        targetLocations = getChildrenLocations(location);
        targetLocations.unshift(_.cloneDeep(location));
    }
    return targetLocations;
}

/**
 * ロケーションを取得する
 * @param {array} locations ロケーションツリー
 * @param {number} locationId 対象ロケーションID
 */
function getLocation(locations, locationId) {
    var target = locations.find((loc) => loc.locationId === locationId);
    if (!target) {
        locations.some((loc) => {
            let location = null;
            if (loc.children && loc.children.length > 0) {
                location = getLocation(loc.children, locationId);
                if (location) {
                    target = location;
                    return true;
                }
            }
        });
    }
    return target;
}

/**
 * ロケーションの子ノードを取得する
 * @param {*} location 
 */
export function getChildrenLocations(location) {
    if (!(location.children && location.children.length > 0)) {
        return [];
    }
    var childrenLocation =  _.cloneDeep(location.children);
    location.children.forEach((loc) => {
        childrenLocation = childrenLocation.concat(getChildrenLocations(loc));
    });
    return childrenLocation;
}

//#endregion

//#region 入力検証(制御コマンド)

/**
 * 名称の入力検証
 * @param {string} name 名称
 * @returns { state:'', helpText:'' }　検証結果
 */
export function validatecontrolCmdName(name) {
    return validateText(name, MAXLENGTH_COMMAND_NAME, false);   
}

/**
 * パルス幅の入力検証
 * @param {number} pulseWidth パルス幅
 * @param {number} pulseSet パルス設定
 * @returns { state:'', helpText:'' }　検証結果
 */
export function validatePulseWidth(pulseWidth, pulseSet) {
    if (pulseSet === PULSE_SET.oneShot) {
        return validateInteger(pulseWidth, MINNUMBER_PALSE_WIDTH, MAXNUMBER_PALSE_WIDTH, false);
    } else {
        return successResult;
    }
}

/**
 * ポイントの入力検証
 * @param {number} pointNo ポイント番号
 */
export function validatePoint(pointNo) {
    return pointNo !== null ? successResult : errorResult('必須項目です'); 
}

//#endregion

//#region 入力検証(トリガー制御)

/**
 * 名称の入力検証
 * @param {string} name 名称
 * @returns { state:'', helpText:'' }　検証結果
 */
export function validateTriggerControlName(name) {
    return validateText(name, MAXLENGTH_TRIGGER_CONTROL_NAME, false);   
}

/**
 * 不感時間の入力検証
 * @param {number} blindTime パルス幅
 * @returns { state:'', helpText:'' }　検証結果
 */
export function validateBlindTime(blindTime) {
    return validateInteger(blindTime, MINNUMBER_BLIND_TIME, MAXNUMBER_BLIND_TIME, false);
}

/**
 * ロケーションの入力検証
 * @param {object} location ロケーション情報
 */
export function validateLocation(location) {
    return location ? successResult : errorResult('必須項目です'); 
}

/**
 * トリガーの検証結果
 * @param {number} trigger トリガーID
 */
export function validateTriggerType(triggerId) {
    return validateSelect(triggerId);
}

//#endregion