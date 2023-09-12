/**
 * Copyright 2017 DENSO Solutions
 * 
 * キャパシティ画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { sendData, EnumHttpMethod } from 'http-request';

import { bindActionCreators } from 'redux';
import * as Actions from './actions.js';
import {
    requestMapTransition, requestSelectLayout, requestObjectLink,
    schangeCheckState, setSelectObject, setDrawingArea
} from 'FloorMapCommon/actions.js';
import { closeModal } from 'ModalState/actions.js';

import { RACK_CAPACITY_OPTIONS, LINK_TYPE, MAP_TRANSITION_TYPE } from 'constant';
import { getResult, getMessageModalInfo, getLayoutInfo } from 'FloorMapCommon/sendData';

import Content from 'Common/Layout/Content';
import Box from 'Common/Layout/Box';
import BoxColseButton from 'Common/Widget/BoxColseButton';

import MessageModal from 'Assets/Modal/MessageModal';
import FloorMapBox from 'Assets/FloorMap/FloorMapBox.jsx';
import LayoutSelectForm from 'Assets/FloorMap/LayoutSelectForm.jsx';

import CapacityBox from 'RackCapacity/CapacityBox.jsx';
import RackPowerInfoBox from 'RackCapacity/RackPowerInfoBox.jsx';


class RackCapacityPanel extends Component {

    constructor() {
        super();
        this.state = {
            searchRackNumber: null,     //検索されたときの数字
            rackNumber: "1",           //検索ボックスに入力された数字
            selectType: { value: -1 },          //検索対象ラック種別
            numberValidation: { state: "success", helpText: "" }
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
        this.props.requestInitInfo();
        this.setDrawingArea();

        //画面サイズ変更イベントを設定
        window.addEventListener('resize', () => {
            this.setDrawingArea();
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.lookUp && _.get(this.props.lookUp, "rackTypes") !== nextProps.lookUp.rackTypes) {
            //選択中ラック種別初期値設定
            this.setState({ selectType: _.cloneDeep(_.get(nextProps.lookUp.rackTypes, "0")) });
        }
    }

    //#region reduxの値を更新
    /**********************************
    * 
    * reduxの値を更新
    * 
    **********************************/

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
     * @param {bool} isDouble ダブルクリックかどうか
     * @param {object} selectObject オブジェクト
     */
    handleClickObject = (selectObject, isDouble) => {
        if (isDouble && selectObject.linkType === LINK_TYPE.egroup || selectObject.linkType === LINK_TYPE.layout) {
            this.props.requestObjectLink(selectObject);
        };
    }

    /**
    * 表示マップ変更イベントハンドラ
    * @param {int} optionId オプションID
    * @param {value} isChecked 変更後のチェック状態
    */
    handleChangeDispMap = (optionId, isChecked) => {
        this.props.requestChangeMap({ layoutId: this.props.selectLayout.layoutId, optionId: optionId, isChecked: isChecked });  // 表示マップ情報と関連するオブジェクト情報をセットする
    }

    /**
    * レイアウト選択イベントハンドラ
    * @param {object} selectLayout 選択されたレイアウト
    */
    handleSelectLayout(selectLayout) {
        this.props.requestSelectLayout(selectLayout);
        //キャパシティ表示関連stateクリア
        this.setState({ searchRackNumber: 0 });
    }

    /**
    * 空きラック検索ボタンクリックイベントハンドラ
    */
    handleClickEmptyRackSearch() {
        this.setState({ searchRackNumber: Number(this.state.rackNumber) });
        //空きラック情報を取得する
        this.props.requestEmptyRack({ rackNumber: Number(this.state.rackNumber), selectType: this.state.selectType.typeId });
    }

    /**
    * 空きラック選択イベントハンドラ
    * @param {array} selectObject 選択した空きラック
    * @param {array} groupObjects 選択したレイアウトオブジェクトを含む空きラックグループ
    */
    handleSelectEmptyRack = (selectObject, groupObjects) => {
        if (selectObject.linkType === LINK_TYPE.layout) {
            //レイアウトのオブジェクトがクリックされたら、該当のレイアウト表示＆空きラック情報を取得する
            this.props.requestEmptyLayout({ rackNumber: this.state.searchRackNumber, selectType: this.state.selectType.typeId, selectObject: selectObject });
        } else {
            //選択したラックからラックグループとそれに紐づく分電盤情報を取得する
            this.props.requestRackInfo({ rackNumber: this.state.searchRackNumber, selectType: this.state.selectType.typeId, selectObject: selectObject, groupObjects: groupObjects });
        }
    }

    /**
    * マップ遷移ボタンクリックイベントハンドラ
    * @param {int} type 遷移種別
    */
    handleClickMapTransition = (type) => {
        const optionInfo = _.find(this.props.floorMapOptionInfo, { 'optionId': RACK_CAPACITY_OPTIONS.rackStatus.optionId });
        if (type === MAP_TRANSITION_TYPE.referrer) {   //リンク元レイアウトに戻る
            this.props.requestMapTransition(type);
        }
        else {
            this.props.requestCapacityMapTransition(type);  //ラックキャパシティ情報も取得する
        }
    }

    //#endregion

    //#region ゲッターメソッド
    /**********************************
    * 
    * ゲッターメソッド
    * 
    **********************************/
    /**
    * レイアウト選択フォーム
    */
    getLayoutSelectForm(layoutList, selectLayout, isLoading) {
        return (
            <LayoutSelectForm
                layoutList={layoutList}
                selectLayout={selectLayout}
                isReadOnly={isLoading}
                onChangeSelectLayout={(selectLayout) => this.handleSelectLayout(selectLayout)}
            />
        );
    }

    /**
    * 空きラック検索（キャパシティ）ボックス
    */
    getCapacityBox(objectLink, isSelectLayout, rackTypes, rackNumber, selectType, numberValidation, isLoading) {
        return (
            <CapacityBox
                isEgroupMap={_.get(objectLink, "selectedEgroup", false)}
                isSelectLayout={isSelectLayout}
                rackTypes={rackTypes}
                rackNumber={rackNumber}
                selectType={selectType.value}
                numberValidation={numberValidation}
                isLoading={isLoading}
                onChangeNumber={(rackNumber, validation) => { this.setState({ rackNumber: rackNumber, numberValidation: validation }) }}
                onChangeSelectType={(selected) => { this.setState({ selectType: selected }) }}
                onClickSearch={() => this.handleClickEmptyRackSearch()} />
        );
    }

    /**
    * ラック電源情報ボックス
    */
    getRackPowerInfoBox(isDisplay, rackPowerResult, isLoading) {
        return (
            <RackPowerInfoBox
                display={isDisplay}
                rackPowerInfo={rackPowerResult}
                isLoading={isLoading} />
        );
    }

    //#endregion

    /**
    * render
    */
    render() {
        const { lookUp, selectLayout, selectedLayoutList, floorMapOptionInfo, floorMapInfo, rackStatusObjects, rackPowerResult, capacityInfo, selectObjectInfo, isLoading, modalState } = this.props;
        const { layouts: layoutList, rackStatuses, rackTypes } = lookUp;
        const { title, show, message } = this.props.modalState;
        const { rackNumber, selectType, numberValidation } = this.state;

        //フロアマップコンポーネント表示用情報をまとめる
        let floorMapProps = _.pick(this.props, ['floorMapInfo', 'selectLayout', 'selectObjectInfo', 'capacityInfo', 'rackStatusObjects', 'selectedLayoutList']);
        floorMapProps = {
            ...floorMapProps,
            rackCapacityOptionInfo: floorMapOptionInfo,
            rackStatusLegend: lookUp.rackStatuses
        };
        const egroupName = _.get(selectObjectInfo.objectLinkInfo, "selectedEgroup.egroupName");

        return (
            <Content>
                <div className="flex-center-left">
                    {this.getLayoutSelectForm(layoutList, selectLayout, isLoading)}
                    {egroupName && <label className="mb-05 ml-1">(電源系統：{egroupName})</label>}
                </div>
                <Row>
                    <Col md={8}>
                        <div id="floorMapBox">
                            <FloorMapBox
                                isLoading={isLoading}
                                selectBarProps={{ objectLinkInfo: selectObjectInfo.objectLinkInfo, floorMapOptionInfo: floorMapOptionInfo, selectLayout: selectLayout }}
                                floorMapProps={floorMapProps}
                                onChangeDispMap={this.handleChangeDispMap}
                                onClickObject={this.handleClickObject}
                                onClickMapTransition={this.handleClickMapTransition}
                                onSelectEmptyRack={this.handleSelectEmptyRack}
                            />
                        </div>
                    </Col>
                    <Col md={4}>
                        {this.getCapacityBox(selectObjectInfo.objectLinkInfo, selectLayout ? true : false, rackTypes, rackNumber, selectType, numberValidation, isLoading)}
                        {this.getRackPowerInfoBox(rackPowerResult ? true : false, rackPowerResult, isLoading)}
                    </Col>
                </Row>
                <MessageModal
                    title={modalState.title}
                    show={modalState.show}
                    bsSize={"sm"}
                    buttonStyle={"message"}
                    onCancel={() => this.props.closeModal()}
                >{message}
                </MessageModal>
            </Content>
        );
    }
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
const mapStateToProps = (state) => {
    const { floorMapCommon } = state;
    return {
        selectLayout: floorMapCommon.selectLayout,
        selectedLayoutList: floorMapCommon.selectedLayoutList,
        floorMapOptionInfo: floorMapCommon.floorMapOptionInfo,
        floorMapInfo: floorMapCommon.floorMapInfo,
        selectObjectInfo: floorMapCommon.selectObjectInfo,
        lookUp: state.lookUp,
        rackStatusObjects: state.rackStatusObjects,
        rackPowerResult: state.rackPowerResult,
        capacityInfo: state.capacityInfo,
        isLoading: state.isLoading,
        modalState: state.modalState
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {

    return {
        ...bindActionCreators(Actions, dispatch),
        requestMapTransition: (data) => dispatch(requestMapTransition(data)),
        requestSelectLayout: (data) => dispatch(requestSelectLayout(data)),
        requestObjectLink: (data) => dispatch(requestObjectLink(data)),
        changeCheckState: (data) => dispatch(changeCheckState(data)),
        setSelectObject: (data) => dispatch(setSelectObject(data)),
        setDrawingArea: (data) => dispatch(setDrawingArea(data)),
        closeModal: (data) => dispatch(closeModal(data))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(RackCapacityPanel);

