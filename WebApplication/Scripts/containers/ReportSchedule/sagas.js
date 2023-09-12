/**
 * @license Copyright 2019 DENSO
 * 
 * レポートスケジュール画面のsagaを生成する
 * 
 */
'use strict';

import {  effects } from "redux-saga";
const { fork, put, take, call, takeEvery, select } = effects;

import { REQUEST_INITIAL_INFO, REQUEST_REFRESH_SCHEDULE_RESULT } from './actions.js';
import { REQUEST_EDIT_SCHEDULE, REQUEST_CLEAR_EDIT_SCHEDULE, REQUEST_CHANGE_ENTERPRISE, REQUEST_SAVE, REQUEST_DELETE } from './actions.js';
import { REQUEST_OUTPUTFILE_RESULT, REQUEST_DELETE_FILES } from './actions.js';
import { SET_EDIT, CHANGE_SCHEDULE_OVERVIEW, CHANGE_SCHEDULE_CONDITION, CLEAR_EDIT } from './actions.js';
import { SET_SELECTED_SCHEDULE_ID } from './actions.js';
import { SET_OUTPUTFILE_RESULT } from './actions.js';
import { SET_LOOKUP, CLEAR_LOOKUP, SET_EDITING_CONDITION } from 'SearchCondition/actions.js';
import { SET_ENTERPRISES, CHANGE_SHOW_DOWNLOAD_MODAL, SET_DELETE_SCHEDULEIDS, CLEAR_DELETE_FILES } from './actions.js';

import { SET_SEARCH_RESULT } from 'SearchResult/actions';
import { CHANGE_LOAD_STATE } from "LoadState/actions";
import { SET_WAITING_STATE } from "WaitState/actions";
import { SUCCESS_SAVE, SUCCESS_DELETE, SHOW_ERROR_MESSAGE } from 'ModalState/actions';
import { START_UPDATE, END_UPDATE } from './actions.js';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { getEmptyReportSchedule, getEmptyCondition, convertReportScheduleToLookUp } from 'reportScheduleUtility'
import { BUTTON_OPERATION_TYPE, SEARCHRESULT_CELL_TYPE } from 'constant';

/**
 * rootSaga
 */
export default function* rootSaga() {
    yield takeEvery(REQUEST_INITIAL_INFO, refreshScheduleList);                 //画面初期化
    yield takeEvery(REQUEST_REFRESH_SCHEDULE_RESULT, refreshScheduleList);      //スケジュール一覧のリフレッシュ
    yield takeEvery(REQUEST_DELETE, deleteSchedules);                           //スケジュールの削除
    yield takeEvery(REQUEST_OUTPUTFILE_RESULT, showOutputFileResult);           //出力ファイル一覧を表示する
    yield takeEvery(REQUEST_DELETE_FILES, deleteOutputFiles);                   //出力ファイルを削除する
    yield takeEvery(REQUEST_EDIT_SCHEDULE, setEditReportScheduleInfo);          //編集スケジュールをセットする
    yield takeEvery(REQUEST_CLEAR_EDIT_SCHEDULE, clearEditSchedule)             //編集スケジュールをクリアする
    yield takeEvery(REQUEST_CHANGE_ENTERPRISE, setLookUp);                      //選択所属のルックアップを取得する
    yield takeEvery(REQUEST_SAVE, saveReportSchedule);                          //スケジュールを保存する
}

//#region rootSagaから呼び出される関数

/**
 * スケジュール一覧をリフレッシュする
 */
function* refreshScheduleList() {
    yield put({ type: START_UPDATE });
    yield call(setLoadState, true);
    yield call(updateScheduleList);
    yield call(setLoadState, false);
    yield put({ type: END_UPDATE });
}

/**
 * スケジュールを削除する
 */
function* deleteSchedules() {
    yield call(setWaitingState, true, 'delete');
    const targetScheduleIds = yield select(state => state.deleteScheduleIds);
    if (targetScheduleIds && targetScheduleIds.length > 0) {
        const scheduleInfo = yield call(postDeleteSchedules, targetScheduleIds);
        if (scheduleInfo.isSuccessful) {
            yield put({ type: SUCCESS_DELETE, targetName: "スケジュール" });
            yield put({ type: SET_DELETE_SCHEDULEIDS, value: null });      //削除対象スケジュールIDをクリアする
        } else {
            yield call(setErrorMessage, scheduleInfo.errorMessage);
        }
        yield fork(refreshScheduleList);            //スケジュール一覧をリフレッシュする
    }
    yield call(setWaitingState, false, null);
}

/**
 * 出力ファイル一覧表示
 */
function* showOutputFileResult(action) {
    yield call(setLoadState, true);
    yield put({ type: CHANGE_SHOW_DOWNLOAD_MODAL, show: true });        //出力ファイル一覧モーダル表示
    const outputFilesInfo = yield call(getOutputFileResult, action.scheduleId);
    if (outputFilesInfo.isSuccessful) {
        yield put({ type: SET_SELECTED_SCHEDULE_ID, value: action.scheduleId });
        yield call(setOutputFileResult, outputFilesInfo.data);
    } else {
        yield call(setErrorMessage, outputFilesInfo.errorMessage);
    }
    yield call(setLoadState, false);    
}

