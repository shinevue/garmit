/**
 * @license Copyright 2019 DENSO
 * 
 * ControlSetting画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import ControlSettingPanel from 'ControlSetting/ControlSettingPanel';
import ControlSettingEditPanel from 'ControlSetting/ControlSettingEditPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

let store = configureStore(rootReducers);
let history = syncHistoryWithStore(browserHistory, store);

render (    
    <Provider store={store}>
        <Router history={history}>
            <Route path="/Maintenance/ControlSetting" component={ControlSettingPanel} />
            <Route path="/Maintenance/ControlSetting/Edit" component={ControlSettingEditPanel} />
        </Router>
    </Provider>
    ,
    document.getElementById('rootContainer')
);