/**
 * @license Copyright 2017 DENSO
 * 
 * FloorMapCommonのsagaを生成する
 * 
 */
'use strict';

import { effects } from "redux-saga";
const { fork, put, take, call, takeEvery, select } = effects;
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

import { makeGetObjectLinkData } from 'makeOmitData';
import { FLOORMAP_OPTIONS, MAP_TRANSITION_TYPE, LINK_TYPE } from 'constant';

/**
 * フロアマップ画面用rootSaga
 */
const floorMapSagas = [
    takeEvery("REQUEST_MAP_TRANSITION", mapTransition),
    takeEvery("REQUEST_OBJECT_LINK", setSelectObject),
    takeEvery("SET_SELECT_LAYOUT", clearMapInfo)
];

export default floorMapSagas;

//#region アクションハンドラ
/**
 * マップ遷移
 */
function* mapTransition(action) {
    switch (action.data) {
        case MAP_TRANSITION_TYPE.referrer:  //リンク元レイアウトに戻る
            yield put({ type: "CLEAR_SELECT_OBJECT", data: null });
            break;
        case MAP_TRANSITION_TYPE.back:
        case MAP_TRANSITION_TYPE.forward:
            yield call(backForwardMap, action.data);
            break;
        default: break;
    }
}

/**
 * オブジェクトを選択状態にして、リンク先情報をセットする
 * @param {obj} selectObject 選択中オブジェクト情報
 * @param {boolean} notUpdateObject オブジェクトをアップデートしない
 */
export function* setSelectObject(action, notUpdateObject = false) {
    const selectObject = action.data;
    if (!(yield select(state => state.updating))) {
        yield put({ type: "CHANGE_LOAD_STATE" });
    }

    //postデータ取得
    const isConvert = yield select(state => state.floorMapCommon.floorMapInfo.isConvert);
    const postData = makeGetObjectLinkData(selectObject, isConvert)

    if (postData) {
        const objectLinkInfo = yield call(getObjectLink, postData);
        if (objectLinkInfo.isSuccessful) {
            yield call(setObjectLink, objectLinkInfo.data, action.data, notUpdateObject);
            yield put({ type: "CHANGE_NETWORK_ERROR", isError: false });
        }
        else {
            if ((yield select(state => state.updating)) && objectLinkInfo.networkError) {
                yield put({ type: "CHANGE_NETWORK_ERROR", isError: true });
            } else {
                yield put({ type: "SHOW_ERROR_MESSAGE", message: objectLinkInfo.errorMessage });
                yield !objectLinkInfo.networkError && put({ type: "CHANGE_NETWORK_ERROR", isError: false });
            }
        }
    }

    if (!(yield select(state => state.updating))) {
        yield put({ type: "CHANGE_LOAD_STATE" });
    }
}

//#endregion

//#region その他
/**
 * レイアウト選択
 */
export function* setSelectLayout(action, changeLoadState = true, recordLog = true) {
    const selectLayout = action.data;
    if (changeLoadState) {
        yield put({ type: "CHANGE_LOAD_STATE" });
    }
    const result = yield call(setLayoutInfo, selectLayout.layoutId);    //遷移後のレイアウト情報セット
    if (recordLog && result) {
        yield put({ type: "ADD_LAYOUT_LOG", data: selectLayout.layoutId });   //画面遷移情報を記録
    }

    if (changeLoadState) {
        yield put({ type: "CHANGE_LOAD_STATE" });
    }
}

/**
 * オブジェクトリンク先情報をセットする
 */
