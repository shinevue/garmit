/**
 * @license Copyright 2019 DENSO
 * 
 * オブジェクトチェックバッチ　レイヤ Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * オブジェクトチェックバッチ　レイヤ
 * @param {object} checkObjects チェックバッチをつけるオブジェクト配列
 */
export default class CheckObjectBadge extends Component {
    
    /**
     * コンポーネントをアップデートするかどうか
     */
    shouldComponentUpdate(nextProps, nextState) {
        //異なるインスタンスでも中身が同じであればアップデートしない
        var prevDataJSON = JSON.stringify(nextProps);
        var dataJSON = JSON.stringify(this.props);

        if (prevDataJSON !== dataJSON) {
            return true;
        }
    }

    /**
     * render
     */
    render() {
        const { checkObjects } = this.props;
        return (
            <g id="checkObjects">
                {checkObjects && checkObjects.map((obj) => {
                    return <CheckBadge checkObject={obj} />
                })
                }
            </g>
        );
    }
}

CheckObjectBadge.propTypes = {
    checkObjects: PropTypes.array,
};


/**
* チェック状態バッジ
*/
const CheckBadge = ({ checkObject }) => {
    const x = _.get(checkObject, "position.x",0);
    const y = _.get(checkObject, "position.y",0);
    const width = _.get(checkObject, "size.width",0);
    const height = _.get(checkObject, "size.height", 0);
    const isPart = _.get(checkObject, "isPart", false);
    const halfIconHeight = 5;    //アイコン高さの半分を定義（縦中央寄せするため）
    return (
        <g>
            <text x={x + (0.5 * width)} y={y + (0.5 * height) + halfIconHeight} className={(isPart ? "far" :  "fas") + " through-object"} textAnchor="middle">
                &#xf14a;
            </text>
        </g>
    );
 }