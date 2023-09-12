/**
 * @license Copyright 2018 DENSO
 * 
 * UnitDivision Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import classNames from 'classnames';
import UnitToolButtons from './UnitToolButtons';
import { DragSource } from 'react-dnd';
import { hasUnitDispSetting } from 'assetUtility';

/**
 * 通常時のユニットコンポーネント
 */
export default class UnitDivision extends Component {
    render() {
        return (
            makeUnitView(this.props)
        );
    }
}

/****************************************************
 * ドラッグ用
 ****************************************************/

/**
 * ドラッグするユニットのdrag開始処理などの処理を定義
 */
const unitSource = {
    /**
     * ドラッグが開始されたときのイベントハンドラ
     * @param {*} props ドラッグ元のProps
     * @returns {*} DropTargetを渡す
     */
    beginDrag(props) {
        props.onBeginDrag();
        return props;
    },
    /**
     * ドラッグが終了したときのイベント
     * @param {*} props ドラッグ元のProps
     * @returns {*} DropTargetを渡す
     */
    endDrag(props, monitor, component) {
        if (!monitor.didDrop()) {
            props.onDragEnd();
        }
    },
    /**
     * ドラックできるかどうか
     * @param {*} props ドラッグ元のprops
     * @param {*} monitor ドラッグ元のモニタリング情報
     */
    canDrag(props, monitor) {
        if (hasUnitDispSetting(props.unitView)) {
            return true;
        }
        return false;           //空ユニットは移動しない
    }
}

/**
 * ドラッグするコンポーネントで使える関数の定義
 * @param {*} connect DragSourceConnectorのインスタンス。主にDOMノードとReactDNDを紐付けるための関数を提供
 * @param {*} monitor モニタリング情報
 */
function sourceCollect(connect, monitor) {
    return {
      connectDragSource: connect.dragSource(),
      isDragging: monitor.isDragging()
    }
}

/**
 * ドラッグ用のユニットコンポーネント
 */
@DragSource('unitmove', unitSource, sourceCollect)
export class DragUnit extends Component {
    render() {
        const { connectDragSource } = this.props;
        return connectDragSource(
            makeUnitView(this.props)
        );
    }
}

/****************************************************
 * ユニット表示共通関数
 ****************************************************/

/**
 * ユニット表示を作成する
 * @param {*} props プロパティ
 * @returns {object} ユニットDivタグ
 */
function makeUnitView(props){
    const { unitView, isFront, showButtonTools, isReadOnly, isDragging } = props;
    const isUnitDispSetting = hasUnitDispSetting(unitView);
    
    var dispSetting;
    var unitImage;
    if (isUnitDispSetting) {
        dispSetting = isFront ? unitView.frontDispData : unitView.rearDispData;
        unitImage = dispSetting.unitImage;
    }

    const style = getUnitViewStyle(dispSetting, isDragging);
    const classes = {
        "unit": true,
        "has-image": (unitImage&&unitImage.url) ? true : false,
        "drop-target-empty": isDragging
    }
    
    return (isUnitDispSetting ?
                <div className={classNames(classes, (unitView.alarmName? 'unit-' + unitView.alarmName : ''))} style={style} >
                    <div class="unit-inner">
                        <span class="unit-name">{dispSetting.dispName}</span>
                        <span class="unit-status" style={{color: unitView.status.color}}></span>
                        {unitView.units&&unitView.units.length >= 2&&
                            <span class="device-count">{unitView.units.length}</span>
                        }
                        {showButtonTools&&<UnitToolButtons units={unitView.units} isReadOnly={isReadOnly} />}
                    </div>
                </div>    
                :
                <div className={classNames(classes)} style={style} >
                </div>
    );
}

/**
 * 表示ユニットのスタイルを取得する
 * @param {object} dispSetting 表示設定情報
 * @param {boolean} isDragging ドラッグ中か
 * @returns {object} 表示ユニットのスタイル
 */
function getUnitViewStyle(dispSetting, isDragging){
    var style = {};
    const commonStyle = {
        opacity: isDragging ? 0.5 : 1
    }

    if (dispSetting) {
        style = {
            backgroundColor:dispSetting.backColor,
            color: dispSetting.textColor,
            fontSize: dispSetting.fontSize,
            backgroundImage: makeBackgroundImage(dispSetting.unitImage),
            ...commonStyle
        }
    } else {
        style = commonStyle;
    }

    return style;
}

/**
 * 背景画像Url作成
 * @param {object} image 背景画像
 * @returns {string} 背景画像Url
 */
function makeBackgroundImage(image){
    return (image&&image.url) ? 'url("' + image.url + '")' : '';
}