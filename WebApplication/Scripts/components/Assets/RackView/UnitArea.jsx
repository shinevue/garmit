/**
 * @license Copyright 2017 DENSO
 * 
 * UnitArea Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import classNames from 'classnames';
import UnitDivision, { DragUnit } from './UnitDivision';
import { DropTarget } from 'react-dnd';
import { hasUnitDispSetting } from 'assetUtility';

/**
 * 通常時のユニット領域コンポーネント
 * @param {number} columnNo 列番号
 * @param {number} rowNo 行番号
 * @param {object} unitView ユニット情報
 * @param {boolean} showButtonTools ツールボタンを表示するかどうか
 * @param {boolean} isFront 前面表示かどうか
 * @param {boolean} isSelected 選択中かどうか
 * @param {boolean} isHighlight ハイライト表示するかどうか
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {boolean} isDrag ドラッグするかどうか
 * @param {string} rackKey ラックのキー（left, right）
 * @param {function} onSelect 選択したときに呼び出す
 * @param {function} onDrop ドロップされたときに呼び出す
 * @param {function} onBeginDrag ドラッグを開始したときに呼び出す
 * @param {function} onDragEnd ドラッグが終了したときに呼び出す（ユニットにドロップしたときは呼び出さない）
 */
export default  class UnitArea extends Component {
    render() {
        const { isDrag } = this.props;
        return (
            isDrag ?
                <DropUnitArea {...this.props} 
                              onDrop={(target) => this.handleDrop(target)} 
                              onBeginDrag={() => this.handleBeginDrag()}
                              onDragEnd={() => this.handleDragEnd()}
                />
            :
            makeUnitArea(this.props)            
        );
    }
    
    /****************************************************
     * イベント関数
     ****************************************************/
   
    /** 
     * ユニットのドロップイベントハンドラ
     * @param {object} target ドロップ対象
     */
    handleDrop(target){        
        if (this.props.onDrop) {
            var unitView = target.unitView;        
            var id = '';
            var rowNo = target.rowNo;
            var columnNo = target.columnNo;
            if (unitView !== undefined) {
                id = unitView.dispSetId;
                rowNo = unitView.position.y;
                columnNo = unitView.position.x;
            }
            this.props.onDrop(id, rowNo, columnNo);
        }
    }

    /**
     * ドラッグを開始したときのイベントハンドラ
     */
    handleBeginDrag(){
        if (this.props.onBeginDrag) {
            const { unitView } = this.props;            
            this.props.onBeginDrag(unitView.dispSetId);
        }
    }

    /**
     * ドラッグが終わったときのイベント（ユニットにドロップしたときは発生しない）
     */
    handleDragEnd() {
        if (this.props.onDragEnd) {
            this.props.onDragEnd();
        }
    }
}

/****************************************************
 * ドロップ用
 ****************************************************/

/**
 * ドロップするユニットのdropを受け入れたときの処理などの処理を定義
 */
const unitTarget = {
    /**
     * ドロップするかどうか
     * @param {*} props ドロップするユニットのprops
     * @param {*} monitor ドロップ先のモニタリング情報
     * @returns {boolean} ドロップできるかどうか
     */
    canDrop(props, monitor) {
      const dragProps = monitor.getItem();　// DragSource の props が取り出せる
      return (!(props.unitView && 
                props.unitView.dispSetId === dragProps.unitView.dispSetId) && 
               !(props.rackKey === dragProps.rackKey));
    },
    /**
     * ドロップされたときのイベント
     * @param {*} dropProps ドロップしたユニットのprops
     * @param {*} monitor ドロップ先のモニタリング情報
     * @param {*} dropComponent ドロップ先のユニットコンポーネントのインスタンス
     */
    drop(dropProps, monitor, dropComponent) {
        const dragProps = monitor.getItem();　// DragSource の props が取り出せる
        if (!(dropProps.unitView && 
              dropProps.unitView.dispSetId === dragProps.unitView.dispSetId) && 
              dragProps.onDrop) {
            dragProps.onDrop(dropProps);
        } else {
            dragProps.onDragEnd();
        }
    },
    /**
     * ドロップ先にホバーされたときのイベント
     * @param {*} props ドロップするユニットのprops
     * @param {*} monitor　ドロップ先のモニタリング情報
     * @param {*} component ドロップ先のユニットコンポーネントのインスタンス
     */
    hover(props, monitor, component) {
        if (props.onHover) {
            props.onHover();
        }
    }
}

