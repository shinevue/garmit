/**
 * @license Copyright 2019 DENSO
 * 
 * 制御設定画面のsagaを生成する
 * 
 */
'use strict';

import { effects } from 'redux-saga';
const { fork, put, take, call, takeEvery, select } = effects;
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

import { REQUEST_INIT_INFO } from './actions';
import { REQUEST_GET_CONTROL_COMMAND_LIST, REQUEST_GET_TRIGGER_CONTROL_LIST } from './actions';
import { REQUEST_GET_CONTROL_COMMANDS, REQUEST_GET_TRIGGER_CONTROLS } from './actions';
import { REQUEST_GET_LOCATION_COMMANDS, REQUEST_CAHNGE_TRIGGER_TYPE, REQUEST_CHANGE_LOCATION, REQUEST_CAHNGE_TRIGGER_POINT } from './actions';
import { REQUEST_SAVE_CONTROL_COMMANDS, REQUEST_SAVE_TRIGGER_CONTROLS, REQUEST_SAVE_DEMAND_SET } from './actions';
import { REQUEST_DELETE_CONTROL_COMMANDS, REQUEST_DELETE_TRIGGER_CONTROLS } from './actions';
import { REQUEST_EXECUTE_COMMAND, REQUEST_STOP_COMMAND } from './actions';
import { SET_TRIGGER_TYPES, SET_COMMAND_STATUSES } from './actions';
import { SET_DELETE_CONTROLIDS } from './actions';
import { SET_CONTROL_COMMANDS, SET_TRIGGER_CONTROLS } from './actions';
import { SET_LOCATION_COMMANDS } from './actions'; 
import { CHANGE_TRIGGER_CONTROLS, CHANGE_BULK_TRIGGER_CONTROL } from './actions';
import { SET_DEMAND_SET, SET_THRESHOLDS, SET_CHNAGE_DEMANDSET_FLG } from './actions';

import { SET_LOOKUP } from 'SearchCondition/actions.js';
import { SET_SEARCH_RESULT } from 'SearchResult/actions';
import { SUCCESS_SAVE, SUCCESS_DELETE, SHOW_ERROR_MESSAGE, CHANGE_MODAL_STATE } from 'ModalState/actions';
import { CHANGE_LOAD_STATE } from 'LoadState/actions';
import { SET_WAITING_STATE } from 'WaitState/actions';

import { COMMAND_STATUS_WATIING, getEmptyControlCommand, gatChangedBulkData, getChildrenLocationList, getEmptyTriggerControl } from 'controlSettingUtility';
import { compareAscending } from 'sortCompare'; 

/**
 * rootSaga
 */
