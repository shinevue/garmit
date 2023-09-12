'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { FormControl, FormGroup, ControlLabel, Button, Form, Radio, Checkbox, Grid, Row, Col } from 'react-bootstrap';

import DateTimeForm from 'Common/Form/DateTimeForm';
import SelectForm from 'Common/Form/SelectForm';
import DateTimeSpanForm from 'Common/Form/DateTimeSpanForm';

import { MEASURED_DATA_TYPE } from 'constant';

const CST_OPTIONS = [
    { id: 0, value: { key: "minutes", amount: 10 }, name: "10分" },
    { id: 1, value: { key: "minutes", amount: 30 }, name: "30分" },
    { id: 2, value: { key: "hours", amount: 1 }, name: "1時間" },
    { id: 3, value: { key: "hours", amount: 3 }, name: "3時間" },
    { id: 4, value: { key: "hours", amount: 6 }, name: "6時間" },
    { id: 5, value: { key: "hours", amount: 12 }, name: "12時間" },
    { id: 6, value: { key: "days", amount: 1 }, name: "24時間" },
    { id: 7, value: { key: "weeks", amount: 1 }, name: "1週間" },
    { id: 8, value: { key: "months", amount: 1 }, name: "1ヶ月" }
];

export default class TimeSpanOption extends Component {

    constructor(props) {
        super(props);
        this.state = {
            spanChecked: false,
            spanIndex: this.getInitialSpanIndex(props.measuredDataType),
            options: this.preOptions(props.measuredDataType)
        }
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。
     * このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.measuredDataType !== this.props.measuredDataType) {
            this.setState({
                options: this.preOptions(nextProps.measuredDataType),
                spanIndex: this.getInitialSpanIndex(nextProps.measuredDataType)
            }, () => {
                if (this.state.spanChecked) {
                    this.props.timeChanged(nextProps.from, this.calculateTo(nextProps.from))
                }
            })
        }
    }

    /**
     * オプションの配列を用意する
     * @param {any} measuredDataType
     */
    preOptions(measuredDataType) {
        return (measuredDataType == MEASURED_DATA_TYPE.realTime) ?
            CST_OPTIONS.filter((option) => option.id <= 7) : CST_OPTIONS.filter((option) => option.id >= 2);
    }

    /**
     * 初期の期間指定の選択状態を取得
     * @param {any} measuredDataType
     */
    getInitialSpanIndex(measuredDataType) {
        return (measuredDataType === MEASURED_DATA_TYPE.realTime) ? 2
            : (measuredDataType === MEASURED_DATA_TYPE.summary) ? 3 : 0;
    }

    /**
     * 期間指定のチェックが切り替わったとき
     * @param {any} value
     */
    spanCheckedChanged(value) {
        if (value !== this.state.spanChecked) {
            this.setState({ spanChecked: value });

            // 期間指定に変更された時
            if (value === true) {
                this.props.timeChanged(this.props.from, this.calculateTo(this.props.from))
            }
        }
    }

    /**
     * 期間指定の値が変更された時
     * @param {any} value
     */
    spanChanged(value) {
        const { from } = this.props

        this.setState({ spanIndex: value }, () => {
            this.props.timeChanged(from, this.calculateTo(from));
        })
    }

    /**
     * toの値を計算する
     * @param {any} from
     * @returns 計算結果
     */
    calculateTo(from) {
        const { options, spanIndex } = this.state;
        const span = options[spanIndex].value;
        const to = from && typeof (from) != "string" && !(to instanceof String) && moment(from).add((span.amount), span.key);
        return to;
    }

    /**
     * render
     */
    render() {
        const { from, to, timeChanged, measuredDataType, validationFrom, validationTo, format, disabled } = this.props
        const { spanChecked, spanIndex, options } = this.state

        return (
            <Grid fluid>
                <Row><Col md={12}><strong>表示期間：</strong></Col></Row>
                <Row>
                    <Col md={12} >
                        <Form inline className="pa-1">
                            <Radio
                                disabled={disabled}
                                checked={!spanChecked}
                                onClick={() => this.spanCheckedChanged(false)}
                            >
                                日時指定：
                            </Radio>
                            <DateTimeSpanForm
                                from={from}
                                to={to}
                                format={format}
                                isReadOnly={disabled || spanChecked}
                                timePicker={true}
                                onChange={(from, to) => timeChanged(from, to)}
                                validationFrom={!spanChecked && validationFrom}
                                validationTo={!spanChecked && validationTo}
                                fromMax={measuredDataType == MEASURED_DATA_TYPE.summary && moment(to).add(-1, 'hours')}
                                toMin={measuredDataType == MEASURED_DATA_TYPE.summary && moment(from).add(1, 'hours')}
                            />
                        </Form>
                    </Col>
                </Row>
                <Row>
                    <Col md={12}>
                        <Form inline className="pa-1">
                            <Radio
                                disabled={disabled}
                                checked={spanChecked}
                                onClick={() => this.spanCheckedChanged(true)}
                            >
                                期間指定：
                            </Radio>
                            <DateTimeForm
                                className="va-t"
                                value={from}
                                format={format}
                                onChange={(from) => this.props.timeChanged(from, this.calculateTo(from))}
                                isReadOnly={disabled || !spanChecked}
                                timePicker
                                validationState={spanChecked && validationFrom.state}
                                helpText={spanChecked && validationFrom.helpText}
                            />　
                            <FormControl
                                componentClass='select'
                                value={spanIndex}
                                onChange={(e) => this.spanChanged(e.target.value)}
                                disabled={disabled || !spanChecked}
                            >
                                {options && options.map((option, i) =>
                                    <option value={i}>{option.name}</option>
                                )}
                            </FormControl>
                        </Form>
                    </Col>
                </Row>
            </Grid>        
        );
    }
}

TimeSpanOption.propTypes = {

}