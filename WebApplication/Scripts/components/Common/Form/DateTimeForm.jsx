/**
 * @license Copyright 2017 DENSO
 * 
 * 日付時刻ピッカーフォーム Reactコンポーネント
 *
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';
import DateTimePicker from '../Widget/DateTimePicker';

/**
 * 日付時刻ピッカーフォームコンポーネント
 * @param {string}　label フォームのタイトル
 * @param {string}　value 選択した日付
 * @param {string} format フォーマット
 * @param {boolean} timePicker 時刻ピッカーが必要かどうか
 * @param {function}　onChange 日付変更イベント
 * @param {oneOf}　validationState 検証結果（success, warning, error, null）
 * @param {string}　helpText 入力欄の説明。例：入力エラー時にエラー内容を表示する。
 * @param {boolean}　isReadOnly 読み取り専用かどうか
 * @param {string} className className
 * @param {moment|date} minDate 最小値
 * @param {moment|date} maxDate 最大値
 */
export default class DateTimeForm extends Component {
    
    /**
     * render
     */
    render() {
        const { label, value, format, timePicker, isReadOnly, validationState, helpText, className, minDate, maxDate, viewMode, timeConstraints } = this.props;

        return (
            <FormGroup validationState={validationState} className={className}>
                {label&&<ControlLabel>{label}</ControlLabel>}
                {<DateTimePicker timePicker={timePicker} 
                                 isReadOnly={isReadOnly} 
                                 value={value} 
                                 format={format} 
                                 onChange={(v) => this.handleChanged(v)} 
                                 minDate={minDate}
                                 maxDate={maxDate}
                                 viewMode={viewMode}
                                 timeConstraints={timeConstraints}
                />}
                {helpText&&<HelpBlock>{helpText}</HelpBlock>}
            </FormGroup>
        );
    }

    /**
     * 日付変更イベント
     * @param {*} value 
     */
    handleChanged(value){
        if ( this.props.onChange ) {
            this.props.onChange(value);
        }
    }
}

DateTimeForm.propTypes = {
    label: PropTypes.string,
    value: PropTypes.instanceOf(Date),
    format: PropTypes.string,
    timePicker: PropTypes.bool,
    onChange: PropTypes.func,
    isReadOnly: PropTypes.bool,
    helpText: PropTypes.string,
    validationState: PropTypes.oneOf(['success', 'warning', 'error', null]),
    className: PropTypes.string,
    minDate: PropTypes.date,
    maxDate: PropTypes.date,
    viewMode: PropTypes.oneOf(['years', 'months', 'days', 'time'])
};