/**
 * ドロップ対象のコンポーネントで使える関数の定義
 * @param {*} connect 
 * @param {*} monitor モニタリング情報
 */
function targetCollect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
      };
}

/**
 * ドロップ用のユニット領域コンポーネント
 */
@DropTarget('unitmove', unitTarget, targetCollect)
export class DropUnitArea extends Component {
    render() {
        const { connectDropTarget } = this.props;
        return connectDropTarget(
            makeUnitArea(this.props)
        );
    }
}


/****************************************************
 * ユニット領域表示共通関数
 ****************************************************/

/**
 * ユニット領域表示を作成する
 * @param {*} props プロパティ
 * @returns {object} ユニット表示用のTdタグ
 */
function makeUnitArea(props){
    const { columnNo, unitView, isSelected, isHighlight, rackKey, isFront, isDrag, isOver, canDrop, isEdge } = props;
    const isUnitDispSetting = hasUnitDispSetting(unitView);
    const heightClass = (isUnitDispSetting && unitView.size.height >= 2) ? 'has-unit-' + unitView.size.height + 'u' : '';
    const highlightClass = isHighlight ? 'unit-highlight-' + rackKey : '';
    const isPrevColumn = isUnitDispSetting && hasPrevColumn(columnNo, unitView.position.x);
    const isNextColumn = isUnitDispSetting && hasNextColumn(columnNo, unitView.position.x, unitView.size.width);
    const classes = {
        'unit-group': isUnitDispSetting,
        'unit-selected': isSelected,
        'drop-target-unit': isDropTarget(isOver, canDrop),
        'drop-target-empty': (!isUnitDispSetting&&isDropTarget(isOver, canDrop)),
        'has-prev-column': isFront ? isPrevColumn : isNextColumn,
        'has-next-column': isFront ? isNextColumn : isPrevColumn,
        'edge-style': isEdge
    }

    return (
        <li className={classNames(classes, heightClass, highlightClass)} onClick={() =>handleUnitClick(props)} >
            {isUnitDispSetting&&
                (isDrag ?
                    <DragUnit {...props} 
                            onBeginDrag={() => handleBeginDrag(props.onBeginDrag)}
                            onDragEnd={() => handleDragEnd(props.onDragEnd)}
                    />
                    :
                    <UnitDivision {...props} />)
            }
            {isUnitDispSetting&&makePaddingUnit(isUnitDispSetting ? unitView.size.height : 1)}
        </li>
    );
}

/**
 * パッディングユニットを作成する
 * @param {number} unitHeight ユニットの高さ(U)
 * @returns {element} パッディングユニット
 */
function makePaddingUnit(unitHeight){
    var paddingList = [];       
    for (var i = 0; i < unitHeight; i++) {
        paddingList.push(<li></li>);
    }        
    return (
        <ul>
            {paddingList}
        </ul>
    );
}

/**
 * ドロップ対象かどうか
 * @param {boolean} isOver マウスオーバーされているか
 * @param {boolean} canDrop ドロップできるかどうか
 * @returns {boolean} ドロップ対象かどうか
 */
function isDropTarget(isOver, canDrop) {
    return (isOver&&canDrop);
}

/**
 * 表示中のユニット領域が前列と連結されている
 * @param {number} columnNo 列番号
 * @param {number} positionX ユニットの位置（列） 
 */
function hasPrevColumn(columnNo, positionX) {
    return (positionX < columnNo);
}

/**
 * 表示中のユニット領域が後列と連結されている
 * @param {number} columnNo 列番号
 * @param {number} positionX ユニット位置（列）
 * @param {number} width ユニットの幅
 */
