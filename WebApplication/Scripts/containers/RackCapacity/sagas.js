/**
 * @license Copyright 2017 DENSO
 * 
 * RackCapacity画面のsagaを生成する
 * 
 */
'use strict';

import { effects } from "redux-saga";
const { fork, put, take, call, takeEvery, select, all } = effects;
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

import { SET_LOOKUP, SET_RACKSTATUS_OBJ, SET_EMPGROUP_LIST, SET_SELECT_EMPGROUP, SET_RACKPOWER_INFO, SET_LINK_EGOBJ } from './actions.js';
import { REQUEST_SELECT_LAYOUT, SET_LAYOUT_LIST, SET_OPTIONS, SET_SELECT_OBJECT } from "FloorMapCommon/actions.js";
import { CHANGE_LOAD_STATE } from "LoadState/actions";
import { CHANGE_MODAL_STATE, CONFIRM_DELETE, CONFIRM_CANCEL, CONFIRM_SAVE, SHOW_ERROR_MESSAGE } from "ModalState/actions";

import floorMapSagas, { getLayoutInfo, setSelectLayout, setLayoutInfo as setCommonLayoutInfo, getObjectLink } from 'FloorMapCommon/sagas.js';

import { RACK_CAPACITY_OPTIONS, MAP_TRANSITION_TYPE, LINK_TYPE } from 'constant';
import { makeGetObjectLinkData, makeLayoutTreeData, omitList } from 'makeOmitData';

/**
 * rootSaga
 */
export default function* rootSaga() {
    yield all([
        ...floorMapSagas,
        takeEvery("REQUEST_INIT_INFO", setInitInfo),
        takeEvery("REQUEST_CHANGE_MAP", setLayerInfo),  //表示マップチェック状態変更
        takeEvery("REQUEST_EMPTY_RACK", setEmptyRackInfo),
        takeEvery("REQUEST_RACK_INFO", setSelectRackInfo),
        takeEvery("REQUEST_SELECT_LAYOUT", changeLayoutInfo, true),
        takeEvery("REQUEST_CAPACITY_MAPTRANSITION", mapTransition),
        takeEvery("REQUEST_EMPTY_LAYOUT", setEmptyLayoutInfo),

        takeEvery("SET_EMPGROUP_LIST", clearSelectGroup)
    ])
}

//#region rootSagaから呼び出される関数
/**
 * 初期表示
 */
function* setInitInfo(action) {
    yield put({ type: CHANGE_LOAD_STATE, isLoading: true });
    const lookUpInfo = yield call(getLookUp);
    if (lookUpInfo.isSuccess) {
        let lookUp = _.cloneDeep(lookUpInfo.data);
        lookUp = _.pick(lookUp, ["rackStatuses", "rackTypes", "layouts"]);      
        lookUp.rackTypes = _.map(lookUp.rackTypes, (type) => {  //セレクトフォーム表示用に変換して保存
            type.value = type.typeId.toString();
            return type;
        })
        yield put({ type: SET_LOOKUP, data: lookUp });
        yield put({ type: SET_OPTIONS, options: lookUpInfo.data.rackCapacityOptions, titles: RACK_CAPACITY_OPTIONS });
    }
    else {
        yield put({ type: SHOW_ERROR_MESSAGE, message: lookUpInfo.errorMessage });
    }
    yield put({ type: CHANGE_LOAD_STATE, isLoading: false });
}

/**
 * レイヤ情報をセットする
 */
function* setLayerInfo(action, changeLoadState = true) {
    const { layoutId, optionId, isChecked } = action.data;
    yield put({ type: "CHANGE_CHECK_STATE", data: { optionId, isChecked } });  //チェック状態変更
    if (isChecked) {
        if (changeLoadState) {
            yield put({ type: "CHANGE_LOAD_STATE" });
        }
        //任意の値を取得してセット
        const selectLayout = yield select(state => state.floorMapCommon.selectLayout);
        const result = yield call(getLayoutInfo, { layoutId: layoutId }, false, { optionId: optionId }, true);
        if (optionId === RACK_CAPACITY_OPTIONS.rackStatus.optionId) {           
            yield call(setRackStatusLayer, result);
        }
        if (changeLoadState) {
            yield put({ type: "CHANGE_LOAD_STATE" });
        }
    }
    else {
        //任意の値をクリア
        if (optionId === RACK_CAPACITY_OPTIONS.rackStatus.optionId) {
            yield put({ type: SET_RACKSTATUS_OBJ, data: null });
        }
    }
}

