/**
 * @license Copyright 2020 DENSO
 * 
 * ラック帳票履歴モーダル Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import Box from 'Common/Layout/Box';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import { CloseButton } from 'Assets/GarmitButton';
import SearchResultTable from 'Assets/SearchResultTable';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { BUTTON_OPERATION_TYPE } from 'constant';
import { LAVEL_TYPE, readOnlyByLevel } from 'authentication';

/**
 * 帳票履歴モーダル
 * @param {boolaen} show モーダルを表示するかどうか
 */
export default class RackReportHistoryModal extends Component {

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isProcessing: false,
            message: {},
            historyResult: null
        };
    }

    /**
     * Componentがマウントされるときに1度だけ呼ばれます。
     */
    componentDidMount() {
        this.loadHistoryResult();
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        //モーダルが表示されるとき
        if (nextProps.show != this.props.show && nextProps.show) {
            this.loadHistoryResult();
        }
    }

    /**
     * 削除ボタンクリック
     * @param {any} params
     */
    onDeleteClick(params) {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'delete',
                title: '削除',
                message: '選択した帳票履歴を削除してもよろしいですか？',
                onCancel: () => this.clearMessage(),
                onOK: () => {
                    this.clearMessage();
                    const historyNumbers = this.getHistoryNumbers(params);
                    this.deleteHistorys(historyNumbers);
                }
            }
        });
    }

    /**
     * ダウンロードボタンクリック
     * @param {any} params
     */
    onDownloadClick(params) {
        const fileUrls = this.getFileUrls(params);
        fileUrls.forEach((url) => {
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.download = '';
            a.click();
        });
    }

    /**
     * ホバーボタンがクリックされた時
     * @param {any} hoverButton
     */
    onHoverButtonClick(hoverButton) {
        if (hoverButton) {
            if (hoverButton.operationType === BUTTON_OPERATION_TYPE.delete) {   //削除
                this.onDeleteClick([hoverButton.parameterKeyPairs]);
            }
        }
    }

    /**
     * 閉じるボタンクリック
     */
    onHide() {
        if (this.props.onHide) {
            this.props.onHide();
        }
    }

    /**
     * 出力履歴一覧表を読み込む
     */
    loadHistoryResult() {
        const url = '/api/embeddedReport/getHistoryResult?rackId=' + this.props.rack.rackId;
        this.setState({ isLoading: true }, () => {
            sendData(EnumHttpMethod.get, url, null, (historyResult, networkError) => {
                this.setState({ isLoading: false });
                this.setState({ historyResult: historyResult });

                if (networkError) {
                    this.showNetWorkErrorMessage();
                }
            });
        });
    }

    /**
     * 出力履歴を削除する
     * @param {any} historyNumbers
     */
    deleteHistorys(historyNumbers) {
        this.setState({ isProcessing: true }, () => {
            sendData(EnumHttpMethod.post, '/api/embeddedReport/deleteHistories', historyNumbers, (result, networkError) => {
                this.setState({ isProcessing: false });
                if (result) {
                    if (result.isSuccess) {
                        this.loadHistoryResult();
                    }
                    this.setState({
                        message: {
                            show: true,
                            buttonStyle: 'message',
                            title: '削除',
                            message: result.message,
                            onCancel: () => this.clearMessage()
                        }
                    });
                }
                if (networkError) {
                    this.showNetWorkErrorMessage();
                }
            });
        });
    }

    /**
     * ParameterKeyPairsのリストからURLのリストを取得する
     * @param {array} parameterKeyPairList キー情報リスト
     */
    getFileUrls(parameterKeyPairList) {
        return parameterKeyPairList.map((pairs) => {
            return this.getKey(pairs, 'Url');
        });
    }

    /**
     * ParameterKeyPairsのリストから履歴番号のリストを取得する
     * @param {array} parameterKeyPairList キー情報リスト
     */
    getHistoryNumbers(parameterKeyPairList) {
        return parameterKeyPairList.map((pairs) => {
            const key = this.getKey(pairs, 'No');
            return Number(key);
        });
    }

    /**
     * ParameterKeyPairsからキーを取得する
     * @param {object} parameterKeyPairs キーペア
     * @param {string} parameter パラメータ
     */
    getKey(parameterKeyPairs, parameter) {
        const target = parameterKeyPairs.find((pair) => pair.paramater === parameter);
        return target.key;
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
     * render
     */
    render() {
        const { show, authentication } = this.props;
        const { isLoading, isProcessing, message, historyResult } = this.state;
        const { isReadOnly, level } = authentication;

        const buttonReadOnly = {};
        buttonReadOnly[BUTTON_OPERATION_TYPE.delete] = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.manager);

        return (
            <Modal bsSize="large" show={show} backdrop="static" onHide={() => this.onHide()}>
                <Modal.Header closeButton>
                    <Modal.Title>帳票履歴</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Box boxStyle='default' isLoading={isLoading}>
                        <Box.Header>
                            <Box.Title>帳票履歴</Box.Title>
                        </Box.Header >
                        <Box.Body>
                            {historyResult &&
                                <SearchResultTable useCheckbox deleteButton downloadButton                                    
                                    className="mtb-1"
                                    buttonHidden={buttonReadOnly}
                                    searchResult={historyResult}
                                    onDeleteClick={(params) => this.onDeleteClick(params)}
                                    onDownloadClick={(params) => this.onDownloadClick(params)}
                                    onHoverButtonClick={(button) => this.onHoverButtonClick(button)}
                                />
                            }
                        </Box.Body>
                    </Box>
                    <MessageModal
                        show={message.show}
                        title={message.title}
                        bsSize="small"
                        buttonStyle={message.buttonStyle}
                        onOK={message.onOK}
                        onCancel={message.onCancel}
                        disabled={isLoading}
                    >
                        {message.message}
                    </MessageModal>
                    <WaitingMessage show={isProcessing} type="delete" />
                </Modal.Body>
                <Modal.Footer>
                    <CloseButton onClick={() => this.onHide()} />
                </Modal.Footer>
            </Modal>
        );
    }
}

RackReportHistoryModal.propTypes = {
    show: PropTypes.bool,
    onHide: PropTypes.func,
    rack: PropTypes.object,
    authentication: PropTypes.object
};
