/**
 * Copyright 2017 DENSO Solutions Solutions
 * 
 * サンドボックス画面の構成を定義する
 */

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import LogoutPanel from 'Logout/LogoutPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

//画面初期状態を定義
const initialState = {

};

let store = configureStore(rootReducers, initialState);

render (
    <Provider store={store}>
        <LogoutPanel />
    </Provider>
    ,
    document.getElementById('rootContainer')
);