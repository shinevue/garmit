/**
 * @license Copyright 2017 DENSO
 * 
 * 電気錠操作（フロアマップ）画面のsagaを生成する
 * 
 */
'use strict';

import { effects } from "redux-saga";
const { fork, put, take, call, takeEvery, select, all, join } = effects;
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

import { REQUEST_INIT_INFO, REQUEST_UPDATE, REQUEST_ELECKEY_MAPTRANSITION } from './actions.js';
import { REQUEST_SELECT_ELECKEYS, REQUEST_REMOVE_SELECT_ELECKEYS, REQUEST_APPLY_MULTI_RACKS_SELECT, REQUEST_CLEAR_SELECT_ELECKEYS } from './actions.js';
import { REQUEST_ELECKEY_OPERATION } from './actions.js';
import { SET_LOOKUP, SET_EMPTY_EXTENDED_PAGES, SET_ELECKEY_OBJECTS } from './actions.js';
import { SET_SELECT_ELECKEY_OBJECTS, SET_SELECT_ELECKEY_DISPITEMS, CLEAR_SELECT_ELECKEYS } from './actions.js';
import { SET_TEMP_KEY_RACKS, CHANGE_MULTI_RACK_MODAL_STATE, CLEAR_OPERATION_INFO, CHANGE_OPERATION_EXTENDED_PAGES } from './actions.js';
import { START_UPDATE, END_UPDATE } from './actions.js';
import { CHANGE_LOAD_STATE } from 'LoadState/actions.js';
import { REQUEST_SELECT_LAYOUT, CHANGE_INDEX, SET_SELECT_LAYOUT, ADD_LAYOUT_LOG } from 'FloorMapCommon/actions.js';
import { SHOW_ERROR_MESSAGE, SUCCESS_SAVE } from 'ModalState/actions.js';
import { SET_WAITING_STATE } from 'WaitState/actions.js';
import { SET_UNLOCK_PURPOSE_LIST, SET_SELECTED_UNLCOKPURPOSE } from 'UnlockPurpose/actions.js';
import { CHANGE_NETWORK_ERROR } from 'NetworkError/actions.js';

import unlockPurposeSagas from 'UnlockPurpose/sagas.js';

import { isAllUnlockOrPhysicalKey, isAllSameUnlockPurpose } from 'electricLockUtility';
import { convertNumberExtendedData } from 'assetUtility';
import { LINK_TYPE, MAP_TRANSITION_TYPE, LOCK_STATUS_ID } from 'constant';
import { getFirstUnlockPurpose } from 'unlockPurposeUtility'

/**
 * rootSaga
 */
export default function* rootSaga() {
    yield all([
        ...unlockPurposeSagas,
        takeEvery(REQUEST_INIT_INFO, setInitInfo),                          //初期情報セット
        takeEvery(REQUEST_UPDATE, updateMapInfo, true),                     //電気錠マップの更新
        takeEvery(REQUEST_SELECT_LAYOUT, changeLayoutInfo, true),           //レイアウトを選択する
        takeEvery(REQUEST_ELECKEY_MAPTRANSITION, mapTransition),            //マップ遷移
        takeEvery(REQUEST_SELECT_ELECKEYS, selectElecKeys),                 //電気錠ラックを選択する
        takeEvery(REQUEST_REMOVE_SELECT_ELECKEYS, removeSelectEleckey),     //電気錠ラックの選択を解除する
        takeEvery(REQUEST_APPLY_MULTI_RACKS_SELECT, applyMultiRacksSelect), //分割ラック選択を選択中の電気錠ラックに適用する
        takeEvery(REQUEST_ELECKEY_OPERATION, sendElecKeyCommand),           //電気錠操作
        takeEvery(REQUEST_CLEAR_SELECT_ELECKEYS, clearSelectEleckeys)       //電気錠ラックをクリアする
    ]);
}

//#region roogSagaから呼び出される関数

/**
 * 初期表示情報取得
 */
