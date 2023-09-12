/**
 * @license Copyright 2019 DENSO
 * 
 * 制御スケジュールのユーティリティ(controlScheduleUtility)
 * 
 */

'use strict';

import { validateText, validateDate, validateTextArea, validateSelect, errorResult, successResult } from 'inputCheck';
import { compareDescending } from 'sortCompare';

//#region 定数

export const DEFAULT_COLOR = "yellow";
export const DEFAULT_TEXT_COLOR = "black";
export const SCHEDULE_DATETIME_FORMAT = "YYYY/MM/DD HH:mm";
export const SCHEDULE_TIME_FORMAT = "HH:mm";

export const MAX_LENGTH_SCHDULE_NAME = 50;
export const MAX_LENGTH_SCHDULE_MEMO = 500;

/**
 * 実行タイミング
 */
export const SCHEDULE_TIMING = {
    noRepeat: 0,
    daily: 1,
    weekly: 2,
    monthly: 3
}

/**
 * 実行タイミングオプション
 */
export const SCHEDULE_TIMING_OPTIONS = [
    { value: SCHEDULE_TIMING.noRepeat, name: '繰り返しなし' },
    { value: SCHEDULE_TIMING.daily, name: '毎日' },
    { value: SCHEDULE_TIMING.weekly, name: '毎週' },
    { value: SCHEDULE_TIMING.monthly, name: '毎月' }
]

/**
 * 実行日の最終日の値
 */
export const SCHEDULE_LASTDAY_VALUE = 99;

/**
 * 実行日の最終日の名前
 */
export const SCHEDULE_LASTDAY_NAME = '最終日';

/**
 * 制御コマンド登録制限数
 */
export const MAXCOUNT_COMMANDS = 100;

/**
 * 曜日番号
 */
const WEEK_NUMBER = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
}

//#endregion

/**
 * スケジュール一覧からscheduleIdが一致するスケジュールを取得する
 */
export function getMatchSchedule(schedulePlans, scheduleId) {
    return _.find(schedulePlans, ((sch) => {
        return sch.controlScheduleId === scheduleId;
    }))
}

//#region 制御スケジュール編集

/**
 * 空のスケジュール情報を取得する
 * @param {datetime} startDate 開始日
 * @param {object} mainEnterprise ログインユーザーのメイン所属
 */
export function getEmptySchedule(startDate, mainEnterprise) {
    //選択日付と現在時刻をマージして開始日時生成
    const startTime = moment().second(0).millisecond(0).add(1, 'd');    //現在時刻＋1日とする
    const setStartDate = startDate ? startTime.year(startDate.year()).month(startDate.month()).date(startDate.date()) : startTime;
    const enterprises = mainEnterprise ? [ mainEnterprise ] : [];
    return {
        controlScheduleId: -1,
        name: null,
        enterprises: enterprises,
        scheduleStartDate: setStartDate,
        scheduleEndDate: moment(setStartDate).add(1, 'h'),
        scheduleTiming: SCHEDULE_TIMING.noRepeat,
        operationStartDate: null,
        operationEndDate: null,
        sunday: false,
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        day: null,
        backColor: DEFAULT_COLOR,
        textColor: DEFAULT_TEXT_COLOR,
        memo: null,
        invalid: false,
        controlCommands: []
    }
}

/**
 * 更新した制御コマンド情報を取得
 * @param {object} before 更新前の情報
 * @param {string} key 変更する項目のキー
 * @param {*} value 変更値
 */
export function getChanagedSchedule(before, key, value) {
    let update = _.cloneDeep(before);    
    switch (key) {
        case 'dateTime':
            _.set(update, 'scheduleStartDate', value.startDate);
            _.set(update, 'scheduleEndDate', value.endDate);
            break;

        case 'scheduleTiming':
            update = getDefaultScheduleCycle(update, value);
            _.set(update, key, value);
            break;

        case 'operationTime':
            _.set(update, 'operationStartDate', value.startTime);
            _.set(update, 'operationEndDate', value.endTime);
            break;
    
        case 'enterprises':
            _.set(update, key, value&&_.cloneDeep(value));
            _.set(update, 'controlCommands', []);
            break;

        default:
            _.set(update, key, value);
            break;
    }
    return update
}

