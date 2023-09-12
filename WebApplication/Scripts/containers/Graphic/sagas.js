/**
 * @license Copyright 2017 DENSO
 * 
 * Graphic画面のsagaを生成する
 * 
 */
'use strict';

import { effects } from "redux-saga";
const { fork, put, take, call, takeEvery, select, join } = effects;
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

import { OBJECT_TYPE, LINK_TYPE, DEFAULT_OBJECT_SETTING, DEFAULT_LAYOUT_SETTING } from 'graphicUtility';
import { positionInputCheck, sizeInputCheck, borderInputCheck, displayTextInputCheck, fontSizeInputCheck, validateObjectSetting, getObjectSetting, getMatchLayoutObject, getSelectObjectInfo, getAddObjectId, convertObjectSettingBox, isSelectOnlyValueLabel } from 'graphicUtility';
import { canSettingIsMultiRack, canSettingIsMultiRackByLayout } from 'graphicUtility';
import { LAVEL_TYPE } from 'authentication';
import { makeLayoutTreeData, makeLocationTreeData, makeEgroupTreeData, omitLayoutObjects, LOCATION_SIMPLE_PROPERTIES } from 'makeOmitData';

const LAYOUT_GRAPHIC_PROPERTIES = ['systemId', 'layoutId', 'layoutName', 'children', 'location.isAllowed', 'location.children'];

/**
 * rootSaga
 */
export default function* rootSaga() {
    yield takeEvery("REQUEST_INITIAL_INFO", setInitialInfo, true);  //初期情報取得

    yield takeEvery("REQUEST_CHANGE_MODE", changeMode); //レイアウト編集⇔閲覧モード変更

    yield takeEvery("REQUEST_SELECT_LAYOUT", setSelectLayout, true);
    yield takeEvery("REQUEST_DELETE_LAYOUT", sendDeleteLayout);
    yield takeEvery("REQUEST_SAVE_LAYOUT", sendSaveLayout);

    yield takeEvery("REQUEST_ADD_OBJECT", addObject);
    yield takeEvery("REQUEST_DELETE_OBJECT", deleteObject);
    yield takeEvery("REQUEST_APPLY_CHANGE", changeObject);  //オブジェクト変更適用

    yield takeEvery("REQUEST_OBJBOX_EDITMODE", clickObjBoxEdit);    //オブジェクト設定ボックスの編集モード設定変更
    yield takeEvery("REQUEST_CHANGE_OBJECT", changeObjectSetting);  //オブジェクト設定ボックス情報変更
    yield takeEvery("REQUEST_CANCEL_SETTING", cancelObjectSetting); //オブジェクト設定編集内容クリア

    yield takeEvery("REQUEST_CHANGE_MAP", setObjectInfo);           //マップからオブジェクト操作（選択・移動・リサイズ）
    yield takeEvery("REQUEST_DESELECT_OBJECTS", resetSelectObject); //オブジェクト選択解除
    yield takeEvery("REQUEST_REDO", redo);
    yield takeEvery("REQUEST_UNDO", undo);

    yield takeEvery("REQUEST_SHOW_MODAL", setConfirmModalInfo);     //確認モーダル表示

    yield takeEvery("SET_AUTH", setIsReadOnly);                           //権限取得後に読み取り専用かどうか設定
    yield takeEvery("CHANGE_SELECT_OBJECTS", changeIsOnlyValueLabel);     //計測値ラベルのみ選択中か設定
    yield takeEvery("BULK_SELECT_OBJECTS", changeIsOnlyValueLabel);
    yield takeEvery("RESET_SELECT_OBJECTS", changeIsOnlyValueLabel);
    yield takeEvery("CHANGE_ISONLY_VALUELABEL", unCheckOptionalItems)     //非表示項目チェック解除
    yield takeEvery("CHANGE_OBJECT_SETTING", validateInput);            　//変更されたフォームの入力チェック
    yield takeEvery("CHANGE_MULTI_APPLY", validateCheckedInput);          //チェック状態が変更されたフォームの入力チェック
}

//#region roogSagaから呼び出される関数
/**
 * 読み取り専用かどうか取得
 */
