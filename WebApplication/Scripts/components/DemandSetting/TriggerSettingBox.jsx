'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { LAVEL_TYPE } from 'authentication';　　

import Box from 'Common/Layout/Box';
import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import LocationForm from 'Assets/Condition/LocationForm';

export default class TriggerSettingBox extends Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    makeRows(triggerThresholds) {
        const rows = [];
        for (let i = 0; i < triggerThresholds.length; i = i + 2) {
            rows.push(
                <InputForm.Row>
                    {this.makeCol(triggerThresholds[i], i)}
                    {triggerThresholds[i + 1] && this.makeCol(triggerThresholds[i + 1], i + 1)}
                </InputForm.Row>
            );            
        }
        return rows;
    }

    makeCol(triggerThreshold, i) {
        const { inputCheck } = this.props;
        return (
            <InputForm.Col label={triggerThreshold.triggerType.triggerName} columnCount={2}>
                <TextForm
                    value={triggerThreshold.threshold}
                    onChange={(val) => this.onEdit(val, i)}
                    validationState={inputCheck[i].threshold.state}
                    helpText={inputCheck[i].threshold.helpText}
                    unit={triggerThreshold.triggerType.unit}
                />
            </InputForm.Col>            
        );
    }

    /**
     * 値が変更された時
     * @param {any} val
     * @param {any} i
     */
    onEdit(val, i) {
        const triggerThresholds = this.props.triggerThresholds.slice();
        triggerThresholds[i] = Object.assign({}, triggerThresholds[i], { threshold: val });
        this.props.onEdit(triggerThresholds);
    }

    /**
     * render
     */
    render() {
        const { triggerThresholds, isLoading } = this.props;
        const { } = this.state

        return (
            <Box boxStyle="default" isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>トリガー閾値</Box.Title>
                </Box.Header >
                <Box.Body>
                    <InputForm>
                        {this.makeRows(triggerThresholds)}                        
                    </InputForm>
                </Box.Body>
            </Box>
        );
    }
}