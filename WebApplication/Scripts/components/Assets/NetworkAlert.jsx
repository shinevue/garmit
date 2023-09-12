/**
 * @license Copyright 2017 DENSO
 * 
 * NetworkAlert Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import { Alert } from 'react-bootstrap';

/**
 * 通信エラーのアラートメッセージパネル
 */
export default class NetworkAlert extends Component {
    
    /**
     * render
     */
    render() {
        const { show } = this.props;
        return (
            show &&
            <Alert bsStyle="danger">
                <span class="icon-garmit-error"></span>
                通信エラーが発生しています
            </Alert> 
        );
    }
}