function* setIsReadOnly(action) {
    const { isReadOnly, level } = yield select(state => state.authentication);
    yield put({ type: "SET_IS_READONLY", data: isReadOnly || level >= LAVEL_TYPE.operator });
}

/**
 * 初期表示情報取得
 */
function* setInitialInfo(isChangeLoadState, action) {
    yield call(setLoadState, !isChangeLoadState);
    //レイアウト一覧情報取得
    const { isSuccessful, data, errorMessage } = yield call(getLookUp);
    if (isSuccessful) {
        //画面で使用する情報のみ取り出して保存
        const locationProperties = ["systemId", "locationId", "name", "dispIndex", "isAllowed", "children"];
        //メモリクラッシュするので画面でもomit
        const initInfo = {
            //layouts: _.get(data, "layouts", []),
            layouts: makeLayoutTreeData(_.get(data, "layouts", []), LAYOUT_GRAPHIC_PROPERTIES, LOCATION_SIMPLE_PROPERTIES),
            locations: makeLocationTreeData(_.get(data, "locations", []), locationProperties),     //不要な情報削除、アイコン情報付与
            //egroups: _.get(data, "egroups", [])
            egroups: makeEgroupTreeData(_.get(data, "egroups", []))
        };
        yield put({ type: "SET_LOOKUP", value: initInfo });
        //選択中レイアウトがある場合は選択状態にする
        const selectLayoutId = yield select((state) => _.get(state.selectLayout, "layoutId"));
        if (selectLayoutId && selectLayoutId >= 0) {
            if (selectLayoutId >= 0) {
                const hasChild = yield select((state) => _.get(state.selectLayout, "hasChild"));
                yield call(setSelectLayout, false, {
                    data: {
                        layoutId: selectLayoutId,
                        hasChild: hasChild
                    }
                });
            }
        }
    }
    else {
        yield put({ type: "SHOW_ERROR_MESSAGE", message: errorMessage });
    }
    yield call(setLoadState, !isChangeLoadState);
}

/**
 * モード変更
 */
function* changeMode(action) {
    yield put({ type: "CHANGE_MODE", data: action.data.isEditMode });
    const selectLayout = yield select(state => state.selectLayout);

    if (action.data.isEditMode && !action.data.isAdd) {  //編集ボタンクリック
        yield put({ type: "SET_EDITING", data: selectLayout }); //選択中レイアウト情報をセットする
    }
    else if (action.data.isAdd) {   //新規登録ボタンクリック
        yield put({ type: "SET_OBJECT_SETTING" });
        yield put({ type: "SET_SELECT_LAYOUT" });
        yield put({ type: "SET_EDITING", data: DEFAULT_LAYOUT_SETTING });
    }
    else {    //編集モード解除
        yield call(changeObjectBoxMode, false); //オブジェクト設定ボックスの編集モード解除
        yield put({ type: "SET_OBJECT_SETTING" });
        yield put({ type: "RESET_SELECT_OBJECTS" });
        yield put({ type: "SET_EDITING", data: null });
        yield put({ type: "CLEAR_LOG" });
    }
}

/**
 * レイアウト選択
 */
function* setSelectLayout(isChangeLoadState, action) {
    yield call(setLoadState, !isChangeLoadState);
    //レイアウト情報取得
    const { layoutId, hasChild } = action.data;
    const { isSuccessful, data, errorMessage } = yield call(getLayout, layoutId);
    if (isSuccessful) {
        yield put({ type: "SET_SELECT_LAYOUT", data: Object.assign({}, data, { hasChild: hasChild }) });
        yield put({ type: "REQUEST_CHANGE_MODE", data: { isEditMode: false, isAdd: false } });
    }
    else {
        yield put({ type: "SHOW_ERROR_MESSAGE", message: errorMessage });
    }
    yield call(setLoadState, !isChangeLoadState);
}

/**
 * レイアウト削除
 */
