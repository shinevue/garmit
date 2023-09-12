/**
 * Copyright 2017 DENSO Solutions
 * 
 * リアルタイムモニタ画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getSessionStorage, setSessionStorage, STORAGE_KEY } from 'webStorage';

import { Grid, Row, Col, Form, FormControl, FormGroup, Checkbox, HelpBlock } from 'react-bootstrap'

import Content from 'Common/Layout/Content';
import Box from 'Common/Layout/Box';

import DateTimeSpanForm from 'Common/Form/DateTimeSpanForm';
import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import TrendGraphModal from 'Assets/Modal/TrendGraphModal';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import NetworkAlert from 'Assets/NetworkAlert';
import AutoUpdateButtonGroup from 'Assets/AutoUpdateButtonGroup';

import AlarmListPanel from 'IncidentLog/AlarmListPanel';
import ContactLogPanel from 'IncidentLog/ContactLogPanel';

import { setAuthentication } from 'Authentication/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { changeNetworkError } from 'NetworkError/actions.js';
import { setLoadState, setLoadState_condition, setLoadState_result, setLookUp, setLastSearchCondition, setAlarmResult, setContactChangeResult, setAlarmResultDisplayState, setContactChangeResultDisplayState } from './actions.js';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';
import { validateDate, VALIDATE_STATE, errorResult, successResult } from 'inputCheck';
import { AUTO_UPDATE_VALUES } from 'constant';
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

const DATE_FORMAT = 'YYYY/MM/DD HH:mm';

class IncidentLogPanel extends Component {

    constructor(){
        super();
        this.state = {
            searchCondition: {
                locations: [],
                enterprises: [],
                tags: [],
                egroups: [],
                hashTags: []
            },
            updateInterval: AUTO_UPDATE_VALUES.slow,
            searchAlarm: true,
            searchContact: true,
            from: null,
            to: null,
            inputCheck: {
                from: successResult,
                to: successResult
            },
            confirmAlarmIds: null,
            deleteAlarmIds: null,
            graphInfo: null,
            message: { show: false }
        }
    }

    /**
     * 権限情報を取得する
     */
    loadAuthentication(){
        getAuthentication(FUNCTION_ID_MAP.incidentLog, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    /**
     * マスタデータを読み込む
     */
    loadLookUp() {
        this.props.setLoadState_condition(true);
        sendData(EnumHttpMethod.get, 'api/incidentLog/getLookUp', null, (lookUp, networkError) => {
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
     * インシデントログを読み込む
     * @param {any} callback
     */
    loadData(callback, isUpdate) {
        const condition = this.createSearchCondition();
        this.props.setLoadState_result(true);   // ロード中
        sendData(EnumHttpMethod.post, 'api/incidentLog/getIncidents', condition, (data, networkError) => {
            this.props.setLoadState_result(false);  // ロード完了
            this.props.setLastSearchCondition(condition);   // 検索条件を保持しておく
            if (data && data.alarmResult && data.contactChangeResult) {
                this.props.setAlarmResult(data.alarmResult);
                this.props.setContactChangeResult(data.contactChangeResult);
            } else if (!networkError) {
                this.setState({
                    message: {
                        show: true,
                        title: 'エラー',
                        buttonStyle: 'message',
                        message: 'データの取得に失敗しました。',
                        onCancel: () => this.clearMessage()
                    }
                });
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
     * インシデントログの表示を更新する
     * @param {any} callback
     */
    updateData(callback) {
        this.props.setLoadState_result(true);   // ロード中
        sendData(EnumHttpMethod.post, 'api/incidentLog/getIncidents', this.props.lastSearchCondition, (data, networkError) => {
            this.props.setLoadState_result(false);  // ロード完了
            if (data) {
                this.props.setAlarmResult(data.alarmResult);
                this.props.setContactChangeResult(data.contactChangeResult);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                this.props.changeNetworkError(false);
            }
            if (callback) {
                callback(data);
            }
        });
    }

    /**
     * アラームを削除する
     * @param {any} ids
     */
    deleteAlarms(ids) {
        this.props.setWaitingState(true, 'delete');
        sendData(EnumHttpMethod.post, 'api/incidentLog/deleteAlarms', ids, (result, networkError) => {
            this.props.setWaitingState(false); // ロード完了
            if (result && result.isSuccess) {
                this.updateData();
            }
            this.setState({
                message: {
                    show: true,
                    title: networkError ? 'エラー' : '削除',
                    buttonStyle: 'message',
                    message: networkError ? NETWORKERROR_MESSAGE : (result && result.message),
                    onCancel: () => this.clearMessage()
                }
            });
            if (!networkError) {
                this.props.changeNetworkError(false);
            }
        });
    }

    /**
     * アラームを確認状態にする
     * @param {any} ids
     */
    confirmAlarms(ids) {
        this.props.setWaitingState(true, 'update');
        sendData(EnumHttpMethod.post, 'api/incidentLog/confirmAlarms', ids, (result, networkError) => {
            this.props.setWaitingState(false); // ロード完了
            if (result && result.isSuccess) {
                this.updateData();
            }
            this.setState({
                message: {
                    show: true,
                    title: networkError ? 'エラー' : '確認',
                    buttonStyle: 'message',
                    message: networkError ? NETWORKERROR_MESSAGE : (result && result.message),
                    onCancel: () => this.clearMessage()
                }
            });
            if (!networkError) {
                this.props.changeNetworkError(false);
            }
        });
    }

    /**
     * コンポーネントがマウントされる前
     */
    componentWillMount() {
        const startDate = getSessionStorage(STORAGE_KEY.startDate);
        const endDate = getSessionStorage(STORAGE_KEY.endDate);
        this.initDate(startDate, endDate);
        if (startDate && endDate) {
            this.setState({ updateInterval: AUTO_UPDATE_VALUES.none });
        }
    }

    /**
     * コンポーネントがマウントされた時
     */
    componentDidMount() {
        this.loadAuthentication();
        this.loadLookUp();
        this.loadData((data) => {
            if (this.state.updateInterval !== AUTO_UPDATE_VALUES.none) {
                this.startTimer();
            }
        });
    }

    /**
     * 検索ボタンクリックイベント
     */
    onSearchClick(condition) {
        this.clearAllTimer();
        // 検索条件をセットする
        this.setState({ searchCondition: condition, updateInterval: AUTO_UPDATE_VALUES.none }, () => {
            this.loadData();
        });
    }

    /**
     * 削除ボタンがクリックされた時
     * @param {any} ids
     */
    onDeleteClick(ids) {
        this.setState({
            message: {
                show: true,
                title: '削除',
                buttonStyle: 'delete',
                message: 'アラームを削除してもよろしいですか？',
                onOK: () => {
                    this.clearMessage();
                    this.deleteAlarms(ids)
                },
                onCancel: () => this.clearMessage()
            }
        });
    }

    /**
     * 確認ボタンがクリックされた時
     * @param {any} ids
     */
    onConfirmClick(ids) {
        this.setState({
            message: {
                show: true,
                title: '確認',
                buttonStyle: 'confirm',
                message: 'アラームを確認状態にしてもよろしいですか？',
                onOK: () => {
                    this.clearMessage();
                    this.confirmAlarms(ids);
                },
                onCancel: () => this.clearMessage()
            }
        });
    }

    /**
     * 自動更新モードが変更された時
     * @param {any} newInterval
     */
    onChangeAutoUpdate(newInterval) {
        if (newInterval === AUTO_UPDATE_VALUES.none) {
            // 自動更新がOFFになった場合はタイマークリア
            this.clearAllTimer();
        }
        else if (this.state.updateInterval === AUTO_UPDATE_VALUES.none) {
            // 自動更新がONになった場合はタイマースタート
            this.setState({ updateInterval: newInterval }, () => {
                this.loadData(() => {
                    this.startTimer();
                });
            });
            return;
        }
        this.setState({ updateInterval: newInterval });
    }

    /**
     * アラーム一覧の表示状態が変化したとき
     * @param {any} setting
     */
    onAlarmResultTableSettingChange(setting) {
        this.props.setAlarmResultDisplayState(setting);
    }

    /**
     * 接点状態変化の表示状態が変化したとき
     * @param {any} setting
     */
    onContactChangeResultTableSettingChange(setting) {
        this.props.setContactChangeResultDisplayState(setting);
    }

    /**
     * トレンドグラフモーダルの閉じるイベント
     */
    handleCloseTrendGraphModal() {
        this.setState({ showTrendGraphModal: false }, () => {
            this.props.setGraphDatas(null);
        })
    }

    /**
     * 発生日時の日付選択フォームの値が変更された時
     * @param {any} from
     * @param {any} to
     */
    handleDateChange(from, to) {
        const inputCheck = Object.assign({}, this.state.inputCheck);
        inputCheck.from = validateDate(from, DATE_FORMAT, false);
        inputCheck.to = validateDate(to, DATE_FORMAT, false);

        if (inputCheck.from.state == VALIDATE_STATE.success && inputCheck.to.state == VALIDATE_STATE.success && !moment(to).isAfter(from)) {
            inputCheck.to = errorResult('終了日時は開始日時以降となるように設定してください');
        }

        this.setState({ from: from, to: to, inputCheck: inputCheck });
    }

    /**
    * インシデントログを更新する
    * @param {any} interval
    */
    updateValue(interval) {
        if (interval === this.state.updateInterval) {
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
     * フォームにエラーがあるか
     * @param {any} inputCheck
     */
    hasErrorState(inputCheck) {
        for (let key of Object.keys(inputCheck)) {
            if (inputCheck[key].state === VALIDATE_STATE.error) {
                return true;
            }
        }
        return false;
    }

    /**
     * 検索条件を生成する
     */
    createSearchCondition() {
        const autoUpdate = this.state.updateInterval !== AUTO_UPDATE_VALUES.none;
        const searchCondition = autoUpdate ? {
            locations: [],
            enterprises: [],
            tags: [],
            egroups: [],
            hashTags: []
        } : Object.assign({}, this.state.searchCondition);

        searchCondition.startDate = autoUpdate ? null : this.state.from;
        searchCondition.endDate = autoUpdate ? null : this.state.to;
        searchCondition.alarmHistorySearch = autoUpdate || this.state.searchAlarm;
        searchCondition.contactChangeSearch = autoUpdate || this.state.searchContact;
        searchCondition.occurringAlarmSearch = autoUpdate;
        return searchCondition;
    }

    /**
     * 日付指定を初期化する
     */
    initDate(startDate, endDate) {
        const to = endDate ? moment(endDate) : moment().startOf('minute');
        const from = startDate ? moment(startDate) : moment(to).add(-1, 'hours');
        this.setState({ from: from, to: to });
    }

    /**
     * 検索条件のトップに表示するコンポーネントを生成する
     */
    makeTopConditions() {
        const error = !this.state.searchAlarm && !this.state.searchContact;

        return (
            <Grid fluid className="mb-2">
                <Form inline>
                    <span className="va-t">検索対象：</span>
                    <FormGroup validationState={error && 'error'}>
                        <Checkbox inline 
                            className="mr-2" 
                            checked={this.state.searchAlarm}
                            onClick={() => this.setState({ searchAlarm: !this.state.searchAlarm })}
                        >
                            アラーム
                        </Checkbox>
                        <Checkbox inline
                            checked={this.state.searchContact}
                            onClick={() => this.setState({ searchContact: !this.state.searchContact })}  
                        >
                            接点状態変化
                        </Checkbox>
                        {error && <HelpBlock>検索対象が選択されていません</HelpBlock>}
                    </FormGroup>
                </Form>
            </Grid>
        );
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
        const message = Object.assign({}, this.state.message);
        message.show = false;
        this.setState({ message: message });
    }

    /**
     * render
     */
    render() {
        const { isReadOnly, level } = this.props.authentication;
        const { isLoading, lookUp, alarmResult, contactChangeResult, waitingInfo, alarmResultDisplayState, contactChangeResultDisplayState, authentication, networkError, lastSearchCondition } = this.props;
        const { from, to, showTrendGraphModal, inputCheck, updateInterval, message, graphDatas, graphInfo, searchContact, searchAlarm } = this.state;

        return (
            <Content>
                <NetworkAlert show={networkError.isNetworkError} />
                <SearchConditionBox useHotKeys
                    isLoading={isLoading.condition || !authentication.loadAuthentication}
                    lookUp={lookUp}
                    targets={['locations', 'enterprises', 'tags', 'egroups', 'hashTags']}
                    onSearchClick={(condition) => this.onSearchClick(condition)}
                    topConditions={this.makeTopConditions()}
                    defaultClose={true}
                    searchButtonDisabled={this.hasErrorState(inputCheck) || isLoading.result || (!searchAlarm && !searchContact)}
                >                    
                    <Grid fluid>
                        <Row className="mt-05">
                            <Col md={12}>
                                <Form inline>
                                    発生日時：
                                    <DateTimeSpanForm
                                        from={from}
                                        to={to}
                                        format="YYYY/MM/DD HH:mm"
                                        timePicker={true}
                                        onChange={(from, to) => this.handleDateChange(from, to)}
                                        validationFrom={inputCheck.from}
                                        validationTo={inputCheck.to}
                                        isReadOnly={updateInterval !== AUTO_UPDATE_VALUES.none}
                                    />
                                </Form>
                            </Col>
                        </Row>
                    </Grid>
                </SearchConditionBox>
                <Box boxStyle='default' isLoading={isLoading.result}>
                    <Box.Header>
                        <Box.Title>インシデント</Box.Title>
                    </Box.Header >
                    <Box.Body>
                        <Grid fluid>
                            <Row className="mb-1">
                                <Col sm={12}>
                                    <div className="pull-right">
                                        <AutoUpdateButtonGroup useHotKeys
                                            value={updateInterval}
                                            onChange={(val) => this.onChangeAutoUpdate(val)}
                                            onManualUpdateClick={() => this.loadData(null, true)}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <AlarmListPanel
                                isReadOnly={isReadOnly}
                                level={level}
                                alarmResult={alarmResult}
                                tableSetting={alarmResultDisplayState}
                                searchOccuringAlarm={updateInterval != AUTO_UPDATE_VALUES.none}
                                lastSearchCondition={lastSearchCondition}
                                onTableSettingChange={(setting) => this.onAlarmResultTableSettingChange(setting)}
                                onDeleteClick={(ids) => this.onDeleteClick(ids)}
                                onConfirmClick={(ids) => this.onConfirmClick(ids)}
                                onGraphDispClick={(info) => this.setState({ showTrendGraphModal: true, graphInfo: info })}
                                onColumnSettingChange={() => this.loadData()}
                            />
                            <ContactLogPanel
                                isReadOnly={isReadOnly}
                                contactChangeResult={contactChangeResult}
                                tableSetting={contactChangeResultDisplayState}
                                lastSearchCondition={lastSearchCondition}
                                onTableSettingChange={(setting) => this.onContactChangeResultTableSettingChange(setting)}
                                onColumnSettingChange={() => this.loadData()}
                            />
                            <TrendGraphModal
                                showModal={showTrendGraphModal}
                                pointNos={graphInfo && [graphInfo.pointNo]}
                                onHide={() => this.setState({ showTrendGraphModal: false })}
                                graphDatas={graphDatas}
                                endDate={graphInfo && graphInfo.endDate}
                                startDate={graphInfo && graphInfo.startDate}
                            />
                            <MessageModal
                                show={message.show}
                                title={message.title}
                                bsSize="small"
                                buttonStyle={message.buttonStyle}
                                onOK={message.onOK}
                                onCancel={message.onCancel}
                                //disabled={isLoading.result}
                            >
                                {message.message}
                            </MessageModal>
                            <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />
                        </Grid>
                    </Box.Body>
                </Box >
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
        waitingInfo: state.waitingInfo,
        lookUp: state.lookUp,
        lastSearchCondition: state.lastSearchCondition,
        alarmResult: state.alarmResult,
        contactChangeResult: state.contactChangeResult,
        alarmResultDisplayState: state.alarmResultDisplayState,
        contactChangeResultDisplayState: state.contactChangeResultDisplayState,
        networkError: state.networkError
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        setLoadState: (isLoading) => dispatch(setLoadState(isLoading)),
        setLoadState_condition: (isLoading) => dispatch(setLoadState_condition(isLoading)),
        setLoadState_result: (isLoading) => dispatch(setLoadState_result(isLoading)),
        setWaitingState: (isWaiting, type) => dispatch(setWaitingState(isWaiting, type)),
        setLookUp: (lookUp) => dispatch(setLookUp(lookUp)),
        setLastSearchCondition: (condition) => dispatch(setLastSearchCondition(condition)),
        setAlarmResult: (alarmResult) => dispatch(setAlarmResult(alarmResult)),
        setContactChangeResult: (contactChangeResult) => dispatch(setContactChangeResult(contactChangeResult)),
        setAlarmResultDisplayState: (state) => dispatch(setAlarmResultDisplayState(state)),
        setContactChangeResultDisplayState: (state) => dispatch(setContactChangeResultDisplayState(state)),
        changeNetworkError: (isError) => dispatch(changeNetworkError(isError))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(IncidentLogPanel);

 