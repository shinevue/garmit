/**
 * Copyright 2017 DENSO Solutions
 * 
 * Action(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 */

export const SET_LOADSTATE = 'SET_LOADSTATE';
export const SET_LOADSTATE_CONDITION = 'SET_LOADSTATE_CONDITION';
export const SET_LOADSTATE_GRAPHDATA = 'SET_LOADSTATE_GRAPHDATA';
export const SET_LOOKUP = 'SET_LOOKUP';
export const SET_GRAPHDATAS = 'SET_GRAPHDATAS';
export const SET_TREND_GRAPH_SET = 'SET_TREND_GRAPH_SET';
export const SET_DATERANGE = 'SET_DATERANGE';
export const SET_MEASURED_DATA_TYPE = 'SET_MEASURED_DATA_TYPE';
export const SET_UPDATE_INTERVAL = 'SET_UPDATE_INTERVAL';


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
 * グラフデータのロード状態を変更する
 * @param {any} isLoad
 */
export function setLoadState_graphData(isLoad) {
    return { type: SET_LOADSTATE_GRAPHDATA, value: isLoad };
}

/**
 * マスタデータをセットする
 * @param {any} lookUp
 */
export function setLookUp(lookUp) {
    return { type: SET_LOOKUP, value: lookUp };
}

/**
 * グラフデータをセットする
 * @param {any} data
 */
export function setGraphDatas(data) {
    return { type: SET_GRAPHDATAS, value: data };
}

/**
 * グラフ設定をセットする
 * @param {any} graphSet
 */
export function setTrendGraphSet(graphSet) {
    return { type: SET_TREND_GRAPH_SET, value: graphSet };
}

/**
 * 日付範囲をセットする
 * @param {any} dateRange
 */
export function setDateRange(dateRange) {
    return { type: SET_DATERANGE, value: dateRange };
}

/**
 * 計測値種別(リアルタイムデータ or サマリーデータ)をセットする
 * @param {any} type
 */
export function setMeasuredDataType(type) {
    return { type: SET_MEASURED_DATA_TYPE, value: type };
}