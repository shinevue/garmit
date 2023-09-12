/**
 * Copyright 2017 DENSO Solutions
 * 
 * ログアウト画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { sendData, EnumHttpMethod } from 'http-request';
import { clearSessionStorage } from 'webStorage';

class LogoutPanel extends Component {

    /**
     * コンストラクタです
     */
    constructor(){
        super();
        this.state = {
            displayElements: <p className="text-center">ログアウトしています...</p>,
        };
    }

    /**
     * コンポーネントがマウントされた時
     */
    componentDidMount() {
        sendData(EnumHttpMethod.get, "api/Logout", null, (result) => {
            this.setState({
                displayElements: (
                    <div>
                        <p className="text-center">ログアウトしました。</p>
                        <p className="text-center">※5秒後に自動的にログイン画面に切り替わります。</p>
                        <br />
                        <p className="text-center"><a href="../Login">ログイン画面へ</a></p>
                    </div>
                )
            }, () => {
                clearSessionStorage();      //sessionStorageをクリアする
                setTimeout(() => {
                    window.location.href = "/";
                }, 5000);
            });
        });
    }

    /**
     * render
     */
    render() {
        return (
                <div className="logout-box-body">
                    {this.state.displayElements}
                </div>
        );
    }    
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
const mapStateToProps = (state) => {
    return {

    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {

    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(LogoutPanel);

 