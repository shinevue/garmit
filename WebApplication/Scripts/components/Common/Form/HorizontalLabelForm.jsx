/**
 * @license Copyright 2017 DENSO
 * 
 * HorizontalLabelFormコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { FormGroup, ControlLabel, FormControl, Col } from 'react-bootstrap';

/**
 * 水平ラベルフォーム
 * @param {string}　label フォームのタイトル
 * @param {string}　value 表示値
 * @param {shape} labelCol タイトルのサイズ
 * @param {shape} valueCol 値のサイズ
 * @param {string} className className
 */
export default class HorizontalLabelForm extends Component {
    render(){
        const { label, value, labelCol, valueCol, className } = this.props;
        return (
            <FormGroup className={className}>
                <Col componentClass={ControlLabel} 
                     xs={labelCol&&labelCol.xs} 
                     sm={labelCol&&labelCol.sm} 
                     md={labelCol&&labelCol.md} 
                     lg={labelCol&&labelCol.lg}>
                    {label}
                </Col>
                <Col xs={valueCol&&valueCol.xs} 
                     sm={valueCol&&valueCol.sm} 
                     md={valueCol&&valueCol.md} 
                     lg={valueCol&&valueCol.lg}>
                    <FormControl.Static>{value}</FormControl.Static>
                </Col>
            </FormGroup>
        );
    }
}

HorizontalLabelForm.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    labelCol: PropTypes.shape({
        xs: PropTypes.number,
        sm: PropTypes.number,
        md: PropTypes.number,
        lg: PropTypes.number
    }),
    valueCol: PropTypes.shape({
        xs: PropTypes.number,
        sm: PropTypes.number,
        md: PropTypes.number,
        lg: PropTypes.number
    }),
    className: PropTypes.string
};
