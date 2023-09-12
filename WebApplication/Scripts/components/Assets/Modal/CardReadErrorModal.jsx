/**
 * @license Copyright 2021 DENSO
 * 
 * CardReadErrorModal Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import Button from 'Common/Widget/Button';
import { CancelButton } from 'Assets/GarmitButton';

/**
 * カード読み取りエラーモーダル
 * @param {boolean} show モーダルを表示するかどうか
 * @param {number} errorCode エラーコード
 * @param {string} errorMessage エラーメッセージ
 * @param {function} onHide 「×」ボタンクリック時に呼び出す
 * @param {function} onCancel キャンセルボタンが押下されたときにを呼び出す
 * @param {function} onOK OKボタンが押下されたときに呼び出す
 */
export default class CardReadErrorModal extends Component {
    
    /**
     * render
     */
    render() {
        const { show, errorCode, errorMessage } = this.props;
        return (
            <Modal show={show} backdrop="static" bsSize="small" onHide={() => this.handleHide()}>
                <Modal.Header closeButton>
                    <Modal.Title>読み取りエラー</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>カードが読み取れませんでした</p>
                    {(errorCode||errorMessage)&&
                        <div>【エラー内容】</div>
                    }
                    {errorCode&&
                        <div>code: {errorCode}</div>
                    }
                    {errorMessage&&
                        <div>{errorCode&&'message:'} {errorMessage}</div>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button autoFocus tabIndex={0} bsStyle="primary" onClick={() =>this.handleReread()}>
                        再読み取り
                    </Button> 
                    <CancelButton onClick={() => this.handleCancel()} />
                </Modal.Footer>
            </Modal>
        );
    }
    
    /**
     * 再読取りボタンのクリックイベント
     */
     handleReread() {
        if (this.props.onReread) {
            this.props.onReread();
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