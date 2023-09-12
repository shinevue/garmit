/**
 * @license Copyright 2020 DENSO
 *
 * WidgetArea Reactコンポーネント
 *
 */
'use strict';

import React, { Component } from 'react';
import classNames from 'classnames';

/**
 * WidgetArea
 * ウィジェット領域を定義するコンポーネント
 * @param {string} sortableListClassName ソート領域のためのクラス名
 * @param {string} className 任意のクラス名
 * @param {string} name 領域のグループ（同一グループの領域間を移動できる）
 * @param {string} name 領域の名称
 */
export default class WidgetArea extends Component {
    /**
     * コンストラクタ
     */
    constructor(props){
        super(props);
        this.state = {
        };
    }

    render() {
        const {className, sortableListClassName, name, group} = this.props;
        return (
            <div className={classNames("widget-area", className, sortableListClassName)} style={{minHeight: '160px', paddingBottom: '2em'}} data-group={group} data-area-name={name}>
                {this.props.children}
            </div>
        )
    }

}

WidgetArea.defaultProps = {
    sortableListClassName: 'sortable-list',
    group: 'default'
}