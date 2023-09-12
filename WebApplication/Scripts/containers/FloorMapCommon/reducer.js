/**
 * Copyright 2017 DENSO Solutions
 * 
 * FloorMapCommonのReducerを定義する。
 * ReducerはActionを受信してStateを更新する
 * 
 */
import { combineReducers } from 'redux';

//Reducerをインポート
import { SET_SELECT_LAYOUT, UPDATE_LAYOUT } from './actions.js';
import { CHANGE_CHECK_STATE, SET_OPTIONS, UNCHECK_OPTIONS, CHANGE_SWITCH_STATE } from './actions.js';
import { SET_LAYOUT_OBJ} from './actions.js';
import { SET_SELECT_OBJECT, SET_OBJECT_LINK, CLEAR_SELECT_OBJECT } from './actions.js';
import { SET_DRAWING_AREA } from './actions.js';
import { CHANGE_INDEX, ADD_LAYOUT_LOG } from './actions.js';
import { SET_IS_CONVERT } from './actions.js';

import { MAP_DRAWING_AREA_INIT } from 'constant';
import { getEgrouptMapData, makeMapLayoutObjectData } from 'makeOmitData';

const initLayoutList = {
    layoutIdList: [],
    index: -1,
    canBack: false,
    canForward:false
}
const drawingAreaInit= _.cloneDeep(MAP_DRAWING_AREA_INIT);

const selectObjectInfoInit = { selectObject: null, objectLinkInfo: null };

/**
 * 選択中レイアウト情報のReducer
 */
function selectLayout(state = null, action) {

    switch (action.type) {

        case SET_SELECT_LAYOUT:
            return action.data;

        case UPDATE_LAYOUT:
            return action.data;

        default:
            return state;
    }
}

/**
 * 選択されたレイアウトIDの配列と選択中レイアウトインデックス情報のReducer
 */
function selectedLayoutList(state = initLayoutList, action) {
    let update = $.extend(true, {}, state);
    switch (action.type) {

        case ADD_LAYOUT_LOG:
            update.layoutIdList.splice(state.index + 1, state.layoutIdList.length - (state.index + 1));
            if (update.layoutIdList.length > 20) {
                //記録できるのは21個までとする(20回戻れる)
                //21個以上になる場合は先頭を削除
                update.layoutIdList.shift();
                update.index--;
            }            
            update.layoutIdList.push(action.data);
            update.index++;
            update.canBack = update.index === 0 ? false : true;
            update.canForward = update.layoutIdList.length === update.index + 1 ? false : true;

            return update;

        case CHANGE_INDEX:
            update.index += action.data;
            update.canBack = update.index === 0 ? false : true;
            update.canForward = update.layoutIdList.length === update.index + 1 ? false : true;
            return update;

        default:
            return state;
    }
}

/**
 * 表示マップ選択情報のReducer
 */
function floorMapOptionInfo(state = [], action) {

    switch (action.type) {

        case UNCHECK_OPTIONS:
            return _.map(_.cloneDeep(state), (option) => {
                _.set(option, 'check', false);
                if (_.get(option, 'switchInfo.check')) {
                    option.switchInfo.check = false;    //スイッチのチェックがある場合チェック解除
                }
                return option;
            })

        case CHANGE_CHECK_STATE:
        case CHANGE_SWITCH_STATE:
            let update = _.cloneDeep(state);
            let targetIndex = _.findIndex(update, { 'optionId': action.data.optionId });
            let path = [];
            if (action.type === CHANGE_CHECK_STATE) {
                path = [targetIndex, 'check'];
            }
            else {
                path = [targetIndex, 'switchInfo', 'check'];
            }
            return targetIndex >= 0 ? _.set(update, path, action.data.isChecked):state;

        case SET_OPTIONS:
            const options = _.map(action.options, (option) => {
                const match = _.find(action.titles, { 'optionId': option.optionId });
                return Object.assign({}, option, match);
            });
            return _.remove(options, (option) => { return option.available });  //利用できるもののみ保存する

        default:
            return state;
    }
}

/**
 * 選択中オブジェクト情報のReducer
 */
function selectObjectInfo(state = selectObjectInfoInit, action) {
    switch (action.type) {

        case SET_SELECT_OBJECT:
            return {
                selectObject: action.data,
                objectLinkInfo: _.cloneDeep(state.objectLinkInfo)
            };

        case SET_OBJECT_LINK:
            return {
                selectObject: _.cloneDeep(state.selectObject),
                objectLinkInfo: action.data
            };

        case CLEAR_SELECT_OBJECT:
            return selectObjectInfoInit;

        default:
            return state;
    }
}

/**
 * マップ描画領域のReducer
 */
function drawingArea(state = drawingAreaInit, action) {

    switch (action.type) {
        case SET_DRAWING_AREA:
            return action.data;
        default:
            return state;
    }
}

/**
 * 換算値チェックボックス情報のReducer
 */
function isConvert(state = false, action) {

    switch (action.type) {
        case SET_IS_CONVERT:
            return action.data;

        default:
            return state;
    }
}

//FloorMapで使用するReducerを列挙
export const floorMapInfo = combineReducers({
    drawingArea,
    isConvert
});

//FloorMapで使用するReducerを列挙
const rootReducers = combineReducers({
    selectLayout,
    selectObjectInfo,
    selectedLayoutList,
    floorMapOptionInfo,
    floorMapInfo,
});

export default rootReducers;