/**
 * ラックステータスレイヤ情報を取得する
 */
function* setRackStatusLayer(rackStatusInfo) {
    if (rackStatusInfo.isSuccessful) {
        const emptyRackObjects = _.filter(_.get(rackStatusInfo.data, "layout.layoutObjects"), (obj) => {
            return obj.linkType === LINK_TYPE.location;  //ラック（ロケーション）オブジェクトのみに絞る
        }); 
        yield put({ type: SET_RACKSTATUS_OBJ, data: emptyRackObjects });
    }
    else {
        yield put({ type: SHOW_ERROR_MESSAGE, message: rackStatusInfo.errorMessage });
    }
}

/**
 * 空きラックグループ情報をセットする
 */
function* setEmptyRackInfo(action, changeLoadState = true, rackStatusUpdate = true) {
    const { rackNumber, selectType } = action.data;
    yield changeLoadState && put({ type: CHANGE_LOAD_STATE });
    const selectLayout = yield select(state => state.floorMapCommon.selectLayout);
    const emptyRackInfo = yield call(getEmptyRackInfo, _.omit(selectLayout, ["layoutObjects"]), rackNumber, selectType);
    if (emptyRackInfo.isSuccess) {
        yield put({ type: SET_EMPGROUP_LIST, data: emptyRackInfo.data });
        if (yield select((state) => _.find(state.floorMapCommon.floorMapOptionInfo, { 'optionId': RACK_CAPACITY_OPTIONS.rackStatus.optionId }).check) &&
            rackStatusUpdate) {
            //ラックステータス情報更新(ロード状態変更しない)
            yield call(setLayerInfo, { data: { layoutId: selectLayout.layoutId, optionId: RACK_CAPACITY_OPTIONS.rackStatus.optionId, isChecked: true } }, false);
        }
    }
    else {
        yield put({ type: SHOW_ERROR_MESSAGE, message: emptyRackInfo.errorMessage });
    }
    yield changeLoadState && put({ type: CHANGE_LOAD_STATE });
}

/**
 * 選択した空きラックから、連続空きラックグループ情報とそれに紐づく分電盤情報をセットする
 */
function* setSelectRackInfo(action) {
    const { rackNumber, selectType, selectObject, groupObjects } = action.data;
    yield put({ type: CHANGE_LOAD_STATE });
    const rackGroupInfo = yield call(getRackGroupInfo, rackNumber, selectType, selectObject, groupObjects);
    if (rackGroupInfo.isSuccess) {
        yield put({ type: SET_SELECT_OBJECT, data: selectObject }); //選択オブジェクト保存
        //選択オブジェクトを含む空きラックグループ保存
        yield put({ type: SET_SELECT_EMPGROUP, data: rackGroupInfo.data.selectedBlankRackObjects });
        //分電盤情報テーブルの情報保存
        yield put({ type: SET_RACKPOWER_INFO, data: rackGroupInfo.data.rackPowerResult });
        //空きラックグループに紐づく分電盤情報保存
        yield put({ type: SET_LINK_EGOBJ, data: rackGroupInfo.data.connectedEgroupObjects });
    }
    else {
        yield put({ type: SHOW_ERROR_MESSAGE, message: rackGroupInfo.errorMessage });
    }
    yield put({ type: CHANGE_LOAD_STATE });
}

/**
 * 選択中レイアウト情報を変更する
 */
function* changeLayoutInfo(recordLog, action, changeLoadState = true) {
    const selectLayout = action.data;
    yield call(clearMapInfo);   //不要な情報削除
    yield changeLoadState && put({ type: CHANGE_LOAD_STATE });
    yield call(getMapLayerInfo, selectLayout, recordLog);
    yield put({ type: "CHANGE_CHECK_STATE", data: { optionId: RACK_CAPACITY_OPTIONS.rackStatus.optionId, isChecked: true } });  //ラックステータスはデフォルトチェック
    yield changeLoadState && put({ type: CHANGE_LOAD_STATE });
}

/**
 * 必要なマップレイヤ情報を非同期で取得する
 */
function* getMapLayerInfo(selectLayout, recordLog) {
    yield fork(setSelectLayout, { data: selectLayout }, false, recordLog);   //レイアウトオブジェクト情報取得(ロード状態変更なし)
    yield fork(setLayerInfo, { data: { layoutId: selectLayout.layoutId, optionId: RACK_CAPACITY_OPTIONS.rackStatus.optionId, isChecked: true } }, false);
}

