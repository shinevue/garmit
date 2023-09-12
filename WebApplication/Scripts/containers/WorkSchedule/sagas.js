/**
 * @license Copyright 2017 DENSO
 * 
 * スケジュール画面のsagaを生成する
 * 
 */
'use strict';

import {
    SET_SCHEDULE,
    SHOW_SAVE_RESULT,
    SHOW_DELETE_RESULT,
    CLEAR_SELECT,
    UPDATE_SELECT,
    CLEAR_EDIT,
    SET_ENTERPRISES,
    CHANGE_SCHEDULE
} from "./actions";
import { CLOSE_MODAL, CONFIRM_DELETE, CONFIRM_CANCEL, CONFIRM_SAVE, SUCCESS_SAVE, SUCCESS_DELETE, SHOW_ERROR_MESSAGE } from 'ModalState/actions';
import { CHANGE_LOAD_STATE } from "LoadState/actions";
import { SET_WAITING_STATE } from "WaitState/actions";
import {  effects } from "redux-saga";
const { fork, put, take, call, takeEvery, select } = effects;
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { getMatchSchedule } from 'scheduleUtility';
import { getPointListData } from 'getPostData';
import { omitList, makeTreeData } from 'makeOmitData';

/**
 * rootSaga
 */
export default function* rootSaga() {
    yield takeEvery("REQUEST_SAVE", saveSchedule);     //スケジュール保存
    yield takeEvery("REQUEST_DELETE", deleteSchedule);   //スケジュール削除
    yield takeEvery("REQUEST_REFRESH", refresh);   //画面リフレッシュ
    yield takeEvery("REQUEST_ENTERPRISES", setEnterprises);    //ログインユーザーの所属情報取得
}

//#region アクションハンドラ
/**
 * スケジュール保存
 */
function* saveSchedule(action) {
    yield put({ type: CHANGE_LOAD_STATE, isLoading: true });
    yield put({ type: SET_WAITING_STATE, isWaiting: true, waitingType: "save" });
    const original = yield select(state => state.editing.original);
    const result = yield call(postSaveSchedule, action.data, original);
    yield put({ type: SET_WAITING_STATE, isWaiting: false, waitingType: null });
    if (result.isSuccess) {
        yield put({ type: SUCCESS_SAVE, targetName: "スケジュール",okOperation:"transition" });
    }
    else {
        yield put({ type: SHOW_ERROR_MESSAGE, message: result.message });
    }
    yield put({ type: CHANGE_LOAD_STATE, isLoading: false });
}

/**
 * スケジュール削除
 */
function* deleteSchedule(action) {
    yield put({ type: CHANGE_LOAD_STATE, isLoading: true });
    yield put({ type: SET_WAITING_STATE, isWaiting: true, waitingType: "delete" });

    //選択中スケジュールから削除対象取得
    const selectSchedules = yield select(state => state.selectSchedules);
    let deleteSchedules = [];
    if (action.data) {
        deleteSchedules.push(getMatchSchedule(selectSchedules, action.data));
    }
    else {
        deleteSchedules = _.cloneDeep(selectSchedules);  //まとめて削除
    }

    const result = yield call(postDeleteSchedule, deleteSchedules);
    yield put({ type: SET_WAITING_STATE, isWaiting: false, waitingType: null });
    if (result.isSuccess) {
        yield put({ type: SUCCESS_DELETE, targetName: "スケジュール" });
    }
    else {
        yield put({ type: SHOW_ERROR_MESSAGE, message: result.message });
    }
    yield put({ type: CHANGE_LOAD_STATE, isLoading: false });
    yield call(refresh);  //画面リフレッシュ
}

/**
 * 画面リフレッシュ
 */
