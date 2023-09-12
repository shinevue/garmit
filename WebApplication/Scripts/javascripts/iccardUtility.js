/**
 * @license Copyright 2021 DENSO
 * 
 * ICカードユーティリティ(iccardUtility)
 * 
 */

'use strict';

import { DATE_TIME_FORMAT } from 'constant';
import { validateText, validateKana, validateDate, validateAlphanumeric, successResult, errorResult } from 'inputCheck';
import { sendData, EnumHttpMethod } from 'http-request';
import { GLCardReader } from 'glCardReader';

//#region 定数

export const MAXLENGTH_CARD_ID = 20;
export const MAXLENGTH_CARD_NAME = 50;
export const MAXLENGTH_ENT_NAME = 50;
export const MAXLENGTH_USER_NAME = 50;
export const MAXLENGTH_USER_KANA = 100;

export const VALID_DATE_FORMAT = DATE_TIME_FORMAT.dateTime;

export const KEY_ICCARD_CARD_ID = 'cardId';
export const KEY_ICCARD_CARD_NAME = 'cardName';
export const KEY_ICCARD_ENTERPRISE = 'enterprise';
export const KEY_ICCARD_ENTERPRISE_ID = 'enterpriseId';
export const KEY_ICCARD_ENT_NAME = 'enterpriseName';
export const KEY_ICCARD_USER = 'user';
export const KEY_ICCARD_USER_ID = 'userId';
export const KEY_ICCARD_USER_NAME = 'userName';
export const KEY_ICCARD_USER_KANA = 'userKana';
export const KEY_ICCARD_VALID_DATE = 'validDate';
export const KEY_ICCARD_VALID_START_DATE = 'validStartDate';
export const KEY_ICCARD_VALID_END_DATE = 'validEndDate';
export const KEY_ICCARD_IS_INVALID = 'isInvalid';
export const KEY_ICCARD_IS_ADMIN = 'isAdmin';
export const KEY_ICCARD_ALLOW_LOCATIONS = 'allowLocations';

//#endregion

//#region GLCardReader関連

/**
 * ICカードリーダー
 */
export var cardReader;

/**
 * GLカードリーダーのインスタンス生成
 * @param {number} icCardType ICカード種別
 */
export function createCardReaderInstance(icCardType) {
    if (!cardReader) {
        cardReader = new GLCardReader(icCardType, null, getCardReadSoundFile());
    }
}

/**
 * GLカードリーダーの後処理
 */
export function clearCardReaderInstance() {
    cardReader = null;
}

//#endregion

//#region ICカード関連

/**
 * 空のICカード情報を取得する
 * @returns 空のICカード情報
 */
export function getEmptyICCard() {
    return {
        icCardEntity: getEmptyICCardEntity(),
        allowLocations: []
    }
}

/**
 * 空のICカード基本情報を取得する
 * @returns 空のICカード基本情報
 */
function getEmptyICCardEntity() {
    const current = moment().startOf('minute');
    return {
        cardNo: -1,
        cardId: '',
        cardName: '',
        enterpriseId: null,
        enterpriseName: '',
        userId: null,
        userName: '',
        userKana: '',
        validStartDate: moment(current),
        validEndDate: moment(current).add(1, 'days'),
        isInvalid: false,
        isAdmin: false
    };
}

/**
 * 空のICカード（一括編集用）を取得する
 * @returns 
 */
export function getEmptyBulkICCard() {
    const current = moment().startOf('minute');
    return {
        cardName: '',
        validStartDate: moment(current),
        validEndDate: moment(current).add(1, 'days'),
        isInvalid: false
    };
}

/**
 * 編集対象項目のみを変更したデータを取得する
 * @param {array} before 編集前のデータ
 * @param {array} keys 編集対象項目のキー
 * @param {object} value 変更後の制御コマンド情報
 */
 export function gatChangedBulkData(before, keys, value) {
    return before.map((beforeItem) => {
        let update = _.cloneDeep(beforeItem);
        keys.forEach((key) => {
            if (key === KEY_ICCARD_VALID_DATE) {
                update.icCardEntity.validStartDate = value.validStartDate;
                update.icCardEntity.validEndDate = value.validEndDate;            
            } else if (key !== KEY_ICCARD_ALLOW_LOCATIONS) {
                _.set(update.icCardEntity, key, value[key]);
            } else {
                _.set(update, key, value[key]);
            }
        })
        return update;
    });    
}

/**
 * 更新したICカード情報を取得
 * @param {object} before 更新前の情報
 * @param {string} key 変更する項目のキー
 * @param {*} value 変更値
 */
