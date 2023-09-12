/**
 * @license Copyright 2017 DENSO
 * 
 * Notifications Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * エラー通知個数コンポーネント
 * @param {boolean} isHeader ヘッダの通知コンポーネントかどうか
 * @param {object} systemErrorCountItem システムエラー発生数
 * @param {object} errorCountItem 異常発生数
 * @param {object} warnCountItem 注意発生数
 */
export default class Notifications extends Component {
    
    /**
     * render
     */
    render() {
        const { isHeader, systemErrorCountItem, errorCountItem, warnCountItem } = this.props;
        const classPrefix = isHeader ? 'main-header' : 'alarm-sidebar';
        return (
            <div className={classPrefix + '__alarm-text on'}>
                <div className={classPrefix + '__alarm--on'}>
                    <NotificationsItem count={errorCountItem?errorCountItem.alarmCount:0} alarmType='error' />
                    <NotificationsItem count={warnCountItem?warnCountItem.alarmCount:0} alarmType='warn' />
                    <NotificationsItem count={systemErrorCountItem?systemErrorCountItem.alarmCount:0} alarmType='syserr' />
                </div>
            </div>
        );
    }
}

/**
 * 通知アイテム
 * @param {number} count 通知数
 * @param {string} alarmType アラーム種別
 */
class NotificationsItem extends Component {
    render() {
        const { count, alarmType } = this.props;
        return (
            <span className={"icon-garmit-"+ alarmType} >
                {count}
            </span>
        );
    }
}

Notifications.propTypes = {
    isHeader: PropTypes.bool,
    systemErrorCountItem: PropTypes.shape({
        categoryType: PropTypes.shape({
            categoryNo: PropTypes.number,
            name: PropTypes.string,
            iconClass: PropTypes.string,
            color: PropTypes.string
        }),
        alarmCount: PropTypes.number
    }),
    errorCountItem: PropTypes.shape({
        categoryType: PropTypes.shape({
            categoryNo: PropTypes.number,
            name: PropTypes.string,
            iconClass: PropTypes.string,
            color: PropTypes.string
        }),
        alarmCount: PropTypes.number
    }),
    warnCountItem: PropTypes.shape({
        categoryType: PropTypes.shape({
            categoryNo: PropTypes.number,
            name: PropTypes.string,
            iconClass: PropTypes.string,
            color: PropTypes.string
        }),
        alarmCount: PropTypes.number
    })
}