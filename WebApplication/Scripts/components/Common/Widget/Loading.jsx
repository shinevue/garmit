/**
 * @license Copyright 2017 DENSO
 * 
 * Loading Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Icon from 'Common/Widget/Icon';

/**
 * ロード中コンポーネント
 * @param {boolean} isLoading ロード中かどうか
 */
export default class Loading extends Component {
    /**
     * render
     */
    render() {
        const { className, isLoading } = this.props;
        return (
            isLoading ?
                <div className={classNames("loading", className)} >
                    <Icon className="fa fa-sync-alt fa-spin" />
                </div>
            :
             ""
        );
    }
}

Loading.propTypes = {
    className: PropTypes.string,
    isLoading: PropTypes.bool,
}