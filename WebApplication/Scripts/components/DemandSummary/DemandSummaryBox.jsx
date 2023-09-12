'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { Grid, Row, Col } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import Button from 'Common/Widget/Button';

import DemandSummaryTable from 'DemandSummary/DemandSummaryTable';

import { outputSearchResult } from 'exportUtility';
import { DISPLAY_TIME_SPANS } from 'constant';

export default class DemandSummaryBox extends Component {

    constructor() {
        super();
        this.state = {
            
        };
    }

    /**
     * 開始日時を取得する
     * @param {any} parameterKeyPairs
     */
    getStartDate(parameterKeyPairs) {
        const pair = parameterKeyPairs.find((pair) => pair.key === "StartDate");
        return new Date(pair.paramater);
    }

    /**
     * セルのリンクがクリックされた時
     * @param {any} parameterKeyPairs
     */
    onCellLinkClick(parameterKeyPairs) {
        const startDate = this.getStartDate(parameterKeyPairs);
        this.props.onCellLinkClick(startDate);
    }

    /**
     * 出力ファイル名を生成する
     */
    makeExportName() {
        const format = this.getDateFormat();
        const dateString = moment(this.props.startDate).format(format);

        return 'DemandSummayList_' + dateString;
    }

    /**
     * 日付フォーマットを取得する
     */
    getDateFormat() {
        const { displayTimeSpanId } = this.props;

        switch (displayTimeSpanId) {
            case DISPLAY_TIME_SPANS.day_byHalfAnHour:
            case DISPLAY_TIME_SPANS.day_byHour:
                return 'YYYYMMDD';

            case DISPLAY_TIME_SPANS.month:
                return 'YYYYMM';

            case DISPLAY_TIME_SPANS.year:
                return 'YYYY';
        }        
    }

    /**
     * render
     */
    render() {
        const { isLoading, demandSummaryResult } = this.props;

        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>デマンドサマリ</Box.Title>
                </Box.Header >
                <Box.Body>
                    {(demandSummaryResult) &&
                        <Grid fluid>
                            <Row>
                                <Col sm={12}>
                                    <div className="pull-right">
                                        <Button
                                            iconId="report-output"
                                            onClick={() => outputSearchResult(demandSummaryResult, this.makeExportName())}
                                        >
                                            レポート出力
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={12}>
                                    <DemandSummaryTable
                                        demandSummaryResult={demandSummaryResult}
                                        onCellLinkClick={(parameterKeyPairs) => this.onCellLinkClick(parameterKeyPairs)}
                                    />
                                </Col>
                            </Row>
                        </Grid>
                    }
                </Box.Body>
            </Box>
        );
    }
}