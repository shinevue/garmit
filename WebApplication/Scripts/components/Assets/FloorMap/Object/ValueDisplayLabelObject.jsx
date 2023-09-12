/**
 * Copyright 2017 DENSO Solutions
 * 
 * 計測値表示ラベルオブジェクト Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import RectObjectGroup from 'Assets/FloorMap/Object/RectObjectGroup/RectObjectGroup.jsx';

/**
 * 計測値表示ラベルオブジェクト
 */
export default class ValueDisplayLabelObject extends Component {

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
        const { breakerName, objectId, position, size, textObjectClassName, displayString, scaledValue, format: formatString, unit, hasUnitArea } = this.props;
        const unitValue = displayString ? "" : (unit || "");
        const valueSize = this.getValueSize(unitValue, hasUnitArea, size);
        const unitSize = this.getUnitSize(unitValue, hasUnitArea, size);
        const value = displayString ? displayString : (scaledValue || scaledValue === 0) && formatString ? format(formatString, scaledValue) : "---";

        return (
            <g>
                <RectObjectGroup
                    id={"breaker-group" + objectId}
                    className="value-display"
                    position={position}
                    size={size}
                    backColor='rgb(255,255,255)'
                    borderColor="black"
                    selectable={false}
                    tooltip={value + unitValue}
                />
                <RectObjectGroup
                    id={"breaker-value" + objectId}
                    className={"value-display-rect"}
                    position={position}
                    size={valueSize}
                    textObjectClassName={classNames(textObjectClassName ? textObjectClassName : "fill-success", "value-display-value", this.getTextSizeClass(size.height))}
                    displayText={value}
                    selectable={false}
                />
                <RectObjectGroup
                    id={"breaker-unit" + objectId}
                    className={"value-display-rect"}
                    position={{ x: position.x + size.width * 0.7, y: position.y }}
                    size={unitSize}
                    textObjectClassName="value-display-unit"
                    displayText={unitValue}
                    selectable={false}
                />
                {breakerName &&
                    <RectObjectGroup
                        id={"breaker-group" + objectId}
                        className="value-display"
                        position={position}
                        size={size}
                        backColor='transparent'
                        borderColor="black"
                        selectable={false}
                        tooltip={"【" + breakerName + "】" + value + (unitValue && "(" + unitValue + ")")}
                    />
                }
            </g>
        )
    }

    /**
     * 計測値テキストサイズクラス取得
     */
    getTextSizeClass(height) {
        if (height < 25) {
            return "text-small";
        }
        else if (height > 35) {
            return "text-large";
        }
        return "text-medium";
    }

    /**
     * 値部分のサイズ取得
     */
    getValueSize(unitValue, hasUnitArea, size) {
        if (unitValue || hasUnitArea) {
            return { width: size.width * 0.7, height: size.height };
        }
        else {
            return size;
        }
    }

    /**
     * 単位部分のサイズ取得
     */
    getUnitSize(unitValue, hasUnitArea, size) {
        if (unitValue || hasUnitArea) {
            return { width: size.width * 0.3, height: size.height };
        }
        else {
            return { width: 0, height: 0 };
        }
    }
}

ValueDisplayLabelObject.propTypes = {
    breakerName: PropTypes.string,          //ブレーカー名称(これがある場合のみツールチップ表示)
    objectId: PropTypes.number,             //オブジェクトのID
    position: PropTypes.shape({             //位置情報
        x: PropTypes.number,
        y: PropTypes.number
    }),
    size: PropTypes.shape({                 //サイズ情報
        width: PropTypes.number,
        height: PropTypes.number
    }),
    textObjectClassName: PropTypes.string,  //テキストタグに付与するクラス名称
    displayString: PropTypes.string,        //オンメッセージオフメッセージ
    scaledValue: PropTypes.number,          //計測値
    format: PropTypes.string,               //フォーマット
    unit: PropTypes.string,                 //単位
    hasUnitArea: PropTypes.bool              //単位非表示の場合に表示エリアを確保するかどうか
};


