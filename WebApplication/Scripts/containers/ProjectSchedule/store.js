/**
 * @license Copyright 2020 DENSO
 * 
 * Storeを生成する
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
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
        applyMiddleware(sagaMiddleware)
    );
    sagaMiddleware.run(rootSaga);

    return store;
}
