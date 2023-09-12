/**
 * Copyright 2017 DENSO Solutions
 * 
 * SoundSelectModal Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import { Modal, Form } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import SelectForm from 'Common/Form/SelectForm';

import { errorResult, successResult, validateSelect, VALIDATE_STATE } from 'inputCheck';

export default class MailPreviewModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            searchCondition: {
                alarmCategory: null,
                dataType: null,
                eventType: null
            },
            inputCheck: {
                alarmCategory: errorResult(""),
                eventType: errorResult(""),
                dataType: successResult
            }
        }
    }

    /**
     * アラーム種別が変更された時
     * @param {any} alarmType
     */
    onAlarmCategoryChange(alarmType) {
        const searchCondition = Object.assign({}, this.state.searchCondition);
        const alarmCategory = this.props.lookUp.incidentTypes.find((type) => type.alarmType == alarmType);
        searchCondition.alarmCategory = alarmCategory;

        if (!alarmCategory.needsDataType) {
            searchCondition.dataType = null;
        }

        const inputCheck = Object.assign({}, this.state.inputCheck);
        inputCheck.alarmCategory = validateSelect(alarmType);
        inputCheck.dataType = (alarmCategory && alarmCategory.needsDataType && searchCondition.dataType == null) ?
            errorResult('') : successResult;

        this.setState({
            searchCondition: searchCondition,
            inputCheck: inputCheck
        });
    }

    /**
     * イベント種別が変更された時
     * @param {any} eventType
     */
    onEventTypeChange(eventType) {
        this.setState({
            searchCondition: Object.assign({}, this.state.searchCondition, { eventType: eventType }),
            inputCheck: Object.assign({}, this.state.inputCheck, { eventType: validateSelect(eventType) })
        });
    }

    /**
     * データ種別が変化したとき
     * @param {any} dtType
     */
    onDataTypeChange(dtType) {
        const dataType = this.props.lookUp.dataTypes.find((type) => type.dtType == dtType);
        const alarmCategory = this.state.searchCondition.alarmCategory;
        const validateResult = (alarmCategory && alarmCategory.needsDataType && dataType == null) ?
            errorResult('') : successResult;

        this.setState({
            searchCondition: Object.assign({}, this.state.searchCondition, { dataType: dataType }),
            inputCheck: Object.assign({}, this.state.inputCheck, { dataType: validateResult })
        });
    }

    /**
     * 入力エラーがあるか
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
        const { showModal, onHide, onSelect, lookUp } = this.props;
        const { searchCondition, inputCheck } = this.state;
        const { alarmCategory, eventType, dataType } = searchCondition;

        return (
            <Modal bsSize="sm" show={showModal} onHide={() => onHide()} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>テンプレート選択</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form className="mb-1">
                        <SelectForm
                            className="mr-1"
                            label="アラーム種別："
                            value={alarmCategory && alarmCategory.alarmType}
                            options={lookUp && lookUp.incidentTypes.map((type) => ({ value: type.alarmType, name: type.name }))}
                            validationState={inputCheck.alarmCategory.state}
                            onChange={(v) => this.onAlarmCategoryChange(v)}
                        />
                        {(alarmCategory && alarmCategory.needsDataType) &&
                            <SelectForm
                                className="mr-1"
                                label="データ種別："
                                value={dataType && dataType.dtType}
                                options={lookUp && lookUp.dataTypes.map((type) => ({ value: type.dtType, name: type.name }))}
                                validationState={inputCheck.dataType.state}
                                onChange={(v) => this.onDataTypeChange(v)}
                            />
                        }
                        <SelectForm
                            className="mr-1"
                            label="イベント種別："
                            value={eventType}
                            options={[{ value: 1, name: '発生' }, { value: 2, name: '復旧' }, { value: 3, name: '継続' }]}
                            validationState={inputCheck.eventType.state}
                            onChange={(v) => this.onEventTypeChange(v)}
                        />
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        bsStyle="primary"
                        disabled={this.hasError()}
                        onClick={() => {
                            onSelect(searchCondition);
                            onHide();
                        }}
                    >
                        <Icon className="fal fa-circle mr-05" />
                        選択
                    </Button>
                    <Button
                        iconId="uncheck"
                        bsStyle="lightgray"
                        onClick={() => onHide()}
                    >
                        キャンセル
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}