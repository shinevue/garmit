/**
 * @license Copyright 2017 DENSO
 * 
 * 認証情報（authentication）のReducerを定義する。
 * ReducerはActionを受信してStateを更新する。
 * 
 * 注意点
 * ・引数で渡されたstateやactionそのものを変更してはいけません。
 * 　stateを変更するには、previousState を直接いじるのではなく、新しいオブジェクトを作成して返却します。
 * 
 */
'use strict';

import { combineReducers } from 'redux';

//Reducerで処理するAction名をインポートする。
import { CHANGE_MODAL_STATE, CLOSE_MODAL, CONFIRM_DELETE, CONFIRM_CANCEL, CONFIRM_SAVE, SUCCESS_SAVE, SUCCESS_DELETE, SHOW_ERROR_MESSAGE } from './actions.js';
import { SHOW_NETWORK_ERROR_MESSAGE, CONFIRM_OVERWRITE } from './actions.js'; 
import { NETWORKERROR_MESSAGE } from 'http-request';

/********************************************
 * Actionの処理を行うReducer
 ********************************************/

const initialState = {
    show:false,
    title: "",
    message:"",
    bsSize: "sm",
    buttonStyle: "message"
}

/**
 * メッセージモーダル情報を更新する
 * @param {object} state 更新前のstate
 * @param {object} action 更新内容
 * @returns {object} 更新後のstate
 */
function modalState(state=initialState, action) {
    switch( action.type ) {
        case CHANGE_MODAL_STATE:
            return Object.assign({}, state, action.data);

        case CLOSE_MODAL:
            let closeInfo = _.cloneDeep(state);
            closeInfo.show = false;
            return closeInfo;

        case CONFIRM_DELETE:
            return {
                show: true,
                title: "削除確認",
                message: action.targetName + "を削除してもよろしいですか？",
                buttonStyle: "delete",
                okOperation: action.okOperation,
                bsSize: initialState.bsSize
            }

        case CONFIRM_CANCEL:
            return {
                show: true,
                title: "キャンセル確認",
                message: action.targetName + "を破棄してもよろしいですか？",
                buttonStyle: "confirm",
                okOperation: action.okOperation,
                bsSize: initialState.bsSize
            }

        case CONFIRM_SAVE:
            return  {
                show: true,
                title: "保存確認",
                message: action.message ? action.message :  action.targetName + "を保存してもよろしいですか？",
                buttonStyle: "save",
                okOperation: action.okOperation,
                bsSize: initialState.bsSize
            }

        case SUCCESS_SAVE:
            return {
                show: true,
                title: "保存成功",
                message: action.message ? action.message : action.targetName + "を保存しました。",
                buttonStyle: "message",
                okOperation: action.okOperation,
                bsSize: initialState.bsSize
            }

        case SUCCESS_DELETE:
            return {
                show: true,
                title: "削除成功",
                message: action.message ? action.message :  action.targetName + "を削除しました。",
                buttonStyle: "message",
                bsSize: state.bsSize,
                okOperation: action.okOperation,
                bsSize: initialState.bsSize
            }

        case CONFIRM_OVERWRITE:
            return  {
                show: true,
                title: "上書き確認",
                message: action.message ? action.message :  action.targetName + "を上書きしてもよろしいですか？",
                buttonStyle: "yesNo",
                okOperation: action.okOperation,
                bsSize: initialState.bsSize
            }

        case SHOW_ERROR_MESSAGE:
            return {
                show: true,
                title: "エラー",
                message: action.message ? action.message : action.message,
                buttonStyle: "message",
                bsSize: (action.bsSize || action.bsSize === '') ? action.bsSize : initialState.bsSize
            }

        case SHOW_NETWORK_ERROR_MESSAGE:
            return {
                show: true,
                title: "エラー",
                message: NETWORKERROR_MESSAGE,
                buttonStyle: "message",
                bsSize: (action.bsSize || action.bsSize === '') ? action.bsSize : initialState.bsSize
            }

        default:
            return state;
    }
}

export default modalState;
