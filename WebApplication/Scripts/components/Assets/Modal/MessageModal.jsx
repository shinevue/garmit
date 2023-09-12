/**
 * @license Copyright 2018 DENSO
 * 
 * MessageModal Reactコンポーネント
 * 
 * <MessageModal show={} title='' bsSize='small' buttonStyle='' onOK={() => } onCancel={() => } >
 *      ...message
 * </MessageModal>
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

/**
 * メッセージコンポーネントを定義します。
 * @param {string} title タイトル
 * @param {boolean} show モーダルを表示するかどうか
 * @param {string} bsSize モーダルのサイズ（'lg', 'large', 'sm', 'small'のいずれか）
 * @param {string} buttonStyle ボタンのスタイル（'message', 'confirm', 'delete', 'save', 'yesNo'のいずれか。指定しなかった場合はOKボタンのみ表示）
 * @param {function} onCancel キャンセルボタンが押下されたときにを呼び出す
 * @param {function} onOK OKボタンが押下されたときに呼び出す
 */
export default class MessageModal extends Component {
    
    /**
     * render
     */
    render() {
        const { title, show, bsSize, buttonStyle, children, disabled, className, closeButton } = this.props;
        const isMessage = !(['confirm', 'delete', 'save', 'yesNo'].indexOf(this.props.buttonStyle) < 0);
        return (
            <Modal className={className} bsSize={bsSize} show={show} backdrop={isMessage?'static':true} onHide={() => this.handleHide()}>
                <Modal.Header closeButton={closeButton}>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {children}
                </Modal.Body>
                <Modal.Footer>
                    {this.OKButton(buttonStyle, disabled)}
                    {this.cancelButton(buttonStyle)}
                </Modal.Footer>
            </Modal>
        );
    }

    componentDidUpdate(prevProps, prevState) {
        let count = 0;
        let focusCancel = ['confirm', 'delete', 'save', 'yesNo'].indexOf(this.props.buttonStyle) < 0;
        const timerId = setInterval(() => {
            const button = ReactDOM.findDOMNode(focusCancel ? this.refs.cancel : this.refs.ok);
            if (button) {
                button.focus();
                clearInterval(timerId);
                return;
            }
            if (count++ == 100) {
                clearInterval(timerId);
                return;
            }
        }, 10);
    }

    /**
     * OKボタン
     * @param {string} buttonStyle ボタンのスタイル
     * @returns {element} OKボタン
     */
    OKButton(buttonStyle, disabled){
        var title = '';
        var style = 'default';
        var iconId = '';
        switch (buttonStyle) {
            case 'confirm':
                title = 'OK';
                break;
            case 'delete':
                title = '削除';
                style = 'danger';
                iconId= 'delete';
                break;
            case 'save':
                title = '保存';
                style = 'success';
                break;
            case 'yesNo':
                title = 'はい'
        }
        return (title&&
            <Button ref="ok" autoFocus tabIndex={0} iconId={iconId} bsStyle={style} disabled={disabled} onClick={() => this.handleOK()}>
                {buttonStyle==='save'&&<Icon className="fal fa-save mr-05" />}
                {title}
            </Button>        
        );
    }

    /**
     * キャンセルボタン
     * @param {string} buttonStyle ボタンのスタイル
     * @returns {element} キャンセルボタン
     */
    cancelButton(buttonStyle) {
        var style = buttonStyle ? buttonStyle : 'massage';
        return (
            <Button
                ref="cancel"
                autoFocus={['confirm', 'delete', 'save', 'yesNo'].indexOf(buttonStyle) < 0}
                tabIndex={0}
                bsStyle={(buttonStyle === 'delete' || buttonStyle === 'save') ? 'lightgray' : 'default'}
                onClick={() => this.handleCancel()}
            >
                {(buttonStyle === 'delete' || buttonStyle === 'save') && <Icon className="fal fa-times mr-05" />}
                {buttonStyle === 'message' ? 'OK' : (buttonStyle === 'yesNo' ? 'いいえ' : 'キャンセル')}
            </Button>
        );
    }

    /**
     * OKボタンのクリックイベント
     */
    handleOK() {
        if (this.props.onOK) {
            this.props.onOK();
        }
    }

    /**
     * キャンセルボタンのクリックイベント
     */
    handleCancel() {
        if(this.props.onCancel) {
            this.props.onCancel();
        }
    }

    /**
     * キャンセルボタンのクリックイベント
     */
    handleHide() {
        if (this.props.onHide) {
            this.props.onHide();
        } else {
            this.handleCancel();
        }
    }
}

MessageModal.propTypes = {
    title: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    bsSize: PropTypes.oneOf(['lg', 'large', 'sm', 'small']),
    buttonStyle: PropTypes.oneOf(['message', 'confirm', 'delete', 'save']),
    disabled: PropTypes.bool,
    className: PropTypes.string,
    onCancel: PropTypes.func,
    onOK: PropTypes.func,
    onHide: PropTypes.func
}

MessageModal.defaultProps = {
    closeButton: true
}