/**
 * Copyright 2017 DENSO Solutions
 * 
 * BoxBody Reactコンポーネント
 * 
 * <BoxBody>
 *      ...content
 * </BoxBody>
 *  
 */
'use strict';

import React, { Component } from 'react';

/**
 * BoxBody
 * <BoxBody clssName=></Box>
 * @param className クラス
 */
export default class BoxBody extends Component {

    /**
     * render
     */
    render() {
        const { maxHeight } = this.props;
        var className = "box-body ";
        className += this.props.className?this.props.className:"";

        return (
            <div className={className} style={maxHeight&&{ 'max-height': maxHeight + 'px', 'overflow-y': 'scroll' }}>
                {this.props.children}
            </div>
        );
    }

}