/**
 * @license Copyright 2018 DENSO
 * 
 * UnitPanelのReducerを定義する。
 * ReducerはActionを受信してStateを更新する。
 * 
 * 注意点
 * ・引数で渡されたstateやactionそのものを変更してはいけません。
 * 　stateを変更するには、previousState を直接いじるのではなく、新しいオブジェクトを作成して返却します。
 * 
 */
'use strict';

import { combineReducers } from 'redux';

//Reducerで処理するAction名をインポート
import locationSelector from 'LocationSelector/reducer.js';
import authentication from 'Authentication/reducer.js';
import waitingInfo from 'WaitState/reducer.js';
import { SET_MASTERDATA, SET_UNITIMAGE, SET_LOGINUSER } from './actions.js'
import { SET_RACK, SET_DISPSETTING, SET_UNIT, CLEAR_RACK } from './actions.js'
import { SET_EDITING_UNIT, CHANGE_UNIT_OVERVIEW, CHANGE_UNIT_DETAIL, CHANGE_UNITPOWER, CHANGE_UNIT_LINK, CHANGE_UNIT_NETWORK,　CHANGE_DISPSETTING, APPLY_TEMPLATE } from './actions.js';
import { CHANGE_DISPSETTING_STATE, CHANGE_SELECTTEMPLATE_STATE, CHANGE_ADDTEMPLATE_STATE, CHANGE_CONFIRM_STATE, CHANGE_MESSAGE_STATE } from './actions.js'
import { CHANGE_REPORTOUTPUT_STATE, CHANGE_REPORTHISTORY_STATE, CHANGE_REPORTFORMAT_STATE } from './actions.js';
import { SET_EDITMODE, SET_LOADSTATE, SET_APPLAYTEMPLATE_STATE } from './actions.js';

import { convertDateTimeExtendedData, hasUnit } from 'assetUtility';

//Reducerの初期値を設定する。
const initialState = {    
    selectedRack: { 
        rackId: '',
        rackName: '',
        row: 0, 
        col: 0,
        weight:0,
        load:0,
        links: [],
        unitDispSettings: [],
        extendedPages: [],
        powers: [],
        comment: ''
    },
    selectedRackPowers: [],
    unitStatuses: [],
    unitTypes: [],
    networkConnectors: [],
    unitImages: [],
    selectedDispSetting: {
        dispSetId: '',
        frontDispData: {},
        rearDispData: {},
        isDsettingGroup: false,
        units: []
    },
    selectedUnit: {
        unitId: '',
        unitNo: 0,
        position: { x: 0, y: 0},
        size: { height: 1, width: 1 },
        name: '',
        weight: 0,
        portCount: 0,
        ratedPower: 0,
        extendedPages: [],
        links: [],
        unitPowers: [],
        ports: [],
        ipAddresses: [],
        comment: ''
    },
    editingUnit: null,
    editingDispSetting: {
        dispSetId: '',
        frontDispData: {},
        rearDispData: {},
        isDsettingGroup: false,
        units: []
    },
    invalid: {
        unit: false,
        extendedData: false,
        unitPower: false,
        links: false,
        network: false
    },
    isEditing: false,
    isLoading: false,
    modalInfo: {
        dispSetting: {
            show: false
        },
        selectTemplate: {
            show: false
        },
        addTemplate: {
            show: false
        },
        confirm: {
            show: false,
            title: '',
            message: '',
            attenstion: ''
        },
        message: {
            show: false,
            title: '',
            message: '',
            attenstion: ''
        },
        rackReportOutput: {
            show: false
        },
        rackReportHistory: {
            show: false
        },
        rackReportFormat: {
            show: false
        }
    },
    isApplyTemplate: false,
    loginUser: null
};

/********************************************
 * Actionの処理を行うReducer
 ********************************************/