function* setInitInfo(action) {
    yield call(setLoadState, true);
    const lookUpInfo = yield call(getLookUp);
    if (lookUpInfo.isSuccessful) {
        yield put({ type: SET_LOOKUP, data: lookUpInfo.data });
        yield put({ type: SET_UNLOCK_PURPOSE_LIST, data: lookUpInfo.data.unlockPurposes });
        
        const extededPagesInfo = yield call(getELockOpenExtendedPages);
        if (extededPagesInfo.isSuccessful) {
            yield put({ type: SET_EMPTY_EXTENDED_PAGES, data: extededPagesInfo.data });
        } else {
            yield put({ type: SHOW_ERROR_MESSAGE, message: extededPagesInfo.errorMessage });
        }
           
        if (extededPagesInfo.isSuccessful && action.layoutId) {
            yield put({ type: "REQUEST_SELECT_LAYOUT", data: { layoutId: action.layoutId } });
        }
    } else {
        yield put({ type: SHOW_ERROR_MESSAGE, message: lookUpInfo.errorMessage });
    }
    yield call(setLoadState, false);
}

/**
 * マップ遷移
 */
function* mapTransition(action) {
    const type = action.data;   //進むか戻るか
    const selectedList = yield select(state => state.floorMapCommon.selectedLayoutList);
    const direction = type === MAP_TRANSITION_TYPE.back ? -1 : 1;
    yield put({ type: CHANGE_INDEX, data: direction });
    const selectLayout = { layoutId: selectedList.layoutIdList[selectedList.index + direction] };
    yield call(changeLayoutInfo, false, { data: selectLayout });
}

/**
 * 選択中レイアウト情報を変更する
 */
function* changeLayoutInfo(recordLog, action) {
    const selectLayout = _.cloneDeep(action.data);
    selectLayout.floorMapOptions = null;
    yield call(clearMapInfo);   //不要な情報削除
    yield call(setElectricLockMap, selectLayout, true, recordLog, false);
}

/**
 * 電気錠ラックを選択する 
 */
function* selectElecKeys(action) {
    const { data, isMultiSelect, isMultiRack } = action;

    //権限のあるオブジェクトのみに絞り込み
    var targetObjects = _.cloneDeep(data).filter((obj) => {
        if(obj.linkType === LINK_TYPE.location) {
            return obj.location && obj.location.isAllowed;
        } else if (obj.linkType === LINK_TYPE.layout) {
            return obj.layout && obj.layout.location && obj.layout.location.isAllowed;
        }
    });

    if (targetObjects && targetObjects.length > 0) {        
        if (!isMultiSelect) {
            let selectObjects = yield select(state => _.cloneDeep(state.selectKeyRacks.objects));
            const match = _.find(selectObjects, _.matchesProperty('objectId', targetObjects[0].objectId));
            if (match && !match.isPart) {
                yield call(deselectObjects, targetObjects[0], isMultiRack);                 //他のオブジェクトも同ロケーションの場合は選択状態を解除
                yield call(deselectRackDispItems, targetObjects[0], isMultiRack);           //selectKeyRacks.dispItemsからも削除
            } else {
                yield call(setSelectElecKeys, targetObjects, isMultiRack);
            }
        } else {
            yield call(setSelectElecKeys, targetObjects, isMultiRack);
        }
    } else {
        yield put({ type: SHOW_ERROR_MESSAGE, message: '該当オブジェクトに権限がないため、選択できません。' });
    }
}

/**
 * 電気錠ラックの選択を解除する
 */
function* removeSelectEleckey(action) {
    const { data: targetDispItem } = action;
    yield call(removeSelectObjectByLocationIds, [ targetDispItem.locationId ]);
    yield call(removeSelectRackDispItem, targetDispItem.locationId);
}


/**
 * 分割ラック選択を選択中の電気錠ラックに適用する
 */
