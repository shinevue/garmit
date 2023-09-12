/**
 * @license Copyright 2019 DENSO
 * 
 * レポートスケジュール画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import ReportSchedulePanel from 'ReportSchedule/ReportSchedulePanel';
import ReportScheduleEditPanel from 'ReportSchedule/ReportScheduleEditPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';


//ReportSchedulePanelのStore、historyを生成する。
let store = configureStore(rootReducers);
let history = syncHistoryWithStore(browserHistory, store);

render (
    <Provider store={store}>
        <Router history={history}>
            <Route path="/ReportSchedule" component={ReportSchedulePanel} />
            <Route path="/ReportSchedule/Edit" component={ReportScheduleEditPanel} />
        </Router>
    </Provider>
    ,
    document.getElementById('rootContainer')
);