/**
 * 出力ファイルを削除する
 */
function* deleteOutputFiles() {
    yield call(setWaitingState, true, 'delete');
    const targetFileListInfo = yield select(state => state.deleteFileListInfo);
    const { scheduleId, fileNos } = targetFileListInfo;
    if (scheduleId && fileNos && fileNos.length > 0) {
        const outputFileInfo = yield call(postDeleteOutputFiles, scheduleId, fileNos);
        if (outputFileInfo.isSuccessful) {
            yield put({ type: SUCCESS_DELETE, targetName: "出力ファイル" });
            yield put({ type: CLEAR_DELETE_FILES });    //削除対象をクリアする
        } else {
            yield call(setErrorMessage, outputFileInfo.errorMessage);
        }
        if (outputFileInfo.data && outputFileInfo.data.reportOutputFileResult) {
            yield call(setOutputFileResult, outputFileInfo.data.reportOutputFileResult);
        }
    }
    yield call(setWaitingState, false, null);
}

/**
 * 編集用のレポートスケジュールをセットする
 */
function* setEditReportScheduleInfo(action) {
    yield call(setLoadState, true);
    yield call(setEdittingInfo, action.scheduleId, action.isRegister, action.callback);    
    if (!(yield select(state => state.updating))) {
        yield call(setLoadState, false);    
    }
}

/**
 * 編集スケジュールをクリアする
 */
function* clearEditSchedule() {
    yield put({ type: CLEAR_EDIT });
    yield put({ type: CLEAR_LOOKUP });
}

/**
 * ルックアップを取得する
 */
function* setLookUp(action) {
    yield call(setLoadState, true);
    const { enterprise, isError } = action;
    if (enterprise && enterprise.enterpriseId && enterprise.enterpriseId > 0) {
        const lookUpInfo = yield call(getLookUp, enterprise.enterpriseId);
        if (lookUpInfo.isSuccessful) {
            const emptyCondition = getEmptyCondition(lookUpInfo.data.dataTypes);
            yield put ({ type: SET_EDITING_CONDITION, value: emptyCondition });
            yield put ({ type: CHANGE_SCHEDULE_CONDITION, value: emptyCondition, isError: true });
            yield put ({ type: CHANGE_SCHEDULE_OVERVIEW, key: 'enterprise', value: enterprise, isError: isError });
            yield put ({ type: SET_LOOKUP, value: lookUpInfo.data });
        } else {
            yield call(setErrorMessage, lookUpInfo.errorMessage);
        }
    } else {
        yield put ({ type: CHANGE_SCHEDULE_CONDITION, value: getEmptyCondition(), isError: true });
        yield put ({ type: CHANGE_SCHEDULE_OVERVIEW, key: 'enterprise', value: enterprise, isError: isError });
        yield put({ type: CLEAR_LOOKUP });      //検索条件クリア
    }
    yield call(setLoadState, false);    
}

/**
 * レポートスケジュールを保存する
 */
function* saveReportSchedule(){
    yield call(setWaitingState, true, 'save');
    const editReportSchedule = yield select(state => state.editReportSchedule);
    const saveScheduleInfo = yield call(postSaveSchedule, editReportSchedule);
    if (saveScheduleInfo.isSuccessful) {
        yield put({ type: SUCCESS_SAVE, targetName: "スケジュール", okOperation:"transition" });
        yield call(clearEditSchedule);                                              //編集中のスケジュールをクリアする
        yield call(setScheduleResult, saveScheduleInfo.data.reportScheduleResult);  //スケジュール一覧をリフレッシュする
    } else {
        yield call(setErrorMessage, saveScheduleInfo.errorMessage);
    }
    yield call(setWaitingState, false, null);
}


//#endregion

//#region その他関数

/**
 * スケジュール一覧を更新する
 */
function* updateScheduleList() {
    const scheduleInfo = yield call(getScheduleList);
    if (scheduleInfo.isSuccessful) {
        yield call(setScheduleResult, scheduleInfo.data);
    } else {
        yield call(setErrorMessage, scheduleInfo.errorMessage);
    }
}

/**
 * 所属一覧をセットする
 */
function* setEnterprises() {
    const enterprisesInfo = yield call(getEnterprises);
    if (enterprisesInfo.isSuccessful) {
        yield put({ type: SET_ENTERPRISES, value: enterprisesInfo.data });
    } else {
        yield call(setErrorMessage, enterprisesInfo.errorMessage);
    }
}

/**
 * 編集情報をセットする
 * @param {number|null} scheduleId スケジュールID
 * @param {boolean} isRegister 新規作成がどうか
 */
function* setEdittingInfo(scheduleId, isRegister, callback) {
    yield fork(setEnterprises);
    if (!isRegister) {
        yield fork(setEditReportSchedule, scheduleId, callback);
    } else {
        yield put({ type: CLEAR_LOOKUP });
        yield put({ type: SET_EDIT, value: getEmptyReportSchedule(), isRegister: true });
        callback && callback();
    }
}

