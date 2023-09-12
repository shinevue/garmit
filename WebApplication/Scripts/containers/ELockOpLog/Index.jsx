﻿/**
 * @license Copyright 2020 DENSO
 * 
 * ELockOpLog画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import ELockOpLogPanel from 'ELockOpLog/ELockOpLogPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

//画面初期状態を定義
const initialState = {
// topMenu キーが存在することで Redux がエラーを出力していたため、
// OperationLog/Index.jsx に合わせて削除。
};

/**
 * ELockOpLogPanelのStoreを生成する。
 */
let store = configureStore(rootReducers, initialState);

render (
    <Provider store={store}>
        <ELockOpLogPanel />
    </Provider>
    ,
    document.getElementById('rootContainer')
);