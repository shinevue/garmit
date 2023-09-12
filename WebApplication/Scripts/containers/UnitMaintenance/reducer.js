/**
 * @license Copyright 2017 DENSO
 * 
 * UnitMaintenancePanelのReducerを定義する。
 * ReducerはActionを受信してStateを更新する。
 * 
 * 注意点
 * ・引数で渡されたstateやactionそのものを変更してはいけません。
 * 　stateを変更するには、previousState を直接いじるのではなく、新しいオブジェクトを作成して返却します。
 * 
 */
'use strict';

import { combineReducers } from 'redux';

import rackUnitMaintenance from 'RackUnitMaintenance/reducer.js';
import authentication from 'Authentication/reducer.js';
import isLoading from 'LoadState/reducer.js';
import modalState from 'ModalState/reducer.js';

import { SET_UNIT_TYPES } from './actions.js';

//Reducerの初期値を設定する。

//Actionの処理を行うReducer
/**
 * unitTypesのReducer
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @return {*} 更新後のstate
 */
function unitTypes(state = null, action) {

    switch (action.type) {

        case SET_UNIT_TYPES:
            let types = [];
            action.value.forEach((type) => {
                types.push({ value: type.typeId, name: type.name });
            })
            return types;

        default:
            return state;
    }
}

//使用するReducerを列挙
const rootReducers = combineReducers({
    authentication,
    rackUnitMaintenance,
    unitTypes,
    isLoading,
    modalState
});

export default rootReducers;
