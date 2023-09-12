/**
 * @license Copyright 2020 DENSO
 * 
 * 回線画面のStoreを生成する
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
 * @param {*} reducer 
 */
export default function configureStore(reducer) {
    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(
        reducer,
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
        applyMiddleware(sagaMiddleware)
    );
    sagaMiddleware.run(rootSaga);
    return store;
}