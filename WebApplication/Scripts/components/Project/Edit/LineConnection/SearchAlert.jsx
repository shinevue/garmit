/**
 * @license Copyright 2022 DENSO
 * 
 * SearchAlert Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import { Alert } from 'react-bootstrap';

/**
 * 回線未検索エラーパネル
 * @param {boolean} show 表示するかどうか
 */
export default class SearchAlert extends Component {
    
    /**
     * render
     */
    render() {
        const { show } = this.props;
        return (
            show ?
                <Alert className="patchcable-search-error-alert" bsStyle="danger">
                    ！！！検索してください！！！
                </Alert>
            :
                null
        );
    }
}