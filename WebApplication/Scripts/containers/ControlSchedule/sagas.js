/**
 * @license Copyright 2019 DENSO
 * 
 * 制御スケジュール画面のsagaを生成する
 * 
 */
'use strict';

import { effects } from 'redux-saga';
const { fork, put, take, call, takeEvery, select } = effects;
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

import { REQUEST_REFRESH, UPDATE_SELECT } from './actions';
import { REQUEST_EDIT_SCHEDULE, REQUEST_SAVE, REQUEST_DELETE } from './actions';
import { REQUEST_RELATED_CONTROL_COMMANDS, REQUEST_CHANGE_SCHEDULE } from './actions';

import { SET_SCHEDULE_PLANS } from './actions';
import { SET_EDIT, CLEAR_EDIT } from './actions';
import { SET_USER_INFO, SET_LOCATIONS, SET_CONTROL_COMMANDS } from './actions';
import { CHANGE_SCHEDULE, CHANGE_VALIDATE, CHANGE_INVALID_SCHEDULE, CHANGE_SCHEDULE_COMMANDS } from './actions';

import { SUCCESS_SAVE, SUCCESS_DELETE, SHOW_ERROR_MESSAGE } from 'ModalState/actions';
import { CHANGE_LOAD_STATE } from 'LoadState/actions';
import { SET_WAITING_STATE } from 'WaitState/actions';

import { getMatchSchedule, getEmptySchedule, SCHEDULE_DATETIME_FORMAT, SCHEDULE_TIME_FORMAT } from 'controlScheduleUtility';
import { convertJsonDateToMoment } from 'datetimeUtility';

/**
 * rootSaga
 */
export default function* rootSaga() {
    yield takeEvery(REQUEST_REFRESH, refresh);                              //スケジュール表示画面リフレッシュ
    yield takeEvery(REQUEST_EDIT_SCHEDULE, requestEditSchedule);            //編集中スケジュール情報リクエスト
    yield takeEvery(REQUEST_SAVE, saveSchedule);                            //スケジュール保存
    yield takeEvery(REQUEST_DELETE, deleteSchedules);                       //スケジュール削除
    yield takeEvery(REQUEST_RELATED_CONTROL_COMMANDS, updateRelatedControlCommands);  //所属に関連するデータを設定（所属変更時）
    yield takeEvery(REQUEST_CHANGE_SCHEDULE, changeEditSchedule);           //スケジュール情報の変更（制御コマンド以外）
}

//#region rootSagaから呼び出される関数

/**
 * スケジュール表示画面のデータ更新
 */
function* refresh() {
    yield call(setLoadState, true);
    yield call(setSchedulePlans);
    yield call(updateSelectSchedules);
    yield call(clearEditInfo);
    yield call(setLoadState, false);
}

/**
 * 編集中のスケジュール設定のリクエスト
 */
function* requestEditSchedule(action) {
    yield call(setLoadState, true);
    yield call(setRelatedEditScheduleInfo, action.scheduleId, action.isRegister, action.callback);
    if (action.isRegister) {
        const mainEnterprise = yield select(state => state.userInfo.mainEnterprise);
        yield put({ type: SET_EDIT, data: getEmptySchedule(action.startDate, mainEnterprise) , isRegister: true }); //新規の場合はメイン所属をセット
        action.callback && action.callback(true);
    }
    const selectedEnterprises = yield select(state => state.editing && state.editing.enterprises);
    const enterpriseIds = selectedEnterprises ? selectedEnterprises.map((ent) => ent.enterpriseId) : [];
    yield call(setRelatedControlCommands, enterpriseIds);
    yield call(setLoadState, false);
}

/**
 * 所属変更時に関連情報をセットする
 * @param {*} action 
 */
function* updateRelatedControlCommands(action) {
    yield call(setLoadState, true);
    yield call(setRelatedControlCommands, action.enterpriseIds);
    yield call(setLoadState, false);
}

/**
 * スケジュールを保存する
 */
function* saveSchedule(action) {
    yield call(setLoadState, true);
    yield call(setWaitingState, true, 'save');    
    const result = yield call(postSaveControlSchedule, action.data);
    yield call(setWaitingState, false, null);
    if (result.isSuccessful) {
        yield put({ type: SUCCESS_SAVE, targetName: "スケジュール", okOperation:"transition" });
    }
    else {
        yield call(setErrorMessage, result.errorMessage);
    }
    yield call(setLoadState, false);
}

/**
 * スケジュールを削除する
 */
