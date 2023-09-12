/**
 * @license Copyright 2017 DENSO
 * 
 * ユーザー画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { browserHistory } from 'react-router';

import { Grid, Row, Col } from 'react-bootstrap';

import Content from 'Common/Layout/Content';

import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import UserEditBox from 'User/UserEditBox';
import UserBulkEditBox from 'User/UserBulkEditBox';

import { setWaitingState } from 'WaitState/actions.js';
import { setDisplayState } from 'SearchResult/actions.js';
import { setEditedUsers } from './actions.js';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

const maxlength = {
    userId: 100,
    userName: 32,
    password: 50
};

const minlength = {
    password: 8
};

class UserEditPanel extends Component {

    constructor(){
        super();
        this.state = {
            message: { show: false }
        }
    }

    componentDidMount() {
        garmitFrame.refresh();
    }

    /**
     * 保存ボタンクリック
     * @param {any} value
     */
    onSubmit(value) {
        // 確認メッセージを表示
        this.setState({
            message: {
                show: true,
                buttonStyle: 'save',
                message: '編集内容を保存してよろしいですか？',
                onCancel: () => this.clearMessage(),
                onOK: () => {
                    this.clearMessage();
                    this.saveData(value);
                }
            }
        });
    }

    /**
     * 編集内容を保存する
     * @param {any} value
     */
    saveData(value) {
        const mode = this.props.location.query.mode;
        const url = Array.isArray(value) ? '/api/User/setUsers' : (mode === 'add' ? '/api/User/setNewUser' : '/api/User/setUser');
        const sendingData = this.processSendingData(value);
        this.props.setWaitingState(true, 'save');
        sendData(EnumHttpMethod.post, url, sendingData, (result, networkError) => {
            this.props.setWaitingState(false);
            if (result) {
                this.setState({
                    message: {
                        show: true,
                        buttonStyle: 'message',
                        message: result.message,
                        onCancel: () => {
                            this.clearMessage();
                            if (result.isSuccess) {
                                browserHistory.push('/Maintenance/User');
                                this.props.setEditedUsers(null);
                                this.props.setDisplayState(null);
                            }
                        }
                    }
                });
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * 送信するデータを加工する
     * ※データ量を小さくするため
     * @param {any} data
     */
    processSendingData(data) {
        if (Array.isArray(data)) {
            const users = data.slice();
            users.forEach((user, i, self) => {
                const obj = Object.assign({}, user);
                obj.enterprises = obj.enterprises.map((ent) => ({ enterpriseId: ent.enterpriseId, enterpriseName: ent.enterpriseName, systemSet: ent.systemSet }));
                obj.mainEnterprise = { enterpriseId: obj.mainEnterprise.enterpriseId, enterpriseName: obj.mainEnterprise.enterpriseName, systemSet: obj.mainEnterprise.systemSet };
                self[i] = obj;
            });
            return users;
        } else {
            const user = Object.assign({}, data);
            user.enterprises = user.enterprises.map((ent) => ({ enterpriseId: ent.enterpriseId, enterpriseName: ent.enterpriseName, systemSet: ent.systemSet }));
            user.mainEnterprise = { enterpriseId: user.mainEnterprise.enterpriseId, enterpriseName: user.mainEnterprise.enterpriseName, systemSet: user.mainEnterprise.systemSet };
            return user;
        }
    }

    /**
     * キャンセルボタンクリック時
     */
    handleCancel() {
        this.props.setEditedUsers(null);
        browserHistory.goBack();
    }

    /**
     * エラーメッセージを表示する
     * @param {any} message
     */
    showErrorMessage(message) {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'message',
                title: 'エラー',
                message: message,
                onCancel: () => this.clearMessage()
            }
        });
    }

    /**
     * ネットワークエラーメッセージを表示する
     */
    showNetWorkErrorMessage() {
        this.showErrorMessage(NETWORKERROR_MESSAGE);
    }

    /**
     * メッセージをクリアする
     */
    clearMessage() {
        this.setState({ message: Object.assign({}, this.state.message, { show: false }) });
    }

    render() {
        const { level } = this.props.authentication;
        const { editedUsers, searchCondition, location, systemSet, waitingInfo } = this.props;
        const { message } = this.state;

        return (
            <Content>
                {editedUsers && editedUsers.length === 1 &&
                    <UserEditBox
                        level={level}
                        mode={location.query.mode}
                        user={editedUsers[0]}
                        maxlength={maxlength}
                        minlength={minlength}
                        lookUp={searchCondition.lookUp}
                        onSubmit={(v) => this.onSubmit(v)}
                        onCancel={() => this.handleCancel()}
                        loginType={systemSet && systemSet.loginType}
                    />
                }
                {editedUsers && editedUsers.length > 1 &&
                    <UserBulkEditBox
                        users={editedUsers}
                        lookUp={searchCondition.lookUp}
                        onSubmit={(v) => this.onSubmit(v)}
                        onCancel={() => this.handleCancel()}
                    />
                }
                <MessageModal
                    show={message.show}
                    title="保存"
                    bsSize="small"
                    buttonStyle={message.buttonStyle}
                    onOK={message.onOK}
                    onCancel={message.onCancel}
                >
                    {message.message}
                </MessageModal>
                <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />
            </Content>
        );
    }    
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
const mapStateToProps = (state) => {
    return {
        authentication: state.authentication,
        editedUsers: state.editedUsers,
        searchCondition: state.searchCondition,
        systemSet: state.systemSet,
        waitingInfo: state.waitingInfo,
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        setEditedUsers: (users) => dispatch(setEditedUsers(users)),
        setWaitingState: (isWaiting, type) => dispatch(setWaitingState(isWaiting, type)),
        setDisplayState: (setting) => dispatch(setDisplayState(setting))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(UserEditPanel);

 