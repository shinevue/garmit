/**
 * @license Copyright 2017 DENSO
 * 
 * DateTimePicker Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Datetime from 'react-datetime';
import { InputGroup } from 'react-bootstrap';
import Icon from './Icon';

import { isDate, toMomentjsFormat, getDateFormat, getTimeFormat } from 'datetimeUtility';

/**
 * 日付時刻コンポーネントを定義します。
 * @param {boolean} timePicker 時刻ピッカーを使用するかどうか
 * @param {string} format 日付時刻フォーマット
 * @param {moment|date|string} value 日付時刻
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {string} viewMode 表示モード（'years', 'months', 'days', 'time'のいずれか）
 * @param {string} className clssName
 * @param {moment|date} minDate 最小値
 * @param {moment|date} maxDate 最大値
 * @param {function} onChange 日付変更時に呼び出す
 */
export default class DateTimePicker extends Component {
    
    static get DEFALUT_FORMAT() {
        return 'YYYY/MM/DD';
    }

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            currentDate: props.value,
            ...this.getFormatObject(props.format, props.timePicker)
        };
    }


    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {object} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const { value, format, timePicker } = nextProps;
        this.setState({ 
            currentDate: value,
            ...this.getFormatObject(format, timePicker)
        });
    }

    /**
     * フォーマットを取得する
     * @param {string} format フォーマット
     * @param {string} timePicker タイムピッカーを使うかどうか
     * @returns {object} 取得したフォーマット
     */
    getFormatObject(format, timePicker) {
        const nextFormat = format ? toMomentjsFormat(format) : DateTimePicker.DEFALUT_FORMAT;
        const dateFormat = getDateFormat(nextFormat);
        const timeFormat = timePicker ? getTimeFormat(format) : false;

        return { 
            format: nextFormat,
            dateFormat,
            timeFormat
        };
    }

    /**
     * 日付時刻の文字列を取得する
     * @param {moment|date} value 対象の日付時刻
     * @param {string} format 日付フォーマット書式（momentの書式とする）
     * @returns {string} 日付時刻文字列
     */
    toDateTimeString( value, format ) {
        return this.hasValue( value ) ? moment(value).format(format) : '';
    }

    /**
     * 日付時刻があるかどうか
     * @param {moment|date} value 対象の日付時刻
     * @returns {boolean} データの有無
     */
    hasValue( value ) {
        if ( value === undefined || value === null || value === '') {
            return false;
        }
        return value;
    }

    /**
     * 対象の日付が範囲内に入っているか（日付のみ対象）
     * @param {moment} targetDate 対象の日付
     * @param {moment|date} minDate 最小日付
     * @param {moment|date} maxDate 最大日付
     * @returns {boolean} 対象日付が範囲内に入っているかどうか
     */
    isValidDate(targetDate, minDate, maxDate) {
        let isValid = true;
        if (minDate) {
            let momentDate = moment(this.toDateTimeString(minDate, 'YYYY-MM-DD'));
            isValid = (momentDate <= targetDate);
        }

        if (isValid&&maxDate) {
            let momentDate = moment(this.toDateTimeString(maxDate, 'YYYY-MM-DD'));
            isValid = (targetDate <= momentDate);
        }
        
        return isValid;
    }

    /**
     * render
     */
    render() {
        const { isReadOnly, format, viewMode, className, minDate, maxDate, timeConstraints } = this.props;
        const { currentDate, dateFormat, timeFormat  } = this.state;
        return (
            <InputGroup className={className}>
                <InputGroup.Addon><Icon className="fal fa-calendar-alt" /></InputGroup.Addon>
                <Datetime value={currentDate}
                          viewMode={viewMode ? viewMode:'days'}
                          dateFormat={dateFormat?dateFormat:false} 
                          timeFormat={timeFormat?timeFormat:false}
                          closeOnSelect={true} 
                          isValidDate={(current) => this.isValidDate(current, minDate , maxDate)}
                          inputProps={{ disabled: isReadOnly, placeholder: format, className: 'form-control float-none' }}
                          onChange={(v) => this.handleChanged(v)}
                          timeConstraints={timeConstraints}
                          />
            </InputGroup>
        );
    }

    /**
     * 日付変更イベント
     * @param {(Moment|Date|string)} value 
     */
    handleChanged(value) {
        const { minDate, maxDate, format } = this.props;

        if (isDate(value, format)) {
            if (minDate && (minDate > value)) {
                value = minDate;    //最小の日付時刻よりも小さかったら、最小値にする
            } else if (maxDate && (value > maxDate)) {
                value = maxDate;    //最大の日付時刻よりも大きかったら、最大値にする
            }
        }

        if (!value) {
            value = null;
        }

        var obj =  Object.assign({}, this.state);
        obj.currentDate = value;
        this.setState(obj);

        if ( this.props.onChange ) {
            this.props.onChange( value );
        }
    }
}

DateTimePicker.propTypes = {
    timePicker: PropTypes.bool,
    format: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.date, PropTypes.string]) ,
    onChange: PropTypes.func,
    isReadOnly: PropTypes.bool,
    viewMode: PropTypes.oneOf(['years', 'months', 'days', 'time']),
    className:PropTypes.string,
    minDate: PropTypes.date,
    maxDate: PropTypes.date
}