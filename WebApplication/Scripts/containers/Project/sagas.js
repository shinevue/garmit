/**
 * @license Copyright 2020 DENSO
 * 
 * Project画面のsagaを生成する
 * 
 */
'use strict';

import { effects } from "redux-saga";
const { fork, put, take, call, takeEvery, select, join, all } = effects;
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

import { REQUEST_INIT_INFO, REQUEST_GET_PROJECT_LIST, REQUEST_GET_PROJECTS } from './actions.js';
import { REQUEST_SAVE_PROJECT_FORM, REQUEST_SAVE_PROJECTS } from './actions.js';
import { REQUEST_SERACH_LINE } from './actions.js';
import { REQUEST_INIT_PATCHCABLE_SELECTIONS, REQUEST_ADD_PATCHCABLE_SELECTIONS, REQUEST_SET_FIRST_IDFSELECTION } from './actions.js';
import { SET_EDIT_PROJECT_FORM, SET_EDIT_PROJECTS } from './actions.js';
import { SET_IN_PATCH_CABLES, SET_IDF_PATCH_CABLES, CLAER_IDF_PATCHCABLE_SELECTIONS, CLEAR_IN_PATCHCABLES_SELECTIONS, CLEAR_LINE_SELECTION_SERIES, SET_EDIT_SERACHED_LINE } from './actions.js';
import { SET_BEFORE_LINE_PATCH_CABLES } from './actions.js';
import { REQUEST_CHANGE_TEMP_TYPE, REQUEST_CHANGE_SHEARCH_TYPE } from './actions.js';

import { SET_LOOKUP } from 'SearchCondition/actions.js';
import { SET_SEARCH_RESULT } from 'SearchResult/actions';
import { SUCCESS_SAVE, SHOW_ERROR_MESSAGE, CHANGE_MODAL_STATE } from 'ModalState/actions';
import { CHANGE_LOAD_STATE } from 'LoadState/actions';
import { SET_WAITING_STATE } from 'WaitState/actions';

import searchConditionSagas, { setCondisitonList } from 'SearchCondition/sagas.js';

import { PROJECT_TYPE, LINE_TEMP_TYPE, LINE_SEARCH_TYPE, LINE_STATUS } from 'constant';
import { getEmptyProjectForm, PROJECT_DATE_FORMAT, OPENDATE_PROJECT_TYPES, CLOSEDATE_PROJECT_TYPES } from 'projectUtility';
import { formatLineListDate, setLineDate, isFixProjectType } from 'projectLineUtility'
import { sortIdfPatchCableSelections } from 'projectLineUtility'
import { checkExistIdfPatchCableSelections } from 'projectLineUtility';
import { SEQ_NO_IN_PATCHCABLE, START_SEQ_NO_IDF_PATCHCABLE, FIRST_SERIES_NO, SECOND_SERIES_NO } from "projectLineUtility.js";
import { gatChangedBulkData } from 'projectUtility';
import { convertJsonDateToMoment } from 'datetimeUtility';
import { convertDateTimeExtendedData, convertNumberExtendedData } from 'assetUtility';

/**
 * rootSaga
 */
export default function* rootSaga() {
    yield all([
        ...searchConditionSagas,
        takeEvery(REQUEST_INIT_INFO, initialization),                                       //画面初期化
        takeEvery(REQUEST_GET_PROJECT_LIST, searchProjectList),                             //案件一覧取得
        takeEvery(REQUEST_GET_PROJECTS, setEditProjectInfo),                                //編集用案件情報取得
        takeEvery(REQUEST_SAVE_PROJECT_FORM, saveProjectFormInfo),                          //案件保存
        takeEvery(REQUEST_SAVE_PROJECTS, saveProjects),                                     //案件一括保存
        takeEvery(REQUEST_INIT_PATCHCABLE_SELECTIONS, setInitialLinePatchCableSelections),  //回線の線番選択の初期化
        takeEvery(REQUEST_ADD_PATCHCABLE_SELECTIONS, addIdfPatchCableSelection),            //回線の線番選択肢を追加する
        takeEvery(REQUEST_SET_FIRST_IDFSELECTION, setFirstIdfPatchCableSelections),         //一番目のIDF線番選択をセットする（新設（仮登録なし）のみ）
        takeEvery(REQUEST_SERACH_LINE, searchLine),                                         //回線検索
        takeEvery(REQUEST_CHANGE_TEMP_TYPE, setLinePatchCableSelectionsByTempType),         //仮登録方法変更
        takeEvery(REQUEST_CHANGE_SHEARCH_TYPE, setLinePatchCableSelectionsBySearchType)     //検索方法変更
    ]);
}

//#region roogSagaから呼び出される関数

/**
 * 初期情報をセットする
 */
function* initialization(action) {
    yield call(setLoadState, true);
    yield call(setInitialInfo, action);
    yield call(setLoadState, false);
}

/**
 * 初期情報取得
 */
function* setInitialInfo(action) {
    yield call(setLookUp);
    yield fork(setCondisitonList, action);
}

/**
 * 案件一覧を検索する
 */
