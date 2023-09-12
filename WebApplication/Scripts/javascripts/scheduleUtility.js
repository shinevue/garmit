/**
 * @license Copyright 2018 DENSO
 * 
 * 演算ポイント編集関係のユーティリティ
 * 
 */

'use strict';

import { validateText, validateDate, validateTextArea } from 'inputCheck';
import { AlarmSwitchColumn, LocationColumn } from 'WorkSchedule/ScheduleEditPanel';

export const DEFAULT_COLOR = "yellow";
export const DEFAULT_TEXT_COLOR = "black";
export const SCHEDULE_DATETIME_FORMAT = "YYYY/MM/DD HH:mm";

//#region 入力チェック
/**
 * スケジュール情報の入力チェック
 */
export function validateSchedule(value) {
    let addValidation = _.cloneDeep(value);

    addValidation.nameValidation = validateName(addValidation.name);
    addValidation.memoValidation = validateMemo(addValidation.memo);

    addValidation.startValidation = validateMaintFormat(addValidation.startDate);
    addValidation.endValidation = validateEndDate(addValidation.startDate, addValidation.endDate);

    addValidation.enterpriseValidation = validateEnterprises(addValidation.enterprises);

    addValidation.canSave = canSave(addValidation);
        

    return addValidation;
}

/**
 * 保存できるかどうかチェック
 */
export function canSave(scheduleInfo) {
    let canSave = true;
    if (scheduleInfo.nameValidation.state !== "success") {
        canSave = false;
    }
    if (scheduleInfo.memoValidation.state !== "success") {
        canSave = false;
    }
    if (scheduleInfo.startValidation.state !== "success"){
        canSave = false;
    }
    if (scheduleInfo.endValidation.state !== "success") {
        canSave = false;
    }
    if (scheduleInfo.enterpriseValidation.state !== "success") {
        canSave = false;
    }
    return canSave;
}

/**
 * 名称入力チェック
 */
export function validateName(value) {
    return validateText(value, 100, false);
}

/**
* 日時のフォーマット入力チェック
*/
export function validateMaintFormat(date) {
    return validateDate(date, SCHEDULE_DATETIME_FORMAT, false);
}

/**
* 終了日時の入力チェック
*/
export function validateEndDate(startDate, endDate) {
    let validate = validateMaintFormat(endDate);
    if (validate.state === "success") {
        if (startDate >= endDate) {
            validate = { state: "error", helpText:"終了日時は開始日時以降となるように設定してください。"};
        }
    }
    return validate;
}

/**
* 所属の入力チェック
* @param {string} value 入力された所属リスト
*/
export function validateEnterprises(value) {
    if (value && value.length > 0) {
        return { state: "success" };
    }
    return {state:"error", helpText:"所属を1つ以上選択してください"}
}

/**
* メモの入力チェック
* @param {string} value 入力されたメモ内容
*/
export function validateMemo(value) {
    return validateTextArea(value, 500, true);
}
//#endregion

/**
 * スケジュール一覧からenterpriseIdとscheduleIdが一致するスケジュールを取得する
 */
export function getMatchSchedule(scheduleList, scheduleId) {
    return _.find(scheduleList, ((sch) => {
        return sch.scheduleId === scheduleId;
    }))
}

/**
 * 空のスケジュール情報を取得する
 */
export function getEmptySchedule(systemId, startDate) {
    //選択日付と現在時刻をマージして開始日時生成
    const startTime = moment().second(0).millisecond(0).add(1, 'm');    //現在時刻＋1分とする
    const setStartDate = startDate ? startTime.year(startDate.year()).month(startDate.month()).date(startDate.date()) : startTime;
    return {
        systemId:systemId,
        scheduleId: -1,
        name: null,
        enterprises:[],
        startDate: setStartDate,
        endDate: moment(setStartDate).add(1, 'h'),
        backColor: DEFAULT_COLOR,
        textColor: DEFAULT_TEXT_COLOR,
        points:[],
        memo:null
    }
}

/**
 * ポイント情報をポイントテーブル情報に変換する
 */
export function getPointTableData(points, handleChange, handleChangeModalState, isReadOnly) {
    const headerSet = ["ポイントNo.", "ポイント名称", "ロケーション", "アラーム監視"];
    let data = [];
    _.cloneDeep(points).forEach((p, index) => {
        let locations = _.map(p.fullLocations, (fullLoc) => { return _.map(_.reverse(fullLoc), 'name') });
        data.push(
            {
                cells:
                [
                    { value: p.pointNo },
                    { value: p.pointName },
                    { Component: LocationColumn, locationStrings:locations, onChangeModalState:handleChangeModalState },
                    { Component: AlarmSwitchColumn, checked: !p.maintMode, disabled: isReadOnly, onChange: handleChange.bind(this, index) }
                ]
            });
    })
    return { headerSet:headerSet, data: data };
}