export default function* rootSaga() {
    yield takeEvery(REQUEST_INIT_INFO, initializeInfo);                             //画面初期化
    yield takeEvery(REQUEST_GET_CONTROL_COMMAND_LIST, searchControlCommandList);    //個別制御リスト取得
    yield takeEvery(REQUEST_GET_TRIGGER_CONTROL_LIST, searchTriggerControlList);    //デマンド制御リスト取得
    yield takeEvery(REQUEST_DELETE_CONTROL_COMMANDS, deleteControlCommands);        //制御コマンドを削除
    yield takeEvery(REQUEST_DELETE_TRIGGER_CONTROLS, deleteTriggerControls);        //トリガー制御を削除
    yield takeEvery(REQUEST_EXECUTE_COMMAND, executeCommand);                       //コマンド実行
    yield takeEvery(REQUEST_STOP_COMMAND, stopCommand);                             //コマンド停止
    yield takeEvery(REQUEST_GET_CONTROL_COMMANDS, setEditControlCommandInfo);       //編集用制御コマンド情報セット
    yield takeEvery(REQUEST_GET_TRIGGER_CONTROLS, setEditTriggerControlInfo);       //トリガー制御取得
    yield takeEvery(REQUEST_CHANGE_LOCATION, changeLocation);                       //ロケーション変更
    yield takeEvery(REQUEST_GET_LOCATION_COMMANDS, loadLocationCommands);           //ロケーション配下の制御コマンドを読み込む
    yield takeEvery(REQUEST_CAHNGE_TRIGGER_TYPE, changeTriggerType);                //トリガー種別変更
    yield takeEvery(REQUEST_CAHNGE_TRIGGER_POINT, setTriggerThreshold);             //トリガーポイント変更
    yield takeEvery(REQUEST_SAVE_CONTROL_COMMANDS, saveControlCommandInfo);         //制御コマンド保存
    yield takeEvery(REQUEST_SAVE_TRIGGER_CONTROLS, saveTriggerControlInfo);         //トリガー制御保存
    yield takeEvery(REQUEST_SAVE_DEMAND_SET, saveDemandSet);                        //デマンド設定（しきい値のみ）保存
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
 * 制御コマンド（個別制御）リストを検索する
 */
function* searchControlCommandList(action) {
    yield call(setLoadState, true);
    const searchCondition = yield select(state => state.searchCondition.conditions);
    const controlCondition = yield select(state => state.controlCondition.statuses);
    const commandStatuses = yield select(state => state.commandStatuses);
    var lookUp = null;
    var statuses = {};
    (controlCondition && commandStatuses) && controlCondition.forEach((key) => {
        statuses[key] = commandStatuses[key];
    });
    if (searchCondition && controlCondition) {
        lookUp = Object.assign(searchCondition, { commandStatuses: statuses });
    } else if (searchCondition) {
        lookUp = Object.assign(searchCondition);
    } else if (controlCondition) {
        lookUp = { commandStatuses: statuses };
    }
    yield call(setControlCommandResult, lookUp, action.showNoneMessage);
    yield call(setLoadState, false);
}

/**
 * トリガー制御（デマンド/発電量制御）リストを検索する
 */
function* searchTriggerControlList(action) {
    yield call(setLoadState, true);
    const lookUp = yield select(state => state.searchCondition.conditions);
    yield call(setTriggerControlResult, lookUp, action.showNoneMessage);
    yield call(setLoadState, false);
}

/**
 * 制御コマンドを保存する
 */
function* saveControlCommandInfo() {
    yield call(setWaitingState, true, 'save');
    const editControlCommands = yield select(state => state.editControlCommands);
    if (editControlCommands.length > 1) {
        yield call(saveControlCommands, editControlCommands);
    } else {
        yield call(saveControlCommand, editControlCommands[0]);
    }
    yield call(setWaitingState, false, null);
}

/**
 * トリガー制御を保存する
 */
function* saveTriggerControlInfo() {
    yield call(setWaitingState, true, 'save');
    const editTriggerControls = yield select(state => state.editTriggerControls);
    const editTriggerControlOperations = yield select(state => state.editTriggerControlOperations);
    if (editTriggerControls.length > 1) {
        yield call(saveTriggerControls, editTriggerControls);
    } else {
        yield call(saveTriggerControl, editTriggerControls[0], editTriggerControlOperations);
    }
    yield call(setWaitingState, false, null);
}

/**
 * 制御コマンドを削除する
 */
function* deleteControlCommands() {
    yield call(setWaitingState, true, 'delete');
    const targetControlIds = yield select(state => state.deleteControlIds);
    if (targetControlIds && targetControlIds.length > 0) {
        yield call(deleteControlCommandsById, targetControlIds);
        yield fork(searchControlCommandList, { showNoneMessage: false });            //制御コマンド一覧を再表示する
    }
    yield call(setWaitingState, false, null);
}

/**
 * トリガー制御を削除する
 */
function* deleteTriggerControls() {
    yield call(setWaitingState, true, 'delete');
    const targetControlIds = yield select(state => state.deleteControlIds);
    if (targetControlIds && targetControlIds.length > 0) {
        yield call(deleteTriggerControlsById, targetControlIds);
        yield fork(searchTriggerControlList, { showNoneMessage: false });            //トリガー制御一覧を再表示する
    }
    yield call(setWaitingState, false, null);
}

/**
 * コマンド実行 
 */
function* executeCommand(action) {
    yield call(setWaitingState, true, 'save');
    const commandInfo = yield call(sendCoommandExecution, action.commandId);
    if (commandInfo.isSuccessful) {
        yield put({ type: CHANGE_MODAL_STATE, 
            data: {
               show: true,
               title: '送信成功',
               message: '実行信号を送信しました。',
               bsSize: 'sm',
               buttonStyle: 'message',
               okOperation: 'confirmUpdate'
        }});
        yield fork(searchControlCommandList, { showNoneMessage: false });            //制御コマンド一覧を再表示する
    } else {
        yield call(setErrorMessage, commandInfo.errorMessage);
    }
    yield call(setWaitingState, false, null);
}

/**
 * コマンド停止
 */
function* stopCommand(action) {
    yield call(setWaitingState, true, 'save');
    const commandInfo = yield call(sendCoommandStop, action.commandId);
    if (commandInfo.isSuccessful) {
        yield put({ type: CHANGE_MODAL_STATE, 
            data: {
               show: true,
               title: '送信成功',
               message: '停止信号を送信しました。',
               bsSize: 'sm',
               buttonStyle: 'message',
               okOperation: 'confirmUpdate'
        }});
        yield fork(searchControlCommandList, { showNoneMessage: false });            //制御コマンド一覧を再表示する
    } else {
        yield call(setErrorMessage, commandInfo.errorMessage);
    }
    yield call(setWaitingState, false, null);
}

/**
 * 編集用制御コマンド関連情報をセットする
 */
function* setEditControlCommandInfo(action) {
    yield call(setLoadState, true);
    const { controlIds, isRegister, callback } = action;
    if (!isRegister) {
        yield call(setEditControlCommands, controlIds, callback);
    } else {
        yield put({ type: SET_CONTROL_COMMANDS, data: [getEmptyControlCommand()] , isRegister: true });
        callback && callback();
    }
    
    yield call(setLoadState, false);
}

/**
 * 編集用トリガー制御関連情報をセットする
 */
function* setEditTriggerControlInfo(action) {
    yield call(setLoadState, true);
    const { controlIds, isRegister, callback } = action;
    if (!isRegister) {
        yield call(setEditTriggerControls, controlIds, callback);
    } else {
        yield put({ type: SET_TRIGGER_CONTROLS, data: [getEmptyTriggerControl()] , controls: [], isRegister: true });
        callback && callback();
    }
    
    yield call(setLoadState, false);
}

/**
 * ロケーション制御コマンドリストを読み込む
 */
function* loadLocationCommands(action) {
    yield call(setLoadState, true);
    yield call(setLocationCommands, action.locations, action.triggerId);
    yield call(setLoadState, false);
}

/**
 * ロケーションを変更する
 */
function* changeLocation(action) {
    yield call(setLoadState, true);
    yield call(setDemandSet, action.location.locationId);
    const triggerThresholds = yield select(state => state.demandSet && state.demandSet.triggerThresholds);
    var triggerId = null;
    if (!triggerId && triggerThresholds && triggerThresholds.length > 0) {
        let thresholds = yield call(sortTriggerThresholds, triggerThresholds);
        triggerId = thresholds[0].triggerType.triggerId;
    }
    yield call(setLocationRelatedData, triggerId, action.targetLocations);
    yield call(setLoadState, false);
}


/**
 * トリガー種別を変更する
 * @param {*} triggerId トリガーID
 */
function* changeTriggerType(action, changeLoadState = true) {
    yield changeLoadState && call(setLoadState, true);
    const { triggerId, locations, isBulk } = action;
    yield call(setThresholds, triggerId);
    if (!isBulk) {
        yield call(setLocationCommands, locations, triggerId); 
    }
    yield changeLoadState && call(setLoadState, false);
}

/**
 * トリガー閾値をセットする
 */
function* setTriggerThreshold(action) {
    const { triggerId, pointNo } = action;
    const editTriggerControls = yield select(state => state.editTriggerControls);
    const triggerThresholds = yield select(state => state.demandSet && state.demandSet.triggerThresholds);
    const invalid = yield select(state => state.invalid);
    const triggerThreshold = triggerThresholds && triggerThresholds.find((th) => th.triggerType.triggerId === triggerId && (pointNo ?  th.pointNo === pointNo : true) );
    if (editTriggerControls.length === 1) {
        let isError = invalid.triggerControl
        yield put({ type: CHANGE_TRIGGER_CONTROLS, key: 'point', value: triggerThreshold, isError: isError });
        yield call(setEditTriggerThreshold, triggerThreshold && triggerThreshold.threshold, isError);
    } else {
        const editBulkKeys = yield select(state => state.editBulkKeys);
        const bulkTriggerControl  = yield select(state => state.bulkTriggerControl);
        let update = _.cloneDeep(bulkTriggerControl);
        update.point = triggerThreshold;
        update.triggerThreshold = triggerThreshold && triggerThreshold.threshold;
        yield put({ type: CHANGE_BULK_TRIGGER_CONTROL, keys: editBulkKeys, value: update, isError: invalid.triggerControl });
    }
}

/**
 * デマンド設定（しきい値のみ）を保存する 
 */
function* saveDemandSet(action) {
    const { demandSet, callback } = action;
    yield call(setWaitingState, true, 'save');
    const saveDemandSetInfo = yield call(postSaveDemandSet, demandSet);
    if (saveDemandSetInfo.isSuccessful) {
        yield call(updateDemandSet);
        yield put({ type: SET_CHNAGE_DEMANDSET_FLG, isChanged: true });
        callback && callback();
    } else {
        yield call(setErrorMessage, saveDemandSetInfo.errorMessage);
    }
    yield call(setWaitingState, false, null);


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
        yield put ({ type: SET_TRIGGER_TYPES, types: lookUpInfo.data.triggerTypes })
        yield put ({ type: SET_COMMAND_STATUSES, statuses: lookUpInfo.data.commandStatuses })
    } else {
        yield call(setErrorMessage, lookUpInfo.errorMessage);
    }
}

