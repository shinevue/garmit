/**
 * @license Copyright 2018 DENSO
 * 
 * Network画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import NetworkListPanel from 'NetworkConnection/NetworkListPanel';
import NetworkEditPanel from 'NetworkConnection/NetworkEditPanel';
import NetworkViewPanel from 'NetworkConnection/NetworkViewPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

/**
 * NetworkListPanelのStoreを生成する。
 */
let store = configureStore(rootReducers);

let history = syncHistoryWithStore(browserHistory, store);

render (
    <Provider store={store}>
        <Router history={history}>
            <Route path="/NetworkConnection" component={NetworkListPanel} />
            <Route path="/NetworkConnection/Edit" component={NetworkEditPanel}/>
            <Route path="/NetworkConnection/Disp" component={NetworkViewPanel}/>
        </Router>
    </Provider>
    ,
    document.getElementById('rootContainer')
);