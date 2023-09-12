/**
 * @license Copyright 2018 DENSO
 * 
 * LoadBarGraph Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BarGraph from 'Common/Widget/BarGraph';
import StackedBarGraph from 'Common/Widget/StackedBarGraph';

/**
 * 荷重バーグラフコンポーネント
 * @param {string} title バーグラフのタイトル
 * @param {number} max バーグラフの最大値
 * @param {string} maxNowValueString バーグラフの説明
 * @param {object} barGraphItems バーグラフのアイテムリスト
 */
export default class LoadBarGraph extends Component {
    
    /**
     * render
     */
    render() {
        const { title, max, maxNowValueString, barGraphItems } = this.props;   
        return (barGraphItems&&(barGraphItems.length >= 2)?
                    <StackedBarGraph title={title} description={maxNowValueString} >
                        {barGraphItems.map((item, index) => 
                            <StackedBarGraph.Item key={index} value={this.getUsage(max, barGraphItems, item, index)} bsStyle={item.alarmName} label={item.percentage} />
                        )}
                    </StackedBarGraph>
                    :
                    this.makeBarGraph_WithoutRackWeight(title, max, maxNowValueString, barGraphItems)
                );
    }

    /**
     * 使用率を取得する
     * @param {number} max バーグラフの最大値
     * @param {array} barGraphItems バーグラフのアイテムリスト
     * @param {number} graphSet 対象のバーグラフ情報
     * @param {number} index インデックス
     */
    getUsage(max, barGraphItems, graphSet, index) {
        if (index >= 1) {
            let exceptSumUsage = 0;
            barGraphItems.forEach((item, i) => {
                if (i !== index) {
                    exceptSumUsage += item.usage;
                }
            });
            const graphMax = max - exceptSumUsage;
            return (graphMax >= graphSet.usage) ? graphSet.usage : graphMax;
        } else {
            return graphSet.usage;
        }
    }

    /**
     * ラック重量を含めない荷重バーグラフを作成する
     * @param {string} title バーグラフのタイトル
     * @param {number} max バーグラフの最大値
     * @param {string} maxNowValueString バーグラフの説明
     * @param {object} barGraphItems バーグラフのアイテムリスト
     */
    makeBarGraph_WithoutRackWeight(title, max, maxNowValueString, barGraphItems) {
        const graphSet = this.getBarGraphSetting_WithoutRackWeight(barGraphItems);
        max = max ? max : 100;
        const usage = (max >= graphSet.usage) ? graphSet.usage : max;
        return <BarGraph title={title} 
                         description={maxNowValueString}
                         value={usage} 
                         max={max} 
                         min={0} 
                         bsStyle={graphSet.alarmName} 
                         label={graphSet.percentage} />
    }

    /**
     * ラック重量を含めない荷重バーグラフ設定を取得する
     * @param {object} barGraphItems バーグラフのアイテムリスト
     */
    getBarGraphSetting_WithoutRackWeight(barGraphItems){
        if (barGraphItems&&barGraphItems.length > 0) {
            return barGraphItems[0];
        } else {
            return {
                usage: 0,
                percentage: '',
                alarmName: 'success'
            }
        }
    }
}

LoadBarGraph.propTypes = {
    title: PropTypes.string.isRequired,
    max: PropTypes.number.isRequired,
    maxNowValueString: PropTypes.string.isRequired,
    barGraphItems: PropTypes.arrayOf(PropTypes.shape({
        usage: PropTypes.number.isRequired,
        percentage: PropTypes.string.isRequired,
        alarmName: PropTypes.string.isRequired
    }))
}