/**
 * Copyright 2017 DENSO Solutions
 * 
 * ブレーカーオブジェクト Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import RectObjectGroup from 'Assets/FloorMap/Object/RectObjectGroup/RectObjectGroup.jsx';
import ValueDisplayLabelObject from 'Assets/FloorMap/Object/ValueDisplayLabelObject';

/**
 * ブレーカーオブジェクト
 * @param {number} index ブレーカーオブジェクトのインデックス
 * @param {object} item 描画するポイントの情報
 * @param {object} nameObjectInfo 名称表示オブジェクト情報
 * @param {object} valueObjectInfo 値表示オブジェクト情報
 */
export default class BreakerObject extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    /**
     * ブレーカーオブジェクトクリックイベント
     */
    handleClickBreaker(selectedObject) {
        if (this.props.onClickBreakerObject) {
            this.props.onClickBreakerObject(selectedObject);
        }
    }

    /**
     * render
     */
    render() {
        const { index, item, nameObjectInfo, valueObjectInfo, isSelectable } = this.props;
        const objectId = index + "-" + item.position.x;
        const objectInfo = nameObjectInfo;

        return (
            <g>
                <RectObjectGroup
                    id={"breaker-name" + objectId}
                    className="normal-object"
                    position={nameObjectInfo.position}
                    size={nameObjectInfo.size}
                    backColor='rgb(235, 235, 235)'
                    foreColor='rgb(0,0,0)'
                    borderColor='black'
                    displayText={item.breakerName}
                    selectable={isSelectable}
                    onClickObject={() => this.handleClickBreaker(objectInfo)}
                />
                <ValueDisplayLabelObject
                    breakerName={item.breakerName}
                    objectId={objectId}
                    position={valueObjectInfo.position}
                    size={valueObjectInfo.size}
                    textObjectClassName={classNames(item.alarmClassName && "fill-" + item.alarmClassName)}
                    displayString={item.displayString}
                    scaledValue={item.scaledValue}
                    format={item.format}
                    unit={item.unit}
                    hasUnitArea={true}
                />
            </g>
            )
    }
}

BreakerObject.propTypes = {
    isSelectable: PropTypes.bool,
    index:PropTypes.number,
    item: PropTypes.object, 
    nameObjectInfo: PropTypes.object, 
    valueObjectInfo: PropTypes.object,
};


