/**
 * @license Copyright 2018 DENSO
 * 
 * CardReadLog画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import CardReadLogPanel from 'CardReadLog/CardReadLogPanel';    //TODO：CardReadLogを修正してください。

import rootReducers from './reducer.js';
import configureStore from './store.js';

/**
 * ControlLogPanelのStoreを生成する。
 */
let store = configureStore(rootReducers);

render(
    <Provider store={store}>
        <CardReadLogPanel />
    </Provider>
    ,
    document.getElementById('rootContainer')
);