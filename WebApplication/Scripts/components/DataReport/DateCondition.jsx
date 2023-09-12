/**
 * Copyright 2017 DENSO Solutions
 * 
 * 出力日時条件フォーム Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col } from 'react-bootstrap';
import SelectForm from 'Common/Form/SelectForm';
import DateTimeForm from 'Common/Form/DateTimeForm';
import DateTimeSpanForm from 'Common/Form/DateTimeSpanForm';

export default class DateCondition extends Component {

    constructor(props) {
        super(props)
        this.state = {

        }
    }   

    //#region イベントハンドラ
    /**
     * 期間変更イベント
     */
    handleChangePeriod(from, to) {
        this.changeDate(from, to, true);
    }

    /**
     * 日時変更イベント
     */
    handleChangeDate(date) {
        this.changeDate(date, null, false);
    }    

    /**
     * レポート出力種別更イベント
     */
    handleChangeReportType(type) {
        if (this.props.onChangeReportType) {
            this.props.onChangeReportType(type, this.getFormat(type));
        }
    }

    //#endregion

    /**
     * render
     */
    render() {
        const { reportType, reportTypeOptions, startDate, endDate, format, validationInfo, isPeriod, viewMode } = this.props;

        return (
            <Row>
                <Col md={3} sm={4}>
                    <SelectForm
                        value={reportType}
                        isRequired={true}
                        options={reportTypeOptions}
                        onChange={(type) => this.handleChangeReportType(type)} />
                </Col>
                {isPeriod ?
                    <DateTimeSpanForm
                        from={startDate}
                        fromMax={null}
                        to={endDate}
                        toMin={null}
                        format={format}
                        timePicker={true}
                        validationFrom={validationInfo.from}
                        validationTo={validationInfo.to}
                        onChange={(from, to) => this.handleChangePeriod(from, to)}
                    />
                    :
                    <DateTimeForm
                        value={startDate}
                        format={format}
                        timePicker={false}
                        viewMode={viewMode}
                        validationState={validationInfo.from && validationInfo.from.state}
                        helpText={validationInfo.from && validationInfo.from.helpText}
                        onChange={(date) => this.handleChangeDate(date)}
                    />
                }
            </Row>
        )
    }

    //#region　その他関数
    /**
     * 日付けの変更を親に伝える
     * @param {bool} showEnd 終了日時選択フォームを表示するかどうか
     */
    changeDate(from, to, showEnd) {
        if (this.props.onChangeDate) {
            this.props.onChangeDate(from, to, showEnd);
        }       
    }

     /**
     * フォーマットを取得する
     */
    getFormat(reportType) {
        const matchOptions = this.props.reportTypeOptions.find((option) => {
            return (option.value === reportType);
        });
        return matchOptions.format;
    }    
    //#endregion
}

DateCondition.propTypes = {
    reportType: PropTypes.string,
    reportTypeOptions: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string,
            name: PropTypes.string
        })
    ),
    startDate: PropTypes.object,
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    format: PropTypes.string,
    validationInfo: PropTypes.shape({
        from: PropTypes.shape({
            state: PropTypes.string,
            helpText:PropTypes.sgring
        }),
        to: PropTypes.shape({
            state: PropTypes.string,
            helpText: PropTypes.sgring
        })
    }),
    isPeriod: PropTypes.bool,
    viewMode: PropTypes.oneOf(['years', 'months', 'days', 'time']),
    onChangeReportType: PropTypes.func,
    onChangePeriod: PropTypes.func,
    onChangeDate: PropTypes.func
}