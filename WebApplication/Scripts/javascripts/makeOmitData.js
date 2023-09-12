/**
 * @license Copyright 2018 DENSO
 * 
 * 画面で不要な情報を削除したデータを取得する
 * 
 */

'use strict';

import { LINK_TYPE } from 'constant';
import { getPointData, getPointListData, getEgrouptData } from 'getPostData';
import EgroupTreeView from '../components/Assets/TreeView/EgroupTreeView';

//プロパティデフォルト値
export const POINT_PROPERTIES = ['systemId', 'pointNo', 'pointName'];
export const ENTERPRISE_PROPERTIES = ['systemId', 'enterpriseId', 'enterpriseName', 'children'];
export const EGROUP_PROPERTIES = ['systemId', 'egroupId', 'egroupName', 'children'];
export const TAG_PROPERTIES = ['systemId', 'tagId', 'name'];
export const DATATYPE_PROPERTIES = ['systemId', 'dtType', 'name'];
export const LOCATION_TREE_PROPERTIES = ['systemId', 'locationId', 'name', 'children', 'isAllowed'];
export const LOCATION_PROPERTIES = ['SystemId', 'LocationId', 'Name', 'Children'];
export const LAYOUT_PROPERTIES = ['systemId', 'layoutId', 'layoutName', 'children', 'location.isAllowed'];
export const LOCATION_SIMPLE_PROPERTIES = ['locationId'];

/**
 * オブジェクトリンク先取得用データ作成
 */
export function makeGetObjectLinkData(selectObject, isConvert) {
    const objectLink = omitObjectLinkData(selectObject);
    return objectLink ? { IsConvert: isConvert, SelectObject: objectLink } : null;
}

/**
 * オブジェクトリンク先情報省略
 */
function omitObjectLinkData(object, properties) {
    const pointProperties = _.get(properties, 'point', POINT_PROPERTIES);
    const locationProperties = _.get(properties, 'location', ['systemId', 'locationId', 'name', 'points']);
    const layoutProperties = _.get(properties, 'layout', ['systemId', 'layoutId', 'layoutName']);
    const egroupProperties = _.get(properties, 'egroup');
    let objectLink = { linkType: object.linkType};
    switch (object.linkType) {
        case LINK_TYPE.point:
            if (object.point) {
                objectLink.point = _.pick(object.point, pointProperties);
            }
            break;
        case LINK_TYPE.location:
            if (object.location) {
                let locationInfo = _.cloneDeep(object.location);
                locationInfo = _.pick(locationInfo, locationProperties);
                if (locationProperties.indexOf('points')) {
                    locationInfo.points = getPointListData(locationInfo.points);
                }
                objectLink.location = locationInfo;
            }
            break;
        case LINK_TYPE.layout:
            if (object.layout) {
                objectLink.layout = _.pick(object.layout, layoutProperties);
            }
            break;
        case LINK_TYPE.egroup:
            if (object.egroup) {
                objectLink.egroup = egroupProperties ?
                    _.pick(object.egroup, egroupProperties)
                    : getEgrouptMapData(_.cloneDeep(object.egroup))
            }
            break;
        default: break;
    }
    return objectLink;
}

/**
 * ツリー表示用のLayoutListを作成する
 */
export function makeLayoutTreeData(layouts, properties, locationProperties = null) {
    let omit = _.cloneDeep(layouts);
    omit = omitLayouts(omit, properties, locationProperties);
    return omit;
}

/**
 * Layout配列から不要な情報を削除する
 */
function omitLayouts(layouts, properties, locationProperties) {
    return layouts.map((layout) => {
        if (layout.children && layout.children.length > 0) {
            layout.children = omitLayouts(layout.children, properties, locationProperties);
        }   
        if (locationProperties && layout.location &&
            layout.location.children && layout.location.children.length > 0) {
            layout.location.children = omitSimpleLocations(layout.location.children, locationProperties);
        }
        return _.pick(layout, properties ? properties : LAYOUT_PROPERTIES);
    })
}

/**
 * Location配列から不要な情報を削除する（1階層のみ）
 */