function* applyMultiRacksSelect(action) {
    const { dispItems } = action;
    let selectObjects = yield select(state => _.cloneDeep(state.tempMultiKeyRacks.objects));
    let tempDispItems = yield select(state => _.cloneDeep(state.tempMultiKeyRacks.dispItems));
    let selectDispItems = yield select(state => _.cloneDeep(state.selectKeyRacks.dispItems));

    //選択したラックの適用
    var isAllSelected = dispItems && dispItems.length > 0 ? true : false;
    var removeLocationIds = [];
    var isAdd = false;
    tempDispItems.forEach((item) => {
        const match = _.find(dispItems, _.matchesProperty('locationId', item.locationId));
        const selected = _.find(selectDispItems, _.matchesProperty('locationId', item.locationId));
        if (match) {
            if (!selected) {
                selectDispItems.push(item);     //選択に追加
                isAdd = true;
            }              
        } else {
            isAllSelected = false;
            if (selected) {
                removeLocationIds.push(selected.locationId);
                _.pull(selectDispItems, selected);      //選択から解除
            }  
        }        
    });
    yield call(setSelectElecKeyDispItems, selectDispItems, isAdd);

    const targetObjects = yield call(getAddElecKeyObjects, dispItems.map((item) => item.locationId));
    isAllSelected && targetObjects.some((item) => {
        const selected = _.find(selectObjects, _.matchesProperty('objectId', item.objectId));
        if (selected) {
            item.isPart = !isAllSelected;
            return true;          
        }
    });
    yield call(pushSelectElecKeyObjects, targetObjects);
    yield call(removeSelectObjectByLocationIds, removeLocationIds);
    
    yield put({ type: SET_TEMP_KEY_RACKS, data: null });    //クリアしておく
}

/**
 * 電気錠の施錠/開錠コマンドを送信する
 */
function* sendElecKeyCommand(action) {
    const { isLock } = action;
    yield put({ type: SET_WAITING_STATE, isWaiting: true, waitingType: (isLock ? 'lock' : 'unlock') });
    const selectDispRackItems = yield select(state => state.selectKeyRacks.dispItems);
    if (selectDispRackItems && selectDispRackItems.length > 0) {
        const locationIds = selectDispRackItems.map((item) => item.locationId);
        const operationInfo = yield select(state => state.operationInfo);
        const unlockPurposeInfo = yield select(state => state.unlockPurposeInfo);
        const { operationTarget, operationMemo, operationExtendedPages } = operationInfo;
        const unlockPurpose = unlockPurposeInfo.selectedUnlockPurpose ? unlockPurposeInfo.selectedUnlockPurpose.purpose : '';
        const extendedPages = operationExtendedPages ? convertNumberExtendedData(operationExtendedPages) : [];
        const result = yield call(saveElecKeyCommand, isLock, locationIds, operationTarget.front, operationTarget.rear, operationMemo, unlockPurpose, extendedPages);
        if (result.isSuccessful) {
            yield put({ type: SUCCESS_SAVE, message: result.message });
            yield isLock && call(clearOperationInfo);                   //施錠時のみ操作情報欄をクリアする
            yield fork(updateMapInfo, false, { data: null });          //更新する
        } else {
            yield put({ type: SHOW_ERROR_MESSAGE, message: result.message });
        }
    }
    yield put({ type: SET_WAITING_STATE, isWaiting: false, waitingType: null });
}

/**
 * マップ情報を更新する
 */
function* updateMapInfo(updating, action) {
    const selectLayout = yield select(state => state.floorMapCommon.selectLayout);
    if ((yield select(state => state.updating)) || (yield select(state => state.isLoading))) {
        action.data && _.get(action.data, 'callback') && action.data.callback(); //タイマー設定用コールバック
        return; //手動更新中もしくはロード中の場合は更新スキップ
    }
    yield put({ type: START_UPDATE });
    yield call(setLoadState, true);
    if (selectLayout) {
        yield call(setUpdateMapInfo, selectLayout, updating);
        yield call(updateSelectElecKeyObjects);
    }
    action.data &&_.get(action.data, 'callback') && action.data.callback();
    yield put({ type: END_UPDATE });
    yield call(setLoadState, false);
}

