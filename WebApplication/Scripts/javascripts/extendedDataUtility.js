/**
 * @license Copyright 2018 DENSO
 * 
 * 詳細項目関係（ラックメンテナンス/ユニットメンテナンス）のユーティリティ
 * ※ユニット、ラックなどの詳細項目データについても記載します。
 * 
 */

'use strict';

import { validateText, validateInteger, validateFormatString } from 'inputCheck';
import { getDateFormat, getTimeFormat, hasTimeFormat } from 'datetimeUtility';

//#region 定数定義
/**
* データ型
*/
export const TYPE = {
    text: 0,
    textArea: 5,
    integer: 1,
    real: 2,
    dateTime: 3,
    select: 4
}

export const TYPE_OPTIONS = [
    { value: TYPE.text, name: "文字列型" },
    { value: TYPE.textArea, name: "文字列型（複数行）" },
    { value: TYPE.integer, name: "整数型" },
    { value: TYPE.real, name: "実数型" },
    { value: TYPE.dateTime, name: "日付時刻型" },
    { value: TYPE.select, name: "選択肢型" },
];

export const DATE_OPTIONS = [
    { value: "1", name: "yyyy/MM/dd" },
    { value: "2", name: "yyyy/M/d" },
    { value: "3", name: "yyyy-MM-dd" },
    { value: "4", name: "yyyy-M-d" },
    { value: "5", name: "yyyy年MM月dd日" },
    { value: "6", name: "yyyy年M月d日" }
];

export const TIME_OPTIONS = [
    { value: -1, name: "指定なし" },
    { value: "1", name: "HH:mm:ss" },
    { value: "2", name: "H:m:s" },
    { value: "3", name: "HH時mm分ss秒" },
    { value: "4", name: "H時m分s秒" }
];

export const DATETIME_INIT_FORMAT = "yyyy/MM/dd HH:mm:ss";
export const REAL_INIT_FORMAT = "#0.0";

export const MAXLENGTH_EXTENDED_DATA = {
    text: 128,
    textArea: 1000
}

/**
* 管理項目テーブルのカラムインデックス
*/
export const COLUMN_INDEX = {
    enableCheck: 0,
    searchableCheck: 1,
    itemName: 2,
    dataType: 3,
    dataFormat: 4,
    alarmState: 5,
    isSysAdmin: 6
}

//#endregion

//#region 入力チェック
/**
 * ページ名称入力チェック
 */
export function validatePangeName(value) {
    return validateText(value, 32, false);
}

/**
* 項目名の入力チェック
* @param {string} value 入力された項目名
*/
export function validateItemName(value) {
    return validateText(value, 32, false);
}

/**
 * データ/書式カラムの実数型の入力チェック
 * @param {string} value 入力された文字列
 */
export function validateRealFormat(value) {
    return validateFormatString(value, 32, false);
}

/**
* データ/書式カラムの選択肢型の入力チェック（各テキストボックスの検証結果をチェックする）
*/
export function validateSelectForms(choices) {
    const canSave = choices.every((choice) => {
        return choice.validationState && choice.validationState.state === "success"
    })
    return { state: canSave ? "success" : "error" };
}

/**
* データ/書式カラムの選択肢型のテキストボックスの入力チェック
* @param {array} text フォームに入力されているテキスト
*/
export function validateSelectForm(text) {
    return validateText(text, 32, false);
}

/**
 * データ/書式カラムの入力チェック
 * @param {string} format フォーマットの値
 * @param {number} type 選択されているデータ型
 */
export function validateDataFormat(type, choices, format, ) {
    if (type === TYPE.real) {   //実数の場合
        return validateRealFormat(format);
    }
    if (type === TYPE.select) { //選択肢の場合
        return validateSelectForms(choices);
    }
    //日付時刻型は常にsuccess
    return { state: "success", helpText: "" };
}

/**
 * アラーム発火日数の入力チェック
 * @param {bool} isAlarm 監視するかどうか
 * @param {string} value 入力された日数
 */
export function validateNoticeDays(isAlarm, value) {
    if (isAlarm) {
        return validateInteger(value, 1, 999, false);
    }
    return { state: "success", helpText: "" };   //日付指定が表示されていなければ常にOK
}

