/**
 * @license Copyright 2019 DENSO
 * 
 * バッテリ監視画面のsagaを生成する
 * 
 */
'use strict';

import { effects } from 'redux-saga';
const { fork, put, take, call, takeEvery, select } = effects;
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

import { REQUEST_INIT_INFO, REQUEST_UPDATE, REQUEST_UPDATE_MEASURE_DATA, REQUEST_SELECT_BATTERY } from './actions';
import { REQUEST_GET_OUTPUT_LIST, REQUEST_SET_REMEASURE } from './actions';
import { SET_DATATYPES, SET_DATAGETE_LIST, SET_SELECTED_BATTERY_DATA, SET_OUTPUT_RESULT } from './actions';
import { SHOW_ERROR_MESSAGE, CHANGE_MODAL_STATE } from 'ModalState/actions';
import { CHANGE_LOAD_STATE } from 'LoadState/actions';
import { SET_WAITING_STATE } from 'WaitState/actions';
import { CHANGE_NETWORK_ERROR } from 'NetworkError/actions';
import { START_UPDATE, END_UPDATE } from './actions.js';

/**
 * rootSaga
 */
export default function* rootSaga() {
    yield takeEvery(REQUEST_INIT_INFO, initializeInfo);                 //画面初期化
    yield takeEvery(REQUEST_UPDATE, updateBatteryInfo);                 //表示更新
    yield takeEvery(REQUEST_UPDATE_MEASURE_DATA, updateMeasuredData)    //バッテリの計測値情報のみ更新
    yield takeEvery(REQUEST_SELECT_BATTERY, setSelectedBatteryInfo);    //バッテリー選択
    yield takeEvery(REQUEST_GET_OUTPUT_LIST, setOutputList);            //CSVに出力する一覧をセットする
    yield takeEvery(REQUEST_SET_REMEASURE, setRemesureStatus);          //再測定フラグをセットする
}

//#region rootSagaから呼び出される関数

/**
 * 初期情報をセットする
 */
function* initializeInfo() {
    yield put({ type: CHANGE_LOAD_STATE, isLoading: true });
    yield call(setInitInfo);
    yield put({ type: CHANGE_LOAD_STATE, isLoading: false });
}

/**
 * 機器一覧とバッテリ計測値情報を更新する
 * @param {*} action 
 */
function* updateBatteryInfo(action) {
    //手動更新中もしくはロード中の場合は更新ストップ
    if ((yield select(state => state.updating)) || (yield select(state => state.isLoading))) {
        _.get(action.data, 'callback') && action.data.callback(); //タイマー設定用コールバック
        return;
    }
   
    yield put({ type: START_UPDATE });
    yield put({ type: CHANGE_LOAD_STATE });
    const selectedBatteryData = yield select(state => state.selectedBatteryData);
    if (selectedBatteryData && selectedBatteryData.gateId) {
        yield call(setUpdateBatteryInfo, selectedBatteryData.gateId);
    }
    _.get(action.data, 'callback') && action.data.callback();
    yield put({ type: CHANGE_LOAD_STATE });
    yield put({ type: END_UPDATE });

}

/**
 * 測定値一覧を更新する
 * @param {*} action 
 */
function* updateMeasuredData() {
    //手動更新中もしくはロード中の場合は更新ストップ
    if ((yield select(state => state.updating)) || (yield select(state => state.isLoading))) {
        return;
    }

    yield put({ type: START_UPDATE });
    yield put({ type: CHANGE_LOAD_STATE });
    const selectedBatteryData = yield select(state => state.selectedBatteryData);
    if (selectedBatteryData && selectedBatteryData.gateId) {
        yield call(setBatteryValueData, selectedBatteryData.gateId, true);
    }
    yield put({ type: CHANGE_LOAD_STATE });
    yield put({ type: END_UPDATE });    
}

/**
 * 選択中のバッテリ情報をセットする
 * @param {*} action 
 */
function* setSelectedBatteryInfo(action) {
    yield put({ type: CHANGE_LOAD_STATE, isLoading: true });
    yield call(setBatteryValueData, action.data, false);
    yield put({ type: CHANGE_LOAD_STATE, isLoading: false });
}

/**
 * CSV出力一覧情報をセットする
 * @param {*} action 
 */
function* setOutputList(action) {
    const outputList = yield call(getDatagatResult, action.data.gateId);         //機器IDの指定がない場合は全機器のCSV出力
    if (outputList.isSuccessful) {
        yield put({ type: SET_OUTPUT_RESULT, data: outputList.data });
        _.get(action.data, 'callback') && action.data.callback();           //コールバックがある場合は、指定する        
    } else {
        yield put({ type: SHOW_ERROR_MESSAGE, message: outputList.errorMessage });
    }
}

/**
 * 再測定フラグをセットする
 * @param {*} action 
 */
function* setRemesureStatus(action) {
    yield put({ type: SET_WAITING_STATE, isWaiting: true, waitingType: "save" });
    yield call(setRemesureFlg, action.data.gateId);
    yield put({ type: SET_WAITING_STATE, isWaiting: false, waitingType: null });
}

//#endregion

//#region その他関数

/**
 * 初期設定情報をセットする
 */
function* setInitInfo() {
    yield fork(setLookUp);
    yield fork(setInitBatteryInfo);
}

/**
 * ルックアップを設定する
 */