function* sendDeleteLayout(action) {
    yield call(setLoadState);
    yield put({ type: "SET_WAITING_STATE", isWaiting: true, waitingType: "delete" });
    const { requestResult } = yield call(postData, action.data, '../api/floorMap/graphic/delete');
    yield put({ type: "SET_WAITING_STATE", isWaiting: false, waitingType: null });
    if (_.get(requestResult, "isSuccess")) {
        yield put({ type: "SUCCESS_DELETE", message: requestResult.message });
        yield put({ type: "SET_SELECT_LAYOUT" });
        yield call(reload);
    }
    else {
        if (requestResult && requestResult.message) {
            yield put({ type: "SHOW_ERROR_MESSAGE", message: requestResult.message });
        } else {
            yield put({ type: "SHOW_ERROR_MESSAGE", message: "レイアウトの削除に失敗しました。" });
        }
    }
    yield call(setLoadState);
}

/**
 * レイアウト保存
 */
function* sendSaveLayout(action) {
    yield call(setLoadState);
    yield put({ type: "SET_WAITING_STATE", isWaiting: true, waitingType: "save" });
    const { requestResult } = yield call(postData, action.data, '../api/floorMap/graphic/save');
    yield put({ type: "SET_WAITING_STATE", isWaiting: false, waitingType: null });
    if (requestResult && requestResult.isSuccess) {
        yield put({
            type: "SUCCESS_SAVE",
            message: requestResult.message
        });
        yield call(reload);
        yield call(changeMode, { data: { isEditMode: false, isAddMode: false } });  //編集モード解除
    }
    else {
        if (requestResult && requestResult.message) {
            yield put({ type: "SHOW_ERROR_MESSAGE", message: requestResult.message, bsSize: '' });
        } else {
            yield put({ type: "SHOW_ERROR_MESSAGE", message: "レイアウトの保存に失敗しました。" });
        }
    }
    yield call(setLoadState);
}

/**
 * オブジェクト追加
 */
function* addObject() {
    const objectId = getAddObjectId(yield select(state => state.editing.layoutObjects));
    let addObject = convertObjectSettingBox(yield select(state => state.objectSettingBox.data));
    addObject.objectId = objectId;

    const selectedIdList = yield select(state => state.selectObjectsIdList);

    //追加と選択状態変更
    yield put({ type: "ADD_OBJECTS", data: [addObject] });
    yield put({ type: "RESET_SELECT_OBJECTS" });    //選択状態を解除して追加したオブジェクトを選択状態にする
    yield put({ type: "CHANGE_SELECT_OBJECTS", data: { isSelect: true, objectId: addObject.objectId } });

    //ログ情報保存
    const addLogInfo = { item: "add", select: selectedIdList, after: addObject }; //選択されていたID情報を保存する
    yield put({ type: "RECORD_LOG", data: addLogInfo });

    //モード変更
    yield call(changeObjectBoxMode, false);
}

/**
 * オブジェクト削除
 */
function* deleteObject(action) {
    const deleteObjects = action.data;

    //削除と選択解除
    yield put({ type: "DELETE_OBJECTS", data: deleteObjects });
    yield put({ type: "RESET_SELECT_OBJECTS" });
    yield put({ type: "SET_OBJECT_SETTING" });  //オブジェクト設定情報初期化

    //ログ情報保存
    const deleteLogInfo = { item: "delete", select: deleteObjects };
    yield put({ type: "RECORD_LOG", data: deleteLogInfo });
}

/**
 * オブジェクト設定情報適用
 */
function* changeObject(action) {
    const changeObjects = action.data;
    const setting = yield select(state => state.objectSettingBox);

    yield put({ type: "APPLY_OBJECT_SETTING", data: { target: changeObjects, setting: setting } });

    //ログ情報保存
    const changeSettingLogInfo = { item: "changeSetting", before: changeObjects, after: setting };
    yield put({ type: "RECORD_LOG", data: changeSettingLogInfo });

    //モード変更
    yield call(changeObjectBoxMode, false);
}

/**
 * オブジェクト設定ボックスの編集モード設定
 */
function* clickObjBoxEdit(action) {
    yield call(changeObjectBoxMode, true);
}

/**
 * オブジェクト設定変更
 */
