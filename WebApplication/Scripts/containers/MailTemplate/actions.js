/**
 * @license Copyright 2017 DENSO
 * 
 * Action(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 */
'use strict';

export const SET_LOADSTATE = 'SET_LOADSTATE';
export const SET_MAIL_TEMPLATE = 'SET_MAIL_TEMPLATE';
export const SET_LOOKUP = 'SET_LOOKUP';

export function setLoadState(isLoading) {
    return { type: SET_LOADSTATE, value: isLoading };
}

export function setMailTemplate(mailTemplate) {
    return { type: SET_MAIL_TEMPLATE, value: mailTemplate };
}

export function setLookUp(lookUp) {
    return { type: SET_LOOKUP, value: lookUp };
}