function* searchProjectList(action) {
    yield call(setLoadState, true);
    const searchCondition = yield select(state => state.searchCondition.conditions);
    var condition = null;
    if (searchCondition) {
        condition = {
            lookUp: {
                lineTypes: searchCondition.lineTypes ? _.cloneDeep(searchCondition.lineTypes) : [],
                locations: searchCondition.locations ? _.cloneDeep(searchCondition.locations) : [],
                projectConditionItems: searchCondition.projectConditionItems ? _.cloneDeep(searchCondition.projectConditionItems) : [],
            },
            projectTypes: searchCondition.projectTypes ? searchCondition.projectTypes.map((type) => type.typeId) : [],
            projectNos: searchCondition.projectNos ? _.cloneDeep(searchCondition.projectNos) : [],
            lineNames: searchCondition.lineNames ? _.cloneDeep(searchCondition.lineNames) : [],
            lineIds: searchCondition.lineIds ? _.cloneDeep(searchCondition.lineIds) : []
        }
    } else {
        condition = { lookUp: null };
    }
    const { functionId, updateConditionList, showNoneMessage } = action;
    yield call(updateProjectResultAndConditionList, functionId, updateConditionList, condition, showNoneMessage);
    yield call(setLoadState, false);
}
/**
 * 案件一覧と検索条件一覧を更新する
 * @param {number} functionId 機能番号
 * @param {boolean} updateConditionList 検索条件一覧を更新するか
 * @param {boolean} showNoneMessage 0件メッセージを表示するか
 */
 function* updateProjectResultAndConditionList(functionId, updateConditionList, condition, showNoneMessage) {
    yield fork(setProjectResult, condition, showNoneMessage);
    yield updateConditionList && fork(setCondisitonList, { functionId });
}


/**
 * 編集用案件情報をセットする
 */
function* setEditProjectInfo(action) {
    yield call(setLoadState, true);
    const { projectIds, isRegister, callback } = action;
    if (isRegister) {
        yield call(setNewProjectForm, callback);
    } else if (projectIds.length === 1 ) {
        yield call(setEditProjectForm, projectIds[0], callback);
    } else {
        yield call(setEditProjects, projectIds, callback);
    }
    yield call(setLoadState, false);    
}

/**
 * 案件情報保存（sagaから呼び出されるもの）
 */
function* saveProjectFormInfo() {
    yield call(setWaitingState, true, 'save');

    var projectForm = yield select(state => state.editProjectForm);
    projectForm = _.cloneDeep(projectForm);
    projectForm.extendedPages = convertNumberExtendedData(projectForm.extendedPages);

    //確定保存時、開通年月日/廃止年月日のセット
    const isSaveFixed = yield select(state => state.isSaveFixed);
    const isDateOverwrite = yield select(state => state.isDateOverwrite);
    if (isSaveFixed) {
        projectForm.project.fixedflg = true;
        if (OPENDATE_PROJECT_TYPES.includes(projectForm.project.projectType)) {
            projectForm.lines = setLineDate(projectForm.lines, 'openDate', projectForm.project.openDate, isDateOverwrite);
        } else if (CLOSEDATE_PROJECT_TYPES.includes(projectForm.project.projectType)) {
            projectForm.lines = setLineDate(projectForm.lines, 'closeDate', projectForm.project.closeDate, isDateOverwrite);
        }

        //新設の場合、廃止年月日はクリアする
        if (projectForm.project.projectType === PROJECT_TYPE.new) {
            projectForm.lines = setLineDate(projectForm.lines, 'closeDate', null, true);
        }
    }

    yield call(saveProjectForm, projectForm);
    yield call(setWaitingState, false, null);  
}

/**
 * 案件一括保存
 */
function* saveProjects() {
    yield call(setWaitingState, true, 'save');
    const beforeProjects = yield select(state => state.editProjects);
    const editBulkKeys = yield select(state => state.editBulkKeys);
    const bulkProject = yield select(state => state.bulkProject);
    const targets = gatChangedBulkData(beforeProjects, editBulkKeys, bulkProject);
    const saveProjectInfo = yield call(postSaveProjects, targets);
    if (saveProjectInfo.isSuccessful) {
        yield fork(searchProjectList, { showNoneMessage: true });           //案件一覧の再表示
        yield put({ type: SUCCESS_SAVE, targetName: "案件情報", okOperation:"transition" });
    } else {
        yield yield call(setErrorMessage, saveProjectInfo.errorMessage);
    }
    yield call(setWaitingState, false, null);
}

//#region 回線選択モーダル関連

/**
 * 回線選択画面の線番選択の選択肢の初期化
 */
