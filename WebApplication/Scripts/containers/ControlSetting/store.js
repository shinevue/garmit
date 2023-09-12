/**
 * @license Copyright 2019 DENSO
 * 
 * ControlSetting画面のStoreを生成する
 * 
 * Storeは、画面のすべての状態を持つオブジェクトです。
 * 
 */
'use strict';

import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './sagas';

/**
 * ストアを生成する
 * @param {*} reducer 
 */
export default function configureStore(reducer) {
    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(
        reducer,
        window.devToolsExtension && window.devToolsExtension(),
        applyMiddleware(sagaMiddleware)
    );
    sagaMiddleware.run(rootSaga);
    return store;
}
