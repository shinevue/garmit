/**
 * @license Copyright 2017 DENSO
 * 
 * FloorMap画面のsagaを生成する
 * 
 */
'use strict';

import { effects } from "redux-saga";
const { fork, put, take, call, takeEvery, select, all, join } = effects;
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { SET_DISABLED_RACK_FUNCTION } from './actions.js';

import floorMapSagas, { setSelectObject, setSelectLayout, setLayoutInfo, getLayoutInfo } from 'FloorMapCommon/sagas.js';
import { FLOORMAP_OPTIONS } from 'constant';
import { FUNCTION_ID_MAP, ALLOW_TYPE_NO, getAuthentication } from 'authentication';

/**
 * rootSaga
 */
export default function* rootSaga() {
    yield all([
        ...floorMapSagas,
        takeEvery("REQUEST_INIT_INFO", initialization),
        takeEvery("REQUEST_RACK_VIEW", setRackView),
        takeEvery("REQUEST_CHANGE_MAP", setLayerInfo),
        takeEvery("REQUEST_UPDATE", updateMapInfo),
        takeEvery("REQUEST_SELECT_LAYOUT", setSelectLayoutInfo),
        takeEvery("REQUEST_TEMP_MAP", updateTempMapInfo),
        takeEvery("SET_SELECT_LAYOUT", clearMapInfo)
    ])
}

//#region rootSagaから呼び出される関数
/**
 * 初期情報をセットする
 */
function* initialization(action) {
    yield put({ type: "CHANGE_LOAD_STATE" });
    yield call(setInitInfo, action);
    yield put({ type: "CHANGE_LOAD_STATE" });
}

/**
 * 初期表示関連情報（LookUpとラック画面権限）を取得・セットする
 */
function* setInitInfo(action) {
    yield fork(setLookUp, action);
    yield fork(setRackAuthentication);
}

/**
 * インシデント情報をセットする
 */
function* setIncidentLog(action) {
    const updating = yield select(state => state.updating);
    const incidentInfo = yield call(getIncidentInfo, action.data);
    if (incidentInfo.isSuccessful) {
        yield put({ type: "SET_INCIDENT", data: incidentInfo.data });
        yield put({ type: "CHANGE_NETWORK_ERROR", isError: false });
    }
    else {
        if (updating && incidentInfo.networkError) {
            yield put({ type: "CHANGE_NETWORK_ERROR", isError: true });
        } else {
            yield put({ type: "SHOW_ERROR_MESSAGE", message: incidentInfo.errorMessage });
            yield !incidentInfo.networkError && put({ type: "CHANGE_NETWORK_ERROR", isError: false });
        }
    }
}

/**
 * ラックビュー情報をセットする
 */
function* setRackView(action) {
    const updating = yield select(state => state.updating);
    if (!updating) {
        yield put({ type: "CHANGE_LOAD_STATE" });
    }
    const selectObject = yield select(state => state.floorMapCommon.selectObjectInfo.selectObject);
    const rackViewInfo = yield call(getRackView, selectObject);
    if (rackViewInfo.isSuccessful) {
        yield put({ type: "SET_RACK_VIEW", data: rackViewInfo.data });
        yield put({ type: "CHANGE_NETWORK_ERROR", isError: false });
    }
    else {
        if (updating && rackViewInfo.networkError) {
            yield put({ type: "CHANGE_NETWORK_ERROR", isError: true });
        } else {
            yield put({ type: "SHOW_ERROR_MESSAGE", message: rackViewInfo.errorMessage });
            yield !rackViewInfo.networkError && put({ type: "CHANGE_NETWORK_ERROR", isError: false });
        }
    }
    if (!updating) {
        yield put({ type: "CHANGE_LOAD_STATE" });
    }
}

/**
 * レイヤ情報をセットする
 */
function* setLayerInfo(action) {
    const { optionId, isChecked } = action.data;
    const update = _.get(action.data, 'update');

    yield put({ type: "CHANGE_CHECK_STATE", data: action.data });

    if (isChecked) {
        if (optionId === FLOORMAP_OPTIONS.tempmap.optionId) {
            if (!update) {  //更新時は変更しない
                yield put({ type: "CHANGE_SWITCH_STATE", data: { optionId: optionId, isChecked: false } });   //温度分布スイッチ状態変更
            }
            yield call(setTempMapInfo);
        }
    }
    else {
        if (!update) {  //更新時はクリアの必要なし
            yield call(clearLayerInfo, optionId);
        }
    }
}

/**
 * マップ情報を更新する
 */
function* updateMapInfo(action) {
    const selectLayout = yield select(state => state.floorMapCommon.selectLayout);
    if ((yield select(state => state.updating)) || (yield select(state => state.isLoading))) {
        _.get(action.data, 'callback') && action.data.callback(); //タイマー設定用コールバック
        return; //手動更新中もしくはロード中の場合は更新スキップ
    }
    yield put({ type: "START_UPDATE" });
    yield put({ type: "CHANGE_LOAD_STATE" });
    if (selectLayout) {
        yield call(getUpdateMapInfo, action, selectLayout.layoutId);
    }
    _.get(action.data, 'callback') && action.data.callback();
    yield put({ type: "END_UPDATE" });
    yield put({ type: "CHANGE_LOAD_STATE" });
}

