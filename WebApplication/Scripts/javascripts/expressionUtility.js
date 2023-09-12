/**
 * @license Copyright 2018 DENSO
 * 
 * 演算ポイント編集関係のユーティリティ
 * 
 */

'use strict';

import { validateReal } from 'inputCheck';

//#region 定数
/**
* ポイント演算項名称取得
*/
export function getOperandPointName(isCoef, name) {
    return isCoef ? name + "[換]" : name;
}

/**
* 定数演算項名称取得
*/
export function getOperandConstName(constantValue) {
    return "[定数]" + constantValue;
}

/**
* 演算項のポイント数
*/
export const MAX_POINT_NUM = 20;

/**
 * 演算ポイントの演算子種別
 */
export const CALC_TYPE = {
    plus: { id: 0, value: '＋' },
    minus: { id: 1, value: '－' },
    times: { id: 2, value: '×' },
    divide: { id: 3, value: '÷' }
};

/**
 * 演算ポイントSumType
 */
export const SUM_TYPE = {
    total: 0,     //合計
    max: 1,       //最大
    min: 2,       //最小
    average: 3    //平均
}

/**
 * 演算ポイントの登録対象
 */
export const CALC_TARGET_TYPE = {
    expression: 1, //演算式
    groupAlarm: 2   //グループアラーム
}

/**
 * 演算項の値の種別
 */
export const OPERAND_TYPE = {
    point: 0,       //測定値
    constant: 1,    //定数
    alarm: 2,       //注意アラーム件数
    error: 3         //異常アラーム件数
}

/**
 * 演算ポイントSumTypeの選択肢
 */
export const SUM_TYPE_OPTIONS = [
    { value: SUM_TYPE.total, name: "合計", expressionName: "TOTAL" },
    { value: SUM_TYPE.max, name: "最大", expressionName: "MAX"},
    { value: SUM_TYPE.min, name: "最小", expressionName: "MIN"},
    { value: SUM_TYPE.average, name: "平均", expressionName: "AVERAGE" }
]

/**
 * グループアラームの場合の選択肢
 */
export const GROUPALARM_OPTIONS = [
    { value: OPERAND_TYPE.alarm, name: "注意", expressionName: "ALM_COUNT" },
    { value: OPERAND_TYPE.error, name: "異常", expressionName: "ERR_COUNT" }
];

/**
 * 操作
 */
export const OPERATION = {
    edit: 0,    //編集
    add: 1,     //追加
    delete: 2,  //削除
    cancel: 3,  //キャンセル
    apply: 4,   //適用
    save:5      //保存
}
//#endregion

/**
 * 固定値の入力チェック
 */
export function validateConstantValue(value){
    return validateReal(value, -10000000, 10000000, false, 7);
}