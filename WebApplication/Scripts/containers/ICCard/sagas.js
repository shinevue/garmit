/**
 * @license Copyright 2021 DENSO
 * 
 * ICカード画面のsagaを生成する
 * 
 */
'use strict';

import { effects } from "redux-saga";
const { fork, put, take, call, takeEvery, select, join } = effects;
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

import { REQUEST_INIT_INFO, REQUEST_SEARCH_ICCARD_LIST } from './actions.js';
import { REQUEST_GET_ICCARD, REQUEST_GET_ICCARDS } from './actions.js';
import { REQUEST_SAVE_ICCARD, REQUEST_SAVE_ICCARDS } from './actions.js';
import { REQUEST_DELETE_ICCARDS, REQUEST_CHANGE_ENTERPRISE } from './actions.js';
import { SET_EDIT_ICCARD } from './actions.js';
import { SET_EDIT_ICCARDS } from './actions.js';
import { SET_DELETE_ICCARD_NOS } from './actions.js';
import { SET_LOGINUSER_ERACK_LOCATIONS, SET_ERACK_LOCATIONS, SET_LOGIN_USERS } from './actions.js';

import { SET_LOOKUP } from 'SearchCondition/actions.js';
import { SET_SEARCH_RESULT } from 'SearchResult/actions';
import { SUCCESS_SAVE, SUCCESS_DELETE, SHOW_ERROR_MESSAGE, CHANGE_MODAL_STATE } from 'ModalState/actions';
import { CHANGE_LOAD_STATE } from 'LoadState/actions';
import { SET_WAITING_STATE } from 'WaitState/actions';

import { setICCardType } from 'SearchCondition/sagas.js';

import { getEmptyICCard, gatChangedBulkData, omitSaveICCard, VALID_DATE_FORMAT, hasEnterprise } from 'iccardUtility';
import { convertJsonDateToMoment } from 'datetimeUtility';


/**
 * rootSaga
 */
export default function* rootSaga() {
    yield takeEvery(REQUEST_INIT_INFO, initialization);                 //初期情報取得
    yield takeEvery(REQUEST_SEARCH_ICCARD_LIST, searchICCardList);      //ICカード一覧検索
    yield takeEvery(REQUEST_GET_ICCARD, setEditICCardInfo);             //編集用ICカード情報取得
    yield takeEvery(REQUEST_GET_ICCARDS, setEditICCards);               //編集用ICカード情報取得（複数）
    yield takeEvery(REQUEST_SAVE_ICCARD, saveICCard);                   //ICカード保存
    yield takeEvery(REQUEST_SAVE_ICCARDS, saveICCards);                 //ICカード一括保存（複数）
    yield takeEvery(REQUEST_DELETE_ICCARDS, deleteICCards);             //ICカード削除
    yield takeEvery(REQUEST_CHANGE_ENTERPRISE, changeEnterprise);       //所属変更
}

//#region roogSagaから呼び出される関数

/**
 * 初期化
 */
function* initialization(action) {
    yield call(setLoadState, true);
    yield call(setInitialInfo);
    yield call(setLoadState, false);
}

/**
 * ICカード一覧検索 
 */
function* searchICCardList(action) {
    yield call(setLoadState, true);
    const searchCondition = yield select(state => state.searchCondition.conditions);
    const icCardCondition = yield select(state => state.icCardSearchCondition.conditions);
    var condition;
    if (searchCondition) {
        condition = {
            lookUp: {
                locations: searchCondition.locations ? _.cloneDeep(searchCondition.locations) : [],
                enterprises: searchCondition.enterprises ? _.cloneDeep(searchCondition.enterprises) : [],
                loginUsers: searchCondition.loginUsers ? _.cloneDeep(searchCondition.loginUsers) : [],
            },
            icCardCondition: {
                cardIds: searchCondition.cardIds ? _.cloneDeep(searchCondition.cardIds) : [],
                cardNames: searchCondition.cardNames ? _.cloneDeep(searchCondition.cardNames) : [],
                enterpriseNames: searchCondition.enterpriseNames ? _.cloneDeep(searchCondition.enterpriseNames) : [],
                userNames: searchCondition.userNames ? _.cloneDeep(searchCondition.userNames) : [],
                userKanas: searchCondition.userKanas ? _.cloneDeep(searchCondition.userKanas) : [],
                isAdmin: icCardCondition.isAdmin,
                isNonAdmin: icCardCondition.isNonAdmin,
                isValid: icCardCondition.isValid,
                isInvalid: icCardCondition.isInvalid
            }
        }
    } else {
        condition = { lookUp: null, icCardCondition: null };
    }

    if (icCardCondition.dateSpecified) {
        condition.lookUp.startDate = icCardCondition.dateFrom.format('YYYY-MM-DD') + ' 00:00:00';
        condition.lookUp.endDate = icCardCondition.dateTo.format('YYYY-MM-DD') + ' 23:59:59';
    }

    yield call(setICCardResult, condition, action.showNoneMessage);
    yield call(setLoadState, false);
}

