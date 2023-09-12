'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';
import { MEASURED_DATA_TYPE, AUTO_UPDATE_VALUES } from 'constant';

import { Grid, Row, Col, ButtonToolbar, Form, FormControl, Pagination } from 'react-bootstrap';

import TrendGraph from 'Common/Widget/TrendGraph';
import AutoUpdateButtonGroup from 'Assets/AutoUpdateButtonGroup';
import MoveButtonGroup from 'Assets/TrendGraph/MoveButtonGroup';
import AutoModeDisplaySpanForm from 'Assets/TrendGraph/AutoModeDisplaySpanForm';
import Box from 'Common/Layout/Box';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import MultiSelectForm from 'Common/Form/MultiSelectForm';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';

const pageSize = application.appSettings ? parseInt(application.appSettings.trendGraphMaxPointCount) : 30;

export default class TrendGraphBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataTypes: this.getDataTypes(props.graphDatas),
            showThreshold: true,
            currentPage: 1
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.graphDatas !== this.props.graphDatas) {
            // graphDataのポイントが変更された時
            const nextPointNos = nextProps.graphDatas ? nextProps.graphDatas.map((g) => g.valueData.point.pointNo) : [];
            const pointNos = this.props.graphDatas ? this.props.graphDatas.map((g) => g.valueData.point.pointNo) : [];
            if (JSON.stringify(nextPointNos) !== JSON.stringify(pointNos)) {
                this.setState({
                    dataTypes: this.getDataTypes(nextProps.graphDatas),
                    currentPage: 1
                });
            }
        }
    }

    /**
     * CSV出力ボタンクリック
     */
    onCSVOutputClick() {
        const pointNos = this.refs.trendGraph.getDisplayedPointNos();
        this.props.onCSVOutputClick(pointNos);
    }

    /**
     * グラフデータからデータ種別リストを取得する
     */
    getDataTypes(graphDatas) {
        if (!graphDatas) {
            return [];
        }

        const dataTypes = [];

        graphDatas.forEach((g, i) => {
            if (dataTypes.findIndex((dt) => g.valueData.point.datatype.dtType == dt.dtType) < 0) {
                dataTypes.push(g.valueData.point.datatype);
            }
        });

        return dataTypes;
    }

    /**
     * データ種別の絞り込みが変更された時
     * @param {any} dataTypes
     */
    onDataTypesChange(dataTypes) {
        this.setState({ dataTypes: dataTypes, currentPage: 1 });
    }

    /**
     * グラフデータを絞り込む
     * @param {any} graphDatas
     */
    filterGraphDatas(graphDatas) {
        if (!graphDatas) {
            return null;
        }

        const { dataTypes } = this.state;
        return graphDatas.filter((g) => dataTypes.find((dt) => dt.dtType == g.valueData.point.datatype.dtType));
    }

    /**
     * render
     */
    render() {
        const { isReadOnly, graphDatas, autoUpdateInterval, onChangeAutoUpdate, dateFrom, dateTo, xTickInterval, isLoading, mTimeSpan, measuredDataType, onDispSettingClick, autoScale, zoomed } = this.props;
        const { dataTypes, showThreshold, currentPage } = this.state;

        const allDataTypes = this.getDataTypes(graphDatas);
        const filteredGraphDatas = this.filterGraphDatas(graphDatas);
        const startIdx = pageSize * (currentPage - 1) + 1;
        const endIdx = filteredGraphDatas && Math.min(filteredGraphDatas.length, pageSize * (currentPage));
        const currentPageGraphDatas = filteredGraphDatas && filteredGraphDatas.slice(startIdx - 1, endIdx);

        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>グラフデータ</Box.Title>
                </Box.Header >
                <Box.Body>
                    {(currentPageGraphDatas) &&
                        <div>
                            <Grid fluid>
                                <Row>
                                    <Col md={12}>
                                        <ButtonToolbar className="pull-left">
                                            <Button 
                                                iconId="report-output"
                                                onClick={() => this.onCSVOutputClick()}
                                            >レポート出力</Button>
                                            {!isReadOnly &&
                                                <Button
                                                    iconId="category-setting"
                                                    onClick={() => onDispSettingClick()}
                                                >設定</Button>
                                            }
                                        </ButtonToolbar>
                                        <div className="pull-right">
                                            <AutoUpdateButtonGroup
                                                value={autoUpdateInterval}
                                                onlyManual={measuredDataType == MEASURED_DATA_TYPE.summary}
                                                onChange={(val) => this.props.onChangeAutoUpdate(val)}
                                                onManualUpdateClick={() => this.props.onManualUpdateClick()}
                                            />
                                            {zoomed && autoUpdateInterval !== AUTO_UPDATE_VALUES.none &&
                                                <div className="mtb-05 ta-r">※ズーム表示中は自動更新されません</div>
                                            }
                                        </div>
                                    </Col>
                                </Row>
                                <Row className="mt-1">
                                    <Col md={4}>
                                        <div style={{ display: 'inline-block' }}>絞り込み：</div>
                                        <div style={{ display: 'inline-block' }} className="mr-1">
                                            <span>データ種別</span>
                                            <MultiSelectForm
                                                options={allDataTypes && allDataTypes.map((type) => ({ value: type.dtType.toString(), name: type.name }))}
                                                value={dataTypes && dataTypes.map((type) => type.dtType.toString())}
                                                onChange={(dtTypes) => this.onDataTypesChange(dtTypes.map((dtType) => allDataTypes.find((dt) => dt.dtType == dtType)))}
                                            />
                                        </div>
                                        <CheckboxSwitch
                                            text="閾値表示"
                                            bsSize="xs"
                                            checked={showThreshold}
                                            onChange={(checked) => this.setState({ showThreshold: checked })}
                                        />
                                    </Col>
                                    <Col md={4}>
                                    {autoUpdateInterval === AUTO_UPDATE_VALUES.none &&
                                        <MoveButtonGroup
                                            className="ta-c pa-t-2"
                                            onDoubleLeftClick={() => this.props.onMoveClick(true, false)}
                                            onLeftClick={() => this.props.onMoveClick(false, false)}
                                            onRightClick={() => this.props.onMoveClick(false, true)}
                                            onDoubleRightClick={() => this.props.onMoveClick(true, true)}
                                        />
                                    }
                                    </Col>
                                    <Col md={4}>
                                    {autoUpdateInterval !== AUTO_UPDATE_VALUES.none &&
                                        <AutoModeDisplaySpanForm
                                            className="ta-r pa-t-2"
                                            measuredDataType={measuredDataType}
                                            value={mTimeSpan}
                                            onChange={(value) => this.props.onDisplayTimeSpanChanged(value)}
                                        />
                                    }
                                    </Col>
                                </Row>
                                <Row className="mb-1">
                                    <TrendGraph
                                        ref="trendGraph"
                                        autoScale={autoScale}
                                        graphDatas={currentPageGraphDatas}
                                        dateTo={dateTo}
                                        dateFrom={dateFrom}
                                        xTickInterval={xTickInterval}
                                        showThreshold={showThreshold}
                                        showSeconds={measuredDataType === MEASURED_DATA_TYPE.realTime}
                                        controller={true}
                                        onZoom={() => this.props.onZoomChange(true)}
                                        onZoomReset={() => this.props.onZoomChange(false)}
                                    />
                                </Row>
                                {filteredGraphDatas.length > pageSize &&
                                    <NormalPager
                                        totalItemCount={filteredGraphDatas.length}
                                        start={startIdx}
                                        end={endIdx}
                                        totalPages={Math.ceil(filteredGraphDatas.length / pageSize)}
                                        currentPage={currentPage}
                                        handlePageClick={(pageNo) => this.setState({ currentPage: pageNo })}
                                    />
                                }
                            </Grid>
                        </div>}
                </Box.Body>
            </Box>
        );
    }
}

/**
 * ページャー（通常版）
 * <NormalPager totalItemCount={} start={} end={} totalPages={} currentPage={} ></NormalPager>
 * @param {number} totalItemCount データ数合計
 * @param {number} start 表示開始行
 * @param {number} end 表示終了業
 * @param {number} totalPages ページ数合計
 * @param {number} currentPage 現在表示中のページ
 */
const NormalPager = ({ totalItemCount, start, end, totalPages, currentPage, handlePageClick }) => (
    <Row>
        <Col sm={5}>
            <div className="mt-05">
                {totalItemCount} 件中 {start} から {end} までを表示
            </div>
        </Col>
        <Col sm={7}>
                <Pagination prev next first last ellipsis boundaryLinks
                    className="mtb-0"
                    maxButtons={5}
                    items={totalPages}
                    activePage={currentPage} 
                    onSelect={(e) => handlePageClick(e)}
                />
        </Col>
    </Row>
);