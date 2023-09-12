/**
 * @license Copyright 2017 DENSO
 * 
 * InputFormListCol Reactコンポーネント
 * <InputFormListCol columnSize={2} isRequired={false} />
 *  
 */
'use strict';

import React, { Component } from 'react';
import { Col} from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * 入力フォームの入力欄
 * <InputFormListCol columnSize={2} isRequired={false}>
 *      ・・・FormGroups or FormControls
 * </InputFormListCol>
 * @param {number} columnSize 入力欄の大きさ
 * @param {string} validationState 検証結果
 */
export default class InputFormListCol extends Component {
    
    /**
     * render
     */
    render() {
        const {  validationState } = this.props;
        const columnSize = this.props.columnSize ? this.props.columnSize : 1;

        return (
            <Col sm={columnSize} className='pa-05 input-form-list-col'>
                {this.props.children}
            </Col>
        );
    }
}

InputFormListCol.PropTypes = {
    columnSize : PropTypes.number,
    validationState: PropTypes.string,
}