function* changeObjectSetting(action) {
    const { item, value } = action.data;
    let changedValue = value;
    if (item === "backgroundImage") {
        yield put({ type: "CHANGE_OBJECT_SETTING", data: { item: "backgroundImage", value: value && value.fileName } });
        yield put({ type: "CHANGE_OBJECT_SETTING", data: { item: "backgroundImageUrl", value: value && value.url } });
    }
    else if (item === "objectType") {
        yield call(changeObjectType, item, Number(value));
        if (Number(value) === OBJECT_TYPE.valueLabel) {
            yield call(changeLinkType, "linkType", LINK_TYPE.point);    //測定値ラベルの場合はリンク種別をポイント固定
        }
    }
    else if (item === "linkType") {
        yield call(changeLinkType, item, Number(value));
    } else if (item === "location") {
        yield call(changeLinkLocation, item, value);
    } else if (item === "layout") {
        yield call(changeLinkLayout, item, value);
    }
    else {
        yield put({ type: "CHANGE_OBJECT_SETTING", data: { item: action.data.item, value: changedValue } });
    }
}

/**
 * オブジェクト設定編集情報キャンセル
 */
function* cancelObjectSetting() {
    yield call(changeObjectBoxMode, false);
}

/**
 * マップオブジェクト情報を変更する
 */
function* setObjectInfo(action) {
    const selectObjectsIdList = yield select(state => state.selectObjectsIdList);
    const layoutObjects = yield select(state => state.editing.layoutObjects);
    const { changeObject, gripObjectId } = action.data;
    const { item } = changeObject;
    const before = _.find(layoutObjects, { 'objectId': gripObjectId });
    const after = _.find(changeObject.change, { 'key': gripObjectId });
    let logInfo = null;

    if (JSON.stringify(_.get(before, item)) === JSON.stringify(after.value)) {
        //選択状態変更のみの場合
        const isSelected = selectObjectsIdList.some(id => id === gripObjectId);
        yield put({ type: "CHANGE_SELECT_OBJECTS", data: { objectId: gripObjectId, isSelect: !isSelected } });
        //ログ情報作成
        logInfo = {
            item: "click",
            before: selectObjectsIdList,
            after: yield select(state => state.selectObjectsIdList) //選択後の選択オブジェクトID配列
        };
    }
    else {  //移動orリサイズ実行時
        yield put({ type: "CHANGE_MAP_OBJECT", data: changeObject });
        yield put({ type: "CHANGE_SELECT_OBJECTS", data: { objectId: gripObjectId, isSelect: true } });
        //ログ情報作成
        let beforeObjects = [];
        let changedIdList = _.map(changeObject.change, 'key');
        changedIdList.forEach((id) => {
            const target = _.find(layoutObjects, { 'objectId': id });
            beforeObjects.push({ key: Number(id), value: _.get(target, item) });
        });
        const select = _.without(changedIdList, ...selectObjectsIdList);  //この変更で新たに選択状態になったもの
        logInfo = {
            item, select,
            before: beforeObjects,
            after: changeObject.change
        };
    }

    yield call(setObjectInfoToBox, selectObjectsIdList);    //オブジェクト設定ボックス情報変更
    yield put({ type: "RECORD_LOG", data: logInfo });   //ログ情報保存
}

/**
 * 選択オブジェクト情報リセット
 */
function* resetSelectObject(action) {
    const selectObjects = action.data;
    const objectSettingBoxInfo = yield select(state => state.objectSettingBox);
    //選択解除、オブジェクト設定ボックス情報初期化
    yield put({ type: "RESET_SELECT_OBJECTS" });

    if (objectSettingBoxInfo.isEditMode) {
        yield put({ type: "CHANGE_MULTI_APPLY" });
        const objectSettingInfo = yield select((state) => state.objectSettingBox.data);
        yield put({ type: "SET_OBJECT_VALIDATE", data: objectSettingInfo });
    }
    else {
        yield put({ type: "SET_OBJECT_SETTING" });  //オブジェクト設定編集モードじゃない場合はクリア
    }
    //ログ情報保存
    const selectObjectIdList = _.map(selectObjects, 'objectId');
    const deselectLogInfo = { item: "deselect", select: selectObjectIdList };
    yield put({ type: "RECORD_LOG", data: deselectLogInfo });
}

/**
 * 進む
 */