/**
* 選択肢情報に検証結果を付与する
*/
export function addSelectValidation(choices, itemId) {
    if (!choices || choices.length === 0) {
        return [getEmptySelectForm(itemId)];
    }
    let validationByForm = [];
    const nextChoices = $.extend(true, [], choices);
    nextChoices.map((item) => {
        item.validationState = validateSelectForm(item.choiceName);
    });
    return nextChoices;
}

//#endregion

// #region ページ情報初期値をコンポーネント表示用に加工する 
/**
 * 1個分の詳細項目情報から入力フォーム表示用の情報を作成する
 * @param {array} rawExtendedItems 管理項目情報生データ
 * @param {bool} isReadOnly 読み取り専用かどうか
 */
export function createRowInfo(rawExtendedItems, isReadOnly) {
    const processed = rawExtendedItems.map((row) => {
        return {
            itemId: row.itemId,
            position: row.position,
            rowClassName: getRowClassName(row.enable),
            columnInfo: createColumnInfo(row, isReadOnly)
        }
    })
    return _.sortBy(processed, 'position');  //ポジションでソート
}

/**
* 1個分の詳細項目情報から各カラムの入力フォーム表示用の情報を作成する
* @param {array} row 行データ
* @param {bool} isReadOnly 読み取り専用かどうか
*/
function createColumnInfo(row, isReadOnly) {
    return [
        getEnableColPropery(row, isReadOnly),
        getSearchTargetColPropery(row, isReadOnly, row.enable),
        getItemNameColProperty(row, validateItemName(row.name), isReadOnly),
        getDataTypeColProperty(row, isReadOnly),
        getDataFormatColProperty(row, isReadOnly),
        getAlarmStateColProperty(row, validateNoticeDays(row.alarm, row.noticeDays), isReadOnly),
        getIsSysAdminColPropery(row, isReadOnly, row.enable)
    ];
}

/**
 * 有効チェックカラムのプロパティ
 * @param {number} row 行情報
 * @param {bool} isReadOnly 読み取り専用かどうか
 */
function getEnableColPropery(row, isReadOnly) {
    return {
        disabled: isReadOnly,
        itemId: row.itemId,
        checked: row.enable,
        children: "(" + (row.position) + ")",
        index: COLUMN_INDEX.enableCheck,
        bsClass: "checkbox"
    };
}

/**
 * 検索対象チェックカラムのプロパティ
 * @param {number} row 行情報
 * @param {bool} isReadOnly 読み取り専用かどうか
 */
function getSearchTargetColPropery(row, isReadOnly, enable) {
    return {
        disabled: !enable || isReadOnly,
        itemId: row.itemId,
        checked: row.isSearchable,
        index: COLUMN_INDEX.searchableCheck,
        bsClass: "checkbox"
    };
}

/**
 * 項目名カラムのプロパティ
 * @param {number} row 行情報
 * @param {object} validationState
 * @param {bool} isReadOnly 読み取り専用かどうか
 */
function getItemNameColProperty(row, validationState, isReadOnly) {
    return {
        isReadOnly: isReadOnly,
        itemId: row.itemId,
        disabled: !row.enable,
        value: row.name,
        index: COLUMN_INDEX.itemName,
        validationState: validationState
    };
}

/**
 * データ型カラムのプロパティ
 * @param {number} row 行情報
 * @param {bool} isReadOnly 読み取り専用かどうか
 */
function getDataTypeColProperty(row, isReadOnly) {
    return {
        isReadOnly: isReadOnly,
        itemId: row.itemId,
        disabled: !row.enable,
        type: row.type,
        options: TYPE_OPTIONS,
        isRequired: true,
        validationState: { state: "success" },
        helpText: "",
        index: COLUMN_INDEX.dataType
    };
}

/**
 * データ/書式カラムのプロパティ
 * @param {number} row 行情報
 * @param {bool} isReadOnly 読み取り専用かどうか
 */
function getDataFormatColProperty(row, isReadOnly) {
    return {
        isReadOnly: isReadOnly,
        itemId: row.itemId,
        disabled: !row.enable,
        type: row.type,
        option: getDataFormatOption(row),
        index: COLUMN_INDEX.dataFormat
    };
}