/**
 * 制御コマンド一覧をセットする
 * @param {object} lookUp 検索条件
 */
function* setControlCommandResult(lookUp, showNoneMessage) {
    const controlCommandInfo = yield call(getControlCommandList, lookUp);
    if (controlCommandInfo.isSuccessful) {
        yield put ({ type: SET_SEARCH_RESULT, value: controlCommandInfo.data });
        if (showNoneMessage && controlCommandInfo.data.rows.length <= 0) {
            yield put({ type: CHANGE_MODAL_STATE, data: { show: true, title: '検索', message:'検索条件に該当する個別制御がありません。', bsSize: 'sm', buttonStyle: 'message' }});
        }
    } else {
        yield call(setErrorMessage, controlCommandInfo.errorMessage);
    }
}

/**
 * トリガー制御一覧をセットする
 * @param {object} lookUp 検索条件
 */
function* setTriggerControlResult(lookUp, showNoneMessage) {
    const triggerControlInfo = yield call(getTriggerControlList, lookUp);
    if (triggerControlInfo.isSuccessful) {
        yield put ({ type: SET_SEARCH_RESULT, value: triggerControlInfo.data });
        if (showNoneMessage && triggerControlInfo.data.rows.length <= 0) {
            yield put({ type: CHANGE_MODAL_STATE, data: { show: true, title: '検索', message:'検索条件に該当するデマンド/発電量制御がありません。', bsSize: 'sm', buttonStyle: 'message' }});
        }
    } else {
        yield call(setErrorMessage, triggerControlInfo.errorMessage);
    }
}

