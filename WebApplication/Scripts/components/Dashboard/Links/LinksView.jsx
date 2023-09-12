/**
 * @license Copyright 2020 DENSO
 *
 * LinksView Reactコンポーネント
 *
 */

'use strict';

import React, { Component } from 'react';

const DEFAULT_ITEM_COUNT = 5;

/**
 * LinksView
 * @param {string} title パネルタイトル
 * @param {object} links リンクのリスト
 */
export default class LinksView extends Component {

    /**
     * render
     */
    render() {
        const { links } = this.props;
        if (!links) {
            return null;
        }
        const linkItemList = [];
        for (let i = 0; i < DEFAULT_ITEM_COUNT; i++) {
            linkItemList.push(
                (links[i] && links[i].url && links[i].title) ? <a className="links-item btn btn-lightgray" href={links[i].url} target="_blank">{links[i].title}</a> : <span className={"links-item"}/>

            );
        }

        return (
            <div className="dashboard-item">
                <h4>{this.props.title}</h4>
                <div className="links">
                    {linkItemList}
                </div>
            </div>
        );
    }
}

LinksView.defaultProps = {
    title: '外部リンク',
};