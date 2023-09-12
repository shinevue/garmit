/**
 * @license Copyright 2017 DENSO
 * 
 * Position2DForm Reactコンポーネント
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
 * @param {*}　value 入力値（x, y）
 * @param {string}　placeholder プレースフォルダに表示する文字列（x, y）
 * @param {function}　onChange テキスト変更イベント
 * @param {boolean}　isReadOnly 読み取り専用かどうか
 * @param {string}　helpText 入力欄の説明。例：入力エラー時にエラー内容を表示する。
 * @param {oneOf}　validationState 検証結果（success, warning, error, null）
 * @param {string} unit 単位文字列
 * @param {string} className className
 */
export default class Position2DForm extends Component {
    
    /**
     * render
     */
    render() {
        const { label, value, unit, validationState, helpText, placeholder, isReadOnly, className } = this.props;
        return (
            <FormGroup validationState={validationState} className={className}>
                 {label&&<ControlLabel>{label}</ControlLabel>}
                <div className="garmit-input-group">
                    <div className="garmit-input-item garmit-input-addon pa-l-1">
                        <span>X：</span>
                    </div>
                    <div className="garmit-input-item">
                        <TextForm value={value && value.x} placeholder={placeholder && placeholder.x} isReadOnly={isReadOnly} onChange={(changedX) => this.handleXChange(changedX)} />
                    </div>
                    <div className="garmit-input-item garmit-input-addon pa-l-1">
                        <span>Y：</span>
                    </div>
                    <div className="garmit-input-item">
                        <TextForm value={value && value.y} placeholder={placeholder && placeholder.y} isReadOnly={isReadOnly} onChange={(changedY) => this.handleYChange(changedY)} />
                    </div>                    
                </div>
                {helpText&&<HelpBlock>{helpText}</HelpBlock>}
            </FormGroup>
        );
    }
    
    /**
     * Xのテキスト変更イベント
     * @param {*} changedX
     */
    handleXChange(changedX){
        if (this.props.onChange) {
            const { value } = this.props;
            this.props.onChange({ x: changedX, y: value.y });
        }
    }

    /**
     * Yのテキスト変更イベント
     * @param {*} changedY
     */
    handleYChange(changedY){
        if (this.props.onChange) {
            const { value } = this.props;
            this.props.onChange({ x: value.x, y: changedY});
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

Position2DForm.propTypes = {
    label: PropTypes.string,
    value: PropTypes.shape({
        x: PropTypes.string,
        y: PropTypes.string
    }),
    placeholder: PropTypes.shape({
        x: PropTypes.string,
        y: PropTypes.string
    }),
    onChange: PropTypes.func,
    isReadOnly: PropTypes.bool,
    helpText: PropTypes.string,
    validationState: PropTypes.oneOf(['success', 'warning', 'error', null]),
    unit: PropTypes.string,
    className: PropTypes.string
};