/**
 * 制御IDで制御コマンドを削除する
 * @param {array} controlIds 制御IDリスト
 */
function* deleteControlCommandsById(controlIds) {
    const controlInfo = yield call(postDeleteControlCommands, controlIds);
    if (controlInfo.isSuccessful) {
        yield put({ type: SUCCESS_DELETE, targetName: "制御情報" });
        yield put({ type: SET_DELETE_CONTROLIDS, value: null });      //削除対象IDをクリアする
    } else {
        yield call(setErrorMessage, controlInfo.errorMessage);
    }
}

/**
 * 制御IDでトリガー制御を削除する
 * @param {array} controlIds 制御IDリスト
 */
function* deleteTriggerControlsById(controlIds) {
    const controlInfo = yield call(postDeleteTriggerControls, controlIds);
    if (controlInfo.isSuccessful) {
        yield put({ type: SUCCESS_DELETE, targetName: "制御情報" });
        yield put({ type: SET_DELETE_CONTROLIDS, value: null });      //削除対象IDをクリアする
    } else {
        yield call(setErrorMessage, controlInfo.errorMessage);
    }
}

/**
 * 編集用制御コマンドをセットする
 * @param {array} controlIds 制御ID
 */
function* setEditControlCommands(controlIds, callback) {
    const commandInfo = yield call(getControlCommands, controlIds);
    if (commandInfo.isSuccessful) {
        if (!commandInfo.data.some((command) => command.status !== COMMAND_STATUS_WATIING)) {         //定数にする！！
            yield put({ type: SET_CONTROL_COMMANDS, data: commandInfo.data, isRegister: false });
            callback && callback();
        } else {
            if (commandInfo.data.length > 1) {
                yield call(setErrorMessage, '実行中の制御コマンドがあるため、編集できません。');
            } else {
                yield call(setErrorMessage, '実行中のため、制御コマンドを編集できません。');
            }
        }
    } else {
        yield call(setErrorMessage, commandInfo.errorMessage);
    }
}

/**
 * 制御コマンドを保存する（単体）
 * @param {object} controlCommand 制御コマンド情報
 */
function* saveControlCommand(controlCommand) {
    const saveCommandInfo = yield call(postSaveControlCommand, controlCommand);
    if (saveCommandInfo.isSuccessful) {
        const searchCondition = yield select(state => state.searchCondition);
        yield searchCondition && searchCondition.conditions && fork(searchControlCommandList, { showNoneMessage: true });            //制御コマンド一覧を再表示する
        yield put({ type: SUCCESS_SAVE, targetName: "制御情報", okOperation:"transition" });
    } else {
        yield call(setErrorMessage, saveCommandInfo.errorMessage);
    }
}

