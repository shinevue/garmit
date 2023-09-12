/**
 * @license Copyright 2021 DENSO
 * 
 * ICカード画面のsagaを生成する
 * 
 */
'use strict';

import { effects } from "redux-saga";
const { fork, put, take, call, takeEvery, select, join } = effects;

import { REQUEST_REFRESH_ICTERMINAL_RESULT, REQUEST_EDIT_ICTERMINAL, REQUEST_SAVE, REQUEST_DELETE } from './actions.js';
import { SET_EDIT } from './actions.js';
import { SET_DELETE_TERM_NOS, SET_LOCATIONS } from './actions.js';

import { SET_SEARCH_RESULT } from 'SearchResult/actions';
import { CHANGE_LOAD_STATE } from "LoadState/actions";
import { SET_WAITING_STATE } from "WaitState/actions";
import { SUCCESS_SAVE, SUCCESS_DELETE, SHOW_ERROR_MESSAGE } from 'ModalState/actions';
import { START_UPDATE, END_UPDATE } from './actions.js';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { getEmptyICTerminal } from 'icTerminalUtility';

/**
 * rootSaga
 */
export default function* rootSaga() {
    yield takeEvery(REQUEST_REFRESH_ICTERMINAL_RESULT, refreshICTerminalList);  //ラック施開錠端末一覧のリフレッシュ
    yield takeEvery(REQUEST_EDIT_ICTERMINAL, setEditICTerminalInfo);            //編集中ラック施開錠端末情報をセットする（ロケーションツリーのマスタ情報も取得）
    yield takeEvery(REQUEST_SAVE, saveICTerminal);                              //ラック施開錠端末を保存する
    yield takeEvery(REQUEST_DELETE, deleteICTerminals);                         //ラック施開錠端末を削除する
}

//#region roogSagaから呼び出される関数

/**
 * ラック施開錠端末一覧をリフレッシュする
 */
function* refreshICTerminalList() {
    yield put({ type: START_UPDATE });
    yield call(setLoadState, true);
    yield call(updateICTerminalList);
    yield call(setLoadState, false);
    yield put({ type: END_UPDATE });
}

/**
 * 編集用のラック施開錠端末情報をセットする
 */
function* setEditICTerminalInfo(action) {
    yield call(setLoadState, true);
    yield call(setEdittingInfo, action.termNo, action.isRegister, action.callback);    
    if (!(yield select(state => state.updating))) {
        yield call(setLoadState, false);    
    }
}

/**
 * 編集情報をセットする
 * @param {number|null} termNo 端末番号
 * @param {boolean} isRegister 新規作成がどうか
 * @param {function} callback コールバック関数
 */
function* setEdittingInfo(termNo, isRegister, callback) {
    yield call(setLocations);
    if (!isRegister) {
        yield call(setEditICTerminal, termNo, callback);
    } else {
        yield put({ type: SET_EDIT, value: getEmptyICTerminal(), isRegister: true });
        callback && callback();
    }
}

/**
 * ラック施開錠端末を保存する
 */
function* saveICTerminal(){
    yield call(setWaitingState, true, 'save');
    const editICTerminal = yield select(state => state.editICTerminal);
    const saveICTerminalInfo = yield call(postSaveICTerminal, editICTerminal);
    if (saveICTerminalInfo.isSuccessful) {
        yield put({ type: SUCCESS_SAVE, targetName: "ラック施開錠端末", okOperation:"transition" });
    } else {
        yield call(setErrorMessage, saveScheduleInfo.errorMessage);
    }
    yield call(setWaitingState, false, null);
}

/**
 * ラック施開錠端末を削除する
 */
function* deleteICTerminals() {
    yield call(setWaitingState, true, 'delete');
    const deleteTermNos = yield select(state => state.deleteTermNos);
    if (deleteTermNos && deleteTermNos.length > 0) {
        const deleteICTerminalInfo = yield call(postDeleteICTerminals, deleteTermNos);
        if (deleteICTerminalInfo.isSuccessful) {
            yield put({ type: SUCCESS_DELETE, targetName: "ラック施開錠端末" });
            yield put({ type: SET_DELETE_TERM_NOS, value: null });      //削除対象端末番号リストをクリアする
        } else {
            yield call(setErrorMessage, deleteICTerminalInfo.errorMessage);
        }
        yield fork(refreshICTerminalList);            //ラック施開錠端末一覧をリフレッシュする
    }
    yield call(setWaitingState, false, null);
}

