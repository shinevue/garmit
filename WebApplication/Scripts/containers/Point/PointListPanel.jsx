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

import { Grid, Row, Col } from 'react-bootstrap';

import Content from 'Common/Layout/Content';
import Button from 'Common/Widget/Button';

import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import PointListBox from 'Point/PointListBox';

import { setAuthentication } from 'Authentication/actions.js';
import { setLookUp, setSearchCondition, setEditingCondition } from 'SearchCondition/actions.js';
import { setDisplayState, setSearchResult } from 'SearchResult/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { setLoadState, setLoadState_condition, setLoadState_result, setPoints, setEditedPoints, setMaintenanceSchedules } from './actions.js';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';　　
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { POINT_TYPE } from 'constant';

class PointListPanel extends Component {

    constructor(){
        super();
        this.state = {
            message: {},
            showCalcModal: true
        }
    }

    /**
     * コンポーネントがマウントされた時
     */
    componentDidMount() {
        this.loadAuthentication();

        if (!this.props.searchCondition.lookUp) {
            this.loadLookUp();
        }

        this.updatePointResult();
        
        garmitFrame.refresh();
    }

    /**
     * 検索ボタンがクリックされたとき
     * @param {any} condition
     */
    onSearchClick(condition) {
        this.props.setSearchCondition(condition);
        this.loadPointResult(condition);
    }

    /**
     * 編集ボタンがクリックされた時
     * @param {any} pointNos
     */
    onEditClick(pointNos) {
        this.loadEditedPoints(pointNos, (info, networkError) => {
            if (!networkError) {
                browserHistory.push({ pathname: '/Maintenance/Point/Edit', query: { mode: 'edit' } });
            }
        });
    }

    /**
     * 追加ボタンがクリックされた時
     */
    onAddClick() {
        // 空のポイントを取得
        this.loadNewPoint((point, networkError) => {
            if (!networkError) {
                browserHistory.push({ pathname: '/Maintenance/Point/Edit', query: { mode: 'add' } });
            }
        });
    }

