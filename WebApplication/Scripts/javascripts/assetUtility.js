/**
 * @license Copyright 2018 DENSO
 * 
 * アセット関係のユーティリティ
 * 
 */

'use strict';

import { TYPE, MAXLENGTH_EXTENDED_DATA } from 'extendedDataUtility';
import { validateText, validateInteger, validateRealFormat, validateDate, validateTextArea, VALIDATE_STATE } from 'inputCheck';

//#region 最大文字数

export const MAXLENGTH_RACK = {
    comment: 100
};

export const MAXLENGTH_RACKPS = {
    name: 32,
    comment: 200
};

export const MAXLENGTH_UNIT = {
    name: 32,
    comment:100,
};

export const MAXLENGTH_UNITNETWORK = {
    portName: 32,
    ipAddressName: 32,
    ipAddressString: 64,
};

export const MAXLENGTH_LINK = {
    title: 32,
    url: 2083
};

export const MAXLENGTH_NETWORK = {
    name: 64,
    cableStandard: 32,
    speed: 32,
    bandWidth: 32,
    comment: 256
};

//#endregion

//#region アセット詳細情報関係

/**
 * アセット詳細情報の日付時刻型をmoment型に変換する
 * @param {array} pages アセット詳細情報のページリスト 
 * @returns {array} 変換後のアセット詳細のページリスト
 */
export function convertDateTimeExtendedData(pages){
    return pages.map((page) => {
        if (page.extendedItems) {
            page.extendedItems = page.extendedItems.map((item) => {
                if (item.type === TYPE.dateTime && item.value) {
                    item.value = moment(item.value);
                }
                return item;
            });
        }                
        return page;
    });
}

/**
 * アセット詳細情報の数値型（整数型、実数型、選択肢型）を各数値型に変換する
 * @param {array} pages アセット詳細情報のページリスト 
 * @returns {array} 変換後のアセット詳細のページリスト
 */
export function convertNumberExtendedData(pages) {
    pages.forEach((page) => {
        if (page.extendedItems) {
            page.extendedItems.forEach((item) => {
                if ([TYPE.integer, TYPE.select].indexOf(item.type) >= 0) {
                    item.value = item.value ? parseInt(item.value) : null;
                } else if (item.type === TYPE.real) {
                    item.value = item.value ? parseFloat(item.value) : null;
                }
            });
        }
    });
    return pages;
}

/**
 * 詳細ページにてエラーになっているか
 * @param {array} pages 詳細ページ一覧
 */
export function isErrorExtendedData(pages) {
    return pages.some((page) => {
        const workItems = Object.assign([], page.extendedItems);
        return workItems.some((item) => {
            const validate = validateExtendedItem(item.value, item.type, item.format, item.isRequired);
            return (validate.state !== VALIDATE_STATE.success);
        });
    });
}

/**
 * 詳細項目リストにてエラーになっているか
 * @param {array} pages 詳細ページ一覧
 */
 export function isErrorExtendedItems(items) {
    return items.some((item) => {
        const validate = validateExtendedItem(item.value, item.type, item.format, item.isRequired);
        return (validate.state !== VALIDATE_STATE.success);
    });
}

/**
 * 詳細項目の入力検証
 * @param {object} value 値 
 * @param {number} type 種別
 * @param {string} format フォーマット
 * @param {boolean} isRequired 必須かどうか
 */
export function validateExtendedItem(value, type, format, isRequired) {
    switch (type) {
        case TYPE.text:
            return validateText(value, MAXLENGTH_EXTENDED_DATA.text, !isRequired);
        case TYPE.integer:
            return validateInteger(value, -10000000, 10000000, !isRequired);
        case TYPE.real:
            return validateRealFormat(value, -10000000, 10000000, !isRequired, format);
        case TYPE.dateTime:
            return validateDate(value, format, !isRequired);
        case TYPE.textArea:
            return validateTextArea(value, MAXLENGTH_EXTENDED_DATA.textArea, !isRequired);
    }
    return { state: VALIDATE_STATE.success };           //選択肢は不正の値が入力できないため、常にOKとする
}

//#endregion

//#region ラックやユニットの有無

