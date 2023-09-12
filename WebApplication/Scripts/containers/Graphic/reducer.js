/**
 * @license Copyright 2018 DENSO
 * 
 * GraphicPanelのReducerを定義する。
 * ReducerはActionを受信してStateを更新する。
 * 
 * 注意点
 * ・引数で渡されたstateやactionそのものを変更してはいけません。
 * 　stateを変更するには、previousState を直接いじるのではなく、新しいオブジェクトを作成して返却します。
 * 
 */
'use strict';

import { combineReducers } from 'redux';

import authentication from 'Authentication/reducer.js';
import { floorMapInfo } from 'FloorMapCommon/reducer.js';
import isLoading from 'LoadState/reducer';
import modalState from 'ModalState/reducer';
import waitingInfo from 'WaitState/reducer';

import { OBJECT_TYPE, DEFAULT_OBJECT_SETTING, layoutNameInputCheck, getAddObjectId, gridSizeInputCheck, convertObjectSettingBox, validateObjectSetting, getAppliedObjects, getIsApply } from 'graphicUtility';

//Reducerで処理するAction名をインポートする。
import { SET_IS_READONLY, SET_LOOKUP } from './actions.js';
import { SET_SELECT_LAYOUT } from './actions.js';
import { SET_EDITING, CHANGE_LAYOUT_SETTING, CHANGE_MAP_OBJECT, APPLY_OBJECT_SETTING, SET_OBJECTS, ADD_OBJECTS, DELETE_OBJECTS } from './actions.js';
import { CHANGE_SELECT_OBJECTS, BULK_SELECT_OBJECTS, RESET_SELECT_OBJECTS } from './actions.js';
import { CHANGE_ISONLY_VALUELABEL } from './actions.js'; 
import { CHANGE_MAP_SETTING } from './actions.js';
import { SET_OBJECT_SETTING, CHANGE_OBJECT_SETTING, SET_OBJECT_VALIDATE, CHANGE_OBJECT_VALIDATE, CHANGE_OBJBOX_MODE,  CHANGE_MULTI_APPLY } from './actions.js';
import { CHANGE_MODE } from './actions.js';
import { RECORD_LOG, MOVE_LOG_POINTER, CLEAR_LOG } from './actions.js';

//マップ設定初期値
const initMapSetting = {
    show:true,
    isSnap: true,
    gridSize: {
        width: 16,
        height: 12
    },
    gridSizeValidation: {
        state:"success"
    }
};

//ログ初期値
const initLogState = {
    log: [],
    pointer: -1,
    canBack: false,
    canForward: false
}

//オブジェクト設定ボックス初期値
const initObjectSettingBox = {
    data: DEFAULT_OBJECT_SETTING,
    checked: [],
    validation: null,
    isEditMode: false
};

//Actionの処理を行うReducer

