/**
 * Copyright 2017 DENSO Solutions
 * 
 * レポート種別選択フォーム Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row, Col, FormGroup, FormControl, Button, Radio, Checkbox } from 'react-bootstrap';
import SelectForm from 'Common/Form/SelectForm';
import DateTimeForm from 'Common/Form/DateTimeForm';
import DateTimeSpanForm from 'Common/Form/DateTimeSpanForm';

import MeasuredDataTypeSelectForm from 'DataReport/MeasuredDataTypeSelectForm';
import DateCondition from 'DataReport/DateCondition';
import RealTimeCondition from 'DataReport/RealTimeCondition';
import DigestCondition from 'DataReport/DigestCondition';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';

import { MDATA_TYPE_OPTIONS, DATE_TIME_FORMAT, SUMMARY_TYPE_OPTION, REPORT_TYPE_OPTIONS, REALTIME_OPTIONS, DIGEST_OPTIONS, EXPORT_SPAN_OPTIONS } from 'constant';

export default class ReportTypeSelectForm extends Component {

    constructor(props) {
        super(props)
        this.state = {
            viewMode: "days"
        }
    }   

    /**
     * componentWillReceivePropsイベント
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.condition.reportType !== this.props.condition.reportType) {
            //dateTimePickerの表示モードを変更する
            this.changeViewMode(nextProps.condition.reportType);
        }
    }

    //#region イベントハンドラ
    /**
     * 計測値種別変更イベント
     */
    handleChangeMDataType(value) {
        if (this.props.onChangeMDataType) {
            this.props.onChangeMDataType(value);
        }
    }

    /**
     * 日時変更イベント
     * @param {bool} showEnd 終了日時選択フォームを表示するかどうか
     */
    handleChangeDate(from, to, showEnd) {
        if (this.props.onChangeDate) {
            this.props.onChangeDate(from, to, showEnd);
        }
    }    

    /**
     * 積算種別変更イベント
     */
    handleChangeSummaryType(type) {
        if (this.props.onChangeSummaryType) {
            this.props.onChangeSummaryType(type);
        }
    }

    /**
     * レポート出力種別更イベント
     */
    handleChangeReportType(type, format) {
        //終了日時選択フォームを表示状態変更
        let startDate = moment().startOf('day');
        let endDate = Object.assign({}, this.props.condition.endDate);
        if (type === REPORT_TYPE_OPTIONS.period) {
            startDate = moment().startOf('day');
            endDate.show = true;
            endDate.value = moment().startOf('hour');
        }
        else {
            if (type === REPORT_TYPE_OPTIONS.monthly) {
                startDate = moment().startOf('month');
            }
            else if (type === REPORT_TYPE_OPTIONS.annual) {
                startDate = moment().startOf('year');
            }
            endDate.show = false;
            endDate.value = null;
        }
        if (this.props.onChangeReportType) {
            this.props.onChangeReportType(type, format, startDate, endDate.value, endDate.show );
        }
    }

    /**
     * レポート出力期間更イベント
     */
    handleChangeReportInterval(interval){
        if (this.props.onChangeReportInterval) {
            this.props.onChangeReportInterval(interval);
        }
    }

    /**
     * 換算するスイッチの切替イベント
     * @param {boolean} isConvert 換算するかどうか
     */
    handleChangeIsConvert(isConvert) {
        if (this.props.onChangeIsConvert) {
            this.props.onChangeIsConvert(isConvert);
        }
    }

    //#endregion

    /**
     * render
     */
    render() {
        const { condition, validationInfo } = this.props;
        const isRealTime = condition.measuredDataType === MDATA_TYPE_OPTIONS.realTime ? true : false;
        const { viewMode } = this.state;

        return (
            <Grid fluid>
                <MeasuredDataTypeSelectForm
                    measuredDataType={condition.measuredDataType}
                    mDataTypeOptions={MDATA_TYPE_OPTIONS}
                    onChangeMDataType={(value) => this.handleChangeMDataType(value)}
                />
                <DateCondition
                    reportType={condition.reportType}
                    reportTypeOptions={isRealTime ? REALTIME_OPTIONS : DIGEST_OPTIONS}
                    startDate={condition.startDate}
                    endDate={condition.endDate}
                    format={condition.format}
                    validationInfo={validationInfo}
                    viewMode={viewMode}
                    isPeriod={condition.reportType === "Period" ? true : false}
                    onChangeReportType={(type, format) => this.handleChangeReportType(type, format)}
                    onChangeDate={(from, to, showEnd) => this.handleChangeDate(from, to, showEnd)}
                />
                {isRealTime?
                    <RealTimeCondition
                        exportSpanOptions={EXPORT_SPAN_OPTIONS}
                        reportInterval={condition.reportInterval}
                        onChangeReportInterval={(select) => this.handleChangeReportInterval(select)}
                    />
                    :
                    <DigestCondition
                        summaryType={condition.summaryType}
                        summaryTypeOptions={SUMMARY_TYPE_OPTION}
                        onChangeSummaryType={(type) => this.handleChangeSummaryType(type)}
                    />
                }
                <CheckboxSwitch
                    text="換算表示"
                    bsSize="xs"
                    checked={condition.isConvert}
                    onChange={(checked) => this.handleChangeIsConvert(checked)}
                />
            </Grid>
        )
    }

    //#region　その他関数
    /**
     * viewModeを変更する
     */
    changeViewMode(type) {
        let viewMode = "time";
        if (type === REPORT_TYPE_OPTIONS.daily) {
            viewMode = "days";
        }
        else if (type === REPORT_TYPE_OPTIONS.monthly){
            viewMode = "months";
        }
        else if (type === REPORT_TYPE_OPTIONS.annual) {
            viewMode = "years";
        }
        this.setState({ viewMode: viewMode });
    }
    //#endregion
}

ReportTypeSelectForm.propTypes = {
    condition: PropTypes.shape({
        mesuredDataType: PropTypes.oneOf(['RealTime', 'Summary']),
        startDate: PropTypes.object,
        endDate: PropTypes.object,
        isGroupingByRack: PropTypes.bool,
        summaryType: PropTypes.oneOf(['Max', 'Min', 'Average', 'Snap', 'Diff']),
        reportType: PropTypes.oneOf(['None', 'OneMinute', 'FiveMinutes', 'TenMinutes']),
        reportInterval: PropTypes.oneOf(['Period', 'Daily', 'Monthly', 'Annual']),
        format: PropTypes.oneOf(['YYYY/MM/DD HH:mm', 'YYYY/MM/DD HH:00', 'YYYY/MM/DD', 'YYYY/MM', 'YYYY']),
    }),
    onChangeMDataType:PropTypes.func,
    onChangeStartDate: PropTypes.func,
    onChangeEndDate: PropTypes.func,
    onChangeGroupRack: PropTypes.func,
    onChangeSummaryType: PropTypes.func,
    onChangeIsConvert: PropTypes.func
}