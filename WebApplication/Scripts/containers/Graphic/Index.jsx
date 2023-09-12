/**
 * @license Copyright 2018 DENSO
 * 
 * Xxx画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import GraphicPanel from 'Graphic/GraphicPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

/**
 * GraphicPanelのStoreを生成する。
 */
let store = configureStore(rootReducers);

render (
    <Provider store={store}>
        <GraphicPanel />
    </Provider>
    ,
    document.getElementById('rootContainer')
);