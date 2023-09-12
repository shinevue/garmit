/**
 * @license Copyright 2017 DENSO
 * 
 * RackMaintenance画面のsagaを生成する
 * 
 */
'use strict';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
const { fork, put, take, call, takeEvery, select, all, join } = effects;
import {  effects } from "redux-saga";

import { TYPE, DATETIME_INIT_FORMAT, DATE_OPTIONS, TIME_OPTIONS, COLUMN_INDEX } from 'extendedDataUtility';
import { validatePangeName, validateItemName, validateRealFormat, validateSelectForms, validateSelectForm, validateDataFormat, validateNoticeDays } from 'extendedDataUtility';
import { createRowInfo, getEmptySelectForm, getRowClassName, getInitialOption, invisibleAlarmState, convertEditingData } from 'extendedDataUtility';
import { showErrorModalInfo } from 'messageModalUtility';
import { LAVEL_TYPE } from 'authentication';

//定数定義
const COMPACT_TIME_OPTIONS = _.tail(TIME_OPTIONS);
const DATETIME_FORMAT_OPTIONS = _.map(DATE_OPTIONS, 'name').concat(_.map(COMPACT_TIME_OPTIONS, 'name'));  //時刻指定なしを削除した日付時刻選択肢
const URL_FOR_GET = {
    rack: 'getRack',
    unit: 'getUnit',
    consumer: 'getConsumer',
    project: 'getProject',
    line: 'getLine',
    patchboard: 'getPatchboard'
};
const URL_FOR_SAVE = {
    rack: 'saveRack',
    unit: 'saveUnit',
    consumer: 'saveConsumer',
    project: 'saveProject',
    line: 'saveLine',
    patchboard: 'savePatchboard'
};
const EXTENDED_DATA_KEY = {
    rack: 'rackExtendedData',
    unit: 'unitExtendedData',
    consumer: 'consumerExtendedData',
    project: 'projectExtendedData',
    line: 'lineExtendedData',
    patchboard: 'patchboardExtendedData'
};

/**
 * rootSaga
 */
export default function* rootSaga() {
    yield takeEvery("REQUEST_INITIAL_INFO", setInitialInfo);      //初期値を取得する
    yield takeEvery("REQUEST_SELECT_PAGE", setEditPage);          //編集対象ページ初期値を取得する
    yield takeEvery("EDIT_PAGENAME", changePageName);             //ページ名称変更
    yield takeEvery("EDIT_TYPE", changeType);                     //種別変更
    yield takeEvery("EDIT_ORDER", changeOrder);                   //管理項目並び順変更
    yield takeEvery("EDIT_ITEM", editItem);                       //管理項目個別変更
    yield takeEvery("CHANGE_ALL_STATE", changeAllCheckState);     //管理項目一括変更（有効チェック、検索対象チェック）
    yield takeEvery("REQUEST_SAVE", saveEditing);                 //編集中ページ情報を保存する
}

//#region rootSagaから呼び出される関数
/**
 * 初期値設定
 */
function* setInitialInfo(action) {
    yield put({ type: "CHANGE_LOAD_STATE", isLoading: true });

    //非同期で初期値を取得する
    const taskPageList = yield fork(setPageList, action.data);
    const taskUnitTypes = yield fork(setUnitTyeps, action.data);

    //各タスクの終了を待つ
    yield join(taskPageList);
    yield join(taskUnitTypes);

    yield put({ type: "CHANGE_LOAD_STATE", isLoading: false });
}

/**
 * 編集対象ページ初期値設定
 */
function* setEditPage(action) {
    //日付型かつフォーマットが正しく指定されいない場合はフォーマットにデフォルト値を設定する
    let initPageInfo = getInitPageInfo(action.data);
    yield put({ type: "SET_EDIT_PAGE", data: initPageInfo });

    //コンポーネント表示用編集ページ情報を設定する
    const unitTypes = yield select(state => state.unitTypes);
    const isReadOnly = yield select(state => state.authentication.isReadOnly);
    const level = yield select(state => state.authentication.level);
    const processedData = processPageInfo(initPageInfo, unitTypes, isReadOnly || level >= LAVEL_TYPE.operator);
    yield put({ type: "PROCESS_ITEM_INFO", value: processedData });

    //検証結果を変更する
    const validationState = getValidationInfo(processedData);
    yield put({ type: "CHANGE_VALIDATION", value: validationState });       
}

/**
 * ページ名称編集
 */