export function getChangedICCard(before, key, value) {
    var allowLocations = _.cloneDeep(before.allowLocations);
    switch (key) {
        case KEY_ICCARD_IS_ADMIN:
            if (before.icCardEntity[KEY_ICCARD_IS_ADMIN] !== value && (value || !hasEnterprise(before.icCardEntity.enterpriseId))) {
                allowLocations = [];
            }
            break;
        case KEY_ICCARD_ENTERPRISE:
            let beforeEnterpriseId = hasEnterprise(before.enterpriseId) ? before.enterpriseId : null;
            let afterEnterpriseId = hasEnterprise(value.enterpriseId) ? value.enterpriseId : null;
            if (beforeEnterpriseId !== afterEnterpriseId) {
                allowLocations = [];        
            }
            break;
        case KEY_ICCARD_ALLOW_LOCATIONS:
            allowLocations = _.cloneDeep(value);
            break;
    }

    var icCardEntity = _.cloneDeep(before.icCardEntity)
    if (key !== KEY_ICCARD_ALLOW_LOCATIONS) {
        icCardEntity = getChangedICCardEntity(icCardEntity, key, value)
    }

    return {
        icCardEntity: icCardEntity,
        allowLocations: allowLocations
    };
}

/**
 * 更新したICカード基本情報を取得
 * @param {object} before 更新前の情報
 * @param {string} key 変更する項目のキー
 * @param {*} value 変更値
 */
 export function getChangedICCardEntity(before, key, value) {
    let update = _.cloneDeep(before);
    switch (key) {
        case KEY_ICCARD_ENTERPRISE:
            update.enterpriseId = value.enterpriseId;
            update.enterpriseName = value.enterpriseName;
            if(hasEnterprise(value.enterpriseId) && before.enterpriseId !== value.enterpriseId && update.userId) {
                update.userId = null;
                update.userName = '';
            }
            break;
        case KEY_ICCARD_USER:
            update.userId = value.userId;
            update.userName = value.userName;
            break;
        case KEY_ICCARD_VALID_DATE:
            update.validStartDate = value.startDate;
            update.validEndDate = value.endDate;
            break;
        default:
            _.set(update, key, value);
            break;
    }
    
    if(key === KEY_ICCARD_IS_ADMIN && !hasEnterprise(update.enterpriseId)) {
        update.enterpriseName = '';         //所属が未選択の場合、所属名を空欄に変更
        if (update.userId) {
            update.userId = null;
            update.userName = '';
        }
    }

    return update;
}

/**
 * 「所属から選択する」フラグ変更
 * @param {object} before 更新前のICCardEntity情報
 * @returns 更新後のICCardEntity情報
 */
export function changeICCardEntityByUseEnterprise(before) {
    let update = _.cloneDeep(before);
    update.enterpriseId = null;
    update.enterpriseName = '';
    if (update.userId) {
        update.userId = null;
        update.userName = '';
    }
    return update;
}

/**
 * 「ユーザーから選択する」フラグ変更
 * @param {object} before 更新前のICCardEntity情報
 * @returns 更新後のICCardEntity情報
 */
export function changeICCardEntityByUseLoginUser(before) {
    let update = _.cloneDeep(before);
    update.userId = null;
    update.userName = '';
    return update;

}

/**
 * 保存するICカード情報を省略する
 * @param {object} icCard ICカード情報
 */
export function omitSaveICCard(icCard) {
    let omitData = _.cloneDeep(icCard);
    omitData.allowLocations = omitAllowedLocations(omitData.allowLocations);
    return omitData;
}

/**
 * 所属があるかどうか
 * @param {number} enterpriseId 所属ID
 */
export function hasEnterprise(enterpriseId) {
    if ((enterpriseId || enterpriseId === 0) && enterpriseId >= 0) {
        return true;
    }
    return false;
}

//#endregion

//#region 入力検証

/**
 * カードIDの入力検証
 * @param {string} cardId カードID
 * @returns { state:'', helpText:'' }　検証結果
 */
 export function validateCardId(cardId) {
    return validateAlphanumeric(cardId, 0, MAXLENGTH_CARD_ID, false);
}

/**
 * カード名の入力検証
 * @param {string} name 名称
 * @returns { state:'', helpText:'' }　検証結果
 */
export function validateCardName(name) {
    return validateText(name, MAXLENGTH_CARD_NAME, false);
}

