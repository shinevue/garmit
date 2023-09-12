/**
 * @license Copyright 2020 DENSO
 * 
 * 案件画面の構成を定義する
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import ProjectPanel from 'Project/ProjectPanel';
import ProjectEditPanel from 'Project/ProjectEditPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

/**
 * ProjectPanelのStoreを生成する。
 */
let store = configureStore(rootReducers);
let history = syncHistoryWithStore(browserHistory, store);

render (
    <Provider store={store}>
        <Router history={history}>
            <Route path="/Project" component={ProjectPanel} />
            <Route path="/Project/Edit" component={ProjectEditPanel} />
        </Router>
    </Provider>
    ,
    document.getElementById('rootContainer')
);