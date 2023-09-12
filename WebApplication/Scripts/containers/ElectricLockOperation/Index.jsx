/**
 * @license Copyright 2019 DENSO
 * 
 * 電気錠操作画面の構成を定義する
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import ElectricLockListPanel from 'ElectricLockOperation/ElectricLockListPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

//画面初期状態を定義
const initialState = {
    
};

let store = configureStore(rootReducers, initialState);

render (
    <Provider store={store}>
        <ElectricLockListPanel />
    </Provider>
    ,
    document.getElementById('rootContainer')
);