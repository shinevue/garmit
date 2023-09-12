/**
 * @license Copyright 2019 DENSO
 * 
 * 電気錠マップ画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { bindActionCreators } from 'redux';
import * as Actions from './actions.js';
import {
    requestMapTransition, requestSelectLayout, requestObjectLink,
    setDrawingArea
} from 'FloorMapCommon/actions.js';
import { closeModal, changeModalState } from 'ModalState/actions.js';
import { requestSaveUnlockPurpose, requestDeleteUnlockPurpose, setSelectedUnlockPurpose, clearSelectedUnlockPurpose } from 'UnlockPurpose/actions.js';
import { setAuthentication } from 'Authentication/actions.js';

import { Row, Col } from 'react-bootstrap';
import Content from 'Common/Layout/Content';
import AutoUpdateButtonGroup from 'Assets/AutoUpdateButtonGroup';
import FloorMapBox from 'Assets/FloorMap/FloorMapBox.jsx';
import LayoutSelectForm from 'Assets/FloorMap/LayoutSelectForm.jsx';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import LinkButton from 'Common/Widget/LinkButton';
import NetworkAlert from 'Assets/NetworkAlert';

import KeyOperationBox from 'ElectricLockMap/KeyOperationBox';
import MultiERackSelectModel from 'ElectricLockMap/Modal/MultiERackSelectModel';

import { MODAL_OPERATION_ELECTRIC_RACK } from 'electricLockUtility';
import { LINK_TYPE, AUTO_UPDATE_VALUES, MAP_TRANSITION_TYPE } from 'constant';
import { FUNCTION_ID_MAP, getAuthentication, readOnlyByLevel, LAVEL_TYPE } from 'authentication';
import { getSessionStorage, STORAGE_KEY } from 'webStorage';    //webStorage.jsから関数とストレージキーをインポート

/**
 * ElectricLockMap画面のコンポーネント
 */
class ElectricLockMapPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
        this.state = {
            getInterval: AUTO_UPDATE_VALUES.slow
        };
    }

    //#region Reactライフサイクルイベント

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        this.loadAuthentication();
        const layoutId = getSessionStorage(STORAGE_KEY.layoutId);
        this.props.requestInitInfo(layoutId);
        this.setDrawingArea();
        
        //画面サイズ変更イベントを設定
        window.addEventListener('resize', () => {
            this.setDrawingArea();
        });
    }

    /**
     * 新たなPropsを受け取ったときに実行
     */
    componentWillReceiveProps(nextProps) {
        if (!this.props.selectLayout && nextProps.selectLayout) {
            //レイアウトが選択されたらタイマースタート
            this.startTimer();
        }
    }

    /**
     * render
     */
    render() {
        const { lookUp, selectLayout, isLoading, waitingInfo, unlockPurposeInfo } = this.props;
        const { elecKeyObjects, selectKeyRacks } = this.props;
        const { operationInfo } = this.props;
        const { showMultiRackModal, tempMultiKeyRacks } = this.props;
        const { show, title, message, buttonStyle } = this.props.modalState;
        const { layouts, lockStatuses } = lookUp;
        const { isNetworkError } = this.props.networkError;
        const { getInterval } = this.state;
        const { isReadOnly, level, loadAuthentication } = this.props.authentication;
        const loading = isLoading || !loadAuthentication;
        const readOnly = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.operator);
        
        //フロアマップコンポーネント表示用情報をまとめる
        let floorMapProps = _.pick(this.props, ['floorMapInfo', 'selectLayout', 'selectedLayoutList', 'floorMapOptionInfo']);
        floorMapProps = {
            ...floorMapProps,
            isElecKey: true,
            elecKeyObjects: elecKeyObjects,
            selectKeyRackObjects: selectKeyRacks.objects,
            keyStatusItems: lockStatuses
        };
        return (
            <Content>
                <NetworkAlert show={isNetworkError} />
                <Row>
                    <Col lg={8}>
                        <LayoutSelectForm
                            isReadOnly={loading}
                            isShowBreadcrumb={true}
                            layoutList={layouts}
                            selectLayout={selectLayout}
                            onChangeSelectLayout={(selectLayout) => this.props.requestSelectLayout(selectLayout)}
                        />
                    </Col>
                    <Col lg={4}>
                        <div>
                            <LinkButton iconClass="fal fa-angle-double-right"
                                        disabled={loading}
                                        className="eleckey-map-transition-link"
                                        onClick={() => this.dispRackOperationPage()}
                                >
                                    電気錠操作画面へ
                            </LinkButton>
                            <div className="eleckey-map-update-button-gourp">
                                <AutoUpdateButtonGroup
                                    value={getInterval}
                                    disabled={loading}
                                    onChange={(val) => this.handleChangeUpdateInterval(val)}
                                    onManualUpdateClick={() => this.handleClickManualUpdate()}
                                />
                            </div>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col md={8}>
                        <div id="floorMapBox">
                            <FloorMapBox
                                isLoading={loading}
                                floorMapProps={floorMapProps}
                                onClickObject={this.handleClickObject}
                                onClickMapTransition={(type) => this.handleClickMapTransition(type)}
                                onClickKeyRackObject={this.handleClickKeyRackObject}
                                onSelectKeyRackObjects={this.handleSelectKeyRackObjects}                                
                            />
                        </div>
                    </Col>
                    <Col md={4}>
                        <KeyOperationBox
                            isLoading={loading} 
                            electricLockRacks={selectKeyRacks.dispItems}
                            operationMemo={operationInfo.operationMemo}
                            operationExtendedPages={operationInfo.operationExtendedPages}
                            operationTarget={operationInfo.operationTarget}
                            memoValidation={operationInfo.memoValidation}
                            targetValidatation={operationInfo.targetValidatation}
                            extendedPagesError={operationInfo.extendedPagesError}
                            unlockPurposeError={unlockPurposeInfo.isError}
                            {...unlockPurposeInfo}
                            isReadOnly={readOnly}
                            onUnlock={() => this.showConfirmKeyOperation(false)}
                            onLock={() => this.showConfirmKeyOperation(true)}
                            onClear={() => this.props.requestClearSelectElecKey()}
                            onRemove={(item) => this.props.requestRemoveSelectElecKeys(item)}   
                            onChangeMemo={(memo) => this.props.changeOperatioMemo(memo)}
                            onChangeTarget={(front, rear) => this.props.changeOperatioTarget(front, rear)}
                            onChangeExtendedPages={(extendedPages, isError) => this.props.changeOperatioExtendedPages(extendedPages, isError)}
                            onChangeUnlockPurpose={(purpose) => this.props.setSelectedUnlockPurpose(purpose)}
                            onSaveUnlockPurpose={(purpose, callback) => this.props.requestSaveUnlockPurpose(purpose, FUNCTION_ID_MAP.electricLockMap, callback)}
                            onDeleteUnlockPurpose={(purpose) => this.props.requestDeleteUnlockPurpose(purpose, FUNCTION_ID_MAP.electricLockMap)}
                        />        
                    </Col>
                </Row>
                {showMultiRackModal && 
                    <MultiERackSelectModel 
                        show={showMultiRackModal} 
                        isReadOnly={loading}
                        electricLockRacks={tempMultiKeyRacks&&tempMultiKeyRacks.dispItems}
                        onSelect={(dispItems) => this.handleSelectMultiRack(dispItems)}
                        onCancel={() => this.handleCancelSelectMultiRack()}
                    />
                }
                <MessageModal
                    title={title}
                    show={show}
                    bsSize="sm"
                    buttonStyle={buttonStyle}
                    onOK={() => this.handleClickOKButton()}
                    onCancel={() => this.props.closeModal()}
                >
                    {message && message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
                </MessageModal>
                <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />
            </Content>
        );

    }

    //#endregion

    //#region 権限情報読み込み
    
    /**
     * 権限情報を読み込む
     */
    loadAuthentication() {
        getAuthentication(FUNCTION_ID_MAP.electricLockMap, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    //#endregion
    
    //#region 描画関係

    /**
     * 描画エリアの幅と高さをセットする
     */
    setDrawingArea() {
        const { width, height } = this.props.floorMapInfo.drawingArea;

        //フロアマップボックスの幅から描画エリアの幅と高さを取得
        var boxBody = $("#floorMapBox").children(".box")[0];
        const newWidth = boxBody.clientWidth - 35;
        const newHeight = newWidth * height / width;
        var data = {
            width: newWidth,
            height: newHeight
        }
        this.props.setDrawingArea(data);
    }

    //#endregion

    //#region イベントハンドラ
    
    /**
     * オブジェクトクリックイベントハンドラ
     * @param {object} selectObject オブジェクト
     * @param {bool} isDoubleClick ダブルクリックかどうか
     */
    handleClickObject = (selectObject, isDoubleClick) => {
        if (this.isGetObjectLink(selectObject.linkType, isDoubleClick)) {
            this.props.requestObjectLink(selectObject);
        };
    }

    /**
     * 電気錠ラック選択（単体）イベントハンドラ
     */
    handleClickKeyRackObject = (selectObject) => {
        this.props.requestSelectElecKeys([selectObject], false ,selectObject.isMultiRack);
    }

    /**
     * 電気錠ラック選択イベントハンドラ
     */
    handleSelectKeyRackObjects = (selectObjects) => {
        var objects = _.cloneDeep(selectObjects).filter((obj) => !obj.isMultiRack && obj.linkType === LINK_TYPE.location);
        if (objects.length > 0) {
            this.props.requestSelectElecKeys(objects, true, false);
        }      
    }

    /**
     * 分割ラック選択の選択ボタンイベントハンドラ
     */
    handleSelectMultiRack = (dispItems) => {
        this.props.requestApplyMultiRackSelect(dispItems);
        this.props.changeMultiRackSelectModalState(false);
    } 

    /**
     * 分割ラック選択モーダルのキャンセルイベントハンドラ
     */
    handleCancelSelectMultiRack = () => {
        this.props.changeMultiRackSelectModalState(false);
        this.props.setTempMultiElecKeyRacks(null);
    }

    /**
     * マップ遷移ボタンクリックイベントハンドラ
     * @param {number} type 遷移種別
     */
    handleClickMapTransition = (type) => {
        if (type === MAP_TRANSITION_TYPE.referrer) {   //リンク元レイアウトに戻る
            this.props.requestMapTransition(type);
        }
        else {
            this.props.requestElectricLockMapTransition(type);  //電気錠マップ情報も取得する
        }
    }

    /**
     * 確認モーダルのOKボタンクリックイベントハンドラ
     */
    handleClickOKButton = () => {
        const { modalState } = this.props;
        this.props.closeModal();
        switch (modalState.okOperation) {
            case MODAL_OPERATION_ELECTRIC_RACK.lock:
                this.props.requestElecKeyOperation(true);
                break;
            case MODAL_OPERATION_ELECTRIC_RACK.unlock:
                this.props.requestElecKeyOperation(false);
                break;
            default: break;
        }
    }

    /**
     * 更新周期変更イベント
     * @param {number} val 変更後の更新周期
     */
    handleChangeUpdateInterval(val) {
        this.changeInterval(val);
    }

    /**
     * 手動更新ボタンクリックイベント
     */
    handleClickManualUpdate() {
        this.props.requestUpdate();
    }

    //#endregion

    //#region 施錠/開錠オペレーション

    /**
     * 施錠/開錠操作確認モーダルを表示する
     * @param {boolean} isLock 施錠操作かどうか
     */
    showConfirmKeyOperation(isLock) {
        let modalInfo = {
            show: true,
            title: '確認',
            buttonStyle: 'confirm',
            okOperation: isLock ? MODAL_OPERATION_ELECTRIC_RACK.lock : MODAL_OPERATION_ELECTRIC_RACK.unlock,
            message: '選択中のラックを' + (isLock ? '施錠' : '開錠') + 'します。よろしいですか？'
        };
        this.props.changeModalState(modalInfo);
    }

    //#endregion
    
    //#region タイマー関連

    /**
     * タイマーのインターバルを変更する
     * @param {number} newInterval 新しい更新周期
     */
    changeInterval(newInterval) {
        if (newInterval === AUTO_UPDATE_VALUES.none) {
            //自動更新がOFFになった場合はタイマークリア
            this.clearAllTimer();
        }
        else if (this.state.getInterval === AUTO_UPDATE_VALUES.none) {
            //自動更新がONになった場合はタイマースタート
            this.startTimer();
        }
        this.setState({ getInterval: newInterval });
    }

    /**
     * タイマーをスタートする
     */
    startTimer() {
        this.setTimer(AUTO_UPDATE_VALUES.slow);
        this.setTimer(AUTO_UPDATE_VALUES.fast);
    }

    /**
     * 計測値を更新する
     * @param {number} interval 収集周期
     */
    updateValue(interval) {
        if (interval === this.state.getInterval) {
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

    /**
    * タイマーを設定する
    * @param {number} interval 収集周期
    */
    setTimer(interval) {
        if (interval === AUTO_UPDATE_VALUES.fast) {
            this.fastTimerId = setTimeout(() => { this.updateValue(interval) }, interval);
        }
        else if (interval === AUTO_UPDATE_VALUES.slow) {
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

    //#endregion

    //#region その他

    /**
     * オブジェクトのリンク先情報を取得するかどうか
     * @param {int} linkType 選択されたオブジェクトのリンクタイプ
     * @param {bool} isDouble ダブルクリックイベントかどうか
     */
    isGetObjectLink(linkType, isDouble) {
        if (isDouble && (linkType === LINK_TYPE.egroup || linkType === LINK_TYPE.layout)) {     //リンク情報を取得するのはレイアウトと電源系統のみ
            return true;
        }
        return false;
    }

    /**
     * 電気錠操作画面に遷移する
     */
    dispRackOperationPage() {
        window.location.href = '/ElectricLockOperation';         //画面遷移
    }
    
    //#endregion
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.

/**
 * storeからstateを受け取り、propsに入れ込みます。
 */
const mapStateToProps = (state) => {
    const { floorMapCommon } = state;
    return {
        lookUp: state.lookUp,
        elecKeyObjects: state.elecKeyObjects,
        selectKeyRacks: state.selectKeyRacks,
        operationInfo: state.operationInfo,
        showMultiRackModal: state.showMultiRackModal, 
        tempMultiKeyRacks: state.tempMultiKeyRacks,
        updating: state.updating,
        selectLayout: floorMapCommon.selectLayout,
        selectedLayoutList: floorMapCommon.selectedLayoutList,
        floorMapOptionInfo: floorMapCommon.floorMapOptionInfo,
        floorMapInfo: floorMapCommon.floorMapInfo,
        selectObjectInfo: floorMapCommon.selectObjectInfo,
        isLoading: state.isLoading,
        modalState: state.modalState,
        waitingInfo: state.waitingInfo,
        unlockPurposeInfo: state.unlockPurposeInfo,
        authentication: state.authentication,
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
        requestMapTransition: (data) => dispatch(requestMapTransition(data)),
        requestSelectLayout: (data) => dispatch(requestSelectLayout(data)),
        requestObjectLink: (data) => dispatch(requestObjectLink(data)),
        setDrawingArea: (data) => dispatch(setDrawingArea(data)),
        closeModal:() => dispatch(closeModal()),
        changeModalState:(data) => dispatch(changeModalState(data)),
        requestSaveUnlockPurpose:(data, functionId, callback) => dispatch(requestSaveUnlockPurpose(data, functionId, callback)),
        requestDeleteUnlockPurpose:(unlockPurpose, functionId) => dispatch(requestDeleteUnlockPurpose(unlockPurpose, functionId)),
        setSelectedUnlockPurpose:(data) => dispatch(setSelectedUnlockPurpose(data)),
        clearSelectedUnlockPurpose:() => dispatch(clearSelectedUnlockPurpose()),
        setAuthentication: (auth) => dispatch(setAuthentication(auth))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(ElectricLockMapPanel);
