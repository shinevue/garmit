'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { Grid, Row, Col, ButtonToolbar } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Box from 'Common/Layout/Box';

import SearchResultTable from 'Assets/SearchResultTable';

import { FUNCTION_ID_MAP } from 'authentication';
import { BUTTON_OPERATION_TYPE } from 'constant';
 
export default class DeviceListBox extends Component {

    constructor() {
        super();
        this.state = {
            
        };
    }

    /**
     * ホバーボタンがクリックされた時
     * @param {any} hoverButton
     */
    onHoverButtonClick(hoverButton) {
        if (hoverButton) {
            if (hoverButton.operationType === BUTTON_OPERATION_TYPE.edit) {  // 編集
                if (this.props.onEditClick) {
                    const gateId = this.getGateId(hoverButton.parameterKeyPairs);
                    this.props.onEditClick(gateId);
                }
            }
            if (hoverButton.operationType === BUTTON_OPERATION_TYPE.gateStatus) {
                if (this.props.onShowGateStatusClick) {
                    const gateId = this.getGateId(hoverButton.parameterKeyPairs);
                    this.props.onShowGateStatusClick(gateId);
                }
            }
        }
    }

    /**
     * ParameterKeyPairsからgateIdを取得する
     * @param {any} parameterKeyPairs
     */
    getGateId(parameterKeyPairs) {
        const target = parameterKeyPairs.find((pair) => pair.paramater === "GateId");
        return target.key;
    }

    /**
     * render
     */
    render() {
        const { isLoading, isReadOnly, datagateResult, displayState, onDisplayStateChange, onColumnSettingChange, selectedGateId } = this.props;

        const buttonHidden = {};
        if (isReadOnly) {
            buttonHidden[BUTTON_OPERATION_TYPE.edit] = true;
        }

        const displaySearchResult = Object.assign({}, datagateResult);
        if (displaySearchResult && displaySearchResult.rows) {
            displaySearchResult.rows = displaySearchResult.rows.slice();
            const selectedIndex = displaySearchResult.rows.findIndex((row) =>
                row.parameterKeyPairs && row.parameterKeyPairs.some((pair) => pair.paramater == "GateId" && pair.key == selectedGateId)
            );
            displaySearchResult.rows[selectedIndex] = Object.assign({}, displaySearchResult.rows[selectedIndex], { className: 'datatable-select-row' });

        }
        
        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>機器一覧</Box.Title>
                </Box.Header >
                <Box.Body>
                    {(datagateResult) ?
                        <Grid fluid>
                            <Row>
                                <Col md={12}>
                                    <SearchResultTable exportButton columnSettingButton striped={false}
                                        buttonHidden={buttonHidden}
                                        searchResult={displaySearchResult}
                                        initialState={displayState}
                                        onStateChange={(state) => onDisplayStateChange(state)}
                                        onHoverButtonClick={(button) => this.onHoverButtonClick(button)}
                                        exportName="DatagateList"
                                        functionId={FUNCTION_ID_MAP.gateEdit}
                                        onColumnSettingChange={() => onColumnSettingChange()}
                                        includeDateExportName={true}
                                    />
                                </Col>
                            </Row>
                        </Grid>
                        :
                        <div>表示可能な機器がありません</div>
                    }
                </Box.Body>
            </Box>
        );
    }
}