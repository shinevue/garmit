/**
 * @license Copyright 2017 DENSO
 * 
 * Reducerを定義する。
 * ReducerはActionを受信してStateを更新する
 * 
 */
'use strict';

import { combineReducers } from 'redux';

//メニュー用のReducerをインポート
import { LOAD_MESSAGE, ADD_MESSAGE, ADD_COUNT } from './actions.js';

/**
 * サンドボックス画面のReducer
 */
function sample(state=[], action) {

    switch( action.type ) {

        case LOAD_MESSAGE:
            return Object.assign({}, state, action.data);

        case ADD_MESSAGE:
            return  Object.assign({},state, {
                sampleItems:[
                    ...state.sampleItems,
                    {
                        message: action.data.message,
                        time: action.data.time
                    }
                ]
            });

        default:
            return state;
    }
}

function count(state=1, action) {
    
        switch( action.type ) {
    
            case ADD_COUNT:
                return ++state;
            default:
                return state;
        }
    }

//Sabdboxで使用するReducerを列挙
const rootReducers = combineReducers({
    sample,
    count
});

export default rootReducers;
