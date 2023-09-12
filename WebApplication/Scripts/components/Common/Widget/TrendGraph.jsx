/**
 * Copyright 2017 DENSO Solutions
 * 
 * TrendGraph Reactコンポーネント
 *  
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { ButtonToolbar, Button, Panel, Container, Grid, Row, Col, Table, Form } from 'react-bootstrap';
import { escapeHtml } from 'stringUtility';

const CONTACT_YAXIS_MIN = 0;
const CONTACT_YAXIS_INTERVAL = 1;

/**
 * トレンドグラフ
 * @param {bool} controller
 * @param {array} graphDatas
 */
export default class TrendGraph extends Component {

    constructor(props) {
        super(props);
        this.state = {
            hiddenIndexes: []
        }
        this.targetPlot = null;
        this.controllerPlot = null;
    }

    componentWillMount() {

    }

    componentDidMount() {
        this.plotChart();
    }

    componentWillReceiveProps(nextProps) {
        const nextPointNos = nextProps.graphDatas ? nextProps.graphDatas.map((g) => g.valueData.point.pointNo) : [];
        const pointNos = this.props.graphDatas ? this.props.graphDatas.map((g) => g.valueData.point.pointNo) : [];
        if (JSON.stringify(nextPointNos) !== JSON.stringify(pointNos)) {
            this.setState({ hiddenIndexes: [] });
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        var nextPropsJSON = JSON.stringify(nextProps);
        var propsJSON = JSON.stringify(this.props);
        if (nextPropsJSON !== propsJSON) {
            return true;
        }
    }

    componentDidUpdate() {
        this.plotChart();
    }

    /**
     * DataSetを作成します。
     */
    createDataSet() {
        const { graphDatas, autoScale } = this.props;

        let dataSet = {
            // 系列値の配列
            valueArray: [],
            // Y軸の設定の配列
            axisArray: [],
            // 系列設定の配列
            seriesArray: [],
            // 系列色の配列
            seriesColors: []
        }

        for (let i = 0; i < Math.min(30, graphDatas.length); i++) {
            const valueData = graphDatas[i].valueData;
            const { point, dateValuePairs } = valueData;

            let axisIndex = dataSet.axisArray.findIndex((axis) => axis.datatype.dtType === point.datatype.dtType);

            // 該当するデータ種別の軸がない場合には新しく作成
            if (axisIndex < 0) {
                dataSet.axisArray.push({
                    label: point.datatype.name,
                    datatype: point.datatype,
                    autoscale: autoScale,
                    min: this.getYAxisMin(autoScale, point.datatype),
                    max: !autoScale ? point.datatype.yAxisMax : null,
                    tickInterval: this.getYAxisInterval(autoScale, point.datatype),
                    tickOptions: { formatString: this.createFormatString(point.datatype.defaultFormat) }
                });
                axisIndex = dataSet.axisArray.length - 1;
            }

            dataSet.valueArray.push(dateValuePairs.map((p) => [moment(p.measuredDate).format("YYYY-MM-DD HH:mm:ss"), p.scaledValue, format(valueData.format, p.scaledValue)]));
            dataSet.seriesArray.push({ label: escapeHtml(point.pointName), yaxis: YAXISNAMES[axisIndex], pointNo: point.pointNo });
            dataSet.seriesColors.push(point.graphColor || "black");

            // 閾値ラインを追加
            dataSet.valueArray.push(this.createThresholdLine(point))
            dataSet.seriesArray.push({ label: '閾値', yaxis: YAXISNAMES[axisIndex], lineWidth: 0.6, linePattern: 'dashed' });
            dataSet.seriesColors.push(point.graphColor || "black");
        }
        return dataSet;
    }

    /**
     * フォーマット文字列文字列を生成する
     */
    createFormatString(format) {
        if (!format) {
            return '%0.1f';
        }
        var str = format.split('.');
        var decimalDigit = str[1] ? str[1].length : 0;
        return decimalDigit == 0 ? '%d' : `%0.${decimalDigit}f`;
    }

    /**
     * 閾値データを生成します。
     * @param {any} valueData
     */
    createThresholdLine(point) {
        const { dateTo, dateFrom, xTickInterval } = this.props;
        const i_amount = xTickInterval ? xTickInterval.amount : 1;
        const i_key = xTickInterval ? xTickInterval.key : 'minutes';
        const xmin = moment(dateFrom).add(-10 * i_amount, i_key).format('YYYY-MM-DD HH:mm:ss');
        const xmax = moment(dateTo).add(10 * i_amount, i_key).format('YYYY-MM-DD HH:mm:ss');
        const array = [];
        const keys = ['upperError', 'upperAlarm', 'lowerAlarm', 'lowerError'];

        let nextMin = true;

        for (let key of keys) {
            if (point[key]) {
                Array.prototype.push.apply(array, [[nextMin ? xmin : xmax, point[key]], [nextMin ? xmax : xmin, point[key]]]);
                nextMin = !nextMin;
            }
        }
        return array;
    }

    /**
     * AxisOptionを生成します。
     * @param xAxisOption X軸の設定値
     * @param yAxisSettingArray Y軸の設定値の配列
     */
    createAxisOption(xAxisOption, yAxisSettingArray) {
        var option = {};
        const tickInterval = this.props.xTickInterval ? `${this.props.xTickInterval.amount} ${this.props.xTickInterval.key}` : null;
        var xOption = {
            min: moment(this.props.dateFrom).format('YYYY-MM-DD HH:mm:ss'),
            max: moment(this.props.dateTo).format('YYYY-MM-DD HH:mm:ss'),
            tickInterval: tickInterval,
            tickOptions: { formatString: this.props.showSeconds ? '%F%n%H:%M:%S' : '%F%n%H:%M' },
            autoscale: false,
        };
        option.xaxis = Object.assign(xOption, xAxisOption);
        for (var i = 0; i < yAxisSettingArray.length; ++i) {
            option[YAXISNAMES[i]] = yAxisSettingArray[i];
        }
        return option;
    }

    /**
     * チャートを描画します。
     */
    plotChart() {
        if (!this.refs.chartContainer) {
            return;
        }

        const dataSet = this.createDataSet();

        //リーク対策のため、グラフのエレメントごと消して再構築する
        if (this.targetPlot !== null) {
            this.targetPlot.target.unbind();
            this.targetPlot.destroy();
        }
        if (this.controllerPlot !== null) {
            this.controllerPlot.target.unbind();
            this.controllerPlot.destroy();
        }

        this.targetPlot = $.jqplot(this.props.targetPlotId, dataSet.valueArray, {
            grid: targetGridOptions,
            sortData: false,
            cursor: targetCursorOptions,
            axesDefaults: targetAxisDefaultOptions,
            axes: this.createAxisOption(targetXAxisOptions, dataSet.axisArray),
            seriesDefaults: targetSeriesOptions,
            seriesColors: dataSet.seriesColors,
            series: dataSet.seriesArray
        });

        // ズーム時の処理を追加
        this.targetPlot.target.bind('jqplotZoom', () => {
            if (this.props.onZoom) {
                this.props.onZoom();
            }
        });

        this.targetPlot.target.bind('jqplotResetZoom', () => {
            if (this.props.onZoomReset) {
                this.props.onZoomReset();
            }
        });

        if (this.props.controller) {
            this.controllerPlot = $.jqplot(this.props.controllerPlotId, dataSet.valueArray, {
                grid: controlGridOptions,
                sortData: false,
                cursor: controlCursorOptions,
                axesDefaults: controlAxisDefaultOptions,
                axes: this.createAxisOption(controlXAxisOptions, dataSet.axisArray),
                seriesDefaults: controlSeriesOptions,
                seriesColors: dataSet.seriesColors,
                series: dataSet.seriesArray
            });
            $.jqplot.Cursor.zoomProxy(this.targetPlot, this.controllerPlot)
        }

        this.setSeriesShowState();

        // リサイズ時に再プロット
        $(window).unbind('resize');
        $(window).bind('resize', () => {
            if (this.refs.chartContainer) {
                this.targetPlot.replot();
                this.controllerPlot.replot();
            }
        });

        // inview時に再プロット
        $(this.refs.chartContainer).off('inview');
        $(this.refs.chartContainer).on('inview', (e, isInView) => {
            if (isInView && this.refs.chartContainer) {
                setTimeout(() => {
                    $('#' + this.props.targetPlotId).width('100%');
                    $('#' + this.props.controllerPlotId).width('100%');
                    this.targetPlot.replot();
                    this.controllerPlot.replot();
                }, 100);
            }
        });
    }

    /**
     * 表示中のポイントNoのリストを取得する
     */
    getDisplayedPointNos() {
        const series = this.targetPlot.series;
        const pointNos = [];
        for (let i = 0; i < series.length; i++) {
            if (series[i].show && series[i].pointNo && pointNos.indexOf(series[i].pointNo) < 0) {
                pointNos.push(series[i].pointNo);
            }
        }
        return pointNos;
    }

    /**
     * 系列の表示非表示を切り替える
     * @param {any} index
     */
    toggleSeries(index) {
        const show = !this.targetPlot.series[index].show;
        this.targetPlot.series[index].show = show;
        this.controllerPlot.series[index].show = show;
        this.targetPlot.replot();
        this.controllerPlot.replot();
        $('#legend-label-' + index).first().css('text-decoration', show ? 'none' : 'line-through');

        const hiddenIndexes = this.state.hiddenIndexes.slice();
        let i = hiddenIndexes.indexOf(index);
        if (i < 0) {
            hiddenIndexes.push(index);
        } else {
            hiddenIndexes.splice(i, 1);
        }
        this.setState({ hiddenIndexes: hiddenIndexes });
    }

    /**
     * 系列の表示状態をセットする
     */
    setSeriesShowState() {
        const { showThreshold } = this.props;
        const { hiddenIndexes } = this.state;

        for (let i = 0; i < this.targetPlot.series.length; i++) {
            const show = (i % 2 == 0 || showThreshold) && hiddenIndexes.indexOf(i) < 0;
            this.targetPlot.series[i].show = show;
            this.controllerPlot.series[i].show = show;
            $('#legend-label-' + i).first().css('text-decoration', show ? 'none' : 'line-through');
        }

        this.targetPlot.replot();
        this.controllerPlot.replot();
    }

    /**
     * 凡例を生成する
     */
    createLegend() {
        const { graphDatas, showThreshold } = this.props;
        return (
            <table className="graph-legend">
                {graphDatas && graphDatas.map((g, i) => {
                    const idx_data = i * 2;
                    const idx_threshold = i * 2 + 1;
                    return (
                        <tr>
                            <td id={'legend-label-' + idx_data} onClick={() => this.toggleSeries(idx_data)}>
                                <td><Swatch color={g.valueData.point.graphColor} /></td>
                                <td style={{ paddingLeft: '0.2em' }}><div>{g.valueData.point.pointName}</div></td>
                            </td>
                        {showThreshold &&
                            <td id={'legend-label-' + (idx_threshold)} onClick={() => this.toggleSeries(idx_threshold)}>
                                <td><Swatch color={g.valueData.point.graphColor} /></td>
                                <td style={{ paddingLeft: '0.2em' }}><div>閾値</div></td>
                            </td>
                        }
                        </tr>
                    )
                })}
            </table>
        );
    }

    /**
     * グラフ表示可能かどうか
     */
    isShowableGraph() {
        const { graphDatas } = this.props;
        return graphDatas && graphDatas.some((gData) => gData.valueData.dateValuePairs.length > 0);
    }

    /**
     * Y軸の最小値を取得
     * @param {boolean} autoScale 自動スケールかどうか
     * @param {object} datatype データ種別
     */
    getYAxisMin(autoScale, datatype) {
        if (autoScale) {
            return datatype.isContact ? CONTACT_YAXIS_MIN : null
        } else {
            return datatype.yAxisMin;
        }
    }

    /**
     * Y軸の目盛間隔を取得
     * @param {boolean} autoScale 自動スケールかどうか
     * @param {object} datatype データ種別
     */
    getYAxisInterval(autoScale, datatype) {
        if (autoScale) {
            return datatype.isContact ? CONTACT_YAXIS_INTERVAL : null
        } else {
            return datatype.yAxisInterval;
        }
    }                    

    /**
     * render
     */
    render() {
        const { graphDatas, targetPlotId, controllerPlotId, targetHeight, controllerHeight, controller } = this.props;

        // グラフ表示可能か
        const showable = this.isShowableGraph();

        return (
            <Grid fluid>
                {showable ?
                    <Row>
                        <Col sm={2}>
                            <div className="mt-1">
                                {this.createLegend()}
                            </div>
                        </Col>
                        <Col sm={10}>
                            <div
                                ref="chartContainer"
                                style={{ width: '100%' }}
                            >
                                <div
                                    id={targetPlotId}
                                    style={{ height: targetHeight, zIndex: 10, width: '100%' }}
                                    className="text-unselectable"
                                />
                                {(controller) &&
                                    <div
                                        id={controllerPlotId}
                                        style={{ height: controllerHeight, width: '100%' }}
                                        className="text-unselectable"
                                    />
                                }
                            </div>
                        </Col>
                    </Row>
                    :
                    <Row>
                        <Col sm={12}>
                            <Panel className="mt-1">
                                <div className="ta-c pa-2">（表示可能なデータがありません）</div>
                            </Panel>
                        </Col>
                    </Row>
                }
            </Grid>
        );
    }
}

TrendGraph.propTypes = {
    graphDatas: PropTypes.array,
    targetPlotId: PropTypes.string,
    controllerPlotId: PropTypes.string,
    targetHeight: PropTypes.number,
    controllerHeight: PropTypes.number,
    dateTo: PropTypes.object.isRequired, // Date型
    dateFrom: PropTypes.object.isRequired  // Date型
}

TrendGraph.defaultProps = {
    graphDatas: [],
    targetPlotId: "targetPlot",
    controllerPlotId: "controllerPlot",
    targetHeight: 440,
    controllerHeight: 160,
    showSeconds: true
}

var targetGridOptions = {
    gridLineColor: '#E3E3E3',
    drawGridlines: true,
    drawBorder: true,
    shadow: false,
    background: 'white'
};

var targetCursorOptions = {
    show: true,
    zoom: true,
    showTooltip: true,
    followMouse: true,
    tooltipOffset: 10,
    tooltipLocation: 'se',
    showVerticalLine: true,
    showTooltipDataPosition: true,
    tooltipFormatString: '%s: %s, %4$s',
    intersectionThreshold: 2,
};

var targetAxisDefaultOptions = {
    labelOptions: {
        show: true,
        fontSize: '8pt'
    },
    tickOptions: {
        mark: 'cross',
        markSize: 5,
        formatString: '%.1f',
        rendererOptions: {
            forceTickAt0: true
        }
    },
    rendererOptions: {
        forceTickAt0: true
    }
};

var targetXAxisOptions = {
    drawMajorGridlines: true,
    renderer: $.jqplot.DateAxisRenderer,
    tickRenderer: $.jqplot.AxisTickRenderer,
    pad: 0,
    tickOptions: { formatString: '%F%n%H:%M:%S' }
};

var targetSeriesOptions = {
    lineWidth: 1,
    showMarker: true,
    markerOptions: {
        shadow: false,
        size: 4
    },
    smooth: false,
    shadow: false,
    breakOnNull: true,
};

var controlGridOptions = targetGridOptions;

var controlCursorOptions = {
    show: true,
    showTooltip: false,
    showVerticalLine: true,
    zoom: true,
    constrainZoomTo: 'x'
};

var controlAxisDefaultOptions = targetAxisDefaultOptions;

var controlXAxisOptions = {
    drawMajorGridlines: true,
    renderer: $.jqplot.DateAxisRenderer,
    tickRenderer: $.jqplot.AxisTickRenderer,
    pad: 0
};

var controlSeriesOptions = {
    lineWidth: 1,
    showMarker: false,
    smooth: false,
    shadow: false,
    breakOnNull: true,
};

var YAXISNAMES = ['y2axis', 'y3axis', 'y4axis', 'y5axis', 'y6axis', 'y7axis', 'y8axis', 'y9axis'];

function Swatch(props) {
    return (
        <div className="jqplot-table-legend-swatch-outline">
            <div
                className="jqplot-table-legend-swatch"
                style={{ backgroundColor: props.color, borderColor: props.color }}>
            </div>
        </div>
    );
}