/**
 * 所属or会社名の入力検証
 * @param {number} enterpriseId 所属ID
 * @param {string} enterpriseName 所属名or会社名
 * @param {boolean} useEnterprise 所属から選択するかどうか
 * @returns { state:'', helpText:'' }　検証結果
 */
export function validateEnterprise(enterpriseId, enterpriseName, useEnterprise) {
    if (useEnterprise) {
        return hasEnterprise(enterpriseId) ? successResult : errorResult('必須項目です');
    } else {
        return validateText(enterpriseName, MAXLENGTH_ENT_NAME, false);
    }
}

/**
 * ユーザー名の入力検証
 * @param {string} userName ユーザー名
 * @param {boolean} useLoginUser ユーザーから選択するかどうか
 * @returns { state:'', helpText:'' }　検証結果
 */
export function validateUser(userName, useLoginUser) {
    if (!useLoginUser) {
        return validateText(userName, MAXLENGTH_USER_NAME, true);
    }
    return successResult;
}

/**
 * ユーザー名（フリガナ）の入力検証
 * @param {string} userKana フリガナ
 * @returns { state:'', helpText:'' }　検証結果
 */
export function validateUserKana(userKana) {
    return validateKana(userKana, MAXLENGTH_USER_KANA, true);
}

/**
 * 有効期間（開始日時）の入力検証
 * @param {*} startDate 開始日時
 * @returns { state:'', helpText:'' }　検証結果
 */
export function validateValidStartDate(startDate) {
    return validateDate(startDate, VALID_DATE_FORMAT, false);
}

/**
 * 有効期間（終了日時）の入力検証
 * @param {*} startDate 開始日時
 * @param {*} endDate 終了日時
 * @returns { state:'', helpText:'' }　検証結果
 */
export function validateValidEndtDate(startDate, endDate) {
    let validate = validateDate(endDate, VALID_DATE_FORMAT, false);
    if (validate.state === "success") {
        if (startDate >= endDate) {
            validate = errorResult('終了日時は開始日時以降となるように設定してください。');
        }
    }
    return validate;
}

/**
 * 操作可能ラックの入力検証
 * @param {array} allowLocations 操作可能ラックリスト
 * @param {boolean} isAdmin 管理者かどうか
 * @returns { state:'', helpText:'' }　検証結果
 */
export function validateAllowLocations(allowLocations, isAdmin) {
    if (!isAdmin && (!allowLocations || allowLocations.length === 0)) {
        return errorResult('必須項目です');
    }
    return successResult;
}

//#endregion

//#region ICカード読取関連

/**
 * ICカード種別を取得（ReactSaga使用していない画面で使用）
 * @param {function} callback コールバック関数
 */
export function getICCardType(callback) {
    sendData(EnumHttpMethod.get, '/api/setting/getIcCardType', null, (data, networkError) => {
        if (networkError) {
            callback(false, null, networkError);
        } else if (data || data === 0) {
            callback(true, data, networkError);
        } else {
            callback(false, data, networkError);
        }
    });
}

/**
 * シリアル通信に必要なパラメータ
 */
export function getSerialConnectParameters() {
    var param = {
        baudRate: 96000,
        dataBits: 8,
        parity: 1,
        stopBits: "none",
        flowControl: "none"
    }
    if (application.appSettings) {
        const { baudRate, dataBits, parity, stopBits, flowControl } = application.appSettings;
        param.baudRate = baudRate ? Number(baudRate) : param.baudRate;
        param.dataBits = dataBits ? Number(dataBits) : param.dataBits;
        param.stopBits = stopBits ? Number(stopBits) : param.stopBits;
        param.parity = parity || param.parity;
        param.flowControl = flowControl || param.flowControl;
    }
    return param;
}

/**
 * ICカードタッチ時に鳴らす音源ファイルパス
 */
export function getCardReadSoundFile() {
    return application.appSettings && application.appSettings.cardReadSoundFile;
}

//#endregion

//#region private

/**
 * ICカードの保存する許可ロケーションを省略する
 * @param {array} locations ロケーション一覧（treeではなくlist）
 */
function omitAllowedLocations(locations) {
    return locations && locations.map((item) => {
        let location = _.pick(item, ['systemId', 'locationId', 'name', 'parent']);
        if (location.parent) {
            location.parent = omitLocationParent(item.parent);
        }
        return location;
    });
}


/**
 * 親ロケーションを省略する
 * @param {object} location ロケーション情報
 */
function omitLocationParent(location) {
    location = _.pick(location, ['systemId', 'locationId', 'name','parent']);
    if (location.parent) {
        location.parent = omitLocationParent(location.parent);
    }
    return location;
}

//#endregion