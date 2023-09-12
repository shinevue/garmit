/**
 * @license Copyright 2017 DENSO
 * 
 * RackMaintenance画面のsagaを生成する
 * 
 */
'use strict';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { SET_LAYOUT_LIST, SET_LAYOUT_INFO, REQUEST_CAMERA_INFO, SET_CAMERA_LIST, SET_SETTING_LIST, SET_CAMERA_INFO, SET_CAMERA_HEIGHT, SET_CAMERA_MODE, SET_SETTING, CHANGE_LOAD_STATE,  CHANGE_MODAL_STATE } from "./actions";
import {  effects } from "redux-saga";
const { fork, put, take, call, takeEvery, select } = effects;
import { showErrorModalInfo } from 'messageModalUtility';

/**
 * rootSaga
 */
export default function* rootSaga() {
    yield takeEvery("REQUEST_LAYOUT_LIST", handleRequestLayoutList);        //レイアウト一覧取得
    yield takeEvery("REQUEST_LAYOUT_INFO", handleSelectLocation);           //レイアウト選択
    //yield takeEvery("SET_LAYOUTN_INFO", handleSelectLocation);             ルーム情報取得
    yield takeEvery("SET_CAMERA_LIST", handleSetCameraInfo);                //全カメラ情報設定
    yield takeEvery("REQUEST_CAMERA_INFO", handleRequestCameraInfo);        //カメラ選択
    yield takeEvery("CHANGE_CAMERA_STATE", handleChangeCameraState);        //カメラ操作（モード、パン/チルト、ズーム、高さ変更）
    yield takeEvery("CHANGE_SETTING", handleChangeSetting);                 //設定変更
}

//#region アクションハンドラ
/**
 * レイアウト一覧情報取得
 */
function* handleRequestLayoutList(action) {
    yield put({ type: CHANGE_LOAD_STATE, value: true });
    //レイアウト一覧情報取得
    const layoutResult =yield call(getlayoutList);
    if (layoutResult.isSuccessful) {
        yield put({ type: SET_LAYOUT_LIST, value: layoutResult.data });
    }
    else {
        yield put({ type: CHANGE_MODAL_STATE, value: showErrorModalInfo(layoutResult.errorMessage) });
    }
    yield put({ type: CHANGE_LOAD_STATE, value: false });
}

/**
 * レイアウト選択
 */
function* handleSelectLocation(action) {
    yield put({ type: CHANGE_LOAD_STATE, value: true });

    //選択レイアウト情報取得
    const layoutResult = yield call(getSelectLayout, action.value);
    if (layoutResult.isSuccessful) {
        yield put({ type: SET_LAYOUT_INFO, value: layoutResult.data });
    }
    else {
        yield put({ type: CHANGE_MODAL_STATE, value: showErrorModalInfo(layoutResult.errorMessage) });
    }

    //カメラ一覧情報取得
    const cameraListResult = getCameraList(action.value);
    if (cameraListResult.isSuccessful) {
        yield put({ type: SET_CAMERA_LIST, value: cameraListResult.data });
    }
    else {
        yield put({ type: CHANGE_MODAL_STATE, value: showErrorModalInfo(cameraListResult.errorMessage) });
    }

    if (cameraListResult.data == false) {   //ルーム以外選択時はルームに紐づく情報クリア
        yield put({ type: SET_CAMERA_INFO, value: null });
        yield put({ type: SET_SETTING_LIST, value: null });
        return;
    }
    else {  //ルーム選択時
        //設定・操作情報取得
        const settingResult = getSetting();
        if (settingResult.isSuccessful) {
            yield put({ type: SET_SETTING_LIST, value: settingResult.data });
        }
        else {
            yield put({ type: CHANGE_MODAL_STATE, value: showErrorModalInfo(cameraListResult.errorMessage) });
        }
    }
    yield put({ type: CHANGE_LOAD_STATE, value: false });
}

/**
 * 全カメラ情報設定（1番目のカメラを選択状態にする）
 */
function* handleSetCameraInfo(action) {
    yield put({ type: REQUEST_CAMERA_INFO, value: _.get(action.value, "[0].id") });
}

/**
 * カメラ選択
 */
function* handleRequestCameraInfo(action) {
    yield put({ type: CHANGE_LOAD_STATE, value: true });
    //カメラ一覧情報取得
    const cameraInfoReult = getSelectCameraInfo(action.value);
    if (cameraInfoReult.isSuccessful) {
        yield put({ type: SET_CAMERA_INFO, value: cameraInfoReult.data });
    }
    else {
        yield put({ type: CHANGE_MODAL_STATE, value: showErrorModalInfo(cameraInfoReult.errorMessage) });
    }
    yield put({ type: CHANGE_LOAD_STATE, value: false });
}

/**
 * カメラ操作
 */
function* handleChangeCameraState(action) {
    yield put({ type: CHANGE_LOAD_STATE, value: true });
    switch (action.key) {
        case "main":
        case "sub":
            //仕様がわからないのでとりあえずAPI通信はなしで値のみの変更を想定
            //今のcameraMode取得
            const nowChangeMode = yield select(state=>state.selectCamera.cameraMode);
            const update = action.key === "main" ? { main: action.value } : { sub: action.value }
            yield put({ type: SET_CAMERA_MODE, value: _.assign(nowChangeMode, update) });
            break;
        case "height":
            const heightChangeReasult = postCameraHeight(action.value);
            if (heightChangeReasult.isSuccessful) {
                yield put({ type: SET_CAMERA_HEIGHT, value: heightChangeReasult.data });
            }
            else {
                yield put({ type: CHANGE_MODAL_STATE, value: showErrorModalInfo(heightChangeReasult.errorMessage) });
            }
            break;
        default:
            break;
    }
    yield put({ type: CHANGE_LOAD_STATE, value: false });
}