function* changePageName(action) {
    //変更後のデータ作成
    const update = { value: action.value, validationState: validatePangeName(action.value) };
    //データ保存
    yield put({ type: "CHANGE_PAGENAME", value: update });
    yield put({ type: "VALIDATE_PAGENAME", value: update.validationState.state === "success" });
}

/**
 * 種別編集
 */
function* changeType(action) {
    //データ保存
    yield put({ type: "CHANGE_TYPE", value: action.value });
}

/**
 * 管理項目並べ替え
 */
function* changeOrder(action) {
    //並べ替え前の加工済みデータの管理項目情報取得
    const extendedItems = yield select(state => state.rackUnitMaintenance.processedEditPage.extendedItems);
    //変更後のデータ作成
    let update = _.cloneDeep(extendedItems);
    action.value.forEach((id, index) => {
        const target = _.findIndex(update, { 'itemId': id });
        if (target >= 0) {
            update[target].position = index + 1;
            update[target].columnInfo[COLUMN_INDEX.enableCheck].children = "(" + (index + 1) + ")";   //有効カラム表示も変更
        }
    });
    //ポジションでソートしてデータ保存
    yield put({ type: "CHANGE_ITEMS", value: _.sortBy(update, 'position') });    
}

/**
 * 管理項目個別編集
 */
function* editItem(action) {   
    //変更対象の管理項目情報取得
    const { itemId, valueObj } = action;
    const extendedItems = yield select(state => state.rackUnitMaintenance.processedEditPage.extendedItems);
    const targetItem = _.find(extendedItems, { 'itemId': itemId });

    //変更後の管理項目情報作成
    const changed = makeChangedItem(targetItem, valueObj);

    //管理項目情報変更
    yield put({ type: "CHANGE_ITEM", value: changed });
    if (_.keys(action.valueObj)[0] === "enable" | _.keys(action.valueObj)[0] === "isSearchable" | _.keys(action.valueObj)[0] === "isSysAdmin") {
        yield put({ type: "CHANGE_HEADER_CHECK" }); //ヘッダーのチェック状態更新（有効、検索対象)
    }

    //入力チェック
    yield put({ type: "CHANGE_LIST", itemId: action.itemId, value: getItemRowValidation(changed.columnInfo) });
}

/**
 * 全行のチェック状態変更（有効、検索対象）
 */
function* changeAllCheckState(action) {
    //並べ替え前の加工済みデータの管理項目情報取得
    const extendedItems = yield select(state => state.rackUnitMaintenance.processedEditPage.extendedItems);
    //変更後のデータ作成
    let update = _.cloneDeep(extendedItems);
    if (action.changeType === "enable") {
        _.map(update, (value) => { return changeEnabelState(value, action.value); });
    }
    else if (action.changeType === "isSearchable") {
        _.map(update, (value) => {
            if (!value.columnInfo[COLUMN_INDEX.searchableCheck].disabled) { //操作不可の場合は変更しない
                value.columnInfo[COLUMN_INDEX.searchableCheck].checked = action.value;
            }
            return value;
        });
    } else if (action.changeType === "isSysAdmin") {
        _.map(update, (value) => {
            if (!value.columnInfo[COLUMN_INDEX.isSysAdmin].disabled) {  //操作不可の場合は変更しない
                value.columnInfo[COLUMN_INDEX.isSysAdmin].checked = action.value;
            }
        });
    }
    //データ保存
    yield put({ type: "CHANGE_ITEMS", value: update });
    yield put({ type: "CHANGE_HEADER_CHECK" }); //ヘッダーのチェック状態更新（有効、検索対象)
}

/**
 * 編集中ページ情報を保存する
 */
function* saveEditing(action) {
    const type = action.data;
    yield put({ type: "CHANGE_LOAD_STATE", isLoading: true });

    //編集情報をコンポーネント表示用から変換して保存する
    const processedEditPage = yield select(state => state.rackUnitMaintenance.processedEditPage);
    const editPage = yield select(state => state.rackUnitMaintenance.editPage);
    const postData = convertEditingData(editPage, processedEditPage);
    yield put({ type: "SET_EDIT_PAGE", data: postData });
    const result = yield call(saveData, type, postData);

    if (result.isSuccess) {
        yield put({ type: "SUCCESS_SAVE", targetName: "ページ設定" });
        //ページ一覧情報更新
        yield call(setPageList, type);
        const extendedData = yield select(state => state.rackUnitMaintenance.extendedData);
        yield put({ type: "REQUEST_SELECT_PAGE", data: _.find(extendedData, { "pageNo": editPage.pageNo }) });
    }
    else {
        yield put({ type: "SHOW_ERROR_MESSAGE", message: result.errorMessage });
    }

    yield put({ type: "CHANGE_LOAD_STATE", isLoading: false });
}

