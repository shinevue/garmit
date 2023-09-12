/**
 * Copyright 2017 DENSO Solutions
 * 
 * トレンドグラフ画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getSessionStorage, setSessionStorage, STORAGE_KEY } from 'webStorage';

import Content from 'Common/Layout/Content';
import ToggleSwitch from 'Common/Widget/ToggleSwitch';

import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import TimeSpanOption from 'Assets/TrendGraph/TimeSpanOption';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import NetworkAlert from 'Assets/NetworkAlert';

import TrendGraphBox from 'TrendGraph/TrendGraphBox';
import SummaryOption from 'TrendGraph/SummaryOption';
import GraphSettingModal from 'TrendGraph/GraphSettingModal';

import { setAuthentication } from 'Authentication/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { changeNetworkError } from 'NetworkError/actions.js';
import { setLookUp, setGraphDatas, setTrendGraphSet, setDateRange, setLoadState, setLoadState_condition, setLoadState_graphData, setMeasuredDataType } from './actions.js';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';　　
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { MEASURED_DATA_TYPE, SUMMARY_TYPE, AUTO_UPDATE_VALUES } from 'constant';
import { validateDate, VALIDATE_STATE, successResult, errorResult } from 'inputCheck';
import { getTimeAxisTickInterval } from 'trendGraphUtility';
import { outputReportResult } from 'exportUtility';

const DATE_FORMAT = {
    realTime: 'YYYY/MM/DD HH:mm',
    digest: 'YYYY/MM/DD HH:00'
};

const EXPORT_DATE_FORMAT = 'YYYYMMDDHHmm';

const SEARCH_CONDITION_TARGETS = ['locations', 'enterprises', 'tags', 'egroups', 'hashTags'];


class TrendGraphPanel extends Component {

    constructor(props){
        super(props);
        this.state = {
            updateInterval: AUTO_UPDATE_VALUES.none,
            timeSpanOnAutoMode: 60,   // 自動更新時の表示期間(分)
            from: null,
            to: null,
            summaryType: SUMMARY_TYPE.max,
            lookUp: {},
            inputCheck: {
                from: successResult,
                to: successResult
            },
            defaultClose: false,
            showModal: false,
            autoScale: true,
            message: {}
        };
    }

    /**
     * コンポーネントがマウントされる前に呼ばれます
     */
    componentWillMount() {
        this.initTimeSpan(this.props.measuredDataType);
    }

    /**
     * componentがマウントされた時
     */
    componentDidMount() {
        this.loadAuthentication();
        this.loadLookUp();

        const pointNo = getSessionStorage(STORAGE_KEY.pointNo);
        const startDate = getSessionStorage(STORAGE_KEY.startDate);
        const endDate = getSessionStorage(STORAGE_KEY.endDate);

        if (pointNo && startDate && endDate) {
            this.setState({ from: new Date(startDate), to: new Date(endDate), defaultClose: true }, () => {
                this.search({}, [pointNo]);
            });
        }
    }

    /**
     * 検索ボタンクリック
     */
    onSearchClick(condition) {
        if (this.isAllSearch(condition)) {
            this.setState({
                message: {
                    show: true,
                    buttonStyle: 'confirm',
                    title: '検索条件未指定',
                    message: (<div><div>検索条件を指定せずに検索する場合、結果の取得に時間がかかることがあります。</div><div>検索を実行してもよろしいですか？</div></div>),
                    onOK: () => {
                        this.clearMessage();
                        this.search(condition);
                    },
                    onCancel: () => this.clearMessage()
                }
            });
        } else {
            this.search(condition);
        }
    }

    /**
     * 検索を実行する
     * @param {any} condition
     */
    search(condition, pointNos) {
        this.clearAllTimer();

        // グラフエリアだけ先に表示させるようにする 
        // ※jqplotのreplot時のツールチップ表示対策のため
        if (!this.props.graphDatas) {
            this.props.setGraphDatas([]);
        }

        this.setState({ condition: condition, pointNos: pointNos }, () => {
            this.loadData(() => {
                if (this.state.updateInterval !== AUTO_UPDATE_VALUES.none) {
                    this.startTimer();
                }
            });
        });
    }

    /**
     * 検索条件指定がないかどうか
     * @param {any} condition
     */
    isAllSearch(condition) {
        return !SEARCH_CONDITION_TARGETS.some((target) => condition[target] && condition[target].length > 0);
    }

    /**
     * グラフ設定が変更された時
     * @param {any} trendGraphSet
     * @param {any} autoScale
     */
    onGraphSettingChange(trendGraphSet, autoScale) {
        // 確認メッセージを表示
        this.setState({
            message: {
                show: true,
                title: '保存',
                buttonStyle: 'save',
                message: '設定を保存してよろしいですか？',
                onCancel: () => this.clearMessage(),
                onOK: () => {
                    this.clearMessage();
                    this.saveGraphSetting(trendGraphSet, (result, networkError, needUpdate) => {
                        if (result) {
                            // 保存成功
                            needUpdate && this.loadData();
                            this.showSaveSuccessMessage();
                            this.setState({ autoScale: autoScale, showModal: false });
                        } else {
                            // 保存失敗
                            if (networkError) {
                                this.showNetWorkErrorMessage();
                            } else {
                                this.showSaveFailureMessage();
                            }                            
                        }
                    });
                }
            }
        });
    }

    /**
     * レポート出力ボタンクリック
     */
    onCSVOutputClick(pointNos) {
        this.loadReportResult(pointNos, (result, fileName) => {
            outputReportResult(result, fileName);
        });
    }

    /**
     * 保存成功メッセージを表示
     */
    showSaveSuccessMessage() {
        this.setState({
            message: {
                show: true,
                title: '保存',
                buttonStyle: 'message',
                onCancel: () => this.clearMessage(),
                message: '設定を保存しました。'
            }
        });
    }

    /**
     * 保存失敗メッセージを表示
     */
    showSaveFailureMessage() {
        this.setState({
            message: {
                show: true,
                title: '保存',
                buttonStyle: 'message',
                onCancel: () => this.clearMessage(),
                message: '設定の保存に失敗しました。'
            }
        });
    }

    /**
     * エラーメッセージを表示する
     * @param {any} message
     */
    showErrorMessage(message) {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'message',
                title: 'エラー',
                message: message,
                onCancel: () => this.clearMessage()
            }
        });
    }

    /**
     * ネットワークエラーメッセージを表示する
     */
    showNetWorkErrorMessage() {
        this.showErrorMessage(NETWORKERROR_MESSAGE);
    }

    /**
     * データの表示モードが変化したとき
     * @param {any} val
     */
    onDispModeChange(val) {
        this.props.setMeasuredDataType(val);
        this.props.setGraphDatas(null);
        this.clearAllTimer();
        this.setState({
            timeSpanOnAutoMode: val === MEASURED_DATA_TYPE.realTime ? '60' : '720',
            updateInterval: AUTO_UPDATE_VALUES.none
        });
        this.initTimeSpan(val);
    }

    /**
     * 自動更新時の表示期間が変更された時
     * @param {any} val
     */
    onTimeSpanOnAutoModeChange(val) {
        this.setState({ timeSpanOnAutoMode: val }, () => {
            this.loadData();
        });
    }

    /**
     * ズームが変化したとき
     * @param {any} zoomed ズームされたか
     */
    onZoomChange(zoomed) {
        if (this.state.zoomed !== zoomed) {
            this.setState({ zoomed: zoomed });
        }
    }

    /**
     * 表示期間移動ボタンがクリックされた時
     * @param {any} isWhole
     * @param {any} isForward
     */
    onMoveClick(isWhole, isForward) {
        let moveSpan;
        const { to, from } = this.props.dateRange;


        if (isWhole) {
            moveSpan = {
                amount: moment(to).diff(moment(from)),
                key: 'milliseconds'
            }
        } else {
            moveSpan = getTimeAxisTickInterval(from, to, this.props.measuredDataType);
        }

        if (!isForward) {
            moveSpan.amount = moveSpan.amount * (-1);
        }

        const newFrom = moment(from).add(moveSpan.amount, moveSpan.key);
        const newTo = moment(to).add(moveSpan.amount, moveSpan.key);

        this.setState({ from: newFrom, to: newTo }, () => {
            this.loadData();
        });

    }

    /**
     * 表示期間が変更された時
     * @param {any} from
     * @param {any} to
     */
    handleTimeSpanChenged(from, to) {
        const format = this.props.measuredDataType == MEASURED_DATA_TYPE.realTime ? DATE_FORMAT.realTime : DATE_FORMAT.digest;

        const inputCheck = Object.assign({}, this.state.inputCheck);
        inputCheck.from = validateDate(from, format, false);
        inputCheck.to = validateDate(to, format, false);
        if (inputCheck.from.state == VALIDATE_STATE.success && inputCheck.to.state == VALIDATE_STATE.success && !moment(to).isAfter(from)) {
            inputCheck.to = errorResult('終了日時は開始日時以降となるように設定してください');
        }

        this.setState({ from: from, to: to, inputCheck: inputCheck });
    }

    /**
     * 権限情報を取得する
     */
    loadAuthentication() {
        getAuthentication(FUNCTION_ID_MAP.enterpriseEdit, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    /**
     * マスターデータを取得
     */
    loadLookUp() {
        this.props.setLoadState_condition(true);   //ロード中
        sendData(EnumHttpMethod.get, 'api/TrendGraph/getLookUp', null, (lookUp, networkError) => {
            this.props.setLoadState_condition(false);  //ロード完了
            if (lookUp) {
                this.props.setLookUp(lookUp);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                this.props.changeNetworkError(false);
            }
        });
    }

    /**
     * グラフデータを読み込む
     */
    loadData(callback, isUpdate) {
        const condition = this.createSearchCondition(); //検索条件を用意
        const url = this.state.pointNos ? 'api/TrendGraph/getByPoint' : 'api/TrendGraph/getData';
        const sendingData = this.state.pointNos ? { lookUp: condition, pointNos: this.state.pointNos } : condition;

        this.props.setLoadState_graphData(true);   //ロード中
        sendData(EnumHttpMethod.post, url, sendingData, (data, networkError) => {
            this.props.setLoadState_graphData(false);  //ロード完了
            if (data) {
                this.props.setDateRange({ from: condition.startDate, to: condition.endDate });  // X軸の表示範囲をセット
                this.props.setGraphDatas(data && data.graphDatas);
                this.props.setTrendGraphSet(data && data.trendGraphSet);
                this.setState({ zoomed: false });
            }            
            if (isUpdate || !networkError) {
                this.props.changeNetworkError(networkError);
            } else {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback(data);
            }
        });
    }

    /**
     * searchResult型のデータを読み込む
     * @param {any} callback
     */
    loadReportResult(pointNos, callback) {
        const condition = this.createSearchCondition();
        sendData(EnumHttpMethod.post, 'api/report/data/resultByPointNo', { lookUp: condition, pointNos: pointNos }, (info, networkError) => {
            if (info && info.reportResult) {
                let fileName = '';
                fileName += condition.measuredDataType === MEASURED_DATA_TYPE.realTime ? 'RealTimeReport_' : 'DigestReport_';
                fileName += moment(condition.startDate).format(EXPORT_DATE_FORMAT) + '-' + moment(condition.endDate).format(EXPORT_DATE_FORMAT);
                fileName += condition.measuredDataType === MEASURED_DATA_TYPE.summary ? this.getSummaryTypeString(condition.measuredDataType) : '';
                callback(info.reportResult, fileName);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                this.props.changeNetworkError(false);
            }
        });
    }

    /**
     * グラフ設定を保存する
     * @param {any} trendGraphSet
     * @param {any} callback
     */
    saveGraphSetting(trendGraphSet, callback) {
        // トレンドグラフ設定が変更されていない場合にはDBを更新しない
        if (JSON.stringify(trendGraphSet) === JSON.stringify(this.props.trendGraphSet)) {
            if (callback) {
                callback(true);
            }
            return;
        }

        const processedData = this.processTrendGraphSet(trendGraphSet);
        this.props.setWaitingState(true, 'save');
        sendData(EnumHttpMethod.post, 'api/TrendGraph/setTrendGraphSet', processedData, (result, networkError) => {
            this.props.setWaitingState(false, null);
            if (!networkError) {
                this.props.changeNetworkError(false);
            }
            if (callback) {
                callback(result, networkError, true);
            }
        });
    }

    /**
     * グラフデータを更新する
     * @param {any} interval
     */
    updateValue(interval) {
        if (interval === this.state.updateInterval && !this.state.zoomed) {
            this.loadData(() => this.setTimer(interval), true);
        } else {
            this.setTimer(interval);
        }
    }

    /**
     * タイマーをスタートする
     */
    startTimer() {
        this.setTimer(AUTO_UPDATE_VALUES.slow);
        this.setTimer(AUTO_UPDATE_VALUES.fast);
    }

    /**
     * タイマーを設定する
     * @param {any} interval
     */
    setTimer(interval) {
        if (interval === AUTO_UPDATE_VALUES.fast) {
            this.fastTimerId = setTimeout(() => this.updateValue(interval), interval);
        } else if (interval === AUTO_UPDATE_VALUES.slow) {
            this.slowTimerId = setTimeout(() => this.updateValue(interval), interval);
        }
    }

    /**
     * タイマーが動いている場合はクリアする
     */
    clearAllTimer() {
        if (this.fastTimerId) {
            clearTimeout(this.fastTimerId);
        }
        if (this.slowTimerId) {
            clearTimeout(this.slowTimerId);
        }
    }

    /**
     * 自動更新周期が変更された時
     * @param {any} newInterval
     */
    onUpdateIntervalChange(newInterval) {
        if (newInterval === AUTO_UPDATE_VALUES.none) {
            // 自動更新がOFFになった場合はタイマークリア
            this.clearAllTimer();
        }
        else if (this.state.updateInterval === AUTO_UPDATE_VALUES.none) {
            // 自動更新がONになった場合はタイマースタート
            this.startTimer();
        }
        this.setState({ updateInterval: newInterval });
    }

    /**
     * 表示期間を初期化する
     */
    initTimeSpan(measuredDataType) {
        const now = moment().format(measuredDataType == MEASURED_DATA_TYPE.realTime ? DATE_FORMAT.realTime : DATE_FORMAT.digest).replace(/\//g, '-');
        const to = moment(now);
        const from = moment(to).add(measuredDataType == MEASURED_DATA_TYPE.realTime ? - 1 : -12, 'hours');
        this.setState({ from: from, to: to });
    }

    /**
     * 検索条件を生成する
     */
    createSearchCondition() {
        const condition = Object.assign({}, this.state.condition);

        // 表示期間をセット
        if (this.state.updateInterval === AUTO_UPDATE_VALUES.none) {
            condition.endDate = this.state.to;
            condition.startDate = this.state.from;
        } else {
            condition.endDate = moment();
            condition.startDate = moment(condition.endDate).add(this.state.timeSpanOnAutoMode * (-1), 'minutes');
        }

        condition.measuredDataType = this.props.measuredDataType;   // 測定データ種別をセット
        if (this.props.measuredDataType === MEASURED_DATA_TYPE.summary) {
            condition.summaryType = this.state.summaryType;
        }

        return condition;
    }

    /**
     * フォームにエラーあるか
     */
    hasErrorState() {
        const { inputCheck } = this.state; 
        for (let key of Object.keys(inputCheck)) {
            if (inputCheck[key].state === VALIDATE_STATE.error) {
                return true;
            }
        }
        return false;
    }

    /**
     * CSVファイル名の積算種別情報部分を取得する
     */
    getSummaryTypeString(summaryType) {
        switch (summaryType) {
            case SUMMARY_TYPE.max.toString():
                return '(max)';
            case SUMMARY_TYPE.min.toString():
                return '(min)';
            case SUMMARY_TYPE.average.toString():
                return '(ave)';
            case SUMMARY_TYPE.snap.toString():
                return '(snp)';
            case SUMMARY_TYPE.diff:
                return '(diff)';
            default:
                return '';
        }
    }

    /**
     * trendGraphSetを必要な情報のみに加工する
     * @param {any} trendGraphSet
     */
    processTrendGraphSet(trendGraphSet) {
        const set = Object.assign({}, trendGraphSet);
        set.graphPoints = trendGraphSet.graphPoints.map((p) => ({ pointNo: p.pointNo, pointName: p.pointName, graphColor: p.graphColor }));

        return set;
    }

    /**
     * メッセージをクリアする
     */
    clearMessage() {
        this.setState({ message: Object.assign({}, this.state.message, { show: false }) });
    }

    /**
     * render
     */
    render() {
        const { isReadOnly, level } = this.props.authentication;
        const { graphDatas, trendGraphSet, dateRange, isLoading, lookUp, measuredDataType, waitingInfo, authentication, networkError } = this.props;
        const { from, to, summaryType, inputCheck, timeSpanOnAutoMode, updateInterval, showModal, autoScale, message, zoomed, defaultClose } = this.state;

        return (
            <Content>
                <NetworkAlert show={networkError.isNetworkError} />
                <div className="mb-1">
                    <ToggleSwitch
                        value={measuredDataType}
                        name="measuredDataType"
                        swichValues={[
                            { value: MEASURED_DATA_TYPE.realTime, text: 'リアルタイム' },
                            { value: MEASURED_DATA_TYPE.summary, text: 'ダイジェスト' }
                        ]}
                        onChange={(val) => this.onDispModeChange(val)}
                    />
                </div>
                <SearchConditionBox
                    lookUp={lookUp}
                    targets={SEARCH_CONDITION_TARGETS}
                    onSearchClick={(condition) => this.onSearchClick(condition)}
                    searchButtonDisabled={this.hasErrorState() || isLoading.graphData}
                    isLoading={isLoading.condition || !authentication.loadAuthentication}
                    defaultClose={defaultClose}
                >
                    <div className="mt-05">
                        <TimeSpanOption
                            disabled={updateInterval !== AUTO_UPDATE_VALUES.none}
                            from={from}
                            to={to}
                            measuredDataType={measuredDataType}
                            format={measuredDataType == MEASURED_DATA_TYPE.realTime ? DATE_FORMAT.realTime : DATE_FORMAT.digest}
                            timeChanged={(from, to) => this.handleTimeSpanChenged(from, to)}
                            validationFrom={inputCheck.from}
                            validationTo={inputCheck.to}
                        />
                        {(measuredDataType === MEASURED_DATA_TYPE.summary) &&
                            <SummaryOption
                                value={summaryType}
                                onChange={(val) => this.setState({ summaryType: val })}
                            />
                        }
                    </div>
                </SearchConditionBox>
                <TrendGraphBox
                    autoScale={autoScale}
                    isReadOnly={isReadOnly}
                    graphDatas={graphDatas}
                    zoomed={zoomed}
                    trendGraphSet={trendGraphSet}
                    measuredDataType={measuredDataType}
                    autoUpdateInterval={updateInterval}
                    onChangeAutoUpdate={(val) => this.onUpdateIntervalChange(val)}
                    onManualUpdateClick={() => this.loadData(null, measuredDataType === MEASURED_DATA_TYPE.realTime)}
                    mTimeSpan={timeSpanOnAutoMode}
                    onDisplayTimeSpanChanged={(val) => this.onTimeSpanOnAutoModeChange(val)}
                    dateTo={dateRange && dateRange.to}
                    dateFrom={dateRange && dateRange.from}
                    xTickInterval={getTimeAxisTickInterval(dateRange.from, dateRange.to)}
                    isLoading={isLoading.graphData}
                    onZoomChange={(zoomed) => this.onZoomChange(zoomed)}
                    onMoveClick={(isWhole, direction) => this.onMoveClick(isWhole, direction)}
                    onDispSettingClick={() => this.setState({ showModal: true })}
                    onCSVOutputClick={(pointNos) => this.onCSVOutputClick(pointNos)}
                />
                <GraphSettingModal
                    autoScale={autoScale}
                    showModal={showModal}
                    trendGraphSet={trendGraphSet}
                    onSave={(trendGraphSet, autoScale) => this.onGraphSettingChange(trendGraphSet, autoScale)}
                    onCancel={() => this.setState({ showModal: false })}
                />
                <MessageModal
                    show={message.show}
                    title={message.title}
                    bsSize="small"
                    buttonStyle={message.buttonStyle}
                    onOK={message.onOK}
                    onCancel={message.onCancel}
                >
                    {message.message}
                </MessageModal>
                <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />
            </Content>
        );
    }    
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
const mapStateToProps = (state) => {
    return {
        authentication: state.authentication,
        waitingInfo: state.waitingInfo,
        lookUp: state.lookUp,
        graphDatas: state.graphDatas,
        trendGraphSet: state.trendGraphSet,
        dateRange: state.dateRange,
        measuredDataType: state.measuredDataType,
        isLoading: state.isLoading,
        networkError: state.networkError
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        setWaitingState: (isWaiting, waitingType) => dispatch(setWaitingState(isWaiting, waitingType)),
        setLookUp: (lookUp) => dispatch(setLookUp(lookUp)),
        setGraphDatas: (data) => dispatch(setGraphDatas(data)),
        setTrendGraphSet: (graphSet) => dispatch(setTrendGraphSet(graphSet)),
        setDateRange: (dateRange) => dispatch(setDateRange(dateRange)),
        setMeasuredDataType: (type) => dispatch(setMeasuredDataType(type)),
        setLoadState: (isLoad) => dispatch(setLoadState(isLoad)),
        setLoadState_condition: (isLoad) => dispatch(setLoadState_condition(isLoad)),
        setLoadState_graphData: (isLoad) => dispatch(setLoadState_graphData(isLoad)),
        setWaitingState: (isWaiting, type) => dispatch(setWaitingState(isWaiting, type)),
        changeNetworkError: (isError) => dispatch(changeNetworkError(isError))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(TrendGraphPanel);

 