/**
 * ラックがあるかどうか
 * @param {object} rack ラック情報
 * @returns {boolean} ラックの有無
 */
export function hasRack(rack){
    if (rack && rack.rackId) {
        return true;
    }
    return false;
}

/**
 * ラック搭載図があるかどうか
 * @param {object} rack ラック情報
 * @returns {boolean} ラックの搭載情報があるかどうか
 */
export function hasRackView(rack) {
    if(hasRack(rack) && rack.row) {
        return true;
    }
    return false;
}

/**
 * ブレーカーにポイントが登録されているかどうか
 * @param {object} breaker ブレーカー情報
 * @returns {boolean} ブレーカーにポイントが登録されているかどうか
 */
export function hasBrekerPoints(breaker) {
    if(breaker.points&&breaker.points.length>0) {
        return true;
    }
    return false;
}

/**
 * ユニットがあるかどうか
 * @param {object} unit ユニット情報
 * @returns {boolean} ユニットがあるかどうか
 */
export function hasUnit(unit) {
    if (unit && unit.unitId){
        return true;
    }
    return false;
}

/**
 * ユニット表示設定グループがあるかどうか
 * @param {object} dispSetting ユニット表示設定グループ
 * @returns {boolean} ユニット表示設定グループがあるかどうか
 */
export function hasUnitDispSetting(dispSetting) {
    if (dispSetting && dispSetting.dispSetId) {
        return true;
    }
    return false;
}

//#endregion

//#region 編集中ラック情報（omit関係）

/**
 * 編集中ラックを作成する
 * @param {object} rack ラック情報
 */
export function makeEditingRack(rack) {
    let target = JSON.parse(JSON.stringify(rack));
    delete target.updateUser;
    delete target.updateDate;
    delete target.ratedUnitPowerTotal;
    delete target.ratedRackPowerTotal;
    target.operationLogs = [];
    target.tags = [];
    target.extendedPages = convertDateTimeExtendedData(target.extendedPages);       //日付時刻のデータは変換する
    target.unitDispSettings = target.unitDispSettings.map((dispSetting) => {
        return {
            systemId: dispSetting.systemId,
            dispSetId: dispSetting.dispSetId,
            position: Object.assign({}, dispSetting.position),
            size: Object.assign({}, dispSetting.size),
            units : dispSetting.units.map((unit) => { return _.pick(unit, ['systemId', 'unitId']); })
        };
    });
    target.powers = makeEditingRackPowers(target.powers, rack.unitDispSettings);
    return target;
}


//#region privete（ラック電源Omit関係）

/**
 * 編集中ラック電源を作成する
 * @param {array} powers ラック電源一覧
 * @param {array} dispSettings 表示ユニット設定一覧
 */
function makeEditingRackPowers(powers, dispSettings) {
    if (!powers || !dispSettings) {
        return powers;
    }

    //ユニットの一覧を作成
    var units = [];
    dispSettings.forEach((item) => {
        if (item.units && item.units.length > 0) {
            Array.prototype.push.apply(units, item.units);
        }
    });

    //ラック電源の使用状況を入れた配列にする
    return powers.map((power) => {
        power.isInUse = units.some((unit) => {
            if (unit.rackPower) {
                return unit.rackPower.psNo === power.psNo;
            }
            return false;
        });
        power.outlets = power.outlets && power.outlets.map((outlet) => {
            outlet.point = makePointSimpleData(outlet.point);
            return outlet;
        });
        power.breaker = makeBreckerSimpleData(power.breaker);
        return power;
    });
}

/**
 * 簡略化したポイントデータを作成する
 * @param {object} point ポイント情報
 */
function makePointSimpleData(point) {
    return point && _.pick(point, ['systemId', 'pointNo', 'pointName']);
}

/**
 * 簡略化したブレーカーデータを作成する
 * @param {object} breaker ブレーカー情報
 */
function makeBreckerSimpleData(breaker) {
    return breaker && {
        systemId: breaker.systemId,
        egroup: {
            systemId: breaker.egroup.systemId,
            egroupId: breaker.egroup.egroupId,
            egroupName: breaker.egroup.egroupName
        },
        breakerNo: breaker.breakerNo,
        breakerName: breaker.breakerName,
        ratedCurrent: breaker.ratedCurrent,
        ratedVoltage: breaker.ratedVoltage,
        hasPoints: hasBrekerPoints(breaker)
    };
}

