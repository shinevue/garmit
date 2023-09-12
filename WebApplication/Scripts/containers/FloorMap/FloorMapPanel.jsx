/**
 * Copyright 2017 DENSO Solutions
 * 
 * フロアマップ画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { getSessionStorage, setSessionStorage, STORAGE_KEY } from 'webStorage';    //webStorage.jsから関数とストレージキーをインポート
import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';
import { setAuthentication } from 'Authentication/actions.js';
import { bindActionCreators } from 'redux';
import * as Actions from './actions.js';
import {
    requestMapTransition, requestSelectLayout, requestObjectLink,
    setDrawingArea, setIsConvert
} from 'FloorMapCommon/actions.js';
import { closeModal } from 'ModalState/actions.js';
import { FLOORMAP_OPTIONS, LINK_TYPE, AUTO_UPDATE_VALUES } from 'constant';

import Content from 'Common/Layout/Content';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';

import MessageModal from 'Assets/Modal/MessageModal';
import AutoUpdateButtonGroup from 'Assets/AutoUpdateButtonGroup';
import FloorMapBox from 'Assets/FloorMap/FloorMapBox.jsx';
import LayoutSelectForm from 'Assets/FloorMap/LayoutSelectForm.jsx';
import NetworkAlert from 'Assets/NetworkAlert';

import IncidentLogBox from 'FloorMap/Box/IncidentLogBox.jsx';
import DetailInfoBox from 'FloorMap/Box/DetailInfoBox.jsx';

//import { getDammyCameraInfo } from '../../containers/LocationView/sagas.js';

class FloorMapPanel extends Component {

    constructor() {
        super();
        this.state = {
            getInterval: AUTO_UPDATE_VALUES.slow,
            messageModalInfo: {
                show: null,        //モーダルを表示するかどうか
                title: null,       //モーダルに表示するタイトル
                message: null      //モーダルに表示するメッセージ
            },
            //cameraList: null    //ME用カメラ配置情報
        };
    }

    /**********************************
    * 
    * ライフサイクルイベント
    * 
    **********************************/

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        this.loadAuthentication();  //権限取得
        const layoutId = getSessionStorage(STORAGE_KEY.layoutId);
        this.props.requestInitInfo(layoutId);     //初期表示用データをロードする
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
     * 権限情報を読み込む
     */
    loadAuthentication() {
        getAuthentication(FUNCTION_ID_MAP.floorMap, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    //#region reduxの値を更新
    /**********************************
    * 
    * reduxの値を更新
    * 
    **********************************/

    ///**
    // * 取得したレイアウト情報とそれに紐づく情報をセットする
    // * @param {object} data 取得した情報
    // */
    //setLayoutInfo(data) {
    //    if (data && data.layout) {
    //        this.props.setSelectLayout(data.layout);
    //        if (data.layout.layoutObjects) {
    //            this.props.setLayoutObject(data.layout.layoutObjects);
    //        }

    //        ////ME対応
    //        //if (data.layout.layoutId === 111 || data.layout.layoutId === 121 || data.layout.layoutId === 131) {
    //        //    this.setState({ cameraList: getDammyCameraInfo(111) });
    //        //}
    //        //else if (data.layout.layoutId === 112 || data.layout.layoutId === 122 || data.layout.layoutId === 132) {
    //        //    this.setState({ cameraList: getDammyCameraInfo(112) });
    //        //}
    //        //else {
    //        //    this.setState({ cameraList: null });
    //        //}
    //    }
    //}

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
    /**********************************
    * 
    * イベントハンドラ
    * 
    **********************************/

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
    * 表示マップ変更イベントハンドラ
    * @param {int} objectId オブジェクトID
    * @param {value} isChecked 変更後のチェック状態
    */
    handleChangeDispMap = (optionId, isChecked) => {
        this.props.requestChangeMap({ optionId: optionId, isChecked: isChecked });
    }

    /**
    * 表示マップの追加情報チェック状態変更イベントハンドラ
    * @param {int} optionId
    * @param {bool} checked チェック状態
    */
    handleChangeMapDetail = (optionId, checked) => {
        if (optionId === FLOORMAP_OPTIONS.tempmap.optionId) {
            this.props.requestTempMap({ optionId:optionId, isChecked: checked });
        }
    }

    /**
    * レイアウト選択イベントハンドラ
    * @param {object} selectLayout 選択されたレイアウト情報
    */
    handleSelectLayout(selectLayout) {
        this.props.requestSelectLayout(selectLayout);
    }

    /**
    * マップ遷移ボタンクリックイベントハンドラ
    * @param {int} type 遷移種別
    */
    handleClickMapTransition = (type) => {
        this.props.requestMapTransition(type);
    }


    /**
    * インシデントログへボタンクリックイベントハンドラ
    */
    handleClickToIncident() {
        window.location.href = '/IncidentLog';
    }

    /**
    * 換算値で表示するチェック状態変更イベントハンドラ
    */
    handleChangeIsConvert(checked) {
        this.props.setIsConvert(checked);
        this.props.requestUpdate({ onlyValue: true });
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
        this.props.requestUpdate({onlyValue:false});
    }

    /**
     * ラック詳細ボタンクリックイベント
     */
    handleClickRackDetail() {
        this.props.requestRackView();
    }

    /**
     * ラック詳細モーダルクローズイベント
     */
    handleCloseRackDetail() {
        this.props.setRackView(null);
    }

    /**
     * ラック画面遷移アイコンボタンクリックイベント
     * @param {number} locationId ロケーションID
     */
    handleClickRackLink(locationId) {
        this.dispRackPage(locationId);
    }

    //#endregion

    //#region ゲッターメソッド
    /**********************************
    * 
    * ゲッターメソッド
    * 
    **********************************/

    /**
    * 詳細情報ボックス
    */
    getDetailBox(rackView, selectObjectInfo, isLoading, authentication, isConvert, disabledRackFunc) {
        const valueData = _.get(selectObjectInfo, "objectLinkInfo.measuredValues");
        const selectObject = _.get(selectObjectInfo, "selectObject");
        const isReadOnly = authentication.isReadOnly || authentication.level >= LAVEL_TYPE.operator;
        return (
            <DetailInfoBox
                ref="detailInfoBox"
                show={this.isDisplayDetailInfoBox(selectObject, valueData)}
                selectObjectInfo={selectObjectInfo}
                rackView={rackView}
                isLoading={isLoading}
                isReadOnly={isReadOnly}
                isConvert={isConvert}
                disabledRackFunc={disabledRackFunc}
                onClickRackDetail={() => this.handleClickRackDetail()}
                onCloseRackDetail={() => this.handleCloseRackDetail()}
                onClickRackLink={(locationId) => this.handleClickRackLink(locationId)}
            />
        );
    }

    /**
    * レイアウト選択フォーム
    */
    getLayoutSelectForm(layoutList, selectLayout, selectObjectInfo, isLoading) {
        const linkType = _.get(selectObjectInfo, "linkType");
        const isShowEgroupMap = linkType === LINK_TYPE.egroup ? true : false;
        return (
            <LayoutSelectForm
                isReadOnly={isLoading}
                isShowBreadcrumb={true}
                layoutList={layoutList}
                selectLayout={selectLayout}
                isShowEgroupMap={isShowEgroupMap}
                onChangeSelectLayout={(selectLayout) => this.handleSelectLayout(selectLayout)}
            />
        );
    }

    /**
    * 画面設定ボタングループ
    */
    getSettingButtonGroup(isLoading, isConvert, getInterval) {
        return (
            <div className="flex-center-right">
                <div className="mr-2">
                    <CheckboxSwitch
                        text="換算表示"
                        bsSize="xs"
                        disabled={isLoading}
                        checked={isConvert}
                        onChange={(checked) => this.handleChangeIsConvert(checked)}
                    />
                </div>
                <div>
                    <AutoUpdateButtonGroup
                        value={getInterval}
                        disabled={isLoading}
                        onChange={(val) => this.handleChangeUpdateInterval(val)}
                        onManualUpdateClick={() => this.handleClickManualUpdate()}
                    />
                </div>
            </div>
        );
    }

    /**
    * インシデントログボックス
    */
    getIncidentLogBox(selectLayout, incidentInfo, isLoading) {
        return (
            <IncidentLogBox
                show={selectLayout && incidentInfo.headers ? true : false}
                incidentInfo={incidentInfo}
                isLoading={isLoading}
                onClickToIncident={() => this.handleClickToIncident()}
            />
        );
    }
    //#endregion

    //#region render
    /**
    * render
    */
    render() {
        const { authentication, lookUp, selectLayout, selectedLayoutList, floorMapOptionInfo, floorMapInfo, disabledRackFunc } = this.props;
        const { incidentInfo, rackView, selectObjectInfo } = this.props;
        const { isLoading } = this.props;
        const { layouts: layoutList } = lookUp;
        const { show, title, message } = this.props.modalState;
        const { isNetworkError } = this.props.networkError;
        const { isConvert } = floorMapInfo;
        const { messageModalInfo, getInterval } = this.state;
        const loading = isLoading || !authentication.loadAuthentication;

        //フロアマップコンポーネント表示用情報をまとめる
        let floorMapProps = _.pick(this.props, ['floorMapInfo', 'selectLayout', 'selectObjectInfo', 'tempmapImagePath', 'selectedLayoutList', 'floorMapOptionInfo']);
        floorMapProps = {
            ...floorMapProps,
            authCheckable: true
        };
        
        return (
            <Content>
                <NetworkAlert show={isNetworkError} />
                <div className="flex-center-end">
                    {this.getLayoutSelectForm(layoutList, selectLayout, selectObjectInfo.selectObject, loading)}
                    {this.getSettingButtonGroup(loading, isConvert, getInterval)}
                </div>
                <Row>
                    <Col md={8}>
                        <div id="floorMapBox">
                            <FloorMapBox
                                isLoading={loading}
                                selectBarProps={{ objectLinkInfo: selectObjectInfo.objectLinkInfo, floorMapOptionInfo: floorMapOptionInfo, selectLayout: selectLayout }}
                                floorMapProps={floorMapProps}
                                onChangeDispMap={this.handleChangeDispMap}
                                onChangeMapDetail={this.handleChangeMapDetail}
                                onClickObject={this.handleClickObject}
                                onClickMapTransition={this.handleClickMapTransition}
                            />
                        </div>
                    </Col>
                    <Col md={4}>
                        {this.getDetailBox(rackView, selectObjectInfo, loading, authentication, isConvert, disabledRackFunc)}
                        {this.getIncidentLogBox(selectLayout, incidentInfo, loading)}
                    </Col>
                </Row>
                <MessageModal
                    title={title}
                    show={show}
                    bsSize={"sm"}
                    buttonStyle={"message"}
                    onCancel={() => this.props.closeModal()}
                >{message}
                </MessageModal>
            </Content>
        );
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

    //#region その他関数
    /**********************************
    * 
    * その他関数
    * 
    **********************************/

    /**
    * オブジェクトのリンク先情報を取得するかどうか
    * @param {int} linkType 選択されたオブジェクトのリンクタイプ
    * @param {bool} isDouble ダブルクリックイベントかどうか
    */
    isGetObjectLink(linkType, isDouble) {
        if (isDouble) {
            if (linkType === LINK_TYPE.egroup || linkType === LINK_TYPE.layout) {
                //画面遷移の場合はダブルクリック
                return true;
            }
            return false;
        }
        else {
            if (linkType === LINK_TYPE.location || linkType === LINK_TYPE.point) {
                //詳細情報を取得する場合はクリック
                return true;
            }
            return false;
        }
    }

    /**
    * 詳細情報ボックスを表示するかどうか
    * @param {object} selectObject 選択中オブジェクト情報
    * @param {array} valueData 選択中オブジェクトに紐づくポイント情報
    */
    isDisplayDetailInfoBox(selectObject, valueData) {
        const linkType = _.get(selectObject, "linkType");
        if (linkType === LINK_TYPE.point || linkType === LINK_TYPE.location) {
            return true;
        }
        else if (linkType === LINK_TYPE.egroup && valueData && valueData.length > 0) {
            return true;
        }
        return false;
    }
    
    /**
     * ラック画面遷移
     * @param {number} locationId ロケーションID
     */
    dispRackPage(locationId) {        
        setSessionStorage(STORAGE_KEY.locationId, locationId);      //sessionStorageにロケーションIDを格納
        window.location.href = '/Rack';     //画面遷移
    }
    //#endregion
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
const mapStateToProps = (state) => {
    const { floorMapCommon } = state;
    return {
        authentication: state.authentication,
        lookUp: state.lookUp,
        incidentInfo: state.incidentInfo,
        rackView: state.rackView,
        tempmapImagePath: state.tempmapImagePath,
        selectLayout: floorMapCommon.selectLayout,
        selectedLayoutList: floorMapCommon.selectedLayoutList,
        floorMapOptionInfo: floorMapCommon.floorMapOptionInfo,
        floorMapInfo: floorMapCommon.floorMapInfo,
        selectObjectInfo: floorMapCommon.selectObjectInfo,
        disabledRackFunc: state.disabledRackFunc,
        isLoading: state.isLoading,
        modalState: state.modalState,
        networkError: state.networkError
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {

    return {
        ...bindActionCreators(Actions, dispatch),
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        requestMapTransition: (data) => dispatch(requestMapTransition(data)),
        requestSelectLayout: (data) => dispatch(requestSelectLayout(data)),
        requestObjectLink: (data) => dispatch(requestObjectLink(data)),
        setSelectLayout: (data) => dispatch(setSelectLayout(data)),
        changeCheckState: (data) => dispatch(changeCheckState(data)),
        setOptions: (options, titles) => dispatch(setOptions(options, titles)),
        setLayoutObject: (data) => dispatch(setLayoutObject(data)),
        setEgroupObject: (data) => dispatch(setEgroupObject(data)),
        setSelectObject: (data) => dispatch(setSelectObject(data)),
        setDrawingArea: (data) => dispatch(setDrawingArea(data)),
        setIsConvert: (data) => dispatch(setIsConvert(data)),
        closeModal: (data) => dispatch(closeModal(data))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(FloorMapPanel);
