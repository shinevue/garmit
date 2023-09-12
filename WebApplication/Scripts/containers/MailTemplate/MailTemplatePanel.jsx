/**
 * @license Copyright 2017 DENSO
 * 
 * メールテンプレート画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col, ButtonToolbar, Form, Panel, Table } from 'react-bootstrap';

import Content from 'Common/Layout/Content';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import TemplateSettingBox from 'MailTemplate/TemplateSettingBox';
import TemplateSelectModal from 'MailTemplate/TemplateSelectModal';

import { setAuthentication } from 'Authentication/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { setLoadState, setLookUp, setMailTemplate } from './actions.js'

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';　　
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { validateText, validateTextArea, VALIDATE_STATE } from 'inputCheck';

class MailTemplatePanel extends Component {

    constructor(){
        super();
        this.state = {
            message: {},
            mailTemplate: null,
            inputCheck: {
                subject: {},
                body: {}
            }
        };
    }

    componentDidMount() {
        this.loadAuthentication(() => {
            this.loadLookUp();
        });
    }

    /**
     * 権限情報を読み込む
     */
    loadAuthentication(callback) {
        this.props.setLoadState(true);
        getAuthentication(FUNCTION_ID_MAP.mailSetting, (auth) => {
            this.props.setLoadState(false);
            this.props.setAuthentication(auth);

            if (callback) {
                callback(auth);
            }
        });
    }

    /**
     * マスタデータを取得する
     */
    loadLookUp(callback) {
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.get, '/api/mailTemplate/getLookUp', null, (lookUp, networkError) => {
            this.props.setLoadState(false);
            if (lookUp) {
                this.props.setLookUp(lookUp);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback(lookUp);
            }
        });
    }

    /**
     * メールテンプレートを読み込む
     */
    loadMailTemplate(searchCondition) {
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.post, '/api/mailTemplate/getMailTemplate', searchCondition, (mailTemplate, networkError) => {
            this.props.setLoadState(false);
            if (mailTemplate) {
                this.props.setMailTemplate(mailTemplate);
                this.setState({ mailTemplate: mailTemplate });
                this.initInputCheck(mailTemplate);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * メールテンプレートを保存する
     */
    saveMailTemplate() {
        this.props.setWaitingState(true, 'save');
        sendData(EnumHttpMethod.post, '/api/mailTemplate/setMailTemplate', this.state.mailTemplate, (isSuccess, networkError) => {
            this.props.setWaitingState(false);
            if (!networkError) {
                if (isSuccess) {
                    this.loadMailTemplate({
                        alarmCategory: this.state.mailTemplate.alarmCategory,
                        datatype: this.state.mailTemplate.datatype,
                        eventType: this.state.mailTemplate.eventType
                    });
                }
                this.setState({
                    message: {
                        show: true,
                        buttonStyle: 'message',
                        title: isSuccess ? '保存完了' : '保存失敗',
                        message: isSuccess ? 'メールテンプレートを保存しました' : 'メールテンプレートの保存に失敗しました',
                        onCancel: () => this.clearMessage()
                    }
                });
            } else {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * テンプレートが選択された時
     * @param {any} condition
     */
    onSelectTemplate(condition) {
        if (JSON.stringify(this.props.mailTemplate) !== JSON.stringify(this.state.mailTemplate)) {
            this.setState({
                message: {
                    show: true,
                    buttonStyle: 'confirm',
                    title: '確認',
                    message: '現在編集中の内容が破棄されてしまいますが、よろしいですか？',
                    onOK: () => {
                        this.loadMailTemplate(condition);
                        this.clearMessage();
                    },
                    onCancel: () => this.clearMessage()
                }
            });
        } else {
            this.loadMailTemplate(condition);
        }
    }

    /**
     * 編集された時
     * @param {any} val
     * @param {any} key
     */
    onEdit(val, key) {
        const mailTemplate = Object.assign({}, this.state.mailTemplate);
        const inputCheck = Object.assign({}, this.state.inputCheck);

        mailTemplate[key] = val;
        inputCheck[key] = this.validationCheck(val, key);

        this.setState({ mailTemplate: mailTemplate, inputCheck: inputCheck });
    }

    /**
     * 入力チェックを行う
     * @param {any} val
     * @param {any} key
     */
    validationCheck(val, key) {
        switch (key) {
            case 'subject':
                return validateText(val, 128, false);

            case 'body':
                return validateTextArea(val, 4000, false);
        }
    }

    /**
     * 入力チェックを初期化する
     * @param {any} mailTemplate
     */
    initInputCheck(mailTemplate) {
        const inputCheck = Object.assign({}, this.state.inputCheck);

        for (let key of Object.keys(inputCheck)) {
            inputCheck[key] = this.validationCheck(mailTemplate[key], key);
        }

        this.setState({ inputCheck: inputCheck });
    }

    /**
     * 保存がクリックされた時
     */
    onSaveClick() {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'confirm',
                title: '保存確認',
                message: '編集内容を保存しますか？',
                onOK: () => {
                    this.clearMessage();
                    this.saveMailTemplate();
                },
                onCancel: () => this.clearMessage()
            }
        });
    }

    /**
     * 入力エラーがあるか
     */
    hasError() {
        for (let key of Object.keys(this.state.inputCheck)) {
            if (this.state.inputCheck[key].state === VALIDATE_STATE.error) {
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
     * メール送信設定画面に移動する
     */
    moveToTransmissionSetting() {
        if (JSON.stringify(this.props.mailTemplate) !== JSON.stringify(this.state.mailTemplate)) {
            this.setState({
                message: {
                    show: true,
                    buttonStyle: 'confirm',
                    title: '確認',
                    message: 'ページを離れると編集中の内容が破棄されてしまいますが、よろしいですか？',
                    onOK: () => {
                        window.location.href = './Mail';
                    },
                    onCancel: () => this.clearMessage()
                }
            });
        } else {
            window.location.href = './Mail';
        }
    }

    /**
     * render
     */
    render() {
        const { isLoading, systemSet, lookUp, waitingInfo, authentication } = this.props;
        const { message, mailTemplate, inputCheck } = this.state;
        const isReadOnly = authentication.isReadOnly || authentication.level >= LAVEL_TYPE.manager;

        return (
            <Content>
                <Grid fluid>
                    <Row className="mb-05">
                        <Button
                            bsStyle="link"
                            className='pull-left'
                            onClick={() => this.moveToTransmissionSetting()}
                        >
                            <Icon className='fa fa-angle-double-right mr-05' />
                            <span>メール送信設定へ</span>
                        </Button>
                    </Row>
                    <Row className="mb-05">                       
                        <Button
                            bsStyle="primary"
                            disabled={isLoading}
                            onClick={() => this.setState({ showModal: true })}
                        >
                            選択
                        </Button>
                        {!isReadOnly && mailTemplate &&
                            <Button
                                className="pull-right"
                                bsStyle="success"
                                disabled={isLoading || this.hasError()}
                                onClick={() => this.onSaveClick()}
                            >
                                <Icon className="fal fa-save mr-05" />
                                <span>保存</span>
                            </Button>
                        }
                    </Row>
                    <Row>
                        <TemplateSettingBox
                            isLoading={isLoading}
                            isReadOnly={isReadOnly}
                            mailTemplate={mailTemplate}
                            inputCheck={inputCheck}
                            onEdit={(val, key) => this.onEdit(val, key)}
                        />  
                    </Row>
                </Grid>
                <TemplateSelectModal
                    lookUp={lookUp}
                    showModal={this.state.showModal}
                    onSelect={(condition) => this.onSelectTemplate(condition)}
                    onHide={() => this.setState({ showModal: false })}
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
        lookUp: state.lookUp,
        mailTemplate: state.mailTemplate
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        setWaitingState: (isWaiting, waitingType) => dispatch(setWaitingState(isWaiting, waitingType)),
        setLoadState: (isLoading) => dispatch(setLoadState(isLoading)),
        setLookUp: (lookUp) => dispatch(setLookUp(lookUp)),
        setMailTemplate: (mailTemplate) => dispatch(setMailTemplate(mailTemplate)),
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(MailTemplatePanel);

 