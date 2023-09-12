/**
 * @license Copyright 2017 DENSO
 * 
 * Size2DForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';
import TextForm from 'Common/Form/TextForm';

/**
 * 2次元（x,y）のテキスト入力コンポーネント
 * @param {string}　label フォームのタイトル
 * @param {*}　value 入力値（width, height）
 * @param {string}　placeholder プレースフォルダに表示する文字列（width, height）
 * @param {function}　onChange テキスト変更イベント
 * @param {boolean}　isReadOnly 読み取り専用かどうか
 * @param {string}　helpText 入力欄の説明。例：入力エラー時にエラー内容を表示する。
 * @param {oneOf}　validationState 検証結果（success, warning, error, null）
 * @param {string} unit 単位文字列
 * @param {string} className className
 */
export default class Size2DForm extends Component {
    
    /**
     * render
     */
    render() {
        const { id, label, value, unit, validationState, helpText, placeholder, isReadOnly, className } = this.props;
        return (
            <FormGroup validationState={validationState} className={className}>
                 {label&&<ControlLabel>{label}</ControlLabel>}
                <div className="garmit-input-group">
                    <div className="garmit-input-item garmit-input-addon pa-l-1">
                        <span>縦：</span>
                    </div>
                    <div className="garmit-input-item" id={id+'Height'}>
                        <TextForm validationState={validationState} value={value && value.height} placeholder={placeholder && placeholder.height} isReadOnly={isReadOnly} onChange={(changed) => this.handleHeightChange(changed)} />
                    </div>
                    <div className="garmit-input-item ta-c">
                        <span>×</span>
                    </div>
                    <div className="garmit-input-item garmit-input-addon pa-l-1">
                        <span>横：</span>
                    </div>
                    <div className="garmit-input-item" id={id + 'Width'}>
                        <TextForm validationState={validationState} value={value && value.width} placeholder={placeholder && placeholder.width} isReadOnly={isReadOnly} onChange={(changed) => this.handleWidthChange(changed)} />
                    </div>                    
                </div>
                {helpText&&<HelpBlock>{helpText}</HelpBlock>}
            </FormGroup>
        );
    }

    /**
     * 縦のテキスト変更イベント
     * @param {*} changedHeight
     */
    handleHeightChange(changedHeight) {
        if (this.props.onChange) {
            const { value } = this.props;
            this.props.onChange({ width: value.width, height: changedHeight });
        }
    }

    /**
     * 横のテキスト変更イベント
     * @param {*} changedWidth
     */
    handleWidthChange(changedWidth){
        if (this.props.onChange) {
            const { value } = this.props;
            this.props.onChange({ width:changedWidth, height: value.height});
        }
    }

    /**
     * 値があるかどうか
     * @param {string|number} value 対象の値
     * @param {string} key キー
     * @returns {boolean} 値があるかどうか
     */
    hasValue(value, key){
        if (value && value[key] !== undefined && value[key] !== null) {
            return true;
        }
        return false;
    }

}

Size2DForm.propTypes = {
    label: PropTypes.string,
    value: PropTypes.shape({
        width: PropTypes.string,
        height: PropTypes.string
    }),
    placeholder: PropTypes.shape({
        width: PropTypes.string,
        height: PropTypes.string
    }),
    onChange: PropTypes.func,
    isReadOnly: PropTypes.bool,
    helpText: PropTypes.string,
    validationState: PropTypes.oneOf(['success', 'warning', 'error', null]),
    unit: PropTypes.string,
    className: PropTypes.string
};