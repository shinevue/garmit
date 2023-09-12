/**
 * @license Copyright 2017 DENSO
 * 
 * ヘッダ右側メニューのコンテンツReactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import UnorderedList from 'Common/Widget/UnorderedList';

/**
 * ヘッダ右側メニューのコンテンツコンポーネント
 */
export default class HeaderMenuContent extends Component {

    /**
     * render
     */
    render() {
        return (
            <UnorderedList className='menu'>
                {this.props.children}
            </UnorderedList>
        );
    }
}