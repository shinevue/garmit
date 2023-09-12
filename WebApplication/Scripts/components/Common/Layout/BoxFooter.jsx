/**
 * Copyright 2017 DENSO Solutions
 * 
 * BoxBody Reactコンポーネント
 * 
 * <BoxFooter>
 *      ...footer content
 * </BoxFooter>
 *  
 */
'use strict';

import React, { Component } from 'react';

/**
 * BoxFooter
 * <BoxFooter clssName=></BoxFooter>
 * @param className クラス
 */
export default class BoxFooter extends Component {

    /**
     * render
     */
    render() {
        var className = "box-footer ";
        className += this.props.className?this.props.className:"";
        return (
            <div className={className}>
                {this.props.children}
            </div>
        );
    }

}