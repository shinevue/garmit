/**
 * @license Copyright 2019 DENSO
 * 
 * 電気錠設定画面の構成を定義する
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import ElectricLockSettingListPanel from 'ElectricLockSetting/ElectricLockSettingListPanel';
import ElectricLockSettingEditPanel from 'ElectricLockSetting/ElectricLockSettingEditPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

//画面初期状態を定義
const initialState = {
    
};

let store = configureStore(rootReducers, initialState);

let history = syncHistoryWithStore(browserHistory, store);

render (
    <Provider store={store}>
        <Router history={history}>
            <Route path="/Maintenance/ElectricLockSetting" component={ElectricLockSettingListPanel} />
            <Route path="/Maintenance/ElectricLockSetting/Edit" component={ElectricLockSettingEditPanel} />
        </Router>
    </Provider>
    ,
    document.getElementById('rootContainer')
);