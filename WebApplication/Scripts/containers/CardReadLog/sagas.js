/**
 * @license Copyright 2021 DENSO
 * 
 * カード読み取りログ画面のsagaを生成する
 * 
 */
'use strict';

import { effects } from "redux-saga";
const { fork, put, take, call, takeEvery, select, join } = effects;
import { sendData, EnumHttpMethod } from 'http-request';

import { REQUEST_INIT_INFO, REQUEST_GET_CARD_READ_LOG_LIST } from './actions';

import { SET_LOOKUP } from 'SearchCondition/actions.js';
import { SET_SEARCH_RESULT } from 'SearchResult/actions';
import { SHOW_ERROR_MESSAGE, CHANGE_MODAL_STATE } from 'ModalState/actions';
import { CHANGE_LOAD_STATE } from 'LoadState/actions';

import { setICCardType } from 'SearchCondition/sagas.js';

/**
 * rootSaga
 */
export default function* rootSaga() {
    yield takeEvery(REQUEST_INIT_INFO, initialize);                             //画面初期化
    yield takeEvery(REQUEST_GET_CARD_READ_LOG_LIST, searchCardReadLogList);     //カード読み取りログ一覧検索
}

//#region rootSagaから呼び出される関数

/**
 * 初期化
 */
 function* initialize() {
    yield call(setLoadState, true);
    yield call(setInitialInfo);
    yield call(setLoadState, false);
}

/**
 * 制御ログリストを検索する
 */
function* searchCardReadLogList(action) {
    yield call(setLoadState, true);
    const lastSearchCondition = yield select(state => state.lastSearchCondition);
    yield call(setCardReadLogList, lastSearchCondition, action.showNoneMessage);
    yield call(setLoadState, false);
}

//#endregion

//#region データのセット

/**
 * 初期表示情報セット
 */
function* setInitialInfo() {
    yield fork(setLookUp);
    yield fork(setICCardType);
}

/**
 * LookUpをセットする
 */
function* setLookUp() {
    const lookUpInfo = yield call(getLookUp);
    if (lookUpInfo.isSuccessful) {
        yield put ({ type: SET_LOOKUP, value: lookUpInfo.data });
    } else {
        yield call(setErrorMessage, lookUpInfo.errorMessage);
    }
}

/**
 * カード読み取りログ一覧をセットする
 * @param {object} queryPrameter 検索条件
 */
function* setCardReadLogList(queryPrameter, showNoneMessage) {
    const cardReadLogInfo = yield call(getCardReadLogList, queryPrameter);
    if (cardReadLogInfo.isSuccessful) {
        yield put ({ type: SET_SEARCH_RESULT, value: cardReadLogInfo.data });
        if (showNoneMessage && cardReadLogInfo.data.rows.length <= 0) {
            yield put({ type: CHANGE_MODAL_STATE, data: { show: true, title: '検索', message:'検索条件に該当するカード読み取りログがありません。', bsSize: 'sm', buttonStyle: 'message' }});
        }
    } else {
        yield call(setErrorMessage, cardReadLogInfo.errorMessage);
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
        sendData(EnumHttpMethod.get, '/api/cardReadLog', null, (data, networkError) => {
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
 *カード読み取りログ一覧を取得する
 */
function getCardReadLogList(lookUp) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/cardReadLog/search', lookUp, (result, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (result) {
                resolve({ isSuccessful: true, data: result});
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "カード読み取りログ取得に失敗しました。" });
            }
        });
    });    
}

//#endregion
