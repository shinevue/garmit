'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { browserHistory } from 'react-router';

import PropTypes from 'prop-types';

import { Grid, Row, Col, ButtonToolbar } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Box from 'Common/Layout/Box';

import SearchResultTable from 'Assets/SearchResultTable';

import { FUNCTION_ID_MAP, LAVEL_TYPE } from 'authentication';
import { BUTTON_OPERATION_TYPE } from 'constant';

export default class ConsumerListBox extends Component {

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
        const ids = this.getConsumerIdsFromParameterKeyPairsList(parameterKeyPairsList);

        if (this.props.onEditClick) {
            this.props.onEditClick(ids);
        }
    }

    /**
     * 削除ボタンクリック時
     * @param {any} parameterKeyPairsList
     */
    onDeleteClicked(parameterKeyPairsList) {
        const ids = this.getConsumerIdsFromParameterKeyPairsList(parameterKeyPairsList);

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
     * ParameterKeyPairsのリストからコンシューマーIDのリストを取得する
     * @param {any} list
     */
    getConsumerIdsFromParameterKeyPairsList(list) {
        return list.map((pairs) => {
            const target = pairs.find((pair) => pair.paramater === "ConsumerId");
            return target.key;
        });
    }

    /**
     * render
     */
    render() {
        const { isLoading, consumerResult, tableSetting, onTableSettingChange, isReadOnly, level } = this.props;

        const buttonHidden = {};
        buttonHidden[BUTTON_OPERATION_TYPE.add] = level === LAVEL_TYPE.operator || level === LAVEL_TYPE.normal;
        buttonHidden[BUTTON_OPERATION_TYPE.delete] = level === LAVEL_TYPE.operator || level === LAVEL_TYPE.normal;
        buttonHidden[BUTTON_OPERATION_TYPE.edit] = level === LAVEL_TYPE.normal;

        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>コンシューマー一覧</Box.Title>
                </Box.Header >
                <Box.Body>
                    {(consumerResult) &&
                        <Grid fluid>
                            <Row className="">
                                <Col md={12}>
                                    <SearchResultTable useCheckbox deleteButton editButton exportButton columnSettingButton
                                        className="mtb-1"
                                        searchResult={consumerResult}
                                        initialState={tableSetting}
                                        onStateChange={(state) => onTableSettingChange(state)}
                                        onHoverButtonClick={(button) => this.onHoverButtonClicked(button)}
                                        onEditClick={(v) => this.onEditClicked(v)}
                                        onDeleteClick={(v) => this.onDeleteClicked(v)}
                                        onAddClick={() => this.onAddClicked()}
                                        isReadOnly={isReadOnly}
                                        buttonHidden={buttonHidden}
                                        exportName="ConsumerListExport"
                                        functionId={FUNCTION_ID_MAP.consumer}
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