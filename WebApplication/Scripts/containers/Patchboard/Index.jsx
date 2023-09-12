/**
 * @license Copyright 2020 DENSO
 * 
 * Patchboard画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import PatchboardPanel from 'Patchboard/PatchboardPanel'; 
import PatchboardEditPanel from 'Patchboard/PatchboardEditPanel'; 
import PatchboardDispPanel from 'Patchboard/PatchboardDispPanel'; 

import rootReducers from './reducer.js';
import configureStore from './store.js';

/**
 * PatchboardPanelのStoreを生成する。
 */
let store = configureStore(rootReducers);
let history = syncHistoryWithStore(browserHistory, store);

//TODO：パネル名を画面のコンポート名に変更してください。
render (
    <Provider store={store}>
        <Router history={history}>
            <Route path="/Patchboard" component={PatchboardPanel} />
            <Route path="/Patchboard/Edit" component={PatchboardEditPanel} />
            <Route path="/Patchboard/Disp" component={PatchboardDispPanel} />
        </Router>
    </Provider>
    ,
    document.getElementById('rootContainer')
);