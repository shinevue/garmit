/**
 * @license Copyright 2017 DENSO
 * 
 * RobotControl画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import LocationViewPanel from 'LocationView/LocationViewPanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';


/**
 * RobotControlPanelのStoreを生成する。
 */
let store = configureStore(rootReducers);

render(
    <Provider store={store}>
        <LocationViewPanel />
    </Provider>
    ,
    document.getElementById('rootContainer')
);