/**
 * @license Copyright 2017 DENSO
 * 
 * RackMultiTable Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

import { Table } from 'react-bootstrap';
import UnitDispItem from './UnitDispItem';
import { isMatchRowNo, isMatchColumnNo, includedRackColumn, includedRackRow, isHighlightUnitRow } from 'unitMountCheck';

/**
 * 段組みラックを表示する
 * @param {object} rack ラック情報（表示ユニット情報を含む）
 * @param {object} selectedUnit 選択中のユニット（ユニット情報と位置情報）
 * @param {number} selectColumnNo 選択中の列番号
 * @param {object} movingTarget 移動対象のユニット情報（ユニット情報と位置情報）
 * @param {array} highlightUnits ハイライトするユニット一覧 ※表示用のユニットではなく、Unitの情報
 * @param {boolean} isReadOnly 読み取り専用かどうか（ユニットの選択ができない）
 * @param {string} rackKey ラックのキー（left or right）
 * @param {boolean} isFront 前面表示かどうか
 * @param {boolean} showQuickLauncher クイックランチャーを表示するか
 * @param {object} toolipContainer ツールチップのコンテナ
 * @param {function} onTooltipButtonEventTrigger ツールチップを表示するボタンのイベントが発生したときに呼び出す（ポップアップ用）
 * @param {function} onSelectUnit ユニットを選択したときに呼び出す
 */
export default class RackMultiTable extends Component {
    
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
        const { rack, isReadOnly } = this.props;
        const rackClass = 'rack-h' + rack.type.viewHeight + '-' + rack.row + 'u';
              