function* deleteSchedules(action) {
    yield call(setLoadState, true);
    yield call(setWaitingState, true, 'delete');
    
    //選択中スケジュールから削除対象取得
    const selectSchedules = yield select(state => state.selectSchedules);
    let deleteSchedules = [];
    if (action.scheduleId) {
        deleteSchedules.push(getMatchSchedule(selectSchedules, action.scheduleId));
    }
    else {
        deleteSchedules = _.cloneDeep(selectSchedules);  //指定がない場合はまとめて削除
    }

    //スケジュール削除
    const result = yield call(postDeleteControlSchedules, deleteSchedules.map((sch) => sch.controlScheduleId));
    if (result.isSuccessful) {
        yield put({ type: SUCCESS_DELETE, targetName: "スケジュール" });
    }
    else {
        yield call(setErrorMessage, result.errorMessage);
    }
    yield call(setWaitingState, false, null);
    yield call(setLoadState, false);
    yield call(refresh);  //画面リフレッシュ
}

/**
 * スケジュール情報（制御コマンド以外）を変更する
 */
function* changeEditSchedule(action) {
    const { key, value } = action;
    yield put({ type: CHANGE_SCHEDULE, key, value });

    const editing = yield select(state => state.editing)
    yield put({ type: CHANGE_VALIDATE, key, schedule: editing });
    if (key === 'enterprises') {
        yield put({ type: CHANGE_SCHEDULE_COMMANDS, commands: [], isError: true })
    }
        
    const validate = yield select(state => state.validate);
    yield put({ type: CHANGE_INVALID_SCHEDULE, validate });
}

//#endregion

//#region 設定等の関数

/**
 * 制御スケジュール一覧（表示用）をセットする
 */
function* setSchedulePlans() {
    const result = yield call(getControlSchedulePlans);
    if (result.isSuccessful) {
        yield put({ type: SET_SCHEDULE_PLANS, data: result.data });
    }
    else {
        yield call(setErrorMessage, result.errorMessage);
    }
}

/**
 * 選択中のスケジュールを更新する ※サーバーへのアクセスなし
 */
function* updateSelectSchedules() {
    const selectSchedules = yield select(state => state.selectSchedules);
    if (selectSchedules && selectSchedules.length > 0) {
        const schedulePlans = yield select(state => state.schedulePlans);
        yield put({ type: UPDATE_SELECT, schedulePlans: schedulePlans });
    } 
}

/**
 * 編集中制御スケジュールに関連する情報を設定する
 * @param {number} scheduleId スケジュールID
 * @param {boolean} isRegister 新規登録かどうか
 */
function* setRelatedEditScheduleInfo(scheduleId, isRegister, callback) {
    yield fork(setLookUp);      //LookUp(ログインユーザーの所属情報)の取得
    if (!isRegister) {
        yield fork(setEditControlSchedule, scheduleId, callback);        
    }
}

/**
 * 編集中制御スケジュールを設定する
 * @param {number} scheduleId スケジュールID
 */
function* setEditControlSchedule(scheduleId, callback) {
    const result = yield call(getControlSchedule, scheduleId);
    if (result.isSuccessful) {
        let data = result.data;
        const isRunningInfo = yield data && call(isRunningControlSchedule, data);
        if (isRunningInfo && isRunningInfo.isSuccessful === true) {
            data.scheduleStartDate = data.scheduleStartDate && convertJsonDateToMoment(data.scheduleStartDate, SCHEDULE_DATETIME_FORMAT);
            data.scheduleEndDate = data.scheduleEndDate && convertJsonDateToMoment(data.scheduleEndDate, SCHEDULE_DATETIME_FORMAT);
            data.operationStartDate = data.operationStartDate && convertJsonDateToMoment(data.operationStartDate, SCHEDULE_TIME_FORMAT);
            data.operationEndDate = data.operationEndDate && convertJsonDateToMoment(data.operationEndDate, SCHEDULE_TIME_FORMAT);
            yield put({ type: SET_EDIT, data: data, isRegister: false });
            callback && callback(true);
        } else {
            yield call(setErrorMessage, isRunningInfo.errorMessage);
            callback && callback(false);
        }
    }
    else {
        yield call(setErrorMessage, result.errorMessage);
        callback && callback(false);
    }
}

/**
 * LookUpを取得する
 */
function* setLookUp() {
    const result = yield call(getLookUp);
    if (result.isSuccessful) {
        const mainEnterprise = _.get(result.data, "loginUsers[0].mainEnterprise");
        yield put({ type: SET_USER_INFO, mainEnterprise: mainEnterprise, enterprises: result.data.enterprises });
    }
    else {
        yield call(setErrorMessage, result.errorMessage);
    }
}