function* setInitialLinePatchCableSelections(action) {
    yield call(setLoadState, true);

    const { projectType, tempType, hasTemp, searchType, isEdit, lineConnections } = action;    
    const seriesNos = lineConnections.map((c) => c.seriesNo);
    yield call(setInitialPatchCableSelections, projectType, tempType, hasTemp, searchType, isEdit, seriesNos);
    if (isEdit) {
        if ([PROJECT_TYPE.temp, PROJECT_TYPE.new].includes(projectType) || (isFixProjectType(projectType) && searchType === LINE_SEARCH_TYPE.inOnly)) {
            yield call(setInitialEditingPatchCableSelections, projectType, tempType, lineConnections);
        }
        
        //IDF選択肢のseqNoをpatchCableSequencesの最大のseqNoに置き換える（新設：構内のみ / 撤去：構内のみ）
        if ((projectType === PROJECT_TYPE.new && tempType === LINE_TEMP_TYPE.premiseOnly) || (projectType === PROJECT_TYPE.remove && searchType === LINE_SEARCH_TYPE.premiseOnly)) {
            yield call(changeSeqNoOfIdfPatchCableSelection, lineConnections);
        }
    }

    //修正前の選択肢をセット
    if (isFixProjectType(projectType)) {
        yield call(setBeforeLinePatchCableSelections, searchType === LINE_SEARCH_TYPE.inOnly);
    }

    yield call(setLoadState, false);  
}

/**
 * 回線検索 
 */
function* searchLine(action) {
    yield call(setLoadState, true);
    const { patchboardId, patchCableNo, projectType, tempType, searchType } = action;
    yield call(setEditSearchedLine, patchboardId, patchCableNo );
    const editSearchedLine = yield select(state => state.editSearchedLine);

    if (editSearchedLine) {

        //ワイヤ変更時にIDFや局入線番選択肢を追加orクリアする
        yield call(changeLinePatchCableSelectionsByWiringType, editSearchedLine.wiringType, projectType, tempType, searchType);

        //IDF選択肢のseqNoをpatchCableSequencesの最大のseqNoに置き換える
        if (!isFixProjectType(projectType) && ( tempType === LINE_TEMP_TYPE.premiseOnly || searchType === LINE_SEARCH_TYPE.premiseOnly )) {
            yield call(changeSeqNoOfIdfPatchCableSelection, editSearchedLine.lineConnections);
        }

        //新設の場合は、それ以降の局入orIDF線番選択肢もセットする
        if (projectType === PROJECT_TYPE.new) {
            for (let index = 0; index < editSearchedLine.lineConnections.length; index++) {
                const connection = editSearchedLine.lineConnections[index];
                if (tempType === LINE_TEMP_TYPE.inOnly) {
                    yield call(setFirstIdfPatchCableSelections, { seriesNo: connection.seriesNo, patchboardId: patchboardId, notChangeLoadState: true } );
                } else {
                    const sequence = connection.patchCableSequences.find((s) => s.seqNo === START_SEQ_NO_IDF_PATCHCABLE);   //局入と繋がるIDF配線盤取得
                    yield sequence && call(setInPatchCableSelections, LINE_STATUS.notUse, [ connection.seriesNo ], sequence.patchboardId);
                }
            }
        }
    }
    
    yield call(setLoadState, false); 
}

/**
 * IDF線番選択肢を追加する（仮登録（構内のみ）/新設（仮登録なし・局入のみ）/修正（仮登録）（局入のみ）/修正（残置）（局入のみ））
 */
function* addIdfPatchCableSelection(action) {
    yield call(setLoadState, true);
    const { seriesNo, patchboardId, callback } = action;
    const beforeEditingCables = yield select(state => state.beforeEditingPatchCableSequences);
    const lineInfo = yield call(getUnusedChildrenPatchCables, patchboardId, beforeEditingCables);
    let isSuccess = false;
    if (lineInfo.isSuccessful) {
        if (lineInfo.data && lineInfo.data.length > 0) {
            const linePatchCableSelections = yield select(state => state.linePatchCableSelections);
            const lineSelection = linePatchCableSelections && linePatchCableSelections.find((s) => s.seriesNo === seriesNo);
            let selections = lineSelection && lineSelection.idfPatchCableSelections ? _.cloneDeep(lineSelection.idfPatchCableSelections) : [];
            const seqNos = selections.map((sel) => sel.seqNo);
            const maxSeqNo = seqNos && seqNos.length > 0 ? Math.max.apply(null, seqNos) : 1;
            selections.push({
                seqNo: maxSeqNo + 1,
                patchCables: lineInfo.data ? _.cloneDeep(lineInfo.data) : []
            });
            selections = sortIdfPatchCableSelections(selections);
            if (checkExistIdfPatchCableSelections(selections, maxSeqNo + 1)) {
                yield put({ type: SET_IDF_PATCH_CABLES, seriesNo, selections });
                isSuccess = true;
            } else {
                yield put({ type: CHANGE_MODAL_STATE, data: { show: true, title: '確認', message:'配下の配線盤に選択可能な線番はありません。', bsSize: 'sm', buttonStyle: 'message', okOperation: '' }});
            }
        } else {
            yield put({ type: CHANGE_MODAL_STATE, data: { show: true, title: '確認', message:'配下の配線盤はありません。', bsSize: 'sm', buttonStyle: 'message', okOperation: '' }});
        }
    } else {
        yield call(setErrorMessage, lineInfo.errorMessage);
    }
    callback && callback(isSuccess);
    yield call(setLoadState, false);
}

/**
 * 一番目のIDF線番選択をセットする（新設（仮登録なし）のみ）
 */
