/**
 * @license Copyright 2017 DENSO
 * 
 * コンシューマー画面の構成を定義する
 */

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import ConsumerListPanel from 'Consumer/ConsumerListPanel';
import ConsumerEditPanel from 'Consumer/ConsumerEditPanel';

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
            <Route path="Consumer" component={ConsumerListPanel} />
            <Route path="Consumer/Edit" component={ConsumerEditPanel}/>
        </Router>
    </Provider>
    ,
    document.getElementById('rootContainer')
);