/**
 * @license Copyright 2018 DENSO
 * 
 * ヘッダーのアラーム個数情報のReducerを定義する。
 * ReducerはActionを受信してStateを更新する。
 * 
 * 注意点
 * ・引数で渡されたstateやactionそのものを変更してはいけません。
 * 　stateを変更するには、previousState を直接いじるのではなく、新しいオブジェクトを作成して返却します。
 * 
 */
'use strict';

import { combineReducers } from 'redux';

import alarmSummary from 'AlarmSummary/reducer.js';

//使用するReducerを列挙
const rootReducers = combineReducers({
    alarmSummary
});

export default rootReducers;
