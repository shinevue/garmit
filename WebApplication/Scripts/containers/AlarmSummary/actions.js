/**
 * @license Copyright 2018 DENSO
 * 
 * アラームサマリのAction(ActionCreator)を定義する。
 *  
 */
'use strict';

/********************************************
 * Action名
 ********************************************/
export const SET_ALARM_SUMMARY = 'SET_ALARM_SUMMARY';       


/********************************************
 * ActionCenter
 ********************************************/

/**
 * アラームサマリ情報をセットするActionを作成する
 * @param {object} alarmSummary アラームサマリ情報
 */
export function setAlarmSummary(alarmSummary) {
    return { type:SET_ALARM_SUMMARY, value:alarmSummary };
}
