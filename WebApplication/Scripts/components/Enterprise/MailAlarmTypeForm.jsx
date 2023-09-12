'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { ALARM_NAME } from 'constant';

import { Radio } from 'react-bootstrap';

export default class MailAlarmTypeForm extends Component {

    constructor() {
        super();
        this.state = {

        };
    }

    /**
     * 
     * @param {any} val
     * @param {any} key
     */
    handleClick(val, key) {
        let alarmType = Object.assign({}, this.props.alarmType);
        if (alarmType[key] != val) {
            alarmType[key] = val;
            this.props.onChange(alarmType);
        }
    }

    render() {
        const { alarmType, parentAlarmType, disabled } = this.props

        const rows = [];

        if (parentAlarmType) {
            for (let key of Object.keys(alarmType)) {
                if (parentAlarmType[key]) {
                    rows.push(
                        <tr>
                            <td className="pa-r-2">
                                {ALARM_NAME[key]}
                            </td>
                            <td className="pa-r-1">
                                <Radio inline
                                    disabled={disabled}
                                    checked={alarmType[key]}
                                    onClick={() => this.handleClick(true, key)}
                                >
                                    通知する
                        </Radio>
                            </td>
                            <td className="pa-r-1">
                                <Radio inline
                                    disabled={disabled}
                                    checked={!(alarmType[key])}
                                    onClick={() => this.handleClick(false, key)}
                                >
                                    通知しない
                        </Radio>
                            </td>
                        </tr>
                    );
                }
            }
        }

        return (
            <div>
                {rows.length > 0 ?
                    <table>
                        {rows}
                    </table>
                    :
                    <div>設定可能な種別がありません</div>
                }
            </div>
        );
    }
}

MailAlarmTypeForm.propTypes = {
    alarmType: PropTypes.object,
    onChange: PropTypes.func
}

MailAlarmTypeForm.defaultProps = {
    onChange: () => { }
}