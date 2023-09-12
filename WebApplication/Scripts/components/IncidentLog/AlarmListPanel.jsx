'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { Grid, Row, Col, ButtonToolbar, Panel } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';

import SearchResultTable from 'Assets/SearchResultTable';

import { FUNCTION_ID_MAP, LAVEL_TYPE } from 'authentication';　　
import { BUTTON_OPERATION_TYPE } from 'constant';

export default class AlarmListPanel extends Component {

    constructor() {
        super();
        this.state = {
            onlyOccuringAlarm: true,
            onlyUnconfirmedAlarm: false
        };
    }

    /**
     * ホバーボタンクリック時
     * @param {any} hoverButton
     */
    onHoverButtonClick(hoverButton) {
        if (hoverButton) {
            if (hoverButton.operationType === BUTTON_OPERATION_TYPE.graphDisp) {        // トレンドグラフ表示
                const graphInfo = this.getGraphInfo(hoverButton.parameterKeyPairs);
                this.props.onGraphDispClick(graphInfo);
            } else if (hoverButton.operationType === BUTTON_OPERATION_TYPE.confirm) {   // 確認
                const alarmId = this.getAlarmId(hoverButton.parameterKeyPairs);
                this.props.onConfirmClick([alarmId]);
            } else if (hoverButton.operationType === BUTTON_OPERATION_TYPE.delete) {    //削除
                const alarmId = this.getAlarmId(hoverButton.parameterKeyPairs);
                this.props.onDeleteClick([alarmId]);
            }
        }
    }

    /**
     * 削除ボタンクリック時
     * @param {any} parameterKeyPairsList
     */
    onDeleteClick(parameterKeyPairsList) {
        const ids = this.getAlarmIdList(parameterKeyPairsList);
        if (this.props.onDeleteClick) {
            this.props.onDeleteClick(ids);
        }
    }

    /**
     * 確認ボタンクリック時
     * @param {any} parameterKeyPairsList
     */
    onConfirmClick(parameterKeyPairsList) {
        const ids = this.getAlarmIdList(parameterKeyPairsList);
        if (this.props.onConfirmClick) {
            this.props.onConfirmClick(ids);
        }
    }

    /**
     * parameterKeyPairsからアラームIDを取得する
     * @param {any} parameterKeyPairs
     */
    getAlarmId(parameterKeyPairs) {
        const target = parameterKeyPairs.find((pair) => pair.paramater === 'AlarmId');
        return target.key;
    }

    /**
     * parameterKeyPairsのリストからアラームIDのリストを取得する
     * @param {any} parameterKeyPairsList
     */
    getAlarmIdList(parameterKeyPairsList) {
        return parameterKeyPairsList.map((pairs) => this.getAlarmId(pairs));
    }

    /**
     * parameterKeyPairsからグラフ表示に必要な情報を取得する
     * @param {any} parameterKeyPairs
     */
    getGraphInfo(parameterKeyPairs) {
        const info = {};
        const target = parameterKeyPairs.forEach((pair) => {
            switch (pair.paramater) {
                case 'PointNo':
                    info.pointNo = parseInt(pair.key);
                    break;

                case 'StartDate':
                    info.startDate = new Date(pair.key);
                    break;

                case 'EndDate':
                    info.endDate = new Date(pair.key);
                    break;

                default:
                    break;
            }
        });
        
        return info;
    }

    /**
     * 絞り込みしたアラーム一覧を取得する
     */
    getFilteredAlarmResult() {
        const { alarmResult } = this.props;
        const { onlyOccuringAlarm, onlyUnconfirmedAlarm } = this.state;

        if (!alarmResult) {
            return alarmResult;
        }

        const filteredAlarmResult = Object.assign({}, alarmResult);
        filteredAlarmResult.rows = filteredAlarmResult.rows.filter((row) => {
            if (onlyOccuringAlarm) {
                if (row.alarmCssClassName == "") {
                    return false;
                }
            }
            if (onlyUnconfirmedAlarm) {
                if (row.isConfirmedAlarm) {
                    return false;
                }
            }
            return true;
        });

        return filteredAlarmResult;
    }

    /*
     *出力ファイルの名称を生成する 
     */
    createExportFileName() {
        let exportName = 'AlarmLog';
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

    /**
     * render
     */
    render() {
        const { alarmResult, isReadOnly, level, tableSetting, onTableSettingChange, searchOccuringAlarm } = this.props;
        const { onlyOccuringAlarm, onlyUnconfirmedAlarm } = this.state;

        const buttonHidden = {};
        buttonHidden[BUTTON_OPERATION_TYPE.confirm] = level === LAVEL_TYPE.normal;
        buttonHidden[BUTTON_OPERATION_TYPE.delete] = level === LAVEL_TYPE.normal || level === LAVEL_TYPE.operator;

        const filteredAlarmResult = this.getFilteredAlarmResult();

        return (
            <Panel header="アラーム" collapsible defaultExpanded>
                {filteredAlarmResult ?
                    <Grid fluid>
                        <Row>
                            <span>
                                {!searchOccuringAlarm &&
                                    <span className="mr-05">
                                        <CheckboxSwitch
                                            text="発生中のみ"
                                            bsSize="xs"
                                            checked={onlyOccuringAlarm}
                                            onChange={(checked) => this.setState({ onlyOccuringAlarm: checked })}
                                        />
                                    </span>
                                }
                                <span>
                                    <CheckboxSwitch
                                        text="未確認のみ"
                                        bsSize="xs"
                                        checked={onlyUnconfirmedAlarm}
                                        onChange={(checked) => this.setState({ onlyUnconfirmedAlarm: checked })}
                                    />
                                </span>
                            </span>  
                        </Row>
                        <Row>
                            <Col sm={12}>
                                <SearchResultTable deleteButton confirmButton exportButton columnSettingButton useCheckbox useHotKeys
                                    striped={false}
                                    isReadOnly={isReadOnly}
                                    buttonHidden={buttonHidden}
                                    className="mtb-1"
                                    searchResult={filteredAlarmResult}
                                    initialState={tableSetting}
                                    onStateChange={(state) => onTableSettingChange(state)}
                                    onDeleteClick={(v) => this.onDeleteClick(v)}
                                    onConfirmClick={(v) => this.onConfirmClick(v)}
                                    onHoverButtonClick={(button) => this.onHoverButtonClick(button)}
                                    exportName={this.createExportFileName()}
                                    functionId={FUNCTION_ID_MAP.incidentLog}
                                    gridNo={1}
                                    onColumnSettingChange={() => this.props.onColumnSettingChange()}
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