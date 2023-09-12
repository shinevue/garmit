/**
 * @license Copyright 2017 DENSO
 * 
 * CompletedModal Reactコンポーネント
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import { setSessionStorage, STORAGE_KEY } from 'webStorage';

/**
 * 保存完了モーダルコンポーネント
 * @param {boolean} show モーダルを表示するか 
 * @param {number} locationId 移動後のロケーションID
 * @param {string} dispSetId 移動後の表示設定ID
 * @param {function} onHide モーダルを閉じるときに呼び出す
 */
export default class CompletedModal extends Component {
    
    /**
     * render
     */
    render() {
        const { show } = this.props;
        return (
            <Modal show={show} bsSize='small' backdrop="static" onHide={() => this.onHide()} >
                <Modal.Header>
                    <Modal.Title>保存完了</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>ユニットの移動が完了しました。</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="primary" onClick={() => this.dispUnitPage()}>ユニット画面へ</Button>
                    <Button onClick={() => this.onHide()}>閉じる</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    /**
     * ユニット画面を表示する
     */
    dispUnitPage() {
        const { locationId, dispSetId } = this.props;
        if (locationId && dispSetId) {
            setSessionStorage(STORAGE_KEY.locationId, locationId);
            setSessionStorage(STORAGE_KEY.dispSetId, dispSetId);
        }
        window.location.href = '/Unit';         //画面遷移
        this.onHide();
    }

    /**
     * 閉じるボタン押下イベント
     */
    onHide(){
        if (this.props.onHide) {
            this.props.onHide();
        }
    }
}

CompletedModal.propTypes = {
    show: PropTypes.bool,
    locationId: PropTypes.number,
    dispSetId: PropTypes.string,
    onHide: PropTypes.func
}