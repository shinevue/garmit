/**
 * Copyright 2017 DENSO Solutions
 * 
 * リアルタイムモニタ画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import RealTimeMonitorBox from 'RealTimeMonitor/RealTimeMonitorBox';

import SearchConditionBox from 'Assets/Condition/SearchConditionBox';

import Content from 'Common/Layout/Content';
import Box from 'Common/Layout/Box';
import BoxColseButton from 'Common/Widget/BoxColseButton';
import MessageModal from 'Assets/Modal/MessageModal';
import NetworkAlert from 'Assets/NetworkAlert'; 

import { setAuthentication } from 'Authentication/actions.js';
import { setLookUp, setSearchCondition, setEditingCondition } from 'SearchCondition/actions.js';
import { changeNetworkError } from 'NetworkError/actions.js';
import {
    changeLoadState, changeLoadState_condition, changeLoadState_realtimeData,
    setCurrentData, setLastData, setCurrentConvertedData, setLastConvertedData
} from './actions.js';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';　　
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { AUTO_UPDATE_VALUES } from 'constant';

const SEARCH_CONDITION_TARGETS = ['locations', 'enterprises', 'tags', 'egroups', 'hashTags'];

class RealTimeMonitorPanel extends Component {

    constructor(){
        super();
        this.state = {
            dispPointNo: null,
            searchCondition: null,
            isConvert: false,
            updateInterval: AUTO_UPDATE_VALUES.none,
            message: {}
        }
    }

    /**
     * 権限情報を取得する
     */
    loadAuthentication(){
        getAuthentication(FUNCTION_ID_MAP.enterpriseEdit, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    /**
     * マスタデータを読み込む
     */
    loadLookUp() {
        this.props.changeLoadState_condition(true);
        sendData(EnumHttpMethod.get, 'api/realTimeMonitor/getLookUp', null, (lookUp, networkError) => {
            this.props.changeLoadState_condition(false);
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
     * リアルタイムデータを読み込む
     * @param {any} callback
     */
    loadData(callback, isUpdate) {
        this.props.setLastData(this.props.currentData);
        this.props.setLastConvertedData(this.props.currentConvertedData);
        this.props.changeLoadState_realtimeData(true);   // ロード中
        sendData(EnumHttpMethod.post, 'api/realTimeMonitor/getData', this.makeSearchCondition(false), (data, networkError) => {
            sendData(EnumHttpMethod.post, 'api/realTimeMonitor/getData', this.makeSearchCondition(true), (convertedData, networkError) => {
                this.props.changeLoadState_realtimeData(false);  // ロード完了
                if (data && !data.requestResult.isSuccess) {
                    this.showErrorMessage(data.requestResult.message);
                    this.setState({ updateInterval: AUTO_UPDATE_VALUES.none }, () => {
                        if (callback) {
                            callback(data, convertedData);
                        };
                    });
                    this.clearAllTimer();
                    if (!networkError) {
                        this.props.changeNetworkError(false);
                    }
                } else {
                    if (data && convertedData) {
                        this.props.setCurrentData(data);
                        this.props.setCurrentConvertedData(convertedData);
                    }
                    if (isUpdate || !networkError) {
                        this.props.changeNetworkError(networkError);
                    } else {
                        this.showNetWorkErrorMessage();
                    }
                    if (callback) {
                        callback(data, convertedData);
                    };
                }
            });            
        });
    }

    /**
     * 計測値を更新する
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
     * Componentがマウントされるときに1度だけ呼ばれます。
     */
    componentDidMount() {
        this.loadAuthentication();
        this.loadLookUp();
    }

    /**
     * 検索ボタンクリックイベント
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
     * 換算表示するかどうかが変更された時
     * @param {any} val
     */
    onIsConvertChange(val) {
        this.setState({ isConvert: val });
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
     * 検索を実行する
     * @param {any} condition
     */
    search(condition) {
        this.clearAllTimer();
        this.setState({ searchCondition: condition }, () => {
            this.loadData((data, iserr) => {
                if (this.state.updateInterval !== AUTO_UPDATE_VALUES.none) {
                    this.startTimer();
                }
            });
        });
    }
    
    /**
     * 検索条件を生成する
     * @param {any} isConvert
     */
    makeSearchCondition(isConvert) {
        // 検索条件に換算するかどうかをセット
        const condition = Object.assign({}, this.state.searchCondition);
        condition.isConvert = isConvert

        return condition;
    }

    /**
     * 検索条件指定がないかどうか
     * @param {any} condition
     */
    isAllSearch(condition) {
        return !SEARCH_CONDITION_TARGETS.some((target) => condition[target] && condition[target].length > 0);
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
     * メッセージを消去する
     */
    clearMessage() {
        this.setState({ message: Object.assign({}, this.state.message, { show: false }) });
    }

    render() {
        const { currentData, lastData, isLoading, searchCondition, currentConvertedData, lastConvertedData, authentication, networkError } = this.props;
        const { lookUp } = searchCondition;
        const { dispPointNo, updateInterval, isConvert, message } = this.state;
        return (
            <Content>
                <NetworkAlert show={networkError.isNetworkError} />
                <SearchConditionBox
                    targets={SEARCH_CONDITION_TARGETS}
                    onSearchClick={(condition) => this.onSearchClick(condition)}
                    lookUp={lookUp}
                    isLoading={isLoading.condition || !authentication.loadAuthentication}
                    searchButtonDisabled={isLoading.realtimeData}
                />
                <RealTimeMonitorBox
                    isLoading={isLoading.realtimeData}
                    currentData={isConvert ? currentConvertedData : currentData}
                    lastData={isConvert ? lastConvertedData : lastData}
                    dataTypes={lookUp && lookUp.dataTypes}
                    updateInterval={updateInterval}
                    onUpdateIntervalChange={(val) => this.onUpdateIntervalChange(val)}
                    onManualUpdateClick={() => this.loadData(null, true)}
                    isConvert={isConvert}
                    onIsConvertChange={(val) => this.onIsConvertChange(val)}
                />
                <MessageModal
                    show={message.show}
                    title={message.title}
                    bsSize="sm"
                    bsStyle="warning"
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
        searchCondition: state.searchCondition,
        currentData: state.currentData,
        lastData: state.lastData,
        currentConvertedData: state.currentConvertedData,
        lastConvertedData: state.lastConvertedData,
        networkError: state.networkError
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        changeLoadState: (isLoad) => dispatch(changeLoadState(isLoad)),
        changeLoadState_condition: (isLoad) => dispatch(changeLoadState_condition(isLoad)),
        changeLoadState_realtimeData: (isLoad) => dispatch(changeLoadState_realtimeData(isLoad)),
        setLookUp: (lookUp) => dispatch(setLookUp(lookUp)),
        setCurrentData: (data) => dispatch(setCurrentData(data)),
        setLastData: (data) => dispatch(setLastData(data)),
        setCurrentConvertedData: (data) => dispatch(setCurrentConvertedData(data)),
        setLastConvertedData: (data) => dispatch(setLastConvertedData(data)),
        changeNetworkError: (isError) => dispatch(changeNetworkError(isError))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(RealTimeMonitorPanel);

 