function* refresh() {
    yield put({ type: CHANGE_LOAD_STATE, isLoading: true });

    //スケジュール一覧取得
    const result = yield call(getScheduleList);
    if (result.isSuccess) {
        yield put({ type: SET_SCHEDULE, data: result.data });
    }
    else {
        yield put({ type: SHOW_ERROR_MESSAGE, message: result.message });
    }

    //selectSchedule更新
    const selectSchedules = yield select(state => state.selectSchedules);
    if (selectSchedules && selectSchedules.length > 0) {
        const scheduleList = yield select(state => state.scheduleList);
        yield put({ type: UPDATE_SELECT, data: { scheduleList: scheduleList, } });
    }

    //編集中情報クリア
    yield put({ type: CLEAR_EDIT });

    yield put({ type: CHANGE_LOAD_STATE, isLoading: false });
}

/**
 * 所属情報取得
 */
function* setEnterprises(action) {
    yield put({ type: CHANGE_LOAD_STATE, data: true });
    const result = yield call(getLookUp);
    if (result.isSuccess) {
        const mainEnterprise = _.get(result.data, "loginUsers[0].mainEnterprise");
        const saveData = { mainEnterprise: mainEnterprise, enterprises:result.data.enterprises}
        yield put({ type: SET_ENTERPRISES, data: saveData });
        const mode = yield select(state => state.routing.locationBeforeTransitions.query.mode);
        if (mode === "add") {   //新規の場合はメイン所属を選択状態にする
            yield put({ type: CHANGE_SCHEDULE, data: { key: "enterprises", value: [mainEnterprise] } });
        }
    }
    else {
        yield put({ type: SHOW_ERROR_MESSAGE, message: result.message });
    }
    yield put({ type: CHANGE_LOAD_STATE, data: false });
}
//#endregion

//#region API呼び出し
/**
 * 登録スケジュール一覧取得
 */
function getScheduleList() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, '/api/schedule', null, (data, networkError) => { //APIスケジュール一覧取得用関数呼び出し
            if (networkError) {
                resolve({ isSuccess: false, message: NETWORKERROR_MESSAGE });
            } else if (data) {
                let maintenanceSchedules = data.maintenanceSchedules;
                resolve({ isSuccess: true, data: maintenanceSchedules });
            } else {
                resolve({ isSuccess: false, message: "スケジュール情報の取得に失敗しました。" });
            }
        })
    })
}

/**
 * スケジュール保存
 */
function postSaveSchedule(schedule, original) {
    let originalSchedule = original && _.pick(original, ["systemId", "scheduleId", "enterprise"]);
    let saveSchedule = _.cloneDeep(schedule);
    if (_.get(original, "points")) {
        originalSchedule.points =getPointListData(_.get(originalSchedule, "points", [])); 
    }
    saveSchedule.enterprises = omitList(saveSchedule.enterprises, ["enterpriseId", "systemSet"]);
    if (_.size(saveSchedule.points)) {
    saveSchedule.points = omitList(saveSchedule.points, ["systemId", "pointNo", "pointName", "maintMode"]);
    }

    const postData = { originalSchedule, saveSchedule };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/schedule/save', postData, (data, networkError) => { //API保存用関数呼び出し
            if (networkError) {
                resolve({ isSuccess: false, message: NETWORKERROR_MESSAGE });
            } else if (data&&data.isSuccess) {
                resolve(data);
            } else {
                if (!data) {
                    data = { isSuccess: false, message: "スケジュールの保存に失敗しました。" };
                }
                resolve(data);
            }
        })
    })
}

/**
 * スケジュール削除
 */
function postDeleteSchedule(schedules) {
    //送信用データ作成
    const postData = _.map(_.cloneDeep(schedules), (sch) => {
        return {
            systemId: sch.systemId,
            scheduleId: sch.scheduleId,
            name:sch.name
        }
    });
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/schedule/delete', postData, (data, networkError) => { //API削除用関数呼び出し
            if (networkError) {
                resolve({ isSuccess: false, message: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccess: true });
            } else {
                resolve({ isSuccess: false, message: "スケジュールの削除に失敗しました。" });
            }
        })
    })
}

/**
 * ルックアップ情報取得
 */
function getLookUp() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, '/api/schedule/lookUp', null, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccess: false, message: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve ({ isSuccess: true, data: data });
            } else {
                resolve ({ isSuccess: false, message: "初期情報の取得に失敗しました。" });
            }
        })
    })
}
//#endregion
