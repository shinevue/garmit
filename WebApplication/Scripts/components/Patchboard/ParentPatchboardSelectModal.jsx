/**
 * Copyright 2020 DENSO
 * 
 * 親配線盤設定モーダル Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Modal, Grid, Row, Col } from 'react-bootstrap';
import { Button } from 'react-bootstrap';

import Icon from 'Common/Widget/Icon';

import MessageModal from 'Assets/Modal/MessageModal';

import PatchboardListBox from 'Patchboard/PatchboardListBox';
import PatchboardPathListBox from 'Patchboard/PatchboardPathListBox';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

export default class ParentPatchboardSelectModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            selectedPatchboard: props.selectedPatchboard,
            selectedPath: props.selectedPath,
            patchboardTreeList: null,
            message: {}
        };
    }

    /**
     * コンポーネントがマウントされた時
     */
    componentDidMount() {
        // 配線盤が選択されている場合は経路一覧を読み込む
        if (this.state.selectedPatchboard) {
            this.loadAncestorsTree(this.state.selectedPatchboard.patchboardId);
        }
    }

    /**
     * コンポーネントが新しいPropsを受け取ったとき
     * @param {any} nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.selectedPatchboard != nextProps.selectedPatchboard) {
            this.setState({ selectedPatchboard: nextProps.selectedPatchboard });
        }

        if (this.props.selectedPath != nextProps.selectedPath) {
            this.setState({ selectedPath: nextProps.selectedPath });
        }

        if (this.props.show != nextProps.show && nextProps.show) {
            this.setState({ selectedPatchboard: nextProps.selectedPatchboard, selectedPath: nextProps.selectedPath, patchboardTreeList: null });
            if (nextProps.selectedPatchboard) {
                this.loadAncestorsTree(nextProps.selectedPatchboard.patchboardId);
            }
        }
    }

    /**
     * 配線盤が選択された時
     * @param {any} patchboard
     */
    handleOnSelectPatchboard(patchboard) {
        if (!this.state.selectedPatchboard) {
            this.setState({ selectedPatchboard: patchboard, selectedPath: null });
            this.loadAncestorsTree(patchboard.patchboardId);
        } else if (patchboard.patchboardId != this.state.selectedPatchboard.patchboardId) {
            this.setState({
                message: {
                    show: true,
                    buttonStyle: 'confirm',
                    title: '確認',
                    message: '配下配線盤の経路が変更になりますが、よろしいですか？',
                    onOK: () => {
                        this.clearMessage();
                        this.setState({ selectedPatchboard: patchboard, selectedPath: null });
                        this.loadAncestorsTree(patchboard.patchboardId);
                    },
                    onCancel: () => this.clearMessage()
                }
            });
        }        
    }

    /**
     * 経路が選択された時
     * @param {any} path
     */
    handleOnSelectPath(path){
        this.setState({ selectedPath: path });
    }

    /**
     * 適用ボタンクリックイベント
     */
    handleSubmit() {
        if (this.props.selectedPath
            && (this.props.selectedPath.patchboardId != this.state.selectedPath.patchboardId
                || this.props.selectedPath.pathNo != this.state.selectedPath.pathNo)) {
            this.setState({                
                message: {
                    show: true,
                    buttonStyle: 'confirm',
                    title: '確認',
                    message: '配下配線盤の経路が変更になりますが、よろしいですか？',
                    onOK: () => {
                        if (this.props.onSubmit) {
                            this.clearMessage();
                            this.props.onSubmit(this.state.selectedPath);
                        }
                    },
                    onCancel: () => this.clearMessage()
                }                
            });
        } else {
            if (this.props.onSubmit) {
                this.props.onSubmit(this.state.selectedPath);
            }
        }
    }

    /**
     * キャンセルボタンクリックイベント
     */
    handleOnCancel() {
        this.props.onCancel();
    }

    /**
     * 先祖ツリーを読み込む
     * @param {any} patchboardId
     * @param {any} callback
     */
    loadAncestorsTree(patchboardId, callback) {
        const postData = { patchboardId: patchboardId };

        this.setState({ isLoading: true }, () => {
            sendData(EnumHttpMethod.post, '/api/patchboard/tree/ancestors', postData, (ancestorsTree, networkError) => {
                this.setState({ isLoading: false });
                if (networkError) {
                    this.showNetWorkErrorMessage();
                } else {
                    this.setState({ patchboardTreeList: ancestorsTree });
                }
                if (callback) {
                    callback(ancestorsTree);
                }
            });
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
        const { show, patchboardList } = this.props;
        const { isLoading, patchboardTreeList, message } = this.state;
        return (
            <Modal bsSize="large" show={show} onHide={() => this.handleOnCancel()} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>親配線盤設定</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Grid fluid>
                        <Row>
                            <Col xs={6}>
                                <PatchboardListBox patchboardList={patchboardList}
                                    onSelect={(patchboard) => this.handleOnSelectPatchboard(patchboard)}
                                    selectedPatchboard={this.state.selectedPatchboard}
                                    isLoading={isLoading}
                                />
                            </Col>
                            <Col xs={6}>
                                <PatchboardPathListBox patchboardTreeList={patchboardTreeList}
                                    onSelect={(arg) => this.handleOnSelectPath(arg)}
                                    selectedPath={this.state.selectedPath}
                                    isLoading={isLoading}
                                />
                            </Col>
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
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        bsStyle="primary"
                        onClick={() => this.handleSubmit()}
                        disabled={!this.state.selectedPath || isLoading}
                    >
                        <Icon className="fal fa-circle mr-05" />
                        <span>適用</span>
                    </Button>
                    <Button
                        iconId="uncheck"
                        bsStyle="lightgray"
                        onClick={() => this.handleOnCancel()}
                    >
                        <span>キャンセル</span>
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

ParentPatchboardSelectModal.propTypes = {
    show: PropTypes.bool,
    patchboardList: PropTypes.array,
    selectedPatchboard: PropTypes.object,
    selectedPath: PropTypes.object,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func
};