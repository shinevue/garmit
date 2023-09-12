/**
 * Copyright 2017 DENSO Solutions
 * 
 * ImageSelectModal Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import ImageList from 'Assets/ImageList';

export default class ImageSelectModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            selectedImage: props.selectedImage,
        }
    }

    /**
     * コンポーネントが新しいpropsを受け取ったとき
     * @param {any} nextProps
     */
    componentWillReceiveProps(nextProps) {
        // モーダルが開くとき
        if (nextProps.showModal && !this.props.showModal) {
            // 選択状態をリセット
            this.setState({ selectedImage: nextProps.selectedImage });
        }
    }

    /**
     * 適用ボタンがクリックされた時
     */
    onSubmit() {
        if (this.props.onSelect) {
            this.props.onSelect(this.state.selectedImage);
        }
    }

    render() {
        const { showModal, onHide, onSelect, unitImages } = this.props;
        const { selectedImage } = this.state;

        return (
            <Modal show={showModal} backdrop="static" onHide={onHide} bsSize="lg">
                <Modal.Header closeButton>
                    <Modal.Title>画像選択</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ImageList
                        unitImages={unitImages}
                        selectedImage={selectedImage}
                        onSelect={(image) => this.setState({ selectedImage: image })}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        bsStyle="primary"
                        onClick={() => this.onSubmit()}
                        disabled={!selectedImage}
                    >
                        <Icon className="fal fa-circle mr-05" />
                        <span>適用</span>
                    </Button>
                    <Button
                        iconId="uncheck"
                        bsStyle="lightgray"
                        onClick={onHide}
                    >
                        <span>キャンセル</span>
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}