    /**
     * 削除ボタンがクリックされた時
     * @param {any} pointNos
     */
    onDeleteClick(pointNos) {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'delete',
                title: '削除',
                message: '選択したポイントを削除してもよろしいですか？',
                onCancel: () => this.clearMessage(),
                onOK: () => {
                    this.clearMessage();
                    this.deletePoints(pointNos);
                }
            }
        })
    }

    /**
     * 検索条件が変更されたとき
     * @param {any} condition
     */
    onSearchConditionChange(condition) {
        this.props.setEditingCondition(condition);
    }

    /**
     * データテーブルの表示が変更された時
     * @param {any} setting
     */
    onTableSettingChange(setting) {
        this.props.setDisplayState(setting);
    }

    /**
     * 権限情報を取得する
     */
    loadAuthentication() {
        getAuthentication(FUNCTION_ID_MAP.pointEdit, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    /**
     * マスターデータを読み込む
     */
    loadLookUp() {
        this.props.setLoadState_condition(true);
        sendData(EnumHttpMethod.get, '/api/Point', null, (lookUp, networkError) => {
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
     * ポイント情報を読み込む
     * @param {any} condition
     */
    loadPointResult(condition, showMessage = true) {
        this.props.setLoadState_result(true);
        sendData(EnumHttpMethod.post, '/api/Point/getPointResult', condition, (info, networkError) => {
            this.props.setLoadState_result(false);
            if (info && info.pointResult) {
                this.props.setSearchResult(info.pointResult);
                if (showMessage && info.pointResult.rows && info.pointResult.rows.length === 0) {
                    this.setState({
                        message: {
                            show: true,
                            buttonStyle: 'message',
                            title: '検索',
                            message: '検索条件に該当するポイントがありません。',
                            onCancel: () => this.clearMessage()
                        }
                    })
                }
            }            
            if (networkError) {
                this.showNetWorkErrorMessage();
            }            
        });
    }

    /**
     * 編集するポイントを読み込む
     * @param {any} pointNos
     */
    loadEditedPoints(pointNos, callback) {
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.post, '/api/Point/getPoints', pointNos, (info, networkError) => {
            this.props.setLoadState(false);
            if (info && info.points) {
                this.props.setEditedPoints(this.processPointsforEdit(info.points));
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback(info, networkError);
            }
        });
    }

    /**
     * ポイントを削除する
     */
    deletePoints(pointNos) {
        const multiple = (pointNos.length !== 1);
        const method = multiple ? EnumHttpMethod.post : EnumHttpMethod.get;
        const url = multiple ? '/api/Point/deletePoints' : ('/api/Point/deletePoint?pointNo=' + pointNos[0]);
        const sendingData = multiple ? pointNos : null;

        this.props.setWaitingState(true, 'delete');
        sendData(method, url, sendingData, (result, networkError) => {
            this.props.setWaitingState(false, null);
            if (result) {
                if (result.isSuccess) {
                    this.loadPointResult(this.props.searchCondition.conditions);
                }
                this.setState({
                    message: {
                        show: true,
                        title: '削除',
                        buttonStyle: 'message',
                        message: result.message,
                        onCancel: () => this.clearMessage()
                    }
                });
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }            
        });
    }

    /**
     * 空のポイントを読み込む
     */
    loadNewPoint(callback) {
        const { lookUp } = this.props.searchCondition;
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.get, '/api/Point/newPoint', null, (point, networkError) => {
            this.props.setLoadState(false);
            if (point) {
                const newPoint = Object.assign({}, point);
                newPoint.pointNo = -1;
                newPoint.datatype = lookUp.dataTypes[0];
                newPoint.unit = lookUp.dataTypes[0] && lookUp.dataTypes[0].defaultUnit;
                newPoint.calcPoint = POINT_TYPE.normal;
                newPoint.database = lookUp.databases[0];
                newPoint.scale = 0.1;
                newPoint.recordInterval = 60;
                newPoint.format = '#0.0';
                newPoint.alarmOccurBlindTime = 60;
                newPoint.errorOccurBlindTime = 60;
                newPoint.alarmRecoverBlindTime = 60;
                newPoint.errorRecoverBlindTime = 60;
                newPoint.convertFormat = '#0.0';
                this.props.setEditedPoints([newPoint]);
            }            
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback(point, networkError);
            }
        });
    }

    /**
     * ポイント情報を更新する
     */
    updatePointResult(showMessage = true) {
        if (this.props.searchCondition.conditions) {
            this.loadPointResult(this.props.searchCondition.conditions, showMessage);
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
     * ポイント情報を編集用に加工する
     * @param {any} points
     */
    processPointsforEdit(points) {
        return points.map((p) => Object.assign({}, p, {
            recordInterval: p.recordInterval && p.recordInterval / 1000 // 収集周期を秒単位に直す
        }));
    }

    render() {
        const { isReadOnly, level, loadAuthentication } = this.props.authentication;
        const { isLoading, searchCondition, searchResult, waitingInfo } = this.props;
        const { message, showCalcModal } = this.state;
        
        return (
            <Content>
                {!isReadOnly && (level === LAVEL_TYPE.manager || level === LAVEL_TYPE.administrator) &&
                    <div className="clearfix mb-05">
                        <Button
                            className="pull-right"
                            iconId="add"
                            disabled={isLoading.condition || isLoading.result}
                            onClick={() => this.onAddClick()}
                        >
                            新規登録
                        </Button>
                    </div>
                }
                <SearchConditionBox
                    isLoading={isLoading.condition || !loadAuthentication}
                    targets={['locations', 'enterprises', 'tags', 'egroups', 'hashTags']}
                    lookUp={searchCondition.lookUp}
                    searchCondition={searchCondition.editingCondition}
                    onChange={(condition) => this.onSearchConditionChange(condition)}
                    onSearchClick={(condition) => this.onSearchClick(condition)}
                    searchButtonDisabled={isLoading.result}
                >
                </SearchConditionBox>
                <PointListBox
                    isReadOnly={isReadOnly}
                    level={level}
                    isLoading={isLoading.result}
                    pointResult={searchResult.result}
                    tableSetting={searchResult.displayState}
                    onTableSettingChange={(setting) => this.onTableSettingChange(setting)}
                    onColumnSettingChange={() => this.updatePointResult(false)}
                    onEditClick={(ids) => this.onEditClick(ids)}
                    onDeleteClick={(pointNos) => this.onDeleteClick(pointNos)}
                    onAddClick={() => this.onAddClick()}
                />
                <MessageModal
                    show={message.show}
                    title={message.title}
                    bsSize="small"
                    buttonStyle={message.buttonStyle}
                    onOK={message.onOK}
                    onCancel={message.onCancel}
                    disabled={isLoading.result}
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
        searchResult: state.searchResult,
        isLoading: state.isLoading,
        waitingInfo: state.waitingInfo,
        points: state.points,
        editedPoints: state.editedPoints,
        maintenanceSchedules: state.maintenanceSchedules
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        setLookUp: (lookUp) => dispatch(setLookUp(lookUp)),
        setEditingCondition: (condition) => dispatch(setEditingCondition(condition)),
        setSearchCondition: (condition) => dispatch(setSearchCondition(condition)),
        setDisplayState: (setting) => dispatch(setDisplayState(setting)),
        setLoadState: (isLoading) => dispatch(setLoadState(isLoading)),
        setLoadState_condition: (isLoading) => dispatch(setLoadState_condition(isLoading)),
        setLoadState_result: (isLoading) => dispatch(setLoadState_result(isLoading)),
        setWaitingState: (isWaiting, type) => dispatch(setWaitingState(isWaiting, type)),
        setPoints: (points) => dispatch(setPoints(points)),
        setSearchResult: (result) => dispatch(setSearchResult(result)),
        setEditedPoints: (points) => dispatch(setEditedPoints(points)),
        setMaintenanceSchedules: (schedules) => dispatch(setMaintenanceSchedules(schedules))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(PointListPanel);