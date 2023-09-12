/**
 * @license Copyright 2019 DENSO
 * 
 * コンシューマー編集画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { browserHistory } from 'react-router';

import { Grid, Row, Col, ButtonToolbar } from 'react-bootstrap';

import Content from 'Common/Layout/Content';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import BoxGroup from 'Common/Layout/BoxGroup';

import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import ConsumerEditBox from 'Consumer/ConsumerEditBox';
import AssetDetailBox from 'Assets/AssetDetailBox';

import { setWaitingState } from 'WaitState/actions.js';
import { setDisplayState } from 'SearchResult/actions.js';
import { setEditedConsumers } from './actions.js';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { validateText, successResult, errorResult, VALIDATE_STATE } from 'inputCheck';
import { LAVEL_TYPE } from 'authentication';
import { convertDateTimeExtendedData, convertNumberExtendedData } from 'assetUtility';

class ConsumerEditPanel extends Component {

    constructor(props){
        super(props);
        this.state = {
            message: { show: false },
            targetConsumer: props.editedConsumers.length > 1 ? { location: null } : props.editedConsumers[0],
            inputCheck: props.editedConsumers.length > 1 ? { location } : { consumerName: {}, location: {} }
        }
    }

    /**
     * コンポーネントがマウントされる前の処理
     * ここでsetState()をすると、renderは更新されたstateを参照する
     */
    componentWillMount() {
        this.setValidation();
    }

    /**
     * コンポーネントがマウントされた後の処理
     */
    componentDidMount() {
        garmitFrame.refresh();
    }

    /**
     * propsが変化したときの処理
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.editedConsumers !== nextProps.editedConsumers) {
            this.setState({
                targetConsumer: nextProps.editedConsumers && nextProps.editedConsumers[0],
                inputCheck: (nextProps.editedConsumers && nextProps.editedConsumers.length > 1) ? { location } : { consumerName: {}, location: {} }
            }, () => {
                if (nextProps.editedConsumers) {
                    this.setValidation();
                }
            });
        }
    }

    /**
     * 保存ボタンクリック
     */
    handleSubmit() {
        // 確認メッセージを表示
        this.setState({
            message: {
                show: true,
                buttonStyle: 'save',
                message: '編集内容を保存してよろしいですか？',
                onCancel: () => this.clearMessage(),
                onOK: () => {
                    this.clearMessage();
                    this.saveData();
                }
            }
        });
    }

    /**
     * キャンセルボタンクリック時
     */
    handleCancel() {
        this.props.setEditedConsumers(null);
        browserHistory.goBack();
    }

    /**
     * 編集内容を保存する
     */
    saveData() {
        const url = '/api/Consumer/setConsumers';
        const sendingData = this.createSendingData();
        this.props.setWaitingState(true, 'save');
        sendData(EnumHttpMethod.post, url, sendingData, (result, networkError) => {
            this.props.setWaitingState(false, null);
            if (networkError) {
                this.showErrorMessage();
            } else {
                this.setState({
                    message: {
                        show: true,
                        buttonStyle: 'message',
                        message: result && result.message,
                        onCancel: () => {
                            this.clearMessage();
                            if (result && result.isSuccess) {
                                browserHistory.push('/Consumer');
                                this.props.setEditedConsumers(null);
                                this.props.setDisplayState(null);
                            }
                        }
                    }
                });
            }
        });
    }

    /**
     * 送信するデータを生成する
     */
    createSendingData() {
        return this.props.editedConsumers.map((c) => this.processSendingData(Object.assign({}, c, this.state.targetConsumer)));
    }

    /**
     * 送信するデータを加工する
     * ※データ量を小さくするため
     * @param {any} data
     */
    processSendingData(data) {
        //数値を変換する
        if (data.consumerExtendedPages) {
            data.consumerExtendedPages = convertNumberExtendedData(data.consumerExtendedPages);
        }

        return data;
    }

    /**
     * 値が変更されたとき
     * @param {any} val
     * @param {any} key
     */
    onEdit(keyValuePairs) {
        let consumer = Object.assign({}, this.state.targetConsumer);
        let inputCheck = Object.assign({}, this.state.inputCheck);

        keyValuePairs.forEach((pair) => {
            consumer[pair.key] = pair.val;
            if (pair.key in inputCheck) {
                inputCheck[pair.key] = this.checkValidation(pair.val, pair.key);
            }
        });

        // 値と入力チェックの更新
        this.setState({ targetConsumer: consumer, inputCheck: inputCheck });
    }

    /**
     * 詳細項目が変更された時
     * @param {any} pages
     * @param {any} isErr
     */
    onDetailItemEdit(pages, isErr) {
        const consumer = Object.assign({}, this.state.targetConsumer, { consumerExtendedPages: pages });
        const inputCheck = Object.assign({}, this.state.inputCheck, { consumerExtendedPages: isErr ? errorResult('') : successResult });
        this.setState({ targetConsumer: consumer, inputCheck: inputCheck });
    }

    /**
     * 入力チェック
     * @param {any} val
     * @param {any} key
     */
    checkValidation(val, key) {
        switch (key) {
            case 'consumerName':
                return validateText(val, 200, false);

            case 'location':
                return val ? successResult : errorResult('必須項目です');
        }
    }

    /**
     * 入力チェック状態をセットする
     * @param {func} callback
     */
    setValidation(callback) {
        const { targetConsumer } = this.state;
        let inputCheck = Object.assign({}, this.state.inputCheck);

        for (let key of Object.keys(inputCheck)) {
            inputCheck[key] = this.checkValidation(targetConsumer[key], key);
        }

        this.setState({ inputCheck: inputCheck });
    }

    /**
     * 保存ボタンを使用可能かどうか
     */
    isEnableSave() {
        const { inputCheck } = this.state;
        for (let k of Object.keys(inputCheck)) {
            if (inputCheck[k].state == VALIDATE_STATE.error) {
                return false;
            }
        }
        return true;
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
        const { editedConsumers, searchCondition, location, waitingInfo } = this.props;
        const { message, targetConsumer, inputCheck } = this.state;

        const bulk = editedConsumers && editedConsumers.length > 1;

        return (
            <Content>
                {targetConsumer &&
                    <div>
                        <Grid fluid>
                            <Row className="mb-05">
                                <ButtonToolbar className="pull-right">
                                    <Button
                                        bsStyle="success"
                                        disabled={!this.isEnableSave()}
                                        onClick={() => this.handleSubmit()}
                                    >
                                        <Icon className="fal fa-save mr-05" />
                                        <span>保存</span>
                                    </Button>
                                    <Button
                                        iconId="uncheck"
                                        bsStyle="lightgray"
                                        onClick={() => this.handleCancel()}
                                    >
                                        キャンセル
                        </Button>
                                </ButtonToolbar>
                            </Row>
                        </Grid>
                        <BoxGroup>
                            <ConsumerEditBox bulk={bulk}
                                level={level}
                                consumer={targetConsumer}
                                inputCheck={inputCheck}
                                lookUp={searchCondition.lookUp}
                                onEdit={(pairs) => this.onEdit(pairs)}
                            />
                            {!bulk &&
                                <AssetDetailBox title="コンシューマー詳細"
                                    id={targetConsumer.consumerId}
                                    pages={targetConsumer.consumerExtendedPages}
                                    isReadOnly={level > LAVEL_TYPE.operator}
                                    isSysAdmin={level === LAVEL_TYPE.administrator}
                                    defaultClose={false}
                                    level={level}
                                    onChange={(pages, isError) => this.onDetailItemEdit(pages, isError)}
                                    showAllPages
                                />
                            }                            
                        </BoxGroup>
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
                    </div>
                }
            </Content>
        );
    }    
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
const mapStateToProps = (state) => {
    return {
        authentication: state.authentication,
        editedConsumers: state.editedConsumers,
        searchCondition: state.searchCondition,
        waitingInfo: state.waitingInfo,
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        setEditedConsumers: (consumers) => dispatch(setEditedConsumers(consumers)),
        setWaitingState: (isWaiting, type) => dispatch(setWaitingState(isWaiting, type)),
        setDisplayState: (setting) => dispatch(setDisplayState(setting))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(ConsumerEditPanel);

 