'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col, ButtonToolbar, Form, Panel } from 'react-bootstrap';

import PropTypes from 'prop-types';

import DemandGraph from 'Assets/DemandGraph/DemandGraph';
import AutoUpdateButtonGroup from 'Assets/AutoUpdateButtonGroup';
import Box from 'Common/Layout/Box';
import ToggleSwitch from 'Common/Widget/ToggleSwitch';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';
import Button from 'Common/Widget/Button';
import MultiSelectForm from 'Common/Form/MultiSelectForm';

import { MEASURED_DATA_TYPE, DISPLAY_TIME_SPANS } from 'constant';
import { outputCSVFile } from 'exportUtility';
import { getXInterval } from 'demandViewUtility';

export default class DemandGraphBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataTypes: [],
            selected: []
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.demandGraph) {
            if (!this.props.demandGraph || JSON.stringify(this.props.demandGraph.demandGraphDataTypes) !== JSON.stringify(nextProps.demandGraph.demandGraphDataTypes)) {
                this.setState({ dataTypes: nextProps.demandGraph.demandGraphDataTypes });
            }
        } else {
            this.setState({ dataTypes: [] });
        }
    }

    /**
     * デマンドグラフモードが変更された時
     * @param {any} val
     */
    onChangeDemandGraphMode(val) {
        if (val != this.props.demandGraphMode) {
            this.props.onChangeDemandGraphMode(val);
        }
    }

    /**
     * デマンドグラフ種別が変更された時
     * @param {any} val
     */
    onChangeDisplayGraphType(val) {
        if (val != this.props.displayGraphType) {
            this.props.onChangeDisplayGraphType(val);
        }
    }

    /**
     * レポート出力ボタンがクリックされた時
     */
    onReportOutputClick() {
        const { measuredDataType, demandGraph, displayTimeSpanId } = this.props;
        const { selected } = this.state;
        const seriesList = [].concat.apply([], demandGraph.graphParameters.map((g, i) => g.seriesList.filter((s) => !s.isOutputExcluded && (!selected[i] || selected[i][s.name] !== false))));
        const allXValues = [].concat.apply([], seriesList.map((s) => s.plotList.map((p) => p.xValue))).sort((x1, x2) => moment(x1).diff(moment(x2)));
        const xMin = moment(allXValues[0]);
        const xMax = moment(allXValues[allXValues.length - 1]);
        const interval = getXInterval(displayTimeSpanId);
        const rows = [['日時', ...seriesList.map((s) => s.name)]];
        const format = this.getFormatString();
        for (let x = moment(xMin); x <= xMax; x = x.add(interval.value, interval.key)) {
            rows.push([x.format(format), ...seriesList.map((s) => {
                const plot = s.plotList.find((p) => moment(p.xValue).isSame(x));
                return (plot && plot.yValue != null) ? plot.yValue.toString() : '';
            })]);
        }
        outputCSVFile(rows, this.createFileName(measuredDataType, xMin, xMax));
    }

    /**
     * データ種別を変更する
     * @param {any} types
     */
    onDataTypesChange(types) {
        this.setState({ dataTypes: types });
    }

    /**
     * 凡例の選択状態が変化したとき
     * @param {any} selected
     * @param {any} index
     */
    onLegendSelectChanged(selected, index) {
        const newSelected = Object.assign({}, this.state.selected);
        newSelected[index] = selected;
        this.setState({ selected: newSelected });
    }

    /**
     * ファイル名を生成する
     */
    createFileName(measuredDataType, startDate, endDate) {
        const format = this.getFormatString().replace(/[^a-zA-Z]/g, '');
        let fileName = '';
        fileName += measuredDataType === MEASURED_DATA_TYPE.realTime ? 'DemandRealTimeReport_' : 'DemandDigestReport_';
        fileName += moment(startDate).format(format) + '-' + moment(endDate).format(format);
        return fileName;
    }

    /**
     * ロケーションの表示用文字列を生成する
     * @param {any} location
     */
    createLocationString(location) {
        let displayString = location.name;
        let tmpLoc = location;

        while (tmpLoc.parent) {
            tmpLoc = tmpLoc.parent;
            displayString = tmpLoc.name + ' / ' + displayString;
        }

        return displayString;
    }

    /**
     * フォーマット文字列を生成する
     */
    getFormatString() {
        const { displayTimeSpanId } = this.props;

        switch (displayTimeSpanId) {
            case DISPLAY_TIME_SPANS.month:
                return  'YYYY/MM/DD';

            case DISPLAY_TIME_SPANS.year:
                return 'YYYY/MM';

            default:
                return 'YYYY/MM/DD HH:mm';
        }
    }

    /**
     * render
     */
    render() {
        const { isLoading, displayGraphType, demandGraphMode, isPvEnergyLapped, measuredDataType, demandGraph, displayTimeSpanId, updateInterval, location } = this.props;
        const { dataTypes, selected } = this.state;

        const maxAxisCount = demandGraph && demandGraph.graphParameters.reduce((max, cur) => Math.max(max, cur.yAxes.length), 0);

        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>グラフデータ</Box.Title>
                </Box.Header >
                <Box.Body>
                    {demandGraph && 
                        <Grid fluid>
                            <div className="clearfix mb-1">
                                <div className="pull-left">
                                    <Button
                                        iconId="report-output"
                                        onClick={() => this.onReportOutputClick()}
                                    >レポート出力</Button>
                                </div>
                                {measuredDataType == MEASURED_DATA_TYPE.realTime &&
                                    <div className="pull-right">
                                        <AutoUpdateButtonGroup
                                            value={updateInterval}
                                            onChange={(val) => this.props.onUpdateIntervalChange(val)}
                                            onManualUpdateClick={() => this.props.onManualUpdateClick()}
                                        />
                                    </div>
                                }
                            </div>
                            <div className="mb-1">
                                ロケーション：{this.createLocationString(location)}
                            </div>                           
                            <Row className="mb-1">
                                <Col sm={4}>                                        
                                    <Form inline>
                                        データ種別：
                                        <MultiSelectForm
                                            options={demandGraph.demandGraphDataTypes && demandGraph.demandGraphDataTypes.map((type) => ({ value: type.demandGraphTypeId.toString(), name: type.name }))}
                                            value={dataTypes.map((type) => type.demandGraphTypeId.toString())}
                                            onChange={(typeIds) => this.onDataTypesChange(typeIds.map((typeId) => demandGraph.demandGraphDataTypes.find((t) => t.demandGraphTypeId == typeId)))}
                                        />
                                    </Form>                                       
                                </Col>                                
                                <Col sm={4} className="ta-c">
                                    <ButtonToolbar style={{ display: 'inline-block' }}>
                                        <Button
                                            className="mr-1"
                                            onClick={() => this.props.onMoveClick('back')}
                                        >
                                            <i className="fal fa-angle-left" />
                                        </Button>
                                        <Button
                                            className="mr-1"
                                            onClick={() => this.props.onMoveClick('now')}
                                        >
                                            現在
                                    </Button>
                                        <Button
                                            onClick={() => this.props.onMoveClick('forward')}
                                        >
                                            <i className="fal fa-angle-right" />
                                        </Button>
                                    </ButtonToolbar>
                                </Col>
                                <Col sm={4} className="ta-r pa-t-1">
                                    <ButtonToolbar style={{ display: 'inline-block' }}>
                                        <ToggleSwitch
                                            bsSize="xs"
                                            value={displayGraphType}
                                            name="displayGraphType"
                                            swichValues={[
                                                { value: 1, text: 'デマンド' },
                                                { value: 2, text: '電力量' }
                                            ]}
                                            onChange={(val) => this.onChangeDisplayGraphType(val)}
                                        />
                                        {(measuredDataType == MEASURED_DATA_TYPE.summary && displayGraphType == 2) &&
                                            <ToggleSwitch
                                                bsSize="xs"
                                                value={demandGraphMode}
                                                name="demandGraphMode"
                                                swichValues={[
                                                    { value: 1, text: 'エリア内訳' },
                                                    { value: 2, text: '用途別' }
                                                ]}
                                                onChange={(val) => this.onChangeDemandGraphMode(val)}
                                            />
                                        }
                                        {displayGraphType == 2 &&
                                            <CheckboxSwitch
                                                text="発電量を重ねて表示"
                                                bsSize="xs"
                                                checked={isPvEnergyLapped}
                                                onChange={(val) => this.props.onChangeisPvEnergyLapped(val)}
                                            />
                                        }
                                    </ButtonToolbar>
                                </Col>
                            </Row>
                            {demandGraph.graphParameters.length > 0 ?
                                demandGraph.graphParameters.map((graphParameter, i) =>
                                    <DemandGraph
                                        ref={'chart' + i}
                                        measuredDataType={measuredDataType}
                                        isArea={demandGraph.isArea}
                                        displayTimeSpanId={displayTimeSpanId}
                                        graphParameter={graphParameter}
                                        onDoubleClick={(params) => this.props.onChartDoubleClick(params)}
                                        dataTypes={dataTypes}
                                        paddingRight={maxAxisCount * 80}
                                        startDate={demandGraph.startDate}
                                        endDate={demandGraph.endDate}
                                        selected={selected[i]}
                                        onLegendSelectChanged={(selected) => this.onLegendSelectChanged(selected, i)}
                                    />
                                )
                                :
                                <Panel className="mt-1">
                                    <div className="ta-c pa-2">（表示可能なデータがありません）</div>
                                </Panel>
                            }
                        </Grid>
                    }
                </Box.Body>
            </Box>
        );
    }
}