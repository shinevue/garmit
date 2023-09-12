/**
 * @license Copyright 2020 DENSO
 * 
 * 案件スケジュール画面の構成を定義する
 * ReduxのStoreを初期化し、コンポーネントと結びつけます。
 * 
 */
'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import ProjectSchedulePanel from 'ProjectSchedule/ProjectSchedulePanel';

import rootReducers from './reducer.js';
import configureStore from './store.js';

/**
 * ProjectSchedulePanelのStoreを生成する。
 */
let store = configureStore(rootReducers);

render (
    <Provider store={store}>
        <ProjectSchedulePanel />
    </Provider>
    ,
    document.getElementById('rootContainer')
);