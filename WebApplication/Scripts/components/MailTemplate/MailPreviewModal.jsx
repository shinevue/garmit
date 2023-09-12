/**
 * Copyright 2017 DENSO Solutions
 * 
 * SoundSelectModal Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import { Modal, Panel, ControlLabel } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import TextForm from 'Common/Form/TextForm';
import TextareaForm from 'Common/Form/TextareaForm';

export default class MailPreviewModal extends Component {

    constructor(props) {
        super(props)
        this.state = {

        }
    }

    /**
     * render
     */
    render() {
        const { showModal, onHide, subject, body } = this.props;

        const bodyRows = body.split('\n');

        return (
            <Modal show={showModal} onHide={() => onHide()}>
                <Modal.Header closeButton>
                    <Modal.Title>メールプレビュー</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ControlLabel>件名：</ControlLabel>
                    <Panel>{subject}</Panel>
                    <ControlLabel>本文：</ControlLabel>
                    <Panel>
                        {bodyRows.map((row) => <div style={{ minHeight: 20, wordWrap: 'break-word' }}>{row}</div>)}
                    </Panel>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => onHide()}>閉じる</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}