/**
 * 電気錠ラックをクリアする
 */
function* clearSelectEleckeys(action) {
    yield put({ type: CLEAR_SELECT_ELECKEYS });
    yield call(clearOperationInfo);
}

//#endregion

//#region その他

/**
 * 電気錠マップを取得する
 * @param {object} selectLayout 選択中のレイアウト
 * @param {boolean} changeLoadState ロード中ステータスを変更するか
 * @param {boolean} recordLog ログを記録するかどうか
 * @param {boolean} updating 自動更新かどうか
 */
function* setElectricLockMap(selectLayout, changeLoadState = true, recordLog = true, updating = false) {
    yield call(setLoadState, true, !changeLoadState);
    const result = yield call(setLayout, selectLayout.layoutId, updating);            //遷移後のレイアウト情報セット
    if (result) {
        yield call(setElectricKeyObjects);
        if (recordLog) {
            yield put({ type: ADD_LAYOUT_LOG, data: selectLayout.layoutId });     //画面遷移情報を記録
        }
    }
    yield call(setLoadState, false, !changeLoadState);
}

/**
 * レイアウト情報をセットする
 * @param {number} layoutId レイアウトID
 */
function* setLayout(layoutId, updating) {
    const layoutInfo = yield call(getLayout, layoutId);
    if (layoutInfo.isSuccessful) {
        const omitLayout = _.omit(layoutInfo.data, ['parent', 'children', 'level', 'location', 'updateUserId', 'updateDate', 'operationLogs']);
        yield put({ type: SET_SELECT_LAYOUT, data: omitLayout });
        yield put({ type: CHANGE_NETWORK_ERROR, isError: false });
    }
    else {
        if (updating && layoutInfo.networkError) {
            yield put({ type: CHANGE_NETWORK_ERROR, isError: true });
        } else {
            yield put({ type: SHOW_ERROR_MESSAGE, message: layoutInfo.errorMessage });
            yield !layoutInfo.networkError && put({ type: CHANGE_NETWORK_ERROR, isError: false });
        }
        
    }
    return layoutInfo.isSuccessful;
}

/**
 * 電気錠オブジェクトを設定する
 */
function* setElectricKeyObjects() {
    const selectLayout = yield select(state => state.floorMapCommon.selectLayout);
    const keyRackObjects = selectLayout.layoutObjects.filter((obj) => obj.isElecKey === true || obj.isPhysicalKey === true);
    var exceptLockStateObjects = _.cloneDeep(keyRackObjects).filter((obj) => {
        return (obj.lockStatus.lockStatusId !== LOCK_STATUS_ID.notMeasured && obj.lockStatus.lockStatusId !== LOCK_STATUS_ID.lock);
    });
    exceptLockStateObjects.forEach((obj) => {
        obj.borderColor = obj.lockStatus.borderColor;
        obj.border = obj.lockStatus.border;
        obj.backColor = obj.lockStatus.backColor;
    });
    yield put({ type: SET_ELECKEY_OBJECTS, data: { keyRackObjects, exceptLockStateObjects }});
}

/**
 * 更新用マップ情報をセットする
 * @param {*} layout レイアウト情報
 */
function* setUpdateMapInfo(layout, updating) {
    yield fork(setElectricLockMap, layout, false, false, updating);
    yield fork(updateSelectElecRacks, updating);
}

/**
 * 選択電気錠ラック表示情報を更新する
 */