function* setLookUp() {
    const lookUpInfo = yield call(getLookUp);
    if (lookUpInfo.isSuccessful) {
        yield put({ type: SET_DATATYPES, data: lookUpInfo.data.dataTypes });
        
    } else {
        yield put({ type: SHOW_ERROR_MESSAGE, message: lookUpInfo.errorMessage });
    }
}

/**
 * バッテリ情報の初期化
 */
function* setInitBatteryInfo() {
    const datagatesInfo = yield call(getDatagateList);
    if (datagatesInfo.isSuccessful) {
        const datagateResult = _.get(datagatesInfo, 'data');
        yield put({ type: SET_DATAGETE_LIST, data: datagateResult });
        if (datagateResult.rows.length > 0) {
            let selected = datagateResult.rows[0];     //一番上の情報を選択する
            yield fork(setBatteryValueData, selected.parameterKeyPairs.length > 0 ? selected.parameterKeyPairs[0].key : null);
        }
    } else {
        yield put({ type: SHOW_ERROR_MESSAGE, message: datagatesInfo.errorMessage });
    }
}

/**
 * バッテリー情報を更新する
 * @param {number} selectedGateId 選択中の機器ID
 */
function* setUpdateBatteryInfo(selectedGateId) {
    yield fork(setDatagaetList, true);
    yield fork(setBatteryValueData, selectedGateId, true);
}

/**
 * バッテリ機器一覧をセットする
 */
function* setDatagaetList(updating) {
    const datagatesInfo = yield call(getDatagateList);
    if (datagatesInfo.isSuccessful) {
        yield put({ type: SET_DATAGETE_LIST, data: datagatesInfo.data });
    } else {
        if (updating && datagatesInfo.networkError) {
            yield put({ type: CHANGE_NETWORK_ERROR, isError: true });
        } else {
            yield put({ type: SHOW_ERROR_MESSAGE, message: datagatesInfo.errorMessage });
            yield !datagatesInfo.networkError && put({ type: CHANGE_NETWORK_ERROR, isError: false });
        }
    }
}

/**
 * バッテリ機器の計測値情報をセットする
 * @param {number} gateId 機器ID
 */
function* setBatteryValueData(gateId, updating) {
    const valuedataInfo = yield call(getBatteryValueData, gateId);
    if (valuedataInfo.isSuccessful) {
        yield put({ type: SET_SELECTED_BATTERY_DATA, data: valuedataInfo.data });
        yield put({ type: CHANGE_NETWORK_ERROR, isError: false });
    } else {
        if (updating && valuedataInfo.networkError) {
            yield put({ type: CHANGE_NETWORK_ERROR, isError: true });
        } else {
            yield put({ type: SHOW_ERROR_MESSAGE, message: valuedataInfo.errorMessage });
            yield !valuedataInfo.networkError && put({ type: CHANGE_NETWORK_ERROR, isError: false });
        }
    }
}

/**
 * 再更新フラグをセットする
 * @param {number} gateId 機器ID
 */
function* setRemesureFlg(gateId) {
    const result = yield call(saveRemesureFlg, gateId);
    if (result.isSuccessful) {
        yield put({ type: CHANGE_MODAL_STATE, 
                    data: {
                       show: true,
                       title: '送信成功',
                       message: '再測定リクエストを送信しました。',
                       bsSize: 'sm',
                       buttonStyle: 'message',
                       okOperation: 'confirmUpdate'
                    }});
    } else {
        yield put({ type: SHOW_ERROR_MESSAGE, message: result.errorMessage });
    }
}

//#endregion

//#region API呼び出し

/**
 * ルックアップ情報を取得する
 */
function getLookUp() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, '/api/device/getBatteryLookUp', null, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: '初期情報の取得に失敗しました。' });
            }
        })
    })
}

/**
 * 機器一覧を取得する
 */
function getDatagateList() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, '/api/device/getBattery', null, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE, networkError: true });
            } else if (data) {
                resolve({ isSuccessful: true, data: data, networkError: false });
            } else {
                resolve({ isSuccessful: false, errorMessage: '機器一覧の取得に失敗しました。', networkError: false });
            }
        })
    })
}

/**
 * バッテリー機器の計測値情報を取得する
 * @param {number} gateId 機器ID
 */
function getBatteryValueData(gateId) {
    let query = { gateId: gateId };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/device/valueData', query, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE, networkError: true });
            } else if (data) {
                resolve({ isSuccessful: true, data: data, networkError: false });
            } else {
                resolve({ isSuccessful: false, errorMessage: '計測値情報の取得に失敗しました。', networkError: false });
            }
        })
    })
}

/**
 * 機器の計測値情報一覧を取得する
 * @param {number|null} gateId 機器ID（機器が未指定の場合は全機器の一覧を取得する）
 */
function getDatagatResult(gateId) {
    let query = { gateId: gateId };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/device/datagateReport', query, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: '計測値一覧の取得に失敗しました。' });
            }
        })
    })
}

/**
 * 再測定フラグをたてて保存する
 * @param {number} gateId 機器ID
 */
function saveRemesureFlg(gateId) {
    let query = { gateId: gateId };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/device/errorResetByGateId', query, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true });
            } else {
                resolve({ isSuccessful: false, errorMessage: '再計測リクエストに失敗しました。' });
            }
        })
    })
}

//#endregion
