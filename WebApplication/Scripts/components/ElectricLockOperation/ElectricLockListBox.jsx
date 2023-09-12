/**
 * @license Copyright 2021 DENSO
 * 
 * ElectricLockListBox Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import Box from 'Common/Layout/Box';

import SearchResultTable from 'Assets/SearchResultTable';
import AutoUpdateButtonGroup from 'Assets/AutoUpdateButtonGroup';

import { FUNCTION_ID_MAP, LAVEL_TYPE } from 'authentication';
import { BUTTON_OPERATION_TYPE } from 'constant';

export default class ElectricLockListBox extends Component {

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
            const locationId = this.getLocationId(hoverButton.parameterKeyPairs);
            const isTargetBoth = this.getIsEkeyTargetBoth(hoverButton.parameterKeyPairs) || this.getIsPhysicalKey(hoverButton.parameterKeyPairs);
            if (hoverButton.operationType === BUTTON_OPERATION_TYPE.lock) {             //施錠
                this.props.onLockClick([locationId], isTargetBoth);
            } else if (hoverButton.operationType === BUTTON_OPERATION_TYPE.unlock) {    //開錠
                this.props.onUnlockClick([locationId], isTargetBoth);
            }
        }
    }

    /**
     * 施錠ボタンがクリックされた時
     * @param {any} parameterKeyPairsList
     */
    onLockClick(parameterKeyPairsList) {
        const locationIds = this.getLocationIds(parameterKeyPairsList);
        const onlyTargetBoth = !this.getIsOnlyTargetBothList(parameterKeyPairsList).some((isTargetBoth) => !isTargetBoth);
        this.props.onLockClick(locationIds, onlyTargetBoth);
    }

    /**
     * 開錠ボタンがクリックされた時
     * @param {any} parameterKeyPairsList
     */
    onUnlockClick(parameterKeyPairsList) {
        const locationIds = this.getLocationIds(parameterKeyPairsList);
        const onlyTargetBoth = !this.getIsOnlyTargetBothList(parameterKeyPairsList).some((isTargetBoth) => !isTargetBoth);
        this.props.onUnlockClick(locationIds, onlyTargetBoth);
    }

    /**
     * ParameterKeyPairsからLocationIdを取得する
     * @param {any} parameterKeyPairs
     */
    getLocationId(parameterKeyPairs) {
        const target = parameterKeyPairs.find((pair) => pair.key === "LocationId");
        return parseInt(target.paramater);
    }

    /**
     * ParameterKeyPairsのリストからLocationIdのリストを取得する
     * @param {any} parameterKeyPairsList
     */
    getLocationIds(parameterKeyPairsList) {
        return parameterKeyPairsList.map((pairs) => this.getLocationId(pairs));
    }

    /**
     * ParameterKeyPairsからIsEkeyTargetBothを取得する
     * @param {any} parameterKeyPairs
     */
    getIsEkeyTargetBoth(parameterKeyPairs) {
        const target = parameterKeyPairs.find((pair) => pair.key === "IsEkeyTargetBoth");
        return target.paramater == "1";
    }

    /**
     * ParameterKeyPairsからIsPhysicalKeyを取得する
     * @param {any} parameterKeyPairs
     */
    getIsPhysicalKey(parameterKeyPairs) {
        const target = parameterKeyPairs.find((pair) => pair.key === "IsPhysicalKey");
        return target.paramater == "1";
    }

    /**
     * 前面/背面別操作ラック以外かどうかのリストを取得する
     * @param {any} parameterKeyPairsList
     */
    getIsOnlyTargetBothList(parameterKeyPairsList) {
        return parameterKeyPairsList.map((pairs) => this.getIsEkeyTargetBoth(pairs) || this.getIsPhysicalKey(pairs));
    }

    /**
     * render
     */
    render() {
        const { isLoading, searchResult, tableSetting, onTableSettingChange, isReadOnly, level } = this.props;

        const buttonReadOnly = {};
        buttonReadOnly[BUTTON_OPERATION_TYPE.lock] = level === LAVEL_TYPE.normal;
        buttonReadOnly[BUTTON_OPERATION_TYPE.unlock] = level === LAVEL_TYPE.normal;

        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>ラック一覧</Box.Title>
                </Box.Header >
                <Box.Body>
                    {(searchResult) &&
                        <Grid fluid>
                            <Row>
                                <Col sm={12} className="ta-r">
                                    <AutoUpdateButtonGroup
                                        onlyManual
                                        onManualUpdateClick={() => this.props.onUpdateClick()}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md={12}>
                                    <SearchResultTable useCheckbox exportButton columnSettingButton lockButton unlockButton
                                        className="mtb-1"
                                        isReadOnly={isReadOnly}
                                        searchResult={searchResult}
                                        initialState={tableSetting}
                                        onStateChange={(state) => onTableSettingChange(state)}
                                        onHoverButtonClick={(button) => this.onHoverButtonClicked(button)}
                                        onLockClick={(pks) => this.onLockClick(pks)}
                                        onUnlockClick={(pks) => this.onUnlockClick(pks)}
                                        buttonHidden={buttonReadOnly}
                                        exportName="ElectricLockListExport"
                                        functionId={FUNCTION_ID_MAP.elecKey}
                                        onColumnSettingChange={() => this.props.onColumnSettingChange()}
                                        includeDateExportName={true}
                                        maxLineCount={2}
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