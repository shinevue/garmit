/**
 * Copyright 2017 DENSO Solutions Solutions
 * 
 * フロアマップ画面の構成を定義する
 */

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import FloorMapPanel from 'FloorMap/FloorMapPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

//画面初期状態を定義
export const initialState = {
    incidentInfo: {
        headers: null,
        rows: null
    }
};

let store = configureStore(rootReducers, initialState);

render (
    <Provider store={store}>
        <FloorMapPanel />
    </Provider>
    ,
    document.getElementById('rootContainer')
);