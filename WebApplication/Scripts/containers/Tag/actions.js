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
export const SET_TAGS = 'SET_TAGS';
export const SET_LOOK_UP = 'SET_LOOK_UP';
export const SET_LOOK_UP_OF_ENTERPRISE = 'SET_LOOK_UP_OF_ENTERPRISE';

export function setLoadState(isLoading) {
    return { type: SET_LOADSTATE, value: isLoading };
}

export function setTags(tags) {
    return { type: SET_TAGS, value: tags };
}

export function setLookUp(lookUp) {
    return { type: SET_LOOK_UP, value: lookUp };
}

export function setLookUpOfEnterprise(lookUp) {
    return { type: SET_LOOK_UP_OF_ENTERPRISE, value: lookUp };
}