function* setFirstIdfPatchCableSelections(action){
    const { seriesNo, patchboardId, notChangeLoadState } = action;
    yield !notChangeLoadState && call(setLoadState, true);
    const beforeEditingCables = yield select(state => state.beforeEditingPatchCableSequences);
    const lineInfo = yield call(getUnusedChildrenPatchCables, patchboardId, beforeEditingCables);
    if (lineInfo.isSuccessful) {
         //IDF選択肢をクリアする
        yield put({ type: CLAER_IDF_PATCHCABLE_SELECTIONS, seriesNo: seriesNo, seqNo: START_SEQ_NO_IDF_PATCHCABLE});
        
        var selections = [{
            seqNo: 2,
            patchCables: lineInfo.data ? _.cloneDeep(lineInfo.data) : []
        }];
        selections = sortIdfPatchCableSelections(selections);
        
        yield put({ type: SET_IDF_PATCH_CABLES, seriesNo, selections });
    } else {
        yield call(setErrorMessage, lineInfo.errorMessage);
    }    
    yield !notChangeLoadState && call(setLoadState, false);
}

/**
 * 仮登録方法変更時、線番選択の選択肢をセットする
 */
function* setLinePatchCableSelectionsByTempType(action) {
    yield call(setLoadState, true);
    
    const { projectType, tempType, hasTemp, hasWireType } = action;    
    const seriesNos = hasWireType ? [ FIRST_SERIES_NO, SECOND_SERIES_NO ] : [ FIRST_SERIES_NO ];
    yield call(setInitialPatchCableSelections, projectType, tempType, hasTemp, null, false, seriesNos);

    if (projectType === PROJECT_TYPE.new) {  
        if (!hasTemp || tempType === LINE_TEMP_TYPE.inOnly) { 
            yield put({ type: CLAER_IDF_PATCHCABLE_SELECTIONS, seriesNo: FIRST_SERIES_NO, seqNo: START_SEQ_NO_IDF_PATCHCABLE});    //IDF選択肢クリア
            yield hasWireType && put({ type: CLAER_IDF_PATCHCABLE_SELECTIONS, seriesNo: SECOND_SERIES_NO, seqNo: START_SEQ_NO_IDF_PATCHCABLE});
        } else {
            yield put({ type: CLEAR_IN_PATCHCABLES_SELECTIONS });        //局入選択肢クリア
        }   
    }

    yield call(setLoadState, false);
}


/**
 * 検索方法変更時、線番選択の選択肢をセットする
 */
function* setLinePatchCableSelectionsBySearchType(action) {
    yield call(setLoadState, true);

    const { projectType, searchType, hasWireType } = action;
    const seriesNos = hasWireType ? [ FIRST_SERIES_NO, SECOND_SERIES_NO ] : [ FIRST_SERIES_NO ];
    yield call(setInitialPatchCableSelections, projectType, null, null, searchType, false, seriesNos);

    //修正前の選択肢をセット
    if (isFixProjectType(projectType)) {
        yield call(setBeforeLinePatchCableSelections, searchType === LINE_SEARCH_TYPE.inOnly);     
    }
    yield call(setLoadState, false);
    
}

//#endregion

//#endregion

//#region 回線選択関連（線番選択の選択肢関係）

/**
 * 線番選択肢の初期設定（登録・検索方法変更及び初期表示時）
 * @param {number} projectType 工事種別
 * @param {number} tempType 仮登録方法
 * @param {boolean} hasTemp 仮登録ありかどうか
 * @param {number} searchType 検索方法
 * @param {boolean} isEdit 編集かどうか
 * @param {array} seriesNos 局入系統No
 */
function* setInitialPatchCableSelections(projectType, tempType, hasTemp, searchType, isEdit, seriesNos) {
    var isInPatchCable = false;
    var lineStatus = LINE_STATUS.notUse;
    switch (projectType) {
        case PROJECT_TYPE.temp:
            isInPatchCable = (tempType === LINE_TEMP_TYPE.inOnly);
            lineStatus = LINE_STATUS.notUse;
            break;
    
        case PROJECT_TYPE.new:
            isInPatchCable = !hasTemp || (tempType === LINE_TEMP_TYPE.inOnly);            
            if (!hasTemp) {
                lineStatus = LINE_STATUS.notUse;
            } else if (tempType === LINE_TEMP_TYPE.inOnly) {
                lineStatus = LINE_STATUS.inOnly;
            } else {
                lineStatus = LINE_STATUS.premiseOnly;
            }
            break;            
            
        case PROJECT_TYPE.change:
        case PROJECT_TYPE.left:
            isInPatchCable = true;
            lineStatus = LINE_STATUS.use;
            break;
            
        case PROJECT_TYPE.remove:
            isInPatchCable = !(searchType === LINE_SEARCH_TYPE.premiseOnly);
            if (searchType === LINE_SEARCH_TYPE.inUse) {
                lineStatus = LINE_STATUS.use;
            } else if (searchType === LINE_SEARCH_TYPE.inOnly) {
                lineStatus = LINE_STATUS.inOnly;
            } else {
                lineStatus = LINE_STATUS.premiseOnly;
            }
            break;
            
        case PROJECT_TYPE.fix_temp:
        case PROJECT_TYPE.fix_left:
            isInPatchCable = (searchType === LINE_SEARCH_TYPE.premiseOnly);
            lineStatus = LINE_STATUS.notUse;
            break;
    }

    if (isInPatchCable) {
        yield call(setInPatchCableSelections, lineStatus, seriesNos, null);      //局入線番取得＆設定
    } else {
        yield !(isEdit && lineStatus === LINE_STATUS.notUse) && call(setIdfPatchCableSelections, lineStatus, seriesNos);      //IDF線番取得＆設定
    }
}

