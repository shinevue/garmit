/**
 * @license Copyright 2019 DENSO
 * 
 * デマンドグラフ画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getSessionStorage, setSessionStorage, STORAGE_KEY } from 'webStorage';

import { Grid } from 'react-bootstrap'

import Content from 'Common/Layout/Content';
import ToggleSwitch from 'Common/Widget/ToggleSwitch';

import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import LocationForm from 'Assets/Condition/LocationForm';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import NetworkAlert from 'Assets/NetworkAlert';

import DemandGraphBox from 'DemandGraph/DemandGraphBox';
import TimeSpanOption from 'Assets/DemandGraph/TimeSpanOption';

import { setAuthentication } from 'Authentication/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { changeNetworkError } from 'NetworkError/actions.js';
import { setLoadState, setLoadState_condition, setLoadState_demandGraph, setLookUp, setLastCondition, setDemandGraph, setMeasuredDataType } from './actions.js';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';　　
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { MEASURED_DATA_TYPE, AUTO_UPDATE_VALUES, DISPLAY_TIME_SPANS } from 'constant';
import { validateDate, VALIDATE_STATE, successResult, errorResult } from 'inputCheck';
import { makeAreaEnabledLocation, makeBranchSelectableLocation } from 'locationUtility';
import { floorDate, getNextDate } from 'demandViewUtility';

class DemandGraphPanel extends Component {

    constructor(props){
        super(props);
        this.state = {
            message: {},
            displayTimeSpanId: DISPLAY_TIME_SPANS.halfAnHour,
            date: floorDate(moment(), DISPLAY_TIME_SPANS.halfAnHour),
            hasDateError: false,
            displayGraphType: 1,
            demandGraphMode: 1,
            isPvEnergyLapped: false,
            location: null,
            updateInterval: AUTO_UPDATE_VALUES.none
        };
    }

    /**
     * componentがマウントされた時
     */
    componentDidMount() {
        this.loadAuthentication();
        this.loadLookUp();
    }

    /**
     * 検索ボタンクリック
     */
    onSearchClick() {
        this.clearAllTimer();
        const condition = this.createSearchCondition(); //検索条件を用意
        this.loadData(condition, () => {
            if (this.state.updateInterval !== AUTO_UPDATE_VALUES.none) {
                this.startTimer();
            }
        });
    }

    /**
     * データの表示モードが変化したとき
     * @param {any} val
     */
    onDispModeChange(val) {
        this.props.setMeasuredDataType(val);
        this.props.setDemandGraph(null);
        this.props.setLastCondition(null);
        this.clearAllTimer();
        const displayTimeSpanId = val === MEASURED_DATA_TYPE.summary ? DISPLAY_TIME_SPANS.day_byHalfAnHour : DISPLAY_TIME_SPANS.halfAnHour;
        this.setState({
            displayTimeSpanId: displayTimeSpanId,
            date: val === MEASURED_DATA_TYPE.realTime ? floorDate(moment(), displayTimeSpanId) : floorDate(moment(this.state.date), displayTimeSpanId),
            location: (val === MEASURED_DATA_TYPE.realTime && (this.state.location && !this.state.location.hasDemandSet)) ? null : this.state.location,
            updateInterval: AUTO_UPDATE_VALUES.none
        });
    }

    /**
     * 移動ボタンがクリックされた時
     * @param {any} direction
     */
    onMoveClick(direction) {
        const condition = Object.assign({}, this.props.lastCondition);
        const displayTimeSpanId = condition.displayTimeSpans[0].displayTimeSpanId;

        if (direction == 'now') {
            condition.startDate = floorDate(moment(), displayTimeSpanId);
        } else {
            const isForward = direction == 'forward';
            condition.startDate = getNextDate(condition.startDate, displayTimeSpanId, isForward);
        }

        this.setState({ date: condition.startDate }, () => {
            this.loadData(condition);
        });
    }

    /**
     * デマンドグラフ種別が変更された時
     * @param {any} type
     */
    onChangeDisplayGraphType(type) {
        this.setState({ displayGraphType: type }, () => {
            const condition = Object.assign({}, this.props.lastCondition);
            condition.displayGraphType = type;
            this.loadData(condition);
        });
    }

    /**
     * デマンドグラフモードが変更された時
     * @param {any} mode
     */
    onChangeDemandGraphMode(mode) {
        this.setState({ demandGraphMode: mode }, () => {
            const condition = Object.assign({}, this.props.lastCondition);
            condition.demandGraphMode = this.createSendDemandGraphMode(mode);
            this.loadData(condition);
        });
    }

    /**
     * 発電量を重ねて表示のスイッチが変更された時
     * @param {any} isPvEnergyLapped
     */
    onChangeisPvEnergyLapped(isPvEnergyLapped) {
        this.setState({ isPvEnergyLapped: isPvEnergyLapped }, () => {
            const condition = Object.assign({}, this.props.lastCondition);
            condition.isPvEnergyLapped = isPvEnergyLapped;
            this.loadData(condition);
        });
    }

    /**
     * グラフがダブルクリックされた時
     */
    onChartDoubleClick(params) {
        const { lastCondition, lookUp } = this.props;
        const lastDisplayTimeSpanId = lastCondition.displayTimeSpans[0].displayTimeSpanId;

        if (lastCondition.measuredDataType == MEASURED_DATA_TYPE.realTime
            || (lastDisplayTimeSpanId < DISPLAY_TIME_SPANS.day_byHalfAnHour)) {
            return;
        }

        const displayTimeSpanId = this.getDetailedDisplayTimeSpanId(lastDisplayTimeSpanId);
        const displayTimeSpans = [this.getDisplayTimeSpan(displayTimeSpanId)];
        const startDate = moment(params.value[0]);
        const condition = Object.assign({}, this.props.lastCondition, {
            displayTimeSpans: displayTimeSpans,
            startDate: startDate
        });

        this.setState({ date: startDate, displayTimeSpanId: displayTimeSpanId }, () => {
            this.loadData(condition);
        });
    }

    /**
     * 自動更新周期が変更された時
     * @param {any} interval
     */
    onUpdateIntervalChange(interval) {
        if (interval === AUTO_UPDATE_VALUES.none) {
            // 自動更新がOFFになった場合はタイマークリア
            this.clearAllTimer();
        }
        else if (this.state.updateInterval === AUTO_UPDATE_VALUES.none) {
            //自動更新がONになった場合はタイマースタート
            this.startTimer();
        }
        this.setState({ updateInterval: interval });
    }

    /**
     * 手動更新ボタンがクリックされた時
     */
    onManualUpdateClick() {
        this.updateDemandGraph();
    }

    /**
     * 権限情報を取得する
     */
    loadAuthentication() {
        getAuthentication(FUNCTION_ID_MAP.demandGraph, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    /**
     * マスターデータを取得
     */
    loadLookUp() {
        this.props.setLoadState_condition(true);
        sendData(EnumHttpMethod.get, 'api/DemandGraph/getLookUp', null, (lookUp, networkError) => {
            this.props.setLoadState_condition(false);
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
     * デマンドグラフを読み込む
     * @param {any} condition
     * @param {any} callback
     */
    loadData(condition, callback, isUpdate = false) {
        const url = condition.measuredDataType == MEASURED_DATA_TYPE.realTime ? 'getRealtimeDemandGraph' : 'getDigestDemandGraph';
        this.props.setLoadState_demandGraph(true);   //ロード中
        sendData(EnumHttpMethod.post, 'api/DemandGraph/' + url , condition, (demandGraph, networkError) => {
            this.props.setLoadState_demandGraph(false);  //ロード完了
            if (demandGraph) {
                this.props.setLastCondition(condition);
                this.props.setDemandGraph(demandGraph);
            }
            if (isUpdate || !networkError) {
                this.props.changeNetworkError(networkError);
            } else {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback(demandGraph);
            }
        });
    }

    /**
     * 検索条件を生成する
     */
    createSearchCondition() {
        const { measuredDataType } = this.props;
        const { displayGraphType, demandGraphMode, isPvEnergyLapped, date, displayTimeSpanId, location, updateInterval } = this.state;
        const condition = {
            locations: [location],
            startDate: updateInterval != AUTO_UPDATE_VALUES.none ? floorDate(moment(), displayTimeSpanId) : date,   //自動更新モードの場合は最新の日時
            measuredDataType: measuredDataType,
            displayTimeSpans: [this.getDisplayTimeSpan(displayTimeSpanId)],
            displayGraphType: displayGraphType,
            demandGraphMode: this.createSendDemandGraphMode(demandGraphMode),
            isPvEnergyLapped: isPvEnergyLapped
        };

        return condition;
    }

    /**
     * 送信用のデマンドグラフモードを生成する
     * @param {any} demandGraphMode
     */
    createSendDemandGraphMode(demandGraphMode) {
        const result = {};
        result[demandGraphMode] = null;
        return result;
    }

    /**
     * 表示期間を取得する
     * @param {any} displayTimeSpanId
     */
    getDisplayTimeSpan(displayTimeSpanId) {
        const { displayTimeSpans } = this.props.lookUp;
        return displayTimeSpans && displayTimeSpans.find((span) => span.displayTimeSpanId == displayTimeSpanId);
    }

    /**
     * 詳細な表示期間を取得する
     * @param {any} displayTimeSpanId
     */
    getDetailedDisplayTimeSpanId(displayTimeSpanId) {
        switch (displayTimeSpanId) {
            case DISPLAY_TIME_SPANS.year:
                return DISPLAY_TIME_SPANS.month;
            case DISPLAY_TIME_SPANS.month:
                return DISPLAY_TIME_SPANS.day_byHalfAnHour;
            case DISPLAY_TIME_SPANS.day_byHour:
                return DISPLAY_TIME_SPANS.hour;
            default:
                return DISPLAY_TIME_SPANS.halfAnHour;
        }
    }

    /**
     * ロケーションリストを生成する
     */
    createLocationList() {
        const { lookUp } = this.props;
        if (lookUp && lookUp.locations) {
            return this.props.measuredDataType == MEASURED_DATA_TYPE.realTime ?
                makeBranchSelectableLocation(lookUp.locations) : makeAreaEnabledLocation(lookUp.locations);
        }

        return [];
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
            this.fastTimerId = setTimeout(() => this.updateDemandGraph(interval), interval);
        } else if (interval === AUTO_UPDATE_VALUES.slow) {
            this.slowTimerId = setTimeout(() => this.updateDemandGraph(interval), interval);
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
     * 最新のデマンドグラフに更新する
     * @param {any} interval
     */
    updateDemandGraph(interval = null) {
        if (!interval || interval == this.state.updateInterval) {
            const condition = Object.assign({}, this.props.lastCondition);
            condition.startDate = floorDate(moment(), this.state.displayTimeSpanId);
            this.loadData(condition, interval && (() => {
                this.setTimer(interval);
            }), interval != null);
        } else {
            this.setTimer(interval);
        }    
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
        const { isLoading, lookUp, demandGraph, measuredDataType, waitingInfo, authentication, lastCondition, networkError } = this.props;
        const { message, displayTimeSpanId, date, hasDateError, displayGraphType, demandGraphMode, isPvEnergyLapped, location, updateInterval } = this.state;

        const locValidation = location ? successResult : errorResult("選択してください");

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
                    onSearchClick={() => this.onSearchClick()}
                    searchButtonDisabled={isLoading.graphData || hasDateError || locValidation.state == VALIDATE_STATE.error}
                    isLoading={isLoading.condition || !authentication.loadAuthentication}
                    onClear={() => this.setState({ location: null })}
                >
                    <Grid fluid>
                        <LocationForm
                            search
                            label="ロケーション："
                            locationList={this.createLocationList()}
                            selectedLocation={location}
                            onChange={(loc) => this.setState({ location: loc })}
                            validationState={locValidation.state}
                            helpText={locValidation.helpText}
                        />
                        <TimeSpanOption
                            disabled={updateInterval != AUTO_UPDATE_VALUES.none}
                            isDigest={measuredDataType === MEASURED_DATA_TYPE.summary}
                            date={date}
                            types={lookUp && lookUp.displayTimeSpans}
                            typeId={displayTimeSpanId}
                            onChange={(typeId, date, hasDateError) => this.setState({ date: date, displayTimeSpanId: typeId, hasDateError: hasDateError })}
                        />
                    </Grid>
                </SearchConditionBox>
                <DemandGraphBox
                    isReadOnly={isReadOnly}
                    isLoading={isLoading.demandGraph}
                    demandGraph={demandGraph}
                    measuredDataType={lastCondition && lastCondition.measuredDataType}
                    displayTimeSpanId={lastCondition && lastCondition.displayTimeSpans[0].displayTimeSpanId}
                    displayGraphType={displayGraphType}
                    demandGraphMode={demandGraphMode}
                    isPvEnergyLapped={isPvEnergyLapped}
                    location={lastCondition && lastCondition.locations[0]}
                    updateInterval={updateInterval}
                    onMoveClick={(direction) => this.onMoveClick(direction)}
                    onChangeDisplayGraphType={(type) => this.onChangeDisplayGraphType(type)}
                    onChangeDemandGraphMode={(mode) => this.onChangeDemandGraphMode(mode)}
                    onChangeisPvEnergyLapped={(val) => this.onChangeisPvEnergyLapped(val)}
                    onChartDoubleClick={(params) => this.onChartDoubleClick(params)}
                    onUpdateIntervalChange={(interval) => this.onUpdateIntervalChange(interval)}
                    onManualUpdateClick={() => this.onManualUpdateClick()}
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
        isLoading: state.isLoading,
        lookUp: state.lookUp,
        lastCondition: state.lastCondition,
        demandGraph: state.demandGraph,
        measuredDataType: state.measuredDataType,
        networkError: state.networkError
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        setWaitingState: (isWaiting, waitingType) => dispatch(setWaitingState(isWaiting, waitingType)),
        setLoadState: (isLoading) => dispatch(setLoadState(isLoading)),
        setLoadState_condition: (isLoading) => dispatch(setLoadState_condition(isLoading)),
        setLoadState_demandGraph: (isLoading) => dispatch(setLoadState_demandGraph(isLoading)),
        setLookUp: (lookUp) => dispatch(setLookUp(lookUp)),
        setLastCondition: (condition) => dispatch(setLastCondition(condition)),
        setDemandGraph: (demandGraph) => dispatch(setDemandGraph(demandGraph)),
        setMeasuredDataType: (type) => dispatch(setMeasuredDataType(type)),
        changeNetworkError: (isError) => dispatch(changeNetworkError(isError))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(DemandGraphPanel);

 