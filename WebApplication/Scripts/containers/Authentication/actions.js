/**
 * @license Copyright 2017 DENSO
 * 
 * 認証情報（Authentication）のAction(ActionCreator)を定義する。
 * 
 */
'use strict';

/********************************************
 * Action名
 ********************************************/
export const SET_AUTH = 'SET_AUTH';      

/********************************************
 * ActionCenter
 ********************************************/

/**
 * 認証情報をセットするActionを作成する
 * @param {object} authInfo 読み込んだ認証情報
 */
export function setAuthentication(authInfo) {
    return { type:SET_AUTH, value:authInfo };
}
