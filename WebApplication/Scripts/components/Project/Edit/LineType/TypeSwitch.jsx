/**
 * @license Copyright 2022 DENSO
 * 
 * TypeSwitch Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import ToggleSwitch from 'Common/Widget/ToggleSwitch';
import { convertNumber } from 'numberUtility';

/**
 * 種別スイッチコンポーネント
 * @param {string} name スイッチ名称（一意）
 * @param {number} type 選択中の種別
 * @param {array} options 選択肢
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {function} onChange スイッチ値変更時に呼び出す
 */
export default class TypeSwitch extends Component {

    /**
     * render
     */
    render() {
        const {name, type, options, isReadOnly } = this.props;
        return (
            <ToggleSwitch
                value={type}
                name={name}
                swichValues={options}
                disbled={isReadOnly}
                bsSize="sm"
                onChange={(value) => this.handleChange(value)}
            />
        );
    }

    /**
     * スイッチ変更イベント
     * @param {*} value 変更値
     */
    handleChange(value) {
        if (this.props.onChange) {
            this.props.onChange(convertNumber(value));
        }
    }
}