function* redo() {
    //必要情報取得
    const nowPoint = yield select(state => state.logInfo.pointer);
    const changes = yield select(state => state.logInfo.log[nowPoint + 1]);
    const selectObjectsIdList = yield select((state) => state.selectObjectsIdList);

    //変更適用
    yield call(applyRedoChangeInfo, changes, selectObjectsIdList);
    //オブジェクト設定ボックス情報変更
    yield call(setObjectInfoToBox, selectObjectsIdList);
    //ログポインタ更新
    yield put(getMoveLog(1));
}

/**
 * 戻る
 */
function* undo() {
    //必要情報取得
    const nowPoint = yield select(state => state.logInfo.pointer);
    const changes = yield select(state => state.logInfo.log[nowPoint]);
    const layoutObjects = yield select(state => state.editing.layoutObjects);
    const selectObjectsIdList = yield select((state) => state.selectObjectsIdList);

    //変更適用
    yield call(applyUndoChangeInfo, changes, selectObjectsIdList, layoutObjects);
    //オブジェクト設定ボックス情報変更
    yield call(setObjectInfoToBox, selectObjectsIdList);
    //ログポインタ更新
    yield put(getMoveLog(-1));
}

/**
 * 確認用モーダル表示用情報取得
 */
function* setConfirmModalInfo(action) {
    switch (action.data) {
        case "deleteLayout":
            yield put({ type: "CONFIRM_DELETE", targetName: "選択中レイアウト", okOperation: "deleteLayout" });
            break;
        case "cancelLayout":
            yield put({ type: "CONFIRM_CANCEL", targetName: "編集中レイアウト情報", okOperation: "cancelLayout" });
            break;
        case "saveLayout":
            yield put({ type: "CONFIRM_SAVE", targetName: "編集中レイアウト情報", okOperation: "saveLayout" });
            break;
        case "deleteObject":
            yield put({ type: "CONFIRM_DELETE", targetName: "オブジェクト", okOperation: "deleteObject" });
            break;
        case "applyObject":
            const applyInfo = {
                show: true,
                title: "適用確認",
                message: "編集内容を選択中オブジェクトに適用してもよろしいですか？",
                buttonStyle: "confirm",
                okOperation: "applyObject"
            }
            yield put({ type: "CHANGE_MODAL_STATE", data: applyInfo });
            break;
        default: break;
    }
}

/**
 * オブジェクト設定ボックスの表示項目を変更する
 */
function* changeIsOnlyValueLabel(action) {
    if (yield select((state) => state.isEditMode)) {
        const layoutObjects = yield select((state) => state.editing.layoutObjects);
        const selectObjectsIdList = yield select((state) => state.selectObjectsIdList);
        const isOnlyValueLabel = isSelectOnlyValueLabel(layoutObjects, selectObjectsIdList);
        const beforeIsOblyValueLabel = yield select((state) => state.isOnlyValueLabel);
        if (beforeIsOblyValueLabel !== isOnlyValueLabel) {
            yield put({ type: "CHANGE_ISONLY_VALUELABEL", data: isOnlyValueLabel });
        }
    }
}

/**
 * 測定値ラベルのみの場合設定しない項目のチェック解除
 */
function* unCheckOptionalItems() {
    const isEditMode = yield select((state) => state.objectSettingBox.isEditMode);
    const selectObjectsIdList = yield select((state) => state.selectObjectsIdList);
    const isOnlyValueLabel = yield select((state) => state.isOnlyValueLabel);
    if (isEditMode && _.size(selectObjectsIdList) > 0 && isOnlyValueLabel) {
        //編集中かつ複数選択中かつ測定値表示ラベルに変更された場合チェック解除
        yield put({ type: "CHANGE_MULTI_APPLY", data: { item: "displayText", value: false } });
        yield put({ type: "CHANGE_MULTI_APPLY", data: { item: "foreColor", value: false } });
    }
}

/**
 * 入力フォームの値が変更されたら入力チェック
 */
function* validateInput(action) {
    yield call(setObjectSettingValidation, action.data.item, action.data.value);
}

/**
 * チェック状態が変更されたら入力チェック
 */
function* validateCheckedInput(action) {
    if (action.data) {
        if (action.data.value) { //チェックされたとき
            const changedValue = yield select((state) => _.get(state.objectSettingBox.data, action.data.item));
            yield call(setObjectSettingValidation, action.data.item, changedValue);
        }
        else {              //解除されたとき
            yield put({ type: "CHANGE_OBJECT_VALIDATE", data: { item: action.data.item, value: null } });
        }
    }
}