//#endregion

//#region API
/**
 * ページ一覧情報取得
 */
function getPageList(type) {
    const url = '/api/extendedData/' + URL_FOR_GET[type];
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, url, null, (data, networkError) => {
            if (!networkError) {
                if (data) {
                    resolve({ isSuccess: true, data: data[EXTENDED_DATA_KEY[type]] });
	            } else {
                    resolve({ isSuccess: false, errorMessage: "ページ一覧情報の取得に失敗しました。" });
                }
            } else {
                resolve({ isSuccess: false, errorMessage: NETWORKERROR_MESSAGE });
            }
        });
    });
}

/**
 * ユニット種別の選択肢情報取得
 */
function getUnitTypes() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, '/api/extendedData', null, (data, networkError) => {
            if (!networkError) {
                if (data) {
                    resolve({ isSuccess: true, data: data.unitTypes });
                }
                else {
                    resolve({ isSuccess: false, errorMessage: "ユニット種別情報の取得に失敗しました。" });
                }
            } else {
                resolve({ isSuccess: false, errorMessage: NETWORKERROR_MESSAGE });
            }
        });
    });
}

/**
 * 編集内容保存
 */
function saveData(type, postData) {
    const url = '/api/extendedData/' + URL_FOR_SAVE[type];
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, url, postData, (data, networkError) => {
            if (!networkError) {
                if (data) {
                    resolve({ isSuccess: true });
                }
                else {
                    resolve({ isSuccess: false, errorMessage: "ページ設定の保存に失敗しました。" });
                }
            } else {
                resolve({ isSuccess: false, errorMessage: NETWORKERROR_MESSAGE });
            }

        });
    });
}
//#endregion

//#region その他関数

/**
 * ページ一覧設定
 */
function* setPageList(type) {
    const pageResult = yield call(getPageList, type);
    if (pageResult.isSuccess) {
        yield put({ type: "SET_EXTENDED_DATA", value: pageResult.data });
    }
    else {
        yield put({ type: "CHANGE_MODAL_STATE", data: showErrorModalInfo(pageResult.errorMessage) });
    }
}

/**
 * ユニット種別の選択肢一覧設定
 */
function* setUnitTyeps(type) {
    if (type === 'unit') {
        const unitTypeResult = yield call(getUnitTypes);
        if (unitTypeResult.isSuccess) {
            yield put({ type: "SET_UNIT_TYPES", value: unitTypeResult.data });
        }
        else {
            yield put({ type: "CHANGE_MODAL_STATE", data: showErrorModalInfo(unitTypeResult.errorMessage) });
        }
    }
}

/**
 * 編集ページの初期値を取得する
 */
function getInitPageInfo(selectPageInfo) {
    let initPageInfo = _.cloneDeep(selectPageInfo);
    initPageInfo.extendedItems.map((item) => {
        if (item.type === TYPE.dateTime) {  //日付型かつフォーマットが正しく指定されいない場合はフォーマットにデフォルト値を設定する
            let isContainFormat = false;
            if (item.format) {
                isContainFormat = DATETIME_FORMAT_OPTIONS.some((o) => {
                    return item.format.indexOf(o) !== -1;
                });
            }
            if (!isContainFormat) { //フォーマットが選択肢のいずれにも一致しない以下フォーマットがnullの場合
                item.format = DATETIME_INIT_FORMAT;
            }
        }
    });
    return initPageInfo;
}

/**
 * 取得した管理項目情報をコンポーネント表示用に成形する
 */
function processPageInfo(rawData, unitTypes, isReadOnly) {
    const enableItems = _.filter(rawData.extendedItems, { 'enable': true });    //有効状態の行のみに絞る
    let processed = {
        pageInfo: {
            pageNo: rawData.pageNo,
            pageName: {
                value: rawData.name,
                validationState: validatePangeName(rawData.name)
            },
            unitTypes: {
                options: unitTypes,
                selected: rawData.unitTypes
            }
        },
        extendedItems: createRowInfo(rawData.extendedItems, isReadOnly),
        isAllEnable: _.every(rawData.extendedItems, 'enable'),
        isAllSearchable: enableItems.length > 0 && _.every(enableItems, 'isSearchable'),
        isAllSysAdmin: enableItems.length > 0 && _.every(enableItems, 'isSysAdmin'),
        isReadOnly: isReadOnly
    };
    return processed;
}