/**
 * 編集用ICカード情報（マスタ情報含む）をセットする
 */
function* setEditICCardInfo(action) {
    yield call(setLoadState, true);
    const { cardNo, callback, isRegister } = action;
    yield call (setLoginUserERackLocations);
    if (isRegister) {
        yield call(setNewICCard, callback);
    } else {
        yield call(setEdiICCard, cardNo, callback);
    }
    yield call(setLoadState, false);
}

/**
 * 編集用ICカード情報（一括編集用）をセットする
 */
function* setEditICCards(action) {    
    yield call(setLoadState, true);
    const { cardNos, callback } = action;
    const icCardInfo = yield call(getIcCards, cardNos);
    if (icCardInfo.isSuccessful) {
        yield put({ type: SET_EDIT_ICCARDS, data: icCardInfo.data });
        callback && callback();
    } else {
        yield call(setErrorMessage, icCardInfo.errorMessage);
    }
    yield call(setLoadState, false);  
}

/**
 * ICカードを保存する
 */
 function* saveICCard() {
    yield call(setWaitingState, true, 'save');
    const icCard = yield select(state => state.editICCard);
    const saveICCardInfo = yield call(postSaveIcCard, omitSaveICCard(icCard));
    if (saveICCardInfo.isSuccessful) {
        const searchCondition = yield select(state => state.searchCondition);        
        yield searchCondition && searchCondition.conditions && fork(searchICCardList, { showNoneMessage: true });   //ICカード一覧を再表示する
        yield put({ type: SUCCESS_SAVE, targetName: "ICカード情報", okOperation:"transition" });
    } else {
        yield call(setErrorMessage, saveICCardInfo.errorMessage);
    }
    yield call(setWaitingState, false, null);
}

/**
 * ICカードを一括保存する（複数）
 */
function* saveICCards() {    
    yield call(setWaitingState, true, 'save');
    const beforeICCards = yield select(state => state.editICCards);    
    const editBulkKeys = yield select(state => state.editBulkKeys);
    const bulkICCard = yield select(state => state.bulkICCard);
    const targets = gatChangedBulkData(beforeICCards, editBulkKeys, bulkICCard);
    const saveICCardInfo = yield call(postSaveIcCards, targets);
    if (saveICCardInfo.isSuccessful) {
        yield fork(searchICCardList, { showNoneMessage: true });            //ICカード一覧を再表示する
        yield put({ type: SUCCESS_SAVE, targetName: "ICカード情報", okOperation:"transition" });
    } else {
        yield call(setErrorMessage, saveICCardInfo.errorMessage);
    }
    yield call(setWaitingState, false, null);
}

/**
 * ICカードを削除する
 */
function* deleteICCards() {
    yield call(setWaitingState, true, 'delete');
    const targetCardNos = yield select(state => state.deleteICCardNos);
    if (targetCardNos && targetCardNos.length > 0) {
        yield call(deleteICCardsByCardNo, targetCardNos);
    }
    yield fork(searchICCardList, { showNoneMessage: false });   //ICカード一覧を再表示する
    yield call(setWaitingState, false, null);
}

/**
 * 所属変更
 */
 function* changeEnterprise(action) {
    yield call(setLoadState, true);
    const { enterpriseId } = action;
    if (hasEnterprise(enterpriseId)) {
        yield call(setLocationsAndUsersByEntId, enterpriseId);
    } else {
        yield call(setLocationsAndUsersByLoginUser);
    }
    yield call(setLoadState, false); 
}

//#endregion

//#region その他関数

/**
 * 初期表示情報セット
 */
function* setInitialInfo() {
    yield fork(setLookUp);
    yield fork(setICCardType);
}

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
 * ICカード一覧をセットする
 * @param {object} condition 検索条件
 */
