/**
 * @license Copyright 2017 DENSO
 * 
 * LocationMaintenance画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import LocationMaintenancePanel from 'LocationMaintenance/LocationMaintenancePanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

//画面初期状態を定義 TODO：ドメインオブジェクトが導入されたら、削除予定
const initialState = {

};


/**
 * RackMaintenancePanelのStoreを生成する。
 */
let store = configureStore(rootReducers, initialState);

render (
    <Provider store={store}>
        <LocationMaintenancePanel />
    </Provider>
    ,
    document.getElementById('rootContainer')
);