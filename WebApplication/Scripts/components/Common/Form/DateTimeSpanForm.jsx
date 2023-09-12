'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { FormGroup, Form, HelpBlock } from 'react-bootstrap';
import { VALIDATE_STATE } from 'inputCheck';

import DateTimeForm from 'Common/Form/DateTimeForm'

/**
 * 期間指定フォーム
 * @param {Date} from 開始時刻
 * @param {Date} to 終了時刻
 * @param {string} format フォーマット
 * @param {bool} timePicker 時刻選択を使用するか
 * @param {bool} isReadOnly 読み取り専用か
 * @param {func} onChange 時刻が変化したとき
 */
export default class DateTimeSpanForm extends Component {

    constructor() {
        super();
        this.state = {

        }
    }

    render() {
        const { from, to, validationFrom, validationTo, format, timePicker, isReadOnly, isReadOnlyFrom, isReadOnlyTo, onChange, fromMax, fromMin, toMax, toMin, viewMode } = this.props
        const { validation } = this.props;
        if (validation) {
            var validateFrom = validation && validationFrom && validationFrom.state === VALIDATE_STATE.success ? validation : validationFrom;
            var validateTo = validation && validationTo && validationTo.state === VALIDATE_STATE.success ? validation : validationTo;
        } else {
            var validateFrom = validationFrom;
            var validateTo = validationTo;
        }

        return (
            <div className="form-inline" style={{ display: 'inline-block' }}>
                <DateTimeForm
                    className="va-t"
                    timePicker={timePicker}
                    isReadOnly={isReadOnly || isReadOnlyFrom}
                    value={from}
                    format={format}
                    onChange={(v) => onChange(v, to)}
                    minDate={fromMin}
                    viewMode={viewMode}
                    validationState={validateFrom && validateFrom.state}
                    helpText={validationFrom && validationFrom.helpText}
                />
                <div className="pa-05" style={{ height: 34, display: 'inline-block' }}>～</div>
                <DateTimeForm
                    className="va-t"
                    timePicker={timePicker}
                    isReadOnly={isReadOnly || isReadOnlyTo}
                    value={to}
                    format={format}
                    onChange={(v) => onChange(from, v)}
                    maxDate={toMax}
                    viewMode={viewMode}
                    validationState={validateTo&&validateTo.state}
                    helpText={validationTo && validationTo.helpText}
                />
                {validation&&validation.helpText&&
                    <HelpBlock className="text-error" >{validation.helpText}</HelpBlock>
                }
            </div> 
        );
    }
}