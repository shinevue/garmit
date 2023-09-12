/**
 * @license Copyright 2017 DENSO
 * 
 * 通知メニュー Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { ListGroupItem } from 'react-bootstrap';

import HeaderMenuContent from 'Common/Widget/HeaderMenuContent';
import HeaderNavMenu from './HeaderNavMenu';
import Icon from 'Common/Widget/Icon';

/**
 * 通知メニューコンポーネント
 */
export default class NotificationsMenu extends Component {
    
    /**
     * アラートの個数を合計する（未実装）
     */
    sumAlartCount(){
        const { alarts } = this.props;
        const type = alarts&&alarts.type;
        
        switch (type) {
            case 'warning':
                return 5;
            case 'danger':
                return 10;
            default:
                return 0;
        }
    }
    
    /**
     * render
     */
    render() {
        const { alarts } = this.props;
        const type = this.props.alarts&&this.props.alarts.type;

        return (
            <HeaderNavMenu bsStyle='notifications' iconClass='fa fa-bolt' labelStyle={'danger'} noticeCount={10}>
                {/* とりあえず固定で表示 */}
                {
                    <HeaderMenuContent>
                        <NotificationItem key='alarm' type='warning'>注意アラームが3個あります</NotificationItem>
                        <NotificationItem key='error' type='danger'>異常アラームが2個あります</NotificationItem>
                        <NotificationItem key='system' type='danger'>システムエラーが1個あります</NotificationItem>
                        <NotificationItem key='group' type='warning'>グループエラーが2個あります</NotificationItem>
                    </HeaderMenuContent>   
                }
            </HeaderNavMenu>
        );
    }
}


/**
 * 通知メッセージアイテム
 * <NotificationItem type="warning">{message}<NotificationItem>
 * @param type 通知のアラーム種別（warning / danger）
 */
class NotificationItem extends Component {

    render() {
        return (
            <ListGroupItem>
                <Icon className={this.getIconStyle(this.props.type)} /> {this.props.children}
            </ListGroupItem>
        );
    }
    
    getIconStyle(typeName) {
        switch( typeName ) {
            case 'warning':
                return 'fa fa-exclamation-triangle text-yellow';
            case 'danger':
                return 'fa fa-exclamation-circle text-red';
        }
    }
}