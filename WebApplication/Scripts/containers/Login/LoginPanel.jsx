/**
 * Copyright 2017 DENSO Solutions
 * 
 * サンドボックス画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';

import TextForm from 'Common/Form/TextForm';
import PasswordForm from 'Common/Form/PasswordForm';
import PasswordChangeModal from 'Assets/Modal/PasswordChangeModal';

import { loadLoginResult, changeLoadState } from './actions.js';

import { sendData, EnumHttpMethod } from 'http-request';
import { clearSessionStorage } from 'webStorage';

class LoginPanel extends Component {

    constructor(){
        super();
        this.state = {
            userId: '',
            password: '',
            showPasswordChangeModal: false
        };
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     */
    componentDidMount() {
        //ReactDOM.findDOMNode((this.refs.userId).refs.textControl).focus();       //ユーザーIDにフォーカスする
        clearSessionStorage();      //sessionStorageをクリアする
    }

    /**
     * ログインを判定する
     */
    judgeLogin() {
        const { userId, password } = this.state;
        let loginData = { userId: userId, password: password }

        this.props.loadLoginResult(null);
        this.props.changeLoadState(true);   //ロード中
        
        sendData(EnumHttpMethod.post, 'api/login/judgeLogin', loginData, (result) => {
            if (result && result.loginResult && result.loginResult.isSuccess == true) {
                //ログイン成功
                if (result.passChangeNeed) {
                    //パスワードが無効
                    this.setState({ showPasswordChangeModal: true });
                } else {
                    //パスワードが有効
                    window.location.href = './Top';     //TOP画面を表示する
                }
            } else {
                this.props.changeLoadState(false);  //ロード完了
                this.props.loadLoginResult(result);
            }
        });
    }

    /**
     * テキストボックスのキーダウンイベント
     */
    handleOnKeyDown() {
        //Enterキーを押下されたら、ログイン判定する
        if (window.event.keyCode === 13) {
            this.judgeLogin();
        }
    }

    /**
     * パスワード変更モーダルの閉じるイベント
     */
    onHidePasswordChangeModal() {
        this.setState({ showPasswordChangeModal: false });
        window.location.reload();
    }

    render() {
        const { loginInfo, isLoading } = this.props;
        const { userId, password, showPasswordChangeModal } = this.state;

        return (
            <form>
                <TextForm
                    ref='userId'
                    value={userId}
                    isReadOnly={isLoading}
                    placeholder='User ID'
                    onChange={(val) => this.setState({ userId: val })}
                    onKeyDown={() => this.handleOnKeyDown()}
                />
                <PasswordForm
                    text={password}
                    isReadOnly={isLoading}
                    placeholder='Password'
                    onChange={(val) => this.setState({ password: val })}
                    onKeyDown={() => this.handleOnKeyDown()}
                />
                <div className="error-box">
                {loginInfo && loginInfo.loginResult && loginInfo.loginResult.message &&
                    <p className="error-box-txt">{loginInfo.loginResult.message}</p>
                }
                </div>
                <div className="login-btn-area">
                    <button type="button"
                        className="btn btn-garmit-login btn-login-execute"
                        disabled={isLoading}
                        onClick={() => this.judgeLogin()}
                    >
                        ログイン
                    </button>
                </div>
                <PasswordChangeModal show={showPasswordChangeModal} user={{ userId: userId }} onHide={() => this.onHidePasswordChangeModal()} />
            </form>
        );
    }    
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
const mapStateToProps = (state) => {
    return {
        loginInfo: state.loginInfo,
        isLoading: state.isLoading
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        loadLoginResult: (value) => dispatch(loadLoginResult(value)),
        changeLoadState: (isLoad) => dispatch(changeLoadState(isLoad))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(LoginPanel);

 