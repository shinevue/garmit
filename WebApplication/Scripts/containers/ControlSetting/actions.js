/**
 * @license Copyright 2019 DENSO
 * 
 * ControlSettingPanelのAction(ActionCreator)を定義する。
 * 
 * 画面の状態を変更する場合は、必ずActionとReducerを準備してください。
 * Componentで直接setState()しないでください。
 * 
 */
'use strict';

//#region Action名の定義

//sagaへのリクエスト
export const REQUEST_INIT_INFO = 'REQUEST_INIT_INFO';
export const REQUEST_GET_CONTROL_COMMAND_LIST = 'REQUEST_GET_CONTROL_COMMAND_LIST';
export const REQUEST_GET_TRIGGER_CONTROL_LIST = 'REQUEST_GET_TRIGGER_CONTROL_LIST';
export const REQUEST_GET_CONTROL_COMMANDS = 'REQUEST_GET_CONTROL_COMMANDS';
export const REQUEST_GET_TRIGGER_CONTROLS = 'REQUEST_GET_TRIGGER_CONTROLS';
export const REQUEST_SAVE_CONTROL_COMMANDS = 'REQUEST_SAVE_CONTROL_COMMANDS';
export const REQUEST_SAVE_TRIGGER_CONTROLS = 'REQUEST_SAVE_TRIGGER_CONTROLS';
export const REQUEST_DELETE_CONTROL_COMMANDS = 'REQUEST_DELETE_CONTROL_COMMANDS';
export const REQUEST_DELETE_TRIGGER_CONTROLS = 'REQUEST_DELETE_TRIGGER_CONTROLS';
export const REQUEST_CHANGE_LOCATION = 'REQUEST_CHANGE_LOCATION';
export const REQUEST_GET_LOCATION_COMMANDS = 'REQUEST_GET_LOCATION_COMMANDS';
export const REQUEST_CAHNGE_TRIGGER_TYPE = 'REQUEST_CAHNGE_TRIGGER_TYPE';
export const REQUEST_CAHNGE_TRIGGER_POINT = 'REQUEST_CAHNGE_TRIGGER_POINT';
export const REQUEST_EXECUTE_COMMAND = 'REQUEST_EXECUTE_COMMAND';
export const REQUEST_STOP_COMMAND = 'REQUEST_STOP_COMMAND';
export const REQUEST_SAVE_DEMAND_SET = 'REQUEST_SAVE_DEMAND_SET';

export const SET_COMMAND_STATUSES = 'SET_COMMAND_STATUSES';
export const SET_CONTROL_CONDITION = 'SET_CONTROL_CONDITION';
export const SET_TRIGGER_TYPES = 'SET_TRIGGER_TYPES';
export const SET_EDIT_CONTROL_CONDITION = 'SET_EDIT_CONTROL_CONDITION';
export const SET_EDIT_CONDITION_MODE = 'SET_EDIT_CONDITION_MODE';
export const SET_EDIT_CONDITION_STATUS = 'SET_EDIT_CONDITION_STATUS';
export const CLEAR_EDIT_CONDITION_STATUS = 'CLEAR_EDIT_CONDITION_STATUS';
export const SET_CONTROL_COMMANDS = 'SET_CONTROL_COMMANDS';
export const SET_TRIGGER_CONTROLS = 'SET_TRIGGER_CONTROLS';
export const CHANGE_CONTROL_COMMANDS = 'CHANGE_CONTROL_COMMANDS';
export const CHANGE_TRIGGER_CONTROLS = 'CHANGE_TRIGGER_CONTROLS';
export const CHANGE_CONTROL_OPERATIONS = 'CHANGE_CONTROL_OPERATIONS';
export const CLEAR_EDIT = 'CLEAR_EDIT';
export const SET_DELETE_CONTROLIDS = 'SET_DELETE_CONTROLIDS';
export const SET_LOCATION_COMMANDS = 'SET_LOCATION_COMMANDS';
export const SET_DEMAND_SET = 'SET_DEMAND_SET';
export const SET_THRESHOLDS = 'SET_THRESHOLDS';
export const CHANGE_BULK_CONTROL_COMMANDS = 'CHANGE_BULK_CONTROL_COMMANDS';
export const CHANGE_BULK_TRIGGER_CONTROLS = 'CHANGE_BULK_TRIGGER_CONTROLS';
export const CHANGE_BULK_CONTROL_COMMAND = 'CHANGE_BULK_CONTROL_COMMAND';
export const CHANGE_BULK_TRIGGER_CONTROL = 'CHANGE_BULK_TRIGGER_CONTROL';
export const SET_CHNAGE_DEMANDSET_FLG = 'SET_CHNAGE_DEMANDSET_FLG';

//#endregion

//#region ActionCenter

//#region sagaへのリクエスト

/**
 * 初期化のリクエスト
 */
