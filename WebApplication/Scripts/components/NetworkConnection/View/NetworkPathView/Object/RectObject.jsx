/**
 * @license Copyright 2019 DENSO
 * 
 * 四角形オブジェクト Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import { Popover, OverlayTrigger, Tooltip } from 'react-bootstrap';

/**
 * 四角形オブジェクト
 * @param {string} id 
 * @param {object} position 位置
 * @param {object} size サイズ
 * @param {object} style スタイル
 * @param {string} className
 * @param {boolean} selectable 選択可能かどうか
 * @param {object} popoverInfo ポップオーバー情報
 * @param {string} tooltip ツールチップに表示する文字列
 * @param {object} overlayInfo オーバーレイ情報
 * 
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
     * render
     */
    render() {
        const { popoverInfo, tooltip, overlayInfo } = this.props;
        let rectObject = this.getRectObject();
        return (            
            <g>
                {popoverInfo || tooltip ?
                    this.attachOverlay(popoverInfo, tooltip, overlayInfo, rectObject)
                    : rectObject
                }
            </g>

            
        );
    }

    /**
     * 四角形オブジェクトのゲッターメソッド
     */
    getRectObject() {
        const { id, position, size, style, className, selectable, isThrough } = this.props;
        const rectStyle = style && { fill: style.backColor, stroke: style.borderColor, strokeWidth: style.borderWidth } ;
        const classes = {
            'selectable-object': selectable,
            'through-object': isThrough
        };
        return (
            <rect
                id={id}
                x={position.x}
                y={position.y}
                height={size.height}
                width={size.width}
                className={ClassNames(className, classes)}
                style={rectStyle}
            />
        );

    }

    /**
     * 四角形オブジェクトにオーバーレイ情報を付与する
     */
    attachOverlay(popoverInfo, tooltip, overlayInfo, rectObject) {
        const { rootClose, placement, trigger } = overlayInfo;
        const overlay = (
                popoverInfo ?
                    <Popover className={popoverInfo.className} title={popoverInfo.name}>
                        <popoverInfo.component { ...popoverInfo } />
                    </Popover>
                :
                    <Tooltip className="text-break-word">{tooltip}</Tooltip>
            );
        return <OverlayTrigger 
                    placement={placement} 
                    rootClose={rootClose} 
                    trigger={trigger} 
                    overlay={overlay}>
                        {rectObject}
                </OverlayTrigger>;
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
    style: PropTypes.shape({
        backColor: PropTypes.string,
        borderColor: PropTypes.string,
        borderWidth: PropTypes.number
    }),
    className: PropTypes.string,
    selectable: PropTypes.bool,     //選択可能オブジェクトかどうか
    popoverInfo: PropTypes.shape({
        name: PropTypes.string,
        className: PropTypes.string,
        component: PropTypes.element
    }),
    tooltip: PropTypes.string,
    overlayInfo: PropTypes.shape({
        placement: PropTypes.string,
        rootClose: PropTypes.bool,
        trigger: PropTypes.string
    })
};