/**
 * @license Copyright 2018 DENSO
 * 
 * 権限用ファイル(authentication.js)
 * 
 */

'use strict';

import { sendData, EnumHttpMethod } from 'http-request';

/**
 * 機能ID
 */
export const FUNCTION_ID_MAP = {
    floorMap: 101,
    realTimeMonitor: 102,
    trendGraph: 103,
    incidentLog: 104,
    battery: 105,
    electricLockMap: 106,
    demandGraph: 107,
    
    locationView: 201,

    capacityRack: 301,

    rack: 401,
    unit: 402,
    unitMove: 403,
    template: 404,
    unitPort: 405,
    multiRackView: 406,

    networkConnection: 501,
    powerConnection: 502,

    working: 601,
    eRackOperation: 602,
    reportSchedule: 603,
    controlSchedule: 604,

    pointEdit: 701,
    enterpriseEdit: 702,
    userEdit: 703,
    tagEdit: 704,
    eGroupEdit: 705,
    rackMaintenance: 706,
    unitMaintenance: 707,
    locationEdit: 708,
    gateEdit: 709,
    graphicEdit: 710,
    imageEdit: 711,
    consumerMaintenance: 712,
    demandSettingMaintenance: 713,
    controlSettingMaintenance: 714,
    elecKeyEdit: 715,
    projectMaintenance: 716,
    lineMaintenance: 717,
    patchboardMaintenance: 718,
    icCard: 719,
    rackOperationDevice: 720,

    importExport: 801,
    assetReport: 802,
    dataReport: 803,
    demandSummary: 804,

    operationLog: 901,
    controlLog: 902,
    eLockOpLog: 903,
    cardReadLog: 904,

    mailSetting: 1001,
    defaultSetting: 1002,
    soundSetting: 1003,
    dashboardSetting: 1004,
    
    consumer: 1101,
    
    elecKey: 1201,

    project: 1301,
    line: 1302,
    patchboard: 1303,
    projectSchedule: 1304,
    lineConnectionLog: 1305
};

/**
 * ユーザーの権限レベル
 */
export const LAVEL_TYPE = {
    administrator: 1,
    manager: 2,
    operator: 3,
    normal: 4
};

export const ALLOW_TYPE_NO = {
    edit: 9,
    readOnly: 1,
    hide: 0
}

/**
 * 認証情報を取得する
 * @param {number} functionId 機能ID
 * @param {function} callback コールバック関数
 */
export function getAuthentication(functionId, callback) {
    let url = '/api/auth';
    if (functionId) {
        url =  url + '?functionId=' + functionId.toString();
    }

    sendData(EnumHttpMethod.get, url, null, (info, networkError) => {
        if (callback) {
            if (networkError) {
                callback(null, networkError);
            } else {
                callback(info, networkError);
            }
        }
    });
}

/**
 * レベルによって読み取り専用かどうか
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {number} level ユーザー権限レベル
 * @param {number} maxLevel 編集可能な権限レベル
 */
export function readOnlyByLevel(isReadOnly, level, maxLevel) {
    if (!isReadOnly && maxLevel >= level) {
        return false; 
    }
    return true;
}