/**
 * 線番選択肢の初期設定（初期表示時のみ）
 * @param {number} projectType 工事種別
 * @param {number} tempType 仮登録方法
 * @param {array} lineConnections 回線線番情報リスト
 */
function* setInitialEditingPatchCableSelections(projectType, tempType, lineConnections) {
    var isInPatchCable = (projectType === PROJECT_TYPE.new && tempType === LINE_TEMP_TYPE.premiseOnly);
    var lineStatus = LINE_STATUS.notUse;

    for (let index = 0; index < lineConnections.length; index++) {
        const connection = lineConnections[index];
        if (isInPatchCable) {
            const sequence = connection.patchCableSequences.find((s) => s.seqNo === START_SEQ_NO_IDF_PATCHCABLE);
            yield fork(setInPatchCableSelections, lineStatus, [connection.seriesNo], sequence&&sequence.patchboardId)
        } else {
            const seqNos = connection.patchCableSequences.map((item) => item.seqNo);
            const unusedMaxSeqNo = Math.max.apply(null, seqNos);
            const patchboardIds = connection.patchCableSequences.filter((s) => s.seqNo < unusedMaxSeqNo).map((item) => item.patchboardId);
            if (!seqNos.includes(SEQ_NO_IN_PATCHCABLE)) {
                patchboardIds.unshift(null);
            }
            yield fork(setUnusedPatchCableSelections, connection.seriesNo, patchboardIds);
        }
    }
}

//#endregion

//#region データ取得＆セット＆保存

/**
 * LookUpをセットする
 */
function* setLookUp() {
    const lookUpInfo = yield call(getLookUp);
    if (lookUpInfo.isSuccessful) {
        yield put ({ type: SET_LOOKUP, value: lookUpInfo.data });
    } else {
        yield call(setErrorMessage, lookUpInfo.errorMessage);
    }
}


/**
 * 案件一覧をセットする
 * @param {object} condition  検索条件(lookUp/projectTypes/lineNames/lineIds/projectConditionItems)
 */
function* setProjectResult(condition, showNoneMessage) {
    const projectInfo = yield call(getProjectList, condition);
    if (projectInfo.isSuccessful) {
        yield put ({ type: SET_SEARCH_RESULT, value: projectInfo.data });
        if (showNoneMessage && projectInfo.data.rows.length <= 0) {
            yield put({ type: CHANGE_MODAL_STATE, data: { show: true, title: '検索', message:'検索条件に該当する案件がありません。', bsSize: 'sm', buttonStyle: 'message', okOperation: '' }});
        }
    } else {
        yield call(setErrorMessage, projectInfo.errorMessage);
    }
}

/**
 * 新規案件情報をセットする
 * @param {function} callback コールバック関数
 */
function* setNewProjectForm(callback) {
    const projectInfo = yield call(getNewProjectForm);
    if (projectInfo.isSuccessful) {
        const lookUp = yield select(state => state.searchCondition.lookUp)
        yield put({ type: SET_EDIT_PROJECT_FORM, data: getEmptyProjectForm(projectInfo.data, lookUp&&lookUp.lineTypes) , isRegister: true });
        callback && callback();
    } else {
        yield call(setErrorMessage, projectInfo.errorMessage);
    }
}

/**
 * 編集中の案件情報をセットする
 * @param {number} projectId 案件ID
 * @param {function} callback コールバック関数
 */
function* setEditProjectForm(projectId, callback) {
    const projectInfo = yield call(getProjectFrom, projectId);
    if (projectInfo.isSuccessful) {
        const { data } = projectInfo;
        data.project.receptDate = data.project.receptDate && convertJsonDateToMoment(data.project.receptDate, PROJECT_DATE_FORMAT);
        data.project.compreqDate = data.project.compreqDate && convertJsonDateToMoment(data.project.compreqDate, PROJECT_DATE_FORMAT);
        data.project.openDate = data.project.openDate && convertJsonDateToMoment(data.project.openDate, PROJECT_DATE_FORMAT);
        data.project.closeDate = data.project.closeDate && convertJsonDateToMoment(data.project.closeDate, PROJECT_DATE_FORMAT);
        data.project.observeDate = data.project.observeDate && convertJsonDateToMoment(data.project.observeDate, PROJECT_DATE_FORMAT);
        data.extendedPages = data.extendedPages && convertDateTimeExtendedData(data.extendedPages);
        data.lines = data.lines && formatLineListDate(data.lines);
        yield put({ type: SET_EDIT_PROJECT_FORM, data: data , isRegister: false });
        callback && callback();
    } else {
        yield call(setErrorMessage, projectInfo.errorMessage);
    }
}

