/**
 * Copyright 2017 DENSO Solutions
 * 
 * コンテンツヘッダReactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';

/**
 * コンテンツヘッダ
 * <ContentHeader></ContentHeader>
 */
export default class ContentHeader extends Component {

    /**
     * render
     */
    render() {
        return (
            <section class="content-header">
                {this.props.children}
            </section>
        );
    }
}