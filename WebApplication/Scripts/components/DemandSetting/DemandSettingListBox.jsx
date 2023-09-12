'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { Grid, Row, Col } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Box from 'Common/Layout/Box';

import SearchResultTable from 'Assets/SearchResultTable';

import { FUNCTION_ID_MAP, LAVEL_TYPE } from 'authentication';
import { BUTTON_OPERATION_TYPE } from 'constant';

export default class DemandSettingListBox extends Component {

    constructor() {
        super();
        this.state = {
            
        };
    }


    /**
     * ホバーボタンクリック時
     * @param {any} hoverButton
     */
    onHoverButtonClicked(hoverButton) {
        if (hoverButton) {
            if (hoverButton.operationType === 1) {  // 編集
                this.onEditClicked([hoverButton.parameterKeyPairs]);
            } else if (hoverButton.operationType === 2) {   //削除
                this.onDeleteClicked([hoverButton.parameterKeyPairs]);
            }
        }
    }

    /**
     * 編集ボタンクリック時
     * @param {any} parameterKeyPairsList
     */
    onEditClicked(parameterKeyPairsList) {
        const ids = this.getLocationIdsFromParameterKeyPairsList(parameterKeyPairsList);

        if (this.props.onEditClick) {
            this.props.onEditClick(ids);
        }
    }

    /**
     * 削除ボタンクリック時
     * @param {any} parameterKeyPairsList
     */
    onDeleteClicked(parameterKeyPairsList) {
        const ids = this.getLocationIdsFromParameterKeyPairsList(parameterKeyPairsList);

        if (this.props.onDeleteClick) {
            this.props.onDeleteClick(ids);
        }
    }

    /**
     * 追加ボタンクリック時
     */
    onAddClicked() {
        if (this.props.onAddClick) {
            this.props.onAddClick();
        }
    }

    /**
     * ParameterKeyPairsのリストからLocationIdのリストを取得する
     * @param {any} list
     */
    getLocationIdsFromParameterKeyPairsList(list) {
        return list.map((pairs) => {
            const target = pairs.find((pair) => pair.paramater === "LocationId");
            return parseInt(target.key);
        });
    }

    /**
     * render
     */
    render() {
        const { isLoading, demandSetResult, tableSetting, onTableSettingChange, isReadOnly, level } = this.props;

        const buttonReadOnly = {};
        buttonReadOnly[BUTTON_OPERATION_TYPE.add] = !(level === LAVEL_TYPE.administrator);
        buttonReadOnly[BUTTON_OPERATION_TYPE.delete] = !(level === LAVEL_TYPE.administrator);

        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>デマンド設定一覧</Box.Title>
                </Box.Header >
                <Box.Body>
                    {(demandSetResult) &&
                        <Grid fluid>
                            <Row>
                                <Col md={12}>
                                    <SearchResultTable useCheckbox deleteButton exportButton columnSettingButton
                                        className="mtb-1"
                                        searchResult={demandSetResult}
                                        initialState={tableSetting}
                                        onStateChange={(state) => onTableSettingChange(state)}
                                        onHoverButtonClick={(button) => this.onHoverButtonClicked(button)}
                                        onEditClick={(v) => this.onEditClicked(v)}
                                        onDeleteClick={(v) => this.onDeleteClicked(v)}
                                        onAddClick={() => this.onAddClicked()}
                                        isReadOnly={isReadOnly}
                                        buttonHidden={buttonReadOnly}
                                        exportName="DemandSetListExport"
                                        functionId={FUNCTION_ID_MAP.demandSettingMaintenance}
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