/**
 * @license Copyright 2019 DENSO
 * 
 * TextObject(ネットワーク経路表示) Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEdge } from 'edgeUtility';

/**
 * テキストオブジェクト
 * <TextObject></TextObject>
 * @param {string} id 
 * @param {object} position 位置
 * @param {object} size サイズ
 * @param {object} style スタイル
 * @param {string} text 表示する文字列
 * @param {string} className
 * @param {boolean} isBreakWord 改行するかどうか
 * @param {boolean} isBackground 背景色を表示するかどうか
 */
export default class TextObject extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { 
            isEdge: isEdge()
        };
        this.text = null;
        this.rect = null;
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        if (this.rect && this.props.isBackground) {
            this.applyBackgournd();
        }
    }

    /**
     * コンポーネントをアップデートするかどうか
     */
    shouldComponentUpdate(nextProps) {
        //異なるインスタンスでも中身が同じであればアップデートしない
        var nextDataJSON = JSON.stringify(nextProps);
        var dataJSON = JSON.stringify(this.props);

        if (nextDataJSON !== dataJSON) {
            return true;
        }
    }
    
    /**
     * Componentが更新された後に呼ばれます。初回時には呼ばれません。
     * @param {*} prevProps 前回のprops
     * @param {*} prevState 前回のstate
     */
    componentDidUpdate(prevProps, prevState) {
        if (this.props.isBackground && this.props.position !== prevProps.position) {
            this.applyBackgournd();
        }
    }

    /**
     * render
     */
    render() {
        const { id, position, size, style, text, className, isBreakWord, isBackground } = this.props;
        const textStyle = style && { 'fill': style.fontColor ? style.fontColor : 'black', 'font-size': style.fontSize } ;
        const { isEdge } = this.state;
        let lineId = 'line';
        if (id) {
            lineId += this.getPascalCaseId(id);
        }
        const isLineBreak = style ? (isBreakWord && this.checkLineBreak(size.width, style.fontSize, text)) : isBreakWord;

        return (
            <g className="through-object">
                <defs>
                    <path id={lineId} d={this.generatePathD(position, size, isLineBreak, style && style.fontSize)} />
                </defs>
                {isBackground&&
                    <rect 
                        id={'rect' + this.getPascalCaseId(id)} 
                        ref={(rect) => this.handleSetRect(rect)}
                        className="background-text" 
                        rx={4}
                        ry={4}
                    />
                }
                <text
                    id={id}
                    ref={(text) => this.handleSetText(text)}
                    style={textStyle}
                    className={className}
                    dominantBaseline="middle"
                    dy={isEdge?'0.6ex':0}
                >
                    <textPath 
                        xlinkHref={'#' + lineId}
                        startOffset={isLineBreak?0:size.width / 2 }
                        textAnchor={isLineBreak?'top':'middle'} 
                    >
                        {text}
                    </textPath>
                </text>
            </g>
        );
    }
    
    /**
     * 文字を描画するパスDを生成する
     * @param {string} position
     * @param {string} size
     * @param {boolean} isBreakWord
     */
    generatePathD(position, size, isBreakWord, fontSize) {
        const { x, y } = position;
        const { width, height } = size;
        return (isBreakWord ?
                'M' + (x + 8) + ',' + (y + 13) + ' H' + (x + width - 10) + ' M' + (x + 8) + ',' + (y + (fontSize ? (fontSize*2 + 3) : 27)) + ' H' + (x + width - 10)
            :
                'M' + x + ',' + (y + height / 2) + ' L' + (x + width) + ',' + (y + height / 2)
        );;
    }

    /**
     * 改行するか確認する
     * @param {*} width 
     * @param {*} fontSize 
     * @param {*} text 
     * @returns {boolean} 改行するかどうか
     */
    checkLineBreak(width, fontSize, text) {
        return (text.length > (width / fontSize));
    }

    /**
     * テキストの背景を適用する
     */
    applyBackgournd() {
        let rect = SVG.adopt(this.rect);
        let bbox = SVG.adopt(this.text).bbox();
        rect.attr({
            x: bbox.x - 1,
            y: bbox.y,
            width: bbox.width + 2,
            height: bbox.height
        });
    }

    /**
     * パスカルケースのIDを取得する
     * @param {*} id 
     */
    getPascalCaseId(id) {
        if (id) {
            return id.charAt(0).toUpperCase() + id.slice(1);;
        }
        return id;
    }

    /**
     * テキストをセットする
     */
    handleSetText(text) {
        if (!this.text) {
            this.text = text;
        }
    }

    /**
     * 四角形をセットする
     */
    handleSetRect(rect) {
        if (!this.rect) {
            this.rect = rect;
        }
    }
    
}

TextObject.propTypes = {
    id: PropTypes.string.isRequired,
    position: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number
    }),
    size: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number
    }),
    style: PropTypes.shape({
        fontColor: PropTypes.string,
        fontSize:PropTypes.number,
        fontWeight: PropTypes.number
    }),
    text: PropTypes.string,
    className:PropTypes.string,
    isBreakWord: PropTypes.bool,
    isBackground: PropTypes.bool
};