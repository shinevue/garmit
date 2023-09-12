/**
 * @license Copyright 2020 DENSO
 * 
 * ProjectPanelのReducerを定義する。
 * ReducerはActionを受信してStateを更新する。
 * 
 */
'use strict';

import { combineReducers } from 'redux';
import { routerReducer, LOCATION_CHANGE } from 'react-router-redux';

import searchCondition from 'SearchCondition/reducer.js';
import searchResult from 'SearchResult/reducer.js';
import authentication from 'Authentication/reducer.js';
import waitingInfo from 'WaitState/reducer.js';
import isLoading from 'LoadState/reducer';
import modalState from 'ModalState/reducer';

//Reducerで処理するAction名をインポートする。
import { SET_SEARCH_DISABLED } from './actions.js';
import { SET_EDIT_PROJECT_FORM, CHANGE_PROJECT, CHANGE_PROJECT_LINE, CHANGE_LINES, CHANGE_EXTENDED_PAGES } from './actions.js';
import { SET_EDIT_PROJECTS, CHANGE_BULK_PROJECT } from './actions.js';
import { CLEAR_EDIT } from './actions.js';
import { SET_IN_PATCH_CABLES, SET_IDF_PATCH_CABLES, ADD_LINE_SELECTION_SERIES, CLEAR_LINE_SELECTION_SERIES } from './actions.js';
import { CLAER_IDF_PATCHCABLE_SELECTIONS, CLAER_LINE_PATCHCABLE_SELECTIONS, CLEAR_IN_PATCHCABLES_SELECTIONS, RESET_IDF_PATCHCABLE_SELECTIONS } from './actions.js';
import { SET_BEFORE_LINE_PATCH_CABLES } from './actions.js';
import { SET_EDIT_SERACHED_LINE } from './actions.js';
import { SET_SAVE_FIEXED, SET_DATE_OVERWRITE } from './actions.js';

import { getChangedProject } from 'projectUtility';
import { filterPatchCableSelections, filterIdfPatchCableSelections, omitPatchCableSelections, omitIdfPatchCableSelections } from 'projectLineUtility';
import { START_SEQ_NO_IDF_PATCHCABLE, SEQ_NO_IN_PATCHCABLE } from 'projectLineUtility';
import { LINE_TEMP_TYPE } from 'constant';

//Reducerの初期値を設定する。
const initialState = {
    searchDisabled: false,
    editProjectForm: null,
    editProjects: null,
    editBulkKeys: [],
    bulkProject: {
        userName: null,
        chargeName: null
    },
    linePatchCableSelections: [{
        seriesNo: 1,     
        inPatchCables: [],
        idfPatchCableSelections: [{   
            seqNo: 2,
            patchCables: []
        }]
    }],
    beforeLinePatchCableSelections: [],
    editSearchedLine: null,
    beforeEditingPatchCableSequences: null,
    beforeEditingBeforePatchCableSequences: null,
    invalid: {
        project: false,
        projectLine: false,
        lines: false,
        extendedPages: false
    },
    isSaveFixed: false,
    isDateOverwrite: false
};

//Actionの処理を行うReducer

//#region 一覧画面用

