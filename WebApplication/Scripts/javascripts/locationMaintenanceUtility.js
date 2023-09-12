/**
 * @license Copyright 2018 DENSO
 * 
 * ロケーションメンテナンス画面用ユーティリティ
 * 
 */

'use strict';

import { LAVEL_TYPE } from 'authentication';

//#region　全兄弟ロケーションの権限があるかどうか
/**
* 全兄弟ロケーションの権限があるかどうか
*/
export function isAllowedAllSiblings(locationList, selectLocPosition) {
    //選択中ロケーションの親ロケーションを取得する
    const parentPosition = _.initial(_.cloneDeep(selectLocPosition));
    let siblings = null;
    if (parentPosition && parentPosition.length > 0) {
        siblings = getSiblingsByPosition(locationList, parentPosition);
    }
    else {
        siblings = _.sortBy(locationList, ['dispIndex']);
    }

    //選択ロケーションの兄弟ロケーションがすべて許可ロケーションかどうかを判定する
    return { isAllowed: _.every(siblings, 'isAllowed'), siblings };
}

/**
 * position情報から選択中ロケーションの兄弟情報を取得する
 */
function getSiblingsByPosition(locationList, position) {
    for (let i = 0; position.length > i; i++) {
        const matchLocation = getMatchLocation(position[i], locationList);
        locationList = _.get(matchLocation, "children", []);
    }
    return _.sortBy(locationList, ['dispIndex']);
}

//#endregion

//#region その他
/**
 * position情報から対象location情報を取得する
 */
export function getLocationByPosition(locationList, position) {
    let list = _.cloneDeep(locationList);
    let matchLocation;
    for (let i = 0; position.length > i; i++) {
        matchLocation = getMatchLocation(position[i], list);
        list = _.get(matchLocation, "children", []);
    }
    return matchLocation;
}

/**
 * location情報からposition情報を生成する
 * @param {any} location
 */
export function getPositionByLocation(location) {
    const position = [];

    let temp = location;

    do {
        position.unshift(Object.assign({}, temp, { id: temp.locationId }));
        temp = temp.parent;
    } while (temp);

    return position;
}

/**
 * location配列から一致するロケーション情報を取得する
 */
function getMatchLocation(target, locationList) {
    return _.find(locationList, { 'locationId': target.locationId });
}

/**
* 読み取り専用かどうかを取得する
* @param {object} level レベル
* @param {string} name 編集項目名称
*/
export function getIsReadOnly(isReadOnly, level, name) {
    if (isReadOnly || level === LAVEL_TYPE.normal) {
        return true;
    }
    else {
        switch (name) {
            case "sort":  //並べ替え
            case "edit": //ロケーション情報編集
                return false;   //運用者以上なら操作可
            case "addDelete": //ロケーション追加削除
                if (level <= LAVEL_TYPE.manager) {
                    return false;   //運用管理者以上なら操作可
                }
                else {
                    return true;
                }
            default:
                return false;
        }
    }
}

/**
 * ラック利用状況一覧からidが一致する情報を取得する
 * @param {number} id 検索するID
 * @param {array} array 検索対象配列
 */
export function getMatchStatus(id, array) {
    if (array && array.length > 0) {
        const index = array.findIndex((data) => {
            return data.statusId === id;
        });
        return array[index];
    }
}

/**
 * ラック種別一覧からidが一致する情報を取得する
 * @param {number} id 検索するID
 * @param {array} array 検索対象配列
 */
export function getMatchType(id, array) {
    if (array && array.length > 0) {
        const index = array.findIndex((data) => {
            return data.typeId === id;
        });
        return array[index];
    }
}

/**
 * 新規ノード情報取得
 * @param {bool} isAddChild 子ノード追加かどうか
 */
export function getNewNodeInfo(isAddChild, location) {
    const select = _.cloneDeep(location);
    //編集対象情報作成
    return {
        systemId: select.systemId,
        locationId: -1,
        parent: isAddChild ? select : _.get(select.parent, "locationId") ? select.parent : null,
        level: isAddChild ? select.level + 1 : select.level,
        name: "",
        isRack: false,
        rack: { status: null, type: null },
        dispIndex: 1
    }
}
//#endregion