//#endregion

//#endregion

//#region ネットワーク情報（omit関係）

//#region ネットワーク選択用

/**
 * 選択中ネットワーク経路情報を作成する（必要な情報のみに省略する）
 * @param {object} networkPath ネットワーク経路情報
 */
export function makeOmitSelectNetworkPath(networkPath) {
    let target = _.cloneDeep(networkPath);
    target.rackFrom = makeOmitNetworkRackDataForSelect(target.rackFrom);
    target.unitFrom = makeOmitNetworkUnitDataForSelect(target.unitFrom);
    target.portFrom = null;     //選択時は必要なし
    target.rackTo = makeOmitNetworkRackDataForSelect(target.rackTo);
    target.unitTo = makeOmitNetworkUnitDataForSelect(target.unitTo);
    target.portTo = null;     //選択時は必要なし
    return target;
}

/**
 * ネットワーク一覧用のラックデータを作成する
 * @param {object} rack ラック情報 
 */
function makeOmitNetworkRackDataForSelect(rack) {
    let target = rack && _.pick(rack, ['systemId', 'rackId', 'rackName', 'location', 'unitDispSettings', 'type', 'row', 'col'])
    if (target) {
        target.location = makeOmitLocation(target.location);
        target.unitDispSettings = target.unitDispSettings.map((dispSetting) => {
            let omitDispSetting = dispSetting && _.pick(dispSetting, ['systemId', 'dispSetId', 'frontDispData', 'rearDispData', 'position', 'size', 'status.color', 'hasAlarm', 'alarmName', 'units']);
            omitDispSetting.units = dispSetting.units.map((unit) => { 
                let omitUnit = _.pick(unit, ['systemId', 'unitId', 'unitNo', 'name']);
                return omitUnit
            });
            return omitDispSetting;
        });
    }
    return target;
}

/**
 * ネットワーク一覧用のユニットデータを作成する
 * @param {object} unit ユニット情報
 */
function makeOmitNetworkUnitDataForSelect(unit) {
    let targetUnit = unit && _.pick(unit, ['systemId' ,'unitId' ,'unitNo' ,'name' ,'portCount']);
    return targetUnit;
}


//#endregion

//#region ネットワーク経路表示用

/**
 * 経路表示するネットワーク経路を作成する
 * @param {object} networkPath ネットワーク経路情報
 */
export function makeOmitNetworkPathView(networkPath) {
    let target = _.cloneDeep(networkPath);
    target.rackFrom = omitNetworkRackDataForView(target.rackFrom);
    target.unitFrom = omitNetworkUnitDataForView(target.unitFrom);
    target.portFrom = omitNetworkPortDataForView(target.portFrom);
    target.rackTo = omitNetworkRackDataForView(target.rackTo);
    target.unitTo = omitNetworkUnitDataForView(target.unitTo);
    target.portTo = omitNetworkPortDataForView(target.portTo);
    if (target.networksFrom) {
        target.networksFrom = target.networksFrom && target.networksFrom.map((network) => {
            return makeOmitNetworkPathView(network);
        });
    }
    if (target.networksTo) {
        target.networksTo = target.networksTo && target.networksTo.map((network) => {
            return makeOmitNetworkPathView(network);
        });
    }
    return target;
}

/**
 * ネットワーク経路表示用にラック情報を省略する
 * @param {rack} rack ラック情報
 */
export function omitNetworkRackDataForView(rack) {
    return rack && _.pick(rack, ['systemId', 'rackId', 'rackName', 'location.isAllowed']);
}

/**
 * ネットワーク経路表示用にユニット情報を省略する
 * @param {object} unit ユニット情報
 */
export function omitNetworkUnitDataForView(unit) {
    let targetUnit = unit && _.pick(unit, ['systemId' ,'unitId' ,'unitNo' ,'position' ,'size' ,'name' ,'type.name' ,'fontSize' ,'textColor' ,'backColor' ,'frontUnitImage.url' ,'rearUnitImage.url', 'ports']);
    if (targetUnit) {
        targetUnit.ports = targetUnit.ports && targetUnit.ports.map((port) => {
            return makeNetworkPortSimpleData(port);
        });
    }
    return targetUnit;
}

