/**
 * Copyright 2017 DENSO Solutions
 * 
 * 連続空きラック群のフレームオブジェクト
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import RectObjectGroup from 'Assets/FloorMap/Object/RectObjectGroup/RectObjectGroup.jsx';
import EGroupPopoverContent from 'Assets/FloorMap//EGroupPopoverContent.jsx';

/**
 * 連続空きラック群のフレームオブジェクト
 * @param {bool} isSelect 選択中ラックグループかどうか
 * @param {array} emptyRackObject 空きラックオブジェクトの配列
 */
export default class RackGroupFrameObject extends Component {

    constructor(props) {
        super(props);
        this.state = {
            emptyRackGroupObject: this.generateRackGroupObject(this.props.emptyRackObjects, false),
        };
    }

    /**********************************
    * 
    * ライフサイクルイベント
    * 
    **********************************/

    /**
     * Propsが更新されたときに呼ばれます。
     */
    componentWillReceiveProps(nextProps) {

        if (JSON.stringify(this.props.emptyRackObjects) !== JSON.stringify(nextProps.emptyRackObjects)) {
            //空きラックオブジェクト情報が変更されている場合
            this.setState({ emptyRackGroupObject: this.generateRackGroupObject(nextProps.emptyRackObjects, nextProps.isSelect) });
        }
    }

    /**
     * コンポーネントをアップデートするかどうか
     */
    shouldComponentUpdate(nextProps, nextState) {
        if (JSON.stringify(this.props.emptyRackObjects) !== JSON.stringify(nextProps.emptyRackObjects)) {
            //空きラックオブジェクト情報が変更されている場合
            return true;
        }
    }

    /**********************************
    * 
    * イベントハンドラ
    * 
    **********************************/

    /**
    * 空きラック選択イベント
    * @param {int} object　選択したオブジェクト
    * @param {int} emptyRackObjects　選択したレイアウトオブジェクトを含む空きラックグループ
    */
    handleClickObject(object, emptyRackObjects) {
        if (this.props.onSelectEmptyRack) {
            this.props.onSelectEmptyRack(object, emptyRackObjects);
        }
    }

    /**
     * render
     */
    render() {
        const { isSelect, emptyRackObjects, id } = this.props;
        const { emptyRackGroupObject } = this.state;
        const className = isSelect ? "empty-rack-select" : "empty-rack";

        return (
            <g>
                {emptyRackObjects && !isSelect &&
                    emptyRackObjects.map((object, index) => {
                        return (
                            <RectObjectGroup
                                {...object}
                                className="normal-object"
                                id={"empty" + object.layoutId + "-" + object.objectId}
                                selectable={true}
                                onClickObject={() => this.handleClickObject(object, emptyRackObjects)}
                            />
                        );
                    }, this)
                }
                <RectObjectGroup
                    {...emptyRackGroupObject}
                    id={"frame-" + id}
                    className={className}
                    isThrough={true}
                />
            </g>
        );
    }

    /**
     * 空きラック情報から空きラックグループオブジェクト情報を生成する
     */
    generateRackGroupObject(emptyRackObjects) {
        //xのリストとyのリストを作成する
        const xList = emptyRackObjects.map((obj) => {
            return obj.position.x;
        })
        const yList = emptyRackObjects.map((obj) => {
            return obj.position.y;
        })

        //幅のリストと高さのリストを作成する
        const widthList = emptyRackObjects.map((obj) => {
            return obj.size.width;
        })
        const heightList = emptyRackObjects.map((obj) => {
            return obj.size.height;
        })
        //x、yの最大値と最小値をそれぞれ取得する
        const minX = Math.min.apply(null, xList);
        const minY = Math.min.apply(null, yList);
        const maxX = Math.max.apply(null, xList);
        const maxY = Math.max.apply(null, yList);

        //幅と高さの最大値を取得する
        const maxWidth = Math.max.apply(null, widthList);
        const maxHeight = Math.max.apply(null, heightList);
        

        const rackGroupObject = {
            position: { x: minX, y: minY },
            size: { width: maxX + maxWidth - minX, height: maxY + maxHeight - minY },
            isTransmissive: true,
            selectable:false
        }

        return rackGroupObject;
    }
}

RackGroupFrameObject.propTypes = {
    isSelect:PropTypes.bool,
    emptyRackObject: PropTypes.object,
    id:PropTypes.number //枠の四角形のIDに使用する番号
};