/**
 * デフォルトの実行周期を取得する
 * @param {object} source 元のスケジュール情報
 * @param {number} scheduleTiming 実行タイミング
 * @returns {object} デフォルト周期を入れたスケジュール情報
 */
function getDefaultScheduleCycle(source, scheduleTiming) {
    const currentDate = moment();
    var startTime = null;
    var endTime = null;
    if (scheduleTiming !== SCHEDULE_TIMING.noRepeat) {
        if (source.scheduleTiming === SCHEDULE_TIMING.noRepeat) {
            startTime = moment({hour: currentDate.hour(), minute: currentDate.minute(), seconds: 0, milliseconds: 0});
            endTime = moment(startTime).add(1, 'h');
        } else {
            startTime = source.operationStartDate;
            endTime = source.operationEndDate;            
        }
    }

    var day = null;
    if (scheduleTiming === SCHEDULE_TIMING.monthly) {
        var day = currentDate.date();
    }
    
    return Object.assign({}, source, {
        operationStartDate: startTime,
        operationEndDate: endTime,
        sunday: false,
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        day: day
    });
}

//#endregion

//#region 入力検証

/**
 * スケジュールの入力検証(全項目)
 * @param {object} value スケジュール情報
 */
export function validateSchedule(value) {
    const validateStartDate = validateDate(value.scheduleStartDate);
    const vilidateEndDate = validateEndDate(value.scheduleStartDate, value.scheduleEndDate);
    const validateOprationDate = (validateStartDate.state === successResult.state && vilidateEndDate.state === successResult.state);
    return {
        name: validateName(value.name),
        enterprises: validateEnterprises(value.enterprises),
        startDateTime: validateStartDate,
        endDateTime: vilidateEndDate,
        memo: validateMemo(value.memo),
        operation: validateControlCycle(value, validateOprationDate)
    }
}

/**
 * スケジュール情報の入力検証
 * @param {object} before 変更前の検証結果
 * @param {string} key 変更対象キー
 * @param {object} schedule 変更後のスケジュール情報
 */
export function changeValidateSchedule(before, key, schedule) {
    let update = _.cloneDeep(before);    
    switch (key) {
        case 'name':
            _.set(update, key, validateName(schedule[key]));
            break;
        case 'enterprises':
            _.set(update, key, validateEnterprises(schedule[key]));
            break;
        case 'dateTime':
            _.set(update, 'startDateTime', validateDateFormat(schedule.scheduleStartDate));
            _.set(update, 'endDateTime', validateEndDate(schedule.scheduleStartDate, schedule.scheduleEndDate));
            if (update.startDateTime.state === successResult.state && update.endDateTime.state === successResult.state) {
                _.set(update, 'operation', validateControlCycle(schedule, true));
            }
            break;
        case 'memo':
            _.set(update, key, validateMemo(schedule[key]));
            break;
        case 'scheduleTiming':
        case 'operationTime':
        case 'sunday':
        case 'monday':
        case 'tuesday':
        case 'wednesday':
        case 'thursday':
        case 'friday':
        case 'saturday':
        case 'day':
            const validateOprationDate = (update.startDateTime.state === successResult.state && update.endDateTime.state === successResult.state);
            _.set(update, 'operation', validateControlCycle(schedule, validateOprationDate));
            break;
        
    }
    return update
}

/**
 * スケジュール情報の保存が無効かどうか
 * @param {*} validate 入力検証結果
 */
export function invalidSchedule(validate) {
    if (validate.name.state !== successResult.state) {
        return true;
    }
    if (validate.enterprises.state !== successResult.state) {
        return true;
    }
    if (validate.startDateTime.state !== successResult.state){
        return true;
    }
    if (validate.endDateTime.state !== successResult.state) {
        return true;
    }
    if (validate.memo.state !== successResult.state) {
        return true;
    }
    if (validate.operation.startTime.state !== successResult.state) {
        return true;
    }
    if (validate.operation.endTime.state !== successResult.state){
        return true;
    }
    if (validate.operation.week.state !== successResult.state) {
        return true;
    }
    if (validate.operation.day.state !== successResult.state) {
        return true;
    }
    if (validate.operation.operationDate.state !== successResult.state) {
        return true;
    }
    return false;
}

