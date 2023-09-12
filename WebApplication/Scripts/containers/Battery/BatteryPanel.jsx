/**
 * @license Copyright 2018 DENSO
 * 
 * Xxx画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Row, Col, Clearfix } from 'react-bootstrap';

import { bindActionCreators } from 'redux';
import * as Actions from './actions.js';
import { closeModal, changeModalState } from 'ModalState/actions';
import { setAuthentication } from 'Authentication/actions.js';
import { FUNCTION_ID_MAP, getAuthentication } from 'authentication';

import Content from 'Common/Layout/Content';
import BatteryListBox from 'Battery/BatteryListBox';
import MeasuredValueBox from 'Battery/MeasuredValueBox';
import AutoUpdateButtonGroup from 'Assets/AutoUpdateButtonGroup';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import NetworkAlert from 'Assets/NetworkAlert';

import { AUTO_UPDATE_VALUES } from 'constant';
import { outputSearchResult } from 'exportUtility';


/**
 * バッテリ監視画面のコンポーネント
 */
class BatteryPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
        this.state = {
            updateInterval: AUTO_UPDATE_VALUES.none         //更新インターバル
        };
    }

    /********************************************
     * React ライフサイクルメソッド
     ********************************************/

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        this.loadAuthentication();
        this.props.requestInitInfo();       //初期データをロードする
    }

    /**
     * render
     */
    render() {
        const { authentication, dataTypes, modalState, waitingInfo } = this.props;
        const { datagateList, selectedBatteryData } = this.props;
        const { isLoading } = this.props;
        const { isNetworkError } = this.props.networkError;
        const { updateInterval } = this.state;
        const loading = isLoading || !authentication.loadAuthentication;

        return (
            <Content>
                <NetworkAlert show={isNetworkError} />
                <Clearfix className="mb-1">
                    <div className="pull-right">
                        <AutoUpdateButtonGroup
                            disabled={loading}
                            value={updateInterval}
                            onChange={(val) => this.changeUpdateInterval(val)}
                            onManualUpdateClick={() => this.manualUpdate()}
                        />
                    </div>
                </Clearfix>
                <Row>
                    <Col sm={6}>
                        <BatteryListBox batteryList={datagateList}
                                        selectedGateId={selectedBatteryData?selectedBatteryData.gateId:null} 
                                        isLoading={loading}
                                        onReportButtonClick={() => this.outputReport()}
                                        onDetailButtonClick={(gateId) => this.props.requestSelectBattery(gateId)}
                                        onMeasureButtonClick={(gateId) => this.setRemesureSetting(gateId)}
                        />  
                    </Col>
                    <Col sm={6}>
                        <MeasuredValueBox dataTypes={dataTypes && dataTypes.filter((type) => !type.isContact)}
                                          batteryMeasuredData={selectedBatteryData}
                                          selectedGateId={selectedBatteryData?selectedBatteryData.gateId:null} 
                                          isLoading={loading}
                                          isReadOnly={authentication.isReadOnly}
                                          editLevel={authentication.level}
                                          onReportButtonClick={(gateId) => this.outputReport(gateId)}
                                          onMeasureButtonClick={(gateId) => this.setRemesureSetting(gateId)}
                                          onThresholdChange={() => this.manualUpdateMeasuredData()}
                        />
                    </Col>
                </Row>
                <MessageModal show={modalState.show} 
                              title={modalState.title} 
                              bsSize="small"
                              buttonStyle={modalState.buttonStyle}
                              onOK={() => this.handleOK()}
                              onCancel={() => this.handleCloseModal()}>
                    {modalState.message}
                </MessageModal>
                <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />
            </Content>
        );
    }

    //#region 自動更新関係

    /**
     * 自動更新周期を変更する
     * @param {any} newInterval
     */
    changeUpdateInterval(newInterval) {
        if (newInterval === AUTO_UPDATE_VALUES.none) {
            //自動更新がOFFになった場合はタイマークリア
            this.clearAllTimer();
        } else if (this.state.updateInterval === AUTO_UPDATE_VALUES.none) {
            //自動更新がONになった場合はタイマースタート
            this.startTimer();            
        }
        this.setState({ updateInterval: newInterval });
    }

    /**
     * タイマーをスタートする ※タイマーは同時スタート
     */
    startTimer() {
        this.setTimer(AUTO_UPDATE_VALUES.slow);
        this.setTimer(AUTO_UPDATE_VALUES.fast);
    }

    /**
     * タイマーを設定する
     * @param {number} interval 収集周期
     */
    setTimer(interval) {
        if (interval === AUTO_UPDATE_VALUES.fast) {
            this.fastTimerId = setTimeout(() => { this.updateValue(interval) }, interval);
        } else if (interval === AUTO_UPDATE_VALUES.slow) {
            this.slowTimerId = setTimeout(() => { this.updateValue(interval) }, interval);
        }
    }

    /**
     * タイマーが動いている場合はをクリアする
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
     * 計測値を更新する
     * @param {number} interval 収集周期
     */
    updateValue(interval) {
        if (interval === this.state.updateInterval) {
            //更新用関数
            this.props.requestUpdate({
                callback: () => {
                    this.setTimer(interval);
                }
            });
        }
        else {
            this.setTimer(interval);
        }
    }

    //#endregion

    //#region 権限情報読み込み
    
    /**
     * 権限情報を読み込む
     */
    loadAuthentication() {
        getAuthentication(FUNCTION_ID_MAP.battery, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    //#endregion
    
    //#region モーダルボタンイベント

    /**
     * 確認モーダルのOKボタン押下イベント
     */
    handleOK() {
        this.props.closeModal();
        if (this.props.modalState.okOperation === 'update') {
            this.changeUpdateInterval(AUTO_UPDATE_VALUES.fast)
        }
    }

    /**
     * メッセージモーダルクローズイベント
     */
    handleCloseModal() {
        this.props.closeModal();
        if (this.state.updateInterval === AUTO_UPDATE_VALUES.none &&
            this.props.modalState.okOperation === 'confirmUpdate') {
            this.props.changeModalState({
                show: true,
                title: '確認',
                message: "自動更新（30秒）に切り替えますか？",
                buttonStyle: "confirm",
                okOperation: "update"
            });
        }
    }

    //#endregion

    //#region レポート出力関連

    /**
     * レポート出力する
     * @param {number|null} gateId 出力する機器ID（未指定の場合は全機器のレポートを出力する）
     */
    outputReport(gateId = null) {
        this.props.requestGetOutputList({
            gateId: gateId,
            callback: () => {
                let fileName = 'BatteryDataReport';
                if (gateId != null) {
                    fileName += ('_' + gateId.toString())
                }
                outputSearchResult(this.props.outputResult, fileName, true);
            }
        });
    }

    //#endregion

    //#region 再測定関連

    /**
     * 再測定の設定をセットする
     * @param {number} gateId 機器ID
     */
    setRemesureSetting(gateId) {
        this.props.requestSetRemeasure({
            gateId: gateId
        });
    }

    //#endregion

    //#region その他

    /**
     * 手動更新する
     */
    manualUpdate() {
        this.props.requestUpdate();
    }

    /**
     * 手動更新（計測値情報のみ）
     */
    manualUpdateMeasuredData() {
        this.props.requestUpdateMeasuredData();
    }

    //#endregion
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.

/**
 * storeからstateを受け取り、propsに入れ込みます。
 */
const mapStateToProps = (state) => {
    return {
        authentication: state.authentication,
        dataTypes: state.dataTypes,
        datagateList: state.datagateList,
        selectedBatteryData: state.selectedBatteryData,
        outputResult: state.outputResult,
        modalState: state.modalState,
        isLoading: state.isLoading,
        waitingInfo: state.waitingInfo,
        networkError: state.networkError
    };
};

/**
 * 画面更新のアクションを設定します。
 * storeからActionを受け取り、propsに入れ込みます。
 */
const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(Actions, dispatch),
        closeModal: () => dispatch(closeModal()),
        changeModalState: (data) => dispatch(changeModalState(data)),
        setAuthentication: (auth) => dispatch(setAuthentication(auth))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(BatteryPanel);

 