/**
 * @license Copyright 2019 DENSO
 * 
 * チャンネルごとの計測値ビュー Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import RealTimeDataItem from 'Assets/RealTimeDataItem';

/**
 * チャンネルごとの計測値ビューコンポーネントを定義します。
 * @param {array} channelValueData チャンネルごとのデータ
 * @param {object} listClasses リアルタイムアイテムのリスト用クラス
 * @param {object} dispIndexInfo 表示インデックス情報 { start: 表示するポイントの最初のインデックス, end: 表示するポイントの最後のインデックス }
 * @param {function} onShowPointDetailModal ポイント詳細表示時に呼び出す
 * @param {function} onShowTrendGraphModal トレンドグラフ表示時に呼び出す
 */
export default class ChannelValueView extends Component {
    
    /**
     * コンポーネントをアップデートするかどうか
     */
    shouldComponentUpdate(nextProps) {
        if (this.props.channelValueData != nextProps.channelValueData) {
            return true;
        }
    }

    /**
     * render
     */
    render() {
        const { channelValueData, listClasses, dispIndexInfo } = this.props;
        const dispData = channelValueData.slice(dispIndexInfo.start - 1, dispIndexInfo.end);
        return (
            <ul className="channel-view" >
                {dispData.map((data) => {
                    let tags = [];
                    tags.push(
                        <li>
                            <div className="channel-view-header">
                                <span>{"CH" + data.channelNo.toString()}</span>
                            </div>
                        </li>
                    );
                    tags.push(
                        <ul className={classNames(listClasses)}>
                            {data.valueData.map((item) => 
                                <RealTimeDataItem
                                    key={item.point.pointNo}
                                    currentData={{valueData: item}}
                                    hideLastData
                                    onDetailIconClick={(no) => this.handleDetailIconClick(no)}
                                    onGraphIconClick={(no) => this.handleGraphIconClick(no)}
                                />
                            )}
                        </ul>
                    );
                    return tags;
                }
                )}
            </ul>
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

ChannelValueView.propsTypes = {
    channelValueData: PropTypes.array,
    listClasses: PropTypes.object,
    dispIndexInfo: PropTypes.object,
    onShowPointDetailModal: PropTypes.func,
    onShowTrendGraphModal: PropTypes.func
}