'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { HelpBlock, Grid, Row, Col, Form, FormGroup, FormControl, Radio, Checkbox, InputGroup, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

import TextForm from "Common/Form/TextForm";

export default class ThresholdSettingForm extends Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        const { unit, value, percentage, rated, onChange, valueValidationState, valueHelpText, percentageValidationState, percentageHelpText, disabled } = this.props;

        const checkedRate = rated && percentage != null;

        return (
            <Row>
                <Col sm={6}>
                    <Radio
                        className="mb-05 pa-t-05"
                        checked={!checkedRate}
                        disabled={disabled}
                        onClick={checkedRate && (() => onChange(value || '', null))}
                    >
                        <span>計測値</span>
                    </Radio>
                    <TextForm
                        value={value || ''}
                        isReadOnly={checkedRate || disabled}
                        onChange={(val) => onChange(val, null)}
                        validationState={!checkedRate && valueValidationState}
                        helpText={!checkedRate && valueHelpText}
                        unit={unit && `(${unit})`}
                    />
                </Col>
                <Col sm={6}>
                    <Radio
                        className="mb-05 pa-t-05"
                        checked={checkedRate}
                        disabled={!rated || disabled}
                        onClick={!checkedRate && (() => onChange(value, ''))}
                >
                        <span>定格に対する割合</span>
                    </Radio>
                    <TextForm
                        value={percentage || ''}
                        isReadOnly={!checkedRate || disabled}
                        onChange={(val) => onChange(val * (rated / 100), val)}
                        validationState={checkedRate && percentageValidationState}
                        helpText={checkedRate && percentageHelpText}
                        unit="(%)"

                    />

                </Col>
            </Row>
        );
    }
}