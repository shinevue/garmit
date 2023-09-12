/**
 * @license Copyright 2020 DENSO
 * 
 * 案件ユーティリティ(projectUtility)
 * 
 */

'use strict';

import { PROJECT_TYPE } from 'constant';
import { validateText, validateTextArea, isBlankError, validateDate, validateSelect, validateInteger, VALIDATE_STATE, errorResult } from 'inputCheck';
import { convertNumber } from 'numberUtility';

//#region 定数

export const MAXLENGTH_PROJECT_NO = 20;
export const MAXLENGTH_USER_NAME = 32;
export const MAXLENGTH_CHARGE_NAME = 32;
export const MAXLENGTH_MEMO = 1000;
export const PROJECT_DATE_FORMAT = 'YYYY/MM/DD';

export const MAX_LINE_COUNT = 100;
export const MAXLENGTH_COM_SPEED = 20;

export const OPENDATE_PROJECT_TYPES = [ PROJECT_TYPE.new, PROJECT_TYPE.temp, PROJECT_TYPE.fix_temp ];
export const CLOSEDATE_PROJECT_TYPES = [ PROJECT_TYPE.remove, PROJECT_TYPE.left, PROJECT_TYPE.fix_left ];

//#endregion

/**
 * 空の案件情報を取得する
 * @param {object} projectForm 案件情報
 * @param {array} lineTypes 回線種別リスト
 */
export function getEmptyProjectForm(projectForm, lineTypes) {
    return {
        project: getEmptyProject(lineTypes),
        lines: [],
        extendedPages: projectForm && projectForm.extendedPages ?  _.cloneDeep(projectForm.extendedPages) : []
    }
}

/**
 * 空の案件情報を取得
 */
function getEmptyProject(lineTypes) {
    return {
        projectId: -1,
        projectType: PROJECT_TYPE.new,
        projectNo: '',
        receptDate: null,
        userName: '',
        chargeName: '',
        compreqDate: null,
        openDate: null,
        closeDate: null,
        observeDate: null,
        memo: '',
        lineType: lineTypes && lineTypes.length > 0 ? _.cloneDeep(lineTypes[0]) : null,
        comSpeed: '',
        lineCount: 0,
        fixedflg: false
    }
}

/**
 * 更新した案件情報を取得
 * @param {object} before 更新前の情報
 * @param {string} key 変更する項目のキー
 * @param {*} value 変更値
 */
export function getChangedProject(before, key, value) {
    let update = _.cloneDeep(before);
    _.set(update, key, value);
    if (key === 'projectType') {
        if (!(OPENDATE_PROJECT_TYPES.includes(value))) {
            update.openDate = null;
        }
        if (!(CLOSEDATE_PROJECT_TYPES.includes(value))) {
            update.closeDate = null;
        }
    }
    return update;
}

/**
 * 編集対象項目のみを変更したデータを取得する
 * @param {array} before 編集前のデータ
 * @param {array} keys 編集対象項目のキー
 * @param {object} value 変更後のデータ
 */
export function gatChangedBulkData(before, keys, value) {
    return before.map((beforeItem) => {
        let update = _.cloneDeep(beforeItem);
        keys.forEach((key) => {
            _.set(update, key, value[key]);
        })
        return update;
    });    
}

/**
 * 確定保存できるかどうか
 * @param {*} projectForm 
 */
export function canSaveFixed(projectForm) {
    const { project, lines } = projectForm;
    
    if (project.lineCount > 0 && lines.length === 0) {
        return false;
    }
    if (isBlankError(project.compreqDate)) {
        return false;
    }
    if (project.projectType === PROJECT_TYPE.new) {
        if (isLineBlankError(project, lines, 'openDate')) {
            return false;
        }
    } else if (project.projectType === PROJECT_TYPE.remove) {
        if (isLineBlankError(project, lines, 'closeDate')) {
            return false;
        }
    }
    if (!([PROJECT_TYPE.fix_temp, PROJECT_TYPE.fix_left].includes(project.projectType))) {
        if (isBlankError(project.observeDate)) {
            return false;
        }
    }
    return true;
}

