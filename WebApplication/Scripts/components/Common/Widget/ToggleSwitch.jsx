/**
 * @license Copyright 2018 DENSO
 * 
 * ToggleSwitch Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { ToggleButtonGroup, ToggleButton } from 'react-bootstrap';

/**
 * スイッチトグルボタングループのコンポーネント
 * @param {string|number} value チェックする値
 * @param {string} name ボタングループ名称
 * @param {oneOf} bsSize ボタンのサイズ（'lg', 'sm', 'xs'のいずれか）
 * @param {array} swichValues スイッチの値リスト
 * @param {function} onChange スイッチを変更したときのイベント
 */
export default class ToggleSwitch extends Component {
    /**
     * render
     */
    render() {
        const { name, value, bsSize, swichValues, defaultValue, disbled, className } = this.props;
        const sizeClass = bsSize ? 'btn-group-switch-' + bsSize : '';
        return (
            <ToggleButtonGroup className={classNames('btn-group-switch', sizeClass, className)} 
                               type="radio" 
                               name={name} 
                               value={value}
                               defaultValue={defaultValue} >
                {swichValues&&swichValues.length>0&&
                    swichValues.map((item) => 
                    <ToggleButton value={item.value} bsStyle={null} disabled={disbled} className={classNames({ "through-object": disbled })} onClick={() => this.handleClick(item.value)}>{item.text}</ToggleButton>
                    )
                }
            </ToggleButtonGroup>
        );
    }

    /**
     * ボタンクリックイベント
     * @param {string} value チェックを入れた値
     */
    handleClick(value) {
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }
}

ToggleSwitch.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number ]).isRequired,
    name: PropTypes.string.isRequired,
    bsSize: PropTypes.oneOf(['lg', 'sm', 'xs']),
    swichValues: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number ]).isRequired,
        text: PropTypes.string.isRequired
    })),
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    disabled:PropTypes.bool,
    onChange: PropTypes.func
}