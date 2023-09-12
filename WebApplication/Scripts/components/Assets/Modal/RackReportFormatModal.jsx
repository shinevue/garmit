/**
 * @license Copyright 2020 DENSO
 * 
 * ラック帳票フォーマットモーダル Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import Box from 'Common/Layout/Box';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import RackReportFormatRegisterModal from 'Assets/Modal/RackReportFormatRegisterModal';
import { CloseButton } from 'Assets/GarmitButton';
import SearchResultTable from 'Assets/SearchResultTable';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { BUTTON_OPERATION_TYPE } from 'constant';
import { LAVEL_TYPE, readOnlyByLevel } from 'authentication';

/**
 * 帳票フォーマットモーダル
 * @param {boolaen} show モーダルを表示するかどうか
 */
export default class RackReportFormatModal extends Component {

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            showRegisterModal: false,
            isLoading: false,
            isProcessing: false,
            message: {},
            formatResult: null
        };
    }
    /**
     * Componentがマウントされるときに1度だけ呼ばれます。
     */
    componentDidMount() {
        this.loadFormatResult();
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        //モーダルが表示されるとき
        if (nextProps.show != this.props.show && nextProps.show) {
            this.loadFormatResult();
        }
    }

    /**
     * 追加ボタンクリック
     */
    onAddClick() {
        this.setState({ showRegisterModal: true });
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
                message: '選択したフォーマットを削除してもよろしいですか？',
                onCancel: () => this.clearMessage(),
                onOK: () => {
                    this.clearMessage();
                    const formats = this.getFormats(params);
                    this.deleteFormats(formats);
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
     * フォーマット一覧表を読み込む
     */
    loadFormatResult() {
        this.setState({ isLoading: true }, () => {
            sendData(EnumHttpMethod.get, '/api/embeddedReport/getFormatResult', null, (formatResult, networkError) => {
                this.setState({ isLoading: false });
                this.setState({ formatResult: formatResult });

                if (networkError) {
                    this.showNetWorkErrorMessage();
                }
            });
        });
    }

    /**
     * フォーマットを削除する
     * @param {any} formats
     */
    deleteFormats(formats) {
        this.setState({ isProcessing: true }, () => {
            sendData(EnumHttpMethod.post, '/api/embeddedReport/deleteFormats', formats, (result, networkError) => {
                this.setState({ isProcessing: false });
                if (result) {
                    if (result.isSuccess) {
                        this.loadFormatResult();
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
     * ParameterKeyPairsのリストからフォーマットのリストを取得する
     * @param {array} parameterKeyPairList キー情報リスト
     */
    getFormats(parameterKeyPairList) {
        return parameterKeyPairList.map((pairs) => {
            const enterpriseId = this.getKey(pairs, 'EnterpriseId');
            const formatNo = this.getKey(pairs, 'FormatNo');
            return {
                enterprise: { enterpriseId: Number(enterpriseId) },
                formatNo: Number(formatNo)
            };
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
        const { show, authentication, enterprises, mainEnterprise } = this.props;
        const { isLoading, isProcessing, message, formatResult, showRegisterModal } = this.state;
        const { isReadOnly, level } = authentication;
        const readOnly = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.manager);

        const buttonReadOnly = {};
        buttonReadOnly[BUTTON_OPERATION_TYPE.delete] = readOnly;

        return (
            <Modal bsSize="large" show={show} backdrop="static" onHide={() => this.onHide()}>
                <Modal.Header closeButton>
                    <Modal.Title>帳票フォーマット</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Box boxStyle='default' isLoading={isLoading}>
                        <Box.Header>
                            <Box.Title>フォーマット一覧</Box.Title>
                        </Box.Header >
                        <Box.Body>
                            <SearchResultTable useCheckbox deleteButton downloadButton
                                addButton={!readOnly}
                                className="mtb-1"
                                buttonHidden={buttonReadOnly}
                                searchResult={formatResult}
                                onAddClick={() => this.onAddClick()}
                                onDeleteClick={(params) => this.onDeleteClick(params)}
                                onDownloadClick={(params) => this.onDownloadClick(params)}
                                onHoverButtonClick={(button) => this.onHoverButtonClick(button)}
                            />
                        </Box.Body>
                    </Box>
                    <RackReportFormatRegisterModal
                        show={showRegisterModal}
                        onHide={() => this.setState({ showRegisterModal: false })}
                        onSaved={() => {
                            this.loadFormatResult();
                        }}
                        enterprises={enterprises}
                        mainEnterprise={mainEnterprise}
                    />
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

RackReportFormatModal.propTypes = {
    show: PropTypes.bool,
    onHide: PropTypes.func,
    authentication: PropTypes.object,
    enterprises: PropTypes.array,
    mainEnterprise: PropTypes.object,
};