/**
 * 回線の空欄チェック（開通年月日/廃止年月日）※案件概要と同じ項目名のもののチェック
 * @param {object} project 案件概要
 * @param {object} lines 回線一覧
 * @param {string} targetKey 対象のキー
 * @returns {boolean} エラーかどうか
 */
function isLineBlankError(project, lines, targetKey) {
    return lines.some((line) => isBlankError(line[targetKey])) && isBlankError(project[targetKey]);
}

/**
 * 案件情報で回線の開通年月日もしくは廃止年月日の上書きメッセージが必要かどうか
 * @param {object} project 案件概要
 * @param {object} lines 回線一覧
 * @param {string} targetKey 対象のキー
 * @returns {boolean} 必要可否
 */
export function isRequiredOverwriteMessages  (project, lines, targetKey) {
    return !isBlankError(project[targetKey] && lines.some((line) => !isBlankError(line[targetKey])));
}

/**
 * 案件情報(project)がエラーどうかを取得する
 * @param {object} beforeProjectFrom 変更前の案件情報
 * @param {string} key 変更する項目のキー
 * @param {*} value 変更値
 */
export function isErrorProject(beforeProject, key, value) {
    const project = getChangedProject(beforeProject, key, value);
    const validate = getProjectValidate(project);
    return isError(validate);
}

/**
 * 案件概要の入力検証結果を取得する
 * @param {object} project 案件情報
 * @returns 入力検証
 */
function getProjectValidate (project) {
    return {
        projectNo: validateProjectNo(project.projectNo),
        receptDate: validateDate(project.receptDate, PROJECT_DATE_FORMAT, false),
        userName: validateUserName(project.userName),
        chargeName: validateChargeName(project.chargeName),
        compreqDate: validateDate(project.compreqDate, PROJECT_DATE_FORMAT, false),
        openDate: validateDate(project.openDate, PROJECT_DATE_FORMAT, true),
        closeDate: validateDate(project.closeDate, PROJECT_DATE_FORMAT, true),
        observeDate: validateDate(project.observeDate, PROJECT_DATE_FORMAT, true),
        memo: validateMemo(project.memo)
    };
}

/**
 * エラーかどうか
 * @param {object} validate 入力検証結果
 * @returns {boolean} エラーどうか
 */
function isError(validate) {
    let isError = false;
    for (const key in validate) {
        if (validate.hasOwnProperty(key) &&                 
            validate[key].state !== VALIDATE_STATE.success) {
                isError = true;
                break; 
        }
    }
    return isError;
}



//#region 入力検証

/**
 * 工事番号の入力検証
 * @param {string} projectNo 工事番号
 * @returns { state:'', helpText:'' }　検証結果
 */
export function validateProjectNo(projectNo) {
    return validateText(projectNo, MAXLENGTH_PROJECT_NO, false);    
}

/**
 * ユーザー名の入力検証
 * @param {string} name 名称
 * @returns { state:'', helpText:'' }　検証結果
 */
export function validateUserName(name) {
    return validateText(name, MAXLENGTH_USER_NAME, false);
}

/**
 * 担当者の入力検証
 * @param {string} name 名称
 * @returns { state:'', helpText:'' }　検証結果
 */
export function validateChargeName(name) {
    return validateText(name, MAXLENGTH_CHARGE_NAME, false);
}

/**
 * 備考の入力検証
 * @param {string} memo 備考
 * @returns { state:'', helpText:'' }　検証結果
 */
export function validateMemo(memo) {
    return validateTextArea(memo, MAXLENGTH_MEMO, true);    
}

/**
 * 通信速度の入力検証
 * @param {string} value 変更後の値
 */
export function  validateComSpeed(value) {        
    return validateText(value, MAXLENGTH_COM_SPEED, true);
}

/**
 * 回線数の入力検証
 * @param {string} value 変更後の値
 * @param {array} lines 回線一覧
 */
export function validateLineCount(value, lines) {
    const linesLength = lines ? lines.length : 0;
    var validate = validateInteger(value, 0, MAX_LINE_COUNT, false);
    if (validate.state === VALIDATE_STATE.success) {
        if (linesLength > convertNumber(value)) {
            validate = errorResult('回線一覧の数よりも小さくなっています。回線一覧の数以上にするか、回線一覧から回線を削除してください。');
        }
    }
    return validate;
}

//#endregion

