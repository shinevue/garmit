/**
 * @license Copyright 2018 DENSO
 * 
 * StringCondition Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextForm from 'Common/Form/TextForm';
import { errorResult, successResult } from 'inputCheck';

/**
 * 文字列検索条件コンポーネント
 * @param {string} valueText 検索条件文字列
 * @param {function} onChange テキスト変更時に呼び出す。スペースorカンマ区切りで分けた文字列配列を渡す。
 */
export default class StringCondition extends Component {
    
    /**
     * render
     */
    render() {
        const { valueText } = this.props;
        const validate = this.validateBlankError(valueText);
        return (
            <div className="condition">
                <TextForm 
                    value={valueText} 
                    validationState={validate.state}
                    helpText={validate.helpText}
                    onChange={(v) => this.handleChange(v)} 
                />
            </div>
                   
        );
    }
    
    /**
     * テキスト変更イベント
     * @param {*} value 
     */
    handleChange(value) {
        const validate = this.validateBlankError(value);
        if (this.props.onChange) {
            this.props.onChange(
                this.getStringArray(value), 
                validate.state !== successResult.state, 
                value
            );
        }
    }
    
    /**
     * テキストを文字列の配列に分割する
     * @param {any} text テキスト変更イベント
     */
    getStringArray(text) {
        const strings = text.split(/,|\s+/);   // 空白または「,」で文字列を分割する
        return strings.filter((str) => str !== '');  // 空の文字列を除く
    }

    /**
     * 空欄の検証
     * @param {string} text テキスト
     */
    validateBlankError(text = '') {
        if (!text) {
            if (!(text === 0) || (text === false)){     //0またはfalseは空欄エラーとしない
                return errorResult('必須項目です');
            }
        }
        return successResult;
    }
}

StringCondition.propTypes = {
    valueText: PropTypes.string,
    onChange: PropTypes.func
}