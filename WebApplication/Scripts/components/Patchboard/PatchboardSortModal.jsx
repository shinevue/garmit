/**
 * Copyright 2022 DENSO
 * 
 * 配線盤表示順序モーダル Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Modal, Grid, Row, Col } from 'react-bootstrap';

import ToggleSwitch from 'Common/Widget/ToggleSwitch';
import Icon from 'Common/Widget/Icon';

import { SaveButton, CancelButton } from 'Assets/GarmitButton';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import SortableList from 'Patchboard/SortableList';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

export default class PatchboardSortModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isSaving: false,
            message: {},
            isInPatchboard: true,
            info: null,
            patchboardOrders: null
        };
    }

    /**
     * コンポーネントがマウントされたとき 
     */
    componentDidMount() {
        //ToggleSwitchの不具合のために追加（参考）https://github.com/react-bootstrap/react-bootstrap/issues/2774
        $(document).off('click.bs.button.data-api', '[data-toggle^="button"]')
    }

    /**
     * コンポーネントが新しいPropsを受け取ったとき
     * @param {any} nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.show !== this.props.show && nextProps.show) {
            this.loadInfo();
        }
    }

    /**
     * 配線盤種別（局入かどうか）が変更されたとき
     * @param {any} isInPatchboard
     */
    handlePatchboardTypeChange(isInPatchboard) {
        if (this.existsOrderChange()) {
            this.setState({
                message: {
                    show: true,
                    buttonStyle: 'confirm',
                    title: '確認',
                    message: '編集内容が破棄されますが、よろしいですか？',
                    onOK: () => {
                        this.clearMessage();
                        this.changePatchboardType(isInPatchboard);
                    },
                    onCancel: () => this.clearMessage()
                }
            });
        } else {
            this.changePatchboardType(isInPatchboard);
        }
    }

    /**
     * 保存ボタンクリックイベント
     */
    handleSave() {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'save',
                title: '確認',
                message: '表示順序を保存してよろしいですか？',
                onCancel: () => this.clearMessage(),
                onOK: () => {
                    this.clearMessage();
                    this.savePatchboardOrders();
                }
            }
        });
    }

    /**
     * キャンセルボタンクリックイベント
     */
    handleOnCancel() {
        this.props.onHide();
    }

    /**
     * 配線盤表示順情報を読み込む
     */
    loadInfo() {
        this.setState({ isLoading: true }, () => {
            sendData(EnumHttpMethod.get, '/api/patchboard/order/getInfo', null, (info, networkError) => {
                this.setState({ isLoading: false });
                if (info) {
                    const patchboardOrders = info.inPatchboardOrder;
                    this.setState({ info: info, patchboardOrders: patchboardOrders, isInPatchboard: true });

                }
                if (networkError) {
                    this.showNetWorkErrorMessage();
                }
            });
        });
    }

    /**
     * 配線盤表示順を保存する
     * @param {any} callback
     */
    savePatchboardOrders(callback) {
        const data = {
            isInPatchboard: this.state.isInPatchboard,
            patchboardOrders: this.state.patchboardOrders
        };

        this.setState({ isSaving: true }, () => {
            sendData(EnumHttpMethod.post, '/api/patchboard/order/set', data, (result, networkError) => {
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
     * 表示順が元データから変更されているかどうか 
     */
    existsOrderChange() {
        const { info, patchboardOrders, isInPatchboard} = this.state;
        const before = isInPatchboard ? info.inPatchboardOrder : info.idfPatchboardOrder;
        return patchboardOrders.some((po, index) => po.patchboardId !== before[index].patchboardId)
    }

    /**
     * 配線盤種別（局入かどうか）を変更する
     * @param {any} isInPatchboard
     */
    changePatchboardType(isInPatchboard) {
        const { info } = this.state;
        this.setState({
            isInPatchboard: isInPatchboard,
            patchboardOrders: isInPatchboard ? info.inPatchboardOrder : info.idfPatchboardOrder
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

    render() {
        const { show } = this.props;
        const { isLoading, isSaving, message, isInPatchboard, patchboardOrders } = this.state;
        const noPatchboardOrders = !patchboardOrders || patchboardOrders.length === 0;
        return (
            <Modal bsSize="small" show={show} onHide={() => this.handleOnCancel()} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>配線盤表示順序</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {isLoading &&
                        <div className="loading">
                            <Icon className="fa fa-sync-alt fa-spin" />
                        </div>
                    }
                    <Grid fluid>
                        <Row className="mb-1">
                            <ToggleSwitch
                                value={isInPatchboard ? 1 : 2}
                                bsSize="sm"
                                name="isInPatchboard"
                                swichValues={[
                                    { value: 1, text: '局入' },
                                    { value: 2, text: 'IDF' },
                                ]}
                                onChange={(val) => this.handlePatchboardTypeChange(val == 1 ? true : false)}
                            />
                        </Row>
                        <Row>
                        {noPatchboardOrders ?
                            <div className="ta-c">該当する配線盤がありません</div>
                            :  
                            <SortableList
                                patchboardOrders={patchboardOrders}
                                onChange={(value) => this.setState({ patchboardOrders: value })}
                            />
                        }
                        </Row>
                    </Grid>
                    <MessageModal
                        show={message.show}
                        title={message.title}
                        bsSize="small"
                        buttonStyle={message.buttonStyle}
                        onOK={message.onOK}
                        onCancel={message.onCancel}
                    >
                        {message.message && message.message.split(/\r\n|\n/).map((str, i) => <div key={i}>{str}</div>)}
                    </MessageModal>
                    <WaitingMessage
                        show={isSaving}
                        type="save"
                    />
                </Modal.Body>
                <Modal.Footer>
                    <SaveButton
                        disabled={isLoading || noPatchboardOrders}
                        onClick={() => this.handleSave()}  
                    />
                    <CancelButton
                        onClick={() => this.handleOnCancel()}
                    />
                </Modal.Footer>
            </Modal>
        );
    }
}

PatchboardSortModal.propTypes = {
    show: PropTypes.bool,
    onHide: PropTypes.func,
    onSaved: PropTypes.func
};

PatchboardSortModal.defaultProps = {
    show: false,
    onHide: () => { },
    onSaved: () => { }
}