/**
 * ネットワーク経路表示用にポート情報を省略する
 * @param {object} port ポート情報
 */
export function omitNetworkPortDataForView(port) {
    let targetPort = port && _.pick(port, ['systemId', 'portNo', 'portSeqNo', 'name', 'ipAddresses']);
    if (targetPort) {
        targetPort.ipAddresses = targetPort.ipAddresses && targetPort.ipAddresses.map((ipAddress) => {
            return {
                ipNo: ipAddress.ipNo,
                address: ipAddress.address
            };
        });
    }
    return targetPort;
}

//#endregion

//#region ネットワーク編集用

/**
 * 編集中ネットワーク経路を作成する
 * @param {object} networkPath ネットワーク経路情報
 */
export function makeEditingNetworkPath(networkPath) {
    let target = _.cloneDeep(networkPath);
    target.rackFrom = makeNetworkRackSimpleData(target.rackFrom);
    target.unitFrom = makeNetworkUnitSimpleData(target.unitFrom);
    target.portFrom = makeNetworkPortSimpleData(target.portFrom);
    target.rackTo = makeNetworkRackSimpleData(target.rackTo);
    target.unitTo = makeNetworkUnitSimpleData(target.unitTo);
    target.portTo = makeNetworkPortSimpleData(target.portTo);
    return target;
}

/**
 * ネットワーク用の簡略化したラックデータを作成する
 * @param {object} rack ラック情報
 */
export function makeNetworkRackSimpleData(rack) {
    let target =  rack && _.pick(rack, ['systemId', 'rackId', 'rackName', 'location']);
    if (target) {
        target.location = makeOmitLocation(target.location);
    }
    return target;
}

/**
 * ネットワーク用の簡略化したユニットデータを作成する
 * @param {object} unit ユニット情報
 */
export function makeNetworkUnitSimpleData(unit) {
    return unit && _.pick(unit, ['systemId', 'unitId', 'name']);
}

/**
 * ネットワーク用の簡略化したポートデータを作成する
 * @param {object} port ポート情報
 */
export function makeNetworkPortSimpleData(port) {
    let targetPort = port && _.pick(port, ['systemId', 'portNo', 'portSeqNo', 'name', 'networks']);
    if (targetPort) {
        targetPort.networks = targetPort.networks && targetPort.networks.map((network) => {
            return {
                networkId: network.networkId,
                portIndex: network.portIndex
            };
        });
    }
    return targetPort;
}
 
/**
 * 編集画面の選択ラックデータを作成する
 * @param {object} rack ラック情報 
 */
export function makeOmitEditNetworkRackData(rack) {
    let target = rack && _.pick(rack, ['systemId', 'rackId', 'rackName', 'location', 'unitDispSettings', 'type', 'row', 'col', 'links'])
    if (target) {
        target.location = makeOmitLocation(target.location);
        target.unitDispSettings = target.unitDispSettings.map((dispSetting) => {
            let omitDispSetting = dispSetting && _.pick(dispSetting, ['systemId', 'dispSetId', 'frontDispData', 'rearDispData', 'position', 'size', 'status.color', 'hasAlarm', 'alarmName', 'units']);
            omitDispSetting.units = dispSetting.units.map((unit) => { 
                let omitUnit = _.pick(unit, ['systemId', 'unitId', 'unitNo', 'name', 'links']);
                omitUnit.links = omitUnit.links.map((link) => _.pick(link, 'title', 'url'));
                return omitUnit
            });
            return omitDispSetting;
        });
    }
    return target;
}

/**
 * 編集画面の選択ユニットデータを作成する
 * @param {object} unit ユニット情報
 */
export function makeOmitEditNetworkUnitData(unit) {
    let targetUnit = unit && _.pick(unit, ['systemId' ,'unitId' ,'unitNo' ,'name' ,'portCount' ,'ports', 'unitDispSetting.dispSetId']);
    if (targetUnit) {
        targetUnit.ports = targetUnit.ports && targetUnit.ports.map((port) => {
            return makeNetworkPortSimpleData(port);
        });
    }
    return targetUnit;
}

