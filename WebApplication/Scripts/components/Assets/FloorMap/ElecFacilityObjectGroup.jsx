/**
 * Copyright 2017 DENSO Solutions
 * 
 * 電源設備オブジェクトグループ Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ElecFacilityObject from 'Assets/FloorMap/Object/ElecFacilityObject.jsx';

/**
 * 電源設備オブジェクトグループ
 * @param {object} areaSize 表示エリアのサイズ
 * @param {array} items elecFacilityポイント情報
 * @param {int} colNumber 1行に表示する数
 */
export default class ElecFacilityObjectGroup extends Component {

    constructor(props) {
        super(props);
        const objectAreaSize = this.calcObjectAreaSize(this.props.areaSize, this.props.tableSize);
        const namePosition = this.calcNamePosition(objectAreaSize);
        const valuePosition = this.calcValuePosition(objectAreaSize);
        const size = this.calcSize(objectAreaSize);

        this.state = {
            objectAreaSize: objectAreaSize,  //オブジェクトサイズ
            namePosition: namePosition,      //名称ラベルの位置
            valuePosition: valuePosition,    //値ラベルの位置
            size: size,                      //名称ラベルと値ラベルのサイズ
        };
    }

    /**********************************
    * 
    * ライフサイクルイベント
    * 
    **********************************/

    /**
     * コンポーネントが新しいpropsを受け取ると実行される
     */
    componentWillReceiveProps(nextProps) {
        //異なるインスタンスでも中身が同じであれば再計算しない
        var nextTableSize = JSON.stringify(nextProps.tableSize);
        var tablesize = JSON.stringify(this.props.tableSize);
        var nextAreaSize = JSON.stringify(nextProps.areaSize);
        var areaSize = JSON.stringify(this.props.areaSize);

        //描画エリアサイズもしくはブレーカーオブジェクトテーブルサイズが変更されている場合
        if (nextTableSize !== tablesize || nextAreaSize !== areaSize) {
            this.setDrawingInfo(nextProps.areaSize, nextProps.tableSize);
        }
    }

    /**
    * コンポーネントをアップデートするかどうか
    */
    shouldComponentUpdate(nextProps, nextState) {
        //異なるインスタンスでも中身が同じであればアップデートしない
        var nextDataJSON = JSON.stringify(nextProps);
        var dataJSON = JSON.stringify(this.props);

        if (nextDataJSON !== dataJSON) {
            return true;
        }
    }

    /**
     * render
     */
    render() {
        const { items, areaSize, tableSize } = this.props;
        const { width, height } = areaSize;
        const { objectAreaSize, namePosition, valuePosition, size } = this.state;


        return (
            <g width={width} height={height} id="ElecFacilityObjects" >
                {items &&
                    items.map((item, index) => {
                        let positionX = ((item.index) % tableSize.col)- 1;
                        if (positionX < 0) {
                            positionX = tableSize.col-1;
                        }
                        const positionY = (Math.ceil((item.index) / tableSize.col) - 1);
                    return (
                        <svg
                            x={objectAreaSize.width * positionX}
                            y={objectAreaSize.height * positionY}
                        >
                            <ElecFacilityObject
                                index={item.index}
                                item={item}
                                nameObjectInfo={{ position: { ...namePosition }, size:size.name}}
                                valueObjectInfo={{ position: { ...valuePosition }, size:size.value }}
                            />
                        </svg>
                        )
                    })
                }
            </g>
        );
    }

    /**
     * 描画オブジェクト情報をセットする
     */
    setDrawingInfo(areaSize, tableSize) {
        //値を再計算する
        const newObjectAreaSize = this.calcObjectAreaSize(areaSize, tableSize);
        const newNamePosition = this.calcNamePosition(newObjectAreaSize);
        const newValuePosition = this.calcValuePosition(newObjectAreaSize);
        const newSize = this.calcSize(newObjectAreaSize);

        this.setState({
            objectAreaSize: newObjectAreaSize,
            namePosition: newNamePosition,
            valuePosition: newValuePosition,
            size: newSize
        });
    }

    /**
     * オブジェクト1つ当たりのエリアサイズを計算する
     */
    calcObjectAreaSize(areaSize, tableSize) {
        return {
            width: areaSize.width / tableSize.col,
            height: areaSize.height / tableSize.row
        }
    }

    /**
     * 名称オブジェクトの位置を計算する
     */
    calcNamePosition(size) {
        return {
            x: size.width * 0.05,
            y: size.height * 0.05
        };
    }

    /**
     * 計測値表示オブジェクトの位置を計算する
     */
    calcValuePosition(size) {
        return {
            x: size.width * 0.05,
            y: size.height * 0.35
        };
    }

    /**
     * オブジェクトのサイズを計算する
     */
    calcSize(size) {
        return {
            name: {
                width: size.width * 0.9,
                height: size.height * 0.35
            },
            value: {
                width: size.width * 0.9,
                height: size.height * 0.55
            }
        };
    }


}


ElecFacilityObjectGroup.propTypes = {
    items: PropTypes.array,
    areaSize: {
        width: PropTypes.number,
        height: PropTypes.number
    },
    tableSize: PropTypes.shape({
        row: PropTypes.number,
        col: PropTypes.number
    })
};

