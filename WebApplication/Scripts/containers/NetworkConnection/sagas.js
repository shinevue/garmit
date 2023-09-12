/**
 * @license Copyright 2019 DENSO
 * 
 * レポートスケジュール画面のsagaを生成する
 * 
 */
'use strict';

import {  effects } from "redux-saga";
const { fork, put, take, call, takeEvery, select } = effects;

import { REQUEST_INITIAL_INFO } from './actions.js';
import { REQUEST_NETWORKPATH_ROWS, REQUEST_SELECT_NETWORK, REQUEST_EDIT_NETWORK, REQUEST_DELETE_NETWORK_ROWS } from './actions.js';
import { SET_NETWORKPATH_ROWS, SET_NETWORKPATH, CLEAR_NETWORKPATH } from './actions.js';
import { SET_LAYOUTS, SET_CABLETYPES, SET_LOADSTATE, CHANGE_MESSAGE_STATE } from './actions.js';
import { SET_EDITING_NETWORKPATH, SET_UNITDISPSETTING, SET_UNIT, SET_PORT } from './actionsEditInfo.js';
import { CLEAR_NETWORK_ONE_SIDE, CLEAR_NETWORK_CONNECT } from './actionsEditInfo.js';

import { SET_LOCATION, SET_LAYOUT_OBJECT, SET_RACK, CLEAR_RACK } from 'DualRack/actions.js';
import { SET_LOOKUP } from 'SearchCondition/actions.js';
import { SET_WAITING_STATE } from 'WaitState/actions';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { isSameNetworkPath, makeNetworkPath, findUnitDispSettingFromUnitId, adjustNetworkPath } from 'assetUtility';
import { makeOmitEditNetworkRackData, makeOmitEditNetworkUnitData, makeNetworkPortSimpleData } from 'assetUtility';
import { getLayoutObject } from 'assetUtility';

/**
 * rootSaga
 */
export default function* rootSaga() {
    yield takeEvery(REQUEST_INITIAL_INFO, initializeInfo);                      //画面初期化
    yield takeEvery(REQUEST_NETWORKPATH_ROWS, searchNetworkPathRows);           //ネットワーク経路一覧検索
    yield takeEvery(REQUEST_SELECT_NETWORK, setSelectNetwrok);                  //選択中ネットワークのセット 
    yield takeEvery(REQUEST_EDIT_NETWORK, setEditNetwrok);                      //編集中ネットワークのセット
    yield takeEvery(REQUEST_DELETE_NETWORK_ROWS, deleteMultiNetworkPaths);      //ネットワーク経路削除（複数）
}

//#region rootSagaから呼び出される関数

/**
 * 初期情報をセットする
 */
function* initializeInfo() {
    yield call(setLoadState, true);
    yield call(setLookUp);
    yield call(setLoadState, false);
}

/**
 * ネットワーク経路一覧を検索する
 */
function* searchNetworkPathRows() {
    yield call(setLoadState, true);
    const searchCondition = yield select(state => state.searchCondition.conditions);
    yield call(setNetworkRows, searchCondition);
    const selectedNetworkPath = yield select(state => state.selectedNetworkPath);
    const networkPathRows = yield select(state => state.networkPathRows);
    if (!selectedNetworkPath || 
        !(networkPathRows && networkPathRows.some((row) => isSameNetworkPath(row, selectedNetworkPath.networkPathRow)))) {
            yield put({ type: CLEAR_NETWORKPATH });        //選択中のネットワーク情報をクリアする
    } else {
        const selectRow = networkPathRows.find((row) => isSameNetworkPath(row, selectedNetworkPath.networkPathRow));
        if (selectRow) {
            yield call(setSelectNetwrok, { networkRow: selectRow });
        } else {
            yield put({ type: CLEAR_NETWORKPATH });
        }        
    }
    yield call(setLoadState, false);
}

/**
 * ネットワーク経路（複数）を削除する
 */
function* deleteMultiNetworkPaths(action) {
    yield call(setWaitingState, true, 'delete');
    const { networkRows, callback } = action;
    if (networkRows && networkRows.length > 0) {
        const deleteRows = networkRows.filter((row, index, self) => index === self.findIndex((r) => r.networkId === row.networkId));
        const networkPathInfo = yield call(postDeleteNetworkPaths, deleteRows);
        if (networkPathInfo.isSuccessful) {
            yield call(setShowMessage, '削除完了', 'ネットワーク接続情報を削除しました。');
            yield fork(searchNetworkPathRows);            //ネットワーク経路一覧を更新
        } else {
            yield call(setShowErrorMessage, networkPathInfo.errorMessage);
        }
        callback && callback(networkPathInfo.isSuccessful);
    }
    yield call(setWaitingState, false, null);
}

