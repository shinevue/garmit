/**
 * @license Copyright 2017 DENSO
 * 
 * サンドボックス画面の構成を定義する
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import ImageListPanel from 'Image/ImageListPanel';
import ImageEditPanel from 'Image/ImageEditPanel';

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
            <Route path="/Maintenance/Image" component={ImageListPanel} />
            <Route path="/Maintenance/Image/Edit" component={ImageEditPanel} />
        </Router>
    </Provider>
    ,
    document.getElementById('rootContainer')
);