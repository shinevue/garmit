/**
 * @license Copyright 2017 DENSO
 * 
 * PasswordForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';

/**
 * パスワード入力コンポーネント
 * @param {string}　label フォームのタイトル
 * @param {string}　value 入力値
 * @param {string}　placeholder プレースフォルダに表示する文字列
 * @param {function}　onChange テキスト変更イベント
 * @param {boolean}　isReadOnly 読み取り専用かどうか
 * @param {string}　helpText 入力欄の説明。例：入力エラー時にエラー内容を表示する。
 * @param {oneOf}　validationState 検証結果（success, warning, error, null）
 * @param {function}　onKeyDown KeyDownイベント
 * @param {string} className className
 */
export default class PasswordForm extends Component {
    /**
     * render
     */
    render() {
        const { label, value, isReadOnly, helpText, validationState, placeholder, maxlength, className } = this.props;
        
        return (
            <FormGroup validationState={validationState} className={className}>
                {label && <ControlLabel>{label}</ControlLabel>}
                <FormControl type="password" disabled={isReadOnly} value={value} placeholder={placeholder} maxlength={maxlength} onChange={(e) => this.handleOnChange(e)} onKeyDown={() => this.handleOnKeyDown()} />                
                {helpText&&<HelpBlock>{helpText}</HelpBlock>}
            </FormGroup>
        );
    }

    /**
     * テキスト変更イベント
     * @param {*} event 
     */
    handleOnChange(event){
        if (this.props.onChange) {
            this.props.onChange(event.target.value);
        }
    }

    /**
     * テキストボックスでのKeyDownイベント
     */
    handleOnKeyDown(){
        if ( this.props.onKeyDown ){
            this.props.onKeyDown();
        }
    }

}

PasswordForm.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    isReadOnly: PropTypes.bool,
    helpText: PropTypes.string,
    validationState: PropTypes.oneOf(['success', 'warning', 'error', null]),
    onKeyDown: PropTypes.func,
    className: PropTypes.string
}

