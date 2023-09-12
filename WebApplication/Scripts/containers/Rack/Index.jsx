/**
 * @license Copyright 2017 DENSO
 * 
 * Rack画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import RackPanel from 'Rack/RackPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

//画面初期状態を定義
const initialState = { };

/**
 * RackPanelのStoreを生成する。
 */
let store = configureStore(rootReducers, initialState);

render (
    <Provider store={store}>
        <RackPanel />
    </Provider>
    ,
    document.getElementById('rootContainer')
);