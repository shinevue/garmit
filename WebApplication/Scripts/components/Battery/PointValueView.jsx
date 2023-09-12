/**
 * @license Copyright 2019 DENSO
 * 
 * ポイントごとの計測値ビュー Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import RealTimeDataItem from 'Assets/RealTimeDataItem';

/**
 * ポイントごとの計測値ビューコンポーネント
 * @param {array} valueData ポイントの計測値データ
 * @param {object} listClasses リアルタイムアイテムのリスト用クラス
 * @param {object} dispIndexInfo 表示インデックス情報 { start: 表示するポイントの最初のインデックス, end: 表示するポイントの最後のインデックス }
 * @param {object} sort ソート情報 { key: ソートのキー, isAsc: true }
 * @param {object} filter フィルター情報 { alarm: 表示するアラーム , datatype: 表示するデータ種別 }
 * @param {function} onShowPointDetailModal ポイント詳細表示時に呼び出す
 * @param {function} onShowTrendGraphModal トレンドグラフ表示時に呼び出す
 */
export default class PointValueView extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
    }

    //#region ライフサイクルメソッド

    /**
     * render
     */
    render() {
        const { valueData, listClasses, dispIndexInfo } = this.props;
        const dispData = valueData.slice(dispIndexInfo.start - 1, dispIndexInfo.end)
        return (
            <ul className={classNames(listClasses)} ref="grid" >
                {dispData.map((data) =>
                    <RealTimeDataItem
                        key={data.point.pointNo}
                        currentData={{valueData: data}}
                        hideLastData
                        onDetailIconClick={(no) => this.handleDetailIconClick(no)}
                        onGraphIconClick={(no) => this.handleGraphIconClick(no)}
                    />
                )}
            </ul>
        );
    }

    //#endregion
    
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

PointValueView.propsTypes = {
    valueData: PropTypes.array,
    listClasses: PropTypes.object,
    dispIndexInfo: PropTypes.object,
    onShowPointDetailModal: PropTypes.func,
    onShowTrendGraphModal: PropTypes.func
}