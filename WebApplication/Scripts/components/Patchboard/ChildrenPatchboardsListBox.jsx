'use strict';

import React, { Component } from 'react';

import PropTypes from 'prop-types';

import { Form, FormControl } from 'react-bootstrap';

import DataTable from 'Common/Widget/DataTable';

import GarmitBox from 'Assets/GarmitBox';

import { createLocationDisplayString } from 'locationUtility';

const HEADERS = ['配線盤種別', '配線盤名称', 'ロケーション', 'メタル/光', '開始線番', '終了線番', '備考'];

export default class ChildrenPatchboardsListBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currentPage: 1,
            pageSize: 10,
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
        if (nextProps.patchboards != this.props.patchboards) {
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
     * テーブルのデータを生成する
     * @param {any} patchboards
     */
    makeTableData(patchboards) {
        return patchboards.map((p) => ({
            id: p.patchboardId,
            data: [
                p.patchboardType.name,
                p.patchboardName,
                p.location && createLocationDisplayString(p.location),
                p.patchCableType.name,
                p.startNo,
                p.endNo,
                p.memo
            ]
        }));
    }

    /**
     * 表示ページの行データを取得する
     * @param {any} allRowData
     */
    getCurrentPageRowData(allRowData) {
        if (allRowData) {
            const { currentPage, pageSize, sort } = this.state;

            const rowData = allRowData.slice();
            rowData.sort((a, b) => {
                const valueA = a.data[sort.index];
                const valueB = b.data[sort.index];
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
            const last = (currentPage * pageSize) < rowData.length ? (currentPage * pageSize) : rowData.length;
            return rowData.slice(first, last);
        } else {
            return [];
        }
    }

    /**
     * ヘッダーを生成する
     * @param {any} headers
     */
    makeHeader(headers) {
        const { sort } = this.state;
        return (
            <DataTable.Header>
                <DataTable.Row>
                    {headers.map((header, i) =>
                        <DataTable.HeaderCell
                            key={i}
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
     * @param {any} patchboards
     * @param {any} headers
     */
    makeBody(patchboards, headers) {
        if (patchboards && patchboards.length > 0) {
            const data = this.makeTableData(patchboards);
            const currentPageRowData = this.getCurrentPageRowData(data);

            return (
                <DataTable.Body>
                    {currentPageRowData.map((rd) => this.makeRow(rd))}
                </DataTable.Body>
            );
        }

        return (
            <DataTable.Body>
                <DataTable.Row>
                    <DataTable.Cell
                        colspan={headers.length}
                        className="ta-c"
                    >
                        子配線盤がありません
                    </DataTable.Cell>
                </DataTable.Row>
            </DataTable.Body>
        );
    }

    /**
     * 一行を生成する
     * @param {any} rowData
     */
    makeRow(rowData) {
        return (
            <DataTable.Row onClick={() => this.props.onSelect(rowData.id)}>
                {rowData.data.map((cellData, i) =>
                    <DataTable.Cell key={i}>
                        {cellData}
                    </DataTable.Cell>
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
                </FormControl> 件を表示
            </Form>
        );
    }

    /**
     * render
     */
    render() {
        const { patchboards, isLoading } = this.props;
        const { currentPage, pageSize } = this.state;

        return (
            <GarmitBox title="子配線盤一覧" isLoading={isLoading}>
                <div className="pull-right">
                    {this.makePageSizeSelectForm()}
                </div>
                <DataTable
                    className="datatable-select"
                    hover responsive
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalItemCount={(patchboards && patchboards.length) || 0}
                    onPageClick={(val) => this.onCurrentPageChange(val)}
                >
                    {this.makeHeader(HEADERS)}
                    {this.makeBody(patchboards, HEADERS)}
                </DataTable>
            </GarmitBox>
        );
    }
}

ChildrenPatchboardsListBox.propTypes = {
    patchboards: PropTypes.array,
    onSelect: PropTypes.func,
    isLoading: PropTypes.bool
};