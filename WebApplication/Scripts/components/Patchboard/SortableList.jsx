/**
 * Copyright 2022 DENSO
 * 
 * SortableList Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class SortableList extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    /**
     * Componentがマウントされるときに1度だけ呼ばれます。
     */
    componentDidMount() {
        this.setSortable();
    }

    /**
     * コンポーネントのstateが変更されたときに呼ばれます。
     * パフォーマンス・チューニング時に行います
     * @param nextProps 次のprops
     * @param nextState 次のstate
     */
    shouldComponentUpdate(nextProps, nextState) {
        if (JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
            return true;
        }
    }

    /**
     * Componentがアップデートされる前に呼ばれます。
     * @param nextProps 次のprops
     * @param nextState 次のstate
     */
    componentWillUpdate(nextProps, nextState) {
        this.destroySortable();
    }

    /**
     * Componentがアップデートさえたときに呼ばれます。
     * 
     * @param prevProps アップデート前のprops
     * @param prevState アップデート前のstate
     */
    componentDidUpdate(prevProps, prevState) {
        this.setSortable();
    }

    /**
     * sortableをセットする
     */
    setSortable() {
        $('.sortable-list').sortable({
            placeholder: 'move-target',
            handle: '.handle',
            zIndex: 999999
        }).disableSelection();

        $('.sortable-list').on('sortupdate', () => this.handleChange());
    }

    /**
     * sortableを解除する
     */
    destroySortable() {
        $('.sortable-list').sortable('destroy');
    }

    /**
     * ソートをキャンセルする
     */
    cancelSortable() {
        $('.sortable-list').sortable('cancel');
    }

    /**
     * 表示項目が変更された時
     */
    handleChange() {
        const idArray = $('.sortable-list').sortable('toArray');  //並べ替え要素のidの配列を取得
        this.cancelSortable();  //変更をキャンセルする

        const sorted = idArray.map((id, index) => {
            const patchboardOrder = this.props.patchboardOrders.find((po) => po.patchboardId.toString() === id);
            return Object.assign({}, patchboardOrder, { dispIndex: index + 1 });    //dispIndexは1から振る
        })

        this.props.onChange(sorted);
    }

    /**
     * render
     */
    render() {
        const { patchboardOrders } = this.props;

        const style = {
            maxHeight: 550,
            overflow: 'auto'
        }

        return (
            <ul className="sortable-list" style={style}>
                {patchboardOrders.map((po) =>
                    <li className="sortable-list-item" id={po.patchboardId}>
                        <span className="handle">
                            <span><i className="fa fa-bars" /></span>
                            <span>{po.patchboardName}</span>
                        </span>
                    </li>
                )}
            </ul>
        )
    }
}

SortableList.propTypes = {
    patchboardOrders: PropTypes.array,
    onChange: PropTypes.func
}