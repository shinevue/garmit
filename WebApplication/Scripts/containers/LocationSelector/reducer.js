/**
 * @license Copyright 2018 DENSO
 * 
 * ロケーション選択用のReducerを定義する。
 * ロケーション選択ツリービューに対するResucerを記述する。
 * 
 */
'use strict';

import { __esModule } from 'react-redux';
import { combineReducers } from 'redux';

//Reducerで処理するAction名をインポートする。
import { SET_LOCATIONS, SET_LAYOUTS, SELECT_LOCATION, CLEAR_LOCATION, SELECT_LAYOUT_OBJECT, CLEAR_LAYOUT_OBJECT } from './actions.js';

//Reducerの初期値を設定する。
const initialState = {
    locations: [],
    layouts: [],
    selectedLocation: {
        location: null,
        position: []
    },
    selectedLayoutObject: null
};

//Actionの処理を行うReducer

/**
 * ロケーションリストを更新する
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @returns {*} 更新後のstate
 */
function locations(state=initialState.locations, action) {
    switch( action.type ) {

        case SET_LOCATIONS:
            return  Object.assign([], state, action.value );

        default:
            return state;
    }
}

/**
 * レイアウトリストを更新する
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @returns {*} 更新後のstate
 */
function layouts(state=initialState.layouts, action) {
    switch( action.type ) {

        case SET_LAYOUTS:
            return action.value ? _.cloneDeep(action.value) : [];

        default:
            return state;
    }    
}

/**
 * 選択中のロケーションを更新する
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @returns {*} 更新後のstate
 */
export function selectedLocation(state=initialState.selectedLocation, action){
    switch( action.type ) {

        case SELECT_LOCATION:
            var location = Object.assign({}, action.value);
            
            var position = [];
            if (action.position) {
                position = action.position.slice();
            } else if (location) {
                position = makeLocationPosition(location);
            }

            return Object.assign({}, state, {
                location : location,
                position : position
            });
             
        case CLEAR_LOCATION:
            return {
                location: null,
                position: []
            };

        default:
            return state;
    }
}

/**
 * 選択中のレイアウトオブジェクトを更新する
 * @param {*} state 更新前のstate
 * @param {*} action 更新内容
 * @returns {*} 更新後のstate
 */
export function selectedLayoutObject(state=initialState.selectedLayoutObject, action){
    switch( action.type ) {

        case SELECT_LAYOUT_OBJECT:
            return action.value ? _.cloneDeep(action.value) : null;
             
        case CLEAR_LAYOUT_OBJECT:
            return null

        default:
            return state;
    }
}

/**
 * ロケーションの配置を取得する
 */
function makeLocationPosition(location){
    var position = [];
    position.unshift(location);
    if(location.parent){
        position.unshift(...makeLocationPosition(location.parent))
    }
    return position;
}


//使用するReducerを列挙
const locationSelector = combineReducers({
    locations,
    layouts,
    selectedLocation,
    selectedLayoutObject
});

export default locationSelector;