/**
 * 制御コマンドを保存する（複数）
 * @param {array} beforeCommands 制御コマンド情報
 */
function* saveControlCommands(beforeCommands) {
    const editBulkKeys = yield select(state => state.editBulkKeys);
    const bulkControlCommand = yield select(state => state.bulkControlCommand);
    const target = gatChangedBulkData(beforeCommands, editBulkKeys, bulkControlCommand);
    const saveCommandInfo = yield call(postSaveControlCommands, target);
    if (saveCommandInfo.isSuccessful) {
        yield fork(searchControlCommandList, { showNoneMessage: true });            //制御コマンド一覧を再表示する
        yield put({ type: SUCCESS_SAVE, targetName: "制御情報", okOperation:"transition" });
    } else {
        yield call(setErrorMessage, saveCommandInfo.errorMessage);
    }
}

/**
 * トリガー制御を保存する（単体）
 * @param {object} controlCommand 制御コマンド情報
 */
function* saveTriggerControl(triggerControl, triggerControlOperations) {
    const saveControlInfo = yield call(postSaveTriggerControl, triggerControl, triggerControlOperations);
    if (saveControlInfo.isSuccessful) {
        const searchCondition = yield select(state => state.searchCondition);
        yield searchCondition && searchCondition.conditions && fork(searchTriggerControlList, { showNoneMessage: true });            //トリガー制御一覧を再表示する
        yield put({ type: SUCCESS_SAVE, targetName: "制御情報", okOperation:"transition" });
        yield put({ type: SET_CHNAGE_DEMANDSET_FLG, isChanged: false });
    } else {
        yield call(setErrorMessage, saveControlInfo.errorMessage);
    }
}

/**
 * トリガー制御を保存する（複数）
 * @param {array} beforeControls トリガー制御情報
 */
function* saveTriggerControls(beforeControls) {
    const editBulkKeys = yield select(state => state.editBulkKeys);
    const bulkTriggerControl = yield select(state => state.bulkTriggerControl);
    const target = gatChangedBulkData(beforeControls, editBulkKeys, bulkTriggerControl);
    const saveControlInfo = yield call(postSaveTriggerControls, target);
    if (saveControlInfo.isSuccessful) {
        yield fork(searchTriggerControlList, { showNoneMessage: true });            //トリガー制御一覧を再表示する
        yield put({ type: SUCCESS_SAVE, targetName: "制御情報", okOperation:"transition" });
    } else {
        yield call(setErrorMessage, saveControlInfo.errorMessage);
    }
}

/**
 * 編集用トリガー制御情報を取得する
 * @param {} controlIds 制御IDリスト
 * @param {*} callback コールバック関数
 */
function* setEditTriggerControls(controlIds, callback) {
    const controlInfo = yield call(getTriggerControls, controlIds);
    if (controlInfo.isSuccessful) {
        const { triggerControls, triggerControlOperation } = controlInfo.data;
        const triggerControl = triggerControls[0];
        if (triggerControls.length === 1) {
            var triggerControlCommands = triggerControlOperation ? triggerControlOperation.controlCommands : []
        } else {
            var triggerControlCommands = null;
        }
        yield put({ type: SET_TRIGGER_CONTROLS, data: triggerControls, controls: triggerControlCommands });
        callback && callback();

        //セレクトボックスなどの情報を取得
        if (triggerControls.length === 1) {
            yield call(setTriggerMasterData, triggerControl.location.locationId, triggerControl.triggerType.triggerId);
        }
    } else {
        yield call(setErrorMessage, controlInfo.errorMessage);
    }
}

/**
 * トリガー制御用のマスタデータを取得
 * @param {number} locationId 対象ロケーションID
 * @param {number} triggerId トリガーID
 */
function* setTriggerMasterData(locationId, triggerId) {
    //ロケーションIDからその配下のロケーションを取得する
    const locationTree = yield select(state => state.searchCondition.lookUp.locations);
    const locations = getChildrenLocationList(locationTree, locationId);
    yield call(setDemandSet, locationId);
    yield call(setThresholds, triggerId, false);
    yield call(setLocationCommands, locations, triggerId);
}

/**
 * ロケーション制御コマンドリストをセットする
 * @param {array} locations ロケーションリスト
 */
function* setLocationCommands(locations, triggerId) {
    const locationIds = locations ? locations.map((location) => location.locationId) : [];
    const commandInfo = yield call(getLocationCommands, locationIds, triggerId);
    if (commandInfo.isSuccessful) {
        yield put({ type: SET_LOCATION_COMMANDS, commands: commandInfo.data, locations: locations });
    } else {
        yield call(setErrorMessage, commandInfo.errorMessage);
    }
}