function* setObjectLink(data, selectObject, notUpdateObject = false) {
    //取得失敗
    if (selectObject.linkType === LINK_TYPE.layout && !data.layout) {
        yield put({ type: "SHOW_ERROR_MESSAGE", message: "リンク先レイアウト情報を取得できませんでした。" });
        return;
    }
    else if (selectObject.linkType !== LINK_TYPE.layout && !data.measuredValues) {
        yield put({ type: "SHOW_ERROR_MESSAGE", message: "リンク先計測値情報を取得できませんでした。" });
        return;
    }
    //成功
    switch (selectObject.linkType) {
        case LINK_TYPE.point:
            yield put({ type: "SET_OBJECT_LINK", data: data });
            if (!notUpdateObject) {
                yield put({ type: "SET_SELECT_OBJECT", data: selectObject });
            }
            break;
        case LINK_TYPE.location:
            yield put({
                type: "SET_OBJECT_LINK",
                data: {
                    selectedLocation: selectObject.location,
                    measuredValues: data.measuredValues
                }
            });
            if (!notUpdateObject) {
                yield put({ type: "SET_SELECT_OBJECT", data: selectObject });
            }
            break;
        case LINK_TYPE.layout:
            if (data.layout.layoutId) {
                yield put({ type: "REQUEST_SELECT_LAYOUT", data: data.layout });
            }
            break;
        case LINK_TYPE.egroup:
            yield put({
                type: "SET_OBJECT_LINK",
                data: {
                    selectedEgroup: data.selectedEgroup,
                    measuredValues: data.measuredValues
                }
            });
            if (!notUpdateObject) {
                yield put({ type: "SET_SELECT_OBJECT", data: selectObject });
            }
            break;
        default: break;
    }
}

/**
 * 選択中レイアウトの変更により不要となるマップ情報を削除する
 */
function* clearMapInfo() {
    yield put({ type: "UNCHECK_OPTIONS", data: null });
    yield put({ type: "CLEAR_SELECT_OBJECT", data: null });
}

/**
 * 表示マップ戻る進む
 * @param {bool} isBack 戻るかどうか
 */
function* backForwardMap(type) {
    const selectedList = yield select(state => state.floorMapCommon.selectedLayoutList);
    const direction = type === MAP_TRANSITION_TYPE.back ? -1 : 1;
    yield put({ type: "CHANGE_INDEX", data: direction });
    const layoutId = selectedList.layoutIdList[selectedList.index + direction];
    yield call(setSelectLayout, { data: { layoutId: layoutId } }, true, false);	//遷移後のレイアウト情報セット
}  

/**
 * レイアウト情報をセットする
 * @param {int} layoutId    取得するレイアウトのレイアウトID
 */
export function* setLayoutInfo(layoutId) {
    //取得
    const floorMapOptions = yield select(state => state.lookUp.floorMapOptions);
    let layoutInfo = null;
    if (floorMapOptions) {
        const isConvert = yield select(state => state.floorMapCommon.floorMapInfo.isConvert);
        const floorMapOptionInfo = yield select(state => state.floorMapCommon.floorMapOptionInfo);
        layoutInfo = yield call(getLayoutInfo, { layoutId: layoutId }, isConvert, _.find(floorMapOptionInfo, { 'optionId': FLOORMAP_OPTIONS.alarm.optionId}), false);
    }
    else {
        layoutInfo = yield call(getLayoutInfo, { layoutId: layoutId }, false, null, true);
    }

    //保存
    if (layoutInfo.isSuccessful) {
        const layout = _.get(layoutInfo, "data.layout");
        let saveLayoutInfo = _.omit(layout, ['parent', 'children', 'level', 'location', 'updateUserId', 'updateDate', 'operationLogs']);
        yield put({ type: "SET_SELECT_LAYOUT", data: saveLayoutInfo });
    } else {
        yield put({ type: "SHOW_ERROR_MESSAGE", message: layoutInfo.errorMessage });
    }
    return layoutInfo.isSuccessful;
}
//#endregion

//#region API
/**
* レイアウト情報を取得する
*/
export function getLayoutInfo(layoutInfo, isConvert, floorMapOption, isCapacity) {
    let postData = {
        layoutInfo: { layoutId: layoutInfo.layoutId },
        isConvert: isConvert,
        floorMapOption: !isCapacity ? floorMapOption : null,
        rackCapacityOption: isCapacity ? floorMapOption : null
    };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, 'api/floorMap/layout', postData, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE, networkError: true });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: "マップ情報の取得に失敗しました。" });
            }
        })
    });
}

/**
* オブジェクトのリンク先情報を取得する
*/
export function getObjectLink(postData) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, 'api/floorMap/objectLink', postData, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE, networkError: true });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: "リンク先情報の取得に失敗しました。" });
            }
        })
    });
}
// #endregion