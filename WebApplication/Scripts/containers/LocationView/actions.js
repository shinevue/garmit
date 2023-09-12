/**
 * @license Copyright 2017 DENSO
 * 
 * Action(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 */
'use strict';

export const REQUEST_LAYOUT_LIST = 'REQUEST_LAYOUT_LIST';
export const SET_LAYOUT_LIST = 'SET_LAYOUT_LIST';
export const REQUEST_LAYOUT_INFO = 'REQUEST_LAYOUT_INFO';
export const SET_LAYOUT_INFO = 'SET_LAYOUT_INFO';
export const SET_CAMERA_LIST = 'SET_CAMERA_LIST';
export const SET_SETTING_LIST = 'SET_SETTING_LIST';
export const REQUEST_CAMERA_INFO = 'REQUEST_CAMERA_INFO';
export const SET_CAMERA_INFO = 'SET_CAMERA_INFO';
export const CHANGE_CAMERA_STATE = 'CHANGE_CAMERA_STATE';
export const SET_CAMERA_HEIGHT = 'SET_CAMERA_HEIGHT';
export const CHANGE_CAMERA_MODE = 'CHANGE_CAMERA_MODE';
export const SET_CAMERA_MODE = 'SET_CAMERA_MODE';
export const CHANGE_SETTING = 'CHANGE_SETTING';
export const SET_SETTING = 'SET_SETTING';
export const SET_CAMERA_SETTING = 'SET_CAMERA_SETTING';
export const CHANGE_LOAD_STATE = 'CHANGE_LOAD_STATE';
export const CHANGE_MODAL_STATE = 'CHANGE_MODAL_STATE';

export function requestLayoutList() {
    return { type: REQUEST_LAYOUT_LIST };
}

export function setLayoutList(data) {
    return { type: SET_LAYOUT_LIST, value:data };
}

export function requestLayoutInfo(data) {
    return { type: REQUEST_LAYOUT_INFO, value:data };
}

export function setLayoutInfo(data) {
    return { type: SET_LAYOUT_INFO, value: data };
}

export function requestRoomInfo(data) {
    return { type: REQUEST_ROOM_INFO , value:data};
}

export function setCameraList(data){
    return { type: SET_CAMERA_LIST, value:data };
}

export function setSetting(data) {
    return { type: SET_SETTING_LIST, value: data.value };
}

export function requestCameraInfo(data) {
    return { type: REQUEST_CAMERA_INFO, value: data };
}

export function setCameraInfo(data) {
    return { type: SET_CAMERA_INFO, value:data };
}

export function changeCameraState(data){
    return { type: CHANGE_CAMERA_STATE, key:data.key, value: data.value };
}

export function setCameraHeight(data) {
    return { type: SET_CAMERA_HEIGHT, value:data };
}

export function changeCameraMode(data) {
    return { type: CHANGE_CAMERA_MODE, key: data.key, value: data.value };
}

export function setCameraMode(data) {
    return { type: SET_CAMERA_MODE, value:data };
}

export function changeCameraSetting(data) {
    return { type: CHANGE_CAMERA_SETTING, key: data.key, value: data.value };
}

export function requestSetting(data) {
    return { type: REQUEST_SETTING, key: data.key, value: data.value};
}

export function changeSetting(data) {
    return { type: CHANGE_SETTING, key:data.key, value: data.value };
}

export function changeLoadState(data) {
    return { type: CHANGE_LOAD_STATE, value: data };
}

export function changeModalState(data) {
    return { type: CHANGE_MODAL_STATE, value: data };
}