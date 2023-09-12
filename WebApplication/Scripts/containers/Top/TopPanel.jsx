/**
 * @license Copyright 2020 DENSO
 *
 * Top画面 (ダッシュボード)
 *
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 *
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-bootstrap';

import {
    setDashboardInfo,
    setInformations,
    setSchedules,
    setIncidentLog,
    setOperationLog,
    setLoadState,
    setLoadState_condition,
    setLoadState_result
} from "./actions";

import Content from 'Common/Layout/Content';
import NetworkAlert from "Assets/NetworkAlert";

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

import { AUTO_UPDATE_VALUES, DATE_TIME_FORMAT, DASHBOARD_POSITION, DASHBOARD_FUNCTION } from "constant";
import {
    InformationsView,
    SchedulesView,
    NavigationsView,
    IncidentLogView,
    OperationLogView,
    LinksView
} from "Dashboard/DashboardView";

/**
 * Top画面のコンポーネント
 */
class TopPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
        this.state = {
            isNetworkError: false,
        };
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        this.loadDashboardInfo();
    }

    /**
     * 取得系の API を呼び出す
     */
    loadServerData(url, callback) {
        this.props.setLoadState_condition(true);
        sendData(EnumHttpMethod.get, url, null, (result, networkError) => {
            this.props.setLoadState_condition(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                this.hideNetWorkErrorMessage();
            }
            callback && callback(result);
        });
    }

    /**
     * マスタデータを読み込む
     */
    loadDashboardInfo() {
        this.loadServerData('/api/dashboard/getDashboardInfo',
            (result) => {
                result && this.props.setDashboardInfo(result);
            }
        );
    }

    /**
     * setUpdateTimer
     * 更新用のタイマーを起動する（setTimeout を使用）
     * @param {number} functionNo 機能番号
     * @param {number} interval 更新間隔 [ms]
     * @param {number} startDelay 初回起動までの待ち時間 [ms]
     */
    setUpdateTimer(functionNo, interval, startDelay = interval) {
        let func;
        switch (functionNo) {
            case DASHBOARD_FUNCTION.informations:
                func = callback => this.updateInformations(callback);
                break;
            case DASHBOARD_FUNCTION.schedules:
                func = callback => this.updateSchedules(callback);
                break;
            case DASHBOARD_FUNCTION.incidentLog:
                func = callback => this.updateIncidentLog(callback);
                break;
            case DASHBOARD_FUNCTION.operationLog:
                func = callback => this.updateOperationLog(callback);
                break;
        }
        func && setTimeout(() => { func(() => { this.setUpdateTimer(functionNo, interval) } ) }, startDelay);
    }

    /**
     * お知らせを更新
     */
    updateInformations(callback) {
        this.loadServerData('/api/dashboard/getInformations',
            (result) => {
                result && this.props.setInformations(result);
                callback && callback();
            }
        );
    }

    /**
     * スケジュールを更新
     */
    updateSchedules(callback) {
        this.loadServerData('/api/dashboard/getSchedules',
            (result) => {
                result && this.props.setSchedules(result);
                callback && callback();
            }
        );
    }

    /**
     * インシデントログを更新
     */
    updateIncidentLog(callback) {
        this.loadServerData('/api/incidentLog/getDashboardIncidentLog',
            (result) => {
                result && this.props.setIncidentLog(result);
                callback && callback();
            }
        );
    }

    /**
     * オペレーションログを更新
     */
    updateOperationLog(callback) {
        this.loadServerData('/api/operationLog/getDashboardOperationLog',
            (result) => {
                result && this.props.setOperationLog(result);
                callback && callback();
            }
        );
    }

    showNetWorkErrorMessage() {
        this.setState({isNetworkError: true});
    }

    hideNetWorkErrorMessage() {
        this.setState({isNetworkError: false});
    }

    /**
     * ダッシュボードの各エリアに表示するコンポーネントをソートした状態で返す
     * @param {object} dashboardItemMap 表示エリアごとのコンポーネント
     * @param {number} position 表示エリア
     */
    renderDashboardArea(dashboardItemMap, position) {
        if (!dashboardItemMap.hasOwnProperty(position)) {
            return null;
        }
        return dashboardItemMap[position].sort((a, b) => a.index - b.index).map(item => item.component);
    }

    /**
     * render
     */
    render() {
        const { dashboardInfo } = this.props;
        const { isNetworkError } = this.state;

        if (!dashboardInfo) {
            return null;
        }

        const dashboardItemMap = {};
        Object.keys(DASHBOARD_POSITION).forEach(key => {
            dashboardItemMap[DASHBOARD_POSITION[key]] = [];
        });
        dashboardInfo.dispSettings.filter(item => !item.disable).forEach(item => {
            if (!dashboardItemMap.hasOwnProperty(item.dispArea)) {
                return;
            }

            let component;
            switch (item.no) {
                case DASHBOARD_FUNCTION.informations:
                    component = (
                        <InformationsView
                            title={item.title}
                            informations={ dashboardInfo.informations }
                            onInit={() => { this.setUpdateTimer(DASHBOARD_FUNCTION.informations, AUTO_UPDATE_VALUES.fast); }}
                        />
                    );
                    break;
                case DASHBOARD_FUNCTION.schedules:
                    component = (
                        <SchedulesView
                            title={item.title}
                            schedules={ dashboardInfo.schedules }
                            onInit={() => { this.setUpdateTimer(DASHBOARD_FUNCTION.schedules, AUTO_UPDATE_VALUES.fast); }}
                        />
                    );
                    break;
                case DASHBOARD_FUNCTION.navigations:
                    component = (
                        <NavigationsView title={item.title} navigations={ dashboardInfo.navigations }/>
                    );
                    break;
                case DASHBOARD_FUNCTION.incidentLog:
                    component = (
                        <IncidentLogView
                            title={item.title}
                            incidentLog={ dashboardInfo.incidentLog }
                            onInit={() => { this.setUpdateTimer(DASHBOARD_FUNCTION.incidentLog, AUTO_UPDATE_VALUES.fast, 0); }}
                        />
                    );
                    break;
                case DASHBOARD_FUNCTION.operationLog:
                    component = (
                        <OperationLogView
                            title={item.title}
                            operationLog={ dashboardInfo.operationLog }
                            onInit={() => { this.setUpdateTimer(DASHBOARD_FUNCTION.operationLog, AUTO_UPDATE_VALUES.fast, 0); }}
                        />
                    );
                    break;
                case DASHBOARD_FUNCTION.links:
                    component = (
                        <LinksView title={item.title} links={ dashboardInfo.links } />
                    );
                    break;

            }
            const dashboardItem = {
                index: item.index,
                component: component,
            };
            dashboardItemMap[item.dispArea].push(dashboardItem);
        });
        return (
            <Content>
                {
                    dashboardInfo &&
                    <div className="dashboard">
                        <Grid fluid>
                            <Row>
                                <Col xs={12}>
                                    <NetworkAlert show={isNetworkError} />
                                </Col>


                            </Row>
                            <Row>
                                <Col xs={12}>
                                    <p className={"pull-right"}>前回ログイン日時：
                                        {
                                            dashboardInfo.loginDate ?
                                            moment(dashboardInfo.loginDate).format(DATE_TIME_FORMAT.dateTime) : "記録なし"
                                        }
                                    </p>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12}>
                                    <Row>
                                        <Col xs={12}>
                                            { this.renderDashboardArea(dashboardItemMap, DASHBOARD_POSITION.top) }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} sm={6}>
                                            { this.renderDashboardArea(dashboardItemMap, DASHBOARD_POSITION.middleLeft) }
                                        </Col>
                                        <Col xs={12} sm={6}>
                                            { this.renderDashboardArea(dashboardItemMap, DASHBOARD_POSITION.middleRight) }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12}>
                                            { this.renderDashboardArea(dashboardItemMap, DASHBOARD_POSITION.bottom) }
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Grid>
                    </div>
                }
            </Content>
        );
    }    
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.

/**
 * storeからstateを受け取り、propsに入れ込みます。
 */
const mapStateToProps = (state) => {
    return {
        dashboardInfo: state.dashboardInfo,
    };
};

/**
 * 画面更新のアクションを設定します。
 * storeからActionを受け取り、propsに入れ込みます。
 */
const mapDispatchToProps = (dispatch) => {
    return {
        setDashboardInfo: (dashboardInfo) => dispatch(setDashboardInfo(dashboardInfo)),
        setInformations: (informations) => dispatch(setInformations(informations)),
        setSchedules: (schedules) => dispatch(setSchedules(schedules)),
        setIncidentLog: (incidentLog) => dispatch(setIncidentLog(incidentLog)),
        setOperationLog: (operationLog) => dispatch(setOperationLog(operationLog)),
        setLoadState: (isLoading) => dispatch(setLoadState(isLoading)),
        setLoadState_condition: (isLoading) => dispatch(setLoadState_condition(isLoading)),
        setLoadState_result: (isLoading) => dispatch(setLoadState_result(isLoading))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(TopPanel);


