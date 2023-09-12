/**
 * @license Copyright 2017 DENSO
 * 
 * RackMaintenance画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import RackMaintenancePanel from 'RackMaintenance/RackMaintenancePanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

/**
 * RackMaintenancePanelのStoreを生成する。
 */
let store = configureStore(rootReducers);

render (
    <Provider store={store}>
        <RackMaintenancePanel />
    </Provider>
    ,
    document.getElementById('rootContainer')
);