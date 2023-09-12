/**
 * @license Copyright 2018 DENSO
 * 
 * 並べ替え可能ツリービュー関係のユーティリティ
 * 
 */

'use strict';


/**
 * ツリーデータから並べ替え時表示用データを作成する
 * @param {array} sortableList 並べ替え時表示用データ
 * @param {object} treeData ツリーデータ
 * @param {object} selectNodePosition 選択中ノードの位置
 * @param {number} level 現在処理中の階層情報
 */
export function makeSortList(sortableList, treeData, selectNodePosition, sortNodes, level) {
    if (selectNodePosition.length === 1) {
        // ルートノード並び替え時
        return pushSortableNodes(sortableList, sortNodes, level);
    }

    treeData.forEach((data, index) => {
        if (selectNodePosition[level].id === data.id) {
            sortableList.push({ text: data.text, id: data.id, sortable: false, level: level });
            if (selectNodePosition.length === level + 2) {
                //選択ノードの親ノードの場合
                sortableList = pushSortableNodes(sortableList, sortNodes, level);
            }
            else {
                makeSortList(sortableList, data.nodes, selectNodePosition, sortNodes, level + 1); //再帰処理
            }
        }
        else {
            sortableList.push({ text: data.text, id: data.id, sortable: false, level: level });
        }
    });
    return sortableList;
}

/**
 * ノード追加ロケーションツリーデータを作成する
 * @param {array} sortableList 並べ替え表示用データ
 * @param {number} level 現在処理中の階層情報
 */
function pushSortableNodes(sortableList, sortNodes, level) {
    sortNodes.forEach((data) => {
        sortableList.push({ ...data, text: data.name || data.egroupName, id: data.locationId || data.egroupId, sortable: true, level: data.level });
    })
    return sortableList;
}

/**
 * 並べ替え後のロケーションノード配列を取得する
 * @param {array} before 変更前並べ替え対象ノード一覧
 */
export function getSortLocations(before) {
    var idArray = $('.sortable-list').sortable("toArray");   //並べ替え要素のidの配列を取得
    const sorted = idArray.map((id, index) => {
        let update = getMatchLocation(id, before, index);
        update.dispIndex = index+1; //dispIndexは1から振る
        return update;
    });
    return sorted;
}

/**
 * locationIdが一致するロケーション情報を返す
 * @param {string} id 検索するid
 * @param {array} nodes 対象ノード一覧
 */
function getMatchLocation(id, nodes) {
    var matchNode = [];
    nodes.some((obj) => {
        if (obj.locationId.toString() === id) {
            matchNode = obj;
            return true;
        }
    });
    return matchNode;
}

/**
 * 並べ替え後の管理項目ノード配列を取得する
 * @param {array} before 変更前並べ替え対象ノード一覧
 */
export function getSortItems(before) {
    var idArray = $('.sortable-list').sortable("toArray");   //並べ替え要素のidの配列を取得
    const sorted = idArray.map((id, index) => {
        let update = getMatchItem(id, before, index);
        update.position = index+1;
        return update;
    });
    return sorted;
}

/**
 * itemIdが一致する項目情報を返す
 * @param {string} id 検索するid
 * @param {array} nodes 対象ノード一覧
 */
function getMatchItem(id, nodes) {
    var matchNode = [];
    nodes.some((obj) => {
        if (obj.itemId.toString() === id) {
            matchNode = obj;
            return true;
        }
    });
    return matchNode;
}


/**
 * 並べ替え後のロケーションノード配列を取得する
 * @param {array} before 変更前並べ替え対象ノード一覧
 */
export function getSortEgroups(before) {
    var idArray = $('.sortable-list').sortable("toArray");   //並べ替え要素のidの配列を取得
    const sorted = idArray.map((id, index) => {
        let update = Object.assign({}, getMatchEgroup(id, before, index));
        update.dispIndex = index;
        return update;
    });
    return sorted;
}

/**
 * egroupIdが一致する電源系統情報を返す
 * @param {string} id 検索するid
 * @param {array} nodes 対象ノード一覧
 */
function getMatchEgroup(id, nodes) {
    var matchNode = nodes.find((node) => node.egroupId.toString() === id);
    return matchNode ? matchNode : [];
}