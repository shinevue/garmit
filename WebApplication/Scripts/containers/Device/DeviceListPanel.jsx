/**
 * @license Copyright 2017 DENSO
 * 
 * サンプル画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getSessionStorage, setSessionStorage, STORAGE_KEY } from 'webStorage';
import { browserHistory } from 'react-router';

import { Row, Col } from 'react-bootstrap';

import Content from 'Common/Layout/Content';

import AutoUpdateButtonGroup from 'Assets/AutoUpdateButtonGroup';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import NetworkAlert from 'Assets/NetworkAlert';

import DeviceListBox from 'Device/DeviceListBox';
import DeviceStateBox from 'Device/DeviceStateBox';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';
　　
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

import { AUTO_UPDATE_VALUES } from 'constant';

import { setAuthentication } from 'Authentication/actions.js';
import { setDisplayState, setSearchResult } from 'SearchResult/actions.js';
import { changeLoadState } from 'LoadState/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { changeNetworkError } from 'NetworkError/actions.js';
import { setDatagates, setEditedDatagate, setGateStatus, setDatabases } from './actions.js';

class DeviceListPanel extends Component {

    constructor(){
        super();
        this.state = {
            message: {},
            updateInterval: AUTO_UPDATE_VALUES.none
        };
    }

    /**
     * コンポーネントがマウントされた時
     */
    componentDidMount() {
        this.loadAuthentication();
        this.loadDatabases();
        this.loadDatagates((info) => {
            const gateId = getSessionStorage(STORAGE_KEY.gateId)
                || (this.props.gateStatus && this.props.gateStatus.gateId)
                || (info && info.datagates && info.datagates[0].gateId);
            if (gateId) {
                this.loadGateStatus(gateId);
            }
        });
    }

    /**
     * 値を更新する
     * @param {any} interval
     */
    updateValue(interval) {
        if (interval === this.state.updateInterval) {
            this.loadDatagates(() => {
                if (this.props.gateStatus != null) {
                    this.loadGateStatus(this.props.gateStatus.gateId, () => {
                        this.setTimer(interval);
                    }, true);
                } else {
                    this.setTimer(interval);
                }
            }, true);
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
     * 権限情報を読み込む
     */
    loadAuthentication() {
        getAuthentication(FUNCTION_ID_MAP.gateEdit, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    /**
     * データゲートリストを読み込む
     * @param {any} callback
     */
    loadDatagates(callback, isUpdate) {
        this.props.changeLoadState();
        sendData(EnumHttpMethod.get, '/api/device/getDatagates', null, (info, networkError) => {
            this.props.changeLoadState();
            if (info) {
                this.props.setDatagates(info.datagates);
                this.props.setSearchResult(info.datagateResult);
            }
            if (isUpdate || !networkError) {
                this.props.changeNetworkError(networkError);
            } else {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback(info);
            }
        });
    }

    /**
     * ゲートステータスを読み込む
     * @param {any} gateId
     * @param {any} callback
     */
    loadGateStatus(gateId, callback, isUpdate) {
        this.props.changeLoadState();
        sendData(EnumHttpMethod.get, '/api/device/getGateStatus?gateId=' + gateId, null, (gateStatus, networkError) => {
            this.props.changeLoadState();
            if (gateStatus) {
                this.props.setGateStatus(gateStatus);
            }
            if (isUpdate || !networkError) {
                this.props.changeNetworkError(networkError);
            } else {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback(gateStatus);
            }
        });
    }

    /**
     * DB一覧を読み込む
     */
    loadDatabases() {
        sendData(EnumHttpMethod.get, '/api/device/getDatabases', null, (databases, networkError) => {
            this.props.setDatabases(databases);
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * 機器をリセットする
     * @param {any} gateId
     */
    resetGate(gateStatus) {
        sendData(EnumHttpMethod.post, '/api/device/resetDatagate', gateStatus, (result, networkError) => {
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                this.props.changeNetworkError(false);
            }
        });
    }

    /**
     * リセットがクリックされた時
     * @param {any} gateStatus
     */
    onResetClick(gateStatus) {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'confirm',
                title: 'リセット',
                message: (
                    <div>
                        <p>リセットしてもよろしいですか？</p>
                        <small>※リセットの反映には時間がかかります。</small>
                    </div>
                ),
                onOK: () => {
                    this.clearMessage();
                    this.resetGate(gateStatus);
                },
                onCancel: () => this.clearMessage()
            }
        });
    }

    /**
     * 編集ボタンがクリックされた時
     * @param {any} gateId
     */
    onEditClick(gateId) {
        const targetDatagate = this.props.datagates.find((datagate) => datagate.gateId == gateId);
        this.props.setEditedDatagate(Object.assign({}, targetDatagate, { poolInterval: targetDatagate.poolInterval && targetDatagate.poolInterval / 1000 }));   // 収集周期を秒単位に直してセットする
        this.clearAllTimer();
        browserHistory.push({ pathname: '/Maintenance/Device/Edit', query: { mode: 'edit' } });
    }

    /**
     * ゲートステータス表示ボタンがクリックされた時
     * @param {any} gateId
     */
    onShowGateStatusClick(gateId) {
        this.loadGateStatus(gateId);
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
     * 表示データを更新する
     */
    updateData(isUpdate) {
        this.loadDatagates(null, isUpdate);
        if (this.props.gateStatus) {
            this.loadGateStatus(this.props.gateStatus.gateId, null, isUpdate);
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
        const { isLoading, searchResult, gateStatus, waitingInfo, networkError } = this.props;
        const { message, updateInterval } = this.state;
        const { isReadOnly, level } = this.props.authentication;
        
        return (
            <Content>
                <NetworkAlert show={networkError.isNetworkError} />
                <div className="mb-1 clearfix">
                    <div className="pull-right">
                        <AutoUpdateButtonGroup
                            disabled={isLoading}
                            value={updateInterval}
                            onChange={(val) => this.onUpdateIntervalChange(val)}
                            onManualUpdateClick={() => this.updateData(true)}
                        />
                    </div>
                </div>
                <Row>
                    <Col sm={9}>
                        <DeviceListBox
                            selectedGateId={gateStatus && gateStatus.gateId}
                            isLoading={isLoading}
                            isReadOnly={isReadOnly}
                            datagateResult={searchResult.result}
                            displayState={searchResult.displayState}
                            onDisplayStateChange={(state) => this.props.setDisplayState(state)}
                            onColumnSettingChange={() => this.updateData()}
                            onEditClick={(gateId) => this.onEditClick(gateId)}
                            onShowGateStatusClick={(gateId) => this.onShowGateStatusClick(gateId)}
                        />
                    </Col>
                    <Col sm={3}>
                        <DeviceStateBox
                            isLoading={isLoading}
                            isReadOnly={isReadOnly}
                            gateStatus={gateStatus}
                            onResetClick={() => this.onResetClick(gateStatus)}
                        />
                    </Col>
                </Row>
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
        searchResult: state.searchResult,
        waitingInfo: state.waitingInfo,
        isLoading: state.isLoading,
        datagates: state.datagates,
        gateStatus: state.gateStatus,
        editedDatagate: state.editedDatagate,
        networkError: state.networkError
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        setDisplayState: (setting) => dispatch(setDisplayState(setting)),
        setSearchResult: (result) => dispatch(setSearchResult(result)),
        setWaitingState: (isWaiting, waitingType) => dispatch(setWaitingState(isWaiting, waitingType)),
        changeLoadState: () => dispatch(changeLoadState()),
        setDatagates: (datagates) => dispatch(setDatagates(datagates)),
        setGateStatus: (gateStatus) => dispatch(setGateStatus(gateStatus)),
        setDatabases: (databases) => dispatch(setDatabases(databases)),
        setEditedDatagate: (datagate) => dispatch(setEditedDatagate(datagate)),
        changeNetworkError: (isError) => dispatch(changeNetworkError(isError))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(DeviceListPanel);

 