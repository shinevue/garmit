/**
 * Copyright 2017 DENSO Solutions Solutions
 * 
 * キャパシティ画面の構成を定義する
 */

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import RackCapacityPanel from 'RackCapacity/RackCapacityPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

//画面初期状態を定義
export const initialState = {
};

let store = configureStore(rootReducers, initialState);

render (
    <Provider store={store}>
        <RackCapacityPanel />
    </Provider>
    ,
    document.getElementById('rootContainer')
);