/**
 * 編集中の案件情報（複数）をセットする
 * @param {array} projectIds 案件IDリスト
 * @param {function} callback コールバック関数
 */
function* setEditProjects(projectIds, callback) {
    const projectInfo = yield call(getProjects, projectIds);
    if (projectInfo.isSuccessful) {
        if (projectInfo.data.some((project) => project.fixedflg)) {
            yield call(setErrorMessage, '確定保存後の案件情報が含まれているため、編集できません。');
        } else {
            yield put({ type: SET_EDIT_PROJECTS, data: projectInfo.data });
            callback && callback();
        }
    } else {
        yield call(setErrorMessage, projectInfo.errorMessage);
    }
}

/**
 * 案件保存
 * @param {object} projectForm 案件
 */
function* saveProjectForm(projectForm) {
    const saveProjectInfo = yield call(postSaveProject, projectForm);
    if (saveProjectInfo.isSuccessful) {
        const searchCondition = yield select(state => state.searchCondition);
        yield searchCondition && searchCondition.conditions && fork(searchProjectList, { showNoneMessage: true });           //案件一覧の再表示
        yield put({ type: SUCCESS_SAVE, targetName: "案件情報", okOperation:"transition" });
    } else {
        yield yield call(setErrorMessage, saveProjectInfo.errorMessage);
    }
}

/**
 * 局入線番の選択肢をセットする
 * @param {number} lineStatus 回線状態ステータス
 * @param {array} seriesNo 局入系統No
 * @param {number} patchboardId IDF配線盤ID
 */
function* setInPatchCableSelections(lineStatus, seriesNos, patchboardId = null) {
    const beforeEditingCables = yield select(state => state.beforeEditingPatchCableSequences);
    const lineInfo = lineStatus === LINE_STATUS.notUse ? yield call(getUnusedInPatchCables, patchboardId, beforeEditingCables) : yield call(getInPatchCables, lineStatus, beforeEditingCables);
    if (lineInfo.isSuccessful) {
        yield put({ type: SET_IN_PATCH_CABLES, inPatchCables: _.cloneDeep(lineInfo.data), seriesNos });
    } else {
        yield call(setErrorMessage, lineInfo.errorMessage);
    }
}

/**
 * IDF線番の選択肢をセットする（seqNo=2のみ）
 * @param {number} lineStatus 回線状態ステータス
 * @param {array} seriesNos 局入系統No
 */
function* setIdfPatchCableSelections(lineStatus, seriesNos) {
    const beforeEditingCables = yield select(state => state.beforeEditingPatchCableSequences);
    const lineInfo = yield call(getPatchCables, lineStatus, beforeEditingCables);
    if (lineInfo.isSuccessful) {
        var selections = lineInfo.data ? [
                            {
                                seqNo: START_SEQ_NO_IDF_PATCHCABLE,
                                patchCables: lineInfo.data ? _.cloneDeep(lineInfo.data) : []
                            }
                        ] : [];
        selections = sortIdfPatchCableSelections(selections);
        for (let index = 0; index < seriesNos.length; index++) {
            const seriesNo = seriesNos[index];
            yield put({ type: SET_IDF_PATCH_CABLES, seriesNo: seriesNo, selections: _.cloneDeep(selections) });
        }
    } else {
        yield call(setErrorMessage, lineInfo.errorMessage);
    }
}

/**
 * IDF線番の選択肢を一括セットする
 * @param {number} seriesNo 局入連番No
 * @param {array} patchboardIds 配線盤一覧
 */
function* setUnusedPatchCableSelections(seriesNo, patchboardIds) {
    const beforeEditingCables = yield select(state => state.beforeEditingPatchCableSequences);
    const lineInfo = yield call(getUnusedChildrenPatchCablesList, patchboardIds, beforeEditingCables);
    if (lineInfo.isSuccessful) {
        var selections = lineInfo.data && lineInfo.data.map((item) => {
            return {
                seqNo: item.seqNo + 1,
                patchCables: item.chilerenPatchCables ? _.cloneDeep(item.chilerenPatchCables) : []
            };
        })
        selections = sortIdfPatchCableSelections(selections);
        yield put({ type: SET_IDF_PATCH_CABLES, seriesNo, selections });
    } else {
        yield call(setErrorMessage, lineInfo.errorMessage);
    }
}

/**
 * 修正前の線番選択肢をセットする
 * @param {boolean} inOnly 局入のみかどうか
 */
function* setBeforeLinePatchCableSelections(inOnly) {
    const beforeEditingSequences = yield select(state => state.beforeEditingBeforePatchCableSequences);
    const lineInfo = inOnly ? yield call(getInPatchCables, LINE_STATUS.inOnly, beforeEditingSequences) : yield call(getPatchCables, LINE_STATUS.premiseOnly, beforeEditingSequences);
    if (lineInfo.isSuccessful) {
        yield put({ type: SET_BEFORE_LINE_PATCH_CABLES, patchCables: _.cloneDeep(lineInfo.data) });
    } else {
        yield call(setErrorMessage, lineInfo.errorMessage);
    }
}

