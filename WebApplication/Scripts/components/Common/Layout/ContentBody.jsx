/**
 * Copyright 2017 DENSO Solutions
 * 
 * メインコンテンツ Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';

/**
 * メインコンテンツ
 * <ContentBody></ContentBody>
 */
export default class ContentBody extends Component {

    /**
     * render
     */
    render() {
        return (
            <section class="content">
                {this.props.children}
            </section>
        );
    }
}