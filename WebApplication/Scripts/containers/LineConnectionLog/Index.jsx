/**
 * @license Copyright 2018 DENSO
 * 
 * LineConnectionLog画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import LineConnectionLogPanel from 'LineConnectionLog/LineConnectionLogPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

const initialState = {

};

/**
 * LineConnectionLogPanelのStoreを生成する。
 */
let store = configureStore(rootReducers, initialState);

render (
    <Provider store={store}>
        <LineConnectionLogPanel />
    </Provider>
    ,
    document.getElementById('rootContainer')
);