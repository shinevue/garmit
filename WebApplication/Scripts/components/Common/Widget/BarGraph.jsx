/**
 * @license Copyright 2017 DENSO
 * 
 * BarGraph Reactコンポーネント
 * <BarGraph title="搭載率" value={70} unit={'%'} description="40U/42U" effectiveDigit={0} max={100} min={0} threshold={threshold} />
 * <BarGraph value={0.7} unit={'A'} effectiveDigit={1} max={1} min={0} threshold={threshold_2} />  ← タイトルなどなしバージョン
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { ProgressBar, FormGroup } from 'react-bootstrap';

/**
 * バーグラフを表示する。
 * 閾値超過した場合、色を変更する
 * <BarGraph title="搭載率" value={70} description="40U/42U" />
 * @param title {string} タイトル
 * @param value {number} 値
 * @param description {string} 補足
 * @param alarmClassName {string} アラーム状態を付与するクラス名
 * @param max {number} バーの最大値（指定がない場合は100）
 * @param min {number} バーの最小値（指定がない場合は0）
 */
export default class BarGraph extends Component {
    
    /**
     * render
     */
    render() {
        const { title, value, description, alarmClassName, max} = this.props;
        const now = max >= value ? value : max;
        return (
            <FormGroup>
                {title&&<label>{title}</label>}
                {description&&<span className="pull-right">{description}</span>}
                <ProgressBar bsStyle={alarmClassName} now={now} {...this.props} />
            </FormGroup>
        );
    }  
}

BarGraph.propTypes = {
    title: PropTypes.string,
    value: PropTypes.number.isRequired,
    label: PropTypes.string,
    description: PropTypes.string,
    alarmClassName: PropTypes.oneOf(['success', 'warning', 'danger']),
    max: PropTypes.number,
    min: PropTypes.number,
}