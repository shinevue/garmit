/**
 * @license Copyright 2017 DENSO
 * 
 * InputFormRow Reactコンポーネント
 * <InputFormRow/>
 * 
 */
'use strict';

import React, { Component } from 'react';
import { Row } from 'react-bootstrap';
import classNames from 'classnames';

/**
 * 入力フォームの行
 * <InputFormRow/>
 */
export default class InputFormRow extends Component {

    /**
     * render
     */
    render() {
        const { className } = this.props;
        return (
            <Row className={classNames(className, 'input-row')}>
                {this.props.children}
            </Row>
        );
    }

}