/**
 * データ/書式カラムのオプションプロパティ取得
 * @param {number} row 行情報
 */
function getDataFormatOption(row) {
    let validationState = null;
    let option = null;
    switch (row.type) {
        case TYPE.select:
            let choices = row.choices;
            if (!choices || choices.length === 0) { //選択肢は最低1つ表示
                choices.push(getEmptySelectForm(row.itemId));
            }
            choices = addSelectValidation(choices, row.itemId); //選択肢に検証結果追加
            validationState = validateSelectForms(choices);     //カラムの検証
            option = { choices, validationState };
            break;
        case TYPE.dateTime:
            let dateFormatValue = Number(getMatchFormatValue(getDateFormat(row.format), DATE_OPTIONS));
            let timeFormatValue = Number(getMatchFormatValue(getTimeFormat(row.format), TIME_OPTIONS));
            option = { dateFormatValue, timeFormatValue, checked: timeFormatValue !== -1 && dateFormatValue === -1 };
            break;
        case TYPE.real:
            validationState = validateRealFormat(row.format);
            option = { format: row.format, validationState };
            break;
        default: break;
    }
    return option;
}


/**
 * 監視状態カラムのプロパティ
 * @param {number} row 行情報
 * @param {object} validationState
 * @param {bool} isReadOnly 読み取り専用かどうか
 */
function getAlarmStateColProperty(row, validationState, isReadOnly) {
    return {
        isReadOnly: isReadOnly,
        itemId: row.itemId,
        visible: isShowAlarmStateForm(row.type, row.format),
        disabled: !row.enable,
        type: row.type,
        alarm: row.alarm,
        noticeDays: row.noticeDays,
        validationState: validationState,
        index: COLUMN_INDEX.alarmState
    };
}

/**
 * 管理者のみチェックカラムのプロパティ
 * @param {number} row 行情報
 * @param {bool} isReadOnly 読み取り専用かどうか
 */
function getIsSysAdminColPropery(row, isReadOnly, enable) {
    return {
        disabled: !enable || isReadOnly,
        itemId: row.itemId,
        checked: row.isSysAdmin,
        index: COLUMN_INDEX.isSysAdmin,
        bsClass: "checkbox"
    };
}
// #endregion

//#region コンポーネント表示用情報を送信用に変換する
/**
 * コンポーネント表示用情報を送信用に変換する
 * @param {object} source 取得時のページ情報
 * @param {object} processedEditPage コンポーネント表示用情報
 */
export function convertEditingData(source, processedEditPage) {
    let postData = _.cloneDeep(source);
    postData.name = processedEditPage.pageInfo.pageName.value;
    postData.unitTypes = _.get(processedEditPage.pageInfo.unitTypes, "selected");
    postData.extendedItems = convertExtendedItems(_.cloneDeep(source.extendedItems), processedEditPage.extendedItems);
    return postData;
}

/**
 * 管理項目情報テーブルの情報を変換する
 * @param {array} source 取得時の管理項目情報
 * @param {array} tableInfo 管理項目情報テーブルの情報
 */
function convertExtendedItems(source, tableInfo) {
    return source.map((item, i) => {
        const rowInfo = _.find(tableInfo, { "itemId": item.itemId });
        return convertItem(item, rowInfo);
    })
}

/**
 * 管理項目情報テーブルの1行分の情報を変換する
 * @param {array} source 取得時の管理項目情報
 * @param {array} rowInfo 管理項目情報テーブルの1行分の情報
 */
function convertItem(source, rowInfo) {
    const { columnInfo } = rowInfo;
    const type = columnInfo[COLUMN_INDEX.dataType].type;
    const update =  {
        position: rowInfo.position,
        enable: columnInfo[COLUMN_INDEX.enableCheck].checked,
        isSearchable: columnInfo[COLUMN_INDEX.searchableCheck].checked,
        name: columnInfo[COLUMN_INDEX.itemName].value,
        type: type,
        format: getFormat(type, columnInfo[COLUMN_INDEX.dataFormat].option),
        choices: getChoices(type, columnInfo[COLUMN_INDEX.dataFormat].option),
        alarm: columnInfo[COLUMN_INDEX.alarmState].alarm,
        noticeDays: columnInfo[COLUMN_INDEX.alarmState].noticeDays,
        isSysAdmin: columnInfo[COLUMN_INDEX.isSysAdmin].checked
    };
    return Object.assign({}, source, update);
}

