/**
 * Copyright 2017 DENSO Solutions
 * 
 * リアルタイムモニタ画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { browserHistory } from 'react-router';

import Content from 'Common/Layout/Content';

import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import PointEditForm from 'Point/PointEditForm';
import PointBulkEditForm from 'Point/PointBulkEditForm';

import { setWaitingState } from 'WaitState/actions.js';
import { setDisplayState } from 'SearchResult/actions.js';
import { setEditedPoints, setMaintenanceSchedules } from './actions.js';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { LAVEL_TYPE } from 'authentication';
import { SUM_TYPE, OPERAND_TYPE } from 'expressionUtility';

class PointEditPanel extends Component {

    constructor(){
        super();
        this.state = {
            message: { show: false }
        }
    }
    
    /**
     * Componentが更新された後に呼ばれます。初回時には呼ばれません。
     */
    componentDidMount() {
        garmitFrame.refresh();

        const { editedPoints } = this.props;
        if (editedPoints.length == 1 && editedPoints[0].pointNo >= 0) {
            sendData(EnumHttpMethod.get, '/api/schedule/getByPointNo?pointNo=' + editedPoints[0].pointNo, null, (info, networkError) => {
                if (info) {
                this.props.setMaintenanceSchedules(info.maintenanceSchedules);
                }
                if (networkError) {
                    this.showNetWorkErrorMessage();
                }
            });
        }
    }

    /**
     * 保存ボタンクリック
     * @param {any} value
     */
    onSubmit(value) {
        // 確認メッセージを表示
        this.setState({
            message: {
                show: true,
                buttonStyle: 'save',
                title: '保存',
                message: '編集内容を保存してよろしいですか？',
                onCancel: () => this.clearMessage(),
                onOK: () => {
                    this.clearMessage();
                    this.processSave(value);
                }
            }
        });
    }

    /**
     * キャンセルボタンクリック
     */
    onCancel() {
        this.props.setEditedPoints(null);
        this.props.setMaintenanceSchedules(null);
        browserHistory.goBack();
    }

    /**
     * 保存処理を行う
     * @param {any} value
     */
    processSave(value) {
        const { editedPoints } = this.props;

        const isArray = Array.isArray(value);
        const hasRecordIntervalChanged = (isArray ? value[0].recordInterval : value.recordInterval) != editedPoints[0].recordInterval;
        const hasDatatypeChange = !isArray && value.datatype.dtType != editedPoints[0].datatype.dtType;
        const hasLocationsChange = !isArray && JSON.stringify(value.locations.map((loc) => loc.locationId).sort()) != JSON.stringify(editedPoints[0].locations && editedPoints[0].locations.map((loc) => loc.locationId).sort());
        const isEmptyDatagate = !isArray && (!value.datagate || value.datagate == -1);
        const isEmptyAddress = !isArray && !value.address;

        if (hasRecordIntervalChanged || hasDatatypeChange || hasLocationsChange || (!isArray && (isEmptyDatagate || isEmptyAddress))) {
            this.loadERackSets((eRackSets, networkError) => {
                if (networkError) {
                    return;
                }
                if (eRackSets && eRackSets.length > 0) {
                    if (hasDatatypeChange) {
                        this.setState({
                            message: {
                                show: true,
                                buttonStyle: 'message',
                                title: 'エラー',
                                message: '電気錠設定が登録されているため、データ種別を変更できません。',
                                onCancel: () => this.clearMessage()
                            }
                        });
                    } else if (hasLocationsChange) {
                        if (value.locations.some((loc) => loc.locationId === eRackSets[0].location.locationId)) {
                            this.saveData(value);
                        } else {
                            this.setState({
                                message: {
                                    show: true,
                                    buttonStyle: 'message',
                                    title: 'エラー',
                                    message: '電気錠設定が登録されているため、下記のロケーションを解除できません。\n【該当ロケーション】\n' + this.createLocationString(eRackSets[0].location),
                                    onCancel: () => this.clearMessage()
                                }
                            });
                        }
                    } else if (!isArray && (isEmptyDatagate || isEmptyAddress)) {                        
                        this.setState({
                            message: {
                                show: true,
                                buttonStyle: 'message',
                                title: 'エラー',
                                message: '電気錠設定が登録されているため、計測機器およびアドレスを空欄にできません。',
                                onCancel: () => this.clearMessage()
                            }
                        });
                    } else if (hasRecordIntervalChanged) {
                        this.setState({
                            message: {
                                show: true,
                                buttonStyle: 'confirm',
                                title: '確認',
                                message: '電気錠設定が登録されているため、編集対象のポイントと併せて対応する電気錠ポイントまたはドアポイントの収集周期も変更します。よろしいですか？',
                                onCancel: () => this.clearMessage(),
                                onOK: () => {
                                    this.clearMessage();
                                    this.saveData(value);
                                }
                            }
                        });
                    }
                } else {
                    this.saveData(value);
                }
            });
        } else {
            this.saveData(value);
        }
    }

    /**
     * 電気錠設定を取得する
     * @param {any} callback
     */
    loadERackSets(callback) {
        const pointNos = this.props.editedPoints.map((p) => p.pointNo);
        this.props.setWaitingState(true);
        sendData(EnumHttpMethod.post, '/api/ElectricLockSetting/getERackSetsByPointNos', pointNos, (eRackSets, networkError) => {
            this.props.setWaitingState(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            callback && callback(eRackSets, networkError);
        });
    }

    /**
     * 編集内容を保存する
     * @param {any} value
     */
    saveData(value) {
        const isArray = Array.isArray(value);
        const url = isArray ? '/api/Point/setPoints' : '/api/Point/setPoint';
        const sendingData = this.processSendingData(value);

        this.props.setWaitingState(true, 'save');
        sendData(EnumHttpMethod.post, url, sendingData, (result, networkError) => {
            this.props.setWaitingState(false, null);
            if (result) {
	            this.setState({
	                message: {
	                    show: true,
	                    buttonStyle: 'message',
						title: result.isSuccess ? '保存': 'エラー',
						message: result.message,
	                    onCancel: () => {
	                        this.clearMessage();
	                            if (result.isSuccess) {
	                            browserHistory.push('/Maintenance/Point');
	                            this.props.setEditedPoints(null);
	                            this.props.setMaintenanceSchedules(null);
	                            this.props.setDisplayState(null);
	                        }
	                    }
	                }
	            });
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        })
    }

    /**
     * 送信するデータを加工する
     */
    processSendingData(data) {
        if (Array.isArray(data)) {
            const points = data.slice();
            points.forEach((point, i, self) => {
                const obj = Object.assign({}, point);
                obj.locations = obj.locations.map((loc) => ({ locationId: loc.locationId }));
                obj.fullLocations = null;
                obj.recordInterval = obj.recordInterval * 1000; // 収集周期をミリ秒単位に直す
                self[i] = obj;
            });
            return points;
        } else {
            const point = Object.assign({}, data);
            point.locations = point.locations.map((loc) => ({ locationId: loc.locationId }));
            point.fullLocations = null;
            point.recordInterval = point.recordInterval * 1000; // 収集周期をミリ秒単位に直す

            // 演算設定でグループアラームの場合
            if (point.calcPointSet && point.calcPointSet[0] && [OPERAND_TYPE.alarm, OPERAND_TYPE.error].indexOf(point.calcPointSet[0].calcDetails[0].valueType) >= 0) {
                point.calcPointSet = point.calcPointSet.map((set) => Object.assign({}, set, { sumType: SUM_TYPE.total }));
                point.unit = '';
            }
            return point;
        }
    }

    /**
     * ロケーション文字列を生成する
     * @param {any} location
     */
    createLocationString(location) {
        let loc = location;
        let str = '';
        do {
            str = loc.name + ' / ' + str;
            loc = loc.parent;
        } while (loc)
        return str;
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
        const { level } = this.props.authentication;
        const { searchCondition, editedPoints, waitingInfo, maintenanceSchedules } = this.props;
        const { message } = this.state;

        return (
            <Content>
                {editedPoints && editedPoints.length === 1 &&
                    <PointEditForm
                        level={level}
                        point={editedPoints[0]}
                        maintenanceSchedules={maintenanceSchedules}
                        lookUp={searchCondition.lookUp}
                        onSubmit={(v) => this.onSubmit(v)}
                        onCancel={() => this.onCancel()}
                    />
                }
                {editedPoints && editedPoints.length > 1 &&
                    <PointBulkEditForm
                        level={level}
                        points={editedPoints}
                        lookUp={searchCondition.lookUp}
                        onSubmit={(v) => this.onSubmit(v)}
                        onCancel={() => this.onCancel()}
                    />
                }
                <MessageModal
                    show={message.show}
                    title={message.title}
                    bsSize="small"
                    buttonStyle={message.buttonStyle}
                    onOK={message.onOK}
                    onCancel={message.onCancel}
                >
                    {message.message && message.message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
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
        searchCondition: state.searchCondition,
        editedPoints: state.editedPoints,
        waitingInfo: state.waitingInfo,
        maintenanceSchedules: state.maintenanceSchedules
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        setWaitingState: (isWaiting, type) => dispatch(setWaitingState(isWaiting, type)),
        setEditedPoints: (points) => dispatch(setEditedPoints(points)),
        setMaintenanceSchedules: (schedules) => dispatch(setMaintenanceSchedules(schedules)),
        setDisplayState: (setting) => dispatch(setDisplayState(setting))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(PointEditPanel);

 