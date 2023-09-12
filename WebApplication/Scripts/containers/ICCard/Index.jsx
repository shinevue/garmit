/**
 * @license Copyright 2021 DENSO
 * 
 * ICカード画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';


import ICCardListPanel from 'ICCard/ICCardListPanel';
import ICCardEditPanel from 'ICCard/ICCardEditPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

const initialState = {
};

let store = configureStore(rootReducers, initialState);

let history = syncHistoryWithStore(browserHistory, store);

render(
    <Provider store={store}>
        <Router history={history}>
            <Route path="/Maintenance/ICCard" component={ICCardListPanel} />
            <Route path="/Maintenance/ICCard/Edit" component={ICCardEditPanel} />
        </Router>
    </Provider>
    ,
    document.getElementById('rootContainer')
);