function hasNextColumn(columnNo, positionX, width) {
    return (columnNo < (positionX + width - 1));
}

/****************************************************
 * イベント関数
 ****************************************************/

/**
 * ユニットのクリックイベント
 * @param {*} props プロパティ
 */
function handleUnitClick(props){
    var unitView = props.unitView;        
    var id = '';
    var unitPosition = props.rowNo;
    if (unitView !== undefined) {
        id = unitView.dispSetId;
        unitPosition = unitView.position.y;
    }
    onSelectUnit(id, unitPosition, props);
}

/**
 * ユニット選択イベントを発生させる
 * @param id ユニットID
 * @param position ユニット位置
 * @param {*} props プロパティ
 */
function onSelectUnit(id, position, props){
    if (props.onSelect && !props.isReadOnly && !props.isDrag) {
        props.onSelect(id, position);
    }
}

/**
 * ドラッグを開始したときのイベントハンドラ
 * @param {*} onBeginDrag 呼び出す関数
 */
function handleBeginDrag(onBeginDrag){
    if (onBeginDrag) {         
        onBeginDrag();
    }
}

/**
 * ドラッグが終わったときのイベント（ユニットにドロップしたときは発生しない）
 * @param {*} onDragEnd 呼び出す関数
 */
function handleDragEnd(onDragEnd) {
    if (onDragEnd) {
        onDragEnd();
    }
}

UnitArea.propTypes = {
    columnNo: PropTypes.number.isRequired,
    rowNo: PropTypes.number.isRequired,
    unitView: PropTypes.shape({      //ラック搭載図に表示する表示ユニット情報
        dispSetId: PropTypes.string.isRequired,
        frontDispData: PropTypes.shape({             //前面の表示設定
            dispName: PropTypes.string.isRequired,
            fontSize: PropTypes.number.isRequired,
            textColor: PropTypes.string.isRequired,
            backColor: PropTypes.string.isRequired,
            unitImage: PropTypes.shape({
                url: PropTypes.string.isRequired
            })
        }).isRequired,
        rearDispData: PropTypes.shape({              //背面の表示設定
            dispName: PropTypes.string.isRequired,
            fontSize: PropTypes.number.isRequired,
            textColor: PropTypes.string.isRequired,
            backColor: PropTypes.string.isRequired,
            unitImage: PropTypes.shape({
                url: PropTypes.string.isRequired
            })
        }).isRequired,
        position: PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired
        }).isRequired,
        size: PropTypes.shape({
            height: PropTypes.number.isRequired,
            width: PropTypes.number.isRequired
        }).isRequired,
        status: PropTypes.shape({
            color: PropTypes.string.isRequired
        }).isRequired,
        hasAlarm: PropTypes.bool,
        alarmName: PropTypes.string,
        totalWeight: PropTypes.number,
        totalPower: PropTypes.number,
        units: PropTypes.arrayOf(PropTypes.shape({
            unitId: PropTypes.string.isRequired,
            unitNo: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            type: PropTypes.shape({
                name: PropTypes.string.isRequired
            }),
            position: PropTypes.shape({
                x: PropTypes.number.isRequired,
                y: PropTypes.number.isRequired
            }).isRequired,
            size: PropTypes.shape({
                height: PropTypes.number.isRequired,
                width: PropTypes.number.isRequired
            }).isRequired,
            links: PropTypes.arrayOf(PropTypes.shape({
                title: PropTypes.string.isRequired,
                url: PropTypes.string.isRequired
            }))
        }))
    }),
    isFront: PropTypes.bool,
    isSelected: PropTypes.bool,
    isHighlight: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    isDrag: PropTypes.bool,
    rackKey: PropTypes.string,
    onSelect: PropTypes.func,
    onDrop: PropTypes.func,
    onBeginDrag: PropTypes.func,
    onDragEnd: PropTypes.func,
    showButtonTools: PropTypes.bool
}
