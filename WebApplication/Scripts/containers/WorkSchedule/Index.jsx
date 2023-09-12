/**
 * @license Copyright 2017 DENSO
 * 
 * スケジュール画面の構成を定義する
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import WorkSchedulePanel from 'WorkSchedule/WorkSchedulePanel';
import ScheduleEditPanel from 'WorkSchedule/ScheduleEditPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

let store = configureStore(rootReducers);
let history = syncHistoryWithStore(browserHistory, store);

render (
    <Provider store={store}>
        <Router history={history}>
            <Route path="/WorkSchedule" component={WorkSchedulePanel} />
            <Route path="/WorkSchedule/Edit" component={ScheduleEditPanel} />
        </Router>
    </Provider>
    ,
    document.getElementById('rootContainer')
);