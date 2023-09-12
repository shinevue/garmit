/**
 * @license Copyright 2019 DENSO
 * 
 * OtherValueView Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import RealTimeDataItem from 'Assets/RealTimeDataItem';

/**
 * チャンネル以外の計測値ビューコンポーネント
 * @param {array} valueData ポイントの計測値データ
 * @param {object} listClasses リアルタイムアイテムのリスト用クラス
 * @param {function} onShowPointDetailModal ポイント詳細表示時に呼び出す
 * @param {function} onShowTrendGraphModal トレンドグラフ表示時に呼び出す
 * @param {function} onThresholdChange
 */
export default class OtherValueView extends Component {
    
    /**
     * コンポーネントをアップデートするかどうか
     */
    shouldComponentUpdate(nextProps) {
        if (this.props.valueData != nextProps.valueData) {
            return true;
        }
    }

    /**
     * render
     */
    render() {
        const { className, valueData, listClasses } = this.props;
        return (
            <div className={classNames('battery-other-grid-container', 'battery-realtime-grid', className)}>
                <ul className={classNames(listClasses)} >
                    {valueData.map((data) =>
                        <RealTimeDataItem
                            key={data.point.pointNo}
                            currentData={{valueData: data}}
                            hideLastData
                            onDetailIconClick={(no) => this.handleDetailIconClick(no)}
                            onGraphIconClick={(no) => this.handleGraphIconClick(no)}
                        />
                    )}
                </ul>
            </div>
        );
    }
    
    /**
     * 詳細アイコンクリックイベント
     * @param {number} pointNo ポイント番号
     */
    handleDetailIconClick(pointNo) {
        if (this.props.onShowPointDetailModal) {
            this.props.onShowPointDetailModal(pointNo);
        }
    }

    /**
     * グラフアイコンクリックイベント
     * @param {number} pointNo ポイント番号
     */
    handleGraphIconClick(pointNo) {
        if (this.props.onShowTrendGraphModal) {
            this.props.onShowTrendGraphModal(pointNo);
        }
    }
}

OtherValueView.propsTypes = {
    valueData: PropTypes.array,
    listClasses: PropTypes.object,
    onShowPointDetailModal: PropTypes.func,
    onShowTrendGraphModal: PropTypes.func
}