/**
 * 編集中のレポートスケジュールをセットする
 * @param {number} scheduleId レポートスケジュールID
 */
function* setEditReportSchedule(scheduleId, callback) {
    const reportScheduleInfo = yield call(getReportSchedule, scheduleId);        //スケジュールIDからスケジュール情報を取得する
    if (reportScheduleInfo.isSuccessful) {
        yield put ({ type: SET_EDITING_CONDITION, value: convertReportScheduleToLookUp(reportScheduleInfo.data) });
        yield put ({ type: SET_EDIT, value: reportScheduleInfo.data, isRegister: false });
        callback && callback();
        const lookUpInfo = yield call(getLookUp, reportScheduleInfo.data.enterpriseId);
        if (lookUpInfo.isSuccessful) {
            yield put ({ type: SET_LOOKUP, value: lookUpInfo.data });
        } else {
            yield call(setErrorMessage, lookUpInfo.errorMessage);
        }
    } else {
        yield call(setErrorMessage, reportScheduleInfo.errorMessage);
    }
}

//#endregion

//#region データのセット（単純にセットのみ）

/**
 * スケジュール一覧をセットする（単純にセットするだけ）
 * @param {object} data スケジュール一覧（SearchResult）
 */
function* setScheduleResult(data) {
    yield put({ type: SET_SEARCH_RESULT, value: data });
}

/**
 * 出力ファイル一覧をセットする（単純にセットのみ）
 * @param {object} data 出力ファイル一覧
 */
function* setOutputFileResult(data) {
    yield put({ type: SET_OUTPUTFILE_RESULT, value: data });
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
 * スケジュール情報の取得
 */
function getScheduleList() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, '/api/report/schedules', null, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: 'スケジュールの取得に失敗しました。' });
            }
        });
    });
}

/**
 * 所属一覧取得
 */
function getEnterprises() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, '/api/Enterprise/enterprises', null, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: '所属の取得に失敗しました。' });
            }
        });
    });
}

/**
 * レポートスケジュール情報を取得する
 * @param {number} scheduleId スケジュールID
 */
function getReportSchedule(scheduleId) {
    const postData = { scheduleId: scheduleId };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/report/schedule', postData, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: 'スケジュール情報の取得に失敗しました。' });
            }
        });
    });

}

/**
 * 該当所属で表示可能な検索条件を取得する
 * @param {number} enterpriseId 選択した所属ID
 */
function getLookUp(enterpriseId) {
    const postData = { enterpriseId: enterpriseId };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/report/schedule/lookUp', postData, (data, networkError) => {
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
 * スケジュールを保存する
 * @param {object} schedule スケジュール情報
 */
function postSaveSchedule(schedule) {
    const postData = { reportSchedule: schedule };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/report/schedule/save', postData, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data && data.requestResult) {
                if (data.requestResult.isSuccess) {
                    resolve({ isSuccessful: true, data: data });
                } else {
                    resolve({ isSuccessful: false, errorMessage: data.requestResult.message });
                }
            } else {
                resolve({ isSuccessful: false, errorMessage: 'スケジュールの保存に失敗しました。' });
            }
        });
    });
}

/**
 * スケジュール削除
 * @param {array} scheduleIds スケジュールID群
 */
function postDeleteSchedules(scheduleIds) {
    const postData = (scheduleIds.length === 1) ? { scheduleId: scheduleIds[0] } : { scheduleIds: scheduleIds };
    const url = (scheduleIds.length === 1) ? '/api/report/schedule/delete' : '/api/report/schedules/delete';
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, url, postData, (data, networkError) => { //API削除用関数呼び出し
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data && data.requestResult) {
                if (data.requestResult.isSuccess) {
                    resolve({ isSuccessful: true });
                } else {
                    resolve({ isSuccessful: false, errorMessage: data.requestResult.message });
                }
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "スケジュールの削除に失敗しました。" });
            }
        })
    })
}

/**
 * 出力ファイル一覧取得
 * @param {number} scheduleId スケジュールID
 */
function getOutputFileResult(scheduleId) {
    const postData = { scheduleId: scheduleId };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/report/outputFiles', postData, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: '出力ファイル一覧の取得に失敗しました。' });
            }
        });
    });
}

/**
 * 出力ファイルを削除する
 * @param {number} scheduleId スケジュールID
 * @param {array} fileNos ファイル番号リスト
 */
function postDeleteOutputFiles(scheduleId, fileNos) {
    const postData = { scheduleId: scheduleId, fileNos: fileNos };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/report/outputFiles/delete', postData, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data && data.requestResult) {
                if (data.requestResult.isSuccess) {
                    resolve({ isSuccessful: true, data: data });
                } else {
                    resolve({ isSuccessful: false, data: data, errorMessage: data.requestResult.message });
                }
            } else {
                resolve({ isSuccessful: false, errorMessage: "出力ファイル削除に失敗しました。" });
            }
        });
    });
}

//#endregion
