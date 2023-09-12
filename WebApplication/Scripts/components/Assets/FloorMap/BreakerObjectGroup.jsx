/**
 * Copyright 2017 DENSO Solutions
 * 
 * ブレーカーオブジェクトグループ Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import BreakerObject from 'Assets/FloorMap/Object/BreakerObject.jsx';

/**
 * ブレーカーオブジェクトグループ
 * @param {array} items ブレーカーポイント情報
 * @param {object} startPosition ブレーカーエリアの開始位置
 * @param {object} areaSize 描画エリアのサイズ
 * @param {object} tableSize ブレーカーオブジェクトの行・列数
 */
export default class BreakerObjectGroup extends Component {

    constructor(props) {
        super(props);

        //state初期値を取得する
        const objectAreaSize = this.calcObjectAreaSize(this.props.tableSize, this.props.areaSize);
        const namePosition = this.calcNamePosition(objectAreaSize);
        const valuePosition = this.calcValuePosition(objectAreaSize);
        const nameSize = this.calcNameSize(objectAreaSize);
        const valueSize = this.calcValueSize(objectAreaSize);

        this.state = {
            objectAreaSize: objectAreaSize,  //オブジェクトサイズ
            namePosition: namePosition,      //名称ラベルの位置
            valuePosition: valuePosition,    //値ラベルの位置
            nameSize: nameSize,              //名称ラベルのサイズ
            valueSize: valueSize             //値ラベルのサイズ
        };
    }

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
            this.setDrawingInfo(nextProps.tableSize, nextProps.areaSize);
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
     * 描画オブジェクト情報をセットする
     */
    setDrawingInfo(tableSize, areaSize) {
        //値を再計算する
        const newObjectAreaSize = this.calcObjectAreaSize(tableSize, areaSize);
        const newNamePosition = this.calcNamePosition(newObjectAreaSize);
        const newValuePosition = this.calcValuePosition(newObjectAreaSize);
        const newNameSize = this.calcNameSize(newObjectAreaSize); 
        const newValueSize = this.calcValueSize(newObjectAreaSize);

        this.setState({
            objectAreaSize : newObjectAreaSize,
            namePosition : newNamePosition,    
            valuePosition : newValuePosition,  
            nameSize : newNameSize,            
            valueSize : newValueSize                 
        });
    }

    /**
     * エリア全体のサイズからブレーカーオブジェクト1つ当たりのエリアサイズを計算する
     */
    calcObjectAreaSize(tableSize, areaSize) {
        const objectAreaWidth = areaSize.width / tableSize.col;
        const objectAreaHeight = areaSize.height / tableSize.row;

        return { height: objectAreaHeight, width: objectAreaWidth };
    }

    /**
     * 名称オブジェクトの位置を計算する
     */
    calcNamePosition(size) {
        return{
            x: size.width * 0.05,
            y: size.height * 0.05
        };
    }

    /**
     * 計測値表示オブジェクトの位置を計算する
     */
    calcValuePosition(size) {
        return {
            x: size.width * 0.6,
            y: size.height * 0.05
        };
    }

    /**
     * 名称オブジェクトのサイズを計算する
     */
    calcNameSize(size) {
        return {
            width: size.width * 0.55,
            height: size.height * 0.9
        };
    }

    /**
     * 計測値表示オブジェクトのサイズを計算する
     */
    calcValueSize(size) {
        return {
            width: size.width * 0.38,
            height: size.height * 0.9
        };
    }

    /**
     * ブレーカーオブジェクトクリックイベント
     */
    handleClickBreaker(selectedObject, groupStartPosition, item) {
        //描画エリア全体からの位置を算出
        let select = $.extend(true, {}, selectedObject);
        select.position.x = select.position.x + groupStartPosition.x;
        select.position.y = select.position.y + groupStartPosition.y;

        if (this.props.onClickBreakerObject) {
            this.props.onClickBreakerObject(select, item);
        }
    }

    /**
     * render
     */
    render() {
        const { items, startPosition, areaSize, isBreakerSelectable } = this.props;
        const { objectAreaSize, namePosition, valuePosition, nameSize, valueSize } = this.state;

        return (
            <g width={areaSize.width} height={areaSize.height} id="breakerObjects">
                {items &&
                    items.map((item, index) => {
                    const groupStartPosition = {
                        x: objectAreaSize.width * (item.position.x - 1) + startPosition.x,
                        y: objectAreaSize.height * (item.position.y - 1) + startPosition.y
                    };

                    return (
                        <svg
                            x={groupStartPosition.x}
                            y={groupStartPosition.y}
                        >
                            <BreakerObject
                                isSelectable={isBreakerSelectable}
                                index={index}
                                item={item}
                                nameObjectInfo={{ position: { ...namePosition }, size: { ...nameSize }}}
                                valueObjectInfo={{ position: { ...valuePosition }, size: { ...valueSize } }}
                                onClickBreakerObject={(selectedObject) => this.handleClickBreaker(selectedObject, groupStartPosition, item)}
                            />
                        </svg>
                        )
                    })
                }
            </g>
        );
    }
}

BreakerObjectGroup.propTypes = {
    items: PropTypes.array,
    startPosition: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number
    }), 
    areaSize: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number
    }),
    tableSize: PropTypes.shape({
        row: PropTypes.number,
        col: PropTypes.number
    })
};

