'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { Panel, Grid, Row, Col, ButtonToolbar } from 'react-bootstrap';

import Button from 'Common/Widget/Button';

import SearchResultTable from 'Assets/SearchResultTable';
import DisplayColumnSettingModal from 'Assets/Modal/DisplayColumnSettingModal';

import { outputSearchResult } from 'exportUtility';
import { FUNCTION_ID_MAP } from 'authentication';

export default class ContactLogPanel extends Component {

    constructor() {
        super();
        this.state = {

        };
    }

    /*
     *出力ファイルの名称を生成する 
     */
    createExportFileName() {
        let exportName = 'ContactChangeLog';
        if (this.props.lastSearchCondition) {
            const { occurringAlarmSearch, startDate, endDate } = this.props.lastSearchCondition;
            if (occurringAlarmSearch) {
                exportName += '_' + moment().format('YYYYMMDDHHmmss');
            } else {
                exportName += '_' + moment(startDate).format('YYYYMMDDHHmm') + '-' + moment(endDate).format('YYYYMMDDHHmm');
            }
        }
        return exportName;
    }

    render() {
        const { contactChangeResult, isReadOnly, tableSetting, onTableSettingChange } = this.props;

        return (
            <Panel header="接点状態変化" collapsible defaultExpanded>
                {contactChangeResult ?
                    <Grid fluid>
                        <Row>
                            <Col md={12}>
                                <SearchResultTable exportButton columnSettingButton
                                    className="mtb-1"
                                    searchResult={contactChangeResult}
                                    exportName={this.createExportFileName()}
                                    functionId={FUNCTION_ID_MAP.incidentLog}
                                    gridNo={2}
                                    onColumnSettingChange={() => this.props.onColumnSettingChange()}
                                    initialState={tableSetting}
                                    onStateChange={(state) => onTableSettingChange(state)}
                                />
                            </Col>
                        </Row>
                    </Grid>
                    :
                    <span>表示するデータがありません</span>
                }
            </Panel>
        );
    }
}