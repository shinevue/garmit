/**
 * @license Copyright 2017 DENSO
 * 
 * InputTableHeaderRow Reactコンポーネント
 * <InputTableHeaderRow/>
 * 
 */
'use strict';

import React, { Component } from 'react';
import { Row } from 'react-bootstrap';

/**
 * 入力フォームの行
 * <InputTableHeaderRow/>
 */
export default class InputTableHeaderRow extends Component {

    /**
     * render
     */
    render() {
        return (
            <tr>
                {this.props.children}
            </tr>
        );
    }
}