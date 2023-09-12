/**
 * @license Copyright 2019 DENSO
 * 
 * レポートスケジュールのユーティリティ(reportScheduleUtility.js)
 * 
 */

'use strict';

import { VALUE_TYPE, REPORT_OUTPUT_TYPE } from 'constant';
import { createInitSearchCondition } from 'searchConditionUtility';
export const SEARCH_CONDITION_TYPES = ['locations', 'enterprises', 'tags', 'egroups' ];

/**
 * 空のレポートスケジュールを取得する
 */
export function getEmptyReportSchedule() {
    return {
        reportScheduleId:-1,
        enterpriseId: null,
        enterpriseName: null,
        scheduleName: '',
        outputFileName:'',
        valueType: VALUE_TYPE.realTime,
        outputType: REPORT_OUTPUT_TYPE.daily,
        outputStartDay: null,
        outputEndDay:  null,
        recordInterval: null,
        summaryType: null,
        isConvert: false ,
        isInvalid: false
    }
}

/**
 * 空の検索条件を取得する
 * @param {array} dataTypes データ種別
 */
export function getEmptyCondition(dataTypes) {
    var condition = createInitSearchCondition(SEARCH_CONDITION_TYPES);
    condition.dataTypes = dataTypes && dataTypes.map((type) => _.pick(type, ['dtType', 'name']));
    return condition;
}

/**
 * レポートスケジュールからLookUp型に変更する
 * @param {object} schedule スケジュール情報
 */
export function convertReportScheduleToLookUp(schedule) {
    const { locationConditions, enterpriseConditions, tagConditions, egroupConditions, dataTypeConditions } = schedule;
    var condition = {
        locations: locationConditions && _.cloneDeep(locationConditions),
        enterprises: enterpriseConditions && _.cloneDeep(enterpriseConditions),
        tags: tagConditions && _.cloneDeep(tagConditions),
        egroups: egroupConditions && _.cloneDeep(egroupConditions),
        dataTypes: dataTypeConditions && _.cloneDeep(dataTypeConditions)
    };
    condition = omitSearchCondition(condition);
    condition.targets = getSearchConditionTargets(condition);
    return condition;
}

/**
 * 検索条件のターゲットを取得する
 * @param {*} condition 
 */
function getSearchConditionTargets(condition) {
    var targets = [];
    SEARCH_CONDITION_TYPES.forEach((target) => {
        if (condition[target] && condition[target].length > 0) {
            targets.push(target);
        }
    });    
    return targets
}

/**
 * 検索条件の省略
 * @param {*} condition 元の検索条件
 */
export function omitSearchCondition(condition) {
    const omitData = _.cloneDeep(condition);
    if (omitData.locations) {
        omitData.locations = omitLocationConditions(omitData.locations);
    }
    if (omitData.enterprises) {
        omitData.enterprises = omitEnterprisesConditions(omitData.enterprises)
    }
    if (omitData.tags) {
        omitData.tags = omitTagsConditions(omitData.tags);
    }
    if (omitData.egroups) {
        omitData.egroups = omitEgroupsConditions(omitData.egroups);
    }
    if (omitData.dataTypes) {
        omitData.dataTypes = omitDataTypesConditions(omitData.dataTypes);
    }
    return omitData;
}

/**
 * レポートスケジュールの検索条件を省略
 * @param {object} beforeSchedule 変更前のスケジュール
 * @param {object} condition 検索条件
 */
export function omitReportScheduleCondtion(beforeSchedule, condition) {
    const { locations, enterprises, tags, egroups, dataTypes } = condition;
    const schedule = _.cloneDeep(beforeSchedule);
    return Object.assign({}, schedule, {
        locationConditions: locations && locations.map((item) => _.pick(item, ['systemId', 'locationId', 'name', 'dispIndex', 'level'])),
        enterpriseConditions:enterprises && omitEnterprisesConditions(enterprises),
        tagConditions: tags && omitTagsConditions(tags),
        egroupConditions: egroups && omitEgroupsConditions(egroups),
        dataTypeConditions: dataTypes && omitDataTypesConditions(dataTypes)
    });
}

/**
 * レポートスケジュールで必要ない情報を省略
 * @param {*} schedule 
 */
export function omitReportSchedule(schedule) {
    const omitSchedule = _.cloneDeep(schedule);
    const { locationConditions, enterpriseConditions, tagConditions, egroupConditions, dataTypeConditions } = omitSchedule;
    return Object.assign({}, omitSchedule, {
        locationConditions: locationConditions && locationConditions.map((item) => _.pick(item, ['systemId', 'locationId', 'name', 'dispIndex', 'level'])),
        enterpriseConditions:enterpriseConditions && omitEnterprisesConditions(enterpriseConditions),
        tagConditions: tagConditions && omitTagsConditions(tagConditions),
        egroupConditions: egroupConditions && omitEgroupsConditions(egroupConditions),
        dataTypeConditions: dataTypeConditions && omitDataTypesConditions(dataTypeConditions)
    });
}

/**
 * ロケーション条件の省略
 * @param {array} conditions 条件
 */
function omitLocationConditions(conditions) {
    return conditions.map((item) => {
        item = _.pick(item, ['systemId', 'locationId', 'name', 'dispIndex', 'level', 'parent']);
        if (item.parent) {
            item.parent = omitLocationParent(item.parent);
        }
        return item;
    })
}

/**
 * 親ロケーションの省略
 * @param {object} location ロケーション情報
 */
function omitLocationParent(location) {
    location = _.pick(location, ['systemId', 'name','parent']);
    if (location.parent) {
        location.parent = omitLocationParent(location.parent);
    }
    return location;
}

/**
 * 所属検索条件の省略
 * @param {array} conditions 条件
 */
function omitEnterprisesConditions(conditons) {
    return conditons.map((item) => _.pick(item, ['systemSet.systemId', 'enterpriseId', 'enterpriseName']));
}

/**
 * タグ検索条件の省略
 * @param {array} conditions 条件
 */
function omitTagsConditions(conditons) {
    return conditons.map((item) => _.pick(item, ['systemId', 'tagId', 'name']));
}

/**
 * 電源系統条件の省略
 * @param {array} conditions 条件
 */
function omitEgroupsConditions(conditons) {
    return conditons.map((item) =>  _.pick(item, ['systemId', 'egroupId', 'egroupName']));
}

/**
 * データ種別条件の省略
 * @param {array} conditions 条件
 */
function omitDataTypesConditions(conditons) {
    return conditons.map((item) =>  _.pick(item, ['systemId', 'dtType', 'name']));
}