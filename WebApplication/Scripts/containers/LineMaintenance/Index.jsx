/**
 * @license Copyright 2020 DENSO
 * 
 * 回線メンテナンス画面の構成を定義する
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import LineMaintenancePanel from 'LineMaintenance/LineMaintenancePanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

//画面初期状態を定義

let store = configureStore(rootReducers);

render(
    <Provider store={store}>
        <LineMaintenancePanel />
    </Provider>
    ,
    document.getElementById('rootContainer')
);