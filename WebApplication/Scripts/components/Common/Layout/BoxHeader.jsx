/**
 * Copyright 2017 DENSO Solutions
 * 
 * BoxHeader Reactコンポーネント
 *   
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * BoxHeader
 * <BoxHeader clssName={} title={} boxTools={} ></BoxHeader>
 * @param className クラス
 */
export default class BoxHeader extends Component {

    /**
     * render
     */
    render() {
        const { className } = this.props;

        const classes = {
            'box-header': true,
            'with-border': true
        };

        return (
            <div className={classNames(className, classes)} >
                {this.props.children}
            </div>
        );
    }
}

BoxHeader.propTypes = {
    className: PropTypes.string
};
