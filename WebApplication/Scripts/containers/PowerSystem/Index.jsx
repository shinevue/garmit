/**
 * @license Copyright 2017 DENSO
 * 
 * PowerSystemPanel画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import PowerSystemPanel from 'PowerSystem/PowerSystemPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

//画面初期状態を定義 TODO：ドメインオブジェクトが導入されたら、削除予定
const initialState = {

};

/**
 * PowerSystemPaneのStoreを生成する。
 */
let store = configureStore(rootReducers, initialState);

render (
    <Provider store={store}>
        <PowerSystemPanel />
    </Provider>
    ,
    document.getElementById('rootContainer')
);