//#endregion

//#region API
/**
* ルックアップ情報を取得する
*/
export function getLookUp() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, '../api/floorMap/graphic', null, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data && data.lookUp) {
                resolve({ isSuccessful: true, data: data.lookUp });
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "初期情報の取得に失敗しました。" });
            }
        })
    });
}

/**
* レイアウト情報を取得する
*/
function getLayout(layoutId) {
    const postData = {
        LayoutInfo: { layoutId }
    }
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '../api/floorMap/layout', postData, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data && data.layout) {
                resolve({ isSuccessful: true, data: data.layout });
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "レイアウト情報の取得に失敗しました。" });
            }
        })
    });
}

/**
* データをポストする
*/
export function postData(target, url) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, url, target, (result, networkError) => {
            if (networkError) {
                resolve({ requestResult: { isSuccess: false, message: NETWORKERROR_MESSAGE }});
            } else {
                resolve(result);
            }
        })
    });
}

// #region ME
///**
//* 設定情報を読み込む
//*/
//export function getSetting() {
//    return { isSuccessful: true, data: getDammySetting() };
//    //return { isSuccessful: false, errorMessage: "設定情報の取得に失敗しました。" };
//}

///**
//* 選択されたカメラ情報を読み込む
//*/
//export function getSelectCameraInfo(id) {
//    return { isSuccessful: true, data: getDammySelectCameraInfo(id) };
//    //return { isSuccessful: false, errorMessage: "カメラ情報の取得に失敗しました。" };
//}

///**
//* カメラの高さを変更する
//*/
//export function postCameraHeight(height) {
//    return { isSuccessful: true, data: height };
//    //return { isSuccessful: false, errorMessage: "高さの変更に失敗しました。" };

//}

///**
//* カメラの設定を変更する
//*/
//export function postSetting(key, value) {
//    return { isSuccessful: true, data: value };
//    //return { isSuccessful: false, errorMessage: "設定の変更に失敗しました。" };

//}
// #endregion
// #endregion

//#region オブジェクト設定ボックス変更
/**
 * オブジェクト設定ボックスの種別変更
 */
function* changeObjectType(item, value) {
    //関連する値も変更
    yield put({ type: "CHANGE_OBJECT_SETTING", data: { item: item, value: value } });
    if (value === OBJECT_TYPE.valueLabel) {
        yield put({ type: "CHANGE_OBJECT_SETTING", data: { item: "displayText", value: "" } });
        yield put({ type: "CHANGE_OBJECT_SETTING", data: { item: "foreColor", value: "" } });
    }
    else {
        yield put({ type: "CHANGE_OBJECT_SETTING", data: { item: "foreColor", value: "black " } });
    }
    if (value !== OBJECT_TYPE.picture) {
        yield put({ type: "CHANGE_OBJECT_SETTING", data: { item: "backgroundImage", value: null } });
        yield put({ type: "CHANGE_OBJECT_SETTING", data: { item: "backgroundImageUrl", value: null } });
    }
}

/**
 * オブジェクト設定ボックスのリンク種別変更
 */
function* changeLinkType(item, value) {
    //関連する値も変更
    yield put({ type: "CHANGE_OBJECT_SETTING", data: { item: item, value: value } });
    yield put({ type: "CHANGE_OBJECT_SETTING", data: { item: "point", value: null } });
    yield put({ type: "CHANGE_OBJECT_SETTING", data: { item: "location", value: null } });
    yield put({ type: "CHANGE_OBJECT_SETTING", data: { item: "layout", value: null } });
    yield put({ type: "CHANGE_OBJECT_SETTING", data: { item: "egroup", value: null } });
    yield put({ type: "CHANGE_OBJECT_SETTING", data: { item: "isMultiRack", value: false } });      //分割ラック設定もOFFとする
}

/**
 * オブジェクト設定ボックスのロケーション変更
 */
function* changeLinkLocation(item, value) {
    yield put({ type: "CHANGE_OBJECT_SETTING", data: { item: item, value: value } });
    if (!canSettingIsMultiRack(value)) {
        yield put({ type: "CHANGE_OBJECT_SETTING", data: { item: "isMultiRack", value: false } });
    }
}