function omitSimpleLocations(locations, properties) {
    return locations.map((location) => {
        return _.pick(location, properties ? properties : LOCATION_SIMPLE_PROPERTIES);
    })
}

/**
 * LayoutObjectから不要な情報を削除する
 */
function omitLayoutObject(layoutObject) {
    return Object.assign({}, layoutObject, omitObjectLinkData(layoutObject));
}

//#region 電源系統
/**
 * ツリー表示用の電源系統一覧情報を作成する（layoutObjectsを空にする）
 */
export function makeEgroupTreeData(egroups) {
    let omit = _.cloneDeep(egroups);
    omit = omitEgroups(omit);
    return omit;
}

/**
 * egroup配列から不要な情報を削除する
 */
function omitEgroups(egroups) {
    return egroups.map((egroup) => {
        if (egroup.children && egroup.children.length > 0) {
            egroup.children = omitEgroups(egroup.children);
        }
        return _.pick(egroup, ['systemId', 'egroupId', 'egroupName', 'children']);
    })
}

/**
 * egroupから分電盤図表示に必要な情報を取得する
 * @returns {object}　egroupオブジェクト
 */
export function getEgrouptMapData(egroup) {
    let omit = egroup;
    if (egroup) {
        let breakers = omit.breakers;
        let elecFacilities = omit.elecFacilities;
        breakers = breakers && breakers.map((breaker) => {
            breaker.points = getPointListData(breaker.points);
            breaker.egroup = _.pick(breaker.egroup, ["systemId", "egroupId", "egroupName", 'children']);
            breaker = _.pick(breaker, ['systemId', 'breakerName', 'breakerNo', 'position', 'points', 'egroup']);
            return breaker;
        });
        elecFacilities = elecFacilities && elecFacilities.map((facility) => {
            facility.point = getPointData(facility.point);
            return _.pick(facility, ['point', 'elementName', 'index']);
        });
        omit = omitEgroup(omit);
        omit.breakers = breakers;
        omit.elecFacilities = _.sortBy(elecFacilities, ['index']);  //ソートして保存する
    }
    return omit;
}

/**
 * egroupから不要な値を削除する
 */
function omitEgroup(egroup) {
    return _.pick(egroup, ["systemId", "egroupId", "egroupName", 'children']);
}

/**
 * マップ表示に必要なレイアウトオブジェクト情報を取得する
 */
export function makeMapLayoutObjectData(layoutObjects) {
    let omit = [];
    if (layoutObjects && layoutObjects.length > 0) {
        omit = _.cloneDeep(layoutObjects);
        omit = _.map(omit, ((object) => {
            return Object.assign({}, object, omitObjectLinkData(object));
        }))
    }
    return omit;
}

/**
 * マップ表示に必要なレイアウトオブジェクト情報を取得する
 */
export function omitLayoutObjects(layoutObjects, properties, linkProperties) {
    let omit = [];
    if (layoutObjects && layoutObjects.length > 0) {
        omit = _.cloneDeep(layoutObjects);
        omit = _.map(omit, ((object) => {
            if (properties) {
                object = _.pick(object, properties);
            }
            return Object.assign({}, object, omitObjectLinkData(object, linkProperties));
        }))
    }
    return omit;
}

/**
 * egroup配列から不要な情報を削除する(ブレーカー情報は残す)
 * @param {array} egroups 電源系統一覧
 */
export function omitEgroupWithBreaker(egroups){
    let omit = egroups &&  _.cloneDeep(egroups);
    if (omit) {
        omit = omit.map((egroup) => {
            if (egroup.breakers && egroup.breakers.length > 0) {
                egroup.breakers = omitBreakers(egroup.breakers);
            }
            if (egroup.children && egroup.children.length > 0) {
                egroup.children = omitEgroupWithBreaker(egroup.children);
            }
            return _.pick(egroup, ['systemId', 'egroupId', 'egroupName', 'dispIndex', 'children', 'breakers']);
        });
    }
    return omit;
}

/**
 * ブレーカー配列から不要な情報を削除する
 * @param {array} breakers ブレーカー一覧
 */
