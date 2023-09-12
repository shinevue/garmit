/**
 * @license Copyright 2018 DENSO
 * 
 * バッテリ監視画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import BatteryPanel from 'Battery/BatteryPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

/**
 * BatteryPanelのStoreを生成する。
 */
let store = configureStore(rootReducers);

render (
    <Provider store={store}>
        <BatteryPanel />
    </Provider>
    ,
    document.getElementById('rootContainer')
);