/**
 * オブジェクト設定ボックスのレイアウト変更
 */
function* changeLinkLayout(item, value) {
    yield put({ type: "CHANGE_OBJECT_SETTING", data: { item: item, value: value } });
    if (canSettingIsMultiRackByLayout(value)) {
        yield put({ type: "CHANGE_OBJECT_SETTING", data: { item: "isMultiRack", value: false } });
    }    
}

/**
 * オブジェクト設定変更後の入力チェック設定
 */
function* setObjectSettingValidation(item, value) {
    switch (item) {
        case "position":
            const size = yield select((state) => state.objectSettingBox.data.size);
            yield put({ type: "CHANGE_OBJECT_VALIDATE", data: { item: item, value: positionInputCheck(value, size) } });
            break;
        case "size":
            const position = yield select((state) => state.objectSettingBox.data.position);
            yield put({ type: "CHANGE_OBJECT_VALIDATE", data: { item: item, value: sizeInputCheck(value) } });
            yield put({ type: "CHANGE_OBJECT_VALIDATE", data: { item: "position", value: positionInputCheck(position, value) } });
            break;
        case "border":
            yield put({ type: "CHANGE_OBJECT_VALIDATE", data: { item: item, value: borderInputCheck(value) } });
            break;
        case "displayText":
            yield put({ type: "CHANGE_OBJECT_VALIDATE", data: { item: item, value: displayTextInputCheck(value) } });
            break;
        case "fontSize":
            yield put({ type: "CHANGE_OBJECT_VALIDATE", data: { item: item, value: fontSizeInputCheck(value) } });
            break;
        default:
            yield put({ type: "CHANGE_OBJECT_VALIDATE", data: { item: item, value: { state: "success" } } });
    }
}
//#endregion

//#region ログ情報適用
/**
 * マップリドゥ(進む)の変更適用
 */
function* applyRedoChangeInfo(changes, beforeSelectObjects) {
    switch (changes.item) {
        case "position":
        case "size":
            yield put({ type: "CHANGE_MAP_OBJECT", data: { item: changes.item, change: changes.after } });
            const selected = _.union(beforeSelectObjects, changes.select);
            yield put({ type: "BULK_SELECT_OBJECTS", data: selected });  //選択状態にする
            break;
        case "deselect":
            yield put({ type: "RESET_SELECT_OBJECTS" });
            break;
        case "changeSetting":
            yield put({ type: "APPLY_OBJECT_SETTING", data: { target: changes.before, setting: { data: changes.after.data, checked: changes.after.checked } } });
            break;
        case "delete":
            yield put({ type: "DELETE_OBJECTS", data: changes.select });
            yield put({ type: "RESET_SELECT_OBJECTS" });  //選択状態解除
            break;
        case "add":
            yield put({ type: "ADD_OBJECTS", data: [changes.after] });
            yield put({ type: "BULK_SELECT_OBJECTS", data: [changes.after.objectId] });
            break;
        case "click":
            yield put({ type: "BULK_SELECT_OBJECTS", data: changes.after });   //選択後の選択状態に戻す
            break;
        default: break;
    }
}

/**
 * マップアンドゥ(戻る)の変更適用
 */
function* applyUndoChangeInfo(changes, beforeSelectObjects, layoutObjects) {
    switch (changes.item) {
        case "position":
        case "size":
            yield put({ type: "CHANGE_MAP_OBJECT", data: { item: changes.item, change: changes.before } });
            const selected = _.without(beforeSelectObjects, ...changes.select);
            yield put({ type: "BULK_SELECT_OBJECTS", data: selected });  //選択状態を一部解除
            break;
        case "deselect":
            yield put({ type: "BULK_SELECT_OBJECTS", data: changes.select });
            break;
        case "changeSetting":
            let changedObjects = layoutObjects;
            changes.before.forEach((obj) => {
                const index = _.findIndex(layoutObjects, { "objectId": obj.objectId });
                changedObjects[index] = obj;
            })
            yield put({ type: "SET_OBJECTS", data: { layoutObjects: changedObjects } });
            break;
        case "delete":
            yield put({ type: "ADD_OBJECTS", data: changes.select });
            const addObjectIdList = changes.select.map((obj) => {
                return obj.objectId;
            });
            yield put({ type: "BULK_SELECT_OBJECTS", data: addObjectIdList });  //選択状態にする
            break;
        case "add":
            const targetObject = _.maxBy(layoutObjects, 'objectId');
            yield put({ type: "DELETE_OBJECTS", data: [targetObject] });
            yield put({ type: "BULK_SELECT_OBJECTS", data: changes.select });   //追加前の選択状態に戻す
            break;
        case "click":
            yield put({ type: "BULK_SELECT_OBJECTS", data: changes.before });   //選択前の選択状態に戻す
            break;
        default: break;
    }
}
//#endregion

