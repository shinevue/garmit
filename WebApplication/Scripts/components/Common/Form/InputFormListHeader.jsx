/**
 * @license Copyright 2017 DENSO
 * 
 * InputFormListHeader Reactコンポーネント
 * <InputFormListHeader label='title' columnCount={2} isRequired={false} />
 *  
 */
'use strict';

import React, { Component } from 'react';
import { Col, Row, FormGroup, ControlLabel } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * 入力フォームの入力欄
 * <InputFormListHeader label='title' columnCount={2} isRequired={false}>
 *      ・・・FormGroups or FormControls
 * </InputFormListHeader>
 * @param {string} label 入力欄のタイトル
 * @param {number} columnCount 入力欄の大きさ
 * @param {boolen} isRequired 必須表示するかどうか
 * @param {string} validationState 検証結果
 */
export default class InputFormListHeader extends Component {
    
    /**
     * render
     */
    render() {
        const { label, isRequired, validationState } = this.props;
        const columnCount = this.props.columnCount ? this.props.columnCount : 1;

        return (
            <Col sm={columnCount}>
                {label && 
                    <label className="flex-center mt-05">{label}
                        {isRequired && <span className='text-red'>*</span>}
                    </label>
                }
            </Col>
        );
    }
}

InputFormListHeader.PropTypes = {
    label: PropTypes.string,
    columnCount : PropTypes.number,
    isRequired: PropTypes.bool,
    validationState: PropTypes.string,
}