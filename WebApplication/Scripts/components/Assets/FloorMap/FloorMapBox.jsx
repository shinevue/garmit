/**
 * Copyright 2017 DENSO Solutions
 * 
 * フロアマップボックス Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import GarmitBox from 'Assets/GarmitBox';
import MapSelectBar from 'Assets/FloorMap/MapSelectBar.jsx';
import FloorMap from 'Assets/FloorMap/FloorMap.jsx';
import MessageModal from 'Assets/Modal/MessageModal.jsx';

/**
 * フロアマップボックス
 * <FloorMapBox />
 */
export default class FloorMapBox extends Component {

    constructor() {
        super();
        this.state = {
            show:false
        };
    }

     /**
     * 新たなPropsを受け取ったときに実行される
     */
    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps, "floorMapProps.selectLayout")
            && _.get(nextProps, "floorMapProps.selectLayout") !== _.get(this.props, "floorMapProps.selectLayout")
            && _.size(_.get(nextProps, "floorMapProps.selectLayout.layoutObjects")) <= 0) {
            this.setState({ show: true });
        }
    }

    //#region イベントハンドラ
    /**
     * 表示マップチェックボックスチェック状態変更イベント
     */
    handleChangeDispMap = (optionId, isChecked) => {
        if (this.props.onChangeDispMap) {
            this.props.onChangeDispMap(optionId, isChecked);
        }
    }

    /**
     * 表示マップの詳細情報のチェック状態変更イベント
     */
    handleChangeMapDetail = (optionId, checked) => {
        if (this.props.onChangeMapDetail) {
            this.props.onChangeMapDetail(optionId, checked);
        }
    }

    /**
     * オブジェクトクリックイベント
     */
    handleClickObject = (selectObject, isDouble) => {
        if (this.props.onClickObject) {
            this.props.onClickObject(selectObject, isDouble);
        }
    }

    /**
     * 空きラック選択イベント
     */
    handleSelectEmptyRack = (selectObject, groupObjects) => {
        if (this.props.onSelectEmptyRack) {
            this.props.onSelectEmptyRack(selectObject, groupObjects);
        }
    }

    /**
     * マップ遷移ボタンクリックイベント
     */
    handleClickMapTransition = (type) => {
        if (this.props.onClickMapTransition) {
            this.props.onClickMapTransition(type);
        }
    }
    
    /**
     * 電気錠ラッククリックイベントハンドラ
     * @param {object} selectObject クリックされたオブジェクト
     */
    handleClickKeyRackObject = (selectObject) => {
        if (this.props.onClickKeyRackObject) {
            this.props.onClickKeyRackObject(selectObject);
        }
    }
    
    /**
     * 電気錠オブジェクト選択イベント
     */
    handleSelectKeyRackObjects = (selectObjects) => {
        if (this.props.onSelectKeyRackObjects) {
            this.props.onSelectKeyRackObjects(selectObjects);
        }
    }

    //#endregion 
    //#endregion 

    /**
     * render
     */
    render() {
        const { isLoading, selectBarProps, floorMapProps, idKey } = this.props;
        const { show } = this.state;
        return (
            <GarmitBox isLoading={isLoading} title="フロアマップ">
                <div>
                    <MapSelectBarComponent
                        {...selectBarProps}
                        onChangeDispMap={this.handleChangeDispMap}
                        onChangeMapDetail={this.handleChangeMapDetail}
                    />
                    <FloorMapComponent
                        {...floorMapProps}
                        idKey={idKey}
                        onClickObject={this.handleClickObject}
                        onSelectEmptyRack={this.handleSelectEmptyRack}
                        onClickMapTransition={this.handleClickMapTransition}
                        onClickKeyRackObject={this.handleClickKeyRackObject}
                        onSelectKeyRackObjects={this.handleSelectKeyRackObjects}
                    />
                    <MessageModal
                        title="オブジェクト未登録"
                        show={show}
                        buttonStyle="message"
                        onCancel={() => this.setState({ show: false })}
                    >
                         選択レイアウトにオブジェクト情報が登録されていません。
                    </MessageModal>
                </div>
            </GarmitBox>
        );
    }
}

