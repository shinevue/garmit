/**
 * Copyright 2017 DENSO Solutions
 * 
 * 一覧表示テーブル Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, FormControl } from 'react-bootstrap';

import DataTable from 'Common/Widget/DataTable';

/**
 * 一覧表示テーブル
 * @param {array} data
 * @param {array} headers
 */
export default class ListTable extends Component {

    constructor(props) {
        super();
        this.state = {
            currentPage: 1,
            pageSize: 5,
            sort: {
                index: 0,
                type: 'asc'
            }
        };
    }

    /**
     * 新しいPropsを受け取ったとき
     * @param {any} nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(nextProps.data) !== JSON.stringify(this.props.data)) {
            this.setState({ currentPage: 1 });
        }
    }

    /**
     * ソートアイコンをクリックされた時
     * @param {any} i
     */
    onSortClick(i) {
        const newSort = {
            index: i,
            type: (i !== this.state.sort.index) ? 'asc' : (this.state.sort.type === 'asc') ? 'desc' : 'asc'
        };
        this.setState({ sort: newSort });
    }

    /**
     * 表示ページが変更された時
     * @param {any} page
     */
    onCurrentPageChange(page) {
        this.setState({ currentPage: page });
    }

    /**
     * ページサイズが変更された時
     * @param {any} size
     */
    onPageSizeChange(size) {
        this.setState({ pageSize: size, currentPage: 1 });
    }

    /**
     * 表示ページの行データを取得する
     */
    getCurrentPageRowData() {
        if (this.props.data) {
            const { currentPage, pageSize, sort } = this.state;

            const data = this.props.data.slice();
            data.sort((a, b) => {
                const valueA = a[sort.index];
                const valueB = b[sort.index];
                const floatA = parseFloat(valueA);
                const floatB = parseFloat(valueB);

                if (valueA == floatA && valueB == floatB) {
                    if (floatA < floatB) return sort.type === 'asc' ? -1 : 1;
                    if (floatA > floatB) return sort.type === 'asc' ? 1 : -1;
                } else {
                    if (valueA < valueB) return sort.type === 'asc' ? -1 : 1;
                    if (valueA > valueB) return sort.type === 'asc' ? 1 : -1;
                }
                return 0;
            });

            const first = (currentPage - 1) * pageSize;
            const last = (currentPage * pageSize) < data.length ? (currentPage * pageSize) : data.length;
            const currentPageData = [];
            for (let i = first; i < last; i++) {
                currentPageData.push(data[i]);
            }

            return currentPageData;
        } else {
            return [];
        }
    }

    /**
     * ヘッダーを生成する
     */
    makeHeader() {
        const { headers } = this.props;
        const { sort } = this.state;
        return (
            <DataTable.Header>
                <DataTable.Row>
                    {headers && headers.map((header, i) =>
                        <DataTable.HeaderCell
                            onClick={() => this.onSortClick(i)}
                            sorted={sort.index === i && sort.type}
                        >
                            {header}
                        </DataTable.HeaderCell>
                    )}
                </DataTable.Row>
            </DataTable.Header>
        );
    }

    /**
     * ボディを生成する
     */
    makeBody() {
        const displayData = this.getCurrentPageRowData();

        return (
            <DataTable.Body>{displayData.map((rowData) => this.makeRow(rowData, this.props.data.indexOf(rowData)))}</DataTable.Body>
        );
    }

    /**
     * 1行を生成する
     * @param {any} rowData
     * @param {any} i
     */
    makeRow(rowData, i) {
        return (
            <DataTable.Row>
                {rowData && rowData.map((value) => 
                    <DataTable.Cell>{value}</DataTable.Cell>
                )}
            </DataTable.Row>
        );
    }

    /**
     * ページサイズ変更フォームを生成する
     */
    makePageSizeSelectForm() {
        const { pageSize } = this.state;

        return (
            <Form inline>
                <FormControl
                    componentClass="select"
                    bsSize="sm"
                    value={pageSize}
                    onChange={(e) => this.onPageSizeChange(e.target.value)}
                >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                </FormControl> 件を表示
            </Form>
        );
    }

    /**
     * render
     */
    render() {
        const { data } = this.props;
        const { currentPage, pageSize } = this.state;

        return (
            <div>
                <div className="clearfix">
                    <div className="pull-right">
                        {this.makePageSizeSelectForm()}
                    </div>
                </div>
                <DataTable
                    hover responsive
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalItemCount={data.length}
                    onPageClick={(val) => this.onCurrentPageChange(val)}
                >
                    {this.makeHeader()}
                    {this.makeBody()}
                </DataTable>
            </div>
        );
    }
}

ListTable.propTypes = {
    data: PropTypes.array,
    headers: PropTypes.array
}

ListTable.defaultProps = {
    data: [],
    headers: []
}