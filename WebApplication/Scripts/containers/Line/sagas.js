/**
 * @license Copyright 2019 DENSO
 * 
 * LineList画面のsagaを生成する
 * 
 */
'use strict';

import { effects } from "redux-saga";
const { fork, put, take, call, takeEvery, select, all, join } = effects;
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

import { REQUEST_INIT_INFO, REQUEST_GET_LINE_LIST } from './actions.js';
import { REQUEST_GET_PATCHCABLE_FROM, REQUEST_SAVE_PATCHCABLE_FROM } from './actions.js';
import { REQUEST_GET_LINE_FILE_LIST, REQUEST_UPLOAD_LINE_FILE, REQUEST_DELETE_LINE_FILES } from './actions.js';
import { SET_EDIT_PATCHCABLE_FORM } from './actions.js';
import { SET_LINE_FILE_RESULT } from './actions.js';

import { SET_LOOKUP } from 'SearchCondition/actions.js';
import { SET_SEARCH_RESULT, SET_DISPLAY_STATE } from 'SearchResult/actions';
import { SUCCESS_SAVE, SUCCESS_DELETE, SHOW_ERROR_MESSAGE, CHANGE_MODAL_STATE } from 'ModalState/actions';
import { CHANGE_LOAD_STATE } from 'LoadState/actions';
import { SET_WAITING_STATE } from 'WaitState/actions';

import searchConditionSagas, { setCondisitonList } from 'SearchCondition/sagas.js';

import { convertDateTimeExtendedData, convertNumberExtendedData } from 'assetUtility';

/**
 * rootSaga
 */
export default function* rootSaga() {
    yield all([
        ...searchConditionSagas,
        takeEvery(REQUEST_INIT_INFO, initialization),                     //画面初期化
        takeEvery(REQUEST_GET_LINE_LIST, searchLineList),                 //回線一覧取得
        takeEvery(REQUEST_GET_PATCHCABLE_FROM, setEditPatchCableInfo),    //編集用線番情報取得
        takeEvery(REQUEST_SAVE_PATCHCABLE_FROM, savePatchCableForm),      //線番情報保存
        takeEvery(REQUEST_GET_LINE_FILE_LIST, setLineFileList),           //ファイル一覧取得
        takeEvery(REQUEST_UPLOAD_LINE_FILE, uploadLineFile),              //ファイルアップロード
        takeEvery(REQUEST_DELETE_LINE_FILES, deleteLineFiles),            //ファイル削除        
    ])
}

//#region roogSagaから呼び出される関数

/**
 * 初期表示情報取得
 */
function* initialization(action) {
    yield call(setLoadState, true);
    yield call(setInitialInfo, action);
    yield call(setLoadState, false);

}

/**
 * 回線一覧を検索する
 */
function* searchLineList(action) {
    yield call(setLoadState, true);
    const searchCondition = yield select(state => state.searchCondition.conditions);
    var condition = null;
    if (searchCondition) {
        condition = {
            lookUp: {
                lineTypes: searchCondition.lineTypes ? _.cloneDeep(searchCondition.lineTypes) : [],
                locations: searchCondition.locations ? _.cloneDeep(searchCondition.locations) : [],
                patchCableConditionItems: searchCondition.patchCableConditionItems ? _.cloneDeep(searchCondition.patchCableConditionItems) : [],
            },
            idfConnects: searchCondition.idfConnects ? _.cloneDeep(searchCondition.idfConnects) : [],
            inConnects: searchCondition.inConnects ? _.cloneDeep(searchCondition.inConnects) : [],
            relConnects: searchCondition.relConnects ? _.cloneDeep(searchCondition.relConnects) : [],
            lineIds: searchCondition.lineIds ? _.cloneDeep(searchCondition.lineIds) : [],
            lineNames: searchCondition.lineNames ? _.cloneDeep(searchCondition.lineNames) : [],
            userNames: searchCondition.userNames ? _.cloneDeep(searchCondition.userNames) : [],
            projectNos: searchCondition.projectNos ? _.cloneDeep(searchCondition.projectNos) : [],            
            memos: searchCondition.memos ? _.cloneDeep(searchCondition.memos) : [],
            inUseOnly: searchCondition.inUseOnly
        }
    } else {
        condition = { lookUp: null };
    }
    const { functionId, updateConditionList, showNoneMessage } = action;
    yield call(updateLineResultAndConditionList, functionId, updateConditionList, condition, showNoneMessage);
    yield call(setLoadState, false);
}

/**
 * 編集中の線番情報をセットする
 */