/**
 * ロケーション関連データをロードする
 * @param {*} triggerId トリガーID
 * @param {*} locations 配下のロケーションリスト
 */
function* setLocationRelatedData(triggerId, locations) {
    yield fork(setEditTiggerType, triggerId);
    yield fork(changeTriggerType, { triggerId: triggerId, locations: locations }, false);
}

/**
 * トリガー種別閾値データをセットする
 * @param {*} triggerId 
 */
function* setThresholds(triggerId, isSetPoint = true) {
    var triggerThresholds = yield select(state => state.demandSet && state.demandSet.triggerThresholds);
    triggerThresholds = yield triggerThresholds ? call(sortTriggerThresholds, triggerThresholds) : [];
    const filterThresholds = triggerThresholds.filter((th) => th.pointNo && th.triggerType.triggerId === triggerId);
    yield put({ type: SET_THRESHOLDS, thresholds: filterThresholds });
    if (isSetPoint) {
        if (filterThresholds && filterThresholds.length > 0) {
            yield call(setDefaultTriggerPoint, filterThresholds);
        } else {
            yield call(setTriggerThreshold, { triggerId: triggerId, pointNo: null });
        }
    }
}

/**
 * デマンド設定をセットする
 * @param {*} locationId ロケーションID
 */
function* setDemandSet(locationId) {
    const demandSetInfo = yield call(getDemandSet, locationId);
    if (demandSetInfo.isSuccessful) {
        const { data } = demandSetInfo;
        yield put({ type: SET_DEMAND_SET, demandSet: data });
        yield call(setContractPower, data && data.contractPower);
        if (data && data.triggerThresholds && data.triggerThresholds.length <= 0) {
            yield call(setErrorMessage, 'デマンド設定が登録されていません。');
        }
    } else {
        yield call(setErrorMessage, demandSetInfo.errorMessage);
    }
}

/**
 * トリガー閾値をソートする
 * @param {*} triggerThresholds 対象トリガー閾値一覧
 */
function* sortTriggerThresholds(triggerThresholds) {
    return triggerThresholds.sort((current, next) => compareAscending(current.triggerType.triggerId, next.triggerType.triggerId));
}

/**
 * デマンド設定を更新する
 */
function* updateDemandSet() {
    yield call(setLoadState, true);
    const editTriggerControls = yield select(state => state.editTriggerControls);
    if (editTriggerControls.length === 1) {
        const locationId = editTriggerControls[0].location.locationId;
        const triggerId = editTriggerControls[0].triggerType.triggerId;
        const pointNo = editTriggerControls[0].pointNo;
        yield call(setDemandSet, locationId);    
        yield call(setThresholds, triggerId, false);
        yield call(updateTriggerControlThreshold, triggerId, pointNo);
    }
    yield call(setLoadState, false);
}

//#endregion

//#region データのセット

/**
 * 契約電力をセットする
 * @param {*} contractPower 契約電力
 */
function* setContractPower(contractPower) {
    const editTriggerControls = yield select(state => state.editTriggerControls);
    const invalid = yield select(state => state.invalid);
    if (editTriggerControls.length === 1) {
        yield put({ type: CHANGE_TRIGGER_CONTROLS, key: 'contractPower', value: contractPower, isError: invalid.triggerControl });
    } else {
        const editBulkKeys = yield select(state => state.editBulkKeys);
        const bulkTriggerControl  = yield select(state => state.bulkTriggerControl);
        let update = _.cloneDeep(bulkTriggerControl);
        update.contractPower = contractPower;
        yield put({ type: CHANGE_BULK_TRIGGER_CONTROL, keys: editBulkKeys, value: update, isError: invalid.triggerControl });
    }
}

/**
 * 編集のトリガータイプをセットする
 * @param {*} triggerId トリガーID
 */
function* setEditTiggerType(triggerId) {
    const editTriggerControls = yield select(state => state.editTriggerControls);
    const invalid = yield select(state => state.invalid);
    const triggerTypes = yield select(state => state.triggerTypes);
    const triggerType = triggerTypes && triggerTypes.find((type) => type.triggerId === triggerId);
    if (editTriggerControls.length === 1) {
        yield put({ type: CHANGE_TRIGGER_CONTROLS, key: 'triggerType', value: triggerType, isError: triggerType ? invalid.triggerControl : true });
    } else {
        const editBulkKeys = yield select(state => state.editBulkKeys);
        const bulkTriggerControl  = yield select(state => state.bulkTriggerControl);
        let update = _.cloneDeep(bulkTriggerControl);
        update.triggerType = triggerType;
        yield put({ type: CHANGE_BULK_TRIGGER_CONTROL, keys: editBulkKeys, value: update, isError: triggerType ? invalid.triggerControl : true });
    }    
}

