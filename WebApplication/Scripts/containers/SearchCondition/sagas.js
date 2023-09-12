/**
 * @license Copyright 2022 DENSO
 * 
 * SearchConditionのsagaを生成する
 * 
 */
'use strict';

import { effects } from "redux-saga";
const { fork, put, take, call, takeEvery, select } = effects;
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { REQUEST_CONDITION_LIST, SET_CONDITION_LIST } from './actions.js';
import { SET_ICCARD_TYPE } from './actions.js';
import { SHOW_ERROR_MESSAGE } from 'ModalState/actions';

/**
 * 検索条件用Saga
 */
const searchConditionSagas = [
    takeEvery(REQUEST_CONDITION_LIST, setCondisitonList)
];
export default searchConditionSagas;

/**
 * 登録済み検索条件リストを取得・セットする
 */
export function* setCondisitonList(action) {
    const info = yield call(getConditionList, action.functionId);
    if (info.isSuccessful) {
        yield put ({ type: SET_CONDITION_LIST, value: info.data });
    } else {
        yield call(setErrorMessage, info.errorMessage);
    }
}

/**
 * ICカード種別をセットする
 */
export function* setICCardType() {
    const icCardTypeInfo = yield call(getICCardType);
    if (icCardTypeInfo.isSuccessful) {
        yield put ({ type: SET_ICCARD_TYPE, icCardType: icCardTypeInfo.data });
    } else {
        yield call(setErrorMessage, icCardTypeInfo.errorMessage);
    }
}

/**
 * エラーメッセージをセットする（単純にセットのみ）
 * @param {string} message メッセージ
 */
function* setErrorMessage(message) {
    yield put({ type: SHOW_ERROR_MESSAGE, message: message });
}

//#region API呼び出し

/**
 * 登録済み検索条件一覧を取得する
 */
function getConditionList(functionId) {
    const sendingData = { functionId };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/searchCondition/getList', sendingData, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: '登録済み検索条件一覧取得に失敗しました。' });
            }
        });
    });
}

/**
 * マスターデータを取得する
 */
function getICCardType() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, '/api/setting/getIcCardType', null, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data || data === 0) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: 'ICカード種別取得に失敗しました。' });
            }
        });
    });
}

//#endregion