/**
 * 選択中ネットワーク情報をセットする
 */
function* setSelectNetwrok(action) {
    yield call(setLoadState, true);
    const { networkRow } = action;
    if (networkRow.networkId) {
        yield call(setSelectNetworkPath, networkRow);
    } else {
        yield call(setSelectNetworkPathFormRack, networkRow);
    }
    yield call(setLoadState, false);
}

/**
 * 編集中ネットワーク情報をセットする
 */
function* setEditNetwrok(action) {
    const { networkRow } = action;
    if (networkRow) {
        yield call(setLoadState, true);
        if (networkRow.networkId) {
            yield call(setEditingNetworkPathFromNetwork, networkRow, action.callback);
        } else {
            yield call(setEditingNetworkPathFormRack, networkRow, action.callback);
        }
        yield call(setLoadState, false);
    } else {
        //新規情報
        yield call(clearRack, true);
        yield call(clearRack, false);
        yield put({ type: CLEAR_NETWORK_CONNECT });    //ネットワークの接続解除
        yield call(setNetworkConnectInfo, null, null, null, null, true);
        yield call(setNetworkConnectInfo, null, null, null, null, false);
        action.callback && action.callback(true);
    }
}

//#endregion

//#region その他関数

/**
 * LookUpをセットする
 */
function* setLookUp() {
    const lookUpInfo = yield call(getLookUp);
    if (lookUpInfo.isSuccessful) {
        yield put ({ type: SET_LOOKUP, value: lookUpInfo.data });
        yield put ({ type: SET_LAYOUTS, layouts: lookUpInfo.data.layouts });
        yield put ({ type: SET_CABLETYPES, value: lookUpInfo.data.cableTypes });
    } else {
        yield call(setShowErrorMessage, lookUpInfo.errorMessage);
    }
}

/**
 * ネットワーク経路一覧をセットする
 * @param {object} lookUp 検索条件
 */
function* setNetworkRows(lookUp) {
    const networkRowsInfo = yield call(getNetworkPathRows, lookUp);
    if (networkRowsInfo.isSuccessful) {
        yield put ({ type: SET_NETWORKPATH_ROWS, networkPathRows: networkRowsInfo.data });
    } else {
        yield call(setShowErrorMessage, networkRowsInfo.errorMessage);
    }
}

/**
 * 選択中のネットワーク経路情報をセットする
 * @param {object} networkRow ネットワーク一覧の行情報
 */
function* setSelectNetworkPath(networkRow) {
    const networkRowsInfo = yield call(postGetNetwrokPathByNetwrokId, networkRow.networkId);
    if (networkRowsInfo.isSuccessful) {
        yield put ({ type: SET_NETWORKPATH, networkRow: networkRow, networkPath: adjustNetworkPath(networkRowsInfo.data&&networkRowsInfo.data[0], networkRow) });
    } else {
        yield call(setShowErrorMessage, networkRowsInfo.errorMessage);
    }
}

/**
 * ラック情報から選択中ネットワークをセットする
 * @param {object} networkRow ネットワーク一覧の行情報
 */
function* setSelectNetworkPathFormRack(networkRow) {
    var rackIds = [ networkRow.rackIdFrom ];
    networkRow.rackIdTo && rackIds.push(networkRow.rackIdTo);
    const rackInfo = yield call(postGetRacks, [ networkRow.rackIdFrom ], false);
    if (rackInfo.isSuccessful) {
        const netwrokPath = rackInfo.data && makeNetworkPath(networkRow, rackInfo.data);
        yield put ({ type: SET_NETWORKPATH, networkRow: networkRow, networkPath: netwrokPath });
    } else {
        yield call(setShowErrorMessage, rackInfo.errorMessage);
    }
}

/**
 * 編集中ネットワーク経路情報をセットする
 * @param {object} networkRow ネットワーク一覧の行情報
 */
function* setEditingNetworkPathFromNetwork(networkRow, callback) {
    const networkRowsInfo = yield call(postGetNetwrokPathWithUnit, networkRow.networkId);
    if (networkRowsInfo.isSuccessful) {
        const { networkPaths, unitDispSettingFrom, unitDispSettingTo } = networkRowsInfo.data;
        const networkPath = networkPaths&&adjustNetworkPath(networkPaths[0], networkRow);
        if (networkPath && unitDispSettingFrom.dispSetId !== networkPath.unitFrom.unitDispSetting.dispSetId) {
            var dispSettingFrom = unitDispSettingTo && _.cloneDeep(unitDispSettingTo);
            var dispSettingTo = _.cloneDeep(unitDispSettingFrom);
        } else {
            var dispSettingFrom = unitDispSettingFrom;
            var dispSettingTo = unitDispSettingTo;
        }
        yield call(setEditNetwrokInfo, networkPath, dispSettingFrom, dispSettingTo);
    } else {
        yield call(setShowErrorMessage, networkRowsInfo.errorMessage);
    }
    callback && callback(networkRowsInfo.isSuccessful);
}

