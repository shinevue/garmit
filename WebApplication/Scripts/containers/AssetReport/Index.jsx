/**
 * @license Copyright 2018 DENSO
 * 
 * AssetReport画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import AssetReportPanel from 'AssetReport/AssetReportPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

//画面初期状態を定義 TODO：ドメインオブジェクトが導入されたら、削除予定
const initialState = { };

/**
 * AssetReportPanelのStoreを生成する。
 */
let store = configureStore(rootReducers, initialState);

//TODO：パネル名を画面のコンポート名に変更してください。
render (
    <Provider store={store}>
        <AssetReportPanel />
    </Provider>
    ,
    document.getElementById('rootContainer')
);