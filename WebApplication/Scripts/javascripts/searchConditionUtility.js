/**
 * @license Copyright 2018 DENSO
 * 
 * searchCondition関係のユーティリティ(searchConditionUtility.js)
 * 
 */

'use strict';

import { SEARCH_CONDITION_TARGET_NAME_LIST, PROJECT_TYPE_LIST } from 'constant';
import { FUNCTION_ID_MAP } from 'authentication';
import { isDate } from 'datetimeUtility';
import { sendData, EnumHttpMethod } from 'http-request';


/********************************************
 * 定数
 ********************************************/

/**
 * 検索条件の種別
 */
export const CONDITION_TYPE = {
    text: 0,
    number: 1,
    date: 2,
    choice: 3
}

/**
 * 文字列条件のオプション
 */
export const CONDITION_OPTION_TEXT = {
    partialMatch: 0         //部分一致
}

/**
 * 数値条件のオプション
 */
export const CONDITION_OPTION_NUMBER = {
    between: 1,             //次の値の間
    notbetween: 2,          //次の値の間以外
    equal: 3,               //次の値に等しい
    notequal: 4,            //次の値に等しくない
    greater: 5,             //次の値より大きい
    less: 6,                //次の値より小さい
    greaterOrequal: 7,      //次の値以上
    lessOrequal: 8          //次の値以下
}

/**
 * 日付条件のオプション
 */
export const CONDITION_OPTION_DATETIME = {
    fromToEnd: 9,            //期間
    daysToExpiration: 10,    //期限までの日数
    expired: 11              //期限切れ
}

/**
 * 選択肢条件のオプション
 */
export const CONDITION_OPTION_CHOICE = {
    match: 12,               //一致
    notmatch: 13             //不一致
}

/**
 * 検索条件の日付フォーマット
 */
export const DATE_FORMAT = 'YYYY/MM/DD';

/********************************************
 * API呼び出し
 ********************************************/

/**
 * 登録済み検索条件一覧を取得する
 * @param {number} functionId 機能ID
 * @param {function} callback コールバック関数
 */
export function getSearchConditionList(functionId, callback) {
    const sendingData = { functionId };
    sendData(EnumHttpMethod.post, '/api/searchCondition/getList', sendingData, (data, networkError) => {
        if (callback) {
            if (networkError) {
                callback(null, networkError);
            } else {
                callback(data, networkError);
            }
        }
    });
}

/********************************************
 * public関数
 ********************************************/

/**
 * searchConditionの初期状態を作成
 * @param {array} targets 検索条件ボックスで設定可能な対象
 * @returns {object} 検索条件
 */
export function createInitSearchCondition(targets) {
    const condition = { targets: [-1] };

    if (targets && Array.isArray(targets)) {
        targets.forEach((target) => {
            condition[target] = [];
        });
    }

    return condition;
}

/**
 * searchCondition（アセット条件入り）の初期状態を作成
 * @param {array} targets 検索条件ボックスで設定可能な対象
 * @returns {object} 検索条件
 */
export function createInitSearchConditionWithAsset(targets) {
    var condition = createInitSearchCondition(targets);
    condition.rackConditionItems = [];
    condition.unitConditionItems = [];
    return condition;
}

/**
 * searchConditionのアセット条件のみをクリアする
 * @param {object} conditon 元の検索条件
 * @returns {object} 検索条件
 */
export function clearSearchConditionAssetOnly(conditon) {
    if (conditon) {
        conditon.rackConditionItems = [];
        conditon.unitConditionItems = [];
    }
    return conditon;
}

/**
 * 編集中の検索条件を更新する
 * @param {object} conditon 元の検索条件
 * @param {array} targets 検索条件ボックスで設定可能な対象
 * @param {array} rackConditionItems ラックの検索条件
 * @param {array} unitConditionItems ユニットの検索条件
 */
export function updateAssetEditingCondition(condition, targets, rackConditionItems, unitConditionItems) {
    if (!condition) {
        condition = createInitSearchConditionWithAsset(targets);
    }
    condition.rackConditionItems = rackConditionItems ? Object.assign([], rackConditionItems) : [];
    condition.unitConditionItems = unitConditionItems ? Object.assign([], unitConditionItems) : [];
    return condition
}

/**
 * ハッシュタグ一覧とエラーを取得する
 * @param {string} text 元のテキスト
 * @returns {object} ハッシュタグ一覧とエラー  { hashTags, hasError }
    }
 */
