/**
 * @license Copyright 2017 DENSO
 * 
 * UnitMaintenance画面のStoreを生成する
 * 
 * Storeは、画面のすべての状態を持つオブジェクトです。
 * 
 */
'use strict';

import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootSaga from 'RackUnitMaintenance/sagas';

/**
 * ストアを生成する
 * 画面呼び出し時のパラメータなどをセットします。
 * @param {*} reducer 
 * @param {*} initialState 
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
