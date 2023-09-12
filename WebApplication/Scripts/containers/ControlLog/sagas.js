/**
 * @license Copyright 2019 DENSO
 * 
 * ControlLog画面のsagaを生成する
 * 
 */
'use strict';

import { effects } from 'redux-saga';
const { fork, put, take, call, takeEvery, select } = effects;
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

import { REQUEST_INIT_INFO, REQUEST_GET_CONTROL_LOG_LIST } from './actions';
import { SET_MASTER_DATA, SET_EDIT_DATE, SET_EDIT_CONTROLTYPE_CONDITION } from './actions';

import { SET_LOOKUP } from 'SearchCondition/actions.js';
import { SET_SEARCH_RESULT } from 'SearchResult/actions';
import { SHOW_ERROR_MESSAGE, CHANGE_MODAL_STATE } from 'ModalState/actions';
import { CHANGE_LOAD_STATE } from 'LoadState/actions';

/**
 * rootSaga
 */
export default function* rootSaga() {
    yield takeEvery(REQUEST_INIT_INFO, initialize);                             //画面初期化
    yield takeEvery(REQUEST_GET_CONTROL_LOG_LIST, searchControlLogList);        //制御履歴リスト取得
}

//#region rootSagaから呼び出される関数

/**
 * 初期化
 */
function* initialize() {
    yield call(setLoadState, true);
    yield call(setLookUp);
    const controlTypes = yield select(state => state.controlTypes);
    const nowTime = moment().second(0).millisecond(0);
    yield put({ type: SET_EDIT_DATE, startDate: moment(nowTime).add(-1, 'h'), endDate: nowTime });
    yield put({ type: SET_EDIT_CONTROLTYPE_CONDITION, controlTypes: controlTypes && Object.keys(controlTypes) });
    yield call(setLoadState, false);
}

/**
 * 制御ログリストを検索する
 */
function* searchControlLogList(action) {
    yield call(setLoadState, true);
    const searchCondition = yield select(state => state.searchCondition.conditions);
    const specificCondition = yield select(state => state.specificCondition);
    const controlTypes = yield select(state => state.controlTypes);
    var lookUp = searchCondition && Object.assign(searchCondition);
    var typeCondition = {};
    (controlTypes && specificCondition.controlTypes) && specificCondition.controlTypes.forEach((key) => {
        typeCondition[key] = controlTypes[key];
    });    
    lookUp.startDate = specificCondition.startDate;
    lookUp.endDate = specificCondition.endDate;
    lookUp.controlTypes = typeCondition;
    yield call(setControlLogList, lookUp, action.showNoneMessage);
    yield call(setLoadState, false);
}

//#endregion

//#region データのセット

/**
 * LookUpをセットする
 */
function* setLookUp() {
    const lookUpInfo = yield call(getLookUp);
    if (lookUpInfo.isSuccessful) {
        yield put ({ type: SET_LOOKUP, value: lookUpInfo.data });
        yield put ({ type: SET_MASTER_DATA, controlTypes: lookUpInfo.data.controlTypes });
    } else {
        yield call(setErrorMessage, lookUpInfo.errorMessage);
    }
}

/**
 * 制御ログリストをセットする
 * @param {object} lookUp 検索条件
 */
function* setControlLogList(lookUp, showNoneMessage) {
    const controlLogInfo = yield call(getControlLogList, lookUp);
    if (controlLogInfo.isSuccessful) {
        yield put ({ type: SET_SEARCH_RESULT, value: controlLogInfo.data });
        if (showNoneMessage && controlLogInfo.data.rows.length <= 0) {
            yield put({ type: CHANGE_MODAL_STATE, data: { show: true, title: '検索', message:'検索条件に該当する制御ログがありません。', bsSize: 'sm', buttonStyle: 'message' }});
        }
    } else {
        yield call(setErrorMessage, controlLogInfo.errorMessage);
    }
}

//#endregion

//#region データのセット（単純なセットのみ）

/**
 * エラーメッセージをセットする（単純にセットのみ）
 * @param {string} message メッセージ
 */
function* setErrorMessage(message) {
    yield put({ type: SHOW_ERROR_MESSAGE, message: message });
}

/**
 * ロード状態を変更する
 * @param {boolean} isLoading ロード状態
 */
function* setLoadState(isLoading) {
    const current = yield select(state => state.isLoading);
    if (current !== isLoading) {
        yield put({ type: CHANGE_LOAD_STATE, isLoading: isLoading });        
    }
}

//#endregion

//#region API呼び出し

/**
 * マスターデータを取得する
 */
function getLookUp() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, '/api/controlHist/getLookUp', null, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: '検索条件のマスタ情報取得に失敗しました。' });
            }
        });
    });
}

/**
 * 制御コマンド一覧を取得する
 */
function getControlLogList(lookUp) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/controlHist/getControlLog', lookUp, (result, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (result) {
                resolve({ isSuccessful: true, data: result});
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "制御ログ取得に失敗しました。" });
            }
        });
    });    
}

//#endregion