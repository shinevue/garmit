/**
 * @license Copyright 2020 DENSO
 * 
 * 回線画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import LinePanel from 'Line/LinePanel';
import LineEditPanel from 'Line/LineEditPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

/**
 * LineConstructionPanelのStoreを生成する。
 */
let store = configureStore(rootReducers);
let history = syncHistoryWithStore(browserHistory, store);

render (
    <Provider store={store}>
        <Router history={history}>
            <Route path="/Line" component={LinePanel} />
            <Route path="/Line/Edit" component={LineEditPanel} />
        </Router>
    </Provider>
    ,
    document.getElementById('rootContainer')
);