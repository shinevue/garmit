/**
 * @license Copyright 2020 DENSO
 * 
 * 案件スケジュールのユーティリティ(projectScheduleUtility)
 * 
 */

'use strict';

import { PROJECT_TYPE_LIST } from 'constant';

//#region 定数

export const COLOR_COMPLETE_DATE = 'yellow';
export const COLOR_OPEN_DATE = 'pink';
export const COLOR_CLOSE_DATE = 'lightgray';
export const COLOR_OBSERVE_DATE = 'cyan';
export const DEFAULT_TEXT_COLOR = 'black';

export const SCHEDULE_DATE_FORMAT = "YYYY/MM/DD";

/**
 * スケジュール種別
 */
export const SCHEDULE_TYPE = {    
    completeDate: 1, 
    openDate: 2, 
    closeDate: 3, 
    opserveDate: 4
}

/**
 * スケジュール種別オプション
 */
export const SCHEDULE_TYPE_OPTIONS = [
    { value: SCHEDULE_TYPE.completeDate, name: '工事完了希望日' },
    { value: SCHEDULE_TYPE.openDate, name: '開通年月日' },
    { value: SCHEDULE_TYPE.closeDate, name: '廃止年月日' },
    { value: SCHEDULE_TYPE.opserveDate, name: '工事立会日' }
]

//#endregion

/**
 * スケジュール一覧からprojectId/scheduleTypeが一致するスケジュールを取得する
 */
export function getMatchSchedule(schedules, projectId, scheduleType) {
    return _.find(schedules, ((sch) => {
        return sch.projectId === projectId && sch.scheduleType === scheduleType;
    }))
}

/**
 * 表示するスケジュール種別一覧を取得する
 * @param {object} dispSetting 表示設定情報
 */
export function getDispScheduleTypes(dispSetting) {
    var dispSettingNumbers = [];
    for(var key in dispSetting ) {
        if (dispSetting[key] && SCHEDULE_TYPE.hasOwnProperty(key)) {
            dispSettingNumbers.push(SCHEDULE_TYPE[key]);
        }     
    }
    return dispSettingNumbers;
}

/**
 * カレンダーに表示するスケジュール一覧を表示する
 * @param {array} schedules スケジュール一覧
 * @param {array} dispScheduleTypes 表示するスケジュール種別一覧
 */
export function getDispScheduleList(schedules, dispScheduleTypes) {
    return schedules.filter((schedule) => dispScheduleTypes.indexOf(schedule.scheduleType) >= 0);
}

//#region 表示文字列作成

/**
 * 工事種別名称を取得する
 * @param {number} type 種別ID
 */
export function getProjectTypeName(type) {
    const projectType = PROJECT_TYPE_LIST.find((option) => option.typeId === type);
    return projectType ? projectType.name : '';
}

/**
 * スケジュール種別名称を取得する
 * @param {number} type 種別ID
 */
export function getScheduleTypeName(type) {
    const scheduleType = SCHEDULE_TYPE_OPTIONS.find((option) => option.value === type);
    return scheduleType ? scheduleType.name : '';
}

/**
 * スケジュールのタイトルを取得する
 * @param {string} projectNo 工事番号
 * @param {number} projectType 工事種別
 */
export function getScheduleTitle(projectNo, projectType) {
    const typeName = getProjectTypeName(projectType);
    return projectNo + ( typeName && '(' + typeName + ')' );
}

//#endregion

//#region スケジュール色

/**
 * スケジュール色を取得する
 * @param {number} scheduleType スケジュール種別
 */
export function getScheduleColor(scheduleType) {
    switch (scheduleType) {            
        case SCHEDULE_TYPE.openDate:
            return COLOR_OPEN_DATE;
        case SCHEDULE_TYPE.closeDate:
            return COLOR_CLOSE_DATE;
        case SCHEDULE_TYPE.opserveDate:
            return COLOR_OBSERVE_DATE;
        default:
            return COLOR_COMPLETE_DATE;
    }
}

//#endregion

//#region カレンダー関連

/**
 * カレンダーのイベントを作成
 * @param {object} schedule スケジュール情報
 */
export function makeCalendarEvent(schedule) {
    let scheduleTypeName = '';
    switch (schedule.scheduleType) {
        case SCHEDULE_TYPE.completeDate:
            scheduleTypeName = 'completeDate';
            break;
        case SCHEDULE_TYPE.openDate:
            scheduleTypeName = 'openDate';
            break;
        case SCHEDULE_TYPE.closeDate:
            scheduleTypeName = 'closeDate';
            break;
        case SCHEDULE_TYPE.opserveDate:
            scheduleTypeName = 'opserveDate';
            break;
    }

    return {
        id: schedule.projectId + ',' + scheduleTypeName,
        title: getScheduleTitle(schedule.projectNo, schedule.projectType),
        start: schedule.scheduleDate,
        end: moment(new Date(schedule.scheduleDate)).endOf('day'),
        color: getScheduleColor(schedule.scheduleType),
        textColor: DEFAULT_TEXT_COLOR,
        projectId: schedule.projectId,
        scheduleType: schedule.scheduleType
    };
}

//#endregion

