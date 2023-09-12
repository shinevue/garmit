/**
 * @license Copyright 2017 DENSO
 * 
 * 矢印 Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import classNames from 'classnames';

/**
 * 矢印のコンポーネント
 */
export default class AssetArrow extends Component {
    
    /**
     * render
     */
    render() {
        const { className, direction } = this.props;
        return (
            <span className={classNames(className, 'asset-arrow asset-arrow-' + direction)} />
        );
    }

}