        return (
            <Table ref="rackMultiTable" className={ClassNames('rack-body', rackClass)}>
                <tbody>
                    {rack&&this.makeMultiRackView()}
                </tbody>
                <tfoot>
                    {rack&&this.makeColumnNo()}
                </tfoot>
            </Table>
        );
    }

    
    /****************************************************
     * コンポーネント作成関数
     ****************************************************/

    makeColumnNo() {
        const { col } = this.props.rack;
        var cells = this.makeColumnNoRow(col);
        return (
            <tr key='columnNo' >
                {cells}
            </tr>
        )
    }


    /**
     * 段組みラック搭載図を作成する
     */
    makeMultiRackView(){
        const { row, col, unitDispSettings } = this.props.rack;
        var rackRows = [];

        //1行ずつ作成する
        for (var rowNo = row ; rowNo > 0 ; --rowNo) {            
            var cells = this.makeRowCells(rowNo, col, unitDispSettings);
            rackRows.push(
                <tr key={rowNo} >
                    {cells}
                </tr>
            );
        }

        return rackRows;
    }

    /**
     * 列番号の列を作成する
     * @param {number} maxColumn 最大列数
     */
    makeColumnNoRow(maxColumn){       
        const { selectColumnNo } = this.props; 
        let cells = [];
        cells.push(<th></th>);      //1列目は空

        for (var colCount = 1; colCount <= maxColumn; ++colCount){
            if (selectColumnNo && selectColumnNo === colCount) {
                cells.push(<th className="select-column">{colCount}</th>);
            } else {
                cells.push(<th>{colCount}</th>);
            }
        }

        return cells;
    }

    /**
     * 1行分のセルを作成する
     * @param {number} rowNo 行番号
     * @param {number} maxColumn 最大列数
     * @param {array} unitViews 表示ユニット一覧
     * @returns {array} 1行分のセル
     */
    makeRowCells(rowNo, maxColumn, unitViews){
        const { selectedUnit, highlightUnits, isFront, rackKey, showQuickLauncher, toolipContainer, isReadOnly } = this.props;
        
        let cells = [];            
        cells.push(<th>{rowNo}</th>);      //1列目はユニット番号

        for (var colCount = 1; colCount <= maxColumn; ++colCount){
            let unit = unitViews.find((unit) => this.isMountUnitView(unit, colCount, rowNo));

            // ユニットが重なっていたら、列は追加しない
            if (!unit) {
                var isDuplicate = unitViews.some((item) => this.isDuplicate(item, colCount, rowNo))
                if (isDuplicate) {
                    continue;
                }
            }

            var isSelected = this.isSelectedUnitCell(unit, selectedUnit, colCount, rowNo);

            cells.push( <UnitDispItem
                            unitView={unit}
                            rowNo={rowNo}
                            colNo={colCount}
                            isFront={isFront}
                            isSelected={isSelected}
                            isHighlight={highlightUnits ? isHighlightUnitRow(unit, highlightUnits):false}
                            rackKey={rackKey}
                            onSelect={(id, position) => this.handleSelectUnit(id, position)}
                            showButtonTools={showQuickLauncher}
                            toolipContainer={toolipContainer}
                            onTooltipButtonEventTrigger={() => this.onTooltipButtonEventTrigger()}
                            isReadOnly={isReadOnly}
                        />);
            if (unit){
                colCount = colCount + unit.size.width - 1;  
            } 
            
        }

        return cells;
    }

    /**
     * 対象位置の搭載ユニットかどうか
     * @param {object} unitView 対象表示ユニット
     * @param {number} columnNo 列番号
     * @param {number} rowNo 行番号
     */
    isMountUnitView(unitView, columnNo, rowNo){
        var isMatchPosY = isMatchRowNo(unitView, rowNo);
        var isMatchPosX = isMatchColumnNo(unitView, columnNo);
        return (isMatchPosY && isMatchPosX);
    }

    /**
     * 対象位置が対象ユニットと重複しているかどうか
     * @param {object} unitView 対象表示ユニット
     * @param {number} columnNo 列番号
     * @param {number} rowNo 行番号
     */
    isDuplicate(unitView, columnNo, rowNo){
        var isIncludedColumn = includedRackColumn(unitView, columnNo);
        var isIncludedRow = includedRackRow(unitView, rowNo);
        return (isIncludedColumn && isIncludedRow);
    }

    /**
     * 選択されたユニットセルかどうか
     * @param {object} unitView 対象表示ユニット
     * @param {object} selectedUnit 選択ユニット情報（位置とID）
     * @param {number} columnNo 列番号
     * @param {number} rowNo 行番号
     * @returns {boolean} 選択されたユニットセルかどうか
     */
    isSelectedUnitCell(unitView, selectedUnit, columnNo, rowNo) {
        if (!selectedUnit) {
            return false;
        }
        var isSelected = false;
        if (selectedUnit.id) {
            isSelected = unitView ? unitView.dispSetId === selectedUnit.id : false;
        } else {
            const targetPosition = unitView ? unitView.position: { x: columnNo, y: rowNo };
            const targetWidth = unitView ? unitView.size.width : 1;
            isSelected = this.isMatchSelectedPosition(targetPosition, targetWidth, selectedUnit.position);
        }
        return isSelected;
    }

    /**
     * 指定の位置（およびユニットのサイズ）が選択位置と一致しているかどうか
     * @param {*} targetPosition 
     * @param {*} targetWidth 
     * @param {*} selectedPosition 
     */
    isMatchSelectedPosition(targetPosition, targetWidth, selectedPosition){
        var isSelectedColumn =  (targetPosition.y === selectedPosition.y);
        var isSelectedRow =  (targetPosition.x <= selectedPosition.x) && ((targetPosition.x + targetWidth - 1) >= selectedPosition.x);
        return (isSelectedRow && isSelectedColumn);
    }

    /****************************************************
     * イベント関数
     ****************************************************/

    /**
     * ユニット選択イベントを発生させる
     * @param {number} unitId ユニットID
     * @param {object} position ユニット位置
     */
    handleSelectUnit(dispSetId, position){
        if (this.props.onSelectUnit) {
            this.props.onSelectUnit(dispSetId, position);
        }
    }
    
    /**
     * クイックランチャーを表示するボタンのイベント発生をお知らせする
     */
    onTooltipButtonEventTrigger() {
        if (this.props.onTooltipButtonEventTrigger) {
            this.props.onTooltipButtonEventTrigger();
        }
    }

}


RackMultiTable.propTypes = {
    rack: PropTypes.shape({
        rackId: PropTypes.string,
        rackName: PropTypes.string,
        row: PropTypes.number,
        col: PropTypes.number,
        type: PropTypes.shape({
            viewHeight: PropTypes.number.isRequired         //ラック搭載図の高さ。単位：100%。最大100%。
        }),
        links: PropTypes.arrayOf(PropTypes.shape({
            title: PropTypes.string.isRequired,
            url: PropTypes.string.isRequired
        })),
        unitDispSettings: PropTypes.arrayOf(PropTypes.shape({      //ラック搭載図に表示する表示ユニット情報
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
        }))
    }),
    selectedUnit: PropTypes.shape({
        id: PropTypes.string,
        position:PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number
        })
    }),
    selectColumnNo: PropTypes.number,
    movingTarget: PropTypes.shape({
        id: PropTypes.number,
        position:PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number
        })
    }),
    highlightUnits: PropTypes.arrayOf(PropTypes.object),
    isReadOnly: PropTypes.bool,
    rackKey: PropTypes.string,
    showQuickLauncher: PropTypes.bool,
    toolipContainer: PropTypes.object,
    onTooltipButtonEventTrigger: PropTypes.func,
    onSelectUnit: PropTypes.func,
}