export function requestInitInfo() {
    return { type:REQUEST_INIT_INFO };
}

/**
 * 個別制御一覧取得のリクエスト
 * @param {*} condition 検索条件
 */
export function requestGetControlCommandList(showNoneMessage = true) {
    return { type: REQUEST_GET_CONTROL_COMMAND_LIST, showNoneMessage };
}

/**
 * デマンド/発電量制御一覧取得のリクエスト
 * @param {*} condition 検索条件
 */
export function requestGetTriggerControlList(showNoneMessage = true) {
    return { type: REQUEST_GET_TRIGGER_CONTROL_LIST, showNoneMessage };
}

/**
 * 個別制御取得のリクエスト
 * @param {*} controlIds 制御ID
 * @param {*} isRegister 新規かどうか
 */
export function requestGetConrtolCommands(controlIds, isRegister, callback) {
    return { type: REQUEST_GET_CONTROL_COMMANDS, controlIds, isRegister, callback };
}

/**
 * デマンド/発電量制御取得のリクエスト
 * @param {*} controlIds 制御ID
 * @param {*} isRegister 新規かどうか
 */
export function requestGetTriggerConrtols(controlIds, isRegister, callback) {
    return { type: REQUEST_GET_TRIGGER_CONTROLS, controlIds, isRegister, callback };
}

/**
 * 個別制御削除のリクエスト
 * @param {*} controlIds 制御ID一覧
 */
export function requestDeleteConrtolCommands() {
    return { type: REQUEST_DELETE_CONTROL_COMMANDS };
}

/**
 * デマンド/発電量制御削除のリクエスト
 * @param {*} controlIds 制御ID一覧
 */
export function requestDeleteTriggerConrtols() {
    return { type: REQUEST_DELETE_TRIGGER_CONTROLS };
}

/**
 * 制御コマンド実行のリクエスト
 * @param {number} commandId 対象コマンドID
 */
export function requestExecuteCommand(commandId) {
    return { type: REQUEST_EXECUTE_COMMAND, commandId };
}

/**
 * 制御コマンド停止のリクエスト
 * @param {number} commandId 対象コマンドID
 */
export function requestStopCommand(commandId) {
    return { type: REQUEST_STOP_COMMAND, commandId };
}

/**
 * ロケーションを変更する
 * @param {*} locationId ロケーションID
 * @param {*} targetLocations 配下のロケーション情報
 */
export function requestChnageLocation(location, targetLocations) {
    return { type: REQUEST_CHANGE_LOCATION, location, targetLocations };
}

/**
 * 指定のロケーションの制御コマンド取得のリクエスト
 * @param {array} locationIds ロケーションリスト
 */
export function requestLocationCommands(locations, triggerId) {
    return { type: REQUEST_GET_LOCATION_COMMANDS, locations, triggerId };
}

/**
 * 指定のトリガーのポイント・閾値リスト設定のリクエスト
 * @param {number} triggerId トリガーID
 */
export function requestChangeTriggerType(triggerId, locations, isBulk) {
    return { type: REQUEST_CAHNGE_TRIGGER_TYPE, triggerId, locations, isBulk };
}

/**
 * 指定のポイント変更リクエスト
 * @param {number} triggerId トリガー種別
 * @param {number} pointNo ポイント番号
 */
export function requestChangeTriggerPoint(triggerId, pointNo) {
    return  { type: REQUEST_CAHNGE_TRIGGER_POINT, triggerId, pointNo };
}

/**
 * 制御コマンド保存のリクエスト
 */
export function requestSaveControlCommands() {
    return { type: REQUEST_SAVE_CONTROL_COMMANDS };
}

/**
 * トリガー制御保存のリクエスト
 */
export function requestSaveTriggerControls() {
    return { type: REQUEST_SAVE_TRIGGER_CONTROLS };
}

/**
 * デマンド設定を保存する
 * @param {object} demandSet 保存するデマンド設定情報
 * @param {function} callback コールバック関数
 */
export function requestSaveDemandSet(demandSet, callback) {
    return { type: REQUEST_SAVE_DEMAND_SET, demandSet, callback };
}

//#endregion

/**
 * トリガー種別をセットする
 * @param {*} types 種別一覧
 */
export function setTriggerTypes(types) {
    return { type: SET_TRIGGER_TYPES, types };
}

/**
 * コマンドステータスをセットする
 * @param {*} statuses ステータス一覧
 */
export function setCommandStatuses (statuses) {
    return { type: SET_COMMAND_STATUSES, statuses }
}

/**
 * 検索時の検索条件（制御設定用）を設定する
 * @param {*} condition 検索条件（制御設定用）
 */
export function setControlCondition(condition) {
    return { type: SET_CONTROL_CONDITION, condition };
}

