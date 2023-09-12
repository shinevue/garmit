/**
 * @license Copyright 2019 DENSO
 * 
 * LineConnectionLog画面のsagaを生成する
 * 
 */
'use strict';

import { effects } from "redux-saga";
const { fork, put, take, call, takeEvery, select, join } = effects;
import { sendData, EnumHttpMethod } from 'http-request';

import { REQUEST_INITIAL_INFO } from './actions.js';

/**
 * rootSaga
 */
export default function* rootSaga() {
    yield takeEvery(REQUEST_INITIAL_INFO, setInitialInfo);  //初期情報取得
}

//#region roogSagaから呼び出される関数

/**
 * 初期表示情報取得
 */
function* setInitialInfo(action) {
   /* Do Something */
}
