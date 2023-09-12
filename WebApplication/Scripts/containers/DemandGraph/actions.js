/**
 * Copyright 2019 DENSO
 * 
 * Action(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 */

export const SET_LOADSTATE = 'SET_LOADSTATE';
export const SET_LOADSTATE_CONDITION = 'SET_LOADSTATE_CONDITION';
export const SET_LOADSTATE_DEMANDGRAPH = 'SET_LOADSTATE_DEMANDGRAPH';
export const SET_LOOKUP = 'SET_LOOKUP';
export const SET_LAST_CONDITION = 'SET_LAST_CONDITION';
export const SET_DEMANDGRAPH = 'SET_DEMANDGRAPH';
export const SET_MEASURED_DATA_TYPE = 'SET_MEASURED_DATA_TYPE';

/**
 * ロード中の状態変更のActionオブジェクトを作成する
 * @param isLoad ロード中かどうか
 */
export function setLoadState(isLoad) {
    return { type: SET_LOADSTATE, value: isLoad };
}

/**
 * 検索条件のロード状態を変更する
 * @param {any} isLoad
 */
export function setLoadState_condition(isLoad) {
    return { type: SET_LOADSTATE_CONDITION, value: isLoad };
}

/**
 * デマンドグラフのロード状態を変更する
 * @param {any} isLoad
 */
export function setLoadState_demandGraph(isLoad) {
    return { type: SET_LOADSTATE_DEMANDGRAPH, value: isLoad };
}

/**
 * マスタデータをセットする
 * @param {any} lookUp
 */
export function setLookUp(lookUp) {
    return { type: SET_LOOKUP, value: lookUp };
}

/**
 * 最後に検索した条件をセットする
 * @param {any} condition
 */
export function setLastCondition(condition) {
    return { type: SET_LAST_CONDITION, value: condition };
}

/**
 * デマンドグラフをセットする
 * @param {any} demandGraph
 */
export function setDemandGraph(demandGraph) {
    return { type: SET_DEMANDGRAPH, value: demandGraph };
}

/**
 * 計測値種別(リアルタイムデータ or サマリーデータ)をセットする
 * @param {any} type
 */
export function setMeasuredDataType(type) {
    return { type: SET_MEASURED_DATA_TYPE, value: type };
}