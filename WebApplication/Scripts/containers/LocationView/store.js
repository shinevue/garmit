/**
 * @license Copyright 2017 DENSO
 * 
 * LocationView画面のStoreを生成する
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
 * 画面呼び出し時のパラメータなどをセットします。
 * @param {*} rootReducers 
 */
export default function configureStore(rootReducers) {
    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(
        rootReducers, 
        window.devToolsExtension && window.devToolsExtension(),
        applyMiddleware(sagaMiddleware));
    sagaMiddleware.run(rootSaga);

    return store;
}
