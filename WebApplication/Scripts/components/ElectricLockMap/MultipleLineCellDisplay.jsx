/**
 * @license Copyright 2019 DENSO
 * 
 * 複数行セルコンポーネント Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';

/**
 * 複数行セルコンポーネント
 */
export default class MultipleLineCellDisplay extends Component {
    
    /**
     * render
     */
    render() {
        const { values } = this.props;
        if (!values||values.length <= 0) {
            return (<div></div>);
        } else if (values.length <= 1) {
            return (<div>{values[0]}</div>);
        } else {
            return (
                <div>
                    {values&&values.map((value) => 
                        <div>{value}</div>
                    )}
                </div>
            );
        }
    }

}