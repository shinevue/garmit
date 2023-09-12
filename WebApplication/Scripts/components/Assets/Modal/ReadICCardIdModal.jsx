/**
 * @license Copyright 2020 DENSO
 * 
 * ReadICCardIdModal Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import { CancelButton } from 'Assets/GarmitButton';

/**
 * カード読み取りモーダル
 * @param {boolean} show モーダルを表示するかどうか
 * @param {function} onCancel キャンセルボタンが押下されたときにを呼び出す
 */
export default class ReadICCardIdModal extends Component {
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.cancelButton = null;
    }

    /**
     * componentDidUpdate
     */
    componentDidUpdate(prevProps, prevState) {
        let count = 0;
        const timerId = setInterval(() => {
            const button = ReactDOM.findDOMNode(this.cancelButton);
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
     * render
     */
    render() {
        const { show } = this.props;
        return (            
            <Modal show={show} backdrop="static" bsSize="small" onHide={() => this.onCancel()}>
                <Modal.Header closeButton>
                    <Modal.Title>カード読み取り</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>カードをかざしてください。</div>
                </Modal.Body>
                <Modal.Footer>
                    <CancelButton buttonRef={ref => this.cancelButton = ref} onClick={() => this.onCancel()} />
                </Modal.Footer>
            </Modal>
        );
    }

    /**
     * キャンセルイベントを呼び出す
     */
    onCancel() {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }
}