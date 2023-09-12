'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { Grid, Row, Col, ButtonToolbar, Form, FormControl, FormGroup, Checkbox, OverlayTrigger, Tooltip } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Box from 'Common/Layout/Box';

import SearchResultTable from 'Assets/SearchResultTable';

import { FUNCTION_ID_MAP, LAVEL_TYPE } from 'authentication';
import { BUTTON_OPERATION_TYPE } from 'constant';

export default class EnterpriseListBox extends Component {

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
        const ids = this.getIdsFromParameterKeyPairsList(parameterKeyPairsList);

        if (this.props.onEditClick) {
            this.props.onEditClick(ids);
        }
    }

    /**
     * 削除ボタンクリック時
     * @param {any} parameterKeyPairsList
     */
    onDeleteClicked(parameterKeyPairsList) {
        const ids = this.getIdsFromParameterKeyPairsList(parameterKeyPairsList);

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
     * ParameterKeyPairsのリストから所属IDのリストを取得する
     * @param {any} list
     */
    getIdsFromParameterKeyPairsList(list) {
        return list.map((pairs) => {
            const target = pairs.find((pair) => pair.paramater === 'EnterpriseId');
            return target.key;
        });
    }

    render() {
        const { isLoading, enterpriseResult, tableSetting, onTableSettingChange, isReadOnly, level } = this.props;

        const buttonHidden = {};
        buttonHidden[BUTTON_OPERATION_TYPE.add] = !(level === LAVEL_TYPE.administrator || level === LAVEL_TYPE.manager);
        buttonHidden[BUTTON_OPERATION_TYPE.delete] = !(level === LAVEL_TYPE.administrator || level === LAVEL_TYPE.manager);

        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>所属一覧</Box.Title>
                </Box.Header >
                <Box.Body>
                    {(enterpriseResult) &&
                        <Grid fluid>
                            <Row className="">
                                <Col md={12}>
                                    <SearchResultTable editButton deleteButton useCheckbox exportButton columnSettingButton useHotKeys
                                        className="mtb-1"
                                        searchResult={enterpriseResult}
                                        initialState={tableSetting}
                                        onStateChange={(state) => onTableSettingChange(state)}
                                        onHoverButtonClick={(button) => this.onHoverButtonClicked(button)}
                                        onEditClick={(v) => this.onEditClicked(v)}
                                        onDeleteClick={(v) => this.onDeleteClicked(v)}
                                        onAddClick={() => this.onAddClicked()}
                                        isReadOnly={isReadOnly}
                                        buttonHidden={buttonHidden}
                                        exportName="EnterpriseList"
                                        functionId={FUNCTION_ID_MAP.enterpriseEdit}
                                        onColumnSettingChange={() => this.props.onColumnSettingChange()}
                                        includeDateExportName={true}
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