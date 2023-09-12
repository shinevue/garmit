/**
 * @license Copyright 2019 DENSO
 * 
 * ElectricLockMap画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import ElectricLockMapPanel from 'ElectricLockMap/ElectricLockMapPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

/**
 * ElectricLockMapPanelのStoreを生成する。
 */
let store = configureStore(rootReducers);

render (
    <Provider store={store}>
        <ElectricLockMapPanel />
    </Provider>
    ,
    document.getElementById('rootContainer')
);