/**
 * searchDisabled(検索無効)のReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function searchDisabled(state=initialState.searchDisabled, action) {
    switch( action.type ) {
        case SET_SEARCH_DISABLED:
            return  action.disabled;

        default:
            return state;
    }
}

//#endregion

//#region 編集画面用

/**
 * 編集中の案件情報
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function editProjectForm(state=initialState.editProjectForm, action) {
    switch( action.type ) {

        case SET_EDIT_PROJECT_FORM:
            return action.data && _.cloneDeep(action.data);

        case CHANGE_PROJECT:
        case CHANGE_PROJECT_LINE:
            let lines = _.cloneDeep(state.lines);
            if (action.key === 'projectType' && state.project[action.key] !== action.value) {
                lines = [];
            }
            return Object.assign(state, {}, {
                project: getChangedProject(state.project, action.key, action.value),
                lines: lines
            });

        case CHANGE_LINES:
            return Object.assign(state, {}, {
                lines: action.lines ? _.cloneDeep(action.lines) : []
            });

        case CHANGE_EXTENDED_PAGES:
            return Object.assign(state, {}, {
                extendedPages: _.cloneDeep(action.pages)
            });

        case CLEAR_EDIT:
            return initialState.editProjectForm;

        default:
            return state;
    }
}

/**
 * 編集中の案件情報（一括編集用）
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function editProjects(state=initialState.editProjects, action) {
    switch( action.type ) {

        case SET_EDIT_PROJECTS:
            return action.data && _.cloneDeep(action.data);
            
        case CLEAR_EDIT:
            return initialState.editProjects;

        default:
            return state;
    }
}

/**
 * 一括編集対象のキー
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function editBulkKeys(state=initialState.editBulkKeys, action) {
    switch( action.type ) {
        case SET_EDIT_PROJECTS:
        case CLEAR_EDIT:
            return initialState.editBulkKeys;

        case CHANGE_BULK_PROJECT:
            return action.keys && action.keys.concat();
            
        default:
            return state;
    }
}

/**
 * 一括編集用案件情報
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function bulkProject(state=initialState.bulkProject, action) {
    switch( action.type ) {
        case SET_EDIT_PROJECTS:
        case CLEAR_EDIT:
            return _.cloneDeep(initialState.bulkProject);

        case CHANGE_BULK_PROJECT:
            return action.value && Object.assign(state, {}, action.value);
            
        default:
            return state;
    }
}

/**
 * 配線盤選択肢情報
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function linePatchCableSelections(state=initialState.linePatchCableSelections, action) {
    switch( action.type ) {
        case SET_IN_PATCH_CABLES:
            const updateInSelections = _.cloneDeep(state);
            action.seriesNos.forEach(seriesNo => {
                if (!updateInSelections.some((item) => item.seriesNo === seriesNo)) {
                    updateInSelections.push({
                        seriesNo: seriesNo,
                        inPatchCables: [],
                        idfPatchCableSelections: [{   
                            seqNo: 2,
                            patchCables: []
                        }]
                    });
                } 
            });                  
            return updateInSelections.map((item) => {
                if (action.seriesNos.includes(item.seriesNo)) {
                    item.inPatchCables = action.inPatchCables ? filterPatchCableSelections(action.inPatchCables) : [];
                    item.inPatchCables = omitPatchCableSelections(item.inPatchCables);
                };
                return item;
            });

        case SET_IDF_PATCH_CABLES:
            let updateIdfSelections = _.cloneDeep(state);
            if (!updateIdfSelections.some((item) => item.seriesNo === action.seriesNo)) {
                updateIdfSelections.push({
                    seriesNo: action.seriesNo,
                    inPatchCables: [],
                    idfPatchCableSelections: [{   
                        seqNo: 2,
                        patchCables: []
                    }]
                });
            }
            return updateIdfSelections.map((item) => {
                if (item.seriesNo === action.seriesNo) {
                    item.idfPatchCableSelections = action.selections ? filterIdfPatchCableSelections(action.selections) : [];
                    item.idfPatchCableSelections = omitIdfPatchCableSelections(item.idfPatchCableSelections);
                }
                return item;
            });
        
        case ADD_LINE_SELECTION_SERIES:
            let addSerises = _.cloneDeep(state);
            if (!addSerises.some((item) => item.seriesNo === action.seriesNo)) {
                const tempSelctions = addSerises.find((item) => item.seriesNo !== action.seriesNo);
                const isPremiseOnly = action.tempType && action.tempType === LINE_TEMP_TYPE.premiseOnly;
                const firstIdfSelection = isPremiseOnly && tempSelctions.idfPatchCableSelections.find((s) => s.seqNo === START_SEQ_NO_IDF_PATCHCABLE);
                addSerises.push({
                    seriesNo: action.seriesNo,
                    inPatchCables: (!isPremiseOnly && tempSelctions) ? _.cloneDeep(tempSelctions.inPatchCables) : [],
                    idfPatchCableSelections: firstIdfSelection ? [ _.cloneDeep(firstIdfSelection)]  : [{ seqNo: 2, patchCables: []  }]
                });
            }
            return addSerises;

        case CLEAR_LINE_SELECTION_SERIES:
            let clearSerises = _.cloneDeep(state);
            clearSerises = clearSerises.filter((item) => item.seriesNo !== action.seriesNo);
            return clearSerises;

        case CLAER_IDF_PATCHCABLE_SELECTIONS:
            let clearSelections = _.cloneDeep(state)
            clearSelections.forEach((item) => {
                if (!action.seriesNo) {
                    item.idfPatchCableSelections = [{
                        seqNo: 2,
                        patchCables: []
                    }];
                } else if (item.seriesNo === action.seriesNo) {
                    if (action.seqNo) {
                        item.idfPatchCableSelections = item.idfPatchCableSelections.filter((sel) => sel.seqNo < action.seqNo);
                        if (item.idfPatchCableSelections.length === 0) {
                            item.idfPatchCableSelections = [{
                                seqNo: 2,
                                patchCables: []
                            }];
                        }
                    } else {
                        item.idfPatchCableSelections = [];
                    }
                };
            });
            return clearSelections;

        case CLEAR_IN_PATCHCABLES_SELECTIONS:
            let clearInSerises = _.cloneDeep(state);
            clearInSerises.forEach((item) => {
                item.inPatchCables = [];
            })
            return clearInSerises;

        case RESET_IDF_PATCHCABLE_SELECTIONS:
            let resetIdfSerises = _.cloneDeep(state);
            resetIdfSerises.forEach((item) => {
                item.idfPatchCableSelections.forEach((selection) => {
                    selection.seqNo = START_SEQ_NO_IDF_PATCHCABLE;
                })
            })
            return resetIdfSerises;

        case CLAER_LINE_PATCHCABLE_SELECTIONS:
        case CLEAR_EDIT:
            return _.cloneDeep(initialState.linePatchCableSelections);

        default:
            return state;
    }
}

/**
 * 配線盤選択肢情報
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
 function beforeLinePatchCableSelections(state=initialState.beforeLinePatchCableSelections, action) {
    switch( action.type ) {        
        case SET_BEFORE_LINE_PATCH_CABLES:
            const patchCables = action.patchCables ? filterPatchCableSelections(action.patchCables) : [];
            return omitPatchCableSelections(patchCables);
            
        case CLAER_LINE_PATCHCABLE_SELECTIONS:
            case CLEAR_EDIT:
                return initialState.beforeLinePatchCableSelections;

        default:
            return state;
    }
}

/**
 * 検索した回線情報のReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function editSearchedLine(state=initialState.editSearchedLine, action) {
    switch( action.type ) {
        case SET_EDIT_SERACHED_LINE:
            return action.line ? _.cloneDeep(action.line) : null;

        case CLAER_LINE_PATCHCABLE_SELECTIONS:
        case CHANGE_LINES:
        case CLEAR_EDIT:
            return initialState.editSearchedLine;

        default:
            return state;
    }
}


/**
 * 変更前の線番接続情報のReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function beforeEditingPatchCableSequences(state=initialState.beforeEditingPatchCableSequences, action) {
    switch( action.type ) {
        case SET_EDIT_PROJECT_FORM:
            let sequences = [];            
            if (action.data && action.data.lines) {
                action.data.lines.forEach((line) => {
                    line.lineConnections.forEach((connection) => {
                        const patchCableSequences = _.cloneDeep(connection.patchCableSequences);
                        sequences.push(...patchCableSequences);
                    });
                })
            }
            return sequences;

        case CLEAR_EDIT:
            return initialState.beforeEditingPatchCableSequences;

        default:
            return state;
    }
}


/**
 * 変更前の線番接続情報（修正前）のReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
 function beforeEditingBeforePatchCableSequences(state=initialState.beforeEditingBeforePatchCableSequences, action) {
    switch( action.type ) {
        case SET_EDIT_PROJECT_FORM:
            let sequences = [];            
            if (action.data && action.data.lines) {
                action.data.lines.forEach((line) => {
                    line.beforeLineConnections && line.beforeLineConnections.forEach((connection) => {
                        const seqNos = connection.patchCableSequences.map((sel) => sel.seqNo);
                        const maxSeqNo = seqNos && seqNos.length > 0 ? Math.max.apply(null, seqNos) : START_SEQ_NO_IDF_PATCHCABLE;
                        connection.patchCableSequences.forEach((seq) => {
                            if (seq.seqNo === SEQ_NO_IN_PATCHCABLE || seq.seqNo === maxSeqNo) {     //末端のIDFと局入線番のみ入れておく
                                sequences.push(_.cloneDeep(seq));
                            }
                        })
                        
                    });
                })
            }
            return sequences;

        case CLEAR_EDIT:
            return initialState.beforeEditingBeforePatchCableSequences;

        default:
            return state;
    }
}



/**
 * invalidのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function invalid (state=initialState.invalid, action) {
    switch( action.type ) {
        case SET_EDIT_PROJECT_FORM:
            return { 
                project: action.isRegister,
                projectLine: false,
                lines: false, 
                extendedPages: false 
            };

        case SET_EDIT_PROJECTS:
            return { 
                project: true, 
                projectLine: false,
                lines: false, 
                extendedPages: false 
            };

        case CHANGE_PROJECT:
        case CHANGE_BULK_PROJECT:
            return Object.assign({}, state, {
                project: action.isError
            });
        
        case CHANGE_PROJECT_LINE:
            return Object.assign({}, state, {
                projectLine: action.isError
            });            
        
        case CHANGE_LINES:
            return Object.assign({}, state, {
                lines: false
            });

        case CHANGE_EXTENDED_PAGES:
            return Object.assign({}, state, {
                extendedPages: action.isError
            });

        case CLEAR_EDIT:
            return initialState.invalid;

        default:
            return state;
    }
    
}

/**
 * isSaveFixedのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function isSaveFixed (state=initialState.isSaveFixed, action) {
    switch( action.type ) {
        case SET_SAVE_FIEXED:
            return action.isSaveFixed;

        case CLEAR_EDIT:
            return initialState.isSaveFixed;

        default:
            return state;
    }
    
}


/**
 * isSaveFixedのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function isDateOverwrite (state=initialState.isDateOverwrite, action) {
    switch( action.type ) {
        case SET_DATE_OVERWRITE:
            return action.isDateOverwrite;

        case CLEAR_EDIT:
            return initialState.isDateOverwrite;

        default:
            return state;
    }
    
}

//#endregion

//使用するReducerを列挙
const rootReducers = combineReducers({
    routing: routerReducer,
    authentication,
    waitingInfo,
    isLoading,
    modalState,
    searchCondition,
    searchResult,
    searchDisabled,
    editProjectForm,
    editProjects,
    editBulkKeys,
    bulkProject,
    linePatchCableSelections,
    beforeLinePatchCableSelections,
    editSearchedLine,
    beforeEditingPatchCableSequences,
    beforeEditingBeforePatchCableSequences,
    invalid,
    isSaveFixed,
    isDateOverwrite
});

export default rootReducers;
