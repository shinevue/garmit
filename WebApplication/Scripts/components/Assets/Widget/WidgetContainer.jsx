/**
 * @license Copyright 2020 DENSO
 * 
 * WidgetContainer Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import classNames from 'classnames';

/**
 * WidgetContainer
 * @param {string} title パネルタイトル
 * @param {boolean} sortDisabled ソート可能かどうか
 * @param {object} updateControlProps render を判定するためのプロパティリスト（ホワイトリスト）
 * @param {function} onCreate sortable が生成された時のイベントハンドラ
 * @param {function} onUpdate DOMが更新された時のイベントハンドラ
 */
export default class WidgetContainer extends Component {
    /**
     * コンストラクタ
     */
    constructor(){
        super();
        this.state = {
            groupList: [],
            sortable: false,
        };
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        if (!this.props.sortDisabled) {
            this.setSortable();
        }
    }

    /**
     * Componentがアップデートされる前に呼ばれます。
     * @param nextProps 次のprops
     * @param nextState 次のstate
     */
    componentWillUpdate(nextProps, nextState) {
        if (!this.props.sortDisabled && this.state.sortable) {
            this.destroySortable();
        }
    }

    /**
     * Componentがアップデートされたときに呼ばれます。
     *
     * @param prevProps アップデート前のprops
     * @param prevState アップデート前のstate
     */
    componentDidUpdate(prevProps, prevState) {
        if (!this.props.sortDisabled) {
            this.setSortable();
        }
    }

    /**
     * Componentがアンマウントされるときに呼び出されます。
     * リソースの開放などを記述します。
     */
    componentWillUnmount() {

    }

    shouldComponentUpdate(nextProps, nextState) {
        /*
         * 監視するプロパティのリストを props.updateControlPropsに（ホワイトリスト的に）記述します
         */
        if (!nextProps.updateControlProps) {
            return false;
        }
        // 新しく prop が発生したか、既存の prop と値が異なる場合に true
        return nextProps.updateControlProps.findIndex((prop, index) =>
            (typeof this.props.updateControlProps[index] === 'undefined') || prop !== this.props.updateControlProps[index]
        ) >= 0;
    }

    /**
     * sortableをセットする
     */
    setSortable() {

        const groupList = []
        $('.widget-container .widget-area').each((i, elem) => {
            const group = $(elem).data('group');
            if (!groupList.includes(group)) {
                groupList.push(group);
            }
        });
        groupList.forEach(group => {
            const connectWith = '.widget-area[data-group=' + group + ']';
            const $widgetArea = $('.widget-container '+ connectWith);
            $widgetArea.sortable({
                connectWith: connectWith,
                placeholder: 'move-target',
                forcePlaceholderSize: false,
                zIndex: 999999,
                create: (event, ui) => { this.setState({sortable: true}); this.props.onCreate && this.props.onCreate($widgetArea, event, ui); },
                update: (event, ui) => { this.props.onUpdate && this.props.onUpdate($widgetArea, event, ui); }
            }).disableSelection();
        })

    }

    /**
     * sortableを解除する
     */
    destroySortable() {
        $('.widget-container .widget-area').sortable("destroy");
        this.setState({groupList: [], sortable: false});
    }

    /**
     * ソートをキャンセルする
     */
    cancelSortable() {
        $('.widget-container .widget-area').sortable('cancel');
    }

    render() {
        return (
            <div className={classNames('widget-container', (this.props.sortDisabled ? 'read-only' : ''))} style={{overflow: 'hidden'}}>
                {this.props.children}
            </div>
        );
    }
}

WidgetContainer.defaultProps = {
    sortDisabled: false,
};