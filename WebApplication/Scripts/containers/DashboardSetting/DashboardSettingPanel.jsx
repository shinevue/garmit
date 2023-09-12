/**
 * @license Copyright 2020 DENSO
 *
 * ダッシュボード編集画面
 *
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 *
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import {Grid, Row, Col, ButtonToolbar, Panel} from 'react-bootstrap';

import Content from 'Common/Layout/Content';
import Box from 'Common/Layout/Box';

import Button from "Common/Widget/Button";
import Icon from "Common/Widget/Icon";

import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import { WidgetContainer, WidgetArea } from "Assets/Widget/Widget";

import {
    InformationsSetting,
    SchedulesSetting,
    NavigationsSetting,
    IncidentLogSetting,
    OperationLogSetting,
    LinksSetting
} from "Dashboard/DashboardSetting";

import {DASHBOARD_FUNCTION, DASHBOARD_POSITION} from "constant";

import { FUNCTION_ID_MAP, LAVEL_TYPE, readOnlyByLevel, getAuthentication } from 'authentication';
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

// actions
import {
    setDashboardEditInfo,
    setDispSettings,
    setInformations,
    setNavigations,
    setOperationLogSetting,
    setLinks,
    setLoadState, setLoadState_condition, setLoadState_result
} from './actions';
import { setAuthentication } from 'Authentication/actions.js';
import { closeModal, confirmSave, successSave, showErrorMessage } from 'ModalState/actions';

/**
 * ダッシュボード編集画面のコンポーネント
 */
class DashboardSettingPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
        this.state = {
            message: {},
            canSave: true,
            currentDispSettings: null,
            isSaving: false,
        };
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        this.loadAuthentication();
        this.loadDashboardEditInfo();
    }

    componentDidUpdate(prevProps){
        if(prevProps.dashboardEditInfo !== this.props.dashboardEditInfo){
            this.initDefaultDispSettings();
        }
    }
    /**
     * 権限情報を取得する
     */
    loadAuthentication(){
        getAuthentication(FUNCTION_ID_MAP.dashboardSetting, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    /**
     * initDefaultDispSettings
     * this.state に初期状態のレイアウトをセットする
     */
    initDefaultDispSettings() {
        this.setState({currentDispSettings: this.duplicateDispSettings()});
    }

    /**
     * duplicateDispSettings
     * this.props.dashboardEditInfo.dispSettings をディープコピーする
     */
    duplicateDispSettings() {
        return this.props.dashboardEditInfo.dispSettings.map(item => Object.assign({}, item));
    }

    /**
     * マスタデータを読み込む
     */
    loadDashboardEditInfo() {
        this.props.setLoadState_condition(true);
        sendData(EnumHttpMethod.get, '/api/dashboard/getDashboardEditInfo', null, (dashboardEditInfo, networkError) => {
            this.props.setLoadState_condition(false);
            if (dashboardEditInfo) {
                this.props.setDashboardEditInfo(dashboardEditInfo);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * loadDispSettings
     * 表示設定情報取得を行う
     */
    loadDispSettings() {
        this.props.setLoadState_condition(true);
        sendData(EnumHttpMethod.get, '/api/dashboard/getDispSettings', null, (dispSettings, networkError) => {
            this.props.setLoadState_condition(false);
            if (dispSettings) {
                this.props.setDispSettings(dispSettings);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });

        this.setState({currentDispSettings: this.duplicateDispSettings()});
    }

    /**
     * 取得系の API を呼び出す
     */
    loadServerData(url, callback) {
        sendData(EnumHttpMethod.get, url, null, (result, networkError) => {
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            callback && callback(result);
        });
    }

    /**
     * お知らせをサーバーから取得して更新
     */
    updateInformations() {
        this.loadServerData('/api/dashboard/getInformations',
            (result) => {
                result && this.props.setInformations(result);
            }
        );
    }

    /**
     * ナビゲーションをサーバーから取得して更新
     */
    updateNavigations() {
        this.loadServerData('/api/dashboard/getNavigationSettings',
            (result) => {
                result && this.props.setNavigations(result);
            }
        );
    }

    /**
     * オペレーションログをサーバーから取得して更新
     */
    updateOperationLogSetting() {
        this.loadServerData('/api/dashboard/getOperationLogSetting',
            (result) => {
                result && this.props.setOperationLogSetting(result);
            }
        );
    }

    /**
     * 外部リンクをサーバーから取得して更新
     */
    updateLinks() {
        this.loadServerData('/api/dashboard/getLinks',
            (result) => {
                result && this.props.setLinks(result);
            }
        );
    }

    /**
     * ダッシュボードの各エリアについてソートしたものを返す
     */
    renderDashboardArea(dashboardItemMap, position) {
        if (!dashboardItemMap.hasOwnProperty(position)) {
            return null;
        }
        return dashboardItemMap[position].sort((a, b) => a.index - b.index).map(item => item.component);
    }

    /**
     * onLayoutChange
     * sortable 要素の移動が発生した場合に呼び出される
     * @param {object} $widgetArea jQueryUI.sortable が適用されている jQuery オブジェクト
     */
    onLayoutChange($widgetArea) {
        const newDispSettings = this.duplicateDispSettings();
        let stateUpdate = false;
        $widgetArea.each((i, area) => {
            const dispArea = parseInt(DASHBOARD_POSITION[$(area).data('area-name')], 10);
            const dispAreaFunctionList = $(area).sortable('toArray', {attribute: "data-dashboard-function-name"});
            dispAreaFunctionList.forEach((functionName, index) => {
                if (DASHBOARD_FUNCTION.hasOwnProperty(functionName)) {
                    const dashboardFunctionId = DASHBOARD_FUNCTION[functionName];
                    const itemIndex = newDispSettings.findIndex(item => item.no === dashboardFunctionId);
                    const item = dispArea === DASHBOARD_POSITION.disable ? {
                        dispArea: DASHBOARD_POSITION.top,
                        disable: true,
                        index: 0,
                    } : {
                        dispArea: dispArea,
                        disable: false,
                        index: index + 1,
                    };
                    if (itemIndex >= 0) {
                        newDispSettings[itemIndex] = Object.assign({}, newDispSettings[itemIndex], item);
                    }
                }
            });
        });
        $widgetArea.sortable('cancel');
        this.setState({currentDispSettings: newDispSettings})
    }

    cancelLayoutChange() {
        this.initDefaultDispSettings();
    }

    saveDashboardContentSetting(dashboardFunction, content, options = {}) {
        let url, reload;
        switch (dashboardFunction) {
            case DASHBOARD_FUNCTION.informations:
                url = '/api/dashboard/setInformations';
                reload = () => { this.updateInformations(); }
                break;
            case DASHBOARD_FUNCTION.navigations:
                url = '/api/dashboard/setNavigations';
                reload = () => { this.updateNavigations(); }
                break;
            case DASHBOARD_FUNCTION.operationLog:
                url = '/api/dashboard/setOperationLogSetting';
                reload = () => { this.updateOperationLogSetting(); }
                break;
            case DASHBOARD_FUNCTION.links:
                url = '/api/dashboard/setLinks';
                reload = () => { this.updateLinks(); }
                break;
        }
        if (url) {
            this.setState({ isSaving: true }, () => {
                sendData(EnumHttpMethod.post, url, content, (result, networkError) => {
                    this.setState({ isSaving: false });
                    if (result) {
                        result.isSuccess && reload && reload();
                        options.onComplete && options.onComplete(result);
                    }
                    if (networkError) {
                        this.showNetWorkErrorMessage();
                    }
                });
            });
        }
    }

    saveDashboardLayoutSetting() {
        this.setState({ isSaving: true }, () => {
            sendData(EnumHttpMethod.post, '/api/dashboard/setDispSettings', this.state.currentDispSettings, (result, networkError) => {
                this.setState({ isSaving: false });
                if (result) {
                    if (result.isSuccess) {
                        this.props.successSave({
                            message: result.message,
                        });
                        this.loadDispSettings();
                    } else {
                        this.props.showErrorMessage({
                            message: result.message,
                        });
                    }
                }
                if (networkError) {
                    this.showNetWorkErrorMessage();
                }
            });
        });
    }

    onLayoutSaveButtonClick() {
        this.props.confirmSave({
            targetName: '表示位置',
            okOperation: () => {
                this.props.closeModal();
                this.saveDashboardLayoutSetting();
            },
        });
    }

    /**
     * render
     */
    render() {
        const { dashboardEditInfo, authentication, isLoading, modalState } = this.props;
        const { level, loadAuthentication } = authentication;
        const { currentDispSettings, isSaving } = this.state;

        const showLoader = (isLoading.condition || !loadAuthentication);

        const isReadOnly = !authentication || readOnlyByLevel(
            authentication.isReadOnly,
            level,
            LAVEL_TYPE.administrator
        );
        const isEditable = !isReadOnly;

        const dashboardItemMap = {};
        Object.keys(DASHBOARD_POSITION).forEach(key => {
            dashboardItemMap[DASHBOARD_POSITION[key]] = [];
        });

        if (currentDispSettings && Array.isArray(currentDispSettings)) {
            currentDispSettings.forEach(item => {
                const dispArea = item.disable ? DASHBOARD_POSITION.disable : item.dispArea;

                if (!dashboardItemMap.hasOwnProperty(dispArea)) {
                    return;
                }

                let component;
                switch (item.no) {
                    case DASHBOARD_FUNCTION.informations:
                        component = (
                            <InformationsSetting
                                isReadOnly={isReadOnly}
                                title={item.title}
                                informations={dashboardEditInfo.informations}
                                onSave={(content, options) => this.saveDashboardContentSetting(DASHBOARD_FUNCTION.informations, content, options)}
                            />
                        );
                        break;
                    case DASHBOARD_FUNCTION.schedules:
                        component = (
                            <SchedulesSetting title={item.title} />
                        );
                        break;
                    case DASHBOARD_FUNCTION.navigations:
                        component = (
                            <NavigationsSetting
                                isReadOnly={isReadOnly}
                                title={item.title}
                                navigations={dashboardEditInfo.navigations}
                                functions={dashboardEditInfo.functions}
                                onSave={(content, options) => this.saveDashboardContentSetting(DASHBOARD_FUNCTION.navigations, content, options)}
                            />
                        );
                        break;
                    case DASHBOARD_FUNCTION.incidentLog:
                        component = (
                            <IncidentLogSetting title={item.title} />
                        );
                        break;
                    case DASHBOARD_FUNCTION.operationLog:
                        component = (
                            <OperationLogSetting
                                isReadOnly={isReadOnly}
                                title={item.title}
                                setting={dashboardEditInfo.operationLogSetting}
                                functions={dashboardEditInfo.functions}
                                onSave={(content, options) => this.saveDashboardContentSetting(DASHBOARD_FUNCTION.operationLog, content, options)}
                            />
                        );
                        break;
                    case DASHBOARD_FUNCTION.links:
                        component = (
                            <LinksSetting
                                isReadOnly={isReadOnly}
                                title={item.title}
                                links={dashboardEditInfo.links}
                                onSave={(content, options) => this.saveDashboardContentSetting(DASHBOARD_FUNCTION.links, content, options)}
                            />
                        );
                        break;
                }
                const dashboardItem = {
                    index: item.index,
                    component: component,
                };
                dashboardItemMap[dispArea].push(dashboardItem);
            });
        }

        return (
            <Content>
                <div className="dashboard">
                    <Grid fluid>
                        <WidgetContainer
                            sortDisabled={isReadOnly}
                            updateControlProps={ [ currentDispSettings, showLoader ] }
                            onUpdate={($widgetArea, event, ui) => { this.onLayoutChange($widgetArea) }}
                        >
                            <Row className="mb-1">
                                <Col xs={12}>
                                    {isEditable &&
                                    <ButtonToolbar className='pull-right' >
                                        <Button
                                            bsStyle="success"
                                            disabled={!this.state.canSave}
                                            onClick={() => { this.onLayoutSaveButtonClick(); }}
                                        >
                                            <Icon className="fal fa-save mr-05" />
                                            <span>表示位置を保存</span>
                                        </Button>
                                        <Button
                                            iconId="uncheck"
                                            bsStyle="lightgray"
                                            disabled={!this.state.canSave}
                                            onClick={() => { this.cancelLayoutChange(); }}
                                        >
                                            元に戻す
                                        </Button>
                                    </ButtonToolbar>
                                    }
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={9}>
                                    <Row>
                                        <Col xs={12}>
                                            <Box boxStyle='default' isCollapsible={false} isLoading={showLoader}>
                                                <Box.Body>
                                                    <WidgetArea name="top">
                                                        { this.renderDashboardArea(dashboardItemMap, DASHBOARD_POSITION.top) }
                                                    </WidgetArea>
                                                </Box.Body>
                                            </Box>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} sm={6}>
                                            <Box boxStyle='default' isCollapsible={false} isLoading={showLoader}>
                                                <Box.Body>
                                                    <WidgetArea name="middleLeft">
                                                        { this.renderDashboardArea(dashboardItemMap, DASHBOARD_POSITION.middleLeft) }
                                                    </WidgetArea>
                                                </Box.Body>
                                            </Box>
                                        </Col>
                                        <Col xs={12} sm={6}>
                                            <Box boxStyle='default' isCollapsible={false} isLoading={showLoader}>
                                                <Box.Body>
                                                    <WidgetArea name="middleRight">
                                                        { this.renderDashboardArea(dashboardItemMap, DASHBOARD_POSITION.middleRight) }
                                                    </WidgetArea>
                                                </Box.Body>
                                            </Box>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12}>
                                            <Box boxStyle='default' isCollapsible={false} isLoading={showLoader}>
                                                <Box.Body>
                                                    <WidgetArea name="bottom">
                                                        { this.renderDashboardArea(dashboardItemMap, DASHBOARD_POSITION.bottom) }
                                                    </WidgetArea>
                                                </Box.Body>
                                            </Box>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={3}>
                                    <Row>
                                        <Col xs={12}>
                                            <Panel header={"非表示"}>
                                                <WidgetArea name="disable">
                                                    { this.renderDashboardArea(dashboardItemMap, DASHBOARD_POSITION.disable) }
                                                </WidgetArea>
                                            </Panel>
                                        </Col>
                                    </Row>

                                </Col>
                            </Row>
                        </WidgetContainer>
                    </Grid>
                </div>
                <WaitingMessage show={isSaving} type="save" />
                <MessageModal
                    show={modalState.show}
                    title={modalState.title}
                    bsSize="small"
                    buttonStyle={modalState.buttonStyle}
                    onOK={modalState.okOperation}
                    onCancel={() => { this.props.closeModal(); } }
                >
                    {modalState.message}
                </MessageModal>
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
        dashboardEditInfo: state.dashboardEditInfo,
        authentication: state.authentication,
        isLoading: state.isLoading,
        modalState: state.modalState,
    };
};

/**
 * 画面更新のアクションを設定します。
 * storeからActionを受け取り、propsに入れ込みます。
 */
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        setDashboardEditInfo: (dashboardEditInfo) => dispatch(setDashboardEditInfo(dashboardEditInfo)),
        setDispSettings: (dispSettings) => dispatch(setDispSettings(dispSettings)),
        setInformations: (informations) => dispatch(setInformations(informations)),
        setLinks: (links) => dispatch(setLinks(links)),
        setNavigations: (navigations) => dispatch(setNavigations(navigations)),
        setOperationLogSetting: (operationLogSetting) => dispatch(setOperationLogSetting(operationLogSetting)),
        setLoadState: (isLoading) => dispatch(setLoadState(isLoading)),
        setLoadState_condition: (isLoading) => dispatch(setLoadState_condition(isLoading)),
        setLoadState_result: (isLoading) => dispatch(setLoadState_result(isLoading)),
        confirmSave: (data) => dispatch(confirmSave(data)),
        successSave: (data) => dispatch(successSave(data)),
        showErrorMessage: (data) => dispatch(showErrorMessage(data)),
        changeModalState: (data) => dispatch(changeModalState(data)),
        closeModal: () => dispatch(closeModal()),
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(DashboardSettingPanel);

 