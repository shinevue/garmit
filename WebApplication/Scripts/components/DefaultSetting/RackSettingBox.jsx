'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import Box from 'Common/Layout/Box';

import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';

export default class RackSettingBox extends Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    /**
     * render
     */
    render() {
        const { isLoading, isReadOnly, inputCheck, systemSet, onEdit } = this.props;

        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>ラック</Box.Title>
                </Box.Header >
                <Box.Body>
                {systemSet &&
                    <InputForm>
                        <InputForm.Row>
                            <InputForm.Col label="ラック耐荷重（注意）" columnCount={1} isRequired={true}>
                                <TextForm
                                    isReadOnly={isReadOnly}
                                    unit="%"
                                    value={systemSet.rackLoadAlarmPercentage}
                                    validationState={!isReadOnly && inputCheck && inputCheck.rackLoadAlarmPercentage.state}
                                    helpText={!isReadOnly && inputCheck && inputCheck.rackLoadAlarmPercentage.helpText}
                                    onChange={(val) => onEdit(val, 'rackLoadAlarmPercentage')}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                    </InputForm>
                }
                </Box.Body>
            </Box>
        );
    }
}