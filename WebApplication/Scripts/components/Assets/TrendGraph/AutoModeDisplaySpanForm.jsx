'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Form, FormControl } from 'react-bootstrap';

import { MEASURED_DATA_TYPE, AUTO_UPDATE_VALUES } from 'constant';

const TIME_SPANS = [
    { value: 10, name: '10分' },
    { value: 30, name: '30分' },
    { value: 60, name: '1時間' },
    { value: 180, name: '3時間' },
    { value: 360, name: '6時間' },
    { value: 720, name: '12時間' }
]

export default class AutoModeDisplaySpanForm extends Component {

    constructor(props) {
        super(props);
        this.state = {

        }
    }

    /**
     * 表示期間のオプションを生成
     */
    makeTimeOption() {
        return TIME_SPANS.filter((span) => {
            if (this.props.measuredDataType === MEASURED_DATA_TYPE.realTime) {
                if (span.value <= 180) return true;
                return false;
            }
            if (this.props.measuredDataType === MEASURED_DATA_TYPE.summary) {
                if (span.value >= 60) return true;
                return false;
            }
            return true;
        });
    }

    /**
     * render
     */
    render() {
        const { value, onChange, className } = this.props

        const timeOptions = this.makeTimeOption();

        return (
            <Form inline className={className}>
                表示期間：
                <FormControl
                    componentClass='select'
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                >
                    {timeOptions.map((item) => <option value={item.value}>{item.name}</option>)}
                </FormControl>
            </Form>    
        );
    }
}