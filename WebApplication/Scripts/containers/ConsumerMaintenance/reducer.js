/**
 * Copyright 2019 DENSO
 * 
 * コンシューマーメンテナンス画面のReducerを定義する。
 * ReducerはActionを受信してStateを更新する
 * 
 */
import { combineReducers } from 'redux';

import rackUnitMaintenance from 'RackUnitMaintenance/reducer.js';
import authentication from 'Authentication/reducer.js';
import isLoading from 'LoadState/reducer.js';
import modalState from 'ModalState/reducer.js';

//Reducerで処理するAction名をインポートする。


//Reducerの初期値を設定する。


//Actionの処理を行うReducer



//使用するReducerを列挙
const rootReducers = combineReducers({    
    authentication,
    rackUnitMaintenance,
    isLoading,
    modalState
});

export default rootReducers;