function* setICCardResult(condition, showNoneMessage) {
    const icCardInfo = yield call(getIcCardList, condition);
    if (icCardInfo.isSuccessful) {
        yield put ({ type: SET_SEARCH_RESULT, value: icCardInfo.data });
        if (showNoneMessage && icCardInfo.data.rows.length <= 0) {
            yield put({ type: CHANGE_MODAL_STATE, data: { show: true, title: '検索', message:'検索条件に該当するICカードがありません。', bsSize: 'sm', buttonStyle: 'message' }});
        }
    } else {
        yield call(setErrorMessage, icCardInfo.errorMessage);
    }
}

/**
 * 新規ICカード情報をセットする
 * @param {function} callback コールバック関数
 */
function* setNewICCard(callback) {
    yield put({ type: SET_EDIT_ICCARD, data: getEmptyICCard(), isRegister: true });
    yield call(setLocationsAndUsersByLoginUser);
    callback && callback();
}

/**
 * 編集中のICカード情報をセットする
 * @param {number}} cardNo カード番号
 * @param {function} callback コールバック関数
 */
function* setEdiICCard(cardNo, callback) {
    const iccardInfo = yield call(postGetIcCard, cardNo);
    if (iccardInfo.isSuccessful) {
        const { data } = iccardInfo;
        data.icCardEntity.validStartDate = data.icCardEntity.validStartDate && convertJsonDateToMoment(data.icCardEntity.validStartDate, VALID_DATE_FORMAT);
        data.icCardEntity.validEndDate = data.icCardEntity.validEndDate && convertJsonDateToMoment(data.icCardEntity.validEndDate, VALID_DATE_FORMAT);
        yield put({ type: SET_EDIT_ICCARD, data, isRegister: false });
        if (!hasEnterprise(data.icCardEntity.enterpriseId)) {
            yield call(setLocationsAndUsersByLoginUser);
        } else {
            yield call(setLocationsAndUsersByEntId, data.icCardEntity.enterpriseId);
        }
        callback && callback();
    } else {
        yield call(setErrorMessage, iccardInfo.errorMessage);
    }
}

/**
 * 該当カード番号のICカードを削除する
 * @param {array} cardNos カード番号リスト
 */
function* deleteICCardsByCardNo(cardNos) {
    const iccardInfo = yield call(postDeleteIcCards, cardNos);
    if (iccardInfo.isSuccessful) {
        yield put({ type: SUCCESS_DELETE, targetName: "ICカード情報" });
        yield put({ type: SET_DELETE_ICCARD_NOS, value: [] });      //削除対象番号をクリアする
    } else {
        yield call(setErrorMessage, iccardInfo.errorMessage);
    }
}

//#endregion

//#region 電気錠ロケーション・ユーザーリスト関連

/**
 * ログインユーザーの電気錠ロケーションをセットする
 */
function* setLoginUserERackLocations() {
    const locationInfo = yield call(getERackLocations);
    if (locationInfo.isSuccessful) {
        yield put({ type: SET_LOGINUSER_ERACK_LOCATIONS, locations: locationInfo.data });
    } else {
        yield call(setErrorMessage, locationInfo.errorMessage);
    }
}

/**
 * ログインユーザーのロケーション・ユーザーマスタ情報をセットする
 */
 function* setLocationsAndUsersByLoginUser() {
    const locations = yield select(state => state.loginUserERackLocations);
    const loginUsers = yield select(state => state.searchCondition.lookUp.loginUsers);
    yield put({ type: SET_ERACK_LOCATIONS, locations });
    yield put({ type: SET_LOGIN_USERS, loginUsers });
}

/**
 * 該当所属のロケーション・ユーザーマスタ情報をセットする
 * @param {number} enterpriseId 所属ID
 */
function* setLocationsAndUsersByEntId(enterpriseId) {
    yield fork(setERackLocationsByEntId, enterpriseId);
    yield fork(setLoginUsersByEntId, enterpriseId);
}

/**
 * 該当所属の電気錠ロケーションマスタ情報をセットする
 * @param {number} enterpriseId 所属ID
 */
function* setERackLocationsByEntId(enterpriseId) {
    const locationInfo = yield call(getERackLocationsByEntId, enterpriseId);
    if (locationInfo.isSuccessful) {
        yield put({ type: SET_ERACK_LOCATIONS, locations: locationInfo.data });
    } else {
        yield call(setErrorMessage, locationInfo.errorMessage);
    }
}

/**
 * 該当所属のユーザーマスタ情報をセットする
 * @param {number} enterpriseId 所属ID
 */
