/**
 * @license Copyright 2017 DENSO
 * 
 * Xxx画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import MainSidebarPanel from 'MainSidebar/MainSidebarPanel';    //TODO：Xxxを修正してください。

import rootReducers from './reducer.js';
import configureStore from './store.js';

//画面初期状態を定義
const initialState = { };

/**
 * XxxPanelのStoreを生成する。
 */
let store = configureStore(rootReducers, initialState);

//TODO：パネル名を画面のコンポート名に変更してください。
render (
    <Provider store={store}>
        <MainSidebarPanel />
    </Provider>
    ,
    document.getElementById('menuContainer')
);