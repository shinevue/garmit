/**
 * Copyright 2017 DENSO Solutions
 * 
 * アラームバッジレイヤ Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';


/**
 * アラーム表示レイヤ
 * <AlarmBadge alarmInfo={} layoutObject={} ></AlarmBadge>
 * @param {object} alarmInfo アラームバッチをつけるラックの用情報リスト
 * @param {object} layoutObject レイアウトオブジェクト情報リスト
 */
export default class AlarmBadge extends Component {

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
     * コンポーネントをアップデートするかどうか
     */
    shouldComponentUpdate(nextProps, nextState) {
        //異なるインスタンスでも値が同じであればアップデートしない
        var nextDataJSON = JSON.stringify(nextProps.alarmObjects);
        var dataJSON = JSON.stringify(this.props.alarmObjects);
        if (nextDataJSON !== dataJSON || (nextProps.show !== this.props.show)) {
            return true;
        }
    }

    /**
     * render
     */
    render() {
        const { alarmObjects, show } = this.props;

        return (
            <g id="alarmDisp">
                {show && alarmObjects &&
                    alarmObjects.map((info) => {
                        const cx = (info.position.x + info.size.width / 2);
                        const cy = (info.position.y + info.size.height / 2);
                        if (info.errorFlg) {
                            return <Badge cx={cx} cy={cy} r={3} color="red" />

                        }
                        else if (info.alarmFlg) {
                            return <Badge cx={cx} cy={cy} r={3} color="yellow" />
                        }
                    })
                }
            </g>
        );
    }
}

AlarmBadge.propTypes = {
    alarmObjectInfo: PropTypes.array,    //レイアウトオブジェクトの配列
    show: PropTypes.bool                 //アラーム表示するかどうか
};

/**
 * アラーム表示バッチ
 * <AlarmBadge></AlarmBadge>
 */
const Badge = ({ cx, cy, r, color }) => (
    <circle
        className="through-object"
        cx={cx}
        cy={cy}
        r={r}
        style={{ fill: color }}
    />
);