function* updateSelectElecRacks(updating) {
    const selectDispRackItems = yield select(state => state.selectKeyRacks.dispItems);
    if (selectDispRackItems && selectDispRackItems.length > 0) {
        const locationIds = selectDispRackItems.map((item) => item.locationId);
        const result = yield call(getElectricLockRacks, locationIds);
        if (result.isSuccessful) {
            yield call(setSelectElecKeyDispItems, result.data, false);
            yield put({ type: CHANGE_NETWORK_ERROR, isError: false });
        }
        else {
            if (updating && result.networkError) {
                yield put({ type: CHANGE_NETWORK_ERROR, isError: true });
            } else {
                yield put({ type: SHOW_ERROR_MESSAGE, message: result.errorMessage });
                yield !layoutInfo.networkError && put({ type: CHANGE_NETWORK_ERROR, isError: false });
            }
        }
    }
}

/**
 * 選択ラックオブジェクトを更新する
 */
function* updateSelectElecKeyObjects() {
    const selectKeyRackObjects = yield select(state => state.selectKeyRacks.objects);
    const elecKeyObjects = yield select(state => state.elecKeyObjects);
    if (elecKeyObjects && selectKeyRackObjects) {
        var update = [];
        selectKeyRackObjects.forEach((obj) => {
            const match = _.find(elecKeyObjects.keyRackObjects, _.matchesProperty('objectId', obj.objectId));
            if (match) {
                let updateObj = _.cloneDeep(match);
                updateObj.isPart = obj.isPart;
                update.push(updateObj);
            }
        })        
    }
    yield put({ type: SET_SELECT_ELECKEY_OBJECTS, data: update });
}

/**
 * 選択中の電気錠情報をセットする
 * @param {*} selectObjects 選択させる電気錠情報
 * @param {*} isMultiRack 分割ラックかどうか
 */
function* setSelectElecKeys(selectObjects, isMultiRack) {
    var selectlocationIds = [];
    for (let index = 0; index < selectObjects.length; index++) {
        const object = selectObjects[index];
        let locationIds = yield call(getElecKeyLocationIds, object, isMultiRack);
        selectlocationIds = selectlocationIds.concat(locationIds);
    }

    //子ロケーションの権限チェック
    if (isMultiRack && selectlocationIds.length <= 0) {
        yield put({ type: SHOW_ERROR_MESSAGE, message: '該当オブジェクトに権限がないため、選択できません。' });
        return;
    }
    
    yield call(setLoadState, true);
    const result = yield call(getElectricLockRacks, selectlocationIds);
    if (result.isSuccessful) {
        if (isMultiRack) {            
            const elecLockRacks = yield call(applyCheckedRackDispItems, result.data);
            yield put({ type: SET_TEMP_KEY_RACKS, data: { objects: selectObjects, dispItems: elecLockRacks } });      
            yield put({ type: CHANGE_MULTI_RACK_MODAL_STATE, show: true });
        } else {
            yield call(pushSelectElecKeyDispItems, result.data);
            const targetObjects = yield call(getAddElecKeyObjects, selectlocationIds);
            yield call(pushSelectElecKeyObjects, targetObjects);
        }
    }
    else {
        yield put({ type: SHOW_ERROR_MESSAGE, message: result.errorMessage });
    }    
    yield call(setLoadState, false); 
}

/**
 * 選択中の電気錠オブジェクトに追加する
 * @param {*} objects 電気錠オブジェクトリスト
 */
function* pushSelectElecKeyObjects(objects) {
    let selectObjects = yield select(state => _.cloneDeep(state.selectKeyRacks.objects));
    objects.forEach((obj) => {
        let match = _.find(selectObjects, _.matchesProperty('objectId', obj.objectId));
        if (!match) {
            selectObjects.push(_.cloneDeep(obj));
        } else {
            selectObjects.some(selectObj => {
                if (match.objectId === selectObj.objectId) {
                    selectObj.isPart = obj.isPart;            //一部選択状態になった場合はフラグを立てる
                    return true;
                }
            });
        }
    });
    yield put({ type: SET_SELECT_ELECKEY_OBJECTS, data: selectObjects });
}

/**
 * 選択中の電気錠ラック情報に追加する
 * @param {*} electricLockRackItems 電気錠ラック情報リスト
 */
