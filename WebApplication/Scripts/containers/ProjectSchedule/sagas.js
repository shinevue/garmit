/**
 * @license Copyright 2020 DENSO
 * 
 * 案件スケジュール画面のsagaを生成する
 * 
 */
'use strict';

import { effects } from 'redux-saga';
const { fork, put, take, call, takeEvery, select } = effects;
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

import { REQUEST_REFRESH, REQUEST_CHANGE_DISPSETTING } from './actions';
import { SET_SCHEDULES, SET_DISP_SCHEDULE_LIST } from './actions.js';
import { UPDATE_SELECT } from './actions.js';
import { SET_DISPSETTING } from './actions.js';
import { SHOW_ERROR_MESSAGE } from 'ModalState/actions';
import { CHANGE_LOAD_STATE } from 'LoadState/actions';

import { getDispScheduleTypes, getDispScheduleList, SCHEDULE_TYPE } from 'projectScheduleUtility';

/**
 * rootSaga
 */
export default function* rootSaga() {
    yield takeEvery(REQUEST_REFRESH, refresh);                              //スケジュール一覧リフレッシュ
    yield takeEvery(REQUEST_CHANGE_DISPSETTING, changeDispSetting);         //表示設定変更
}

//#region rootSagaから呼び出される関数

/**
 * スケジュール表示画面のデータ更新
 */
function* refresh(action) {
    yield call(setLoadState, true);
    const dispSetting = yield select(state => state.dispSetting);
    const dispScheduleTypes = getDispScheduleTypes(dispSetting);
    yield call(setProjectSchedules, action.startDate, action.endDate, dispScheduleTypes);
    yield call(updateSelectSchedules, dispScheduleTypes);
    yield call(setLoadState, false);
}

/**
 * 表示設定を変更する ※サーバーへのアクセスなし
 */
function* changeDispSetting(action) {
    const { visible, scheduleType } = action;
    const dispSetting = yield select(state => state.dispSetting);    
    switch (scheduleType) {
        case SCHEDULE_TYPE.completeDate:
            dispSetting.completeDate = visible;
            break;
        case SCHEDULE_TYPE.openDate:
            dispSetting.openDate = visible;
            break;
        case SCHEDULE_TYPE.closeDate:
            dispSetting.closeDate = visible;
            break;
        case SCHEDULE_TYPE.opserveDate:
            dispSetting.opserveDate = visible;
            break;
    }
    const scheduleList = yield select(state => state.scheduleList);
    const dispScheduleTypes = getDispScheduleTypes(dispSetting);
    yield put({ type: SET_DISP_SCHEDULE_LIST, data: getDispScheduleList(scheduleList, dispScheduleTypes) });
    yield call(updateSelectSchedules, dispScheduleTypes);
    yield put({ type: SET_DISPSETTING, dispSetting });
}


//#endregion

//#region 設定等の関数

/**
 * 案件スケジュール一覧をセットする
 */
function* setProjectSchedules(startDate, endDate, dispScheduleTypes) {
    const result = yield call(getProjectSchedules, startDate, endDate);
    if (result.isSuccessful) {
        yield put({ type: SET_SCHEDULES, data: result.data.projectSchedules });
        const dispSchedules = getDispScheduleList(result.data.projectSchedules, dispScheduleTypes);
        yield put({ type: SET_DISP_SCHEDULE_LIST, data: dispSchedules });
    }
    else {
        yield call(setErrorMessage, result.errorMessage);
    }
}

/**
 * 選択中のスケジュールを更新する ※サーバーへのアクセスなし
 */
function* updateSelectSchedules(dispScheduleTypes) {
    const selectSchedules = yield select(state => state.selectSchedules);
    if (selectSchedules && selectSchedules.length > 0) {
        const scheduleList = yield select(state => state.scheduleList);
        yield put({ type: UPDATE_SELECT, schedules: scheduleList, dispScheduleTypes });
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
 * 案件スケジュール一覧を取得する
 */
function getProjectSchedules(startDate, endDate) {
    const parameter = { 
        startDate: startDate.format('YYYY/MM/DD HH:mm:ss'), 
        endDate: endDate.format('YYYY/MM/DD HH:mm:ss')
    };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/project/getSchedules', parameter, (data, networkError) => {
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

//#endregion
