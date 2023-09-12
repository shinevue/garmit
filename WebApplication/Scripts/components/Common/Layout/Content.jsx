/**
 * Copyright 2017 DENSO Solutions
 * 
 * コンテンツReactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';

import ContentHeader from './ContentHeader';
import ContentBody from './ContentBody';

/**
 * コンテンツ
 * <Content></Content>
 */
export default class Content extends Component {

    /**
     * render
     */
    render() {
        return (
            <div class="content-wrapper">
                <div class="content">
                    <div class="container-fluid">
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}

Content.Header = ContentHeader;
Content.Body = ContentBody;