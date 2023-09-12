/**
 * @license Copyright 2017 DENSO
 * 
 * サンプル画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { browserHistory } from 'react-router';

import Content from 'Common/Layout/Content';

import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import DeviceEditBox from 'Device/DeviceEditBox';

import { changeLoadState } from 'LoadState/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { setDisplayState } from 'SearchResult/actions.js';
import { setEditedDatagate } from './actions.js';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { LAVEL_TYPE } from 'authentication';

class DeviceEditPanel extends Component {

    constructor(){
        super();
        this.state = {
            message: {}
        };
    }

    /**
     * 保存ボタンがクリックされた時
     * @param {any} datagate
     */
    onSubmit(datagate) {
        const { editedDatagate } = this.props;
        const useflg = this.parseBoolean(datagate.useFlg);
        if (editedDatagate&&editedDatagate.useFlg !== useflg) {
            let pointUsage = useflg ? '収集中' : '停止中';
            var message = <div>
                            <p>編集内容を保存してよろしいですか？</p>
                            <div className="mt-1" ><strong>!!!注意!!!</strong></div>
                            <strong>{'使用状況が変更されているため、この機器に紐づく全てのポイントを「' + pointUsage + '」に変更します。'}</strong>
                          </div>
        } else {
            var message = '編集内容を保存してよろしいですか？';
        }

        this.setState({
            message: {
                show: true,
                buttonStyle: 'save',
                title: '保存',
                message: message,
                onOK: () => {
                    this.clearMessage();
                    this.saveDatagate(datagate);
                },
                onCancel: () => this.clearMessage()
            }
        });
    }

    /**
     * キャンセルボタンがクリックされた時
     */
    onCancel() {
        this.props.setEditedDatagate(null);
        browserHistory.goBack();
    }

    /**
     * 機器情報を保存する
     * @param {any} datagate
     */
    saveDatagate(datagate) {
        const sendingData = Object.assign({}, datagate, { poolInterval: datagate.poolInterval && datagate.poolInterval * 1000 });   // 収集周期の単位をミリ秒に直す

        this.props.setWaitingState(true, 'save');
        sendData(EnumHttpMethod.post, '/api/device/setDatagate', sendingData, (result, networkError) => {
            this.props.setWaitingState(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                this.setState({
                    message: {
                        show: true,
                        buttonStyle: 'message',
                        title: '保存',
                        message: result ? '機器情報を保存しました。' : '機器情報の保存に失敗しました。',
                        onCancel: () => {
                            this.clearMessage();
                            if (result) {
                                browserHistory.push('/Maintenance/Device');
                                this.props.setEditedDatagate(null);
                                this.props.setDisplayState(null);
                            }
                        }
                    }
                });
            }
        });
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

    /**
     * 文字列をboolean型に変換する
     * @param {string|boolean} target 対象文字列
     */
    parseBoolean(target) {
        if (!target) {
            return false;
        } else if (typeof target === 'boolean') {
            return target;
        }
        return target.toLowerCase() === "true";
    }

    /**
     * render
     */
    render() {
        const { waitingInfo, editedDatagate, databases, isLoading, authentication } = this.props;
        const { isReadOnly, level } = authentication;
        const { message } = this.state;

        return (
            <Content>
                <DeviceEditBox
                    isReadOnly={isReadOnly || level !== LAVEL_TYPE.administrator}
                    isLoading={isLoading}
                    datagate={editedDatagate}
                    databases={databases}
                    onSubmit={(datagate) => this.onSubmit(datagate)} 
                    onCancel={() => this.onCancel()}
                />
                <MessageModal
                    show={message.show}
                    title={message.title}
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
        isLoading: state.isLoading,
        waitingInfo: state.waitingInfo,
        editedDatagate: state.editedDatagate,
        databases: state.databases
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        setWaitingState: (isWaiting, type) => dispatch(setWaitingState(isWaiting, type)),
        setEditedDatagate: (datagate) => dispatch(setEditedDatagate(datagate)),
        changeLoadState: () => dispatch(changeLoadState()),
        setDisplayState: (setting) => dispatch(setDisplayState(setting))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(DeviceEditPanel);

 