/**
 * @license Copyright 2021 DENSO
 * 
 * ラック施開錠端末のユーティリティ(icTerminalUtility.js)
 * 
 */

import { validateText, validateTextArea, successResult, errorResult } from 'inputCheck';


//#region 定数

export const MAXLENGTH_TERM_NAME = 30;
export const MAXLENGTH_MEMO = 100;

export const KEY_ICTERMINAL_TERM_NAME = 'termName';
export const KEY_ICTERMINAL_MEMO = 'memo';
export const KEY_ICTERMINAL_ALLOW_LOCATIONS = 'allowLocations';
export const KEY_ICTERMINAL_ENTITY = 'icTerminalEntity';

//#endregion

//#region ラック施開錠端末（編集）

/**
 * 空のラック施開錠端末情報を取得する
 */
export function getEmptyICTerminal() {
    return {
        icTerminalEntity: {
            termNo: -1,
            termName: '',
            memo: ''
        },
        allowLocations: []
    }
}

/**
 * ラック施開錠端末の変更を反映した情報を取得する
 * @param {object} before 変更前のデータ
 * @param {string} key キー
 * @param {*} value 変更後の値
 */
export function getChnagedICTerminal(before, key, value) {
    let update = _.cloneDeep(before);
    if (key === KEY_ICTERMINAL_ALLOW_LOCATIONS) {
        _.set(update, key, value);
    } else {
        let updateEntity = _.cloneDeep(before.icTerminalEntity);
        _.set(updateEntity, key, value);
        update.icTerminalEntity = updateEntity;
    }
    return update;
}

//#endregion

//#region 入力検証

/**
 * 端末名称の入力検証
 * @param {string} termName 端末名称
 * @returns { state:'', helpText:'' }　検証結果
 */
export function validateTermName(termName) {
    return validateText(termName, MAXLENGTH_TERM_NAME, false);    
}


/**
 * メモの入力チェック
 * @param {string} memo 入力されたメモ内容
 */
export function validateMemo(memo) {
    return validateTextArea(memo, MAXLENGTH_MEMO, true);
}

/**
 * 操作可能ロケーションの入力検証
 * @param {number} locations 操作可能ロケーション一覧
 * @returns { state:'', helpText:'' }　検証結果
 */
export function validateAllowLocations(locations) {
    return locations && locations.length > 0 ? successResult : errorResult('必須項目です');
}

//#endregion