/**
 * ラック情報から編集中ネットワーク経路情報をセットする
 * @param {object} networkRow ネットワーク一覧の行情報
 */
function* setEditingNetworkPathFormRack(networkRow, callback) {
    var rackIds = [ networkRow.rackIdFrom ];
    networkRow.rackIdTo && rackIds.push(networkRow.rackIdTo);
    const rackInfo = yield call(postGetRacks, [ networkRow.rackIdFrom ], true);
    if (rackInfo.isSuccessful) {
        const networkPath = rackInfo.data && makeNetworkPath(networkRow, rackInfo.data);
        const unitDispSettingFrom = networkPath && findUnitDispSettingFromUnitId(networkPath.rackFrom, networkRow.unitIdFrom);
        const unitDispSettingTo = networkPath && findUnitDispSettingFromUnitId(networkPath.rackTo, networkRow.unitIdTo);
        yield call(setEditNetwrokInfo, networkPath, unitDispSettingFrom, unitDispSettingTo); 
    } else {
        yield call(setShowErrorMessage, rackInfo.errorMessage);
    }
    callback && callback(rackInfo.isSuccessful)
}

/**
 * ネットワーク情報をセットする
 * @param {object} rack ラック情報
 * @param {object} unit ユニット情報
 * @param {object} port ポート情報
 * @param {object} isLeft 左側ラックかどうか
 */
function* setNetworkConnectInfo(rack, unit, port, portIndex, isLeft) {
    let canConnect = (rack && unit && port && (portIndex !== null)) ? true : false;
    let newPortIndex = !portIndex&&canConnect ? 1 : portIndex;
    yield put({ type: SET_UNIT, unit: unit, canConnect: canConnect, isLeft: isLeft });
    yield put({ type: SET_PORT, port:port, portIndex: newPortIndex, canConnect: canConnect, isLeft: isLeft });
}

/**
 * 編集中のネットワーク情報をセットする
 * @param {object} networkPath ネットワーク情報
 * @param {object} unitDispSettingFrom 接続元ユニット表示設定情報
 * @param {object} unitDispSettingTo 接続先ユニット表示設定情報
 */
function* setEditNetwrokInfo(networkPath, unitDispSettingFrom, unitDispSettingTo) {
    yield call(setEditingNetworkPath, networkPath);
    yield call(setLocation, networkPath.rackFrom.location, null, true);
    yield call(setLayoutObject, getLayoutObject(networkPath.rackFrom), true);
    yield call(setRack, makeOmitEditNetworkRackData(networkPath.rackFrom), true);
    yield call(setUnitDispSetting, unitDispSettingFrom, true);
    yield call(setNetworkConnectInfo, networkPath.rackFrom, makeOmitEditNetworkUnitData(networkPath.unitFrom), makeNetworkPortSimpleData(networkPath.portFrom), networkPath.portIndexFrom, true);
    if (networkPath.rackTo) {
        yield call(setLocation, networkPath.rackTo.location, null, false);
        yield call(setLayoutObject, getLayoutObject(networkPath.rackTo), false);
        yield call(setRack, makeOmitEditNetworkRackData(networkPath.rackTo), false);
        yield call(setUnitDispSetting, unitDispSettingTo, false);
        yield call(setNetworkConnectInfo, networkPath.rackTo, makeOmitEditNetworkUnitData(networkPath.unitTo), makeNetworkPortSimpleData(networkPath.portTo), networkPath.portIndexTo, false);    
    } else {
        yield call(clearRack, false);
        yield put({ type: CLEAR_NETWORK_ONE_SIDE, isFrom: false });
        yield call(setNetworkConnectInfo, null, null, null, null, false);
    }
}

//#endregion

//#region データのセット（単純にセットのみ）

/**
 * ロケーションを選択する
 * @param {object} location 選択したロケーション
 * @param {array} position ロケーションの位置
 * @param {boolean} isLeft 左側のロケーションかどうか
 */
function* setLocation(location, position, isLeft) {
    yield put({ type:SET_LOCATION, location, position, isLeft });
}


/**
 * レイアウトオブジェクトをセットする
 * @param {object} layoutObject レイアウトオブジェクト
 * @param {boolean} isLeft 左側のロケーションかどうか
 */
function* setLayoutObject(layoutObject, isLeft) {    
    yield put({ type:SET_LAYOUT_OBJECT, layoutObject, isLeft });
}

/**
 * ロケーションを選択する
 * @param {object} rack 選択したラック
 * @param {boolean} isLeft 左側のロケーションかどうか
 */
