/**
 * Copyright 2017 DENSO Solutions
 * 
 * ラックステータス凡例オブジェクト Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

const LEGEND_START_X = 12;  //凡例のポジションxの開始位置（ここを基準に80ずつずらしていく）
const LEGEND_START_Y = 22;  //凡例のポジションyの開始位置（ここを基準に14ずつずらしていく）


/**
 * ラックステータス凡例オブジェクト
 */
export default class RackStatusLegend extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    /**********************************
    * 
    * ライフサイクルイベント
    * 
    **********************************/

    /**
     * ComponentがDOMツリーに追加された後に一度だけ呼ばれます。
     */
    componentDidMount() {
        if (this.props.rackStatusLegend) {
            //凡例が表示されている場合にはクラスを付与
            if ($("#svgArea > div > div[role='navigation'] > button > svg > g").attr('transform') === "rotate(225, 12, 13)") {  //ボタンの向きで判定
                $('#svgArea> div > :last-child').addClass(this.getLegendSizeClassName(this.props.rackStatusLegend.length));
            }

            //ミニチュア表示/非表示ボタンクリックイベントを追加する
            $("#svgArea > div > div[role='navigation'] > button").on('click', () => {
                $('#svgArea> div > :last-child').toggleClass(this.getLegendSizeClassName(this.props.rackStatusLegend.length));
            });    
        }
    }

    /**
     * ComponentがDOMから削除される時に呼ばれます。
     */
    componentWillUnmount() {
        //クラス削除
        $('#svgArea> div > :last-child').removeClass('legend-miniature-min legend-miniature-max');
        //イベント削除
        $('#svgArea> div > :last-child > button').off('click');
    }
    
    /**********************************
    * 
    * ゲッターメソッド
    * 
    **********************************/

    /**
     * 凡例四角形オブジェクトを取得する
     */
    getLegendRectObject(legendInfo, objectPoisitionX, objectPoisitionY) {
        return (
            <rect
                x={objectPoisitionX}
                y={objectPoisitionY}
                width="14"
                height="10"
                fill={legendInfo.color}
                style={{ stroke: 'black' }}
            />
        );
    }

    /**
     * 凡例テキストオブジェクトを取得する
     */
    getLegendTextObject(legendInfo, textPoisitionX, textPoisitionY) {
        let legendString = this.cutString(legendInfo.name, 10); //凡例名称が長い場合は省略する
        var tooltip = (
            <Tooltip>{legendInfo.name}</Tooltip>
        );

        return (
                <OverlayTrigger placement="bottom" overlay={tooltip}>
                    <text
                        x={textPoisitionX}
                        y={textPoisitionY}
                        font-size="12"
                        dominant-baseline="central">
                        ：{legendString}
                    </text>
                </OverlayTrigger>
            );
    }

    /**
     * 凡例テキストオブジェクトを取得する
     */
    getLegendObject(legendInfo, index) {
        const objectPoisitionX = index > 3 ? (LEGEND_START_X + 80) : LEGEND_START_X;
        const objectPoisitionY = index > 3 ? LEGEND_START_Y + 14 * (index - 4) : LEGEND_START_Y + 14 * index;
        const textPoisitionX = objectPoisitionX + 12;
        const textPoisitionY = objectPoisitionY + 4;
        return (
            <g>
                {this.getLegendRectObject(legendInfo, objectPoisitionX, objectPoisitionY)}
                {this.getLegendTextObject(legendInfo, textPoisitionX, textPoisitionY)}
            </g>
        );
    }

    /**
     * render
     */
    render() {
        const { rackStatusLegend } = this.props;
        
        if (rackStatusLegend && rackStatusLegend.length > 0) {
            const itemNumber = rackStatusLegend.length >= 8 ? 8 : rackStatusLegend.length;
            let rackStatusItems = Object.assign([], rackStatusLegend);

            if (rackStatusLegend.length > 8) {
                //8個目以降の凡例は表示できないため削除
                rackStatusItems.splice(8, rackStatusLegend.length - 8);
            }
            
            const legendAreaWidth = itemNumber > 4 ? 180 : 90;
            return (
                <svg x="0" y="0" width={legendAreaWidth} height="80">
                    <g>
                        <rect x="2" y="2" width={legendAreaWidth - 4} height="76" fill="ivory" />
                        <text x="6" y="4" font-size="12" dominant-baseline="text-before-edge" font-weight="bold">
                            &lt;凡例&gt;
                        </text>
                        {rackStatusItems &&
                            rackStatusItems.map((item, index) => {
                                return (this.getLegendObject(item, index))
                            })
                        }
                    </g>
                </svg>
            );
        }
        return false;
    }

    /**
     * 凡例エリアサイズを決定するクラス名を取得する
     */
    getLegendSizeClassName(length) {
        if (length > 4) {
            return 'legend-miniature-max';
        }
        else {
            return 'legend-miniature-min';
        }
    }

    /**
     * 文字列を指定のバイト数に収める（うち3byteは"..."で埋める）
     * @param {number} str カットしたい文字列
     * @param {number} num 収めたいバイト数
     */
    cutString(str, num) {
        var len = 0;
        var estr = escape(str);
        var ostr = "";
        for (var i = 0; i < estr.length; i++) {
            len++;
            ostr = ostr + estr.charAt(i);
            if (estr.charAt(i) == "%") {
                i++;
                ostr = ostr + estr.charAt(i);
                if (estr.charAt(i) == "u") {
                    ostr = ostr + estr.charAt(i + 1) + estr.charAt(i + 2) + estr.charAt(i + 3) + estr.charAt(i + 4);
                    i += 4;
                    len++;
                }
            }
            if (len >= num - 3 && i + 1 < estr.length) { 
                //残り文字数3バイトで、まだ文字列が続いている場合は省略記号を付ける
                return unescape(ostr) + "...";
            }
        }
        return unescape(ostr);
    }
}


RackStatusLegend.propTypes = {
    rackStatusLegend:PropTypes.array
};