function* setEditPatchCableInfo(action) {
    yield call(setLoadState, true);
    const { patchboardId, cableNo, callback } = action;
    yield call(setEditPatchCableForm, patchboardId, cableNo, callback);
    yield call(setLoadState, false);
}

/**
 * 線番情報保存
 */
function* savePatchCableForm() {
    yield call(setWaitingState, true, 'save');
    var editPatchCableFrom = yield select(state => state.editPatchCableFrom);
    editPatchCableFrom = _.cloneDeep(editPatchCableFrom);
    editPatchCableFrom.extendedPages = convertNumberExtendedData(editPatchCableFrom.extendedPages);
    const saveLineInfo = yield call(postSavePatchCableForm, editPatchCableFrom);
    if (saveLineInfo.isSuccessful) {
        const searchCondition = yield select(state => state.searchCondition);
        yield searchCondition && searchCondition.conditions && fork(searchLineList, { showNoneMessage: true }); //回線一覧の再表示
        yield put({ type: SUCCESS_SAVE, targetName:'線番', okOperation:'transition' });
    } else {
        yield yield call(setErrorMessage, saveLineInfo.errorMessage);
    }
    yield call(setWaitingState, false, null);  
}

/**
 * ファイル一覧をセットする
 */
function* setLineFileList(action) {    
    yield call(setLoadState, true);
    const { patchboardId, cableNo } = action;
    const lineFileInfo = yield call(getPatchCableFileList, patchboardId, cableNo);
    if (lineFileInfo.isSuccessful) {
        yield put ({ type: SET_LINE_FILE_RESULT, data: lineFileInfo.data });
    } else {
        yield call(setErrorMessage, lineFileInfo.errorMessage);
    }
    yield call(setLoadState, false);

}

/**
 * ファイルをアップロードする
 */
function* uploadLineFile(action) {
    yield call(setWaitingState, true, 'save');
    const { patchCableParameters, fileName, dataString, overwrite } = action;
    const lineFileInfo = yield call(uploadPatchCableFile, patchCableParameters, fileName, dataString, overwrite);
    if (lineFileInfo.isSuccessful) {
        yield put({ type: SUCCESS_SAVE, targetName: '線番ファイル', okOperation:'hideUploadModal' });

        const fileModalInfo = yield select(state => state.fileModalInfo);
        if (fileModalInfo.show) {
            yield fork(setLineFileList, { patchboardId: patchCableParameters[0].patchboardId, cableNo: patchCableParameters[0].cableNo });         //ファイル一覧再表示
        } else {
            let displayState = yield select(state => state.searchResult.displayState);
            displayState.checkedIndexes = [];       //チェックをOFFにする
            yield put({ type: SET_DISPLAY_STATE, value: displayState });
        }
    } else {
        yield yield call(setErrorMessage, lineFileInfo.errorMessage);
    }
    yield call(setWaitingState, false, null);
}


/**
 * ファイルを削除する
 */
function* deleteLineFiles(action) {
    yield call(setWaitingState, true, 'delete');
    const { patchboardId, cableNo, fileNos } = action;
    const lineFileInfo = yield call(deletePatchCableFiles, patchboardId, cableNo, fileNos);
    if (lineFileInfo.isSuccessful) {
        yield put({ type: SUCCESS_DELETE, targetName: '線番ファイル' });
        yield fork(setLineFileList, { patchboardId, cableNo });         //ファイル一覧再表示
    } else {
        yield yield call(setErrorMessage, lineFileInfo.errorMessage);
    }
    yield call(setWaitingState, false, null);
}

//#endregion


//#region データ取得＆セット

/**
 * LookUpをセットする
 */
function* setLookUp() {
    const lookUpInfo = yield call(getLookUp);
    if (lookUpInfo.isSuccessful) {
        yield put ({ type: SET_LOOKUP, value: lookUpInfo.data });
    } else {
        yield call(setErrorMessage, lookUpInfo.errorMessage);
    }
}


/**
 * 回線一覧をセットする
 * @param {object} condition 検索条件(lookUp/inConnects/idfConnects/idfConnects/relConnects/lineIds/lineNames/userNames/projectNos/memos/inUseOnly)
 */
function* setLineResult(condition, showNoneMessage) {
    const lineInfo = yield call(getLineList, condition);
    if (lineInfo.isSuccessful) {
        yield put ({ type: SET_SEARCH_RESULT, value: lineInfo.data });
        if (showNoneMessage && lineInfo.data.rows.length <= 0) {
            yield put({ type: CHANGE_MODAL_STATE, data: { show: true, title: '検索', message:'検索条件に該当する回線がありません。', bsSize: 'sm', buttonStyle: 'message' }});
        }
    } else {
        yield call(setErrorMessage, lineInfo.errorMessage);
    }
}

