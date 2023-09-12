'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { Grid, Row, Col, ButtonToolbar } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Box from 'Common/Layout/Box';

import SearchResultTable from 'Assets/SearchResultTable';

import { FUNCTION_ID_MAP } from 'authentication';

export default class OperationLogBox extends Component {

    constructor() {
        super();
        this.state = {

        };
    }

    /**
     * 出力ファイルの名称を生成する
     */
    createExportName() {
        const { dateFrom, dateTo } = this.props;
        let exportName = 'OperationLog';
        if (dateFrom && dateTo) {
            exportName += '_' + moment(dateFrom).format('YYYYMMDDHHmm') + '-' + moment(dateTo).format('YYYYMMDDHHmm');
        }
        return exportName;
    }

    /**
     * render
     */
    render() {
        const { operationLogResult, isLoading, isReadOnly } = this.props;

        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>オペレーションログ</Box.Title>
                </Box.Header >
                <Box.Body>
                    {operationLogResult &&
                        <Grid fluid>
                            <Row className="">
                                <Col md={12}>
                                    <SearchResultTable exportButton columnSettingButton useHotKeys
                                        searchResult={operationLogResult}
                                        useCheckbox={false}
                                        className="mtb-05"
                                        exportName={this.createExportName()}
                                        functionId={FUNCTION_ID_MAP.operationLog}
                                        onColumnSettingChange={() => this.props.onColumnSettingChange()}
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