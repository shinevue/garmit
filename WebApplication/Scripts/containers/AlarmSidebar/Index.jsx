/**
 * @license Copyright 2018 DENSO
 * 
 * アラームサイドバーの構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import AlarmSidebarPanel from 'AlarmSidebar/AlarmSidebarPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

//画面初期状態を定義
const initialState = {};

/**
 * アラームサイドバーのStoreを生成する。
 */
let store = configureStore(rootReducers, initialState);

render (
    <Provider store={store}>
        <AlarmSidebarPanel />
    </Provider>
    ,
    document.getElementById('alarmContainer')
);