/**
 * 選択レイアウトをセットする
 */
function* setSelectLayoutInfo(action) {
    yield put({ type: "CHANGE_LOAD_STATE" });
    yield call(getLayoutRelatioInfo, action);
    yield put({ type: "CHANGE_LOAD_STATE" });
}

/**
 * レイアウト関連情報（マップ情報とインシデントログ情報）を取得する
 */
function* getLayoutRelatioInfo(action) {
    yield fork(setSelectLayout, action, false, true);
    yield fork(setIncidentLog, action);
}

/**
 * 更新用のマップ情報を取得する
 */
function* getUpdateMapInfo(action, selectLayoutId) {
    const floorMapOptionInfo = yield select(state => state.floorMapCommon.floorMapOptionInfo);
    const isConvert = yield select(state => state.floorMapCommon.floorMapInfo.isConvert);

    //インシデントログ情報更新
    if (!action.data.onlyValue) {   //値のみ更新（換算値表示チェック変更による更新）時は更新不要
        yield fork(setIncidentLog, { data: { layoutId: selectLayoutId } });
    }
    //レイアウト情報更新
    yield fork(updateLayoutInfo, selectLayoutId, isConvert, _.find(floorMapOptionInfo, { 'optionId': FLOORMAP_OPTIONS.alarm.optionId }));
    //リンク先情報更新
    const selectObject = yield select(state => state.floorMapCommon.selectObjectInfo.selectObject);
    if (selectObject) {
        yield fork(setSelectObject, { data: selectObject }, true);
    }
    //レイヤ情報更新
    yield all(
        floorMapOptionInfo.map(option => {
            if (option.check) {
                return fork(setLayerInfo, { data: { optionId: option.optionId, isChecked: true, update: true } });
            }
        })
    )
    //ラック詳細モーダル表示時はラックビュー情報更新
    if (yield select(state => state.rackView)) {
        yield fork(setRackView);
    }
}


/**
 * レイアウト情報を更新する
 * @param {int} layoutId    取得するレイアウトのレイアウトID
 */
export function* updateLayoutInfo(layoutId, isConvert, floorMapOption) {
    const layoutInfo = yield call(getLayoutInfo, { layoutId: layoutId }, isConvert, floorMapOption, false);
    //保存
    if (!layoutInfo.networkError) {
        if (layoutInfo.isSuccessful) {
            const layout = _.get(layoutInfo, "data.layout");
            let saveLayoutInfo = _.omit(layout, ['parent', 'children', 'level', 'location', 'updateUserId', 'updateDate', 'operationLogs']);
            yield put({ type: "UPDATE_LAYOUT", data: saveLayoutInfo });
            //リンク先情報更新
            const selectObject = yield select(state => state.floorMapCommon.selectObjectInfo.selectObject);
            if (selectObject) {
                let updateSelectObject = _.find(layout.layoutObjects, { 'objectId': selectObject.objectId });
                yield put({ type: "SET_SELECT_OBJECT", data: updateSelectObject });
            }
        }
        else {
            yield put({ type: "SHOW_ERROR_MESSAGE", message: layoutInfo.errorMessage });
        }
        yield put ({ type: "CHANGE_NETWORK_ERROR", isError: false });
    } else {
        yield put ({ type: "CHANGE_NETWORK_ERROR", isError: true });
    }
    return layoutInfo.isSuccessful;
}

/**
 * 選択中レイアウトの変更で不要になる情報を削除する
 */
function* clearMapInfo() {
    yield put({ type: "SET_TEMPMAP_PATH", data: null });
    yield put({ type: "SET_RACK_VIEW", data: null });
}

/**
 * 温度分布図情報を更新する
 */
function* updateTempMapInfo(action) {
    yield put({ type: "CHANGE_SWITCH_STATE", data: { optionId: action.data.optionId, isChecked: action.data.isChecked } });   //温度分布スイッチ状態変更
    yield call(setTempMapInfo);
}
//#endregion

//#region その他関数

/**
 * LookUpをセットする
 */
function* setLookUp(action) {    
    const lookUpInfo = yield call(getLookUp);
    if (lookUpInfo.isSuccessful) {
        yield put({
            type: "SET_LOOKUP",
            data: {
                floorMapOptions: lookUpInfo.data.floorMapOptions,
                layouts: lookUpInfo.data.layouts
            }
        });
        yield put({ type: "SET_OPTIONS", options: lookUpInfo.data.floorMapOptions, titles: FLOORMAP_OPTIONS });
        if (action.data) {
            yield put({ type: "REQUEST_SELECT_LAYOUT", data: { layoutId: action.data } });
        }
    }
    else {
        yield put({ type: "SHOW_ERROR_MESSAGE", message: lookUpInfo.errorMessage });
    }
}

