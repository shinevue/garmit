/**
 * @license Copyright 2020 DENSO
 *
 * 電気錠ログ検索結果ボックス Reactコンポーネント
 *
 */

'use strict';

import React, { Component } from 'react';

import { Grid, Row, Col } from 'react-bootstrap';

import Box from 'Common/Layout/Box';

import SearchResultTable from 'Assets/SearchResultTable';

import { FUNCTION_ID_MAP } from 'authentication';

export default class ELockOpLogBox extends Component {

    constructor() {
        super();
        this.state = {

        };
    }

    /**
     * render
     */
    render() {
        const { eLockOpLogResult, isLoading, isReadOnly } = this.props;
        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>電気錠ログ</Box.Title>
                </Box.Header >
                <Box.Body>
                    {eLockOpLogResult &&
                        <Grid fluid>
                            <Row className="">
                                <Col md={12}>
                                    <SearchResultTable exportButton columnSettingButton
                                        searchResult={eLockOpLogResult}
                                        useCheckbox={false}
                                        className="mtb-05"
                                        exportName="ELockOperationLog"
                                        includeDateExportName={true}
                                        functionId={FUNCTION_ID_MAP.eLockOpLog}
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