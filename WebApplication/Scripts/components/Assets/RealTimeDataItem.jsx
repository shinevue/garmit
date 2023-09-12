'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

export default class RealTimeDataItem extends Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    /**
     * 表示する値を生成する
     * @param {any} dateValuePair
     */
    makeValueString(dateValuePair, formatString) {
        if (!dateValuePair) {
            return ' ― ';
        }
        if (dateValuePair.displayString) {
            return dateValuePair.displayString;
        }
        if (dateValuePair.scaledValue != null) {
            return format(formatString, dateValuePair.scaledValue);
        }
    }

    /**
     * フォーマットする
     * @param {any} value
     * @param {any} formatString
     */
    formatValue(value, formatString) {
        return format(formatString, value);
    }

    /**
     * render
     */
    render() {
        const { currentData, lastData, hideLastData } = this.props;
        const { valueData, dayMax, dayMin, dayAverage } = currentData;
        const { dateValuePairs, alarmClassName, point, format, unit } = valueData;
        const value = this.makeValueString(dateValuePairs[0], format || '');
        const lastValue = this.makeValueString(lastData && lastData.valueData.dateValuePairs[0], format || '');
        const max = (dayMax != null) ? this.formatValue(dayMax, format || '') : '―';
        const min = (dayMin != null) ? this.formatValue(dayMin, format || '') : '―';
        const avg = (dayAverage != null) ? this.formatValue(dayAverage, format || '') : '―';

        const iconClass = point.datatype.iconClass ? 'realtime-type-' + point.datatype.iconClass : '';

        const classes = {
            'item': true,
            'realtime-box': true
        };

        return (
            <li
                className={classNames(classes, alarmClassName || '', iconClass)}
                data-value={value}
                data-name={point.pointName}
                data-datatype={point.datatype.dtType}
                data-alarm={alarmClassName || ''}
            >
                <div className="realtime-box-inner item-content">
                    <div className="realtime-header">
                        <span className="realtime-action">
                            <Button onClick={() => this.props.onDetailIconClick(point.pointNo)}><Icon className="material-icons" >settings</Icon></Button>
                            <Button onClick={() => this.props.onGraphIconClick(point.pointNo)}><Icon className="material-icons" >timeline</Icon></Button>
                        </span>
                        <span className="title">{point.pointName}</span>
                    </div>

                    <div className="realtime-value">
                        <span className="realtime-current">
                            <span class="value">{value}</span><span class="unit">{unit}</span>
                        </span>
                        {!hideLastData&&
                            <span className="realtime-last">
                                （前回：<span class="value">{lastValue}</span><span class="unit">{unit}</span>）
                            </span>
                        }
                    </div>

                    <dl class="realtime-statistic">
                        <dt>MAX</dt>
                        <dd><span class="value">{max}</span><span class="unit">{unit}</span></dd>
                        <dt>MIN</dt>
                        <dd><span class="value">{min}</span><span class="unit">{unit}</span></dd>
                        <dt>AVG</dt>
                        <dd><span class="value">{avg}</span><span class="unit">{unit}</span></dd>
                    </dl>
                </div>
            </li>
        );
    }
}