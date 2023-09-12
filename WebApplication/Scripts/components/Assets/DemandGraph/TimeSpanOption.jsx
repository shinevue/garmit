'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { FormControl, FormGroup, ControlLabel, Form } from 'react-bootstrap';

import DateTimeForm from 'Common/Form/DateTimeForm';

import { validateDate, successResult, errorResult, VALIDATE_STATE } from 'inputCheck';
import { DISPLAY_TIME_SPANS } from 'constant';
import { floorDate } from 'demandViewUtility';

export default class TimeSpanOption extends Component {

    constructor(props) {
        super(props);
        this.state = {
            inputCheck: {
                date: successResult
            }
        }
    }

    /**
     * 種別の文字列を取得する
     * @param {any} typeId
     */
    getTypeString(typeId) {
        switch (typeId) {
            case DISPLAY_TIME_SPANS.day_byHalfAnHour:
            case DISPLAY_TIME_SPANS.day_byHour:
                return '日';
            case DISPLAY_TIME_SPANS.month:
                return '月';
            case DISPLAY_TIME_SPANS.year:
                return '年';
            default:
                return '日時';
        }
    }

    /**
     * 日時のフォーマットを取得する
     * @param {any} typeId
     */
    getFormat(typeId) {
        switch (typeId) {
            case DISPLAY_TIME_SPANS.day_byHalfAnHour:
            case DISPLAY_TIME_SPANS.day_byHour:
                return 'YYYY/MM/DD';
            case DISPLAY_TIME_SPANS.month:
                return 'YYYY/MM';
            case DISPLAY_TIME_SPANS.year:
                return 'YYYY';
            default:
                return 'YYYY/MM/DD HH:mm';
        }
    }

    /**
     * DateTimePickerのViewModeを取得する
     * @param {any} typeId
     */
    getViewMode(typeId) {
        switch (typeId) {
            case DISPLAY_TIME_SPANS.month:
                return 'months';
            case DISPLAY_TIME_SPANS.year:
                return 'years';
            default:
                return 'days';
        }
    }



    /**
     * 種別が変更された時
     * @param {any} typeId
     */
    onTypeChange(typeId) {
        const format = this.getFormat(typeId);
        const date = floorDate(this.props.date, typeId);
        const inputCheck = Object.assign({}, this.state.inputCheck);
        inputCheck.date = successResult;
        this.setState({ inputCheck: inputCheck }, () => {
            this.props.onChange(typeId, date, false);
        });
    }

    /**
     * 日付が変更された時
     * @param {any} date
     */
    onDateChange(date) {
        const inputCheck = Object.assign({}, this.state.inputCheck)
        inputCheck.date = validateDate(date, this.getFormat(this.props.typeId), false);

        if (!this.props.isDigest || this.props.typeId < DISPLAY_TIME_SPANS.day_byHalfAnHour) {
            if (inputCheck.date.state === VALIDATE_STATE.success) {
                const minutes = date.minutes();
                if (minutes !== 0 && minutes !== 30) {
                    inputCheck.date = errorResult('時刻には0分もしくは30分を入力してください');
                }
            }
        }

        this.setState({ inputCheck: inputCheck }, () => {
            this.props.onChange(this.props.typeId, date, inputCheck.date.state === VALIDATE_STATE.error);
        });
    }

    /**
     * 送信された時
     * @param {any} e
     */
    handleSubmit(e) {
        e.preventDefault();
        return false;
    }

    /**
     * render
     */
    render() {
        const { types, typeId, date, isDigest, disabled } = this.props;
        const { inputCheck } = this.state;

        return (
            <div>
                {isDigest &&
                    <Form inline onSubmit={(e) => this.handleSubmit(e)}>
                        <FormGroup style={{ paddingBottom: 15 }}>
                            <ControlLabel>種別：</ControlLabel>
                            <FormControl
                                componentClass='select'
                                disabled={disabled}
                                value={typeId}
                                onChange={(e) => this.onTypeChange(parseInt(e.target.value))}
                            >
                                {types && types.map((type) => <option value={type.displayTimeSpanId}>{type.name}</option>)}
                            </FormControl>
                        </FormGroup>
                    </Form>
                }
                <Form inline onSubmit={(e) => this.handleSubmit(e)}>
                    <DateTimeForm
                        label={`対象${this.getTypeString(typeId)}：`}
                        isReadOnly={disabled}
                        value={date}
                        format={this.getFormat(typeId)}
                        timePicker={!isDigest || typeId < DISPLAY_TIME_SPANS.day_byHalfAnHour}
                        viewMode={this.getViewMode(typeId)}
                        timeConstraints={{ minutes: { step: 30 } }}
                        onChange={(date) => this.onDateChange(date)}
                        validationState={inputCheck.date.state}
                        helpText={inputCheck.date.helpText} 
                    />　
                </Form>
            </div>                   
        );
    }
}

TimeSpanOption.propTypes = {

}