export function getHashTagsAndError(text) {
    let strings = text.replace(/＃/g, '#').split(/,|\s+/);   // 全角ハッシュを半角に置換し空白または「,」で分割する
    strings = strings.filter((str) => str !== '');  // 空の文字列を除く
    const hashTags = strings.filter((str) => str.match(/^#[\wＡ-Ｚａ-ｚ０-９\u3041-\u3096\u30A1-\u30FA\u30FC\u3005\u3400-\u9FFF]+$/));
    const hasError = (strings.length !== hashTags.length) || text.length > 100;    // ハッシュタグにエラーがあるか
    return {
        hashTags,
        hasError
    };
}

/**
 * 検索に必要のない余分な情報を消去する
 * @param {any} condition
 */
export function removeExtraInformation(condition) {
    const obj = Object.assign({}, condition);
    if (obj.locations) {
        obj.locations = obj.locations.map((loc) => ({
            systemId: loc.systemId,
            locationId: loc.locationId
        }));
    }
    if (obj.enterprises) {
        obj.enterprises = obj.enterprises.map((ent) => ({
            systemId: ent.systemId,
            enterpriseId: ent.enterpriseId
        }));
    }
    if (obj.tags) {
        obj.tags = obj.tags.map((tag) => ({
            systemId: tag.systemId,
            tagId: tag.tagId
        }));
    }
    if (obj.egroups) {
        obj.egroups = obj.egroups.map((egroup) => ({
            systemId: egroup.systemId,
            egroupId: egroup.egroupId
        }));
    }
    if (obj.loginUsers) {
        obj.loginUsers = obj.loginUsers.map((user) => ({
            systemId: user.systemId,
            userId: user.userId
        }));
    }
    return obj;
}

/**
 * 検索条件のうち、固定検索条件項目の検索条件を日本語化した構造を返す
 * @param {any} lookUp
 * @param {any} searchCondition
 * @param {string} separator
 *
 */
export function getSearchConditionTextStructure(lookUp, searchCondition, separator= ' / ') {
    const targetNameTable = {
        locations: {
            label: SEARCH_CONDITION_TARGET_NAME_LIST.locations,
            lookUp: true,
            queryMethod: {
                search: item => item.locationId,
                match: item => item.locationId
            },
            hierarchy: {
                separator: ' '
            }
        },
        enterprises: {
            label: SEARCH_CONDITION_TARGET_NAME_LIST.enterprises,
            lookUp: true,
            queryMethod: {
                search: item => item.enterpriseId,
                match: item => item.enterpriseId,
                name: item => item.enterpriseName
            }
        },
        loginUsers: {
            label: SEARCH_CONDITION_TARGET_NAME_LIST.loginUsers,
            lookUp: true,
            queryMethod: {
                search: item => item.userId,
                match: item => item.userId,
                name: item => item.userName
            },
        },
        tags: {
            label: SEARCH_CONDITION_TARGET_NAME_LIST.tags,
            lookUp: true,
            queryMethod: {
                search: item => item.tagId,
                match: item => item.tagId
            }
        },
        egroups: {
            label: SEARCH_CONDITION_TARGET_NAME_LIST.egroups,
            lookUp: true,
            queryMethod: {
                search: item => item.egroupId,
                match: item => item.egroupId,
                name: item => item.egroupName
            }
        },
        hashTags: {
            label: SEARCH_CONDITION_TARGET_NAME_LIST.hashTags,
            lookUp: false
        },
        icTerminals: {
            label: SEARCH_CONDITION_TARGET_NAME_LIST.icTerminals,
            lookUp: true,
            queryMethod: {
                search: item => item.termNo,
                match: item => item.termNo,
                name: item => item.termName
            }
        }
    };

    // lookUp から選択された文言を抽出する関数
    const getNames = (lookUpList, searchValues, mapper, prefix = '') => {
        return lookUpList.reduce((acc, val) => {
            let nameList = [];
            const name = prefix + (mapper.queryMethod.name ? mapper.queryMethod.name(val) : val.name);
            if (searchValues.includes(mapper.queryMethod.match(val))) {
                nameList.push(name);
            }
            if (val.children && val.children.length) {
                nameList = nameList.concat(getNames(val.children, searchValues, mapper, mapper.hierarchy ? name + mapper.hierarchy.separator : ''));
            }
            return acc.concat(nameList);
        }, []);
    };

    const conditionTextStructure = [];
    searchCondition.targets.forEach(target => {
        let valueText = '';
        if (targetNameTable.hasOwnProperty(target) && searchCondition.hasOwnProperty(target)) {
            const mapper = targetNameTable[target];
            if (mapper.lookUp) {
                if (lookUp.hasOwnProperty(target)) {
                    const condition = searchCondition[target];
                    const searchValues = condition ? condition.map(item => mapper.queryMethod.search(item)) : [];
                    valueText = getNames(lookUp[target], searchValues, mapper).join(' / ');
                }
            } else {
                valueText = Array.isArray(searchCondition[target]) ? searchCondition[target].join(' / ') : searchCondition[target];
            }
            if (valueText !== '') {
                conditionTextStructure.push({
                    label: mapper.label,
                    value: valueText
                });
            }
        } else if (SEARCH_CONDITION_TARGET_NAME_LIST.hasOwnProperty(target) && searchCondition[target]) {
            valueText = Array.isArray(searchCondition[target]) ? searchCondition[target].join(' / ') : searchCondition[target];            
            if (valueText !== '') {
                conditionTextStructure.push({
                    label: SEARCH_CONDITION_TARGET_NAME_LIST[target],
                    value: valueText
                });
            }
        }
    });
    return conditionTextStructure;

}

/**
 * 検索条件を日本語化した構造を、単一の複数行文字列に結合したものに変換して返す
 *
 * @param {any} structure
 */
export function getSearchConditionString(structure) {
    return structure
        .map(item => (item.label ? item.label + ' : ' : '') + item.value)
        .join("\n");
}

/**
 * 検索条件ボックスで設定可能な対象のみに絞り込む
 * @param {object} condition 対象の検索条件
 * @param {array} searchConditionTypes 検索条件ボックスで設定可能な対象
 * @param {boolean} changeAllowLocations 操作可能ラックに変更するか
 * @returns {object} 検索条件
 */
export function filterSearchCondition(condition, searchConditionTypes) {
    for (let key of Object.keys(condition)) {
        if (searchConditionTypes.indexOf(key) < 0 && key !== 'targets') {
            if (key.endsWith('Text') || key === 'hashTagString' || key === 'hashTagError') {
                continue;
            }
            if (key !== 'locations' || searchConditionTypes.indexOf('allowLocations') < 0) {                    
                condition[key] = [];

                const plainTextKey = key.replace(/s?$/, 'Text');
                if (condition.hasOwnProperty(plainTextKey)) {
                    condition[plainTextKey] = '';
                }

                if (key === 'hashTags') {                     
                    condition.hashTagString = '';
                    condition.hashTagError = false;
                }
            }
        }
    }
    condition.targets = condition.targets.filter(target => searchConditionTypes.indexOf(target) >= 0 || target === -1);
    condition.targets.length === 0 && condition.targets.push(-1);
    return condition;
}

/**
 *検索条件名：ロケーション⇔操作可能ラックに変換
 * @param {object} targets 選択中の検索条件一覧
 * @param {boolean} changeAllowLocations 操作可能ラックに変更するか
 * @returns {object} 検索条件
 */
export function replaceLocationConditionTargets (targets, changeAllowLocations) {    
    const index = targets.findIndex((target) => (target === 'locations' || target === 'allowLocations'));
    if (index >= 0) {
        changeAllowLocations && targets.splice(index, 1, 'allowLocations');
        !changeAllowLocations && targets.splice(index, 1, 'locations');
    }
    return targets;
}

//#region 検索条件保存関連

/**
 * targetsで削除された検索条件がないかチェックする
 * @param {array} targets 条件に指定されているtargets
 * @param {array} allTargets 全てのtargets
 */
export function checkExistTargets(targets, allTargets) {
    let isError = isError = targets.every((target) => { return target === -1 && allTargets.some((t) => t === target)});
    return {
        isSuccess: !isError,
        message: isError && '削除されている検索条件があるため、適用できません。'
    };
}

/**
 * 検索条件の固定検索条件項目の検索条件をチェックする
 * @param {any} lookUp ルックアップ
 * @param {any} searchCondition 検索条件
 *
 */
 export function checkSearchCondition(lookUp, searchCondition) {
    const lookUpTable = {
        locations: {
            lookUp: true,
            patchCable: false,
            queryMethod: {
                search: item => item.locationId,
                match: item => item.locationId
            }
        },
        patchboardTypes: {
            lookUp: true,
            patchCable: false,
            queryMethod: {
                search: item => item.typeId,
                match: item => item.typeId
            }
        },
        patchCableTypes: {
            lookUp: true,
            patchCable: false,
            queryMethod: {
                search: item => item.id,
                match: item => item.id
            },
        },
        projectTypes: {
            lookUp: true,
            patchCable: false,
            queryMethod: {
                search: item => item.typeId,
                match: item => item.typeId
            }
        },
        lineTypes: {
            lookUp: true,
            patchCable: false,
            queryMethod: {
                search: item => item.typeId,
                match: item => item.typeId
            }
        },
        idfConnects: {
            lookUp: true,
            patchCable: true,
            queryMethod: {
                search: item => { return { patchboardId: item.patchboardId, no: item.no  }},
                match: (patchboardId, no) => { return { patchboardId, no }}
            }
        },
        inConnects: {
            lookUp: true,
            patchCable: true,
            queryMethod: {
                search: item => { return { patchboardId: item.patchboardId, no: item.no  }},
                match: (patchboardId, no) => { return { patchboardId, no }}
            }
        },
        relConnects: {
            lookUp: true,
            patchCable: true,
            queryMethod: {
                search: item => { return { patchboardId: item.patchboardId, no: item.no  }},
                match: (patchboardId, no) => { return { patchboardId, no }}
            }
        },
        patchboardNames: {
            lookUp: false,
            patchCable: false
        },
        projectNos: {
            lookUp: false,
            patchCable: false
        },
        lineNames: {
            lookUp: false,
            patchCable: false
        },
        lineIds: {
            lookUp: false,
            patchCable: false
        },
        userNames: {
            lookUp: false,
            patchCable: false
        },
        memos: {
            lookUp: false,
            patchCable: false
        }
    };

    // mapper.lookUp=tureのチェック
    const checkSearchValues = (lookUpList, searchValues, mapper) => {
        return searchValues.every((val) => {
            let isSuccess;
            if (mapper.patchCable) {
                isSuccess = checkExistPatchCables(lookUpList, val, mapper);
            } else {
                isSuccess = checkExistLookUp(lookUpList, val, mapper);
            }
            return isSuccess
        });
    }

    // lookUp に存在するか
    const checkExistLookUp = (lookUpList, searchValue, mapper) => {
        return lookUpList.some((val) => {
            const source = mapper.queryMethod.match(val);
            let isExist = _.isEqual(searchValue, source);
            if (!isExist && val.children && val.children.length) {
                isExist = checkExistLookUp(val.children, searchValue, mapper);
            }
            return isExist;
        });
    };
    
    // lookUp.XXXPatchCables に存在するか
    const checkExistPatchCables = (PatchCablesList, searchValue, mapper) => {
        return PatchCablesList.some((val) => {
            if (searchValue.no === null) {      //no===nullはすべてを選択したとき
                const source = mapper.queryMethod.match(val.patchboardId, null);
                return _.isEqual(searchValue, source) && val.cableNos.length > 0;
            } else {
                return val.cableNos.some((cableNo) => {
                    const source = mapper.queryMethod.match(val.patchboardId, cableNo.no);
                    return _.isEqual(searchValue, source);
                });
            }
        });
    };

    //固定項目条件の文字列条件のチェック
    const checkTextCondtion = (key, targetArray, condition) => {
        var isError = true;
        const plainTextKey = key.replace(/s?$/, 'Text');        //XXXXX または末尾が s で終わる複数形 XXXXXs から XXXXXText を生成する
        
        //XXXXXTextが存在するか / XXXXXText と XXXXXの配列 の中身が同じか
        if (condition.hasOwnProperty(plainTextKey)) {
            let plainText = condition[plainTextKey];
            const textArray = getStringArray(plainText);
            isError = !targetArray.some((text) => { return typeof text === 'string' && textArray.includes(text)});            
            isError = isError || !textArray.some((text) => targetArray.some((t) => typeof t === 'string' && t === text));
        }
        return !isError;
    }


    var result = { isSuccess: true, message: null };
    lookUp.projectTypes = PROJECT_TYPE_LIST;
    
    searchCondition.targets.some(target => {
        if (lookUpTable.hasOwnProperty(target) && searchCondition.hasOwnProperty(target)) {
            const mapper = lookUpTable[target];
            if (mapper.lookUp) {
                if (lookUp.hasOwnProperty(target) || target === 'relConnects') {
                    const lookUpList = (target === 'relConnects') ? lookUp.idfConnects : lookUp[target];
                    const condition = searchCondition[target];
                    const searchValues = condition.map(item => mapper.queryMethod.search(item));
                    result.isSuccess = checkSearchValues(lookUpList, searchValues, mapper);
                    result.message = !result.isSuccess && `削除された${SEARCH_CONDITION_TARGET_NAME_LIST[target]}が含まれているため、適用できません。` ;
                } else {
                    result.isSuccess = false;
                }
            } else {                
                result.isSuccess = checkTextCondtion(target, searchCondition[target], searchCondition);
            }

            if (!(result.isSuccess || result.message)) {
                result.message = `${SEARCH_CONDITION_TARGET_NAME_LIST[target]}条件が不正のため、適用できません。`;   
            }                     
        } else {
            if (target !== -1) {
                result =  { isSuccess: false, message: '検索条件が不正のため、適用できません。' };
            } else {
                result = { isSuccess: true };
            }
        }
        return !result.isSuccess;
    });
    return result;

}

/**
 * 詳細項目条件のチェック
 * @param {any} lookUp ルックアップ
 * @param {any} searchCondition 検索条件
 */
export function checkConditionItems(lookUp, searchCondition) {
    const lookUpTable = {
        projectConditionItems: {
            queryMethod: {
                search: item => item.conditionId,
                match: item => item.conditionId,
            }
        },
        patchCableConditionItems: {
            queryMethod: {
                search: item => item.conditionId,
                match: item => item.conditionId
            }
        },
        patchboardConditionItems: {
            queryMethod: {
                search: item => item.conditionId,
                match: item => item.conditionId
            }
        }

    };
    // lookUp.XXXConditionItems に存在するか
    const checkExistConditionItems = (lookUpList, searchValues, mapper) => {
        const conditionItems = lookUpList.map((val) => mapper.queryMethod.match(val));
        return searchValues.every((val) => {
            return conditionItems.includes(val);
        });
    };

    //詳細項目条件の検証
    const validateConditionItems = (lookUpList, conditions) => {
        var result = { isSuccess: true, message: null };
        conditions.some((val) => {
            const lookUpItem = lookUpList.find(c => c.conditionId === val.conditionId);
            if (lookUpItem) {
                if (val.type !== lookUpItem.type) {
                    result.isSuccess = false;
                    result.message = !result.isSuccess && `${lookUpItem.name}の種別が変更となっため、適用できません。` ;
                } else if (val.type === CONDITION_TYPE.date && val.alarm !== lookUpItem.alarm && !lookUpItem.alarm) {
                    result.isSuccess = (val.option == CONDITION_OPTION_DATETIME.fromToEnd);
                    result.message = !result.isSuccess && `${lookUpItem.name}が未監視状態に変更となったため、適用できません。` ;
                } else if (val.type === CONDITION_TYPE.choice) {   
                    const choices = lookUpItem.choices.map(c => c.choiceNo);
                    result.isSuccess = choices.includes(val.value);
                    result.message = !result.isSuccess && `${lookUpItem.name}の選択肢が削除されたため、適用できません。` ;
                }
            }
            return !result.isSuccess;
        });
        return result;
    }


    var result = { isSuccess: true, message: null };
    Object.keys(lookUpTable).some(key => {
        if (lookUp.hasOwnProperty(key) && searchCondition.hasOwnProperty(key)) {
            const mapper = lookUpTable[key];
            const conditions = searchCondition[key];
            if (conditions) {
                const searchValues = conditions.map(item => mapper.queryMethod.search(item));
                result.isSuccess = checkExistConditionItems(lookUp[key], searchValues, mapper);
                result.message = !result.isSuccess && `無効もしくは検索対象外となった詳細項目が含まれているため、適用できません。` ;
    
                if (result.isSuccess) {
                    result = validateConditionItems(lookUp[key], conditions);
                }
            }
            return !result.isSuccess;
        }
    });

    return result;
}

/**
 * boolean型の検索条件をチェックする
 * @param {any} searchCondition 検索条件
 * @param {number} functionId 機能番号
 */
export function  checkBooleanCondition(searchCondition, functionId) {
    const booleanTable = {
        inUseOnly: {
            functionIds: [ FUNCTION_ID_MAP.line ],
            name: '未使用を除く'
        },
        isExcludeMisReg: {
            functionIds:  [ FUNCTION_ID_MAP.lineConnectionLog ],
            name: '誤登録を除く'
        },
        dateSpecified: {
            functionIds: [ FUNCTION_ID_MAP.lineConnectionLog ],
            name: '期間を指定しない'
        }
    }

    var result = { isSuccess: true, message: null };
    Object.keys(booleanTable).some((key) => {
        if (booleanTable[key].functionIds.includes(functionId)) {
            if (searchCondition.hasOwnProperty(key)) {
                result.isSuccess = (typeof searchCondition[key] === 'boolean' );
            } else {
                result.isSuccess = false;   //取得した検索条件にはないのはおかしい
            }
            result.message = !result.isSuccess && `${booleanTable[key].name}条件が不正のため、適用できません。` ;
        }
        return !result.isSuccess;
    })
    
    return result;
}

/**
 * DateTime型の検索条件をチェックする
 * @param {any} searchCondition 検索条件
 * @param {number} functionId 機能番号
 */
export function checkDateCondition(searchCondition, functionId) {
    const dateTable = {
        dateFrom: {
            functionIds: [ FUNCTION_ID_MAP.lineConnectionLog ],
            name: '期間開始日'
        },
        dateTo: {
            functionIds: [ FUNCTION_ID_MAP.lineConnectionLog ],
            name: '期間終了日'
        }
    }

    var result = { isSuccess: true, message: null };
    Object.keys(dateTable).some((key) => {
        if (dateTable[key].functionIds.includes(functionId)) {
            if (searchCondition.hasOwnProperty(key)) {
                if (searchCondition.dateSpecified || searchCondition.dateSpecified === undefined) {
                    result.isSuccess = searchCondition[key] ? isDate(searchCondition[key], DATE_FORMAT) : false;
                } else {
                    result.isSuccess = true
                }
            } else {
                //取得した検索条件にないのはおかしい（期間を指定しない場合true）
                if (searchCondition.dateSpecified === undefined) {
                    result.isSuccess = true; 
                } else {
                    result.isSuccess = !(searchCondition.dateSpecified);
                }
            }  
            result.message = !result.isSuccess && `${dateTable[key].name}条件が不正のため、適用できません。` ;
        }          
        return !result.isSuccess;
    })

    return result;
}


/**
 * テキストを文字列の配列に分割する
 * @param {any} text
 */
export function getStringArray(text) {
    const strings = text.split(/,|\s+/);   // 空白または「,」で文字列を分割する
    return strings.filter((str) => str !== '');  // 空の文字列を除く
}

/**
 * 詳細情報の日付時刻型をmoment型に変換する
 * @param {array} items 詳細項目検索条件リスト 
 * @returns {array} 変換後の詳細項目検索条件リス
 */
export function convertDateTimeConditionItems(items){
    return items.map((item) => {
        if (item.type === CONDITION_TYPE.date) {
            item.valueFrom = item.valueFrom && moment(item.valueFrom);
            item.valueTo = item.valueTo && moment(item.valueTo);
        }
        return item;
    });
}

/**
 * 検索条件有無チェック
 * @param {object} searchCondition 検索条件
 * @returns 
 */
export function hasConditions(searchCondition) {
    const conditionItemsKeys = [ 'projectConditionItems', 'patchCableConditionItems', 'patchboardConditionItems' ];
    const boolConditionKeys = [ 'inUseOnly', 'isExcludeMisReg' ];
    const dateConditionKeys = [ 'dateFrom', 'dateTo' ];

    //固定項目
    var hasConditions = searchCondition.targets.some(target => {
        return (
            searchCondition.hasOwnProperty(target) &&
            searchCondition[target] &&
            searchCondition[target].length > 0        
        );
    });

    //詳細項目
    hasConditions = hasConditions || conditionItemsKeys.some((key) => {
        return (
            searchCondition.hasOwnProperty(key) &&
            searchCondition[key] &&
            searchCondition[key].length > 0        
        );
    });
    
    //スイッチ等のBool型
    hasConditions = hasConditions || boolConditionKeys.some((key) => {
        return (
            searchCondition.hasOwnProperty(key) &&
            (searchCondition[key] !== 'undefined' && searchCondition[key] !== null)
        );
    });

    //日付型
    const dateSpecified = searchCondition.dateSpecified && (searchCondition.dateSpecified === 'undefined' || searchCondition.dateSpecified === null); 
    return hasConditions || (dateSpecified && dateConditionKeys.some((key) => {
        return (
            searchCondition.hasOwnProperty(key) &&
            (searchCondition[key] !== 'undefined' && searchCondition[key] !== null)
        );
    }));
    
} 

//#endregion