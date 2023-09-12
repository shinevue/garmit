/**
 * Copyright 2017 DENSO Solutions
 * 
 * 日付時刻フォーマット選択フォーム Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row, Col, Checkbox, FormGroup } from 'react-bootstrap';

import TextForm from 'Common/Form/TextForm';
import SelectForm from 'Common/Form/SelectForm';

import { getDateFormat, getTimeFormat, hasTimeFormat } from 'datetimeUtility';
import { DATE_OPTIONS, TIME_OPTIONS } from 'extendedDataUtility';

export default class DateTimeFormatSelectForm extends Component {

    constructor(props) {
        super(props)

        this.state = {
        }
    }

    /**
     * 時刻のみ指定チェックボックスチェック状態変更イベント
     */
    handleChangeCheckState(value) {
        if (this.props.onChangeFormat) {
            this.props.onChangeFormat({ checked: value });
        }
    }

    /**
     * 日付フォーマット変更イベント
     */
    handleChangeDateFormat(value) {
        if (this.props.onChangeFormat) {
            this.props.onChangeFormat({ dateFormatValue: value });
        }
    }

    /**
     * 時刻フォーマット変更イベント
     */
    handleChangeTimeFormat(value) {
        if (this.props.onChangeFormat) {
            this.props.onChangeFormat({ timeFormatValue: value });
        }
    }

    /**
     * render
     */
    render() {
        const { selectFormat, disabled, isReadOnly } = this.props;
        const { isTimeOnly, dateFormatValue, timeFormatValue } = this.props;

        return (
            <FormGroup>
                {!isTimeOnly &&
                    <SelectForm
                        isReadOnly={isReadOnly}
                        className={classNames(classNames({ 'disable-formgroup': disabled }))}
                        isRequired={true}
                        options={DATE_OPTIONS}
                        placeholder="日付フォーマット"
                        value={dateFormatValue}
                        onChange={(selectFormat) => this.handleChangeDateFormat(selectFormat)}
                    />
                }
                <SelectForm
                    isReadOnly={isReadOnly}
                    className={classNames(classNames({ 'disable-formgroup': disabled }))}
                    isRequired={isTimeOnly}
                    options={isTimeOnly ? TIME_OPTIONS.slice(1, TIME_OPTIONS.length) : TIME_OPTIONS}
                    placeholder="時刻フォーマット"
                    value={timeFormatValue}
                    onChange={(selectFormat) => this.handleChangeTimeFormat(selectFormat)}
                />
                <Checkbox className="pa-0"
                    disabled={isReadOnly}
                    className={classNames("pa-0",classNames({ 'disable-formgroup': disabled }))}
                    checked={isTimeOnly}
                    onClick={(e) => this.handleChangeCheckState(e.target.checked)}>
                    時刻のみ指定
                </Checkbox>
            </FormGroup>
        );
    }
}

DateTimeFormatSelectForm.propTypes = {
    isTimeOnly: PropTypes.bool,
    dateFormatValue: PropTypes.string,
    timeFormatValue: PropTypes.string,
    disabled:PropTypes.bool,
    isReadOnly:PropTypes.bool
}