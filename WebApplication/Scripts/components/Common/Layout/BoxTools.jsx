/**
 * Copyright 2017 DENSO Solutions
 * 
 * BoxTools Reactコンポーネント
 * 
 * <BoxTools className={}>
 *      ・・・content
 * </BoxTools>
 *   
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * ボックスの右側のツール
 * <BoxTools className={}></BoxHeader>
 * @param className クラス
 */
export default class BoxTools extends Component {

    /**
     * render
     */
    render() {
        const classes = {
            'box-tools': true,
            'pull-right': true
        };

        return (
            <span className={classNames(this.props.className, classes)} >
                {this.props.children}
            </span>
        );
    }
}

BoxTools.propTypes = {
    className: PropTypes.string
};
