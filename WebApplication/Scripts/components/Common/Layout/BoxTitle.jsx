/**
 * Copyright 2017 DENSO Solutions
 * 
 * BoxTitle Reactコンポーネント
 * 
 * <BoxTitle className={}>
 *      ・・・title
 * </BoxHeader>
 *   
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * ボックスのタイトル
 * <BoxTitle className={}></BoxHeader>
 * @param className クラス
 */
export default class BoxTitle extends Component {

    /**
     * render
     */
    render() {
        const classes = {
            'box-title': true
        };

        return (
            <h3 className={classNames(this.props.className, classes)} className='box-title'>
                {this.props.children}
            </h3>
        );
    }
}

BoxTitle.propTypes = {
    className: PropTypes.string
};