//#endregion

/**
 * 簡略化したロケーション情報を作成する
 * @param {object} location ロケーション情報 
 */
function makeOmitLocation(location) {
    if (location && location.parent) {
        location.parent = makeOmitLocation(location.parent)
    }
    return location && _.pick(location, ['systemId', 'locationId', 'name', 'parent', 'isAllowed'])
}

//#endregion

//#region ネットワーク経路関連

/**
 * ネットワーク経路の編集が許可されているかどうか
 * @param {object} networkPath ネットワーク経路
 */
export function isAllowedNetwrokPath (networkPath) {
    if (networkPath.rackTo && !networkPath.rackTo.location.isAllowed) {
        return false;
    } else {
        return true;
    }
}

/**
 * 一覧に表示するポート番号文字列を作成する
 * @param {object} portNo ポート番号
 * @param {number} portIndex ポートインデックス
 * @param {boolean} isAllowed 許可されているかどうか
 */
export function makePortNoCellString(portNo, portIndex, isAllowed = true) {
    if (!portNo) {
        return '(なし)';
    }

    if (isAllowed) {
        var portNoString = portNo;
        if (portIndex) {
            portNoString += '(' + portIndex + ')'
        }
    } else {
        var portNoString = '(権限なし)';
    }

    return portNoString;
}

/**
 * 一覧に表示するラック名称文字列を作成する
 * @param {string} rackId 
 * @param {string} rackName 
 * @param {boolean} isAllowed 許可されているかどうか
 */
export function makeRackCellString(rackId, rackName, isAllowed = true) {
    if (!rackId) {
        return '(なし)';
    } else {
        return isAllowed ? rackName : '(権限なし)';
    }
}

/**
 * 一覧に表示するラック名称文字列を作成する
 * @param {string} unitId 
 * @param {string} unitName 
 * @param {boolean} isAllowed 許可されているかどうか
 */
export function makeUnitCellString(unitId, unitName, isAllowed = true) {
    if (!unitId) {
        return '(なし)';
    } else {
        return isAllowed ? unitName : '(権限なし)';
    }
}

/**
 * ネットワーク経路が同一かどうか
 * @param {object} targetRow 対象のネットワーク行情報
 * @param {object} sourceRow 比較対象
 * @returns {boolean} 同一かどうか
 */
export function isSameNetworkPath(targetRow, sourceRow) {
    if (targetRow.networkId) {
        if (targetRow.networkId === sourceRow.networkId) {
            return true;
        }
    } else {
        if (!sourceRow.networkId && 
            sourceRow.rackIdFrom && sourceRow.rackIdFrom === targetRow.rackIdTo &&
            sourceRow.unitIdFrom && sourceRow.unitIdFrom === targetRow.unitIdTo &&
            sourceRow.portSeqNoFrom && sourceRow.portSeqNoFrom === targetRow.portSeqNoTo &&
            sourceRow.portIndexFrom && sourceRow.portIndexFrom === targetRow.portIndexFrom) {
            return true;
        }
    }
    return false;
}


/**
 * ネットワーク経路の編集が許可されているかどうか
 * @param {object} networkRow ネットワーク行情報
 */
export function isAllowedEditNetwrok (networkRow) {
    if (networkRow.rackIdTo &&
        networkRow.unitIdTo &&
        networkRow.portSeqNoTo &&
        !networkRow.isRackToAllowed
        ){
        return false;
    } else {
        return true;
    }
}

/**
 * ネットワーク経路情報を作成する
 * @param {object} networkRow ネットワーク経路一覧の行情報
 * @param {array} racks ラックリスト
 */