/**
 * マップ遷移
 */
function* mapTransition(action) {
    const type = action.data;   //進むか戻るか
    const selectedList = yield select(state => state.floorMapCommon.selectedLayoutList);
    const direction = type === MAP_TRANSITION_TYPE.back ? -1 : 1;
    yield put({ type: "CHANGE_INDEX", data: direction });
    const selectLayout = { layoutId: selectedList.layoutIdList[selectedList.index + direction] };
    yield call(changeLayoutInfo, false, { data: selectLayout });
}


/**
 * レイアウト情報（空きラック検索状態）をセットする
 */
function* setEmptyLayoutInfo(action) {
    const { rackNumber, selectType, selectObject } = action.data;
    yield put({ type: CHANGE_LOAD_STATE });
    yield call(setSelectLayoutObject, selectObject);            //選択オブジェクトをセット
    if (selectObject && selectObject.layout) {
        yield call(setEmptyRackInfo, { data: { rackNumber, selectType } }, false, false);     //空きラック検索
    }
    yield put({ type: CHANGE_LOAD_STATE });
}

/**
 * オブジェクト（レイアウト）を選択状態にして、リンク先情報をセットする
 * @param {obj} selectObject 選択中オブジェクト情報
 */
export function* setSelectLayoutObject(selectObject) {
    const isConvert = yield select(state => state.floorMapCommon.floorMapInfo.isConvert);
    const postData = makeGetObjectLinkData(selectObject, isConvert)
    if (postData) {
        const objectLinkInfo = yield call(getObjectLink, postData);
        if (objectLinkInfo.isSuccessful) {
            const data = objectLinkInfo.data;
            if (!data.layout) {
                yield put({ type: "SHOW_ERROR_MESSAGE", message: "リンク先レイアウト情報を取得できませんでした。" });
                return;
            }
            if (data.layout.layoutId) {
                yield call(changeLayoutInfo, true, { data: data.layout }, false);
            }            
        }
        else {
            yield put({ type: "SHOW_ERROR_MESSAGE", message: objectLinkInfo.errorMessage });
        }
    }
}

//#endregion

//#region その他
/**
 * 選択中空きラックグループに関する情報クリア
 */
function* clearSelectGroup(action) {
    yield put({ type: SET_SELECT_EMPGROUP, data: null });
    yield put({ type: SET_RACKPOWER_INFO, data: null });
    yield put({ type: SET_LINK_EGOBJ, data: null });
    yield put({ type: SET_SELECT_OBJECT, data: null});
}

/**
 * 選択中レイアウトの変更により不要となったマップ情報を削除する
 */
function* clearMapInfo(action) {
    yield put({ type: SET_RACKSTATUS_OBJ, data: null });
    yield put({ type: SET_EMPGROUP_LIST, data: null });
}
//#endregion

//#region API
/**
* ルックアップ情報を取得する
*/
export function getLookUp() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, 'api/rackCapacity', null, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccess: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data && data.lookUp) {
                resolve({ isSuccess: true, data: data.lookUp });
            } else {
                resolve({ isSuccess: false, errorMessage: "初期情報の取得に失敗しました。" });
            }
        })
    });
}

/**
* 空きラック情報を取得する
*/
export function getEmptyRackInfo(selectLayout, rackNumber, rackType) {
    const postData = {
        EmptyRackcount: rackNumber,
        RackType: rackType,
        Layout: selectLayout
    };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, 'api/rackCapacity/emptyRack', postData, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccess: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data && data.blankRackObjects) {
                resolve({ isSuccess: true, data: data.blankRackObjects });
            } else {
                resolve({ isSuccess: false, errorMessage: "空きラック情報の取得に失敗しました。" });
            }
        })
    });
}

/**
* 選択した空きラックに関する情報を取得する
*/
export function getRackGroupInfo(rackNumber, selectType, selectObject, groupObjects) {
    const postData = {
        EmptyRackCount: rackNumber,
        RackType: selectType,
        SelectedLayoutObject: selectObject,
        LayoutObjectGroup: groupObjects
    }
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, 'api/rackCapacity/rackGroup', postData, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccess: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccess: true, data: data });
            } else {
                resolve({ isSuccess: false, errorMessage: "空きラックグループ情報の取得に失敗しました。" });
            }
        })
    });
}
//#endregion