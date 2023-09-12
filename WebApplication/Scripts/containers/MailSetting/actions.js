/**
 * @license Copyright 2017 DENSO
 * 
 * Action(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 */
'use strict';
export const SET_SYSTEM_SET = 'SET_SYSTEM_SET';
export const SET_MAIL_TEMPLATE = 'SET_MAIL_TEMPLATE';

export function setSystemSet(systemSet) {
    return { type: SET_SYSTEM_SET, value: systemSet };
}

export function setMailTemplate(mailTemplate) {
    return { type: SET_MAIL_TEMPLATE, value: mailTemplate };
}