FloorMapBox.propTypes = {
    isLoading: PropTypes.bool,
    selectBarProps: PropTypes.shape({
        objectLinkInfo: PropTypes.obj,      //選択中オブジェクトのリンク先情報
        floorMapOptionInfo: PropTypes.obj,  //表示マップチェックボックス情報
        selectLayout: PropTypes.obj,        //選択中レイアウト情報
        tempPointInfo:PropTypes.obj         //温度分布表示の測定ポイントを表示に関する情報
    }),
    floorMapProps: PropTypes.shape({
        floorMapInfo: PropTypes.shape({
            drawingArea: PropTypes.shape({  //描画エリアサイズ
                width: PropTypes.number,
                height: PropTypes.number
            }),
            isConvert:PropTypes.bool        //換算するかどうか
        }),      
        selectLayout: PropTypes.obj,        //選択中レイアウト情報
        selectObjectInfo: PropTypes.obj,    //選択中オブジェクト情報
        tempmapImagePath: PropTypes.obj,    //温度分布図格納先情報
        capacityInfo: PropTypes.obj,        //キャパシティ情報
        rackStatusObjects: PropTypes.obj,   //ラックステータスオブジェクト情報
        rackStatusLegend: PropTypes.obj,    //ラックステータス凡例情報
        selectedLayoutList: PropTypes.obj,  //選択したレイアウトのログ情報
        floorMapOptionInfo: PropTypes.obj,  //表示マップチェックボックス情報
    })
};


/**
* 表示マップ選択バー
*/
const MapSelectBarComponent = ({ selectLayout, objectLinkInfo, floorMapOptionInfo, onChangeDispMap: handleChangeDispMap, onChangeMapDetail: handleChangeMapDetail })=> {
    const isEgroupMap = _.get(objectLinkInfo, "selectedEgroup", false);
    if (selectLayout && !isEgroupMap) {   //レイアウト選択中かつ選択中レイアウトが分電盤でない
        return (
            <MapSelectBar
                floorMapOptionInfo={floorMapOptionInfo}
                onChangeDispMap={handleChangeDispMap}
                onChangeMapDetail={handleChangeMapDetail}
            />
        );
    }
    return null;
}

/**
* フロアマップ
*/
const FloorMapComponent = (props) => {
    const { floorMapInfo, selectLayout, selectObjectInfo, selectedLayoutList, idKey } = props;    //共通情報
    const { floorMapOptionInfo, rackCapacityOptionInfo } = props;      //マップオプション情報 
    const { tempmapImagePath } = props;    //温度分布図格納パス情報
    const { capacityInfo, rackStatusObjects, rackStatusLegend } = props;    //ラックキャパシティ画面用情報
    const { onClickObject: handleClickObject, onClickMapTransition: handleClickMapTransition } = props; //共通関数
    const { onSelectEmptyRack: handleSelectEmptyRack } = props; //ラックキャパシティ画面用関数
    const { isElecKey, keyStatusItems, elecKeyObjects, selectKeyRackObjects, onClickKeyRackObject: handleClickKeyRackObject, onSelectKeyRackObjects: handleSelectKeyRackObjects } = props;    //電気錠画面
    const { authCheckable, selectableLinkTypes } = props;           //追加情報（権限チェック/選択するリンクタイプ絞り込み）

    if (selectLayout) {     //レイアウト選択時
        return (
            <FloorMap
                idKey={idKey}
                {...floorMapInfo}
                selectLayout={selectLayout}
                selectObjectInfo={selectObjectInfo}
                canBack={selectedLayoutList.canBack}
                canForward={selectedLayoutList.canForward}
                floorMapOptionInfo={floorMapOptionInfo}
                rackCapacityOptionInfo={rackCapacityOptionInfo}
                tempmapImagePath={tempmapImagePath}
                {...capacityInfo}
                rackStatusObjects={rackStatusObjects}
                rackStatusLegend={rackStatusLegend}
                isElecKey={isElecKey}
                keyStatusItems={keyStatusItems}
                elecKeyObjects={elecKeyObjects}
                selectKeyRackObjects={selectKeyRackObjects}
                authCheckable={authCheckable}
                selectableLinkTypes={selectableLinkTypes}
                onClickObject={handleClickObject}
                onClickMapTransition={handleClickMapTransition}
                onSelectEmptyRack={handleSelectEmptyRack}
                onClickKeyRackObject={handleClickKeyRackObject}
                onSelectKeyRackObjects={handleSelectKeyRackObjects}
            />
        );
    }
    return null;
}
