/**
 * @license Copyright 2017 DENSO
 * 
 * 積み上げ式のバーグラフ Reactコンポーネント
 * 
 * <StackedBarGraph >
 *  <StackedBarGraph.Item />
 *  <StackedBarGraph.Item />
 *  ・・・
 * </ StackedBarGraph>
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import StackedBarGraphItem from './StackedBarGraphItem';
import { ProgressBar, FormGroup } from 'react-bootstrap';

/**
 * 積み上げ式のバーグラフを表示する
 * @param title {string} タイトル
 * @param description {string} 補足
 */
export default class StackedBarGraph extends Component {
    
    /**
     * render
     */
    render() {
        const { title, description, children, } = this.props;

        return (
            <FormGroup>
                {title&&<label>{title}</label>}
                {description&&<span className="pull-right">{description}</span>}
                <ProgressBar >
                    {children}
                </ProgressBar>
            </FormGroup>
        );
    }
    
}

StackedBarGraph.Item = StackedBarGraphItem;