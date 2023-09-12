/**
 * Copyright 2017 DENSO Solutions Solutions
 * 
 * ポイント画面の構成を定義する
 */

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import PointListPanel from 'Point/PointListPanel';
import PointEditPanel from 'Point/PointEditPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

//画面初期状態を定義 TODO：ドメインオブジェクトが導入されたら、削除予定
const initialState = {
    
};


let store = configureStore(rootReducers, initialState);

let history = syncHistoryWithStore(browserHistory, store);

render (
    <Provider store={store}>
        <Router history={history}>
            <Route path="/Maintenance/Point" component={PointListPanel} />
            <Route path="/Maintenance/Point/Edit" component={PointEditPanel} />
        </Router>
    </Provider>
    ,
    document.getElementById('rootContainer')
);