/**
 * 各コンポーネントの検証結果を集計する
 */
function getValidationInfo(processedData) {
    const pageName = processedData.pageInfo.pageName.validationState.state === "success";
    const itemRows = processedData.extendedItems.map((rowInfo) => {
        return getItemRowValidation(rowInfo.columnInfo);
    });
    const canSave = pageName && _.every(itemRows, 'canSave');
    return { canSave: canSave, detail: { pageName: pageName, itemRows: itemRows } };
}

/**
 * 管理項目行の検証結果を取得する
 */
function getItemRowValidation(columnInfo) {
    const itemName = columnInfo[COLUMN_INDEX.itemName].validationState.state;
    let dataFormat;
    if (_.get(columnInfo, [COLUMN_INDEX.dataType, "type"]) === TYPE.real
        ||_.get(columnInfo, [COLUMN_INDEX.dataType, "type"]) === TYPE.select) {
        dataFormat = columnInfo[COLUMN_INDEX.dataFormat].option.validationState.state;
    }
    else {
        dataFormat = "success";
    }
    let alarmState;
    if (columnInfo[COLUMN_INDEX.alarmState].visible) {
        alarmState = columnInfo[COLUMN_INDEX.alarmState].validationState.state;
    }
    else {
        alarmState = "success";
    }
    let canSave = false;
    if (itemName === "success" && dataFormat === "success" && alarmState === "success") {
        canSave = true;
    }
    return { itemId: columnInfo[0].itemId, canSave: canSave, detail: { itemName: itemName, dataFormat: dataFormat, alarmState: alarmState } };
}

/**
 * 管理項目を有効状態を変更する
 */
function changeEnabelState(item, enable) {
    item.rowClassName = getRowClassName(enable); //行の背景色クラス名称変更
    item.columnInfo[COLUMN_INDEX.enableCheck].checked = enable;   //有効チェックを変更
    if (!enable) {  //無効の場合
        item.columnInfo[COLUMN_INDEX.searchableCheck].checked = false;   //検索対象チェックも外す
    }

    _.map(item.columnInfo, (column) => {
        if (column.index > 0) {
            column.disabled = !enable;  //有効チェック以外の無効状態変更
        }
        return column;
    });
    return item;
}

/**
 *データ型を変更する
 */
function changeDataType(updateItem, type) {
    //不要な値を削除
    const beforeType = updateItem.columnInfo[COLUMN_INDEX.dataType].type;    //変更前のデータ型
    if (beforeType === TYPE.real || beforeType === TYPE.dateTime || beforeType === TYPE.select) {
        updateItem = clearExtendedItemInfo(updateItem, beforeType);  //不要な値をクリアする
    }

    //各カラムのタイプを変更する
    updateItem.columnInfo[COLUMN_INDEX.dataType].type = type;
    updateItem.columnInfo[COLUMN_INDEX.dataType].validationState = { state: "warning", helpText: "データ型が変更されています。" }
    updateItem.columnInfo[COLUMN_INDEX.dataFormat].type = type;
    updateItem.columnInfo[COLUMN_INDEX.alarmState].type = type;

    //初期値を設定
    if (type === TYPE.dateTime || type === TYPE.real || type === TYPE.select) {
        updateItem = getInitialExtendedItemInfo(updateItem, type);
    }

    return updateItem;
}

/**
* データ型変更に伴い不要となる値をクリアする
* @param {bool} updateItem 編集する情報
* @param {number} beforeType 変更前のデータ型
*/
function clearExtendedItemInfo(updateItem, beforeType) {
    if (beforeType === TYPE.real || beforeType === TYPE.dateTime || beforeType === TYPE.choices) {
        updateItem.columnInfo[COLUMN_INDEX.dataFormat].option = null;
        if (beforeType === TYPE.dateTime) {    //日付時刻から変更された場合
            //アラーム状態クリア
            updateItem.columnInfo[COLUMN_INDEX.alarmState] = invisibleAlarmState(updateItem.columnInfo[COLUMN_INDEX.alarmState]);
        }
    }

    return updateItem;
}