/**
 * 名称入力チェック
 */
function validateName(value) {
    return validateText(value, MAX_LENGTH_SCHDULE_NAME, false);
}

/**
* 日時のフォーマット入力チェック
*/
function validateDateFormat(date, isTimeOnly = false) {
    return validateDate(date, isTimeOnly ? SCHEDULE_TIME_FORMAT : SCHEDULE_DATETIME_FORMAT, false);
}

/**
* 終了日時の入力チェック
*/
function validateEndDate(startDate, endDate, isTimeOnly = false) {
    let validate = validateDateFormat(endDate, isTimeOnly);
    if (validate.state === "success") {
        if (startDate >= endDate) {
            validate = errorResult('終了日時は開始日時以降となるように設定してください。');
        }
    }
    return validate;
}

/**
* 所属の入力チェック
* @param {array} value 入力された所属リスト
*/
function validateEnterprises(value) {
    if (value && value.length > 0) {
        return successResult;
    }
    return errorResult('所属を選択してください');
}

/**
 * メモの入力チェック
 * @param {string} value 入力されたメモ内容
 */
function validateMemo(value) {
    return validateTextArea(value, 1000, true);
}

/**
 * 実行周期の入力検証
 * @param {object} value スケジュール情報
 */
function validateControlCycle(value, validateOprationDate) {
    var validate = {
        startTime: successResult,
        endTime: successResult,
        operationDate: successResult,
        week: successResult,
        day: successResult,
        memo: successResult
    }

    if (value.scheduleTiming === SCHEDULE_TIMING.noRepeat) {
        return validate;
    }
    
    validate.startTime = validateDateFormat(value.operationStartDate, true);
    validate.endTime = validateEndDate(value.operationStartDate, value.operationEndDate, true);
    
    switch (value.scheduleTiming) {    
        case SCHEDULE_TIMING.weekly:
            validate.week = validateWeekly(value);
            break;

        case SCHEDULE_TIMING.monthly:
            validate.day = validateMonthly(value);
            break;
    }

    if (validateOprationDate &&
        validate.startTime.state === successResult.state &&
        validate.endTime.state === successResult.state) {
        validate.operationDate = validateOperationDate(value);
    }

    return validate;
}

/**
 * 実行周期の曜日の入力検証（毎週の場合のみ）
 */
function validateWeekly(value) {
    if (value.sunday || value.monday || value.tuesday || value.wednesday || 
        value.thursday || value.friday || value.saturday){
        return successResult;
    }
    return errorResult('曜日は1つ以上選択してください');
}

/**
 * 実行周期の日付の入力検証（毎月の場合のみ）
 * @param {*} value 
 */
function validateMonthly(value) {
    return validateSelect(value.day);
}

//#endregion

//#region 実行タイミング文字列

/**
 * 実行タイミング名称を取得する
 * @param {number} timing 実行タイミング
 */
export function getScheduleTimingName(timing) {
    const scheduleTiming = SCHEDULE_TIMING_OPTIONS.find((option) => option.value === timing);
    return scheduleTiming ? scheduleTiming.name : '';
}

/**
 * 実行周期の毎週の実行曜日文字列を取得
 * @param {object} operationWeek 実行曜日連想配列
 */
export function getOperationWeeekString(operationWeek) {
    let options = [];
    for (const key in operationWeek) {
        if (operationWeek[key] === true) {
            switch (key) {
                case 'sunday':
                    options.push('日');
                    break;
                case 'monday':
                    options.push('月');
                    break;
                case 'tuesday':
                    options.push('火');
                    break;
                case 'wednesday':
                    options.push('水');
                    break;
                case 'thursday':
                    options.push('木');
                    break;
                case 'friday':
                    options.push('金');
                    break;
                case 'saturday':   
                    options.push('土');
                    break;
            }
        }
    }
    return options.join('/');
}

/**
 * 実行周期の毎月の日付文字列を取得
 * @param {number} day 実行日付
 */
export function getOperationDayString(day) {
    if (day === SCHEDULE_LASTDAY_VALUE) {
        return SCHEDULE_LASTDAY_NAME;
    } else {
        return day.toString() + '日';
    }
}