/**
 * 設定変更
 */
function* handleChangeSetting(action) {
    yield put({ type: CHANGE_LOAD_STATE, value: true });
    const settingChangeResult = postSetting(action.key, action.value);
    if (settingChangeResult.isSuccessful) {
        yield put({ type: SET_SETTING, key:action.key, value:action.value });
    }
    else {
        yield put({ type: CHANGE_MODAL_STATE, value: showErrorModalInfo(settingChangeResult.errorMessage) });
    }
    yield put({ type: CHANGE_LOAD_STATE, value: false });
}
//#endregion

//#region API
/**
* レイアウト一覧情報を読み込む
*/
export function getlayoutList() {
    return new Promise((resolve, reject)=>{
        sendData(EnumHttpMethod.get, 'api/floorMap', null, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data && data.lookUp) {
                resolve({ isSuccessful: true, data: data.lookUp.layouts });
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "ロケーション情報の取得に失敗しました。" });
            }
        })
    });
}

/**
* レイアウト情報を取得する
*/
export function getSelectLayout(layoutId) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, 'api/floorMap/layout', { layoutInfo: { layoutId: layoutId }, isConvert: false }, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data.layout) {
                resolve({ isSuccessful: true, data: data.layout });
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "選択ロケーション情報の取得に失敗しました。" });
            }
        })
    });
}

/**
* カメラ一覧情報を読み込む
*/
export function getCameraList(id) {
    return { isSuccessful: true, data: getDammyCameraInfo(id) };
    //return { isSuccessful: false, errorMessage: "カメラ情報の取得に失敗しました。" };

    // sendData(EnumHttpMethod.get, 'api/loactionView', null, (data, networkError) => {
    //     if (networkError) {
    //         resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
    //     } else if (data) {
    //         return { isSuccessful: true, data: data };
    //     }
    //     else {
    //         return { success: false, errorMessage: "カメラ情報の取得に失敗しました。" };
    //     }
    // });
}

/**
* 設定情報を読み込む
*/
export function getSetting() {
    return { isSuccessful: true, data: getDammySetting() };
    //return { isSuccessful: false, errorMessage: "設定情報の取得に失敗しました。" };
}

/**
* 選択されたカメラ情報を読み込む
*/
export function getSelectCameraInfo(id) {
    return { isSuccessful: true, data: getDammySelectCameraInfo(id) };
    //return { isSuccessful: false, errorMessage: "カメラ情報の取得に失敗しました。" };
}

/**
* カメラの高さを変更する
*/
export function postCameraHeight(height) {
    return { isSuccessful: true, data: height };
    //return { isSuccessful: false, errorMessage: "高さの変更に失敗しました。" };

}

/**
* カメラの設定を変更する
*/
export function postSetting(key, value) {
    return { isSuccessful: true, data: value };
    //return { isSuccessful: false, errorMessage: "設定の変更に失敗しました。" };

}
// #endregion

//#region ダミーデータ
/**
* 全カメラ情報ダミーデータ
*/
export function getDammyCameraInfo(id) {
    switch (id) {
        case 111:
            return [
                {
                    id: 1,
                    name: "カメラ1",
                    position: {
                        x: 80,
                        y: 80
                    },
                    rotate: 40,
                    imagePath:"Content/Temporary/maincam_dummy.jpg"
                },
                {
                    id: 2,
                    name: "カメラ2",
                    position: {
                        x: 430,
                        y: 345
                    },
                    rotate: 270,
                    imagePath: "Content/Temporary/maincam_dummy2.jpg"
                },
                {
                    id: 3,
                    name: "屋外",
                    position: {
                        x: 10,
                        y: 400
                    },
                    rotate: 0,
                    imagePath: "Content/Temporary/maincam_dummy3.jpg"
                },
            ]
        case 112:
            return [
                {
                    id: 1,
                    name: "カメラ1",
                    position: {
                        x: 430,
                        y: 80
                    },
                    rotate: 130,
                    imagePath: "Content/Temporary/maincam_dummy.jpg"
                },
                {
                    id: 2,
                    name: "カメラ2",
                    position: {
                        x: 80,
                        y: 345
                    },
                    rotate: 270,
                    imagePath: "Content/Temporary/maincam_dummy2.jpg"
                },
                {
                    id: 3,
                    name: "屋外",
                    position: {
                        x: 550,
                        y: 30
                    },
                    rotate: 90,
                    imagePath: "Content/Temporary/maincam_dummy3.jpg"
                },
            ]
        default:
            return [];
    }
    
}

/**
 * 選択中カメラ情報ダミーデータ取得
 */
function getDammySelectCameraInfo(id) {
    switch (id) {
        case 1:
            return {
                id: 1,
                name: "カメラ1",
                position: {
                    x: 100,
                    y: 100
                },
                height: 50
            }
        case 2:
            return {
                id: 2,
                name: "カメラ2",
                position: {
                    x: 200,
                    y: 150
                },
                height: 100
            }
        case 3:
            return {
                id: 3,
                name: "屋外",
                position: {
                    x: 300,
                    y: 400
                },
                height: 180
            }
    }
}

/**
 * 設定情報ダミーデータ取得
 */
function getDammySetting() {
    return (
        [{
            id: "speaker1",
            position: 1,
            name: "スピーカー1",
            value: true
        },
        {
                id: "speaker2",
            position: 3,
            name: "スピーカー2",
            value: false
        },
        {
                id: "speaker3",
            position: 2,
            name: "機器室照明",
            value: false
        },
        {
                id: "speaker4",
            position: 4,
            name: "屋外照明",
            value: true
        }]
    );
}
//#endregion