function* setLoginUsersByEntId(enterpriseId) {
    const userInfo = yield call(getUsersByEntId, enterpriseId);
    if (userInfo.isSuccessful) {
        yield put({ type: SET_LOGIN_USERS, loginUsers: userInfo.data });
    } else {
        yield call(setErrorMessage, userInfo.errorMessage);
    }
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
 * マスターデータを取得する
 */
 function getLookUp() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, '/api/icCard', null, (data, networkError) => {
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
 * ICカード一覧を検索する
 * @param {object} condition 検索条件
 */
function getIcCardList(condition) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/icCard/getIcCardResult', condition, (result, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (result) {
                resolve({ isSuccessful: true, data: result});
            } else {
                resolve({ isSuccessful: false, errorMessage: "ICカード一覧取得に失敗しました。" });
            }
        });
    });    
}


/**
 * ICカード情報を取得する
 * @param {*} cardNo カード番号
 */
function postGetIcCard(cardNo) {
    var sendingData = { id: cardNo };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/icCard/getIcCard', sendingData, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data });
            } else {
                resolve({ isSuccessful: false, errorMessage: "ICカード情報取得に失敗しました。" });
            }
        });
    });    
}

/**
 * 複数ICカード情報取得
 * @param {array}} cardNos カード番号リスト
 * @returns 
 */
function getIcCards(cardNos) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/icCard/getIcCards', cardNos, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data });
            } else {
                resolve({ isSuccessful: false, errorMessage: "ICカード情報取得に失敗しました。" });
            }
        });
    });
}

/**
 * ICカード情報保存
 * @param {object} icCard ICカード情報
 */
function postSaveIcCard(icCard) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/icCard/setIcCard', icCard, (result, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (result) {
                if (result.isSuccess) {
                    resolve({ isSuccessful: true });
                } else {
                    resolve({ isSuccessful: false, errorMessage: result.message });
                }
            } else {
                resolve({ isSuccessful: false, errorMessage: "ICカード情報保存に失敗しました。" });
            }
        });
    });
}

/**
 * ICカード情報保存（複数）
 * @param {array} icCards ICカードリスト
 */
function postSaveIcCards(icCards) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/icCard/setIcCards', icCards, (result, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (result) {
                if (result.isSuccess) {
                    resolve({ isSuccessful: true });
                } else {
                    resolve({ isSuccessful: false, errorMessage: result.message });
                }
            } else {
                resolve({ isSuccessful: false, errorMessage: "ICカード情報保存に失敗しました。" });
            }
        });
    });
}

/**
 * ICカード情報削除（複数）
 * @param {array} cardNos カード番号リスト
 */
function postDeleteIcCards(cardNos) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/icCard/deleteIcCards', cardNos, (result, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (result) {
                if (result.isSuccess) {
                    resolve({ isSuccessful: true });
                } else {
                    resolve({ isSuccessful: false, errorMessage: result.message });
                }
            } else {
                resolve({ isSuccessful: false, errorMessage: "ICカード情報削除に失敗しました。" });
            }
        });
    });
}


/**
 * ICカード情報削除（複数）
 * @param {array} cardNos カード番号リスト
 */
function postDeleteIcCards(cardNos) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/icCard/deleteIcCards', cardNos, (result, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (result) {
                if (result.isSuccess) {
                    resolve({ isSuccessful: true });
                } else {
                    resolve({ isSuccessful: false, errorMessage: result.message });
                }
            } else {
                resolve({ isSuccessful: false, errorMessage: "ICカード情報削除に失敗しました。" });
            }
        });
    });
}

/**
 * 電気錠ラックロケーション一覧を取得する（ログインユーザーが選択可能なロケーション）
 */
function getERackLocations() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, '/api/location/getERackLocations', null, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data });
            } else {
                resolve({ isSuccessful: false, errorMessage: "電気錠ラックロケーション取得に失敗しました。" });
            }
        });
    });
}

/**
 * 該当所属の電気錠ラックロケーション一覧を取得する
 * @param {number} enterpriseId 所属ID
 */
function getERackLocationsByEntId(enterpriseId) {   
    var sendingData = { id: enterpriseId };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/location/getERackLocationsByEntId', sendingData, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data });
            } else {
                resolve({ isSuccessful: false, errorMessage: "電気錠ラックロケーション取得に失敗しました。" });
            }
        });
    });
}

/**
 * 該当所属のユーザー一覧を取得する
 * @param {number} enterpriseId 所属ID
 */
function getUsersByEntId(enterpriseId) {   
    var sendingData = { id: enterpriseId };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/user/getUsersByEntId', sendingData, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data });
            } else {
                resolve({ isSuccessful: false, errorMessage: "ユーザー取得に失敗しました。" });
            }
        });
    });
}

//#endregion
