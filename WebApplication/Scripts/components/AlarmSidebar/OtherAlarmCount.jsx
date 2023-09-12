/**
 * @license Copyright 2018 DENSO
 * 
 * OtherAlarmCount Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * 表示アラーム以外のアラームの個数を表示するコンポーネントを定義します。
 * @param {number} count アラームの個数
 * @param {number} dispCount トースト表示しているアラームの個数
 */
export default class OtherAlarmCount extends Component {

    /**
     * render
     */
    render() {
        const { count, dispCount } = this.props;
        return (
            count ?
                <span class="alarm-sidebar__log-text">他<span className="value">{count - dispCount}</span>件のアラームがあります。</span>    
            :
                <span class="alarm-sidebar__log-text">アラームはありません。</span>
        );
    }
}

OtherAlarmCount.propTypes = {
    count: PropTypes.number.isRequired,
    dispCount: PropTypes.number.isRequired
}