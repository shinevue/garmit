/**
 * @license Copyright 2017 DENSO
 * 
 * ユーザー画面の構成を定義する
 */

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import UserListPanel from 'User/UserListPanel';
import UserEditPanel from 'User/UserEditPanel';

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
            <Route path="Maintenance/User" component={UserListPanel} />
            <Route path="Maintenance/User/Edit" component={UserEditPanel}/>
        </Router>
    </Provider>
    ,
    document.getElementById('rootContainer')
);