/**
 * 制御コマンド関連情報を取得
 * @param {array} enterpriseIds 所属ID一覧
 */
function* setRelatedControlCommands(enterpriseIds) {    
    if (enterpriseIds && enterpriseIds.length > 0) {
        yield fork(setLocations, enterpriseIds);
        yield fork(setControlCommands, enterpriseIds);
    } else {
        //所属IDが指定されていなかった場合はクリアする
        yield put({ type: SET_LOCATIONS, data: [] });
        yield put({ type: SET_CONTROL_COMMANDS, data: [] });
    }
}

/**
 * ロケーションを取得する
 * @param {array} enterpriseIds 所属ID一覧
 */
function* setLocations(enterpriseIds) {
    const result = yield call(getLocations, enterpriseIds);
    if (result.isSuccessful) {
        yield put({ type: SET_LOCATIONS, data: result.data });
    }
    else {
        yield call(setErrorMessage, result.errorMessage);
    }
}

/**
 * 制御コマンド一覧を取得する
 * @param {array} enterpriseIds 所属ID一覧
 */
function* setControlCommands(enterpriseIds) {
    const result = yield call(getControlCommands, enterpriseIds);
    if (result.isSuccessful) {
        yield put({ type: SET_CONTROL_COMMANDS, data: result.data });
    }
    else {
        yield call(setErrorMessage, result.errorMessage);
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

/**
 * 保存中・削除中の待ち状態を変更する
 * @param {boolean} isWaiting 待ち状態
 * @param {string} waitingType 待ち種別（deleteやsave）
 */
function* setWaitingState (isWaiting, waitingType) {
    yield put({ type: SET_WAITING_STATE, isWaiting: isWaiting, waitingType: waitingType });
}

/**
 * 編集内容をクリアする
 */
function* clearEditInfo() {
    yield put({ type: CLEAR_EDIT });
}

//#endregion

//#region API呼び出し

/**
 * 制御スケジュール一覧（表示用）を取得する
 */
function getControlSchedulePlans() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, '/api/controlSchedule', null, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: '制御スケジュールの取得に失敗しました。' });
            }
        });
    });
}

/**
 * マスターデータを取得する
 */
function getLookUp() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, '/api/controlSchedule/lookUp', null, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: 'マスタ情報取得に失敗しました。' });
            }
        });
    });
}

/**
 * 制御スケジュール(登録用)を取得する
 * @param {number} scheduleId スケジュールID
 */
function getControlSchedule(scheduleId) {
    const postData = { id: scheduleId };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/controlSchedule/getSchedule', postData, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: '制御スケジュール取得に失敗しました。' });
            }
        });
    });
}

/**
 * 制御スケジュールを保存する
 * @param {object} schedule 制御スケジュール情報
 */
function postSaveControlSchedule(schedule) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/controlSchedule/save', schedule, (requestResult, networkError) => {
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
                resolve({ isSuccessful: false, errorMessage: "制御スケジュールの保存に失敗しました。" });
            }
        })
    })
}

/**
 * 制御スケジュールを削除する
 * @param {array} controlIds 制御IDリスト
 */
function postDeleteControlSchedules(scheduleIds) {
    const postData = { ids: scheduleIds };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/controlSchedule/delete', postData, (requestResult, networkError) => {
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
                resolve({ isSuccessful: false, errorMessage: "制御スケジュールの削除に失敗しました。" });
            }
        })
    })
}

/**
 * 指定した所属の制御コマンド一覧を取得する
 * @param {array} enterpriseIds 所属IDリスト
 */
function getControlCommands(enterpriseIds) {
    const postData = { enterpriseIds: enterpriseIds };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/controlCommand/enterpriseCommands', postData, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: '制御情報の取得に失敗しました。' });
            }
        })
    });
}

/**
 * 指定した所属のロケーション一覧を取得する
 * @param {array} enterpriseIds 所属IDリスト
 */
function getLocations(enterpriseIds) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/location/getLocationsByEntId', enterpriseIds, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: 'ロケーション情報の取得に失敗しました。' });
            }
        })
    });
}

/**
 * スケジュールが実行中かどうか確認する
 * @param {object} schedule スケジュール情報
 */
function isRunningControlSchedule(schedule) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/controlSchedule/isRunning', schedule, (requestResult, networkError) => {
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
                resolve({ isSuccessful: false, errorMessage: "実行中判定に失敗しました。" });
            }
        })
    });
}

//#endregion
