/**
 * @license Copyright 2017 DENSO
 * 
 * ヘッダの右側に寄せるメニュー Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Label } from 'react-bootstrap';

import Icon from 'Common/Widget/Icon';

/**
 * ヘッダの右側に寄せるメニューコンポーネント
 * @param {string} className class
 * @param {type} bsStyle ベースのスタイル（messages, notifications, tasks, user）
 * @param {string} iconClass アイコンクラス
 * @param {type} labelStyle ラベルのスタイル（success, warning, danger, info, default, primary）
 * @param {number} noticeCount 通知数
 */
export default class HeaderNavMenu extends Component {

    /**
     * render
     */
    render() {
        const { className, bsStyle, iconClass, labelStyle, noticeCount, children } = this.props;
        const classes = {
            dropdown: true,
            user: (bsStyle === 'user')
        };
        var baseStyle = bsStyle ? (bsStyle + '-menu') : '';

        return (
            <li className={classNames(className, classes, baseStyle)}>
                <a href='#' className='dropdown-toggle' data-toggle='dropdown'>
                    <Icon className={iconClass}></Icon>
                    <Label bsStyle={labelStyle}>{noticeCount}</Label>
                </a>
                {children&&
                    <ul className='dropdown-menu'>
                        <li>
                            {children}
                        </li>
                    </ul>
                }
            </li>
        );
    }
}

HeaderNavMenu.propTypes = {
    className: PropTypes.string,
    bsStyle: PropTypes.oneOfType(['messages', 'notifications', 'tasks', 'user']),
    iconClass: PropTypes.string,
    labelStyle: PropTypes.oneOfType(['success', 'warning', 'danger', 'info', 'default', 'primary']),
    noticeCount: PropTypes.number
}