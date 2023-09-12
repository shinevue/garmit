/**
 * @license Copyright 2017 DENSO
 * 
 * Text2DForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';


/**
 * 2次元（行×列）のテキスト入力コンポーネント
 * @param {string}　label フォームのタイトル
 * @param {*}　value 入力値（row, col）
 * @param {string}　placeholder プレースフォルダに表示する文字列（row, col）
 * @param {function}　onChange テキスト変更イベント
 * @param {boolean}　isReadOnly 読み取り専用かどうか
 * @param {string}　helpText 入力欄の説明。例：入力エラー時にエラー内容を表示する。
 * @param {oneOf}　validationState 検証結果（success, warning, error, null）
 * @param {string} unit 単位文字列
 * @param {string} className className
 */
export default class Text2DForm extends Component {
    
    /**
     * render
     */
    render() {
        const { label, value, unit, validationState, helpText, placeholder, isReadOnly, className, rowUnit, colUnit } = this.props;
        return (
            <FormGroup validationState={validationState} className={className}>
                 {label&&<ControlLabel>{label}</ControlLabel>}
                <div className="garmit-input-group">
                    <div className="garmit-input-item">
                        <FormControl type="text" value={value&&value.row} placeholder={placeholder&&placeholder.row} disabled={isReadOnly} onChange={(e) => this.handleRowChange(e)} />
                    </div>
                    <div className="garmit-input-item garmit-input-addon">
                        <span>{rowUnit?rowUnit:'行'}</span>
                    </div>
                    <div className="garmit-input-item ta-c">
                        <span>×</span>
                    </div>
                    <div className="garmit-input-item">
                        <FormControl type="text" value={value&&value.col} placeholder={placeholder&&placeholder.col} disabled={isReadOnly} onChange={(e) => this.handleColChange(e)} />
                    </div>
                    <div className="garmit-input-item garmit-input-addon">
                        <span>{colUnit?colUnit:'列'}</span>
                    </div>
                    {unit&&
                        <div className="garmit-input-item garmit-input-addon">
                            <span>{unit}</span>
                        </div>
                    }
                </div>
                {helpText&&<HelpBlock>{helpText}</HelpBlock>}
            </FormGroup>
        );
    }
    
    /**
     * 行のテキスト変更イベント
     * @param {*} event 
     */
    handleRowChange(event){
        if (this.props.onChange) {
            const { value } = this.props;
            var col = this.hasValue(value, 'col') ? value.col : '';
            this.props.onChange({row:event.target.value, col:col});
        }
    }

    /**
     * 列のテキスト変更イベント
     * @param {*} event 
     */
    handleColChange(event){
        if (this.props.onChange) {
            const { value } = this.props;
            var row = this.hasValue(value, 'row') ? value.row : '';
            this.props.onChange({row:row, col:event.target.value});
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

Text2DForm.propTypes = {
    label: PropTypes.string,
    value: PropTypes.shape({
        row: PropTypes.string,
        col: PropTypes.string
    }),
    placeholder: PropTypes.shape({
        row: PropTypes.string,
        col: PropTypes.string
    }),
    onChange: PropTypes.func,
    isReadOnly: PropTypes.bool,
    helpText: PropTypes.string,
    validationState: PropTypes.oneOf(['success', 'warning', 'error', null]),
    unit: PropTypes.string,
    className: PropTypes.string,
    rowUnit: PropTypes.string,
    colUnit: PropTypes.string
};