function* pushSelectElecKeyDispItems(electricLockRackItems) {
    let selectDispItems = yield select(state => _.cloneDeep(state.selectKeyRacks.dispItems));
    electricLockRackItems.forEach((item) => {
        const match = _.find(selectDispItems, _.matchesProperty('locationId', item.locationId));
        if (!match) {
            selectDispItems.push(item);
        }
    });
    yield call(setSelectElecKeyDispItems, selectDispItems, true);
}

/**
 * 選択中オブジェクトの選択を解除する（同じロケーションに紐づいたオブジェクトも解除）
 * @param {*} targetObject 選択を解除するオブジェクト
 */
function* deselectObjects (targetObject, isMultiRack) {
    var locationIds = yield call(getElecKeyLocationIds, targetObject, isMultiRack);
    yield call(removeSelectObjectByLocationIds, locationIds);
}

/**
 * 選択中の電気錠ラック情報から指定されたオブジェクトの解除する
 * @param {*} targetObject 選択を解除するオブジェクト
 */
function* deselectRackDispItems (targetObject, isMultiRack) {
    var selectDispRackItems = yield select(state =>  _.cloneDeep(state.selectKeyRacks.dispItems));
    var locationIds = yield call(getElecKeyLocationIds, targetObject, isMultiRack);
    const filterDispRackItems = selectDispRackItems.filter((item) => locationIds.indexOf(item.locationId) < 0);
    if (!filterDispRackItems || filterDispRackItems.length === 0) {
        yield call(clearOperationInfo);
    }
    yield call(setSelectElecKeyDispItems, filterDispRackItems ? filterDispRackItems : [], false);
}

/**
 * 選択中の電気錠ラック情報から指定されたロケーションの選択を解除する
 * @param {number} locationId ロケーションID
 */
function* removeSelectRackDispItem(locationId) {    
    var selectDispRackItems = yield select(state =>  _.cloneDeep(state.selectKeyRacks.dispItems));
    const filterDispRackItems = selectDispRackItems.filter((item) => item.locationId !== locationId);
    if (!filterDispRackItems || filterDispRackItems.length === 0) {
        yield call(clearOperationInfo);
    }
    yield call(setSelectElecKeyDispItems, filterDispRackItems ? filterDispRackItems : [], false);
}

/**
 * selectKeyRacks.objectsから削除できるか確認して削除する
 * @param {*} locationId 対象の電気錠ラックのロケーションID
 */
function* removeSelectObjectByLocationIds(locationIds) {
    let selectDispRackItems = yield select(state =>  _.cloneDeep(state.selectKeyRacks.dispItems));
    let selectObjects = yield select(state => _.cloneDeep(state.selectKeyRacks.objects));
    const removeObjectsInfo = yield call(getRemoveSelectElecKeyObjectInfo, locationIds, selectDispRackItems, selectObjects);
    removeObjectsInfo.forEach((info) => {
        const { object: removeObject, isRemove, isPart } = info; 
        const match = removeObject && _.find(selectObjects, _.matchesProperty('objectId', removeObject.objectId));
        if (match) {
            if (isRemove) {
                _.pull(selectObjects, match);         //選択状態の場合は選択解除。
            } else {
                selectObjects.some(obj => {
                    if (match.objectId === obj.objectId) {
                        obj.isPart = isPart;            //一部選択状態になった場合はフラグを立てる
                        return true;
                    }
                });         
            }      
        }  
    })
    yield put({ type: SET_SELECT_ELECKEY_OBJECTS, data: selectObjects });
}

/**
 * 電気錠ラックのロケーションIDを取得する
 * @param {*} targetObject 
 * @param {*} isMultiRack 
 */
