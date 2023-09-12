'use strict';

import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { Panel, Grid, Row, Col, ToggleButtonGroup, Form, Pagination, FormControl } from 'react-bootstrap';

import PointDetailModal from 'Assets/Modal/PointDetailModal';
import TrendGraphModal from 'Assets/Modal/TrendGraphModal';
import RealTimeDataItem from 'Assets/RealTimeDataItem';
import SelectForm from 'Common/Form/SelectForm';
import MultiSelectForm from 'Common/Form/MultiSelectForm';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import DataOption, { SORT_TYPE, INIT_FILTER_ALARM } from 'Assets/DataOption';

export default class RealTimeDataPanel extends Component {

    constructor(props) {
        super(props);
        this.state = {
            detailPointNo: null,
            showPointDetailModal: false,
            graphPointNo: null,
            sort: { key: SORT_TYPE.name, isAsc: true },
            filter: {
                alarm: INIT_FILTER_ALARM,
                datatype: props.dataTypes && props.dataTypes.map((type) => type.dtType.toString())
            },
            pageNo: 1,
            pageLength: 20
        };
    }

    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(this.getPointNos(nextProps.currentData)) != JSON.stringify(this.getPointNos(this.props.currentData))) {
            this.setState({ filter: Object.assign({}, this.state.filter, { datatype: nextProps.dataTypes.map((type) => type.dtType.toString()) }) });
        }
    }
    
    /**
     * リアルタイムデータリストからポイント番号リストを取得する
     * @param {any} realTimedatas
     */
    getPointNos(realTimedatas) {
        if (!realTimedatas) {
            return [];
        }
        const pointNos = realTimedatas.map((data) => data.valueData.point.pointNo);
        return pointNos.sort((a, b) => a - b);
    }

    /**
     * ポイントNoからvalueDataを取得する
     * @param {any} pointNo ポイントNo
     * @param {any} realTimeDatas 検索対象のリアルタイムデータ
     */
    getValueData(pointNo, realTimeDatas) {
        const realTimeData = this.getRealTimeData(pointNo, realTimeDatas);
        if (realTimeData) {
            return realTimeData.valueData;
        } else {
            return null;
        }
    }

    /**
     * ポイントNoからRealTimeDataを取得する
     * @param {any} pointNo
     * @param {any} realTimeDatas
     */
    getRealTimeData(pointNo, realTimeDatas) {
        return realTimeDatas.find((data) => data.valueData.point.pointNo === pointNo);
    }

    /**
     * 表示データを生成する
     */
    makeDisplayData() {
        const { filter, sort } = this.state;

        var data = this.props.currentData.slice();

        //絞り込む（アラーム種別＆データ種別）
        data = data.filter((r) => filter.alarm.indexOf(r.valueData.alarmClassName) >= 0
            && filter.datatype.indexOf(r.valueData.point.datatype.dtType.toString()) >= 0);

        //ソートする
        data.sort((a, b) => {
            var aKey = sort.key == SORT_TYPE.name ? a.valueData.point.pointName : this.makeValueString(a.valueData.dateValuePairs[0], a.valueData.format);
            var bKey = sort.key == SORT_TYPE.name ? b.valueData.point.pointName : this.makeValueString(b.valueData.dateValuePairs[0], b.valueData.format);
            if (parseFloat(aKey) == aKey && parseFloat(bKey) == bKey) {
                aKey = parseFloat(aKey);
                bKey = parseFloat(bKey);
            }
            if (aKey > bKey) return sort.isAsc ? 1 : -1;
            if (aKey < bKey) return sort.isAsc ? -1 : 1;
            return 0;
        });

        return data;
    }

    /**
     * 表示する値を生成する
     * @param {any} dateValuePair
     */
    makeValueString(dateValuePair, formatString) {
        if (!dateValuePair) {
            return ' ― ';
        }
        if (dateValuePair.displayString) {
            return dateValuePair.displayString;
        }
        if (dateValuePair.scaledValue != null) {
            return format(formatString, dateValuePair.scaledValue);
        }
    }

    /**
     * render
     */
    render() {
        const { currentData, lastData, header, statistic } = this.props;
        const { detailPointNo, open, sort, filter, showPointDetailModal, graphPointNo, showTrendGraphModal, pageNo, pageLength } = this.state;

        const displayData = this.makeDisplayData();
        const startIdx = (pageNo - 1) * pageLength + 1;
        const endIdx = pageNo * pageLength;
        const currentPageData = displayData.slice(startIdx - 1, endIdx);

        if (displayData.length && !currentPageData.length) {
            this.setState({ pageNo: 1 });
        }

        const listClasses = {
            'realtime-box-list': true,
            'with-statistic': statistic
        };

        const sortIconClasses = {
            'ml-05': true,
            'glyphicon': true,
            'glyphicon-sort-by-attributes': sort.isAsc,
            'glyphicon glyphicon-sort-by-attributes-alt': !sort.isAsc
        };

        //表示中のデータ種別のみに絞り込む
        const dataTypes = this.props.dataTypes.filter((type) =>
            currentData && currentData.some((data) => data.valueData.point.datatype.dtType == type.dtType));

        return (
            <Panel header={header} collapsible defaultExpanded>
                {(currentData && currentData.length > 0) ?
                    <Grid fluid>
                        <Row>
                            <Col sm={8}>
                                <DataOption sort={sort}
                                    filter={filter}
                                    useSort
                                    useFilter
                                    dataTypes={dataTypes}
                                    inline
                                    onSort={(sort) => this.setState({ sort: sort })}
                                    onFilter={(filter) => this.setState({ filter: filter })}
                                />
                            </Col>
                            <Col sm={4}>
                                <Form inline className="ta-r">
                                    <FormControl
                                        componentClass="select"
                                        value={pageLength}
                                        onChange={(e) => this.setState({ pageLength: e.target.value, pageNo: 1 })}
                                        bsSize="sm"
                                    >
                                        <option value="20">20</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                        <option value="200">200</option>
                                        <option value="500">500</option>
                                    </FormControl> 件を表示
                                </Form>
                            </Col>
                        </Row>
                        <Row>
                            <div className="muuri-container">
                                <ul className={classNames(listClasses)} ref="grid" >
                                    {currentPageData.map((data) =>
                                        <RealTimeDataItem
                                            key={data.valueData.point.pointNo}
                                            currentData={data}
                                            lastData={this.getRealTimeData(data.valueData.point.pointNo, lastData)}
                                            onDetailIconClick={(no) => this.setState({ detailPointNo: no, showPointDetailModal: true })}
                                            onGraphIconClick={(no) => this.setState({ graphPointNo: no, showTrendGraphModal: true })}
                                        />
                                    )}
                                </ul>
                            </div>
                        </Row>
                        <Row className="mt-05">
                            <NormalPager
                                totalItemCount={displayData.length}
                                start={Math.min(startIdx, displayData.length)}
                                end={Math.min(endIdx, displayData.length)}
                                totalPages={Math.ceil(displayData.length / pageLength)}
                                currentPage={pageNo}
                                handlePageClick={(pageNo) => this.setState({ pageNo: pageNo })}
                            />
                        </Row>
                        <PointDetailModal
                            show={showPointDetailModal}
                            pointInfo={this.getValueData(detailPointNo, currentData)}
                            onClose={() => this.setState({ showPointDetailModal: false })}
                            onSaved={() => this.props.onThresholdChange()}
                        />
                        <TrendGraphModal
                            showModal={showTrendGraphModal}
                            pointNos={graphPointNo && [graphPointNo]}
                            onHide={() => this.setState({ showTrendGraphModal: false })}
                        />
                    </Grid>
                    :
                    <div>検索条件に該当するデータがありません</div>
                }
            </Panel>
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