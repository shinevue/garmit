/**
 * @license Copyright 2017 DENSO
 * 
 * RackPanelのReducerを定義する。
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
import searchCondition from 'SearchCondition/reducer.js';
import authentication from 'Authentication/reducer.js';
import waitingInfo from 'WaitState/reducer.js';
import { SET_MASTERDATA, SET_RACK, SET_RACKPOWER_VALUES, CLEAR_RACK, SET_LOGINUSER } from './actions.js';
import { SET_EDITING_RACK, CHANGE_RACK_OVERVIEW, CHANGE_RACK_DETAIL, CHANGE_RACKPOWER, CHANGE_RACK_LINK, APPLY_TEMPLATE } from './actions.js';
import { CHANGE_SELECTTEMPLATE_STATE, CHANGE_ADDTEMPLATE_STATE, CHANGE_DELETEMESSAGE_STATE, CHANGE_MESSAGE_STATE, CHANGE_CONFIRM_STATE } from './actions.js';
import { CHANGE_REPORTOUTPUT_STATE, CHANGE_REPORTHISTORY_STATE, CHANGE_REPORTFORMAT_STATE } from './actions.js';
import { SET_EDITMODE, SET_LOADSTATE, SET_LOADSTATE_RACK, SET_LOADSTATE_POWERBAR, SET_APPLAYTEMPLATE_STATE } from './actions.js';

import { convertDateTimeExtendedData, hasRack, hasRackView, makeEditingRack } from 'assetUtility';
import { MESSAGEMODAL_BUTTON } from 'constant';

//Reducerの初期値を設定する。
const initialState = {    
    rackStatuses: [],
    rackTypes: [],
    connectors: [],
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
    editingRack: null,
    rackPowerValues: [],
    invalid: {
        rack: false,
        extendedData: false,
        rackPower: false,
        links: false
    },
    isEditing: false,
    isLoading: {
        rack: false,
        powerBar: false
    },
    modalInfo: {
        selectTemplate: {
            show: false
        },
        addTemplate: {
            show: false
        },
        delete: {
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
        confirm: {
            show: false,
            title: '',
            message: '',
            type: MESSAGEMODAL_BUTTON.confirm
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
            var target = Object.assign({}, action.value);
            target.extendedPages = convertDateTimeExtendedData(target.extendedPages);       //日付時刻のデータは変換する
            return target;

        case CLEAR_RACK:
            return initialState.selectedRack; 

        default:
            return state;
    }
}

/**
 * editingRack(編集中のラック)を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function editingRack(state=initialState.editingRack, action) {
    switch( action.type ) {

        case SET_RACK:                          //選択中ラック情報と編集中ラック情報も同じデータとする
        case SET_EDITING_RACK:
            return makeEditingRack(action.value);

        case CLEAR_RACK:
            return initialState.editingRack; 

        case CHANGE_RACK_OVERVIEW:
            const rack = action.rack;
            return  Object.assign({}, state, { 
                            comment: rack.comment,
                            row: rack.row,
                            col: rack.col,
                            load: rack.load,
                            weight: rack.weight,
                            loadGraphAddWeight: rack.loadGraphAddWeight,
                            status: rack.status && Object.assign({}, rack.status),
                            type: rack.type && Object.assign({}, rack.type)
                    });
        
        case CHANGE_RACK_DETAIL:
            return  Object.assign({}, state, {
                        extendedPages: action.detailData.concat()
                    });
        
        case CHANGE_RACKPOWER:
            return  Object.assign({}, state, {
                        powers:  action.powers.concat()
                    });

        case CHANGE_RACK_LINK:
            return  Object.assign({}, state, {
                        links: action.links.concat()
                    });

        case APPLY_TEMPLATE:
            const template = action.template;
            return Object.assign({}, state, {
                row: template.row,
                col: template.col,
                load: template.load,
                weight: template.weight,
                status: template.status && Object.assign({}, template.status),
                type: template.type && Object.assign({}, template.type),
                extendedPages: convertDateTimeExtendedData(JSON.parse(JSON.stringify(template.extendedPages)))        //ディープコピー
            });
        default:
            return state;
    }
}

/**
 * rackPowerValues（ラック電源の使用状況）を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function rackPowerValues(state=initialState.rackPowerValues, action) {
    switch( action.type ) {

        case SET_RACK:
            const powers = Object.assign([], action.value.powers);
            var graphSets = [];

            powers.forEach(item => {
                graphSets.push({ 
                                    rackId: item.rackId, 
                                    psNo: item.psNo,
                                    powerName: item.name + '(' + item.ratedVoltage.toFixed(0) + 'V' + item.ratedCurrent.toFixed(0) + 'A)'
                                 });
            })

            return graphSets;

        case SET_RACKPOWER_VALUES:
            var graphSets = Object.assign([], state);            
            return  graphSets.map((graph) => {
                        var powerValue = action.value.find((item) => item.rackId == graph.rackId && item.psNo === graph.psNo);
                        return Object.assign({}, graph, {
                                    ...powerValue
                                });
            });

        case CLEAR_RACK:
            return initialState.rackPowerValues; 

        default:
            return state;
    }

}

/**
 * ラックステータスを更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function rackStatuses(state=initialState.rackStatuses, action) {
    switch( action.type ) {

        case SET_MASTERDATA:
            return  Object.assign([], state, action.value.rackStatuses);

        default:
            return state;
    }
}

/**
 * ラック種別を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function rackTypes(state=initialState.rackTypes, action) {
    switch( action.type ) {

        case SET_MASTERDATA:
            return  Object.assign([], state, action.value.rackTypes);

        default:
            return state;
    }

}


/**
 * 電源形状を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function connectors(state=initialState.connectors, action) {
    switch( action.type ) {

        case SET_MASTERDATA:
            return  Object.assign([], state, action.value.connectors);

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

        case SET_RACK:
        case SET_EDITING_RACK:
            var invalid = Object.assign({}, state, initialState.invalid);     //ラックを読み込んだときはリセットする
            if (!(hasRack(action.value) && hasRackView(action.value))) {
                invalid.rack = true;            //ラックがない もしくは ラック搭載図がない場合は、ラック概要はエラー。
            }
            return invalid;        

        case CHANGE_RACK_OVERVIEW:
            return Object.assign({}, state, {
                        rack: action.invalid
                    });
        
        case CHANGE_RACK_DETAIL:
            return Object.assign({}, state, {
                        extendedData: action.invalid
                    });
        
        case CHANGE_RACKPOWER:
            return Object.assign({}, state, {
                        rackPower: action.invalid
                    });
        
        case CHANGE_RACK_LINK:
            return Object.assign({}, state, {
                        links: action.invalid
                    });

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
            return {
                rack: action.value,
                powerBar: action.value
            };

        case SET_LOADSTATE_RACK:
            return Object.assign({}, state, {
                rack: action.value
            });
            
        case SET_LOADSTATE_POWERBAR:
            return Object.assign({}, state, {
                powerBar: action.value
            });

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

        case CHANGE_SELECTTEMPLATE_STATE:
            return Object.assign({}, state, {
                selectTemplate: {
                    show: action.value
                }
            });

        case CHANGE_ADDTEMPLATE_STATE:
            return Object.assign({}, state, {
                addTemplate:  {
                    show: action.value
                }
            });

        case CHANGE_DELETEMESSAGE_STATE:
            return Object.assign({}, state, {
                delete: {
                    show: action.value,
                    message: action.message,
                    attenstion: action.attenstion
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
            
        case CHANGE_CONFIRM_STATE:
            return Object.assign({}, state, {
                confirm: {
                    show: action.value,
                    title: action.title,
                    message: action.message,
                    type: action.confirmType,
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
    rackStatuses,
    rackTypes,
    connectors
});

//使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    searchCondition,
    locationSelector,
    masterInfo,
    selectedRack,
    rackPowerValues,
    editingRack,
    invalid,
    isEditing,
    isLoading,
    modalInfo,
    isApplyTemplate,
    waitingInfo,
    loginUser
});

export default rootReducers;