/**
 * 検索した回線情報にセットする
 * @param {number} patchboardId 配線盤ID
 * @param {number} patchCableNo 線番No
 */
function* setEditSearchedLine(patchboardId, patchCableNo) {
    const lineInfo = yield call(getLine, patchboardId, patchCableNo);
    if (lineInfo.isSuccessful) {
        const { data } = lineInfo;
        data.openDate = data.openDate && convertJsonDateToMoment(data.openDate, PROJECT_DATE_FORMAT);
        data.closeDate = data.closeDate && convertJsonDateToMoment(data.closeDate, PROJECT_DATE_FORMAT);
        yield put( { type: SET_EDIT_SERACHED_LINE, line: data });
    } else {
        yield put( { type: SET_EDIT_SERACHED_LINE, line: null });
        yield call(setErrorMessage, lineInfo.errorMessage);
    }
}

//#endregion

//#region データのセット（単純なセットのみ）

/**
 * エラーメッセージをセットする（単純にセットのみ）
 * @param {string} message メッセージ
 */
function* setErrorMessage(message) {
    yield put({ type: SHOW_ERROR_MESSAGE, message: message });
}

/**
 * ロード状態を変更する
 * @param {boolean} isLoading ロード状態
 */
function* setLoadState(isLoading) {
    const current = yield select(state => state.isLoading);
    if (current !== isLoading) {
        yield put({ type: CHANGE_LOAD_STATE, isLoading: isLoading });        
    }
}

/**
 * 保存中・削除中の待ち状態を変更する
 * @param {boolean} isWaiting 待ち状態
 * @param {string} waitingType 待ち種別（deleteやsave）
 */
function* setWaitingState (isWaiting, waitingType) {
    yield put({ type: SET_WAITING_STATE, isWaiting: isWaiting, waitingType: waitingType });
}

/**
 * IDF選択肢のSeqNoを変更する（新設（構内のみ）/撤去（構内のみ））
 * @param {array} lineConnections 回線線番情報リスト
 */
function* changeSeqNoOfIdfPatchCableSelection (lineConnections) {
    for (let index = 0; index < lineConnections.length; index++) {
        const connection = lineConnections[index];
        const seqNos = connection.patchCableSequences.map((item) => item.seqNo);
        const maxSeqNo = seqNos.length > 0 ? Math.max.apply(null, seqNos) : START_SEQ_NO_IDF_PATCHCABLE;
        const linePatchCableSelections = yield select(state => state.linePatchCableSelections);
        const lineSelection = linePatchCableSelections && linePatchCableSelections.find((s) => s.seriesNo === connection.seriesNo);
        let selections = lineSelection && lineSelection.idfPatchCableSelections ? _.cloneDeep(lineSelection.idfPatchCableSelections) : [];
        if (selections.length === 1) {
            selections = selections.map((s) => {
                let selection =  _.cloneDeep(s)
                selection.seqNo = maxSeqNo;     //最大のSeqNoに置き換える
                return selection;
            });
        }        
        yield put({ type: SET_IDF_PATCH_CABLES, seriesNo: connection.seriesNo, selections });
    }
}

/**
 * ワイヤ種別によって線番選択肢情報を変更する
 * @param {number} wiringType ワイヤ種別
 * @param {number} projectType 工事種別
 * @param {number} tempType 仮登録方法
 * @param {number} searchType 検索方法
 */
function* changeLinePatchCableSelectionsByWiringType(wiringType, projectType, tempType, searchType) {
    const linePatchCableSelections = yield select(state => state.linePatchCableSelections);
    if (wiringType) {
        if (linePatchCableSelections.length === 1) {
            const tempSelctions = _.cloneDeep(linePatchCableSelections[0]);
            let isPremiseOnly = ( tempType === LINE_TEMP_TYPE.premiseOnly || searchType === LINE_SEARCH_TYPE.premiseOnly );
            if (isFixProjectType(projectType)) {
                isPremiseOnly = (searchType === LINE_SEARCH_TYPE.inOnly);
                tempSelctions.idfPatchCableSelections = tempSelctions.idfPatchCableSelections.filter((s) => s.seqNo === START_SEQ_NO_IDF_PATCHCABLE);
            }
            yield isPremiseOnly && put({ type: SET_IDF_PATCH_CABLES, seriesNo: SECOND_SERIES_NO, selections: _.cloneDeep(tempSelctions.idfPatchCableSelections) });
            yield !isPremiseOnly && put({ type: SET_IN_PATCH_CABLES, inPatchCables: _.cloneDeep(tempSelctions.inPatchCables), seriesNos: [ SECOND_SERIES_NO ] });
        }
    } else {
        yield (linePatchCableSelections.length > 1) && put({ type: CLEAR_LINE_SELECTION_SERIES, seriesNo: SECOND_SERIES_NO });
    }   
}

//#endregion

//#region API呼び出し

/**
 * 初期情報を取得する
 */
function getLookUp() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, '/api/project', null, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data });
            } else {
                resolve({ isSuccessful: false, errorMessage: '検索条件のマスタ情報取得に失敗しました。' });
            }
        });
    });
}

/**
 * 案件一覧を取得する
 * @param {object} condition 検索条件(lookUp/projectTypes/lineNames/lineIds/projectConditionItems)
 */
