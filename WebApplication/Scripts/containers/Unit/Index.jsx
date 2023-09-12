/**
 * @license Copyright 2017 DENSO
 * 
 * Unit画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import UnitPanel from 'Unit/UnitPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

//画面初期状態を定義
const initialState = { };

/**
 * UnitPanelのStoreを生成する。
 */
let store = configureStore(rootReducers, initialState);

render (
    <Provider store={store}>
        <UnitPanel />
    </Provider>
    ,
    document.getElementById('rootContainer')
);