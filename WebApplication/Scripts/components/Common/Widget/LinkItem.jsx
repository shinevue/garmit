/**
 * @license Copyright 2017 DENSO
 * 
 * LinkItem Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';

/**
 * リンクコンポーネントを定義します。
 * @param url URL
 * @param target target
 * @param className className
 */
export default class LinkItem extends Component {

    /**
     * render
     */
    render() {
        const { className, url, target, children } = this.props;
        return (
            <a className={className} href={url} target={target}>{children}</a>
        );
    }
}