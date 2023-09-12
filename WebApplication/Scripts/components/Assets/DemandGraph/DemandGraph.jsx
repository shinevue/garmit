'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getSessionStorage, setSessionStorage, STORAGE_KEY } from 'webStorage';

import PropTypes from 'prop-types';

import { Popover, OverlayTrigger, Modal } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import DetailGraphModal from 'Assets/DemandGraph/DetailGraphModal';
import PcsAlarmModal from 'Assets/DemandGraph/PcsAlarmModal';

import { MEASURED_DATA_TYPE, DISPLAY_TIME_SPANS } from 'constant';
import { escapeHtml } from 'stringUtility';
import { getXInterval } from 'demandViewUtility';

const GRAPH_TYPE = {
    bar: 1,
    line: 2
};

const LINE_TYPE = {
    solid: 1,
    dash: 2
};

const OVERLAP_TYPE = {
    none: 0,
    full: 1,
    half: 2
};

export default class DemandGraph extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showDetailGraphModal: false,
            showPcsAlarmModal: false
        };
        this.chart;
    }

    /**
     * コンポーネントがマウントされた時
     */
    componentDidMount() {
        this.plotChart();
    }

    /**
     * コンポーネントが新しいPropsを受け取ったとき
     * @param {any} nextProps
     */
    componentWillReceiveProps(nextProps) {

    }

    /**
     * コンポーネントをアップデートするかどうか
     * @param {any} nextProps
     * @param {any} nextState
     */
    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.graphParameter !== this.props.graphParameter) {
            return true;
        }
        if (nextProps.dataTypes !== this.props.dataTypes) {
            return true;
        }
        if (nextState.showDetailGraphModal !== this.state.showDetailGraphModal) {
            return true;
        }
        if (nextState.showPcsAlarmModal !== this.state.showPcsAlarmModal) {
            return true;
        }
        return false;
    }

    /**
     * コンポーネントがアップデートされた時
     */
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.graphParameter !== this.props.graphParameter || prevProps.dataTypes !== this.props.dataTypes) {
            this.plotChart();
        }
    }

    /**
     * グラフを描画する
     */
    plotChart() {
        if (this.chart) {
            this.chart.dispose();
        }

        this.chart = echarts.init(this.refs.chart);
        const option = this.createOption();
        this.chart.setOption(option);
        this.chart.on('dblclick', (params) => {
            if (this.props.onDoubleClick) {
                const sendParams = Object.assign({}, params);
                sendParams.value = [params.value[2], params.value[0]];
                this.props.onDoubleClick(sendParams);
            }
        });
        this.chart.on('legendselectchanged', (params) => {
            this.props.onLegendSelectChanged(params.selected);
        });
        // inview時に再プロット
        $(this.refs.chart).off('inview');
        $(this.refs.chart).on('inview', () => {
            setTimeout(() => {
                this.chart.resize();
            }, 200);
        });
        $(window).resize(() => {
            this.chart.resize();
        });
        $(window).mouseup(() => {
            const chartHeight = this.chart.getHeight();
            const height = $(this.refs.chart).height();
            if (chartHeight != height) {
                this.chart.resize();
            }
        });
    }

    /**
     * X軸の値のリストを生成する
     */
    createXAxisValues() {
        const { startDate, endDate, displayTimeSpanId } = this.props;
        const interval = getXInterval(displayTimeSpanId);
        const xValues = [];

        let x = moment(startDate);
        while (x <= moment(endDate)) {
            xValues.push(moment(x));
            x = x.add(interval.value, interval.key);
        }
        
        return xValues;
    }

    /**
     * Y軸のオプションを生成する
     */
    createYAxisOption(xAxisValues) {
        const { yAxes, seriesList } = this.props.graphParameter;

        return yAxes.map((axis, i) => {
            const sl = seriesList.filter((s) => s && axis.axisId === s.yAxisId);
            const yValues = [].concat.apply([], sl.map((s) => s.plotList.map((p) => p.yValue || 0)));

            const stackIdList = sl.map((s) => s.stackId).filter((id, i, self) => id != null && self.indexOf(id) === i);
            stackIdList.forEach((id) => {
                const stackSl = sl.filter((s) => s.stackId === id);
                if (stackSl.length > 1) {
                    yValues.push(...xAxisValues.map((x) => stackSl.reduce((sum, s) => {
                        const plot = s.plotList.find((p) => moment(p.xValue).isSame(x));
                        return sum + ((plot && plot.yValue) || 0);
                    }, 0)));
                }
            });
            
            yValues.sort((y1, y2) => y1 - y2);

            let yMax = Math.max(yValues[yValues.length - 1], 0);
            let yMin = Math.min(yValues[0], 0);

            const yMaxDigits = Math.floor(Math.max(Math.log10(Math.abs(yMax)), 0));
            const yMinDigits = Math.floor(Math.max(Math.log10(Math.abs(yMin)), 0));
            yMax = Math.ceil(yMax / Math.pow(10, yMaxDigits)) * Math.pow(10, yMaxDigits);
            yMin = Math.floor(yMin / Math.pow(10, yMinDigits)) * Math.pow(10, yMinDigits);

            return {
                type: 'value',
                name: axis.axisName,
                position: 'right',
                offset: i * 80,
                splitLine: { show: false },
                max: yMax,
                min: yMin
            };
        });
    }

    /**
    * 系列のオプションを生成する
    */
    createSeriesOption() {
        const { graphParameter, measuredDataType, isArea, dataTypes, displayTimeSpanId, showBarBorder } = this.props;
        const { yAxes, seriesList, overlapType } = graphParameter;
        const displaySeries = seriesList.filter((s) => s && (!dataTypes || dataTypes.some((dt) => dt.demandGraphTypeId == s.demandGraphDataTypeId)) && yAxes.findIndex((axis) => axis.axisId === s.yAxisId) >= 0);
        const stackIdList = displaySeries.map((s) => s.stackId).filter((s, i, self) => s != null && self.indexOf(s) === i);
        let sortedSeries = displaySeries.filter((s) => s.stackId == null);

        //stackする系列はstackIndexの昇順にソートする
        stackIdList.forEach((id) => {
            const list = displaySeries.filter((s) => s.stackId == id);
            list.sort((a, b) => a.stackIndex - b.stackIndex);
            sortedSeries = sortedSeries.concat(list);
        });

        return sortedSeries.map((s) => {
            const data = s.plotList.map((p) => {
                const markRange = s.markRanges && s.markRanges.find((mr) => mr.xMin <= p.xValue && p.xValue < mr.xMax);
                const controlMessages = s.markRanges && s.markRanges.filter((mr) => mr.xMin <= p.xValue && p.xValue < mr.xMax).map((mr) => mr.tooltipText);
                return {
                    controlMessages: controlMessages,
                    value: [this.formatDate(p.xValue), p.yValue != null ? p.yValue : null, p.xValue],
                    itemStyle: markRange && { barBorderColor: markRange.borderColor, barBorderWidth: 1.5 },
                    stackId: s.stackId,
                    stackIndex: s.stackIndex
                };
            });

            return {
                yAxisIndex: yAxes.findIndex((axis) => axis.axisId === s.yAxisId),
                type: s.graphType == GRAPH_TYPE.bar ? 'bar' : 'line',
                name: s.name,
                color: s.color,
                lineStyle: s.graphType == GRAPH_TYPE.line && { type: s.lineType == LINE_TYPE.dash ? 'dashed' : 'solid' },
                itemStyle: showBarBorder ? { barBorderColor: '#888', barBorderWidth: 0.5 } : (overlapType === OVERLAP_TYPE.full ? { barBorderColor: 'transparent', barBorderWidth: 2 } : null),
                data: data,
                stack: s.stackId,
                barGap: this.getBarGap(overlapType),
                cursor: (measuredDataType == MEASURED_DATA_TYPE.realTime || displayTimeSpanId < DISPLAY_TIME_SPANS.day_byHalfAnHour || isArea) ? 'auto' : 'pointer',
                tooltipIndex: s.stackId
            };
        });
    }

    /**
     * 棒グラフの間隔を返却する
     * @param {any} overlapType
     */
    getBarGap(overlapType) {
        switch (overlapType) {
            case OVERLAP_TYPE.full:
                return '-100%';

            case OVERLAP_TYPE.half:
                return '-50%';

            default:
                return '0%';
        }
    }

    /**
     * サブテキストの日時フォーマットを返す
     */
    getSubTextDateFormat() {
        const { displayTimeSpanId } = this.props;

        switch (displayTimeSpanId) {              
            case DISPLAY_TIME_SPANS.day_byHalfAnHour:
            case DISPLAY_TIME_SPANS.day_byHour:
                return 'YYYY/MM/DD';

            case DISPLAY_TIME_SPANS.month:
                return 'YYYY年MM月';

            case DISPLAY_TIME_SPANS.year:
                return 'YYYY年'

            default:
                return 'YYYY/MM/DD HH:mm';
        }
    }

    /**
     * サブテキストを生成する
     */
    createSubText() {
        const { measuredDataType, startDate, endDate, displayTimeSpanId } = this.props;
        const format = this.getSubTextDateFormat();
        let subText = moment(startDate).format(format);

        if (displayTimeSpanId <= DISPLAY_TIME_SPANS.hour) {
            subText += ' ～ ' + moment(endDate).format(format);
        }

        return subText;
    }

    /**
     * オプションを生成する
     */
    createOption() {
        const { graphParameter, measuredDataType, isArea, dataTypes, displayTimeSpanId, paddingRight, selected } = this.props;
        const { graphTitle, seriesList, yAxes } = graphParameter;

        const fontFamily = getComputedStyle(this.refs.chart, '').fontFamily;

        const option = {
            textStyle: fontFamily,
            title: {
                text: graphTitle,
                textStyle: { fontSize: 16 },
                subtext: ' ' + this.createSubText(),
                subtextStyle: { color: '#333' }
            }
        };

        const hasNoData = !seriesList.filter((s) => s && !s.isOutputExcluded).some((s) => s.plotList.some((p) => p.yValue != null));
        const xAxisValues = this.createXAxisValues();

        if (hasNoData) {
            Object.assign(option, {
                graphic: {
                    elements: [
                        {
                            type: 'text',
                            top: 'middle',
                            left: 'center',
                            style: {
                                text: '(表示可能なデータがありません)',
                                font: '14px ' + fontFamily
                            },
                            silent: true
                        }
                    ]
                }                
            });
        } else {
            Object.assign(option, {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'line'
                    },
                    formatter: (params) => this.createToolTipText(params)
                },
                grid: {
                    left: 40,
                    right: paddingRight || yAxes.length * 80
                },
                legend: {
                    type: 'scroll',
                    data: seriesList.filter(s => s).map((s) => s.name),
                    bottom: 'bottom',
                    selected: selected
                },
                xAxis: [
                    {
                        data: xAxisValues.map((x) => this.formatDate(x)),
                        type: 'category',
                        axisTick: { alignWithLabel: true }
                    }
                ],
                yAxis: this.createYAxisOption(xAxisValues),
                series: this.createSeriesOption()
            });
        }

        return option;
    }

    /**
     * ツールチップに表示する文字列を生成する
     * @param {any} params
     */
    createToolTipText(params) {
        const xValue = params[0].axisValueLabel + '<br/>';
        const yValues = [];
        const controlMessages = [];

        const stackSeries = params.filter((s) => s.data.stackId != null);
        stackSeries.sort((a, b) => a.data.stackId - b.data.stackId);
        stackSeries.sort((a, b) => b.data.stackIndex - a.data.stackIndex);  //stackIndexの降順にソート
        const series = params.filter((s) => s.data.stackId == null).concat(stackSeries);

        series.forEach((s) => {
            if (s.value[1] != null) {
                const value = s.marker + escapeHtml(s.seriesName + ': ' + s.value[1]);
                yValues.push(value);
            }
            if (s.data.controlMessages) {
                s.data.controlMessages.forEach((msg) => {
                    const escapedMsg = escapeHtml(msg);
                    if (controlMessages.indexOf(escapedMsg) < 0) {
                        controlMessages.push(escapedMsg);
                    }
                });
            }
        });
        controlMessages.sort();
        const yValuesText = yValues.length > 0 ? (yValues.join('<br/>') + '<br/>') : '';
        const text = xValue + yValuesText + controlMessages.join('<br/>');
        return text;
    }

    /**
     * 日付をフォーマットする
     * @param {any} date
     */
    formatDate(date) {
        const format = this.getFormatString();
        return moment(date).format(format).replace(' ', '\n');
    }

    /**
     * フォーマット文字列を生成する
     */
    getFormatString() {
        const { displayTimeSpanId } = this.props;

        switch (displayTimeSpanId) {
            case DISPLAY_TIME_SPANS.month:
                return 'D日';

            case DISPLAY_TIME_SPANS.year:
                return 'M月';

            default:
                return 'HH:mm';
        }
    }

    /**
     * インシデントログ画面に遷移する
     */
    moveToIncidentLog() {
        setSessionStorage(STORAGE_KEY.startDate, this.props.startDate);
        setSessionStorage(STORAGE_KEY.endDate, this.props.endDate);
        window.location.href = '/IncidentLog';
    }

    /**
     * render
     */
    render() {
        const { graphParameter, measuredDataType, displayTimeSpanId } = this.props;
        const { showDetailGraphModal, showPcsAlarmModal } = this.state;

        const maxAxisCount = graphParameter.detailGraph && graphParameter.detailGraph.graphParameters.reduce((max, cur) => Math.max(max, cur.yAxes.length), 0);

        return (
            <div>
                <div ref="container" className="demand-graph-container">
                    <div ref="chart" className="demand-graph"></div>
                    {(graphParameter.pcsAlarmItems && graphParameter.pcsAlarmItems.length > 0) &&
                        <div className="alarm-button">
                            <Button bsSize="sm" bsStyle="danger" onClick={() => this.setState({ showPcsAlarmModal: true })}>
                                蓄電池機器異常あり
                            </Button>
                        </div>
                    }
                    {graphParameter.detailGraph &&
                        <div className="detail-button">
                            <Button bsSize="sm" onClick={() => this.setState({ showDetailGraphModal: true })}>
                                詳細
                            </Button>
                        </div>
                    }
                </div>
                {(graphParameter.pcsAlarmItems && graphParameter.pcsAlarmItems.length > 0) &&
                    <PcsAlarmModal
                        show={showPcsAlarmModal}
                        pcsAlarmItems={graphParameter.pcsAlarmItems}
                        onHide={() => this.setState({ showPcsAlarmModal: false })}
                    />
                }
                {graphParameter.detailGraph &&
                    <DetailGraphModal
                        show={showDetailGraphModal}
                        detailGraph={graphParameter.detailGraph}
                        measuredDataType={measuredDataType}
                        displayTimeSpanId={displayTimeSpanId}
                        onHide={() => this.setState({ showDetailGraphModal: false })}
                    />
                }
            </div>
        );
    }
}