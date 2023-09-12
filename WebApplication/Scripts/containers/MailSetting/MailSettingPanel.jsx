/**
 * @license Copyright 2017 DENSO
 * 
 * サンプル画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import Content from 'Common/Layout/Content';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import TransmissionSettingBox from 'MailSetting/TransmissionSettingBox';

import { setAuthentication } from 'Authentication/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { changeLoadState } from 'LoadState/actions.js';
import { setSystemSet, setMailTemplate } from './actions.js'

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';　　
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { validateText, validateHostName, validateInteger, validateEmail, VALIDATE_STATE, successResult } from 'inputCheck';

const MAX_LENGTH = {
    mailServer: 64,
    mailUser: 64,
    mailPassword: 16,
    mailFrom: 256
};

class MailSettingPanel extends Component {

    constructor(){
        super();
        this.state = {
            message: {},
            inputCheck: {
                mailServer: {},
                mailPort: {},
                mailUser: {},
                mailPassword: {},
                mailFrom: {}
            }
        };
    }

    componentDidMount() {
        this.loadAuthentication(() => {
            this.loadSystemSet();
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.systemSet !== this.props.systemSet) {
            this.setState({ systemSet: nextProps.systemSet });
            this.initValidation(nextProps.systemSet);
        }
    }

    /**
     * 保存ボタンがクリックされた時
     */
    onSaveClick() {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'save',
                title: '保存',
                message: 'メール送信設定を保存します。よろしいですか？',
                onOK: () => {
                    this.clearMessage();
                    this.saveSystemSet();
                },
                onCancel: () => this.clearMessage()
            }
        })
    }

    /**
     * システム設定が変更された時
     * @param {any} val
     * @param {any} key
     */
    onEdit(val, key) {
        const systemSet = Object.assign({}, this.state.systemSet);
        systemSet[key] = val;

        const inputCheck = Object.assign({}, this.state.inputCheck);
        if (key in inputCheck) {
            inputCheck[key] = this.checkValidation(val, key, systemSet);
        }

        if (key === 'useSmtpAuth') {
            inputCheck.mailUser = this.checkValidation(systemSet.mailUser, 'mailUser', systemSet);
            inputCheck.mailPassword = this.checkValidation(systemSet.mailPassword, 'mailPassword', systemSet);
        }

        this.setState({ systemSet: systemSet, inputCheck: inputCheck });
    }

    /**
     * 権限情報を読み込む
     */
    loadAuthentication(callback) {
        this.props.changeLoadState();
        getAuthentication(FUNCTION_ID_MAP.mailSetting, (auth) => {
            this.props.changeLoadState();
            this.props.setAuthentication(auth);

            if (callback) {
                callback(auth);
            }
        });
    }

    /**
     * システム設定をロードする
     */
    loadSystemSet(callback) {
        this.props.changeLoadState();
        sendData(EnumHttpMethod.get, '/api/setting/getSetting', null, (info, networkError) => {
            this.props.changeLoadState();
            if (info) {
                this.props.setSystemSet(info.systemSet);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback(info);
            }
        });
    }

    /**
     * システム設定を保存する
     */
    saveSystemSet() {
        const systemSet = Object.assign({}, this.state.systemSet);
        if (!systemSet.useSmtpAuth) {
            systemSet.mailUser = '';
            systemSet.mailPassword = '';
        }

        this.props.setWaitingState(true, 'save');
        sendData(EnumHttpMethod.post, '/api/setting/setMailSetting', systemSet, (result, networkError) => {
            this.props.setWaitingState(false);
            if (!networkError) {
                if (result) {
                    this.loadSystemSet();
                }
                this.setState({
                    message: {
                        show: true,
                        buttonStyle: 'message',
                        title: '保存',
                        message: result ? 'メール送信設定を保存しました。' : 'メール送信設定の保存に失敗しました。',
                        onCancel: () => this.clearMessage()
                    }
                });
            } else {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * 入力チェックする
     * @param {any} val
     * @param {any} key
     */
    checkValidation(val, key, systemSet) {
        switch (key) {
            case 'mailServer':
                return validateHostName(val, MAX_LENGTH.mailServer, true);

            case 'mailPort':
                return validateInteger(val, 0, 65535, true);

            case 'mailUser':
                return systemSet.useSmtpAuth ? validateText(val, MAX_LENGTH.mailUser, false) : successResult;

            case 'mailPassword':
                return systemSet.useSmtpAuth ? validateText(val, MAX_LENGTH.mailPassword, false) : successResult;

            case 'mailFrom':
                return validateEmail(val, MAX_LENGTH.mailFrom, true);
        }
    }

    /**
     * 入力チェックを初期化する
     * @param {any} systemSet
     */
    initValidation(systemSet) {
        const inputCheck = Object.assign({}, this.state.inputCheck);

        for (let key of Object.keys(inputCheck)) {
            inputCheck[key] = this.checkValidation(systemSet[key], key, systemSet);
        }

        this.setState({ inputCheck: inputCheck });
    }

    /**
     * 入力エラーがあるか
     */
    hasError() {
        for (let key of Object.keys(this.state.inputCheck)) {
            if (this.state.inputCheck[key].state == VALIDATE_STATE.error) {
                return true;
            }
        }
        return false;
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
     * メッセージを消す
     */
    clearMessage() {
        const message = Object.assign({}, this.state.message);
        message.show = false;

        this.setState({ message: message });
    }

    /**
     * メールテンプレート画面に遷移する
     */
    moveToTemplateSetting() {
        if (JSON.stringify(this.props.systemSet) !== JSON.stringify(this.state.systemSet)) {
            this.setState({
                message: {
                    show: true,
                    buttonStyle: 'confirm',
                    title: '確認',
                    message: 'ページを離れると編集中の内容が破棄されてしまいますが、よろしいですか？',
                    onOK: () => {
                        window.location.href = './MailTemplate';
                    },
                    onCancel: () => this.clearMessage()
                }
            });
        } else {
            window.location.href = './MailTemplate';
        }
    }

    /**
     * render
     */
    render() {
        const { isLoading, authentication, waitingInfo } = this.props;
        const { systemSet, inputCheck, message } = this.state;

        const isReadOnly = authentication.isReadOnly || authentication.level !== LAVEL_TYPE.administrator;

        return (
            <Content>
                <div className="clearfix mb-05">
                    <Button
                        bsStyle="link"
                        className='pull-left'
                        onClick={() => this.moveToTemplateSetting()}
                    >
                        <Icon className='fa fa-angle-double-right mr-05' />
                        <span>メールテンプレート設定へ</span>
                    </Button>
                    {!isReadOnly &&
                        <Button
                            className="pull-right"
                            bsStyle="success"
                            disabled={this.hasError() || isLoading}
                            onClick={() => this.onSaveClick()}
                        >
                            <Icon className="fal fa-save mr-05" />
                            <span>保存</span>
                        </Button>
                    }
                </div>
                <TransmissionSettingBox
                    isLoading={isLoading}
                    isReadOnly={isReadOnly}
                    systemSet={systemSet}
                    inputCheck={inputCheck}
                    maxlength={MAX_LENGTH}
                    onEdit={(val, key) => this.onEdit(val, key)}
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
        waitingInfo: state.waitingInfo,
        isLoading: state.isLoading,
        systemSet: state.systemSet,
        mailTemplate: state.mailTemplate
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        setWaitingState: (isWaiting, waitingType) => dispatch(setWaitingState(isWaiting, waitingType)),
        changeLoadState: () => dispatch(changeLoadState()),
        setSystemSet: (systemSet) => dispatch(setSystemSet(systemSet)),
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(MailSettingPanel);

 