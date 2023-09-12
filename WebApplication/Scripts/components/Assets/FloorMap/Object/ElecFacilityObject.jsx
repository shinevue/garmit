/**
 * Copyright 2017 DENSO Solutions
 * 
 * 電源設備オブジェクト Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import RectObjectGroup from 'Assets/FloorMap/Object/RectObjectGroup/RectObjectGroup.jsx';
import ValueDisplayLabelObject from 'Assets/FloorMap/Object/ValueDisplayLabelObject';

/**
 * 電源設備オブジェクト
 * @param {number} index ブレーカーオブジェクトのインデックス
 * @param {object} item 描画するポイントの情報
 * @param {object} nameObjectInfo 名称表示オブジェクト情報
 * @param {object} valueObjectInfo 値表示オブジェクト情報
 */
export default class ElecFacilityObject extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    /**
     * render
     */
    render() {
        const { index, item, nameObjectInfo, valueObjectInfo } = this.props;

        return (
            <g>
                <RectObjectGroup
                    id={"ef-name" + index}
                    className={"normal-object"}
                    textObjectClassName={"elec-facility-name"}
                    position={nameObjectInfo.position}
                    size={nameObjectInfo.size}
                    backColor='rgb(235,235,235)'
                    borderColor='black'
                    displayText={item.elementName}
                    selectable={false}
                />
                <ValueDisplayLabelObject
                    objectId={index}
                    position={valueObjectInfo.position}
                    size={valueObjectInfo.size}
                    textObjectClassName={classNames(item.alarmClassName && "fill-" + item.alarmClassName)}
                    displayString={item.displayString}
                    scaledValue={item.scaledValue}
                    format={item.format}
                    unit={item.unit}
                    hasUnitArea={false}
                />
            </g>
        );
    }
}


ElecFacilityObject.propTypes = {
    index: PropTypes.number,
    item: PropTypes.object,
    nameObjectInfo: PropTypes.object,
    valueObjectInfo: PropTypes.object,
};

