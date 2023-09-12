'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Grid, Row, Col, Checkbox, ButtonToolbar } from 'react-bootstrap'; 

import Box from 'Common/Layout/Box';
import ToggleSwitch from 'Common/Widget/ToggleSwitch';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';

import AutoUpdateButtonGroup from 'Assets/AutoUpdateButtonGroup';

import RealTimeDataPanel from 'RealTimeMonitor/RealTimeDataPanel';

export default class RealTimeMonitorBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            statistic: false,
        };
    }

    render() {
        const { currentData, lastData, isLoading, dataTypes, updateInterval, isConvert } = this.props;
        const { statistic } = this.state;

        return (
            <div>
                <Box boxStyle='default' isLoading={isLoading}>
                    <Box.Header>
                        <Box.Title>モニタリングデータ</Box.Title>
                    </Box.Header>
                    <Box.Body>
                        {currentData &&
                            <Grid fluid>
                                <Row>
                                    <Col sm={12}>
                                        <div className="pull-right">
                                            <AutoUpdateButtonGroup
                                                value={updateInterval}
                                                onChange={(val) => this.props.onUpdateIntervalChange(val)}
                                                onManualUpdateClick={() => this.props.onManualUpdateClick()}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                                <Row className="mb-1">
                                    <Col sm={12}>
                                        <ButtonToolbar className="pull-left">
                                            <CheckboxSwitch
                                                text="換算表示"
                                                bsSize="xs"
                                                checked={isConvert}
                                                onChange={(checked) => this.props.onIsConvertChange(checked)}
                                            />
                                            <ToggleSwitch
                                                value={statistic}
                                                bsSize="xs"
                                                name="statistic"
                                                swichValues={[{ value: false, text: '簡易' }, { value: true, text: '詳細' }]}
                                                onChange={(val) => this.setState({ statistic: val })}
                                            />
                                        </ButtonToolbar>
                                    </Col>
                                </Row>
                                    <Row>
                                        <Col sm={12}>
                                            <RealTimeDataPanel
                                                header="アナログデータ"
                                                currentData={currentData.analogValueDatas}
                                                lastData={(lastData && lastData.analogValueDatas) || []}
                                                dataTypes={dataTypes && dataTypes.filter((type) => !type.isContact)}
                                                statistic={statistic}
                                                onThresholdChange={() => this.props.onManualUpdateClick()}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={12}>
                                            <RealTimeDataPanel
                                                header="接点データ"
                                                currentData={currentData.bitValueDatas}
                                                lastData={(lastData && lastData.bitValueDatas) || []}
                                                dataTypes={dataTypes && dataTypes.filter((type) => type.isContact)}
                                                statistic={statistic}
                                                onThresholdChange={() => this.props.onManualUpdateClick()}
                                            />
                                        </Col>
                                    </Row>
                            </Grid>
                        }
                    </Box.Body>
                </Box>
            </div>
        );
    }
}