/**
 * @license Copyright 2020 DENSO
 *
 * NavigationsView Reactコンポーネント
 *
 */
'use strict';

import React, { Component } from 'react';

const DEFAULT_ITEM_COUNT = 5;

/**
 * NavigationsView
 * @param {string} title パネルタイトル（現在表示する場所はありません）
 * @param {object} navigations ナビゲーションのリスト
 */
export default class NavigationsView extends Component {

    /**
     * render
     */
    render() {
        const { navigations } = this.props;
        if (!navigations) {
            return null;
        }
        const navigationItemList = [];
        for (let i = 0; i < DEFAULT_ITEM_COUNT; i++) {
            navigationItemList.push(
                (navigations[i] && navigations[i].url && navigations[i].title) ?
                <a className={"navigations-item btn btn-primary"} href={navigations[i].url}>{navigations[i].title}</a>
                : <span className={"navigations-item"}></span>
            );
        }

        return (
            <div className="dashboard-item">
                <div className="navigations">
                    {navigationItemList}
                </div>
            </div>
        );
    }
}

NavigationsView.defaultProps = {
    title: 'ナビゲーション',
};