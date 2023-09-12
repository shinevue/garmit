/**
 * @license Copyright 2020 DENSO
 * 
 * 回線ユーティリティ(lineUtility)
 * 
 */

'use strict';

import { validateTextArea } from 'inputCheck';

//#region 定数

export const MAXLENGTH_MEMO = 2000;

//#endregion

//#region 回線関連

/**
 * 更新した案件情報を取得
 * @param {object} before 更新前の情報
 * @param {string} key 変更する項目のキー
 * @param {*} value 変更値
 */
export function getChangedPatchCableData(before, key, value) {
    let update = _.cloneDeep(before);
    _.set(update, key, value);
    return update;
}

/**
 * 「/」区切りとした回線IDを作成する
 * @param {object} lineIdObject 回線IDオブジェクト { lineId1, lineId2, lineId3  }
 */
export function makeLineIdsName(lineIdObject) {
    var name = '';
    Object.keys(lineIdObject).forEach((key) => {
        if (lineIdObject[key]) {
            if (name) {
                name += '/';
            }
            name += lineIdObject[key];
        }
    })
    return name;        
}

//#region 入力検証

/**
 * 備考の入力検証
 * @param {string} memo 備考
 * @returns { state:'', helpText:'' }　検証結果
 */
export function validateMemo(memo) {
    return validateTextArea(memo, MAXLENGTH_MEMO, true);    
}

//#endregion

//#region 線番関係

/**
 * 線番名称を作成する
 * @param {string} patchboardName 配線盤名称
 * @param {number} cableNo 線番
 */
export function makePatchCableName(patchboardName, cableNo) {
    let name = patchboardName;
    if (cableNo || cableNo === 0) {
        name += '-' + makePatchCableNoString(cableNo);
    }
    return name;
}

/**
 * 線番文字列を作成する
 * @param {number} cableNo 線番
 */
export function makePatchCableNoString(cableNo) {
    return format('0000', cableNo);
}

//#endregion

//#endregion
