/**
 * @license Copyright 2018 DENSO
 * 
 * POST用データ取得
 * 
 */

'use strict';


/**
 * PointからsystemId,pointNoを取得する
 * @returns {object}　ポイントオブジェクト
 */
export function getPointData(point) {
    return _.pick(point, ['systemId', 'pointNo']);
}

/**
 * Pointの配列からsystemId,pointNo情報のみ取得する
 * @returns {array}　ポイントオブジェクト配列
 */
export function getPointListData(pointArray) {
    return pointArray &&
        pointArray.map((point) => {
        return getPointData(point);
    })
}

/**
 * egroupから紐づいているポイント情報を取得する(breakers, elecFacilities)
 * @returns {array}　ポイントオブジェクト配列
 */
export function getEgrouptData(egroup) {
    if (!egroup) { return egroup };
    let breakers = egroup.breakers;
    breakers = breakers.map((breaker) => {
        return { points: getPointListData(breaker.points) };
    })
    let elecFacilities = egroup.elecFacilities;
    elecFacilities = elecFacilities.map((facility) => {
        return { point: getPointData(facility.point) };
    })
    return { egroupId:egroup.egroupId, breakers, elecFacilities };
}