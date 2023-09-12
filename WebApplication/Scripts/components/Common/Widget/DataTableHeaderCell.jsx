/**
 * Copyright 2017 DENSO Solutions
 * 
 * DataTableHeaderCell Reactコンポーネント
 *   
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Form, FormControl, Glyphicon } from 'react-bootstrap';

/**
 * 表のヘッダを作成する
 * <DataTableHeaderCell />
 * @param {*} sorted ソート（'asc', 'desc'のいずれか）
 * @param {bool} invalidSorting ソートを無効にするかどうか
 * @param {function} onClick クリックしたときに呼び出す
 * @param {array} filterOptions フィルターのオプション
 */
export default class DataTableHeaderCell extends Component {

    constructor(props) {
        super(props);
        this.state = {
            filterValue: 'all'
        }
    }


    /**
     * render
     */
    render() {
        const { sorted, invalidSorting, filtered, style, className } = this.props;

        const classes = {
            'pa-r-3': !invalidSorting,
            'position-relative': true
        };

        return (
            <th className={classNames(classes, className)} style={style}>
                {this.props.children}
                {(!invalidSorting) && this.makeSortingIcon(sorted)}
            </th>
        );
    }

    makeSortingIcon(sorted) {
        return (
            <i
                onClick={() => this.props.onClick()}
                className="sorting-icon"
            >
                <Glyphicon
                    glyph={(sorted === 'asc') ? 'sort-by-attributes' : (sorted === 'desc') ? 'sort-by-attributes-alt' : 'sort' }
                    style={{ opacity: sorted ? 0.5 : 0.2 }} />
            </i>
        )
    }
}

DataTableHeaderCell.propTypes = {
    className: PropTypes.string,
    sorted: PropTypes.oneOf(['asc', 'desc']),
    filtered: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    filterOptions: PropTypes.array    
};

