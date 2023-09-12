/**
 * @license Copyright 2018 DENSO
 * 
 * BoxGroup Reactコンポーネント
 * 
 * <BoxGroup>
 *      <Box>
 *          ・・・
 *      </Box>
 * </BoxGroup>
 * 
 */
'use strict';

import React, { Component } from 'react';
import classNames from 'classnames';

/**
 * ボックスグループコンポーネント
 */
export default class BoxGroup extends Component {
    /**
     * render
     */
    render() {
        const { className, children } = this.props;
        return (
            <div className={classNames(className, "box-group")}>
                {children}
            </div>
        );
    }
}