function getProjectList(condition) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/project/getProjectResult', condition, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data});
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "案件一覧取得に失敗しました。" });
            }
        });
    });    
}

/**
 * 新規案件情報取得
 */
function getNewProjectForm() {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.get, '/api/project/newProjectForm', null, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data});
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "新規案件情報取得に失敗しました。" });
            }
        });
    });    
}

/**
 * 案件情報取得
 * @param {number} projectId 案件ID
 */
function getProjectFrom(projectId) {
    const parameter = {
        id: projectId
    };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/project/getProjectForm', parameter, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data});
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "案件情報取得に失敗しました。" });
            }
        });
    });  
}

/**
 * 複数案件情報取得
 * @param {array} projectIds 案件IDリスト
 */
function getProjects(projectIds) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/project/getProjects', projectIds, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data});
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "案件情報取得に失敗しました。" });
            }
        });
    });
}

/**
 * 案件保存
 * @param {object} prjectForm 案件情報
 * @param {boolean} isDateOverwrite 開始年月日or廃止年月日を上書き保存するか
 */
function postSaveProject(prjectForm) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/project/setProject', prjectForm, (result, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (result) {
                if (result.isSuccess) {
                    resolve({ isSuccessful: true });
                } else {
                    resolve({ isSuccessful: false, errorMessage: result.message });
                }
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "案件情報保存に失敗しました。" });
            }
        });
    });
}

/**
 * 案件保存
 * @param {object} prjects 案件情報リスト
 */
function postSaveProjects(prjects) {
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/project/setProjects', prjects, (result, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (result) {
                if (result.isSuccess) {
                    resolve({ isSuccessful: true });
                } else {
                    resolve({ isSuccessful: false, errorMessage: result.message });
                }
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "案件情報保存に失敗しました。" });
            }
        });
    });
}

/**
 * 未使用局入線番取得
 * @param {number} patchboardId IDF配線盤ID
 * @param {array} beforeEditingCables 編集前線番リスト
 */
 function getUnusedInPatchCables(patchboardId, beforeEditingCables) {
    const parameter = {
        patchboardId,
        allowedUnfixedCables: beforeEditingCables
    };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/line/getUnusedInPatchCables' , parameter, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data});
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "局入線番情報取得に失敗しました。" });
            }
        });
    });
}

/**
 * 局入線番取得
 * @param {number} lineStatus 回線状態ステータス
 * @param {array} beforeEditingCables 編集前線番リスト
 */
function getInPatchCables(lineStatus, beforeEditingCables) {
    const apiName = lineStatus === LINE_STATUS.use ? 'getUsedInPatchCables' : 'getInOnlyPatchCables';
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/line/' + apiName, beforeEditingCables, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data});
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "局入線番情報取得に失敗しました。" });
            }
        });
    });
}

/**
 * 未使用の子IDF線番取得
 * @param {number} patchboardId 親配線盤ID
 * @param {array} beforeEditingCables 編集前線番リスト
 */
function getUnusedChildrenPatchCables(patchboardId, beforeEditingCables) {
    const parameter = {
        patchboardId,
        allowedUnfixedCables: beforeEditingCables
    };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/line/getUnusedChildrenPatchCables', parameter, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data});
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "IDF線番情報取得に失敗しました。" });
            }
        });
    });
}

/**
 * 未使用の複数線番情報取得
 * @param {array} patchboardIds 配線盤IDリスト
 * @param {array} beforeEditingCables 編集前線番リスト
 */
function getUnusedChildrenPatchCablesList(patchboardIds, beforeEditingCables) {
    const parameter = {
        patchboardIds,
        allowedUnfixedCables: beforeEditingCables
    };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/line/getUnusedChildrenPatchCablesList', parameter, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data});
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "IDF線番情報取得に失敗しました。" });
            }
        });
    });
}

/**
 * IDF線番情報取得
 * @param {number} lineStatus 回線状態ステータス
 * @param {array} beforeEditingCables 編集前線番リスト
 */
function getPatchCables(lineStatus, beforeEditingCables) {
    const apiName = lineStatus === LINE_STATUS.notUse ? 'getUnusedPatchCables' : 'getPremiseOnlyPatchCables';
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/line/' + apiName, beforeEditingCables, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data});
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "IDF線番情報取得に失敗しました。" });
            }
        });
    });
}

/**
 * 回線情報取得
 * @param {number} patchboardId 配線盤ID
 * @param {number} patchCableNo 線番
 */
function getLine(patchboardId, patchCableNo) {
    const parameter = { patchboardId, patchCableNo };
    return new Promise((resolve, reject) => {
        sendData(EnumHttpMethod.post, '/api/line/getLine', parameter, (data, networkError) => {
            if (networkError) {
                resolve({ isSuccessful: false, errorMessage: NETWORKERROR_MESSAGE });
            } else if (data) {
                resolve({ isSuccessful: true, data: data});
            }
            else {
                resolve({ isSuccessful: false, errorMessage: "許可ロケーション以外に設定された回線です。別の線番を選択してください" });
            }
        });
    });
}

//#endregion