/**
* 種別に合わせてフォーマットを取得する
*/
function getFormat(type, dataFormatInfo) {
    switch (type) {
        case TYPE.real:
            return dataFormatInfo.format;
        case TYPE.dateTime:
            //日付時刻フォーマットを生成する
            return margeDateTimeFormat(dataFormatInfo);
        default:
            return null;
    }
}

/**
* 選択状況からフォーマットをマージする
*/
function margeDateTimeFormat(dataFormatInfo) {
    const { checked, dateFormatValue, timeFormatValue } = dataFormatInfo;
    const timeFormatString = getMatchFormatName(timeFormatValue, TIME_OPTIONS);
    if (checked) {
        //時刻のみ指定
        return timeFormatString;
    }
    else {
        let dateFormatString = getMatchFormatName(dateFormatValue, DATE_OPTIONS);
        if (timeFormatValue === -1) {
            //日付のみ指定
            return dateFormatString;
        }
        return dateFormatString + " " + timeFormatString;  //日付と時刻指定(半角スペースでつなげる)
    }
}

/**
* 選択肢の中からvalueが一致する選択肢のnameを返却する
*/
function getMatchFormatName(format, dateOptions) {
    var match = _.find(dateOptions, { "value": format.toString()});
    return match ? match.name : "";
}

/**
 * 選択肢情報を取得する
 */
function getChoices(type, dataFormatInfo) {
    if (type === TYPE.select) {
        return dataFormatInfo.choices;
    }
    else {
        return [];
    }
}
//#endregion

//#region その他

/**
 * データ/書式カラムのオプションプロパティのデフォルト値取得
 * @param {number} itemId ID
 * @param {number} type データ種別
 */
export function getInitialOption(itemId, type) {
    let validationState = null;
    let option = null;
    switch (type) {
        case TYPE.select:
            let choices = getEmptySelectForm(itemId);
            choices = addSelectValidation(choices, itemId); //選択肢に検証結果追加
            validationState = validateSelectForms(choices);     //カラムの検証
            option = { choices, validationState };
            break;
        case TYPE.dateTime:
            option = { dateFormatValue: 1, timeFormatValue: 1, checked: false };
            break;
        case TYPE.real:
            const format = REAL_INIT_FORMAT;
            validationState = validateRealFormat(format);
            option = { format, validationState };
            break;
        default: break;
    }
    return option;
}

/**
* 行に指定するクラス名を取得する
* @param {bool} enable 有効状態
*/
export function getRowClassName(enable) {
    return classNames({ 'disable-row': !enable });
}

/**
* 監視状態フォームを表示するかどうか
* @param {number} type 選択中データ型
* @param {string} format フォーマット
*/
export function isShowAlarmStateForm(type, format) {
    if (type === TYPE.dateTime &&
        format && getDateFormat(format).length > 0) {
        return true;    //日付時刻型かつフォーマットに日付が含まれる場合
    }
    return false;
}

/**
* 監視状態を非表示に変更する
* @param {object} alarmState 有効状態
*/
export function invisibleAlarmState(alarmState) {
    alarmState.visible = false;
    alarmState.alarm=false;
    alarmState.noticeDays = null;
    alarmState.validationState = validateNoticeDays(false, null);
    return alarmState;
}

/**
 * 空の選択肢情報を追加する
 * @param {number} itemId
 */
export function getEmptySelectForm(itemId) {
    return { itemId: itemId, choiceNo: 1, choiceName: "", validationState: validateSelectForm("") };
}

/**
 * 選択肢の中からname一致する選択肢のvalueを返却する
 * @param {string} format 検索するフォーマット
 * @param {array} options　選択肢一覧
 */
export function getMatchFormatValue(format, options) {
    var match = options.find((option) => {
        return format === option.name;
    });
    return match ? match.value : -1; //一致するものがなければ-1を返す
}
// #endregion