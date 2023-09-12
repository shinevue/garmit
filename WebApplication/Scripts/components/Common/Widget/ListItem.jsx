/**
 * @license Copyright 2017 DENSO
 * 
 * ListItemコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * ListItemコンポーネント
 * @param className className
 */
export default class ListItem extends Component {
    
    render() {
        const { className, children } = this.props;

        return (
            <li className={className} >
                {children}
            </li>
        );
    }
}

ListItem.propTypes = {
    className: PropTypes.string
};
    