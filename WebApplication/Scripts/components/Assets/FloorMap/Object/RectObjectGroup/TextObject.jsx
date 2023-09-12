/**
 * Copyright 2017 DENSO Solutions
 * 
 * テキストオブジェクト Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEdge } from 'edgeUtility';


/**
 * テキストオブジェクト
 * <TextObject></TextObject>
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {string} fontColor
 * @param {string} text
 * @param {number} index
 */
export default class TextObject extends Component{
    constructor(props) {
        super(props);
        this.state = {
            isEdge: isEdge()
        };
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
     * 文字を描画するパスDを生成する
     * @param {string} position
     * @param {string} size
     */
    generatePathD(position, size) {
        const { x, y } = position;
        const { width, height } = size;
        return "M" + x + "," + (y + 1 + height / 2) + " L" + (x + width) + "," + (y + 1 + height / 2);
    }

    /**
     * render
     */
    render() {
        const { position, size, fontColor, fontSize, text, index, className } = this.props;
        const { isEdge } = this.state;

        return (
            <g className="through-object">
                <defs>
                    <path id={"textLine" + index} d={this.generatePathD(position, size)} />
                </defs>
                <text
                    id={"textbox" + index}
                    style={{ "fill": fontColor ? fontColor : "black", "font-size": fontSize }}
                    className={className}
                    dominantBaseline="middle"
                    dy={isEdge?'0.6ex':0}
                >
                    <textPath 
                        xlinkHref={"#textLine" + index}
                        startOffset={size.width / 2 }
                        textAnchor="middle" 
                    >{text}</textPath>
                </text>
            </g>
        );
    }
}

TextObject.propTypes = {
    position: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number
    }),
    size: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number
    }),
    fontColor: PropTypes.string,
    fontSize:PropTypes.number,
    text: PropTypes.string,
    index: PropTypes.number,
    className:PropTypes.string
};