export function makeNetworkPath(networkRow, racks) {
    var networkPath = { network: null };
    networkPath.rackFrom = networkRow.rackIdFrom && findRack(racks, networkRow.rackIdFrom);
    networkPath.unitFrom = networkRow.unitIdFrom && findUnit(networkPath.rackFrom, networkRow.unitIdFrom);
    networkPath.portFrom = networkRow.portSeqNoFrom && findPort(networkPath.unitFrom, networkRow.portSeqNoFrom);
    networkPath.portIndexFrom = networkRow.portIndexFrom;
    networkPath.rackTo = networkRow.rackIdTo && findRack(racks, networkRow.rackIdTo);
    networkPath.unitTo = networkRow.unitIdTo && findUnit(networkPath.rackTo, networkRow.unitIdTo);
    networkPath.portTo = networkRow.portSeqNoTo && findPort(networkPath.unitTo, networkRow.portSeqNoTo);
    networkPath.portIndexTo = networkRow.portIndexTo;
    networkPath.isBothSearchTarget = networkRow.isBothSearchTarget;
    return networkPath;
}

/**
 * ネットワーク経路のFrom/Toをネットワーク経路一覧に合わせて調整する
 * @param {object} networkPath ネットワーク経路情報
 * @param {object} networkRow ネットワーク経路一覧の行情報
 */
export function adjustNetworkPath(networkPath, networkRow) {
    var target = _.cloneDeep(networkPath);
    if (networkRow.rackIdFrom !== networkPath.rackFrom.rackId ||
        networkRow.unitIdFrom !== networkPath.unitFrom.unitId ||
        networkRow.portSeqNoFrom !== networkPath.portFrom.portSeqNo) {
        target.rackFrom = networkPath.rackTo && _.cloneDeep(networkPath.rackTo);
        target.rackTo = _.cloneDeep(networkPath.rackFrom);
        target.unitFrom = networkPath.unitTo && _.cloneDeep(networkPath.unitTo);
        target.unitTo = _.cloneDeep(networkPath.unitFrom);
        target.portFrom = networkPath.portTo && _.cloneDeep(networkPath.portTo);
        target.portTo = _.cloneDeep(networkPath.portFrom);
        target.portIndexFrom = networkPath.portIndexTo;
        target.portIndexTo = networkPath.portIndexFrom;
    }
    return target;
}

/**
 * UnitIDからUnitDispSettingを取得する
 * @param {object} rack ラック
 * @param {string} unitId ユニットID
 */
export function findUnitDispSettingFromUnitId(rack, unitId) {
    if (rack && rack.unitDispSettings) {
        var unitDispSetting = null;
        rack.unitDispSettings.some((dispSet) => {
            let unit = dispSet.units.find((u) => u.unitId === unitId);
            unitDispSetting = _.cloneDeep(dispSet);
            if (unit) {
                return true;
            }
        });
        return unitDispSetting;
    } else {
        return null;
    }
    
}

/**
 * ラックを検索する
 * @param {array} racks ラックリスト
 * @param {string} rackId ラックID
 */
function findRack(racks, rackId) {
    return racks && racks.find((r) => r.rackId === rackId);
}

/**
 * ユニットを検索する
 * @param {object} rack ラック
 * @param {string} unitId ユニットID
 */
function findUnit(rack, unitId) {
    if (rack && rack.unitDispSettings) {
        var unit = null;
        rack.unitDispSettings.some((dispSet) => {
            unit = dispSet.units.find((u) => u.unitId === unitId);
            if (unit) {
                return true;
            }
        });
        return unit;
    } else {
        return null;
    }
}

/**
 * ポートを検索する
 * @param {object} unit ユニット
 * @param {number} portSeqNo ポートSeqNo
 */
function findPort(unit, portSeqNo) {
    if (unit && unit.ports) {
        return unit.ports.find((p) => p.portSeqNo === portSeqNo);
    } else {
        return null;
    }
} 

/**
 * ネットワーク設定をクリアする
 * @param {object} network ネットワーク
 */
export function clearNetwork(network) {
    let target = network && _.pick(network, ['systemId', 'networkId']);
    if (target) {
        target.name = '';
        target.cableType = null;
    }
    return target;
}

//#endregion

//#region フロアマップ選択関連

/**
 * ラック情報からレイアウトオブジェクトを取得する
 * @param {object} rack ラック情報
 */
export function getLayoutObject (rack) {
    const layoutObject = rack && rack.layoutObject;
    if (layoutObject) {
        layoutObject.isAllowed = rack.location.isAllowed;
    }
    return layoutObject;
};

//#endregion