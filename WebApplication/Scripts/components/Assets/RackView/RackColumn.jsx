/**
 * @license Copyright 2018 DENSO
 * 
 * RackColumn Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import UnitArea from './UnitArea';
import { isMountUnitView, isHighlightUnitRow } from 'unitMountCheck';

/**
 * ラック搭載図の1列表示コンポーネントを定義します。
 * 
 * @param {number} columnNo 列番号
 * @param {number} row ラックの行数
 * @param {array} unitViews 表示ユニット配列
 * @param {object} selectedUnit 選択中のユニット（表示設定グループのIDと位置情報）
 * @param {object} highlightUnits  ハイライトするユニット一覧
 * @param {string} rackKey ラックのキー（left or right）
 * @param {boolean} showQuickLauncher クイックランチャーを表示するか
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {boolean} isFront 前面表示かどうか
 * @param {boolean} isDrag ドラッグするかどうか
 * @param {function} onSelectUnit ユニットを選択したときに呼び出す
 * @param {function} onDrop ドロップしたときに呼び出す
 * @param {function} onBeginDrag ドラッグを開始したときに呼び出す
 * @param {function} onDragEnd ドラッグが終了したときに呼び出す（ユニットにドロップしたときは呼び出さない）
 */
export default class RackColumn extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
    }
    
    /**
     * render
     */
    render() {
        const { columnNo, row, unitViews, selectedUnit, highlightUnits, isFront, showQuickLauncher, rackKey, isReadOnly, isDrag, isEdge } = this.props;
             
        return (
            <ol class="rack-row-list">
                {this.makeUnits(columnNo, row, unitViews, selectedUnit, highlightUnits, isFront, showQuickLauncher, rackKey, isReadOnly, isDrag, isEdge)}
            </ol>
        );
    }

    /**
     * ユニット行群を作成する
     * @param {number} columnNo 列番号
     * @param {number} maxRow ラックの最大行数
     * @param {array} mountUnitViews 表示ユニット情報
     * @param {object} selectedUnit 選択中のユニット情報
     * @param {array} highlightUnits ハイライトするユニット
     * @param {boolean} isFront 前面表示かどうか
     * @param {boolean} showQuickLauncher クイックランチャーを表示するかどうか
     * @param {string} rackKey ラックのキー（left or right）
     * @param {boolean} isReadOnly 読み取り専用かどうか
     * @param {boolean} isDrag ドラッグするかどうか
     * @returns {array} 表示するユニット群
     */
    makeUnits(columnNo, maxRow, mountUnitViews, selectedUnit, highlightUnits, isFront, showQuickLauncher, rackKey, isReadOnly, isDrag, isEdge){
        var dispUnits = [];
        for (let rowCount = 1; rowCount <= maxRow; rowCount++) {
            var unit = mountUnitViews.find((unit) => isMountUnitView(unit, rowCount));
            
            dispUnits.push(
                <UnitArea key={rowCount} 
                          columnNo={columnNo}
                          rowNo={rowCount} 
                          unitView={unit}
                          showButtonTools={showQuickLauncher}
                          isFront={isFront}
                          isSelected={selectedUnit?this.isSelectUnit((unit?unit.position.y:rowCount), unit, selectedUnit):false}
                          isHighlight={highlightUnits ? isHighlightUnitRow(unit, highlightUnits):false}
                          isReadOnly={isReadOnly}
                          isDrag={isDrag}
                          rackKey={rackKey}
                          isEdge={isEdge}
                          onSelect={(id, positon) => this.handleSelectUnit(id, positon)}
                          onDrop={(id, rowNo, columnNo) => this.handleDrop(id, rowNo, columnNo)}
                          onBeginDrag={(id) => this.handleBeginDrag(id)}
                          onDragEnd={() => this.handleDragEnd()}
                />);

            if (unit){
                rowCount = rowCount + unit.size.height - 1;  
            } 
        }

        return dispUnits;
    }

    /**
     * 選択されたユニット行かどうか
     * @param {number} positionY 対象行
     * @param {array} unitViews 対象行に表示するユニット情報
     * @param {object} selectedUnit 選択ユニット情報
     * @returns {boolean} 選択されたユニット行かどうか
     */
    isSelectUnit(positionY, unitView, selectedUnit){
        if (!selectedUnit) {
            return false;
        }
        return (unitView&&selectedUnit.id === unitView.dispSetId) || (positionY === selectedUnit.position.y);
    }
    
    /****************************************************
     * イベント関数
     ****************************************************/
    /**
     * ユニット選択イベントを発生させる
     * @param {number} dispSetId 表示設定ID
     * @param {number} rowNo ユニット位置（Y位置のみ）
     */
    handleSelectUnit(dispSetId, rowNo){
        var columnNo = (this.props.columnNo) ? this.props.columnNo : 1;
        if (this.props.onSelectUnit) {
            this.props.onSelectUnit(dispSetId, rowNo, columnNo);
        }
    }
        
    /**
     * ユニットがドロップされたときのイベント
     * @param {number} dispSetId ドロップした表示設定ID
     * @param {number} rowNo ドロップしたユニット位置（Y位置のみ）
     */
    handleDrop(dispSetId, rowNo, columnNo){
        if (this.props.onDrop) {
            this.props.onDrop(dispSetId, rowNo, columnNo);
        }
    }
    
    /**
     * ドラッグを開始したときのイベントハンドラ
     * @param {number} dispSetId ドラッグを開始した表示設定ID
     */
    handleBeginDrag(dispSetId){
        if (this.props.onBeginDrag) {         
            this.props.onBeginDrag(dispSetId)
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

RackColumn.propTypes = {
    columnNo: PropTypes.number.isRequired,
    row: PropTypes.number.isRequired,
    unitViews: PropTypes.arrayOf(PropTypes.shape({      //ラック搭載図に表示する表示ユニット情報
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
    })),  
    selectedUnit: PropTypes.shape({
        id: PropTypes.string,
        position:PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number
        })
    }),
    highlightUnits: PropTypes.arrayOf(PropTypes.object),
    rackKey: PropTypes.string,                          //ラックのキー（left or right）
    showQuickLauncher: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    isFront: PropTypes.bool,
    isDrag: PropTypes.bool,
    onSelectUnit: PropTypes.func,
    onDrop: PropTypes.func,
    onBeginDrag: PropTypes.func,
    onDragEnd: PropTypes.func,
}