/**
 * 編集中の検索条件（制御設定用）を設定する
 * @param {*} condition 検索条件（制御設定用）
 */
export function setEditControlCondition(condition) {
    return { type: SET_EDIT_CONTROL_CONDITION, condition };
}

/**
 * モードの検索条件（編集用）
 * @param {*} mode モード
 */
export function setModeCondition(mode, statuses) {
    return { type: SET_EDIT_CONDITION_MODE, mode, statuses };
}

/**
 * ステータスの検索条件（編集用）
 * @param {*} statuses ステータス
 */
export function setStatusesCondition(statuses) {
    return { type: SET_EDIT_CONDITION_STATUS, statuses };
}

/**
 * ステータスの検索条件（編集用）をクリアする
 */
export function clearStatusesCondition(statuses) {
    return { type: CLEAR_EDIT_CONDITION_STATUS, statuses };
}

/**
 * 制御コマンド情報（編集用）をセットする
 * @param {*} data 制御コマンド情報
 */
export function setEditControlCommands(data, isRegister = false) {
    return { type: SET_CONTROL_COMMANDS, data, isRegister };
}

/**
 * トリガー制御情報（編集用）をセットする
 * @param {*} data トリガー制御情報
 */
export function setEditTriggerControls(data, controls, isRegister = false) {
    return { type: SET_TRIGGER_CONTROLS, data, controls, isRegister };
}

/**
 * 編集中の制御コマンド情報を変更する
 * @param {string} key 編集するキー
 * @param {object} value 編集データ
 * @param {boolean} isError 入力エラーかどうか
 */
export function changeEditControlCommands(key, value, isError) {
    return { type:CHANGE_CONTROL_COMMANDS, key, value, isError };
}

/**
 * 編集中の制御コマンド情報を一括変更する
 * @param {array} keys 編集するキー
 * @param {object} value 変更後のデータ
 */
export function changeBulkEditControlCommands(keys, value) {
    return { type: CHANGE_BULK_CONTROL_COMMANDS, keys, value };
}

/**
 * 編集中のトリガー制御情報（実行制御一覧以外）を変更する
 * @param {string} key 編集するキー
 * @param {object} value 編集データ
 * @param {boolean} isError 入力エラーかどうか
 */
export function changeEditTriggerControls(key, value, isError) {
    return { type: CHANGE_TRIGGER_CONTROLS, key, value, isError };
}

/**
 * 編集中のトリガー制御の実行制御一覧を変更する
 * @param {object} value 編集データ
 * @param {boolean} isError 入力エラーかどうか
 */
export function changeEditTriggerControlOperations(value, isError) {
    return { type: CHANGE_CONTROL_OPERATIONS, value, isError };
}

/**
 * 一括編集用のデータを変更する（制御コマンド）
 * @param {array} keys 編集するキー
 * @param {object} value 編集データ
 * @param {boolean} isError 入力エラーかどうか
 */
export function changeBulkControlCommand(keys, value, isError) {
    return { type: CHANGE_BULK_CONTROL_COMMAND, keys, value, isError };
}

/**
 * 一括編集用のデータを変更する（トリガー制御）
 * @param {array} keys 編集するキー
 * @param {object} value 編集データ
 * @param {boolean} isError 入力エラーかどうか
 */
export function changeBulkTriggerControl(keys, value, isError) {
    return { type: CHANGE_BULK_TRIGGER_CONTROL, keys, value, isError };
}

/**
 * 編集をクリアする
 */
export function clearEditInfo() {
    return { type:CLEAR_EDIT };
}

/**
 * 実行制御一覧（ロケーションごとの制御一覧）をセットする
 * @param {*} controls 実行制御の選択肢
 * @param {*} locations 実行制御一覧のロケーション選択肢
 */
export function setLocationsCommands(commands, locations) {
    return { type: SET_LOCATION_COMMANDS, commands, locations};
}

/**
 * デマンド設定をセットする
 * @param {*} demandSet デマンド設定
 * @param {*} thresholds 選択中の閾値情報
 */
export function setDemandSet(demandSet, thresholds) {
    return { type: SET_DEMAND_SET, demandSet, thresholds};
}

/**
 * 閾値一覧をセットする
 * @param {*} thresholds 選択中の閾値情報
 */
export function setThresholds(thresholds) {
    return { type: SET_THRESHOLDS, thresholds};
}

/**
 * 削除する制御ID一覧をセットする
 * @param {*} data 制御ID一覧
 */
export function setDeleteControlIds(ids) {
    return { type: SET_DELETE_CONTROLIDS, ids };
}

/**
 * デマンド設定を変更したかどうかのフラグをセットする
 * @param {*} isChanged 変更したかどうか
 */
export function changeIsChangeDemandSet(isChanged) {
    return { type: SET_CHNAGE_DEMANDSET_FLG, isChanged };
}

//#endregion