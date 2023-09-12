/**
 * @license Copyright 2020 DENSO
 *
 * SettingWidget Reactコンポーネント
 * 設定に使用する移動可能なウィジェットアイテム
 *
 */

'use strict';

import React, { Component } from 'react';
import { Navbar, Modal} from "react-bootstrap";
import Icon from "Common/Widget/Icon";
import Button from "Common/Widget/Button";
import MessageModal from 'Assets/Modal/MessageModal';
import classNames from 'classnames';

/**
 * SettingWidget
 * @param {string} title パネルタイトル
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {boolean} canSave （バリデーションを通過して）保存ボタンが有効かどうか
 * @param {boolean} hasSetting 詳細を設定するモーダルを持つかどうか
 * @param {string} modalSize 設定モーダルのサイズ（→Modal.bsSize）
 * @param {string} dialogClassName 設定モーダルの追加クラス名 （→Modal.dialogClassName）
 * @param {function} onShow 設定モーダルが開いた時のイベントハンドラ
 * @param {function} onSaveButtonClick 保存ボタンクリック時のイベントハンドラ
 */
export default class SettingWidget extends Component {

    constructor() {
        super();
        this.state = {
            isModalShow: false,
            message: {},
        };
    }

    showModal() {
        this.setState({isModalShow: true});
    }

    hideModal() {
        this.setState({isModalShow: false});
    }

    confirmSave() {
        const message = {
            show: true,
            buttonStyle: 'save',
            title: '保存確認',
            size: "sm",
            message: '設定を保存してよろしいですか？',
            onCancel: () => this.clearMessage(),
            onOK: () => {
                this.clearMessage();
                this.props.onSaveButtonClick((result) => { this.completeSave(result) });
            }
        }
        this.setState({ message: Object.assign({}, this.state.message, message) });
    }

    completeSave(result) {
        if (result && result.isSuccess) {
            this.hideModal();
        }
        const message = {
            show: true,
            buttonStyle: 'message',
            title: (result && result.isSuccess) ? '保存完了' : 'エラー',
            message: result && result.message,
            onCancel: () => {
                this.clearMessage();
            }
        }
        this.setState({ message: Object.assign({}, this.state.message, message) });
    }

    /**
     * メッセージモーダルを閉じる
     */
    clearMessage() {
        this.setState({ message: Object.assign({}, this.state.message, { show: false }) });
    }
    /**
     * render
     */
    render() {
        const { title, modalSize, dialogClassName, hasSetting, isReadOnly, canSave, onShow, children } = this.props;
        const { message } = this.state;
        return (
            <div className="widget-setting">
                <Navbar fluid>
                    <Navbar.Brand>
                        {title}
                    </Navbar.Brand>
                    {hasSetting &&
                        <Navbar.Form pullRight>
                            <Button isCircle={true} iconId="category-setting" className="btn-link" onClick={() => {
                                this.showModal();
                            }}></Button>
                        </Navbar.Form>
                    }
                </Navbar>
                <Modal
                    backdrop="static"
                    show={this.state.isModalShow}
                    bsSize={ modalSize || "lg" }
                    dialogClassName={classNames('widget-setting-modal', dialogClassName || (modalSize ? '' : 'modal-xlg')) }
                    onShow={() => { onShow && onShow(); }}
                    onHide={() => { this.hideModal() }}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>{title}設定</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {children}
                    </Modal.Body>
                    <Modal.Footer>
                        {
                            !isReadOnly &&
                            <Button
                                bsStyle="success"
                                onClick={() => { this.confirmSave(); }}
                                disabled={!canSave}
                            >
                                <Icon className="fal fa-save mr-05" />
                                <span>保存</span>
                            </Button>
                        }
                        <Button
                            iconId="uncheck"
                            bsStyle="lightgray"
                            onClick={() => { this.hideModal() }}
                        >
                            <span>キャンセル</span>
                        </Button>
                    </Modal.Footer>
                </Modal>
                <MessageModal
                    show={message.show}
                    title={message.title}
                    bsSize={message.size}
                    buttonStyle={message.buttonStyle}
                    onOK={message.onOK}
                    onCancel={message.onCancel}
                >
                    {message.message}
                </MessageModal>
            </div>
        );
    }
}

SettingWidget.defaultProps = {
    modalSize: '',
    dialogClassName: '',
    hasSetting: true,
    canSave: true,
    isReadOnly: false,
};