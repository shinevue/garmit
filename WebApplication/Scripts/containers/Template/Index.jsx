/**
 * @license Copyright 2017 DENSO
 * 
 * Template画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import TemplatePanel from 'Template/TemplatePanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

//画面初期状態を定義
const initialState = { };

/**
 * TemplatePanelのStoreを生成する。
 */
let store = configureStore(rootReducers, initialState);
render (
    <Provider store={store}>
        <TemplatePanel />
    </Provider>
    ,
    document.getElementById('rootContainer')
);