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

import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';

import { validateText, VALIDATE_STATE, successResult, errorResult } from 'inputCheck';

const MAX_LENGTH = {
    name: 32
};

export default class UnitTypeEditModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            editedUnitType: this.props.unitType,
            inputCheck: {
                name: {}
            }
        }
    }

    /**
     * コンポーネントが新しいpropsを受け取ったとき
     * @param {any} nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(nextProps.unitType) !== JSON.stringify(this.props.unitType)
            || (nextProps.showModal && !this.props.showModal)) {
            this.setState({ editedUnitType: nextProps.unitType }, () => {
                this.initValidation();
            });
        }
    }

    /**
     * 名称が変更された時
     * @param {any} name
     */
    onNameChange(name) {
        const unitType = Object.assign({}, this.state.editedUnitType);
        unitType.name = name;

        const inputCheck = Object.assign({}, this.state.inputCheck);
        inputCheck.name = this.checkValidation(name, 'name');

        this.setState({ editedUnitType: unitType, inputCheck: inputCheck });
    }

    /**
     * 入力チェックをする
     * @param {any} val
     * @param {any} key
     */
    checkValidation(val, key) {
        switch (key) {
            case 'name':
                const isDuplicate = this.props.unitTypes.some((ut) => ut.name == val && ut.typeId != this.state.editedUnitType.typeId);
                return isDuplicate ? errorResult('既存のユニット種別と重複しています') : validateText(val, MAX_LENGTH.name, false);

            default:
                return successResult;
        }
    }

    /**
     * 初期の入力チェックをセットする
     */
    initValidation() {
        const inputCheck = Object.assign({}, this.state.inputCheck);

        for (let key of Object.keys(inputCheck)) {
            inputCheck[key] = this.checkValidation(this.state.editedUnitType[key], key);
        }

        this.setState({ inputCheck: inputCheck });
    }

    /**
     * エラーがあるか
     */
    hasError() {
        for (let key of Object.keys(this.state.inputCheck)) {
            if (this.state.inputCheck[key].state === VALIDATE_STATE.error) {
                return true;
            }
        }
        return false;
    }

    /**
     * render
     */
    render() {
        const { showModal, onSubmit, onCancel } = this.props;
        const { editedUnitType, inputCheck } = this.state;

        return (
            <Modal show={showModal} onHide={onCancel} bsSize="sm" backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>ユニット種別編集</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editedUnitType &&
                        <TextForm
                            label="名称"
                            value={editedUnitType.name}
                            maxlength={MAX_LENGTH.name}
                            onChange={(val) => this.onNameChange(val)}
                            validationState={inputCheck.name.state}
                            helpText={inputCheck.name.helpText}
                        />
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        bsStyle="success"
                        onClick={() => onSubmit(editedUnitType)}
                        disabled={this.hasError()}
                    >
                        <Icon className="fal fa-save mr-05" />
                        <span>保存</span>
                    </Button>
                    <Button
                        iconId="uncheck"
                        bsStyle="lightgray"
                        onClick={onCancel}
                    >
                        <span>キャンセル</span>
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}