//#region その他
/**
 * ロード状態変更
 */
function* setLoadState(fixState) {
    if (!fixState) {
        yield put({ type: "CHANGE_LOAD_STATE" });
    }
}

/**
 * 画面リロード
 */
function* reload() {
    yield call(setInitialInfo, null, false);
}

/**
 * 選択中オブジェクト情報をオブジェクト設定ボックス情報にセットする
 * @param beforeSelected 変更前選択オブジェクトID配列
 */
function* setObjectInfoToBox(beforeSelected) {
    const isEditMode = yield select(state => state.objectSettingBox.isEditMode);
    if (isEditMode) {   //編集モード時は入力チェック状態変更
        yield call(changeCheckBoxShow, beforeSelected);
    }
    else {  //表示モード時はオブジェクト設定情報変更
        yield call(setFirstOrDefaultObjctSetting);
    }
}

/**
 * チェックボックス表示状態を変更する
 * @param beforeSelected 変更前選択オブジェクトID配列
 */
function* changeCheckBoxShow(beforeSelected) {
    const selected = yield select(state => state.selectObjectsIdList);  //変更後選択オブジェクトID配列
    if (beforeSelected.length >= 2 && selected.length <= 1
        || beforeSelected.length <= 1 && selected.length >= 2) {
        yield call(setFirstOrDefaultObjctSetting);  //オブジェクト設定表示情報変更
        let isMultiSelect = true;
        if (selected.length <= 1) {  //チェックボックス非表示時
            yield put({ type: "CHANGE_MULTI_APPLY" });  //チェック状態解除
            isMultiSelect = false;
        }
        const objectSettingBoxInfo = yield select(state => state.objectSettingBox.data);
        yield put({ type: "SET_OBJECT_VALIDATE", data: objectSettingBoxInfo, isMultiSelect });
    }
}

/**
 * 先頭もしくはデフォルトのオブジェクト設定情報を表示する
 */
function* setFirstOrDefaultObjctSetting() {
    const selected = yield select(state => state.selectObjectsIdList);
    if (_.size(selected) > 0) {
        const layoutObjects = yield select(state => state.editing.layoutObjects);
        const set = getObjectSetting(getMatchLayoutObject(layoutObjects, selected[0]));
        yield put({ type: "SET_OBJECT_SETTING", data: set });   //先頭オブジェクト情報設定
    }
    else {
        yield put({ type: "SET_OBJECT_SETTING" });  //デフォルト値設定
    }
}

/**
 * オブジェクト設定ボックス編集モード変更
 */
function* changeObjectBoxMode(isEditMode) {
    if (isEditMode) {
        const isMultiSelect = yield select((state) => state.selectObjectsIdList.length > 1);
        const objectSettingBox = yield select((state) => state.objectSettingBox);
        yield put({ type: "SET_OBJECT_VALIDATE", data: objectSettingBox.data, isMultiSelect });
    }
    else if (!isEditMode) {
        yield call(setFirstOrDefaultObjctSetting);  //オブジェクト設定ボックス情報変更
        yield put({ type: "CHANGE_MULTI_APPLY" });
        yield put({ type: "SET_OBJECT_VALIDATE", data: null });
    }
    yield put({ type: "CHANGE_OBJBOX_MODE", data: isEditMode });
}

/**
 * ログポインタを移動させるのに必要な情報を取得する
 */
function getMoveLog(changeValue) {
    return ({ type: "MOVE_LOG_POINTER", data: { changeValue: changeValue } });
}
//#endregion