/**
 * isReadOnlyのReducer※権限情報(isReadOnly, level)から判定
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function isReadOnly(state = true, action) {
    switch (action.type) {

        case SET_IS_READONLY:
            return action.data;

        default:
            return state;
    }
}

/**
 * lookUpのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function lookUp(state = { layouts:null }, action) {
    switch( action.type ) {

        case SET_LOOKUP:
            return action.value;   

        default:
            return state;
    }
}

/**
 * selectLayoutのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function selectLayout(state = null, action) {
    switch (action.type) {

        case SET_SELECT_LAYOUT:
            if (action.data) {
                return action.data;
            }
            else {
                return null;
            }

        default:
            return state;
    }
}

/**
 * editingのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function editing(state = null, action) {
    switch (action.type) {

        case SET_EDITING:
            if (!action.data) {
                return null;    //編集内容クリア
            }
            let layoutName = _.get(action.data, "layoutName", null);
            const nameValidation = layoutNameInputCheck(layoutName);
            return Object.assign({}, state, { ...action.data, nameValidation: nameValidation });

        case CHANGE_LAYOUT_SETTING:
            //レイアウト名称が変更された場合は入力チェック
            if (action.data.layoutName || action.data.layoutName === "") {
                const nameValidation = layoutNameInputCheck(action.data.layoutName);
                return Object.assign({}, state, { ...action.data, nameValidation: nameValidation });
            }
            return Object.assign({}, state, action.data);

        case CHANGE_MAP_OBJECT:
            //layoutObjectsからidが一致するものを検索して書き換え
            let updateObjects = _.cloneDeep(state.layoutObjects);
            action.data.change.forEach((info) => {
                const targetId = _.findIndex(updateObjects, (o) => { return o.objectId === info.key });
                if (targetId >= 0) {
                    _.set(updateObjects[targetId], action.data.item, info.value);
                }
            });
            const udpate = _.set(state, "layoutObjects", updateObjects);
            return Object.assign({}, state, udpate);

        case SET_OBJECTS:
            return Object.assign({}, state, { layoutObjects: action.data.layoutObjects });

        case ADD_OBJECTS:
            let add = _.cloneDeep(state.layoutObjects);
            //レイアウトオブジェクトの最大値取得
            let addObjectId = getAddObjectId(state.layoutObjects); 
            action.data.forEach((obj, index) => {
                add.push(Object.assign({}, obj, { layoutId: state.layoutId, objectId: obj.objectId ? obj.objectId : addObjectId + index + 1 }));
            })            
            return Object.assign({}, state, { layoutObjects: add });

        case DELETE_OBJECTS:
            let afterDeleteObjects = [];
            state.layoutObjects.forEach((obj) => {
                if (_.find(action.data, _.matchesProperty('objectId', obj.objectId)) === undefined) {
                    afterDeleteObjects.push(obj);
                }
            })
            return Object.assign({}, state, { layoutObjects: afterDeleteObjects});

        case APPLY_OBJECT_SETTING:
            const { setting, target } = action.data;
            let changed = convertObjectSettingBox(setting.data);    //文字列を数値に変換
            if (target.length > 1) {    //1つ以上選択中はチェック状態のもののみ適用する
                changed = _.pick(changed, setting.checked);
            }
            const applied = getAppliedObjects(state.layoutObjects, target, changed);
            return Object.assign({}, state, { layoutObjects: applied});

        default:
            return state;
    }
}

/**
 * selectObjectsIdListのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function selectObjectsIdList(state = [], action) {
    switch (action.type) {

        case CHANGE_SELECT_OBJECTS:
            let objects = _.cloneDeep(state);
            if (action.data.isSelect) {
                if (!_.includes(objects, action.data.objectId)) {
                    objects.push(action.data.objectId);   //選択済みでない場合追加
                }
            }
            else {
                const targetIndex = _.findIndex(objects, (o) => { return o === action.data.objectId});
                if (targetIndex >= 0) {
                    objects.splice(targetIndex, 1);
                }
            }
            return objects;

        case BULK_SELECT_OBJECTS:
            return action.data;

        case RESET_SELECT_OBJECTS:
            return [];

        default:
            return state;
    }
}

/**
 * 測定値ラベルオブジェクトのみ選択中フラグのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function isOnlyValueLabel(state=false, action) {
    switch (action.type){
        case CHANGE_ISONLY_VALUELABEL:
            return action.data;
        default:
            return state;
    }
}

/**
 * mapSettingのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function mapSetting(state = initMapSetting, action) {
    switch (action.type) {

        case CHANGE_MAP_SETTING:
            let changed = _.clone(state);
            if (action.data.key === "show" && !action.data.value) { //非表示時は吸着もオフ
                changed.show = false;
                changed.isSnap = false;
                return changed;
            }
            else if (action.data.key === "gridSize") {
                changed.gridSize = action.data.value
                changed.gridSizeValidation = gridSizeInputCheck(action.data.value);
                return changed;
            }
            return _.set(_.clone(state), action.data.key, action.data.value); 

        default:
            return state;
    }
}

/**
 * objectSettingBoxのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function objectSettingBox(state = initObjectSettingBox, action) {
    switch (action.type) {
        case SET_OBJECT_SETTING:
            return Object.assign({}, state, { data: action.data ? action.data : DEFAULT_OBJECT_SETTING });

        case CHANGE_OBJECT_SETTING:
            return _.set(_.cloneDeep(state), ["data", action.data.item], action.data.value);

        case SET_OBJECT_VALIDATE:
            if (!action.data) {    //クリア
                return Object.assign({}, state, { validation: null}); 
            }
            return Object.assign({}, state, { validation: validateObjectSetting(action.data, action.isMultiSelect) }); 

        case CHANGE_OBJECT_VALIDATE:
            let newValidation = _.cloneDeep(state.validation);
            //値変更・削除
            if (action.data.value) {
                newValidation = _.set(newValidation, action.data.item, action.data.value);
            }
            else {  //クリア(チェック解除時)
                newValidation = _.omit(newValidation, action.data.item);
            }
            //適用可能状態変更
            _.set(newValidation, 'state', getIsApply(newValidation, !action.data.value, state.checked));
           
            return Object.assign({}, state, { validation: newValidation}); 

        case CHANGE_OBJBOX_MODE:
            return Object.assign({}, state, { isEditMode: action.data }); 

        case CHANGE_MULTI_APPLY:
            let checked = _.cloneDeep(state.checked);
            if (!action.data) {
                checked = [];   //全解除
            }
            else if (action.data.value) {   //特定項目チェック  
                checked.push(action.data.item);
            }
            else {  //特定項目チェック解除
                _.remove(checked, (o) => { return o === action.data.item });
            }
            return Object.assign({}, state, { checked: checked }); 

        default:
            return state;
    }
}

/**
 * isEditModeのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function isEditMode(state = false, action) {
    switch (action.type) {

        case CHANGE_MODE:
            return action.data;

        default:
            return state;
    }
}

/**
 * logInfoのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function logInfo(state = initLogState, action) {
    switch (action.type) {

        case RECORD_LOG:
            let update = state.log;
            let pointer = _.cloneDeep(state.pointer);
            update.splice(pointer + 1, update.length - (pointer + 1));
            if (update.length >= 20) {
                update.shift(); //20個以上になる場合は先頭を削除
                pointer = pointer-1;
            }
            update.push(action.data);
            pointer = pointer + 1;
            return { log: update, pointer: pointer, canBack: true, canForward: false } ;

        case MOVE_LOG_POINTER:
            const updatePoint = state.pointer + action.data.changeValue;
            return Object.assign({}, state, { pointer: updatePoint, canBack: updatePoint < 0 ? false : true, canForward: updatePoint === state.log.length - 1 ? false : true });

        case CLEAR_LOG:
            return initLogState;

        default:
            return state;
    }
}

//使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    isReadOnly,
    lookUp,
    selectLayout,
    editing,
    selectObjectsIdList,
    isOnlyValueLabel,
    mapSetting,
    objectSettingBox, 
    isEditMode,
    isLoading,
    logInfo,
    modalState,
    waitingInfo,
    floorMapInfo
});

export default rootReducers;
