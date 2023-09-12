/**
 * @license Copyright 2020 DENSO
 *
 * Top画面(ダッシュボード)の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import TopPanel from 'Top/TopPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

const initialState = {
};

/**
 * TopPanelのStoreを生成する。
 */
let store = configureStore(rootReducers, initialState);

render (
    <Provider store={store}>
        <TopPanel />
    </Provider>
    ,
    document.getElementById('rootContainer')
);