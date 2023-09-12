'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import Box from 'Common/Layout/Box';

import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';

import { LAVEL_TYPE } from 'authentication';　　
import { maxLength } from 'pointUtility';

export default class DisplayInfoBox extends Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    /**
     * render
     */
    render() {
        const { lookUp, point, onEdit, inputCheck, bulk, checked, onCheckChange, level } = this.props;

        const isReadOnly = level === LAVEL_TYPE.operator || level === LAVEL_TYPE.normal;

        return (
            <Box boxStyle="default">
                <Box.Header>
                    <Box.Title>表示情報</Box.Title>
                </Box.Header >
                <Box.Body>
                    <InputForm>
                        <InputForm.Row>
                            <InputForm.Col
                                label="ONメッセージ"
                                columnCount={2}
                                checkbox={bulk}
                                checked={bulk && checked.onMessage}
                                onCheckChange={() => onCheckChange([{ value: !checked.onMessage, key: 'onMessage' }])}
                            >
                                <TextForm
                                    isReadOnly={(bulk && !checked.onMessage) || isReadOnly}
                                    value={point.onMessage || ''}
                                    maxlength={maxLength.onMessage}
                                    onChange={(val) => onEdit([{ value: val, key: 'onMessage' }])}
                                    validationState={inputCheck.onMessage && inputCheck.onMessage.state}
                                    helpText={inputCheck.onMessage && inputCheck.onMessage.helpText}
                                />
                            </InputForm.Col>
                            <InputForm.Col
                                label="OFFメッセージ"
                                columnCount={2}
                                checkbox={bulk}
                                checked={bulk && checked.offMessage}
                                onCheckChange={() => onCheckChange([{ value: !checked.offMessage, key: 'offMessage' }])}
                            >
                                <TextForm
                                    isReadOnly={(bulk && !checked.offMessage) || isReadOnly}
                                    value={point.offMessage || ''}
                                    maxlength={maxLength.offMessage}
                                    onChange={(val) => onEdit([{ value: val, key: 'offMessage' }])}
                                    validationState={inputCheck.offMessage && inputCheck.offMessage.state}
                                    helpText={inputCheck.offMessage && inputCheck.offMessage.helpText}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col
                                isRequired={bulk || (point.datatype && point.datatype.isContact)}
                                label="ON値"
                                columnCount={2}
                                checkbox={bulk}
                                checked={bulk && checked.onValue}
                                onCheckChange={() => onCheckChange([{ value: !checked.onValue, key: 'onValue' }])}
                            >
                                <TextForm
                                    isReadOnly={(bulk && !checked.onValue) || isReadOnly}
                                    value={point.onValue}                                    
                                    onChange={(val) => onEdit([{ value: val, key: 'onValue' }])}
                                    validationState={inputCheck.onValue && inputCheck.onValue.state}
                                    helpText={inputCheck.onValue && inputCheck.onValue.helpText}
                                />
                            </InputForm.Col>
                            <InputForm.Col
                                isRequired={bulk || (point.datatype && point.datatype.isContact)}
                                label="OFF値"
                                columnCount={2}
                                checkbox={bulk}
                                checked={bulk && checked.offValue}
                                onCheckChange={() => onCheckChange([{ value: !checked.offValue, key: 'offValue' }])}
                            >
                                <TextForm
                                    isReadOnly={(bulk && !checked.offValue) || isReadOnly}
                                    value={point.offValue}
                                    onChange={(val) => onEdit([{ value: val, key: 'offValue' }])}
                                    validationState={inputCheck.offValue && inputCheck.offValue.state}
                                    helpText={inputCheck.offValue && inputCheck.offValue.helpText}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                    </InputForm>
                </Box.Body>
            </Box>
        );
    }
}