/**
 * 編集中の線番情報をセットする
 * @param {number} projectId 案件ID
 * @param {function} callback コールバック関数
 */
function* setEditPatchCableForm(patchboardId, cableNo, callback) {
    const lineInfo = yield call(getPatchCableForm, patchboardId, cableNo);
    if (lineInfo.isSuccessful) {
        const { data } = lineInfo;
        data.extendedPages = data.extendedPages && convertDateTimeExtendedData(data.extendedPages);
        yield put({ type: SET_EDIT_PATCHCABLE_FORM, data: data });
        callback && callback();
    } else {
        yield call(setErrorMessage, lineInfo.errorMessage);
    }
}

//#endregion

//#region その他関数

/**
 * 初期情報取得
 */
function* setInitialInfo(action) {
    yield fork(setLookUp);
    yield fork(setCondisitonList, action);
}

/**
 * 回線一覧と検索条件一覧を更新する
 * @param {number} functionId 機能番号
 * @param {boolean} updateConditionList 検索条件一覧を更新するか
 * @param {boolean} showNoneMessage 0件メッセージを表示するか
 */
function* updateLineResultAndConditionList(functionId, updateConditionList, condition, showNoneMessage) {
    yield fork(setLineResult, condition, showNoneMessage);
    yield updateConditionList && fork(setCondisitonList, { functionId });
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

//#endregion

//#region API呼び出し

/**
 * 初期情報を取得する
 */
function getLookUp() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, '/api/line', null, (data, networkError) => {
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
 * 回線一覧を取得する
 * @param {object} condition 検索条件(lookUp/inConnects/idfConnects/idfConnects/relConnects/lineIds/lineNames/userNames/projectNos/memos/inUseOnly)
 */
function getLineList(condition) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/line/getLineResult', condition, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data});
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "回線一覧取得に失敗しました。" });
            }
        });
    });    
}


/**
 * 回線情報取得
 * @param {number} patchboardId 配線盤ID
 * @param {number} cableNo 線番
 */
function getPatchCableForm(patchboardId, cableNo) {
    const parameter = { patchboardId, cableNo };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/line/getPatchCableForm', parameter, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data});
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "回線情報取得に失敗しました。" });
            }
        });
    });  
}

/**
 * 回線保存
 * @param {object} patchCableForm 回線情報
 */
function postSavePatchCableForm(patchCableForm) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/line/setPatchCableForm', patchCableForm, (result, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (result) {
                if (result.isSuccess) {
                    resolve({ isSuccessful: true, message: result.messag });
                } else {
                    resolve({ isSuccessful: false, errorMessage: result.message });
                }
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "回線情報保存に失敗しました。" });
            }
        });
    });
}

/**
 * ファイル一覧取得
 * @param {number} patchboardId 配線盤ID
 * @param {number} cableNo 線番
 */
function getPatchCableFileList(patchboardId, cableNo) {
    const parameter = { patchboardId, cableNo };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/line/getPatchCableFileList', parameter, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "ファイル一覧取得に失敗しました。" });
            }
        });
    });
}

/**
 * ファイルをアップロードする
 * @param {array} patchCableDataList 線番情報リスト(patchboardId, cableNoのみ)
 * @param {string} fileName ファイル名
 * @param {string} dataString データ文字列
 * @param {boolean} overwrite 上書きするか
 */
function uploadPatchCableFile(patchCableDataList, fileName, dataString, overwrite) {
    const parameter = {
        patchCableDataList,
        fileName,
        dataString,
        overwrite
    };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/line/uploadPatchCableFile', parameter, (result, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (result) {
                if (result.isSuccess) {
                    resolve({ isSuccessful: true, message: result.messag });
                } else {
                    resolve({ isSuccessful: false, errorMessage: result.message });
                }
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "ファイルアップロードに失敗しました。" });
            }
        });
    });
}

/**
 * ファイルを削除する
 * @param {number} patchboardId 配線盤ID
 * @param {number} cableNo 線番
 * @param {array} fileNos ファイル番号リスト
 */
function deletePatchCableFiles(patchboardId, cableNo, fileNos) {
    const parameter = {
        patchCableData: { patchboardId, cableNo },
        fileNos
    };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/line/deletePatchCableFiles', parameter, (result, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (result) {
                if (result.isSuccess) {
                    resolve({ isSuccessful: true, message: result.messag });
                } else {
                    resolve({ isSuccessful: false, errorMessage: result.message });
                }
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "ファイル削除に失敗しました。" });
            }
        });
    });
}

//#endregion