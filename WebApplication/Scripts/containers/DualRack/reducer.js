/**
 * @license Copyright 2018 DENSO
 * 
 * 左右のラック、ロケーション選択用のReducerを定義する。
 * ReducerはActionを受信してStateを更新する。
 * 
 */
'use strict';

import { combineReducers } from 'redux';

//Reducerで処理するAction名をインポート
import { SET_LOCATION, SET_LAYOUT_OBJECT, SET_RACK, CLEAR_RACK, SET_RACKPOWER_VALUES } from './actions.js';

//Reducerの初期値を設定する。
const initialState = {
    location: {
        location: null,             //ロケーション
        position: []                //ロケーション位置
    },
    layoutObject: null,
    rack: { 
        rackId: '',
        rackName: '',
        row: 0, 
        col: 0,
        weight: 0,
        load: 0,
        links: [],
        unitDispSettings: [],
        extendedPages: [],
        powers: [],
        comment: ''
    },
    rackPowerValues: []
};

/********************************************
 * Actionの処理を行うReducer
 ********************************************/

/**
 * 左側ラック情報を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function leftRack(state=initialState, action) {
    switch( action.type ) {

        case SET_LOCATION:
            var leftRack = Object.assign({}, state);
            if (action.isLeft) {
                var location = Object.assign({}, action.location);
                var position = [];
                if (action.position) {
                    position = action.position.slice();
                } else if (location) {
                    position = makeLocationPosition(location);
                }
                leftRack.location = {
                    location : location,
                    position : position
                };
            }
            return leftRack;

        case SET_LAYOUT_OBJECT:
            var leftRack = _.cloneDeep(state);
            if (action.isLeft) {
                leftRack.layoutObject = action.layoutObject ? _.cloneDeep(action.layoutObject) : null;
            }
            return leftRack;

        case SET_RACK:
            var leftRack = Object.assign({}, state);
            if (action.isLeft) {
                leftRack.rack = Object.assign({}, action.rack);
            }
            return leftRack;

        case SET_RACKPOWER_VALUES:
            var leftRack = Object.assign({}, state);
            if (action.isLeft) {
                leftRack.rackPowerValues = Object.assign([], action.values);
            }
            return leftRack;
            
        case CLEAR_RACK:
            var leftRack = Object.assign({}, state);
            if (action.isLeft) {
                leftRack = initialState;
            }
            return leftRack;

        default:
            return state;
    }
}


/**
 * 右側ラック情報を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function rightRack(state=initialState, action) {
    switch( action.type ) {

        case SET_LOCATION:
            var rightRack = Object.assign({}, state);
            if (!action.isLeft) {
                var location = Object.assign({}, action.location);
                var position = [];
                if (action.position) {
                    position = action.position.slice();
                } else if (location) {
                    position = makeLocationPosition(location);
                }
                rightRack.location = {
                    location : location,
                    position : position
                };
            }
            return rightRack;

        case SET_LAYOUT_OBJECT:
            var rightRack = _.cloneDeep(state);
            if (!action.isLeft) {
                rightRack.layoutObject = action.layoutObject ? _.cloneDeep(action.layoutObject) : null;
            }
            return rightRack;

        case SET_RACK:
            var rightRack = Object.assign({}, state);
            if (!action.isLeft) {
                rightRack.rack = Object.assign({}, action.rack);
            }
            return rightRack;

        case SET_RACKPOWER_VALUES:
            var rightRack = Object.assign({}, state);
            if (!action.isLeft) {
                rightRack.rackPowerValues = Object.assign([], action.values);
            }
            return rightRack;

        case CLEAR_RACK:
            var rightRack = Object.assign({}, state);
            if (!action.isLeft) {
                rightRack = initialState
            }
            return rightRack;

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
const rootReducers = combineReducers({
    leftRack,
    rightRack
});

export default rootReducers;