/**
 * ラック画面の権限をセットする
 */
function* setRackAuthentication() {    
    const authenticationInfo = yield call(getRackAuthentication);
    if (authenticationInfo.isSuccessful) {
        const { auth } = authenticationInfo;
        const disabled = auth ? (auth.function.allowTypeNo === ALLOW_TYPE_NO.hide) : true
        yield put({ type: SET_DISABLED_RACK_FUNCTION, disabled });
    }
    else {
        yield put({ type: "SHOW_ERROR_MESSAGE", message: authenticationInfo.errorMessage });
    }
}

/**
* レイヤー情報を削除する
*/
function* clearLayerInfo(optionId) {
    switch (optionId) {
        case FLOORMAP_OPTIONS.tempmap.optionId:
            yield put({ type: "CHANGE_SWITCH_STATE", data: { optionId: optionId, isChecked: false } });   //温度分布スイッチ状態変更
            yield put({ type: "SET_TEMPMAP_PATH", data: null });
            break;
        default:
            break;
    }
}

/**
* 温度分布図レイヤ情報をセットする
*/
function* setTempMapInfo(needsKnownPointMark) {
    const updating = yield select(state => state.updating);
    if (!updating) {
        yield put({ type: "CHANGE_LOAD_STATE" });
    }
    const selectLayout = yield select(state => state.floorMapCommon.selectLayout);
    const tempMapOption = yield select(state => _.find(state.floorMapCommon.floorMapOptionInfo, { 'optionId': FLOORMAP_OPTIONS.tempmap.optionId }));
    const tempMapInfo = yield call(getTempMapInfo, selectLayout, _.get(tempMapOption, 'switchInfo.check'));
    if (tempMapInfo.isSuccessful) {
        yield put({ type: "SET_TEMPMAP_PATH", data: tempMapInfo.data });
        yield put({ type: "CHANGE_NETWORK_ERROR", isError: false });
    }
    else {
        if (updating && tempMapInfo.networkError) {
            yield put({ type: "CHANGE_NETWORK_ERROR", isError: true });
        } else {
            yield put({ type: "SHOW_ERROR_MESSAGE", message: tempMapInfo.errorMessage });
            yield !tempMapInfo.networkError && put({ type: "CHANGE_NETWORK_ERROR", isError: false });
        }
        yield put({ type: "CHANGE_CHECK_STATE", data: { optionId: FLOORMAP_OPTIONS.tempmap.optionId, isChecked: false } });
    }
    if (!updating) {
        yield put({ type: "CHANGE_LOAD_STATE" });
    }
}
//#endregion

//#region API
/**
* ルックアップ情報を取得する
*/
export function getLookUp() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, 'api/floorMap', null, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data && data.lookUp) {
                resolve({ isSuccessful: true, data: data.lookUp });
            } else {
                resolve({ isSuccessful: false, errorMessage: "初期情報の取得に失敗しました。" });
            }
        })
    });
}

/**
* 選択中レイアウトのインシデント情報を取得する
*/
export function getIncidentInfo(layout) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, 'api/IncidentLog/getByLayout', layout, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE, networkError: true });
            } else if (data && data.alarmResult) {
                resolve({ isSuccessful: true, data: data.alarmResult });
            } else {
                resolve({ isSuccessful: false, errorMessage: "インシデントログ情報の取得に失敗しました。" });
            }
        })
    });
}

/**
* 選択中レイアウトオブジェクトに紐づくラックビュー情報を取得する
*/
export function getRackView(selectObject) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, 'api/FloorMap/rackView', selectObject, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE, networkError: true });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "ラック情報の取得に失敗しました。" });
            }
        })
    });
}

/**
* 温度分布レイヤ情報を取得する
*/
export function getTempMapInfo(selectLayout, needsKnownPointMark) {
    const postData = {
        LayoutInfo: selectLayout,
        NeedsKnownPointMark: needsKnownPointMark
    }
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, 'api/floorMap/tempmap', postData, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE, networkError: true });
            } else if (data.requestResult && data.requestResult.isSuccess) {
                if (_.get(data, "tempMap.tempMapImage")) {
                    resolve({ isSuccessful: true, data: data.tempMap.tempMapImage });
                } else {
                    resolve({ isSuccessful: false, errorMessage: "温度分布図情報の取得に失敗しました。" });
                }
            } else {
                resolve({ isSuccessful: data.requestResult.isSuccess, errorMessage: data.requestResult.message });
            }
        })
    });
}

/**
 * ラック画面のアクセス権限を取得する
 */
export function getRackAuthentication() {
    return new Promise((resolve, reject) => {
        getAuthentication(FUNCTION_ID_MAP.rack, (auth, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (auth) {
                resolve({ isSuccessful: true, auth: auth });
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "ラック画面の権限取得に失敗しました。" });
            }
        });
    });
    
}
// #endregion