//#endregion


/**
 * 実行時刻の入力検証
 * @param {object} schedule スケジュール情報
 */
function validateOperationDate(schedule) {
    var validate = successResult;

    if (schedule.scheduleTiming === SCHEDULE_TIMING.noRepeat) {
        return validate;
    }

    const firstDate = getFirstOperationDate(schedule);
    const lastDate = getLastOperationDate(schedule);
    var isError = false;
    //firstDate＞lastDateの場合はNG
    if (lastDate.start.isBefore(firstDate.start)) {
        isError = true;
    } else {
        //（最後の次の実行開始時刻）＜（有効期間の終了時刻） or （有効期間の開始時刻）＜（最初の前の実行終了時刻）の場合はNG
        const lastNextDate = getLastNextOperationDate(schedule, lastDate.end);
        const firstPrevDate = getFirstPrevOperationDate(schedule, firstDate.start);
        if (lastNextDate.start.isSameOrBefore(schedule.scheduleEndDate) ||
            schedule.scheduleStartDate.isSameOrBefore(firstPrevDate.end)) {
                isError = true; 
        }
    }

    if (isError) {        
        validate = errorResult('期間内に実行されるように実行開始時刻・終了時刻を設定してください。');
    }

    return validate;
}

/**
 * 最初の実行開始日時を取得する
 * @param {moment} schedule スケジュール情報
 */
function getFirstOperationDate(schedule) {
    const { scheduleStartDate, scheduleTiming, operationStartDate, operationEndDate } = schedule;
    const tempStartDate = getDateTime(scheduleStartDate, operationStartDate);
    var firstStartDate = null;

    switch (scheduleTiming) {
        case SCHEDULE_TIMING.daily:
            if (tempStartDate.isSameOrAfter(scheduleStartDate)) {
                firstStartDate = tempStartDate;
            } else {
                firstStartDate = tempStartDate.add(1, 'd');
            }
            break;

        case SCHEDULE_TIMING.weekly:
            const tempWeekDayNumber = tempStartDate.day();
            const effectiveWeekNumbers = getEffectiveWeekNumbers(schedule);
            if (effectiveWeekNumbers.indexOf(tempWeekDayNumber) >= 0 && tempStartDate.isSameOrAfter(scheduleStartDate)) {
                firstStartDate = tempStartDate;
            } else {
                firstStartDate = getWeeklyNextDate(effectiveWeekNumbers, tempStartDate, tempWeekDayNumber);
            }
            break;

        case SCHEDULE_TIMING.monthly:
            const scheduleDay = schedule.day !== SCHEDULE_LASTDAY_VALUE ? schedule.day : tempStartDate.endOf('month').date();
            const tempStartDay = tempStartDate.date();
            if (tempStartDay === scheduleDay && tempStartDate.isSameOrAfter(scheduleStartDate)) {
                firstStartDate = tempStartDate;
            } else if (tempStartDay < scheduleDay) {
                firstStartDate = getMonthlyDate(tempStartDate, operationStartDate, schedule.day, false);
            } else {
                firstStartDate = getMonthlyDate(moment(tempStartDate.add(1, 'M')), operationStartDate, schedule.day, false);            
            }
            break;
    }

    return firstStartDate && {
        start: firstStartDate,
        end: getDateTime(firstStartDate, operationEndDate)
    };
}

/**
 * 最後の実行終了日時を取得する
 * @param {moment} schedule スケジュール情報
 */