function omitBreakers(breakers) {
    return breakers.map((breaker) => {
        breaker.egroup = breaker.egroup && omitEgroup(breaker.egroup);
        breaker.connectedEgroup = breaker.connectedEgroup && omitEgroup(breaker.connectedEgroup);
        if (breaker.points && breaker.points.length > 0) {
            breaker.points = omitPoints(breaker.points);
        }
        return _.pick(breaker, ['systemId', 'egroup', 'breakerNo', 'breakerName', 'ratedCurrent' , 'ratedVoltage', 'breakerStatus', 'points', 'connectedEgroup']);
    });
}

/**
 * ポイント配列から不要な情報を削除する
 * @param {array} points ポイント一覧
 */
function omitPoints(points) {
    return points.map((point) => _.pick(point, ["systemId", "pointNo", "pointName"]));
}

//#endregion

//#region Location
/**
 * ロケーション情報を必要な情報のみにする
 */
export function omitLocation(location, properties) {
    const { isAllowed } = location;
    location = _.pick(location, properties ? properties : LOCATION_TREE_PROPERTIES);
    if (location.parent && properties && properties.indexOf('parent')) {
        location.parent = _.pick(location.parent, ["systemId", "locationId", "name", "parent"]);
    }
    location.icon = !isAllowed && 'fal fa-ban tree-node-allow';
    return location;
}

/**
 * ロケーションツリー表示に必要な情報のみにする
 */
export function makeLocationTreeData(locations, properties=null) {
    let omit = _.cloneDeep(locations);
    omit = omitLocationList(omit, properties);
    return omit;
}

/**
 * ロケーション一覧情報を必要な情報のみにする
 */
function omitLocationList(locations, properties) {
    return locations && locations.map((location) => {
        if (location.children && location.children.length > 0) {
            location.children = omitLocationList(location.children, properties);
        }
        return omitLocation(location, properties);
    })
}
//#endregion

//#region Unit関連
/**
 * UnitDispSettings配列を必要な情報のみにする
 */
export function omitUnitDispSettings(settings, properties) {
    const defaultProperties = ['dispSetId', 'frontDispData', 'rearDispData', 'position', 'size', 'status', 'hasAlarm', 'alarmName', 'units'];
    return settings && settings.map((data) => {
        data = _.pick(data, properties ? properties : defaultProperties);
        data.status = _.pick(data.status, ['color']);
        data.units = omitUnits(data.units);
        return data;
    })
}

/**
 * Unit配列を必要な情報のみにする
 */
export function omitUnits(units, properties) {
    return units && units.map((data) => {
        data = _.pick(data, properties ? properties : ['unitId', 'unitNo', 'name', 'point'] );
        if (data.point) {
            data.point = _.pick(data.point, ['pointNo']);
        }
        return data;
    })
}
//#endregion

//#region データレポート

/**
 * データレポートを必要な情報のみにする
 */
export function omitDataReport(reportResult) {
    let omit = _.cloneDeep(reportResult);
    if (omit) {
        omit.rows = omit.rows.map((row) => {
            if (row.cells && row.cells.length > 0) {
                row.cells = row.cells.map((cell) => _.pick(cell, ['value']));
            }
            return _.pick(row, ['cells', 'dataType.dtType']);
        })
    }
    return omit;

}

//#endregion

/**
 * ツリー表示に必要な情報のみにする
 */
export function makeTreeData(dataList, properties) {
    let omit = _.cloneDeep(dataList);
    omit = omitTreeData(omit, properties);
    return omit;
}

/**
 * ツリーデータリストを必要な情報のみにする
 */
function omitTreeData(dataList, properties) {
    return dataList && dataList.map((data) => {
        if (data.children && data.children.length > 0) {
            data.children = omitTreeData(data.children, properties);
        }
        return _.pick(data, properties);
    })
}

/**
 * データ配列を必要な情報のみにする
 */
export function omitList(dataList, properties) {
    return dataList && dataList.map((data) => {
        return _.pick(data, properties);
    })
}

/**
 * ツリーデータを必要な情報のみにする(親情報をたどっていく)
 */
export function omitTreeDataParent(data, properties) {
    if (data.parent) {
        data.parent = omitTreeDataParent(data.parent, properties);
    }
    return _.pick(data, properties);
}