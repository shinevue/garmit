/**
 * Copyright 2017 DENSO Solutions
 * 
 * Storeを生成する
 */

import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './sagas';

/**
 * ストアを生成する
 * @param {*} reducer 
 * @param {*} initialState 
 */
export default function configureStore(reducer) {
    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(
        reducer, 
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
        applyMiddleware(sagaMiddleware));
        sagaMiddleware.run(rootSaga);

    return store;
}
