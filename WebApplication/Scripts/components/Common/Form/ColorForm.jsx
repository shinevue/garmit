/**
 * @license Copyright 2017 DENSO
 * 
 * 色選択フォームReactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap';
import ColorPicker from 'Common/Widget/ColorPicker';

/**
 * カラーフォーム
 * @param {string} label タイトル
 * @param {string} color 色（HEX値）
 * @param {oneOf}　validationState 検証結果（success, warning, error, null）
 * @param {string}　helpText 入力欄の説明。例：入力エラー時にエラー内容を表示する。
 * @param {function} onChange 色が変更された時に呼び出されます
 * @param {boolean} isReadOnly 読取専用かどうか
 */
export default class ColorForm extends Component {
    
    /**
     * render
     */
    render() {     
        const { label, color, isReadOnly, validationState, helpText } = this.props;
        return (
            <FormGroup validationState={validationState} >
                {label&&<ControlLabel>{label}</ControlLabel>}
                <ColorPicker color={color} isReadOnly={isReadOnly} onChange={(v) => this.handleOnChange(v)} />
                {helpText&&<HelpBlock>{helpText}</HelpBlock>}
            </FormGroup>
        );
    }

    /**
     * 色変更イベント
     * @param {string} value 変更後の色（HEX値）
     */
    handleOnChange(value){
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }
}

ColorForm.propTypes = {
    label: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,                 //hexの色を指定
    validationState: PropTypes.oneOf(['success', 'warning', 'error', null]),
    helpText: PropTypes.string,
    onChange: PropTypes.func,
    isReadOnly: PropTypes.bool
}