/**
 * selectedRack(選択中のラック)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function selectedRack(state=initialState.selectedRack, action) {
    switch( action.type ) {

        case SET_RACK:
            var target = Object.assign({}, state, action.value );
            return target;

        case CLEAR_RACK:
            return initialState.selectedRack;

        default:
            return state;
    }
}

/**
 * selectedRackPowers(選択ラックのラック電源)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function selectedRackPowers(state=initialState.selectedRackPowers, action) {
    switch( action.type ) {

        case SET_RACK:
            const { unitDispSettings } = action.value;
            var powers =  action.value.powers ? action.value.powers.concat() : [];
            powers.forEach(power => {
                unitDispSettings.some((dispSetting) => {
                    dispSetting.units.some((unit) => {
                        if (unit.rackPower&&unit.rackPower.psNo === power.psNo) {
                            power.unitId = unit.unitId;             //ラック電源に使用しているユニットIDをプロパティに入れておく
                            return true;
                        }
                        return false;
                    })
                });
            });
            return powers;

        case CLEAR_RACK:
            return initialState.selectedRackPowers;

        default:
            return state;
    }
}

/**
 * selectedDispSetting(選択中のユニット表示設定)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function selectedDispSetting(state=initialState.selectedDispSetting, action) {
    switch( action.type ) {

        case SET_DISPSETTING:
            var target = Object.assign({}, state, action.value );
            return target;

        case SET_RACK:
        case CLEAR_RACK:
            return Object.assign({}, initialState.selectedDispSetting);     //ラックを選択すると選択をクリアする

        default:
            return state;
    }
}

/**
 * selectedUnit(選択中のユニット)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function selectedUnit(state=initialState.selectedUnit, action) {
    switch( action.type ) {

        case SET_UNIT:
            var target = action.value ? JSON.parse(JSON.stringify(action.value)) : initialState.selectedUnit;
            if (target) {
                target.extendedPages = convertDateTimeExtendedData(target.extendedPages);       //日付時刻のデータは変換する
            }
            return target;

        case SET_RACK:
        case CLEAR_RACK:
            return Object.assign({}, initialState.selectedUnit);     //ラックを選択すると選択をクリアする

        default:
            return state;
    }
}

/**
 * editingUnit(編集中のユニット)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function editingUnit(state=initialState.editingUnit, action) {
    switch( action.type ) {

        case SET_UNIT:                          //選択中ラック情報と編集中ラック情報も同じデータとする
        case SET_EDITING_UNIT:
            var targetUnit = action.value ? JSON.parse(JSON.stringify(action.value)) : initialState.editingUnit;        //ディープコピー
            if (targetUnit) {
                targetUnit.extendedPages = convertDateTimeExtendedData(targetUnit.extendedPages);       //日付時刻のデータは変換する
            }
            return targetUnit;

        case SET_RACK:
        case CLEAR_RACK:
            return Object.assign({}, initialState.editingUnit);     //ラックを選択すると選択をクリアする

        case CHANGE_UNIT_OVERVIEW:
            const unit = action.unit;
            return  Object.assign({}, state, { 
                            unitNo: unit.unitNo, 
                            type: unit.type && Object.assign({}, unit.type),
                            status: unit.status && Object.assign({}, unit.status),
                            name: unit.name, 
                            textColor: unit.textColor, 
                            backColor: unit.backColor, 
                            fontSize: unit.fontSize, 
                            frontUnitImage: unit.frontUnitImage ? Object.assign({}, unit.frontUnitImage) : null, 
                            rearUnitImage: unit.rearUnitImage ? Object.assign({}, unit.rearUnitImage) : null, 
                            position: unit.position && Object.assign({}, unit.position), 
                            size: unit.size && Object.assign({}, unit.size),
                            weight: unit.weight, 
                            ratedPower: unit.ratedPower, 
                            comment: unit.comment,
                            rackPower: unit.rackPower && JSON.parse(JSON.stringify(unit.rackPower))
                    });
        
        case CHANGE_UNIT_DETAIL:
            return  Object.assign({}, state, {
                        extendedPages: action.detailData.concat()
                    });
        
        case CHANGE_UNITPOWER:
            return  Object.assign({}, state, {
                        unitPowers:  action.powers.concat()
                    });

        case CHANGE_UNIT_LINK:
            return  Object.assign({}, state, {
                        links: action.links.concat()
                    });

        case CHANGE_UNIT_NETWORK:
            const key = action.key;
            var unit =  Object.assign({}, state);
            if (unit.hasOwnProperty(key)) {
                if (Array.isArray(unit[key])) {
                    unit[key] = action.network.concat();
                } else {
                    unit[key] = action.network;
                }
            }
            return unit;

        case APPLY_TEMPLATE:
            const template = action.template;
            return Object.assign({}, state, {
                size: { height: template.row, width: template.col },
                name: template.name,
                type: template.type && Object.assign({}, template.type),
                weight: template.weight,
                portCount: template.portCount,
                ratedPower: template.ratedPower,
                textColor: template.textColor ? template.textColor : state.textColor,
                backColor: template.backColor ? template.backColor : state.backColor,
                fontSize: template.fontSize ? template.fontSize : state.fontSize,
                frontUnitImage: template.frontUnitImage && Object.assign({}, template.frontUnitImage),
                rearUnitImage: template.rearUnitImage && Object.assign({}, template.rearUnitImage),
                extendedPages: convertDateTimeExtendedData(JSON.parse(JSON.stringify(template.extendedPages)))        //ディープコピー
            });

        default:
            return state;
    }
}

/**
 * 編集中の表示設定グループ
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function editingDispSetting (state=initialState.editingDispSetting, action) {
    switch( action.type ) {
        case SET_DISPSETTING:
            return JSON.parse(JSON.stringify(action.value));        //ディープコピー

        case SET_EDITING_UNIT:
            return JSON.parse(JSON.stringify(action.dispSetting));        //ディープコピー

        case CHANGE_DISPSETTING:
            return Object.assign({}, action.dispSetting);

            default:
        return state;
    }
}

/**
 * 編集時にマージする表示設定グループの配列
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function margingDispSettings (state=[], action) {
    switch( action.type ) {
        case SET_DISPSETTING:
        case SET_EDITING_UNIT:
            return [];

        case CHANGE_DISPSETTING:
            return action.margingDispSettings.concat();

            default:
        return state;
    }
}

/**
 * invalid(保存が無効かどうか)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function invalid(state=initialState.invalid, action){
    switch( action.type ) {

        case SET_UNIT:
        case SET_EDITING_UNIT:
            var invalid = Object.assign({}, state, initialState.invalid);     //ラックを読み込んだときはリセットする
            if (!hasUnit(action.value)) {
                invalid.unit = true;            //ユニットがない場合はユニット概要はエラー。
            }
            return invalid;        

        case CHANGE_UNIT_OVERVIEW:
            return Object.assign({}, state, {
                        unit: action.invalid
                    });
        
        case CHANGE_UNIT_DETAIL:
            return Object.assign({}, state, {
                        extendedData: action.invalid
                    });
        
        case CHANGE_UNITPOWER:
            return Object.assign({}, state, {
                        unitPower: action.invalid
                    });
        
        case CHANGE_UNIT_LINK:
            return Object.assign({}, state, {
                        links: action.invalid
                    });

        case CHANGE_UNIT_NETWORK:
            return Object.assign({}, state, {
                        network: action.invalid
                    });
        default:
            return state;
    }
}

/**
 * ユニットステータス一覧を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function unitStatuses(state=initialState.unitStatuses, action) {
    switch( action.type ) {

        case SET_MASTERDATA:
            return  Object.assign([], state, action.value.unitStatuses);

        default:
            return state;
    }

}

/**
 * ユニット種別一覧を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function unitTypes(state=initialState.unitTypes, action) {
    switch( action.type ) {

        case SET_MASTERDATA:
            return  Object.assign([], state, action.value.unitTypes);

        default:
            return state;
    }

}

/**
 * ネットワークコネクタ一覧を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function networkConnectors(state=initialState.networkConnectors, action) {
    switch( action.type ) {

        case SET_MASTERDATA:
            return  Object.assign([], state, action.value.networkConnectors);

        default:
            return state;
    }

}

/**
 * ユニット画像一覧を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function unitImages(state=initialState.unitImages, action) {
    switch( action.type ) {

        case SET_UNITIMAGE:
            return  Object.assign([], state, action.value);

        default:
            return state;
    }

}

/**
 * isEditing(編集中ステータス)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function isEditing(state=initialState.isEditing, action) {
    switch( action.type ) {

        case SET_EDITMODE:
            return action.value;

        default:
            return state;
    }

}

/**
 * isLoading(ロード中)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function isLoading(state=initialState.isLoading, action) {
    switch( action.type ) {

        case SET_LOADSTATE:
            return action.value;
            
        default:
            return state;
    }

}

/**
 * modalInfo(モーダル情報)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function modalInfo(state=initialState.modalInfo, action) {
    switch( action.type ) {

        case CHANGE_DISPSETTING_STATE: 
            return Object.assign({}, state, {
                dispSetting: {
                    show: action.value
                }
            });

        case CHANGE_SELECTTEMPLATE_STATE:
            return Object.assign({}, state, {
                selectTemplate: {
                    show: action.value
                }
            });

        case CHANGE_ADDTEMPLATE_STATE:
            return Object.assign({}, state, {
                addTemplate: {
                    show: action.value
                }
            });

        case CHANGE_CONFIRM_STATE:
            return Object.assign({}, state, {
                confirm: {
                    show: action.value,
                    title: action.title,
                    message: action.message,
                    attenstion: action.attenstion,
                    type: action.confirmType
                }
            });
            
        case CHANGE_MESSAGE_STATE:
            return Object.assign({}, state, {
                message: {
                    show: action.value,
                    title: action.title,
                    message: action.message,
                    callback: action.callback
                }
            });

        case CHANGE_REPORTOUTPUT_STATE:
            return Object.assign({}, state, {
                rackReportOutput: {
                    show: action.value
                }
            });

        case CHANGE_REPORTHISTORY_STATE:
            return Object.assign({}, state, {
                rackReportHistory: {
                    show: action.value
                }
            });

        case CHANGE_REPORTFORMAT_STATE:
            return Object.assign({}, state, {
                rackReportFormat: {
                    show: action.value
                }
            });

        default:
            return state;
    }

}

/**
 * テンプレート適用中フラグを更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function isApplyTemplate(state=initialState.isApplyTemplate, action) {
    switch( action.type ) {

        case SET_APPLAYTEMPLATE_STATE:
            return action.value

        case APPLY_TEMPLATE:
            return true;

        default:
            return state;
    }

}

/**
 * ログインユーザー情報
 * @param {any} state
 * @param {any} action
 */
function loginUser(state = initialState.loginUser, action) {
    switch (action.type) {
        case SET_LOGINUSER:
            return action.value;

        default:
            return state;
    }
}

//マスターデータのReducer
const masterInfo = combineReducers({
    unitStatuses,
    unitTypes,
    networkConnectors,
    unitImages
});

//使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    locationSelector,
    masterInfo,
    selectedRack,
    selectedRackPowers,
    selectedDispSetting,
    selectedUnit,
    editingUnit,
    editingDispSetting,
    margingDispSettings,
    invalid,
    isEditing,
    isLoading,
    modalInfo,
    isApplyTemplate,
    waitingInfo,
    loginUser
});

export default rootReducers;