/**
* データ型変更に伴い不要となる値をクリアする
* @param {bool} updateItem 編集する情報
* @param {number} type 変更後のデータ型
*/
function getInitialExtendedItemInfo(updateItem, type) {
    updateItem.columnInfo[COLUMN_INDEX.dataFormat].option = getInitialOption(updateItem.itemId, type);
    if (type === TYPE.dateTime) {   //日付時刻型に変更された場合
        updateItem.columnInfo[COLUMN_INDEX.alarmState].visible = true;
    }
    else if (type === TYPE.real) {
    }
    else {    //選択肢型に変更された場合
        updateItem.columnInfo[COLUMN_INDEX.dataFormat].option = { choices: [getEmptySelectForm(updateItem.itemId)] };
    }
    updateItem.columnInfo[COLUMN_INDEX.dataFormat].option.validationState = validateDataFormat(type, updateItem.columnInfo[COLUMN_INDEX.dataFormat].option.choices, updateItem.columnInfo[COLUMN_INDEX.dataFormat].option.format);
    return updateItem;
}

/**
* データ型変更に伴い不要となる値をクリアする
* @param {object} before 編集対象管理項目情報
* @param {object} valueObj 変更内容
*/
function makeChangedItem(before, valueObj) {
    let changed = _.cloneDeep(before);
    switch (_.keys(valueObj)[0]) {
        case "enable":
            changed = changeEnabelState(changed, valueObj.enable);
            break;
        case "isSearchable":
            changed.columnInfo[COLUMN_INDEX.searchableCheck].checked = valueObj.isSearchable;
            break;
        case "name":
            changed.columnInfo[COLUMN_INDEX.itemName].value = valueObj.name;
            changed.columnInfo[COLUMN_INDEX.itemName].validationState = validateItemName(valueObj.name);
            break;
        case "type":
            changed = changeDataType(changed, valueObj.type);
            break;
        case "realFormat":  //実数フォーマット変更
            changed.columnInfo[COLUMN_INDEX.dataFormat].option = { format: valueObj.realFormat, validationState: validateRealFormat(valueObj.realFormat) };
            break;
        case "dateTimeFormat":  //日付時刻フォーマット変更
        {
            let dateTimeOption = Object.assign({}, changed.columnInfo[COLUMN_INDEX.dataFormat].option, valueObj.dateTimeFormat);
            if (_.get(valueObj.dateTimeFormat, "checked", null) === true) {
                dateTimeOption.dateFormatValue = -1;    //未選択に変更
                //指定なし選択時はデフォルト値に変更
                if (dateTimeOption.timeFormatValue.toString() === "-1") {
                    dateTimeOption.timeFormatValue = 1;
                }
                //監視状態非表示
                changed.columnInfo[COLUMN_INDEX.alarmState] = invisibleAlarmState(changed.columnInfo[COLUMN_INDEX.alarmState]);
            }
            else if (_.get(valueObj.dateTimeFormat, "checked", null) === false) {
                dateTimeOption.dateFormatValue = 1; //デフォルト値設定
                //監視状態表示
                changed.columnInfo[COLUMN_INDEX.alarmState].visible = true;
            }
            changed.columnInfo[COLUMN_INDEX.dataFormat].option = dateTimeOption;
            break;
        }
        case "choices":
        {
            let choices = _.cloneDeep(valueObj.choices);
            choices.map((choice, i) => {
                choice.validationState = validateSelectForm(choice.choiceName); //各選択肢の入力チェック
            });
            changed.columnInfo[COLUMN_INDEX.dataFormat].option = { choices, validationState: validateSelectForms(choices) };
            break;
        }
        case "alarmState":
        {
            let alarmState = Object.assign({}, changed.columnInfo[COLUMN_INDEX.alarmState], valueObj.alarmState);
            if (_.keys(valueObj.alarmState)[0] === "noticeDays") {
                alarmState.validationState = validateNoticeDays(true, valueObj.alarmState.noticeDays);  //日数変更時
            }
            else if (_.get(valueObj.alarmState, "alarm", null)) {    //監視するチェック時
                alarmState.noticeDays = null;
                alarmState.validationState = validateNoticeDays(true, null);
            }
            else { //監視するチェック解除時
                alarmState.noticeDays = null;
                alarmState.validationState = validateNoticeDays(false, null);
            }
            changed.columnInfo[COLUMN_INDEX.alarmState] = alarmState;
            break;
        }
        case "isSysAdmin":
            changed.columnInfo[COLUMN_INDEX.isSysAdmin].checked = valueObj.isSysAdmin;
            break;
        default: break;
    }
    return changed;
}
//#endregion



