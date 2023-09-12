/**
 * @license Copyright 2017 DENSO
 * 
 * LocationMaintenancePanelのReducerを定義する。
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
import waitingInfo from 'WaitState/reducer';
import modalState from 'ModalState/reducer';
import isLoading from 'LoadState/reducer';

//Reducerで処理するAction名をインポートする。
import {
    SET_LOCATION_LIST,
    SET_LOOKUP,
    SET_SELECT_LOCATION,
    SET_SORT_LOCATIONS,
    SET_EDIT_LOCATION,
    CHANGE_LOCATION_ORDER,
    CHANGE_LOCATION_NAME,
    CHANGE_IS_RACK,
    CHANGE_RACK_TYPE,
    CHANGE_RACK_INFO
} from './actions.js';
import { makeLocationTreeData, omitLocation, omitList } from 'makeOmitData';

//Reducerの初期値を設定する。
const lookUpInit = {
    rackTypes: null,
    rackStatuses:null
};

const selectLocInit = {
    location: null,
    position: null
};

//Actionの処理を行うReducer

/**
 * locationListのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function locationList(state=null, action) {
    switch( action.type ) {

        case SET_LOCATION_LIST:
            //不要な値を削除して許可状態アイコン情報を付与する
            const properties = ["systemId", "locationId", "name", "isAllowed", "parent", "isRack", "rack", "children", "dispIndex", "level"];
            return makeLocationTreeData(action.value, properties);

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
function lookUp(state = lookUpInit, action) {
    switch (action.type) {

        case SET_LOOKUP:
            const rackTypes = $.extend(true, [], action.value.rackTypes);
            rackTypes.map((type) => {
                type.value = type.typeId;
                return type;
            });

            const rackStatuses = $.extend(true, [], action.value.rackStatuses);
            rackStatuses.map((status) => {
                status.value = status.statusId;
                return status;
            });

            return {
                rackTypes: rackTypes,
                rackStatuses: rackStatuses
            };

        default:
            return state;
    }
}

/**
 * selectLocationのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function selectLocation(state = selectLocInit, action) {
    switch (action.type) {

        case SET_SELECT_LOCATION:
            
            const properties = ["systemId", "locationId", "name", "parent", "isRack", "rack", 'isAllowed', 'nodeId', "level"];
            let location = action.location && _.pick(_.cloneDeep(action.location), properties);
            if (location) {
                location.hasChild = _.size(action.location.children) > 0;    //子ノードがあるかどうかを持っておく（ラックとして登録できるか判定）
            }
            return {
                location: location,
                position: action.position && omitList(_.cloneDeep(action.position), ['locationId', 'id', 'name'])
            };

        default:
            return state;
    }
}

/**
 * sortLocationsのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function sortLocations(state = null, action) {
    switch (action.type) {

        case SET_SORT_LOCATIONS:
            if (action.value) {
                let locations = _.cloneDeep(action.value);
                return locations.map((location) => {
                    return omitLocation(location, ["systemId", "locationId", "name", "isAllowed", "parent", "dispIndex", "isRack", "rack", "children", "level"]);
                })
            }
            else {
                return null;    //値クリア
            }

        default:
            return state;
    }
}

/**
 * editLocationのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function editLocation(state = null, action) {
    switch (action.type) {

        case SET_SELECT_LOCATION:
            return Object.assign({}, action.location);

        case SET_EDIT_LOCATION:
            return Object.assign({}, action.value);

        case CHANGE_LOCATION_NAME:
            return { ...Object.assign({}, state), name: action.value };

        case CHANGE_IS_RACK:
            return { ...Object.assign({}, state), isRack: action.value };

        case CHANGE_RACK_INFO:
            return { ...Object.assign({}, state), rack: action.value };

        default:
            return state;
    }
}

//使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    locationList,
    lookUp,
    selectLocation,
    sortLocations,
    editLocation,
    waitingInfo,
    modalState,
    isLoading
});

export default rootReducers;
