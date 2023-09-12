/**
 * @license Copyright 2019 DENSO
 * 
 * 電気錠ステータス凡例オブジェクト Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

const LEGEND_START_X = 12;  //凡例のポジションxの開始位置（ここを基準に170ずつずらしていく）
const LEGEND_START_Y = 22;  //凡例のポジションyの開始位置（ここを基準に14ずつずらしていく）
import RectObject from 'Assets/FloorMap/Object/RectObjectGroup/RectObject.jsx';

/**
 * 電気錠ステータス凡例オブジェクト
 */
export default class KeyStatusLegend extends Component {

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
        //凡例が表示されている場合にはクラスを付与
        if ($('#svgArea > div >:last-child').css('width') !== "24px") {
            $('#svgArea> div > :last-child').addClass("key-status-legend-miniature");
        }

        //ミニチュア表示/非表示ボタンクリックイベントを追加する
        $('#svgArea> div > :last-child > button').on('click', () => {
            $('#svgArea> div > :last-child').toggleClass("key-status-legend-miniature");
        });    
    }

    /**
     * ComponentがDOMから削除される時に呼ばれます。
     */
    componentWillUnmount() {
        //クラス削除
        $('#svgArea> div > :last-child').removeClass('key-status-legend-miniature');
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
            <RectObject
                position={{ x: objectPoisitionX, y: objectPoisitionY }}
                size={{ width: 14, height: 10 }}
                x={objectPoisitionX}
                backColor={legendInfo.backColor}
                borderColor={legendInfo.borderColor}
                className={legendInfo.borderColor === "black" ? null : "key-status-object"}
            />
        );
    }

    /**
     * 凡例テキストオブジェクトを取得する
     */
    getLegendTextObject(legendInfo, textPoisitionX, textPoisitionY) {
        const { name, addName } = legendInfo;
        return (
            <text
                x={textPoisitionX}
                y={textPoisitionY}
                font-size="12"
                dominant-baseline="central">
                ：{ name + ( addName ? '(' + addName + ')' : '' ) }
            </text>
            );
    }

    /**
     * 凡例テキストオブジェクトを取得する
     */
    getLegendObject(legendInfo, index) {
        const objectPoisitionX = index > 3 ? (LEGEND_START_X + 170) : LEGEND_START_X;
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
        const { keyStatusItems } = this.props;
        return (
            <div>
                <svg x="0" y="0" width="400" height="80">
                    <g>
                        <rect x="2" y="2" width="396" height="76" fill="ivory" />
                        <text x="6" y="4" font-size="12" dominant-baseline="text-before-edge" font-weight="bold">
                            &lt;凡例&gt;
                            </text>
                        {keyStatusItems &&
                            keyStatusItems.map((item, index) => {
                                return (this.getLegendObject(item, index))
                            })
                        }
                    </g>
                </svg>                
            </div>
        );
    }
}


KeyStatusLegend.propTypes = {
    keyStatusItems: PropTypes.array    
};