function* setRack(rack, isLeft) {
    yield put({ type:SET_RACK, rack, isLeft });
}

/**
 * 編集中のネットワーク情報をセットするActionを作成する
 * @param {object} networkPath ネットワーク情報
 */
function* setEditingNetworkPath(networkPath) {
    yield put({type:SET_EDITING_NETWORKPATH, networkPath });
}

/**
 * 表示設定グループをセットするActionを作成する
 * @param {object} unitDispSetting 表示設定グループ情報
 * @param {boolean} isLeft 左側かどうか
 */
function* setUnitDispSetting(unitDispSetting, isLeft) {
    yield put({ type:SET_UNITDISPSETTING, unitDispSetting, isLeft });
}

/**
 * ユニットをセットするActionを作成する
 * @param {object} unit ユニット情報
 * @param {boolean} canConnect 接続できるか
 * @param {boolean} isLeft 左側かどうか
 */
function* setUnit(unit, canConnect, isLeft) {
    yield put({ type:SET_UNIT, unit, canConnect, isLeft });
}

/**
 * ポートをセットするActionを作成する
 * @param {object} port ポート情報
 * @param {number} portIndex ポートインデックス
 * @param {boolean} canConnect 接続できるか
 * @param {boolean} isLeft 左側かどうか
 */
function* setPort(port, portIndex, canConnect, isLeft) {
    yield put({ type:SET_PORT, port, portIndex, canConnect, isLeft });
}

/**
 * ラックをクリアする
 * @param {*} isLeft 左側かどうか
 */
function* clearRack(isLeft) {
    yield put({ type: CLEAR_RACK, isLeft });
}

/**
 * メッセージをセットする（単純にセットのみ）
 * @param {string} message メッセージ
 */
function* setShowMessage(title, message, callback) {
    yield put({ type: CHANGE_MESSAGE_STATE, value:true, title: title, message:message, callback:callback });
}

/**
 * エラーメッセージをセットする（単純にセットのみ）
 * @param {string} message メッセージ
 */
function* setShowErrorMessage(message) {
    yield put({ type: CHANGE_MESSAGE_STATE, value:true, title: 'エラー', message:message });
}

/**
 * ロード状態を変更する
 * @param {boolean} isLoading ロード状態
 */
function* setLoadState(isLoading) {
    yield put({ type: SET_LOADSTATE, value: isLoading });
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
 * LookUp取得
 */
function getLookUp() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, '/api/networkPath', null, (info, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (info) {
                resolve({ isSuccessful: true, data: info.lookUp });
            } else {
                resolve({ isSuccessful: false, errorMessage: 'データ取得に失敗しました。' });
            }
        });
    });
}

/**
 * ネットワーク経路一覧を取得する
 * @param {*} conditions 検索条件
 */
function getNetworkPathRows(lookUp) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/networkPath/getNetworkPathRows', lookUp, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: 'データ取得に失敗しました。' });
            }
        });
    });
}

/**
 * ネットワーク経路削除（複数）
 * @param {array} networkPathRows ネットワーク経路一覧表の行リスト
 */
function postDeleteNetworkPaths(networkPathRows) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/networkPath/deleteNetworkPaths', networkPathRows, (result, networkError) => { //API削除用関数呼び出し
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (result) {
                resolve({ isSuccessful: true });
            }
            else {
                resolve({ isSuccessful: false, errorMessage: 'ネットワーク接続情報の削除に失敗しました。' });
            }
        })
    })
}

/**
 * ネットワーク情報の取得
 * @param {number} networkId ネットワークID
 */
function postGetNetwrokPathByNetwrokId(networkId) {
    const postData = { id: networkId };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/networkPath/getNetworkPathByNetworkId', postData, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: 'ネットワーク情報の取得に失敗しました。' });
            }
        });
    });
}

/**
 * ネットワーク情報の取得（ユニット表示設定情報を含む）
 * @param {number} networkId ネットワークID
 */
function postGetNetwrokPathWithUnit(networkId) {
    const postData = { id: networkId };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/networkPath/getNetworkPathWithUnit', postData, (info, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (info) {
                resolve({ isSuccessful: true, data: info });
            } else {
                resolve({ isSuccessful: false, errorMessage: 'ネットワーク情報の取得に失敗しました。' });
            }
        });
    });
}

/**
 * ネットワーク情報の取得（ユニット表示設定情報を含む）
 * @param {number} networkId ネットワークID
 * @param {boolean} needLayoutObject レイアウトオブジェクトが必要かどうか
 */
function postGetRacks(rackIds, needLayoutObject) {
    const postData = {
        rackIds,
        needLayoutObject
    };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/rack/getRackViews', postData, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: 'ラック情報の取得に失敗しました。' });
            }
        });
    });
}

//#endregion