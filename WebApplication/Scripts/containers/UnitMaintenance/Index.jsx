/**
 * @license Copyright 2017 DENSO
 * 
 * UnitMaintenance画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import UnitMaintenancePanel from 'UnitMaintenance/UnitMaintenancePanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';


/**
 * UnitMaintenancePanelのStoreを生成する。
 */
let store = configureStore(rootReducers);

render (
    <Provider store={store}>
        <UnitMaintenancePanel />
    </Provider>
    ,
    document.getElementById('rootContainer')
);