//#endregion

//#region その他関数

/**
 * スケジュール一覧を更新する
 */
function* updateICTerminalList() {
    const icTerminalInfo = yield call(getICTerminalList);
    if (icTerminalInfo.isSuccessful) {
        yield call(setICTerminalResult, icTerminalInfo.data);
    } else {
        yield call(setErrorMessage, icTerminalInfo.errorMessage);
    }
}

/**
 * ロケーション一覧をセットする
 */
function* setLocations() {
    const lookUpInfo = yield call(getLookUp);
    if (lookUpInfo.isSuccessful) {
        yield put({ type: SET_LOCATIONS, locations: lookUpInfo.data.locations });
    } else {
        yield call(setErrorMessage, locationsInfo.errorMessage);
    }
}

/**
 * 編集中のラック施開錠端末をセットする
 * @param {number} termNo 端末番号
 */
function* setEditICTerminal(termNo, callback) {
    const icTerminalInfo = yield call(getICTerminal, termNo);
    if (icTerminalInfo.isSuccessful) {
        yield put ({ type: SET_EDIT, value: icTerminalInfo.data, isRegister: false });
        callback && callback();
    } else {
        yield call(setErrorMessage, icTerminalInfo.errorMessage);
    }
}

//#endregion

//#region データのセット（単純にセットのみ）

/**
 * ラック施開錠端末一覧をセットする（単純にセットするだけ）
 * @param {object} data ラック施開錠端末一覧（SearchResult）
 */
function* setICTerminalResult(data) {
    yield put({ type: SET_SEARCH_RESULT, value: data });
}

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

/**
 * 保存中・削除中の待ち状態を変更する
 * @param {boolean} isWaiting 待ち状態
 * @param {string} waitingType 待ち種別（deleteやsave）
 */
function* setWaitingState (isWaiting, waitingType) {
    yield put({ type: SET_WAITING_STATE, isWaiting: isWaiting, waitingType: waitingType });
}

//#endregion

//#region API呼び出し

/**
 * ラック施開錠端末一覧の取得
 */
function getICTerminalList() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, '/api/icTerminal/getICTerminalResult', null, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: 'ラック施開錠端末一覧の取得に失敗しました。' });
            }
        });
    });
}

/**
 * ルックアップを取得する
 */
function getLookUp() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, '/api/icTerminal/getLookUp', null, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: 'マスタ情報の取得に失敗しました。' });
            }
        });
    });    
}

/**
 * ラック施開錠端末情報を取得する
 * @param {number} termNo 端末番号
 */
 function getICTerminal(termNo) {
    const postData = { id: termNo };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/icTerminal/getIcTerminal', postData, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: 'ラック施開錠端末情報の取得に失敗しました。' });
            }
        });
    });

}

/**
 * ラック施開錠端末を保存する
 * @param {object} icTerminal ラック施開錠端末
 */
 function postSaveICTerminal(icTerminal) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/icTerminal/setIcTerminal', icTerminal, (requestResult, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (requestResult) {
                if (requestResult.isSuccess) {
                    resolve({ isSuccessful: true });
                } else {
                    resolve({ isSuccessful: false, errorMessage: requestResult.message });
                }
            } else {
                resolve({ isSuccessful: false, errorMessage: 'ラック施開錠端末の保存に失敗しました。' });
            }
        });
    });
}

/**
 * ラック施開錠端末削除
 * @param {array} termNos 端末番号リスト
 */
function postDeleteICTerminals(termNos) {    
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/icTerminal/deleteIcTerminals', termNos, (requestResult, networkError) => { //API削除用関数呼び出し
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (requestResult) {
                if (requestResult.isSuccess) {
                    resolve({ isSuccessful: true });
                } else {
                    resolve({ isSuccessful: false, errorMessage: requestResult.message });
                }
            }
            else {
                resolve({ isSuccessful: false, errorMessage: 'ラック施開錠端末の削除に失敗しました。' });
            }
        })
    })
}

//#endregion
