/**
 * @license Copyright 2017 DENSO
 * 
 * aタグのようなリンクボタン Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Button } from 'react-bootstrap';
import Icon from 'Common/Widget/Icon';

/**
 * aタグのようなリンクボタンコンポーネントを定義します。
 * <LinkButton iconClass={} onClick={} >XXX(ボタンのラベル)</LinkButton>
 * @param {string} iconClass アイコンクラス
 * @param {function} onClick クリック時に呼び出す
 * @param {string} className クラス
 * @param {boolean} disabled 編集不可
 * @param {object} style スタイル
 */
export default class LinkButton extends Component {
    
    /**
     * render
     */
    render() {
        const { className, children, iconClass, disabled, style } = this.props;
        return (
            <Button bsStyle='link' 
                    className={classNames('pa-0', className)}
                    style={style}
                    onClick={() => this.handleClick()}
                    disabled={disabled}
            >
                <Icon className={classNames('mr-05', iconClass)} />{children}
            </Button>
        );
    }

    /**
     * クリックイベント
     */
    handleClick() {
        if (this.props.onClick) {
            this.props.onClick();
        }
    }
}