/**
 * Copyright 2017 DENSO Solutions
 * 
 * Action(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 */

//Action 名の定義
//Action名は、一意になるように注意してください
export const SET_LOADSTATE = 'SET_LOADSTATE';
export const SET_LOADSTATE_CONDITION = 'SET_LOADSTATE_CONDITION';
export const SET_LOADSTATE_RESULT = 'SET_LOADSTATE_RESULT';
export const SET_LOADSTATE_DEMANDGRAPH = 'SET_LOADSTATE_DEMANDGRAPH';
export const SET_LOOKUP = 'SET_LOOKUP';
export const SET_LAST_CONDITON = 'SET_LAST_CONDITON';
export const SET_DEMAND_SUMMARY_RESULT = 'SET_DEMAND_SUMMARY_RESULT';
export const SET_DEMANDGRAPH = 'SET_DEMANDGRAPH';
export const SET_LAST_GRAPH_CONDITION = 'SET_LAST_GRAPH_CONDITION';


/**
 * ロード中の状態変更のActionオブジェクトを作成する
 * @param isLoad ロード中かどうか
 */
export function setLoadState(isLoad) {
    return { type: SET_LOADSTATE, value: isLoad };
}

/**
 * 検索条件のロード中の状態をセットする
 * @param {any} isLoad
 */
export function setLoadState_condition(isLoad) {
    return { type: SET_LOADSTATE_CONDITION, value: isLoad };
}

/**
 * 検索結果のロード中の状態をセットする
 * @param {any} isLoad
 */
export function setLoadState_result(isLoad) {
    return { type: SET_LOADSTATE_RESULT, value: isLoad };
}

/**
 * デマンドグラフのロード中の状態をセットする
 * @param {any} isLoad
 */
export function setLoadState_demandGraph(isLoad) {
    return { type: SET_LOADSTATE_DEMANDGRAPH, value: isLoad };
}

/**
 * マスターデータをセットする
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
    return { type: SET_LAST_CONDITON, value: condition };
}

/**
 * デマンドサマリをセットする
 * @param {any} result
 */
export function setDemandSummaryResult(result) {
    return { type: SET_DEMAND_SUMMARY_RESULT, value: result };
}

/**
 * デマンドグラフをセットする
 * @param {any} demandGraph
 */
export function setDemandGraph(demandGraph) {
    return { type: SET_DEMANDGRAPH, value: demandGraph };
}

/**
 * 最後に検索したグラフの条件をセットする
 * @param {any} condition
 */
export function setLastGraphCondition(condition) {
    return { type: SET_LAST_GRAPH_CONDITION, value: condition };
}