/**
 * @license Copyright 2017 DENSO
 * 
 * マニュアルなどのリンクメニューReactコンポーネント
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
 * マニュアルなどのリンクメニューコンポーネント
 */
export default class BookLinkMenu extends Component {
    
    /**
     * render
     */
    render() {
        return (
            <HeaderNavMenu bsStyle='notifications' iconClass='fa fa-book'>
                {
                    <HeaderMenuContent>
                        <BookLinkItem url='/Files/Manual.pdf' >マニュアル</BookLinkItem>
                    </HeaderMenuContent>   
                }
            </HeaderNavMenu>
        );
    }

}


/**
 * リンクアイテム
 * @param {string} url リンク先のURL
 * @param {string} iconClass アイコンクラス
 */
class BookLinkItem extends Component {
    
    render() {
        const { url, iconClass, children } = this.props
        return (                
            <ListGroupItem onClick={(e) => this.openLink(e, this.url)} >
                {iconClass&&<Icon className={iconClass} />}
                {children}
            </ListGroupItem>
        );
    }
    
    /**
     * リンクを開く
     * @param {*} e 
     * @param {*} url 
     */
    openLink(e, url){
        e.preventDefault();
        window.open( url, "_blank");
    }
}