function getLastOperationDate(schedule) {
    const { scheduleEndDate, scheduleTiming, operationEndDate, operationStartDate } = schedule;
    const tempEndDate = getDateTime(scheduleEndDate, operationEndDate);
    var lastEndDate = null;
    switch (scheduleTiming) {
        case SCHEDULE_TIMING.daily:
            if (tempEndDate.isSameOrBefore(scheduleEndDate)) {
                lastEndDate = tempEndDate;
            } else {
                lastEndDate = tempEndDate.subtract(1, 'd');
            }
            break;
        case SCHEDULE_TIMING.weekly:
            const tempWeekDayNumber = tempEndDate.day();
            const effectiveWeekNumbers = getEffectiveWeekNumbers(schedule);
            if (effectiveWeekNumbers.indexOf(tempWeekDayNumber) >= 0 && tempEndDate.isSameOrBefore(scheduleEndDate)) {
                lastEndDate = tempEndDate;
            } else {
                lastEndDate = getWeeklyPrevDate(effectiveWeekNumbers, tempEndDate, tempWeekDayNumber);
            }
            break;
        case SCHEDULE_TIMING.monthly:
            const scheduleDay = schedule.day !== SCHEDULE_LASTDAY_VALUE ? schedule.day : tempEndDate.endOf('month').date();
            const tempDay = tempEndDate.date();
            if (tempDay === scheduleDay && tempEndDate.isSameOrBefore(scheduleEndDate)) {
                lastEndDate = tempEndDate;
            } else if (tempDay > scheduleDay) {
                lastEndDate = getMonthlyDate(tempEndDate, operationEndDate, schedule.day, true);              
            } else {
                lastEndDate = getMonthlyDate(moment(tempEndDate.subtract(1, 'M')), operationEndDate, schedule.day, true);
            }
            break;
    }
    
    return lastEndDate && {
        start: getDateTime(lastEndDate, operationStartDate),
        end: lastEndDate 
    };
}

/**
 * 最初の前の実行日時を取得する
 * @param {obect} schedule スケジュール情報
 * @param {moment} lastEndDate 最後の実行終了日時
 */
function getFirstPrevOperationDate(schedule, firstStartDate) {
    const { scheduleTiming, operationEndDate, operationStartDate } = schedule;
    var firstPrevDate = {
        start: null,
        end: null
    };    
    switch (scheduleTiming) {
        case SCHEDULE_TIMING.daily:
            firstPrevDate.start = moment(firstStartDate).subtract(1, 'd');
            break;
        case SCHEDULE_TIMING.weekly:
            const fistWeekDayNumber = firstStartDate.day();
            const effectiveWeekNumbers = getEffectiveWeekNumbers(schedule);
            firstPrevDate.start = getWeeklyPrevDate(effectiveWeekNumbers, moment(firstStartDate), fistWeekDayNumber);
            break;
        case SCHEDULE_TIMING.monthly:
            firstPrevDate.start = getMonthlyDate(moment(firstStartDate).subtract(1, 'M'), operationStartDate, schedule.day, true);
            break;
    }    
    firstPrevDate.end = getDateTime(firstPrevDate.start, operationEndDate);
    return firstPrevDate;     
}

/**
 * 最後の次の実行日時を取得する
 * @param {obect} schedule スケジュール情報
 * @param {moment} lastEndDate 最後の実行終了日時
 */
function getLastNextOperationDate(schedule, lastEndDate) {
    const { scheduleTiming, operationStartDate, operationEndDate } = schedule;
    var lastNextDate = {
        start: null,
        end: null
    };
    switch (scheduleTiming) {
        case SCHEDULE_TIMING.daily:
            lastNextDate.end = moment(lastEndDate).add(1, 'd');
            break;
        case SCHEDULE_TIMING.weekly:
            const lastWeekDayNumber = lastEndDate.day();
            const effectiveWeekNumbers = getEffectiveWeekNumbers(schedule);
            lastNextDate.end = getWeeklyNextDate(effectiveWeekNumbers, moment(lastEndDate), lastWeekDayNumber);
            break;
        case SCHEDULE_TIMING.monthly:
            lastNextDate.end = getMonthlyDate(moment(lastEndDate).add(1, 'M'), operationEndDate, schedule.day, false);
            break;
    }    
    lastNextDate.start = getDateTime(lastNextDate.end, operationStartDate);
    return lastNextDate;     
}

/**
 * 指定日時以前の日時を取得する
 * @param {array} weekNumbers 有効な週番号リスト
 * @param {datetime} sourceDate 指定日時
 * @param {number} sourceWeekNumber 指定日の週番号
 */
