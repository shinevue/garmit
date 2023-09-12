/**
 * @license Copyright 2019 DENSO
 * 
 * ControlLog画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import ControlLogPanel from 'ControlLog/ControlLogPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

/**
 * ControlLogPanelのStoreを生成する。
 */
let store = configureStore(rootReducers);

render (
    <Provider store={store}>
        <ControlLogPanel />
    </Provider>
    ,
    document.getElementById('rootContainer')
);