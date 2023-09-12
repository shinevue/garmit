/**
 * @license Copyright 2019 DENSO
 * 
 * UnlockPurposeのsagaを生成する
 * 
 */
'use strict';

import { effects } from "redux-saga";
const { fork, put, take, call, takeEvery, select, join } = effects;
import { REQUEST_SAVE_UNLOCK_PURPOSE, REQUEST_DELETE_UNLOCK_PURPOSE } from './actions.js';
import { SET_UNLOCK_PURPOSE_LIST, SET_SELECTED_UNLCOKPURPOSE } from './actions.js';
import { CHANGE_LOAD_STATE } from 'LoadState/actions.js';
import { SUCCESS_SAVE, SUCCESS_DELETE, SHOW_ERROR_MESSAGE } from 'ModalState/actions';
import { SET_WAITING_STATE } from 'WaitState/actions.js';
import { getUnlockPurpose } from 'unlockPurposeUtility';
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

/**
 * 開錠目的用rootSaga
 */
const unlockPurposeSagas = [
    takeEvery(REQUEST_SAVE_UNLOCK_PURPOSE, saveUnlockPurpose),
    takeEvery(REQUEST_DELETE_UNLOCK_PURPOSE, deleteUnlockPurpose)
];

export default unlockPurposeSagas;

//#region roogSagaから呼び出される関数

/**
 * 開錠目的を保存する
 */
function* saveUnlockPurpose(action) {
    const { data, functionId, callback } = action;
    yield put({ type: SET_WAITING_STATE, isWaiting: true, waitingType: 'save' });
    const unlockPurposeInfo = yield call(postSaveUnlockPurpose, data, functionId);
    if (unlockPurposeInfo.isSuccessful) {
        yield put({ type: SUCCESS_SAVE, targetName: "開錠目的" });
    } else {
        yield call(setErrorMessage, unlockPurposeInfo.errorMessage);
    }
    callback && callback(unlockPurposeInfo.isSuccessful)
    yield fork(refreshUnlockPurposeList, data.unlockPurposeId > 0, data.purpose);       //開錠目的リストは更新する  
    yield put({ type: SET_WAITING_STATE, isWaiting: false, waitingType: null });
}

/**
 * 開錠目的を削除する
 */
function* deleteUnlockPurpose(action) {
    const { data, functionId } = action;
    yield put({ type: SET_WAITING_STATE, isWaiting: true, waitingType: 'delete' });
    const unlockPurposeInfo = yield call(postDeleteUnlockPurpose, data, functionId);
    if (unlockPurposeInfo.isSuccessful) {
        yield put({ type: SUCCESS_DELETE, targetName: "開錠目的" });
    } else {
        yield call(setErrorMessage, unlockPurposeInfo.errorMessage);
    }
    yield fork(refreshUnlockPurposeList, false, null);       //開錠目的リストは更新する  
    yield put({ type: SET_WAITING_STATE, isWaiting: false, waitingType: null });
}

//#endregion

//#region その他

/**
 * 開錠目的リストをリフレッシュする
 * @param {boolean} isEdit 編集かどうか
 * @param {string} purposeName 選択したい開錠目的名称 
 */
function* refreshUnlockPurposeList(isEdit, purposeName) {
    yield call(setLoadState, true);
    yield call(setUnlockPurposeList);
    const selectedUnlockPurpose = yield select(state => state.unlockPurposeInfo.selectedUnlockPurpose);
    const unlockPurposeList = yield select(state => state.unlockPurposeInfo.unlockPurposes);
    var update = null;
    if (selectedUnlockPurpose && isEdit) {
        update = unlockPurposeList.find((purpose) => purpose.unlockPurposeId === selectedUnlockPurpose.unlockPurposeId);
    } else {
        update = getUnlockPurpose(unlockPurposeList, purposeName);
    }
    yield put({ type: SET_SELECTED_UNLCOKPURPOSE, data: update });
    yield call(setLoadState, false);
}

//#endregion

//#region データのセット

/**
 * 開錠目的リストを設定する
 */
function* setUnlockPurposeList() {
    const unlockPurposeInfo = yield call(getUnlockPurposeList);
    if (unlockPurposeInfo.isSuccessful) {
        yield put({ type: SET_UNLOCK_PURPOSE_LIST, data: unlockPurposeInfo.data });
    } else {
        yield call(setErrorMessage, unlockPurposeInfo.errorMessage);
    }
}

//#endregion

//#region データのセット（単純なセットのみ）

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

/**
 * エラーメッセージをセットする（単純にセットのみ）
 * @param {string} message メッセージ
 */
function* setErrorMessage(message) {
    yield put({ type: SHOW_ERROR_MESSAGE, message: message });
}


//#endregion

//#region API


/**
 * 開錠目的リストを取得する
 */
function getUnlockPurposeList() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, '/api/unlockPurpose', null, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: '開錠目的マスタの取得に失敗しました。' });
            }
        });
    });

}

/**
 * 開錠目的を保存する
 * @param {object} unlockPurpose 保存する開錠目的
 * @param {number} functionId 機能番号
 */
function postSaveUnlockPurpose(unlockPurpose, functionId) {
    const postData = { 
        unlockPurpose: unlockPurpose,
        functionId: functionId
    };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/unlockPurpose/save', postData, (result, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (result) {
                resolve({ isSuccessful: true });
            } else {
                resolve({ isSuccessful: false, errorMessage: '開錠目的の保存に失敗しました。' });
            }
        });
    });
}

/**
 * 開錠目的を削除する
 * @param {object} unlockPurpose 削除する開錠目的
 * @param {number} functionId 機能番号
 */
function postDeleteUnlockPurpose(unlockPurpose, functionId) {
    const postData = { 
        unlockPurpose: unlockPurpose,
        functionId: functionId
    };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/unlockPurpose/delete', postData, (result, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (result) {
                resolve({ isSuccessful: true });
            } else {
                resolve({ isSuccessful: false, errorMessage: '開錠目的の削除に失敗しました。' });
            }
        })
    })
}

//#endregion


