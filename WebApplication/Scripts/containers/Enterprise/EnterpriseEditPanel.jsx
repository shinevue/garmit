/**
 * Copyright 2017 DENSO Solutions
 * 
 * リアルタイムモニタ画面のReactコンポーネント
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

import EnterpriseEditBox from 'Enterprise/EnterpriseEditBox';
import EnterpriseBulkEditBox from 'Enterprise/EnterpriseBlukEditBox';

import { setLookUp } from 'SearchCondition/actions.js';
import { setDisplayState } from 'SearchResult/actions.js';
import { setEditedEnterprises } from './actions.js';
import { setWaitingState } from 'WaitState/actions.js';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

const maxlength = {
    enterpriseName: 32,
    mailTo: 50,
    comment: 100
};

class EnterpriseEditPanel extends Component {

    constructor(){
        super();
        this.state = {
            message: {}
        }
    }

    componentDidMount() {
        garmitFrame.refresh();
    }


    /**
     * マスターデータを読み込む
     */
    loadLookUp(callback) {
        sendData(EnumHttpMethod.get, '/api/Enterprise', null, (lookUp, networkError) => {
            if (lookUp) {
                this.props.setLookUp(lookUp);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback();
            }
        });
    }

    /**
     * 保存ボタンクリック
     * @param {any} value
     */
    onSubmit(value) {
        // 確認メッセージを表示
        const hasNoFunction = !Array.isArray(value) && !value.allowFunctions.some((func) => func.allowTypeNo !== 0);

        this.setState({
            message: {
                show: true,
                buttonStyle: 'save',
                message: hasNoFunction ?
                    '編集内容を保存します。\nアクセス可能な機能がありませんが、よろしいですか？' : '編集内容を保存してよろしいですか？',
                bsSize: 'sm',
                onCancel: () => this.clearMessage(),
                onOK: () => {
                    this.clearMessage();
                    this.saveData(value);
                }
            }
        });
    }

    /**
     * 送信するデータを生成する
     * @param {any} enterprise
     */
    createPostData(enterprise) {
        const postData = Object.assign({}, enterprise);
        postData.mailTo = postData.mailTo.filter((address) => address !== '');
        postData.allowLocations = postData.allowLocations.map((loc) => ({
            systemId: loc.systemId,
            locationId: loc.locationId,
            name: loc.name,
            isAllowed: loc.isAllowed,
            parent: loc.parent && {
                systemId: loc.parent.systemId,
                locationId: loc.parent.locationId,
                name: loc.parent.name,
                isAllowed: loc.parent.isAllowed
            }
        }));
        return postData;
    }

    /**
     * 編集内容を保存する
     * @param {any} value
     */
    saveData(value) {
        const isArray = Array.isArray(value);
        const url = isArray ? '/api/Enterprise/setEnterprises' : '/api/Enterprise/setEnterprise';
        const postData = isArray ? value.map((v) => this.createPostData(v)) : this.createPostData(value);

        this.props.setWaitingState(true, 'save');
        sendData(EnumHttpMethod.post, url, postData, (result, networkError) => {
            this.props.setWaitingState(false);
            if (result) {
                if (result.isSuccess) {
                    this.loadLookUp();
                }
                this.setState({
                    message: {
                        show: true,
                        buttonStyle: 'message',
                        message: result.message,
                        bsSize: result.isSuccess && 'sm',
                        onCancel: () => {
                            this.clearMessage();
                            if (result.isSuccess) {
                                browserHistory.push('/Maintenance/Enterprise');
                                this.props.setEditedEnterprises(null);
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
     * キャンセルボタンクリック時
     */
    handleCancel() {
        this.props.setEditedEnterprises(null);
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
        const { editedEnterprises, searchCondition, location, waitingInfo } = this.props;
        const { message } = this.state;

        return (
            <Content>
                {editedEnterprises && editedEnterprises.length === 1 &&
                    <EnterpriseEditBox
                        level={level}
                        mode={location.query.mode}
                        enterprise={editedEnterprises[0]}
                        maxlength={maxlength}
                        lookUp={searchCondition.lookUp}
                        onSubmit={(v) => this.onSubmit(v)}
                        onCancel={() => this.handleCancel()}
                    />
                }
                {editedEnterprises && editedEnterprises.length > 1 &&
                    <EnterpriseBulkEditBox
                        level={level}
                        enterprises={editedEnterprises}
                        maxlength={maxlength}
                        lookUp={searchCondition.lookUp}
                        onSubmit={(v) => this.onSubmit(v)}
                        onCancel={() => this.handleCancel()}
                    />
                }
                <MessageModal
                    show={message.show}
                    title="保存"
                    bsSize={message.bsSize || 'sm'}
                    buttonStyle={message.buttonStyle}
                    onOK={message.onOK}
                    onCancel={message.onCancel}
                >
                    {message.message && message.message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
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
        waitingInfo: state.waitingInfo,
        searchCondition: state.searchCondition,
        editedEnterprises: state.editedEnterprises,
        loginUser: state.loginUser
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        setWaitingState: (isWaiting, type) => dispatch(setWaitingState(isWaiting, type)),
        setEditedEnterprises: (enterprises) => dispatch(setEditedEnterprises(enterprises)),
        setLookUp: (lookUp) => dispatch(setLookUp(lookUp)),
        setDisplayState: (setting) => dispatch(setDisplayState(setting))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(EnterpriseEditPanel);

 