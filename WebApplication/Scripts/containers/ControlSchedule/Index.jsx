/**
 * @license Copyright 2018 DENSO
 * 
 * ControlSchedule画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import ControlSchedulePanel from 'ControlSchedule/ControlSchedulePanel';
import ControlScheduleEditPanel from 'ControlSchedule/ControlScheduleEditPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

/**
 * ControlSchedulePanelのStoreを生成する。
 */
let store = configureStore(rootReducers);

let history = syncHistoryWithStore(browserHistory, store);

render (
    <Provider store={store}>
        <Router history={history}>
            <Route path="/ControlSchedule" component={ControlSchedulePanel} />
            <Route path="/ControlSchedule/Edit" component={ControlScheduleEditPanel} />
        </Router>
    </Provider>
    ,
    document.getElementById('rootContainer')
);