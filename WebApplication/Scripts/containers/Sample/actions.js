/**
 * @license Copyright 2017 DENSO
 * 
 * Action(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 */
'use strict';

export const LOAD_MESSAGE = 'LOAD_MESSAGE';
export const ADD_MESSAGE = 'ADD_MESSAGE';
export const ADD_COUNT = 'ADD_COUNT';

export function loadMessage(data){
    return {type:LOAD_MESSAGE, data };
}

export function addMessage(data) {
    return {type:ADD_MESSAGE, data };
}

export function addCount() {
    return {type:ADD_COUNT };
}