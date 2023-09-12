/**
 * @license Copyright 2017 DENSO
 * 
 * Storeを生成する
 */

'use strict';

import { createStore } from 'redux';

/**
 * ストアを生成する
 * @param {*} reducer 
 * @param {*} initialState 
 */
export default function configureStore(reducer, initialState) {

    const store = createStore(
        reducer, 
        initialState, 
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    );

    return store;
}