function* getElecKeyLocationIds(targetObject, isMultiRack) {    
    var targetLocation = null;
    if(targetObject.linkType === LINK_TYPE.location) {
        targetLocation = targetObject.location;
    } else if (targetObject.linkType === LINK_TYPE.layout) {
        targetLocation = targetObject.layout.location;
    }
    
    var locationIds = [];
    if (targetLocation) {        
        if (isMultiRack) {
            targetLocation.children.forEach((loc) => {
                loc.isAllowed && locationIds.push(loc.locationId);      //分割ラックでは、子ロケーションのみ    
            });
        } else {
            locationIds.push(targetLocation.locationId);
        }
    }
    return locationIds;
}

/**
 * 削除する電気錠ラックオブジェクトを取得する
 * @param {*} locationId 削除するロケーションID
 * @param {*} dispItems 表示用ラックリスト（選択中の）
 * @param {*} objects オブジェクト一覧（選択中の）
 */
function* getRemoveSelectElecKeyObjectInfo(locationIds, dispItems, objects) {
    var targetObjectsInfo = [];
    objects.forEach((obj) => {
        let targetLocation = null;
        if(obj.linkType === LINK_TYPE.location) {
            targetLocation = obj.location;
        } else if (obj.linkType === LINK_TYPE.layout) {
            targetLocation = obj.layout.location;
        }

        var objectLocationIds = [];
        if (targetLocation) {
            if (obj.isMultiRack) {
                targetLocation.children.forEach((loc) => {
                    loc.isAllowed && (loc.isElecKey || loc.isPhysicalKey) && objectLocationIds.push(loc.locationId);   
                });
            } else {
                objectLocationIds.push(targetLocation.locationId);
            }
        }

        if (objectLocationIds.some((id) => locationIds.indexOf(id) >= 0)) {
            targetObjectsInfo.push({
                object: _.cloneDeep(obj),
                isRemove: !dispItems.some((item) => objectLocationIds.indexOf(item.locationId) >= 0 && locationIds.indexOf(item.locationId) < 0),
                isPart: !objectLocationIds.every((id) => dispItems.some(item => item.locationId === id) && locationIds.indexOf(id) < 0)
            });
        }
    });
    return targetObjectsInfo;
}


/**
 * 追加する電気錠オブジェクトを取得する
 * @param {*} locationIds ロケーションIDリスト
 */
function* getAddElecKeyObjects(locationIds) {    
    const elecKeyObjects = yield select(state => state.elecKeyObjects.keyRackObjects);
    const selectDispItems = yield select(state => _.cloneDeep(state.selectKeyRacks.dispItems));
    var targetObjects = [];
    elecKeyObjects.forEach((obj) => {
        let targetLocation = null;
        if(obj.linkType === LINK_TYPE.location) {
            targetLocation = obj.location;
        } else if (obj.linkType === LINK_TYPE.layout) {
            targetLocation = obj.layout.location;
        }

        var objectLocationIds = [];
        if (targetLocation) {
            if (obj.isMultiRack) {
                targetLocation.children.forEach((loc) => {
                    loc.isAllowed && (loc.isElecKey || loc.isPhysicalKey) && objectLocationIds.push(loc.locationId);   
                });
            } else {
                objectLocationIds.push(targetLocation.locationId);
            }
        }

        if (objectLocationIds.some((id) => locationIds.indexOf(id) >= 0)) {
            let targetObject = _.cloneDeep(obj);
            targetObject.isPart = !objectLocationIds.every((id) => selectDispItems.some(item => item.locationId === id));
            targetObjects.push(targetObject);
        }
    });
    return targetObjects;
}

/**
 * 電気錠ラックにチェック状態を適用する
 * @param {*} targets チェック状態適用前の電気錠ラックリスト
 */
export function* applyCheckedRackDispItems(targets) {
    const selectDispItems = yield select(state => state.selectKeyRacks.dispItems);
    let rackDispItems = _.cloneDeep(targets);
    rackDispItems.forEach((rack) => {
        rack.checked = selectDispItems.some((item) => item.locationId === rack.locationId);
    });
    return rackDispItems;
}

//#endregion

//#region データのセット（単純なセットのみ）

/**
 * ロード状態変更
 */
