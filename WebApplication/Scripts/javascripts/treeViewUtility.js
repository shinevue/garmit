/**
 * @license Copyright 2018 DENSO
 * 
 * ツリービュー関係のユーティリティ
 * 
 */

'use strict';

import { compareAscending } from 'sortCompare';

export const NEW_LOCATION_NODE = {
    name: "新規ノード",
    locationId: -1,
    state: { selected: true }
};

export const ADDING_NODE_POSITION = {
    top: 1,
    bottom: 2,
    above: 3,
    below: 4
}

/**
 * Location一覧からツリー表示用データを作成する
 * id(=locationId),text(=name),node(=children)を設定
 * @param {array} locations ロケーション一覧
 * @param {number} selectLocId 選択中ロケーションのlocationId
 */
export function makeLocationTree(locations, selectLocId) {
    let tree = $.extend(true, [], locations);

    tree.forEach((location) => {
        let children = null;
        if (location.children && location.children.length > 0) {
            children = makeLocationTree(location.children, selectLocId);
        }
        location.id = location.locationId;
        location.text = location.name;
        location.nodes = children;
        if (selectLocId) {  //選択中ロケーションIDが渡されている場合のみstate設定
            if (location.locationId === selectLocId) {
                location.state = {
                    selected: true
                };
            }
            else {
                location.state = {
                    selected: false
                };
            }
        }
    });
    return tree;
}

/**
 * ノード追加ロケーションツリーデータを作成する
 * @param {array} locations 元となるロケーション一覧
 * @param {object} selectNodePosition 選択中ロケーションまでの親ロケーション一覧
 * @param {number} level 階層
 */
export function makeAddLocations(locations, selectNodePosition, level=0, addingNodePosition=1) {
    let addChildLocations = $.extend(true, [], locations);

    for (var loc of addChildLocations) {
        if (selectNodePosition[level].locationId === loc.locationId) { //選択ロケーションもしくは選択ロケーションの親の場合
            if (selectNodePosition.length === 1) {  //ルートノード追加時
                addNewNode(addChildLocations, selectNodePosition, addingNodePosition);
            }
            else if (selectNodePosition.length - 1 === level + 1) { //選択ロケーションの親ロケーションの場合
                //子ノードに新規ノードを追加する
                if (loc.children && loc.children.length) {
                    addNewNode(loc.children, selectNodePosition, addingNodePosition);
                }
                else {
                    loc.children = [NEW_LOCATION_NODE];    //childrenがnullの場合
                }
            }
            else {
                loc.children = makeAddLocations(loc.children, selectNodePosition, level + 1, addingNodePosition); //再起処理
            }
            break;
        }
    }
    return addChildLocations;
}

/**
 * 子ノード追加ロケーションツリーデータを作成する
 * @param {array} locations 元となるロケーション一覧
 * @param {object} selectNodePosition 選択中ロケーションまでの親ロケーション一覧
 * @param {number} level 階層
 */
export function makeAddChildLocations(locations, selectNodePosition, level=0, addingNodePosition=1) {
    let addChildLocations = $.extend(true, [], locations);

    for (var loc of addChildLocations) {
        if (selectNodePosition[level].locationId === loc.locationId) {
            if (selectNodePosition.length === level + 1) {
                //子ノードに新規ノードを追加する
                if (loc.children && loc.children.length) {
                    addNewNode(loc.children, selectNodePosition, addingNodePosition);
                }
                else {
                    loc.children = [NEW_LOCATION_NODE];
                }
            }
            else {
                loc.children = makeAddChildLocations(loc.children, selectNodePosition, level + 1, addingNodePosition);
            }
            break;
        }
    }
    return addChildLocations;
}

/**
 * 新規ノードを追加する
 * @param {any} array 追加対象の配列
 * @param {any} selectNodePosition 選択中ロケーションまでの親ロケーション一覧
 * @param {any} addingNodePosition ノード追加の位置
 */
function addNewNode(array, selectNodePosition, addingNodePosition) {
    switch (addingNodePosition) {
        case ADDING_NODE_POSITION.top:
            return array.unshift(NEW_LOCATION_NODE);
        case ADDING_NODE_POSITION.bottom:
            return array.push(NEW_LOCATION_NODE);
        default:
            const selectNode = selectNodePosition[selectNodePosition.length - 1];
            const selectNodeindex = array.findIndex((loc) => loc.locationId === selectNode.locationId);
            const index = addingNodePosition === ADDING_NODE_POSITION.below ? selectNodeindex + 1 : selectNodeindex;
            return array.splice(index, 0, NEW_LOCATION_NODE);
    }
}

/**
 * egroup一覧からツリー表示用データを作成する
 * id(=egroupId),text(=egroupName),node(=children)を設定
 * @param {array} egroups egroup一覧
 * @param {number} selectedId 選択中のegroupId
 */
export function makeEgroupTree(egroups, selectedId) {
    let tree = egroups.map((egroup) => {
        let children = egroup.children && egroup.children.length > 0 && makeEgroupTree(egroup.children, selectedId);
        return Object.assign({}, egroup, {
            children: children,
            id: egroup.egroupId,
            text: egroup.egroupName,
            nodes: children,
            state: { selected: egroup.egroupId === selectedId }
        });
    });

    tree.sort((current, next) => compareAscending(current.dispIndex, next.dispIndex));

    return tree;
}

/**
 * レイアウトIDが一致するレイアウトをレイアウトツリーから取得する
 * @param {number} layoutId
 * @param {array} layouts
 */
export function getMatchLayout(layoutId, layouts) {
    let result;
    layouts.some((layout) => {
        if (layout.layoutId === layoutId) {
            result = layout;
            return true;
        }
        else if(layout.children.length >0){
            result = getMatchLayout(layoutId, layout.children);
            if (result) {
                return true;
            }
        }
    })
    return result;
}


