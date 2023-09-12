/**
 * Copyright 2017 DENSO Solutions
 * 
 * 四角形オブジェクト Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Popover, OverlayTrigger, Tooltip } from 'react-bootstrap';

/**
 * 四角形オブジェクト
 */
export default class RectObject extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    /**
     * コンポーネントをアップデートするかどうか
     */
    shouldComponentUpdate(nextProps, nextState) {
        //異なるインスタンスでも値が同じであればアップデートしない
        if (JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
            return true;
        }
    }

    /**
     * 四角形オブジェクトのゲッターメソッド
     */
    getRectObject() {
        const { id, position, size, backColor, borderColor, border, className, isTransmissive, selectable, isThrough } = this.props;

        const generatedClassName = this.generateClassName(className, isTransmissive, selectable, isThrough);

        return (
            <rect
                id={"rect" + id}
                x={position.x}
                y={position.y}
                height={size.height}
                width={size.width}
                className={generatedClassName}
                style={{ fill: backColor, stroke: borderColor, strokeWidth: border }}
            />
        );

    }

    /**
     * 四角形オブジェクトにオーバーレイ情報を付与する
     */
    attachOverlay(popoverInfo, tooltip, rectObject) {
        const overlay = (
            popoverInfo ?
                <Popover title={"【" + popoverInfo.name + "】"}>
                    <popoverInfo.component { ...popoverInfo } />
                </Popover>
                :<Tooltip>{tooltip}</Tooltip>
            );

        return <OverlayTrigger placement="bottom" overlay={overlay}>{rectObject}</OverlayTrigger>;
    }

    /**
     * render
     */
    render() {
        const { popoverInfo, tooltip } = this.props;
        let rectObject = this.getRectObject();
        return (
            <g>
                {popoverInfo || tooltip ?
                    this.attachOverlay(popoverInfo, tooltip, rectObject)
                    : rectObject
                }
            </g>
        );
    }

    /**
     * 四角形オブジェクトのclassNameを生成する
     */
    generateClassName(className, isTransmissive, selectable, isThrough) {
        let generated = className || '';

        //透過オブジェクトのクラス付与
        if (isTransmissive) {
            generated += " transparent-object";
        }

        //選択可能オブジェクトかどうかのクラス付与
        if (selectable) {
            generated += " selectable-object";
        }

        //ポインターイベントを発生させない
        if (isThrough) {
            generated += " through-object";
        }

        return generated;
    }

}

RectObject.propTypes = {
    id: PropTypes.string,
    position: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number
    }),
    size: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number
    }),
    backColor: PropTypes.string,
    borderColor: PropTypes.string,
    border: PropTypes.number,
    className: PropTypes.string,
    isTransmissive: PropTypes.bool, //オブジェクトを透過するかどうか
    selectable: PropTypes.bool,     //選択可能オブジェクトかどうか
    isThrough: PropTypes.bool,       //ポインターイベントを発生させるかどうか
    popoverInfo: PropTypes.shape({
        name: PropTypes.string,
        component: PropTypes.element
    }),
    tooltip: PropTypes.string
};