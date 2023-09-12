/**
 * @license Copyright 2018 DENSO
 * 
 * ロケーションパンくずリスト用ユーティリティ
 * 
 */

'use strict';


/**
 * ロケーション情報をルートロケーションからの配列に変換する
 */
export function locationTreeToArray(rootLocation, list) {
    list.unshift({ id: rootLocation.locationId, name: rootLocation.name });
    if (rootLocation.parent) {
        locationTreeToArray(rootLocation.parent, list);
    }
    return list;
}

/**
 * 新しいロケーション情報の二次元配列を取得する
 */
export function getLocationsList(locations) {
    let locationsList = [];
    locations.forEach((location) => {
        locationsList.push(locationTreeToArray(location, []));
    })
    return locationsList;
}