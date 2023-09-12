/**
 * Copyright 2019 DENSO
 * 
 * Storeを生成する
 */

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
        window.devToolsExtension && window.devToolsExtension());

    return store;
}