function* setLoadState(isLoading, fixState) {
    if (!fixState) {
        const current = yield select(state => state.isLoading);
        if (current !== isLoading) {
            yield put({ type: CHANGE_LOAD_STATE });        
        }
    }
}

/**
 * 選択中レイアウトの変更により不要となったマップ情報を削除する
 */
function* clearMapInfo() {
    const emptyExtendedPages = yield select(state => state.emptyExtendedPages);
    yield put({ type: SET_ELECKEY_OBJECTS, data: null });
    yield put({ type: CLEAR_SELECT_ELECKEYS, data: null });
    yield put({ type: CLEAR_OPERATION_INFO, extendedPages: emptyExtendedPages });
    yield call(setFirstUnlockPurpose);
}

/**
 * 操作情報をクリアする
 */
function* clearOperationInfo() {
    const emptyExtendedPages = yield select(state => state.emptyExtendedPages);
    yield put({ type: CLEAR_OPERATION_INFO, extendedPages: emptyExtendedPages });
    yield call(setFirstUnlockPurpose);
}

/**
 * 電気錠ラック表示用データをセットする
 * @param {array} dispItems データ
 * @param {boolean} canChanged 自動変更するかどうか
 */
function* setSelectElecKeyDispItems(dispItems, canChanged) {
    yield put({ type: SET_SELECT_ELECKEY_DISPITEMS, data: dispItems, canChanged });
    if (canChanged && isAllUnlockOrPhysicalKey(dispItems) && isAllSameUnlockPurpose(dispItems)) {
        yield put({ type: SET_SELECTED_UNLCOKPURPOSE, data: dispItems[0].electricLocks[0].unlockPurpose });
    }
}

/**
 * 若番の開錠目的をセットする
 */
function* setFirstUnlockPurpose() {
    const unlockPurposeList = yield select(state => state.unlockPurposeInfo.unlockPurposes);
    yield put({ type: SET_SELECTED_UNLCOKPURPOSE, data: getFirstUnlockPurpose(unlockPurposeList) });
}

//#endregion

//#region API

/**
 * ルックアップ情報を取得する
 */
export function getLookUp() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, '/api/electricLockMap/getLookUp', null, (data, networkError) => {
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
    let postData = { id: layoutId };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/electricLockMap/layout', postData, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE, networkError: true });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "マップ情報の取得に失敗しました。" });
            }
        })
    });
}

/**
 * 表示用電気錠ラック情報を取得する
 * @param {*} locationIds ロケーションIDリスト
 */
function getElectricLockRacks(locationIds) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/electricLockMap/electricLockRacks', locationIds, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE, networkError: true });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "電気錠ラック情報の取得に失敗しました。" });
            }
        })
    });
    
}

/**
 * 電気錠に施錠/開錠コマンド送信を保存する
 * @param {boolean} isLock ロックするかどうか
 * @param {array} locationIds 対象のロケーションIDリスト
 * @param {boolean} front 前面
 * @param {boolean} rear 背面
 * @param {string} memo メモ
 * @param {string} unlockPurpose 開錠目的
 */
function saveElecKeyCommand(isLock, locationIds, front, rear, memo, unlockPurpose, extendedPages) {
    let url = '/api/ElectricLockOperation/';
    url += isLock ? 'lockRacks' : 'unlockRacks';
    const postData = {
        locationIds: locationIds,
        front: front,
        rear: rear,
        memo: memo,
        purpose: isLock ? null : unlockPurpose,
        extendedPages: extendedPages
    };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, url, postData, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, message: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: data.isSuccess, message: data.message });
            } else {
                resolve({ isSuccessful: false, message: (isLock ? "施錠" : "開錠") + "信号の送信に失敗しました。" });
            }
        })
    });
}

/**
 * 施解錠詳細情報を取得する
 */
export function getELockOpenExtendedPages() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, '/api/extendedData/getELockOpen', null, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "施解錠詳細情報の取得に失敗しました。" });
            }
        })
    });
}

//#endregion
