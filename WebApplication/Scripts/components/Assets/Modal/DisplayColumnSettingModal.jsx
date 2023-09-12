/**
 * Copyright 2017 DENSO Solutions
 * 
 * DisplayColumnSettingModal Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Modal } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import DisplayColumnSettingForm from 'Assets/DisplayColumnSettingForm';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

/**
 * カラム表示設定モーダル
 * @param {bool} showModal モーダルを表示するか
 * @param {number} functionId 機能番号
 * @param {number} gidNo 表番号
 * @param {func} onHide モーダルを閉じる処理
 */
export default class DisplayColumnSettingModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            message: {},
            columnOrderInfo: null,
            editedUserColumns: null,
        }
    }

    /**
     * カラム情報を読み込む
     * @param {any} functionId
     * @param {any} gridNo
     */
    loadInfo(functionId, gridNo) {
        this.setState({ isLoading: true }, () => {
            sendData(EnumHttpMethod.post, '/api/columnOrder/get', { functionId: functionId, gridNo: gridNo }, (data, networkError) => {
                this.setState({ isLoading: false });
                if (data) {
                    this.setState({ columnOrderInfo: data, editedUserColumns: data.userColumns });
                }
                if (networkError) {
                    this.showNetWorkErrorMessage();
                }
            });
        });
    }

    /**
     * カラム設定情報を保存する
     */
    saveColumnSetting(callback) {
        this.setState({ isSaving: true }, () => {
            sendData(EnumHttpMethod.post, '/api/columnOrder/set', this.state.editedUserColumns, (result, networkError) => {
                this.setState({ isSaving: false });
                if (result) {
                    if (result.isSuccess && this.props.onSaved) {
                        this.props.onSaved();
                    }
                    this.setState({
                        message: {
                            show: true,
                            buttonStyle: 'message',
                            title: (result && result.isSuccess) ? '保存完了' : 'エラー',
                            message: result && result.message,
                            onCancel: () => {
                                this.clearMessage();
                                if (result && result.isSuccess) {
                                    this.props.onHide();
                                }
                            }
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
     * Componentがマウントされるときに1度だけ呼ばれます。
     */
    componentDidMount() {
        this.loadInfo(this.props.functionId, this.props.gridNo);
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(this.props) !== JSON.stringify(nextProps) && nextProps.showModal) {
            this.loadInfo(nextProps.functionId, nextProps.gridNo);
        }
    }

    /**
     * 保存ボタンがクリックされた時
     */
    onSaveClick() {
        if (this.state.editedUserColumns.columnHeaders.length == 0) {
            this.setState({
                message: {
                    show: true,
                    buttonStyle: 'message',
                    title: 'エラー',
                    message: '全項目を非表示にはできません。',
                    onCancel: () => this.clearMessage()
                }
            });
            return;
        }

        this.setState({
            message: {
                show: true,
                buttonStyle: 'save',
                title: '確認',
                message: '表示設定を保存してよろしいですか？',
                onCancel: () => this.clearMessage(),
                onOK: () => {
                    this.clearMessage();
                    this.saveColumnSetting();
                }
            }
        })
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
        const { columnOrderInfo, editedUserColumns, message, isLoading, isSaving } = this.state;
        return (
            <div>
                <Modal show={this.props.showModal} backdrop="static" onHide={() => this.props.onHide()} >
                    <Modal.Header closeButton>
                        <Modal.Title>表示設定</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {isLoading &&
                            <div className="loading">
                                <Icon className="fa fa-sync-alt fa-spin" />
                            </div>
                        }
                        {columnOrderInfo &&
                            <DisplayColumnSettingForm
                                allColumns={columnOrderInfo.allColumns}
                                userColumns={editedUserColumns}
                                onChange={(userColumns) => this.setState({ editedUserColumns: userColumns })}
                            />
                        }
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
                        <WaitingMessage show={isSaving} type="save" />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            bsStyle="success"
                            disabled={!columnOrderInfo || !columnOrderInfo.allColumns}
                            onClick={() => this.onSaveClick()}
                        >
                            <Icon className="fal fa-save mr-05" />
                            <span>保存</span>
                        </Button>
                        <Button
                            iconId="uncheck"
                            bsStyle="lightgray"
                            onClick={() => { this.props.onHide() }}
                        >
                            <span>キャンセル</span>
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

DisplayColumnSettingModal.propTypes = {
    showModal: PropTypes.bool,
    functionId: PropTypes.number,
    gridNo: PropTypes.number,
    onHide: PropTypes.func
}

DisplayColumnSettingModal.defaultProps = {
    showModal: false,
    functionId: 0,
    gridNo: 1,
    onHide: () => { }
}