/**
 * @license Copyright 2017 DENSO
 * 
 * UnitDispItem Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import UnitToolButtons from './UnitToolButtons';
import { hasUnitDispSetting } from 'assetUtility';

/**
 * 段組みラック用ユニット表示コンポーネント
 * @param {number} rowNo 行番号
 * @param {number} colNo 列番号
 * @param {object} unitView 表示ユニット情報
 * @param {boolean} isFront 前面表示かどうか
 * @param {boolean} isSelected 選択されているかどうか
 * @param {boolean} isHighlight ハイライト表示するかどうか
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {string} rackKey ラックキー（left or right）
 * @param {function} onSelect ユニットを選択したときに呼び出す
 * @param {boolean} showButtonTools クイックランチャーボタンを表示するかどうか
 * @param {object} toolipContainer ツールチップのコンテナ
 * @param {function} onTooltipButtonEventTrigger ツールチップを表示するボタンのイベントが発生したときに呼び出す（ポップアップ用）
 */
export default class UnitDispItem extends Component {
    
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
        const { unitView, isSelected, isHighlight, isFront, isReadOnly, rackKey, showButtonTools, toolipContainer } = this.props;
        const isUnitDispSetting = hasUnitDispSetting(unitView);

        //表示設定の取得
        var dispSetting;
        var unitImage;
        if (unitView) {
            dispSetting = isFront ? unitView.frontDispData : unitView.rearDispData;
            unitImage = dispSetting.unitImage;
        }

        const style = this.getUnitViewStyle(dispSetting);
        const classes = {
            "unit": true,
            "has-image": (unitImage&&unitImage.url) ? true : false
        }

        const classesTd = ClassNames(
            { 'unit-selected' : isSelected },
            rackKey&&isHighlight ? ('unit-highlight-' + rackKey) : ''
        );
        return (
            <td rowSpan={unitView ? unitView.size.height : null} 
                colSpan={unitView ? unitView.size.width : null } 
                className={classesTd} 
                onClick={() =>this.handleUnitClick()}
                >
                {isUnitDispSetting &&
                    <div className={classNames(classes, (unitView.alarmName? 'unit-' + unitView.alarmName : ''))} style={style} >
                        <div class="unit-inner">
                            <span class="unit-name">{dispSetting.dispName}</span>
                            <span class="unit-status" style={{color: unitView.status.color}}></span>
                            {unitView.units&&unitView.units.length >= 2&&
                                <span class="device-count">{unitView.units.length}</span>
                            }
                            {showButtonTools&&
                                <UnitToolButtons 
                                    container={toolipContainer} 
                                    units={unitView.units} 
                                    isReadOnly={isReadOnly} 
                                    onButtonEventTrigger={() => this.onTooltipButtonEventTrigger()}
                                />
                            }
                        </div>        
                    </div>
                }
            </td>
        );
    }

    /**
     * 表示ユニットのスタイルを取得する
    　* @param {object} dispSetting 表示設定情報
    　* @returns {object} 表示ユニットのスタイル
     */
    getUnitViewStyle(dispSetting){
        var style;
        if (dispSetting) {
            style = {
                backgroundColor:dispSetting.backColor,
                color: dispSetting.textColor,
                fontSize: dispSetting.fontSize,
                backgroundImage: this.makeBackgroundImage(dispSetting.unitImage) 
            };
        } else {
            style = {};
        }      
        return style;
    }

    /**
     * 背景画像Url作成
     * @param {object} image 背景画像
     * @returns {string} 背景画像Url
     */
    makeBackgroundImage(image){
        return (image&&image.url) ? 'url("' + image.url + '")' : '';
    }

    /**
     * ユニットのクリックイベント
     */
    handleUnitClick(){
        var unitView = this.props.unitView;      
        if (unitView) {
            var id = unitView.dispSetId;  
            var unitPosition = Object.assign({}, unitView.position);
        } else {
            var id = '';  
            var unitPosition = {x: this.props.colNo, y: this.props.rowNo};
        }
        
        this.onSelectUnit(id, unitPosition);
    }

    
    /**
     * ユニット選択イベントを発生させる
     * @param {number} id 表示設定ID
     * @param {object} position 位置
     */
    onSelectUnit(id, position){
        if (this.props.onSelect && !this.props.isReadOnly) {
            this.props.onSelect(id, position);
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

UnitDispItem.propTypes = {
    rowNo: PropTypes.number.isRequired,
    colNo: PropTypes.number.isRequired,
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
    rackKey: PropTypes.string,
    onSelect: PropTypes.func,
    toolipContainer: PropTypes.object,
    onTooltipButtonEventTrigger: PropTypes.func,
    showButtonTools: PropTypes.bool
}