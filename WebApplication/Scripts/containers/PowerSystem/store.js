/**
 * @license Copyright 2017 DENSO
 * 
 * EditPowerSystem画面のStoreを生成する
 * 
 * Storeは、画面のすべての状態を持つオブジェクトです。
 * 
 */
'use strict';

import { createStore } from 'redux';

/**
 * ストアを生成する
 * 画面呼び出し時のパラメータなどをセットします。
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