/**
 * トリガーの対象ポイントにデフォルト値を設定する
 * @param {*} triggerThresholds トリガー閾値
 */
function* setDefaultTriggerPoint(triggerThresholds) {
    const editTriggerControls = yield select(state => state.editTriggerControls);
    const bulkTriggerControl = yield select(state => state.bulkTriggerControl);
    const invalid = yield select(state => state.invalid);
    const thresholds = yield call(sortTriggerThresholds, triggerThresholds);
    const firstTriggerThreshold = (thresholds.length > 0) ? thresholds[0] : null;
    if (editTriggerControls.length === 1) {
        let isError = invalid.triggerControl
        yield put({ type: CHANGE_TRIGGER_CONTROLS, key: 'point', value: firstTriggerThreshold, isError: isError });
        if (firstTriggerThreshold) {
            yield call(setEditTriggerThreshold, firstTriggerThreshold.threshold, isError);
        } else {
            yield call(setEditTriggerThreshold, null, isError);       
        }
    } else if (bulkTriggerControl) {
        const editBulkKeys = yield select(state => state.editBulkKeys);
        let update = _.cloneDeep(bulkTriggerControl);
        update.triggerThreshold = firstTriggerThreshold ? firstTriggerThreshold.threshold : null;
        update.point = firstTriggerThreshold && firstTriggerThreshold.pointNo && { pointNo: firstTriggerThreshold.pointNo, pointName: firstTriggerThreshold.pointName };
        yield put({ type: CHANGE_BULK_TRIGGER_CONTROL, keys: editBulkKeys, value: update, isError: invalid.triggerControl });
    }
}

/**
 * 編集中のトリガー制御のトリガーしきい値を変更する
 * @param {number} triggerId トリガー種別ID
 * @param {number} pointNo ポイント番号
 */
function* updateTriggerControlThreshold(triggerId, pointNo) {
    const demandSet = yield select(state => state.demandSet);
    const invalid = yield select(state => state.invalid);
    const triggerThreshold = demandSet.triggerThresholds.find((th) => th.triggerType.triggerId === triggerId && th.pointNo === pointNo);
    yield put({ type: CHANGE_TRIGGER_CONTROLS, key: 'triggerThreshold', value: triggerThreshold.threshold, isError: invalid.triggerControl });
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
 * 編集データのトリガー閾値をセットする
 * @param {*} threshold 閾値
 * @param {*} isError エラーかどうか
 */
function* setEditTriggerThreshold(threshold, isError) {
    yield put({ type: CHANGE_TRIGGER_CONTROLS, key: 'triggerThreshold', value: threshold, isError: isError });
}
//#endregion

//#region API呼び出し

/**
 * マスターデータを取得する
 */
function getLookUp() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, '/api/controlCommand/lookUp', null, (data, networkError) => {
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
 * 制御コマンド一覧を取得する
 */
function getControlCommandList(lookUp) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/controlCommand/commandResult', lookUp, (result, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (result) {
                resolve({ isSuccessful: true, data: result});
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "個別制御取得に失敗しました。" });
            }
        });
    });    
}

/**
 * トリガー制御一覧を取得する
 */
function getTriggerControlList(lookUp) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/controlCommand/triggerResult', lookUp, (result, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (result) {
                resolve({ isSuccessful: true, data: result });
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "デマンド/発電量制御取得に失敗しました。" });
            }
        });
    });
}

/**
 * 制御コマンドを保存する（単体）
 * @param {object} controlCommand 制御コマンド
 */
function postSaveControlCommand(controlCommand) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/controlCommand/saveControlCommand', controlCommand, (requestResult, networkError) => {
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
                resolve({ isSuccessful: false, errorMessage: "制御の保存に失敗しました。" });
            }
        })
    })
}

/**
 * 制御コマンドを保存する（複数）
 * @param {object} controlCommands 制御コマンド
 */
function postSaveControlCommands(controlCommands) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/controlCommand/saveControlCommands', controlCommands, (requestResult, networkError) => {
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
                resolve({ isSuccessful: false, errorMessage: "制御の保存に失敗しました。" });
            }
        })
    })
}

/**
 * トリガー制御を保存する（単体）
 * @param {object} triggerControl トリガー制御
 */