function getWeeklyPrevDate(weekNumbers, sourceDate, sourceWeekNumber) {
    var targetWeekNumber = getBeforerWeekNumber(weekNumbers, sourceWeekNumber);
    if (targetWeekNumber < sourceWeekNumber) {
        return sourceDate.subtract((sourceWeekNumber-targetWeekNumber), 'd');
    } else {
        return sourceDate.subtract((7+sourceWeekNumber-targetWeekNumber), 'd');
    }
}

/**
 * 指定日時以降の日時を取得する（実行タイミング：週）
 * @param {array} weekNumbers 有効な週番号リスト
 * @param {datetime} sourceDate 指定日時
 * @param {number} sourceWeekNumber 指定日の週番号
 */
function getWeeklyNextDate(weekNumbers, sourceDate, sourceWeekNumber) {
    var targetWeekNumber = getAfterWeekNumber(weekNumbers, sourceWeekNumber);    
    if (targetWeekNumber > sourceWeekNumber) {
        return sourceDate.add((targetWeekNumber-sourceWeekNumber), 'd');
    } else {
        return sourceDate.add((7+targetWeekNumber-sourceWeekNumber), 'd');
    }
}

/**
 * 実行日時を取得する（実行タイミング：月）
 * @param {datetime} sourceDate 指定日時
 * @param {datetime} operationDate 実行日時
 * @param {number} scheduleDay スケジュールを実行する日付
 * @param {boolean} isPrevious 前方向に検索するかどうか
 */
function getMonthlyDate(sourceDate, operationDate, scheduleDay, isPrevious) {
    var targetDate = null;
    if (scheduleDay === SCHEDULE_LASTDAY_VALUE) {
        targetDate = getDateTime(sourceDate.endOf('month'), operationDate);
    } else {
        var tempDate = moment(sourceDate);
        while (true) {
            const lastDay = tempDate.endOf('month').date();
            if (lastDay >= scheduleDay) {  
                targetDate = getDateTime(tempDate.date(scheduleDay), operationDate);
                break;
            }
            tempDate = isPrevious ? tempDate.subtract(1, 'M') : tempDate.add(1, 'M');
        }
    }
    return targetDate;
}

/**
 * 有効な曜日番号リストを取得する
 * @param {number} schedule スケジュール情報
 */
function getEffectiveWeekNumbers(schedule) {
    const weekNumbers = [];
    schedule.sunday && weekNumbers.push(WEEK_NUMBER.sunday);
    schedule.monday && weekNumbers.push(WEEK_NUMBER.monday);
    schedule.tuesday && weekNumbers.push(WEEK_NUMBER.tuesday);
    schedule.wednesday && weekNumbers.push(WEEK_NUMBER.wednesday);
    schedule.thursday && weekNumbers.push(WEEK_NUMBER.thursday);
    schedule.friday && weekNumbers.push(WEEK_NUMBER.friday);
    schedule.saturday && weekNumbers.push(WEEK_NUMBER.saturday);
    return weekNumbers;
}

/**
 * 有効な曜日リストから指定した曜日の一つ前の曜日を取得する
 * @param {array} weekNumbers 曜日番号リスト
 * @param {number} currentWeekNumber 現時点の曜日番号
 */
function getBeforerWeekNumber(weekNumbers, currentWeekNumber) {
    let retWeekNumber = weekNumbers.sort((current, next) => compareDescending(current, next)).find((num) => num < currentWeekNumber);
    if (!retWeekNumber && retWeekNumber !== 0) {
        retWeekNumber = Math.max.apply(null, weekNumbers);
    } 
    return retWeekNumber;
}

/**
 * 有効な曜日リストから指定した曜日の一つ後の曜日を取得する
 * @param {array} weekNumbers 曜日番号リスト
 * @param {number} currentWeekNumber 現時点の曜日番号
 */
function getAfterWeekNumber(weekNumbers, currentWeekNumber) {
    let retWeekNumber = weekNumbers.find((num) => num > currentWeekNumber);
    if (!retWeekNumber) {
        retWeekNumber = Math.min.apply(null, weekNumbers);
    }
    return retWeekNumber;
}

/**
 * 指定の日付時刻を取得する
 * @param {moment} date 日付
 * @param {moment} time 時刻（時分のみ）
 */
function getDateTime(date, time) {
    return moment(date).hours(time.hour()).minutes(time.minute()).seconds(0).milliseconds(0);
}
