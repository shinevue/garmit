/**
 * @license Copyright 2018 DENSO
 * 
 * garmit専用のButton Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import { Button as ReactBootstrapButton } from 'react-bootstrap';

/**
 * ボタンのコンポーネント
 * アイコン付きボタンのクラス名は 【形状プレフィクス】-【製品プレフィクス】-【アイコンID】 で定義される。
 * アイコン付きボタンにする場合、上記の【アイコンID】のみ指定する。
 * react-bootstrapのButtonで指定できるpropsの指定は行うことができる。
 * @param {string} iconId アイコンID
 * @param {boolean} isCircle 円形のアイコンかどうか
 * @param {oneOf} bsSize ボタンのサイズ（'lg', 'sm', 'xs'のいずれか）
 */
export default class Button extends Component {
    /**
     * render
     */
    render() {
        const { iconId, isCircle, bsStyle, className } = this.props;
        const classes = {
            'btn-circle': isCircle,
        }
        if (iconId) {
            classes['btn-garmit-' + iconId] = true;
        }
        return (
            <ReactBootstrapButton {...this.props} bsStyle={bsStyle} className={ClassNames(className, classes)} >{this.props.children}</ReactBootstrapButton>
        );
    }
}

Button.propTypes = {
    iconId: PropTypes.string.isRequired,
    isCircle: PropTypes.bool,
    bsSize: PropTypes.oneOf(['lg', 'sm', 'xs'])
}