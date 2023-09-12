/**
 * @license Copyright 2019 DENSO
 * 
 * デマンドサマリ画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getSessionStorage, setSessionStorage, STORAGE_KEY } from 'webStorage';

import { Grid } from 'react-bootstrap'

import Content from 'Common/Layout/Content';

import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import LocationForm from 'Assets/Condition/LocationForm';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import TimeSpanOption from 'Assets/DemandGraph/TimeSpanOption';

import DemandSummaryBox from 'DemandSummary/DemandSummaryBox';
import DemandGraphModal from 'DemandSummary/DemandGraphModal';

import { setAuthentication } from 'Authentication/actions.js';
import { setLoadState, setLoadState_condition, setLoadState_result, setLoadState_demandGraph, setLookUp, setLastCondition, setDemandSummaryResult, setDemandGraph, setLastGraphCondition } from './actions.js';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { MEASURED_DATA_TYPE, DISPLAY_TIME_SPANS } from 'constant';
import { validateDate, VALIDATE_STATE, successResult, errorResult } from 'inputCheck';
import { makeBranchSelectableLocation } from 'locationUtility';
import { floorDate } from 'demandViewUtility';

class DemandSummaryPanel extends Component {

    constructor(props) {
        super(props);
        this.state = {
            message: {},
            date: floorDate(moment(), DISPLAY_TIME_SPANS.day_byHalfAnHour),
            displayTimeSpanId: DISPLAY_TIME_SPANS.day_byHalfAnHour,
            hasDateError: false,
            location: null,
            displayGraphType: 1,
            demandGraphMode: 1,
            isPvEnergyLapped: false,
            showDemandGraphModal: false
        };
    }

    /**
     * コンポーネントがマウントされた時
     */
    componentDidMount() {
        this.loadAuthentication();
        this.loadLookUp();
    }

    /**
     * 検索ボタンがクリックされた時
     */
    onSearchClick() {
        const condition = this.createSearchCondition();
        this.loadDemandSummary(condition);
    }

    /**
     * セルのリンクがクリックされた時
     * @param {any} startDate
     */
    onCellLinkClick(startDate) {
        const { lastCondition } = this.props;
        const { displayGraphType, demandGraphMode, isPvEnergyLapped } = this.state;

        const summaryDisplayTimeSpanId = lastCondition.displayTimeSpans[0].displayTimeSpanId;
        const displayTimeSpanId = this.getGraphDisplayTimeSpanId(summaryDisplayTimeSpanId);
        const displayTimeSpans = [{ displayTimeSpanId: displayTimeSpanId }];
        const condition = {
            locations: lastCondition.locations,
            displayTimeSpans: displayTimeSpans,
            startDate: startDate,
            displayGraphType: displayGraphType,
            demandGraphMode: this.createSendDemandGraphMode(demandGraphMode),
            isPvEnergyLapped: isPvEnergyLapped
        };

        this.loadDemandGraph(condition);
        this.setState({ showDemandGraphModal: true });
    }

    /**
     * デマンドグラフ種別が変更された時
     * @param {any} type
     */
    onChangeDisplayGraphType(type) {
        const condition = Object.assign({}, this.props.lastGraphCondition, {
            displayGraphType: type
        });

        this.setState({ displayGraphType: type });
        this.loadDemandGraph(condition);
    }

    /**
     * グラフモードが変更された時
     * @param {any} mode
     */
    onChangeDemandGraphMode(mode) {
        const condition = Object.assign({}, this.props.lastGraphCondition, {
            demandGraphMode: this.createSendDemandGraphMode(mode)
        });

        this.setState({ demandGraphMode: mode });
        this.loadDemandGraph(condition);
    }

    /**
     * 重ねて表示が変更された時
     * @param {any} isPvEnergyLapped
     */
    onChangeIsPvEnergyLapped(isPvEnergyLapped) {
        const condition = Object.assign({}, this.props.lastGraphCondition, {
            isPvEnergyLapped: isPvEnergyLapped
        });

        this.setState({ isPvEnergyLapped: isPvEnergyLapped });
        this.loadDemandGraph(condition);
    }

    /**
     * 権限情報を取得する
     */
    loadAuthentication() {
        getAuthentication(FUNCTION_ID_MAP.demandSummary, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    /**
     * マスターデータを読み込む
     */
    loadLookUp() {
        this.props.setLoadState_condition(true);
        sendData(EnumHttpMethod.get, '/api/DemandSummary', null, (lookUp, networkError) => {
            this.props.setLoadState_condition(false);
            if (lookUp) {
                this.props.setLookUp(lookUp);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * デマンドサマリを読み込む
     * @param {any} condition
     */
    loadDemandSummary(condition) {
        this.props.setLoadState_result(true);
        sendData(EnumHttpMethod.post, '/api/DemandSummary/getResult', condition, (result, networkError) => {
            this.props.setLoadState_result(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                this.props.setLastCondition(condition);
                this.props.setDemandSummaryResult(result);
            }
        });
    }

    /**
     * デマンドグラフを読み込む
     * @param {any} condition
     */
    loadDemandGraph(condition, callback) {
        this.props.setLoadState_demandGraph(true);
        sendData(EnumHttpMethod.post, 'api/DemandGraph/getDigestDemandGraph', condition, (demandGraph, networkError) => {
            this.props.setLoadState_demandGraph(false);
            this.props.setLastGraphCondition(condition);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                this.props.setDemandGraph(demandGraph);
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
        const { date, displayTimeSpanId, location } = this.state;
        return {
            locations: [{ systemId: location.systemId, locationId: location.locationId, hasDemandSet: location.hasDemandSet }],
            startDate: date,
            displayTimeSpans: [{ displayTimeSpanId: displayTimeSpanId }]
        };
    }

    /**
     * グラフの表示期間を取得
     * @param {any} summaryDisplayTimeSpanId
     */
    getGraphDisplayTimeSpanId(summaryDisplayTimeSpanId) {
        switch (summaryDisplayTimeSpanId) {
            case DISPLAY_TIME_SPANS.month:
                return DISPLAY_TIME_SPANS.day_byHalfAnHour;

            case DISPLAY_TIME_SPANS.year:
                return DISPLAY_TIME_SPANS.month;

            default:
                return DISPLAY_TIME_SPANS.halfAnHour;                
        }
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
     * ロケーションリストを生成する
     */
    createLocationList() {
        const { lookUp } = this.props;
        if (lookUp && lookUp.locations) {
            return makeBranchSelectableLocation(lookUp.locations);
        }

        return [];
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
     * メッセージを消す
     */
    clearMessage() {
        this.setState({ message: Object.assign({}, this.state.message, { show: false }) });
    }

    /**
     * render
     */
    render() {
        const { isReadOnly, level, loadAuthentication } = this.props.authentication;
        const { isLoading, authentication, demandSummaryResult, demandGraph, lastCondition, lookUp } = this.props;
        const { message, date, hasDateError, location, displayTimeSpanId, displayGraphType, demandGraphMode, isPvEnergyLapped, showDemandGraphModal } = this.state;

        const locValidation = location ? successResult : errorResult("選択してください");

        return (
            <Content>
                <SearchConditionBox
                    onSearchClick={() => this.onSearchClick()}
                    searchButtonDisabled={isLoading.result || hasDateError || locValidation.state == VALIDATE_STATE.error}
                    isLoading={isLoading.condition || !loadAuthentication}
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
                            isDigest={true}
                            date={date}
                            typeId={displayTimeSpanId}
                            types={lookUp && lookUp.displayTimeSpans}
                            onChange={(typeId, date, hasDateError) => this.setState({ date: date, displayTimeSpanId: typeId, hasDateError: hasDateError })}
                        />
                    </Grid>
                </SearchConditionBox>
                <DemandSummaryBox
                    isLoading={isLoading.result}
                    demandSummaryResult={demandSummaryResult}
                    onCellLinkClick={(startDate) => this.onCellLinkClick(startDate)}
                    displayTimeSpanId={lastCondition && lastCondition.displayTimeSpans[0].displayTimeSpanId}
                    startDate={lastCondition && lastCondition.startDate}
                />
                <DemandGraphModal
                    isLoading={isLoading.demandGraph}
                    show={showDemandGraphModal}
                    demandGraph={demandGraph}
                    onHide={() => this.setState({ showDemandGraphModal: false })}
                    displayTimeSpanId={lastCondition && this.getGraphDisplayTimeSpanId(lastCondition.displayTimeSpans[0].displayTimeSpanId)}
                    displayGraphType={displayGraphType}
                    demandGraphMode={demandGraphMode}
                    isPvEnergyLapped={isPvEnergyLapped}
                    onChangeDisplayGraphType={(type) => this.onChangeDisplayGraphType(type)}
                    onChangeDemandGraphMode={(val) => this.onChangeDemandGraphMode(val)}
                    onChangeIsPvEnergyLapped={(val) => this.onChangeIsPvEnergyLapped(val)}
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
            </Content>
        );
    }
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
const mapStateToProps = (state) => {
    return {
        authentication: state.authentication,
        isLoading: state.isLoading,
        lookUp: state.lookUp,
        lastCondition: state.lastCondition,
        demandSummaryResult: state.demandSummaryResult,
        demandGraph: state.demandGraph,
        lastGraphCondition: state.lastGraphCondition
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        setLookUp: (lookUp) => dispatch(setLookUp(lookUp)),
        setLoadState: (isLoading) => dispatch(setLoadState(isLoading)),
        setLoadState_condition: (isLoading) => dispatch(setLoadState_condition(isLoading)),
        setLoadState_result: (isLoading) => dispatch(setLoadState_result(isLoading)),
        setLoadState_demandGraph: (isLoading) => dispatch(setLoadState_demandGraph(isLoading)),
        setDemandSummaryResult: (result) => dispatch(setDemandSummaryResult(result)),
        setLastCondition: (condition) => dispatch(setLastCondition(condition)),
        setDemandGraph: (demandGraph) => dispatch(setDemandGraph(demandGraph)),
        setLastGraphCondition: (condition) => dispatch(setLastGraphCondition(condition))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(DemandSummaryPanel);

