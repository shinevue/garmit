/**
 * Copyright 2017 DENSO Solutions
 * 
 * Ulコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';

/**
 * Ulコンポーネント
 * @param className class
 * @param dataWidget data-widget
 */
export default class UnorderedList extends Component {
    
        render() {
            const { className, children, dataWidget } = this.props;
            return (
                <ul className={className} data-widget={dataWidget}>
                    {children}
                </ul>
            );
        }
    }
    