function postSaveTriggerControl(triggerControl, triggerControlOperations) {
    const postData = { 
        triggerControls: [ triggerControl ], 
        triggerControlOperation: triggerControlOperations.length > 0 ? { 
            triggerControlId: triggerControl.triggerControlId, 
            triggerControlName: triggerControl.triggerControlName, 
            controlCommands: triggerControlOperations
        } : null
    };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/controlCommand/saveTriggerControl', postData, (requestResult, networkError) => {
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
                resolve({ isSuccessful: false, errorMessage: "制御の保存に失敗しました。" });
            }
        })
    })
}

/**
 * 制御コマンドを保存する（複数）
 * @param {object} triggerControls 制御コマンド
 */
function postSaveTriggerControls(triggerControls) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/controlCommand/saveTriggerControls', triggerControls, (requestResult, networkError) => {
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
                resolve({ isSuccessful: false, errorMessage: "制御の保存に失敗しました。" });
            }
        })
    })
}

/**
 * 制御コマンドを削除する
 * @param {array} controlIds 制御IDリスト
 */
function postDeleteControlCommands(controlIds) {
    const postData = { controlIds: controlIds };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/controlCommand/deleteCommands', postData, (requestResult, networkError) => {
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
                resolve({ isSuccessful: false, errorMessage: "制御の削除に失敗しました。" });
            }
        })
    })
}

/**
 * トリガー制御を削除する
 * @param {array} controlIds 制御IDリスト
 */
function postDeleteTriggerControls(controlIds) {
    const postData = { controlIds: controlIds };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/controlCommand/deleteTriggerControls', postData, (requestResult, networkError) => {
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
                resolve({ isSuccessful: false, errorMessage: "制御の削除に失敗しました。" });
            }
        })
    });
}

/**
 * 制御コマンドの実行のリクエストを送る
 * @param {number} controlId 制御ID
 */
function sendCoommandExecution(controlId) {
    const postData = { controlId: controlId };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/controlCommand/executeCommand', postData, (requestResult, networkError) => {
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
                resolve({ isSuccessful: false, errorMessage: "制御コマンドの実行に失敗しました。" });
            }
        });
    });
}

/**
 * 制御コマンドの停止のリクエストを送る
 * @param {number} controlId 制御ID
 */
function sendCoommandStop(controlId) {
    const postData = { controlId: controlId };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/controlCommand/stopCommand', postData, (requestResult, networkError) => {
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
                resolve({ isSuccessful: false, errorMessage: "制御コマンドの停止に失敗しました。" });
            }
        });
    });
}

/**
 * 制御コマンド情報を取得する
 * @param {array} controlIds 制御IDリスト
 */
function getControlCommands(controlIds) {
    const postData = (controlIds.length === 1) ? { controlId: controlIds[0] } : { controlIds: controlIds };
    const url = (controlIds.length === 1) ? '/api/controlCommand/controlCommand' : '/api/controlCommand/controlCommands';
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, url, postData, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: '個別制御情報の取得に失敗しました。' });
            }
        })
    });
}

/**
 * トリガー制御情報を取得する
 * @param {array} controlIds 制御IDリスト
 */
function getTriggerControls(controlIds) {
    const postData = (controlIds.length === 1) ? { controlId: controlIds[0] } : { controlIds: controlIds };
    const url = (controlIds.length === 1) ? '/api/controlCommand/triggerControl' : '/api/controlCommand/triggerControls';
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, url, postData, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: 'デマンド制御情報の取得に失敗しました。' });
            }
        })
    });
}

/**
 * 指定したロケーションの制御コマンドを取得する
 * @param {array} locationIds ロケーションIDリスト
 */
function getLocationCommands(locationIds, triggerId) {
    const postData = { locationIds: locationIds, triggerId: triggerId };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/controlCommand/locationCommands', postData, (data, networkError) => {
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
 * デマンド設定を取得する
 * @param {array} locationId ロケーションID
 */
function getDemandSet(locationId) {
    const postData = { id: locationId };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/DemandSetting/getTriggerThresholds', postData, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data[0] });
            } else {
                resolve({ isSuccessful: false, errorMessage: 'デマンド設定情報の取得に失敗しました。' });
            }
        })
    })
}

/**
 * デマンド設定を保存する
 * @param {object} demandSet デマンド設定情報
 */
function postSaveDemandSet(demandSet) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/DemandSetting/setDemandSet', demandSet, (requestResult, networkError) => {
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
                resolve({ isSuccessful: false, errorMessage: "デマンド設定の保存に失敗しました。" });
            }
        })
    })
}

//#endregion
