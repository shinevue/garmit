/**
 * @license Copyright 2018 DENSO
 * 
 * CheckboxSwitch Reactコンポーネント
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { ToggleButtonGroup, ToggleButton } from 'react-bootstrap';

/**
 * スイッチトグルボタングループのコンポーネント
 * @param {string} text ボタングループ名称
 * @param {boolean} checked チェック状態
 * @param {boolean} disabled 操作不可とするか
 * @param {oneOf} bsSize ボタンのサイズ（'lg', 'sm', 'xs'のいずれか）
 */
export default class CheckboxSwitch extends Component {

    /**
     * render
     */
    render() {
        const { text, disabled, bsSize, checked } = this.props;
        const sizeClass = bsSize ? 'btn-group-switch-' + bsSize : '';
        return (
            <ToggleButtonGroup className={classNames('btn-group-switch', sizeClass)} 
                               type="checkbox" 
                               value={checked?1:null}
            >
                <ToggleButton
                    value={1}
                    onClick={(e) => this.handleClick(e)}
                    disabled={disabled}
                    className={classNames({ "through-object": disabled })}
                >
                    {text}
                </ToggleButton>
            </ToggleButtonGroup>
        );
    }
    
    /**
     * ボタンクリックイベント
     */
    handleClick(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.props.onChange) {
            this.props.onChange(!this.props.checked);
        }
    }
}

CheckboxSwitch.propTypes = {
    text: PropTypes.string.isRequired,
    checked: PropTypes.bool,
    bsSize: PropTypes.oneOf(['lg', 'sm', 'xs']),
    disabled:PropTypes.bool,
    onChange: PropTypes.func
}