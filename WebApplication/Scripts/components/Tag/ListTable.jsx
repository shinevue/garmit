/**
 * Copyright 2017 DENSO Solutions
 * 
 * 一覧表示テーブル Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Form, FormControl, ButtonToolbar } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import DataTable from 'Common/Widget/DataTable';

import MessageModal from 'Assets/Modal/MessageModal';

/**
 * 一覧表示テーブル
 * @param {array} data
 * @param {bool} isReadOnly
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
            },
            checkedIds: props.checkedIds || [],
            message: {}
        };
    }

    /**
     * 新しいPropsを受け取ったとき
     * @param {any} nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(nextProps.data) !== JSON.stringify(this.props.data)) {
            this.setCheckedIds([]);

            if (!nextProps.data) {
                this.setState({ currentPage: 1 });
            } else if (nextProps.data.length <= (this.state.currentPage - 1) * this.state.pageSize) {
                this.setState({ currentPage: Math.max(1, Math.ceil(nextProps.data.length / this.state.pageSize)) })
            }
        }
        if (JSON.stringify(nextProps.checkedIds) !== JSON.stringify(this.props.checkedIds)) {
            this.setState({ checkedIds: nextProps.checkedIds });
        }
    }

    /**
     * 一括削除ボタンクリック
     */
    onBulkDeleteClick() {
        this.props.onDeleteClick(this.state.checkedIds);
    }

    /**
     * 全てチェックのチェック状態が変化したとき
     * @param {any} checked
     */
    onAllCheckChange(checked) {
        if (checked) {
            this.setCheckedIds(this.getCurrentPageRowIds());
        } else {
            this.setCheckedIds([]);
        }
    }

    /**
     * チェック状態が変化したとき
     * @param {any} checked
     * @param {any} id
     */
    onCheckChange(checked, id) {
        const checkedIds = this.state.checkedIds.slice();
        if (checked) {
            checkedIds.push(id);
        } else {
            checkedIds.splice(checkedIds.indexOf(id), 1);
        }
        this.setCheckedIds(checkedIds);
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
        this.setState({ sort: newSort }, () => {
            this.uncheckHiddenRows()
        });
    }

    /**
     * 表示ページが変更された時
     * @param {any} page
     */
    onCurrentPageChange(page) {
        this.setState({ currentPage: page }, () => {
            this.uncheckHiddenRows();
        });
    }

    /**
     * ページサイズが変更された時
     * @param {any} size
     */
    onPageSizeChange(size) {
        this.setState({ pageSize: size, currentPage: 1 }, () => {
            this.uncheckHiddenRows();
        });
    }

    /**
     * 詳細ボタンがクリックされた時
     * @param {any} value
     */
    onDetailButtonClick(values) {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'message',
                title: '詳細',
                message: values.map((v) => <div>{v}</div>),
                onCancel: () => this.clearMessage()
            }
        });
    }

    /**
     * メッセージモーダルを閉じる
     */
    clearMessage() {
        this.setState({ message: Object.assign({}, this.state.message, { show: false }) });
    }

    /**
     * チェック状態をセットする
     * @param {any} ids
     */
    setCheckedIds(ids) {
        this.setState({ checkedIds: ids });
        if (this.props.onCheckChange) {
            this.props.onCheckChange(ids);
        }
    }

    /**
     * 非表示中の行のチェックを外す
     */
    uncheckHiddenRows() {
        const { checkedIds } = this.state;
        const displayedRowIds = this.getCurrentPageRowIds();

        const ids = checkedIds.filter((index) => displayedRowIds.indexOf(index) >= 0);
        this.setCheckedIds(ids);
    }

    /**
     * 表示ページの行データを取得する
     */
    getCurrentPageRowData() {
        if (this.props.data) {
            const { currentPage, pageSize, sort } = this.state;

            const data = this.props.data.slice();
            data.sort((a, b) => {
                const valueA = a.cells[sort.index];
                const valueB = b.cells[sort.index];
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
     * 表示ページの行のIDを取得する
     */
    getCurrentPageRowIds() {
        const currentPageData = this.getCurrentPageRowData();
        return currentPageData.map((d) => d.id);
    }

    /**
     * 全てチェックされているか
     */
    isAllChecked() {
        const { checkedIds } = this.state;
        const displayedRowIds = this.getCurrentPageRowIds();

        return displayedRowIds.length > 0 && !displayedRowIds.some((id) => checkedIds.indexOf(id) === -1);
    }

    /**
     * 表示状態を更新する
     */
    initDisplayState() {
        this.setState({
            currentPage: 1,
            pageSize: 5,
            sort: {
                index: 0,
                type: 'asc'
            },
            checkedIds: []
        });
    }

    /**
     * ヘッダーを生成する
     */
    makeHeader() {
        const { headers } = this.props;
        const { sort } = this.state;
        const checked = !this.props.isReadOnly && this.isAllChecked();
        return (
            <DataTable.Header>
                <DataTable.Row>
                    {!this.props.isReadOnly &&
                        <DataTable.HeaderCell invalidSorting>
                            <Checkbox
                                className="pa-0 mlr-0 mtb-0 flex-center"
                                checked={checked}
                                onClick={() => this.onAllCheckChange(!checked)}
                            />
                        </DataTable.HeaderCell>
                    }
                    {!this.props.isReadOnly && this.props.showButton &&
                        <DataTable.HeaderCell invalidSorting></DataTable.HeaderCell>
                    }
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
        if (this.props.data && this.props.data.length > 0) {
            const displayData = this.getCurrentPageRowData();

            return (
                <DataTable.Body>{displayData.map((rowData) => this.makeRow(rowData.cells, rowData.id))}</DataTable.Body>
            );
        }

        return (
            <DataTable.Body>
                <DataTable.Row>
                    <DataTable.Cell
                        colspan={this.props.isReadOnly ? this.props.headers.length : this.props.headers.length + 2}
                        className="ta-c"
                    >
                        {this.props.noDataMessage}
                    </DataTable.Cell>
                </DataTable.Row>
            </DataTable.Body>
        );
    }

    /**
     * 1行を生成する
     * @param {any} cells
     * @param {any} id
     */
    makeRow(cells, id) {
        const checked = !this.props.isReadOnly && this.state.checkedIds.indexOf(id) >= 0;

        return (
            <DataTable.Row>
                {!this.props.isReadOnly &&
                    <DataTable.Cell>
                        <Checkbox
                            className="pa-0 mlr-0 mtb-0 flex-center"
                            checked={checked}
                            onClick={() => this.onCheckChange(!checked, id)}
                        />
                    </DataTable.Cell>
                }
                {!this.props.isReadOnly && this.props.showButton &&
                    <DataTable.Cell>
                        <Icon
                            className="hover-icon icon-garmit-delete"
                            onClick={() => this.props.onDeleteClick([id])}
                        />
                    </DataTable.Cell>
                }
                {cells && cells.map((val) => {
                    if (!val || !val.length) {
                        return <DataTable.Cell>{val}</DataTable.Cell>;
                    }

                    const values = val.split(/\r\n|\r|\n/);
                    return (
                        <DataTable.Cell>
                            <span>{values[0].slice(0, 30)}</span>
                            {(values.length > 1 || values[0].length > 30) &&
                                <span>
                                    <span>...</span>
                                    <i
                                        className="icon-garmit-detail hover-icon pull-right"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            this.onDetailButtonClick(values);
                                        }}
                                    />
                                </span>
                            }
                        </DataTable.Cell>
                    );
                })}
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
        const { isReadOnly, data, showButton, addButtonDisabled } = this.props;
        const { currentPage, pageSize, checkedIds, message } = this.state;

        return (
            <div>
                {!isReadOnly && showButton &&
                    <ButtonToolbar className="mb-05 pull-left">
                        <Button
                            iconId="delete"
                            bsSize="sm"
                            disabled={checkedIds.length === 0}
                            onClick={() => this.onBulkDeleteClick()}
                        >
                            <span>削除</span>
                        </Button>
                        <Button
                            iconId="add"
                            bsSize="sm"
                            onClick={() => this.props.onAddClick()}
                            disabled={addButtonDisabled}
                        >
                            <span>追加</span>
                        </Button>
                    </ButtonToolbar>
                }
                <div className="pull-right">
                    {this.makePageSizeSelectForm()}
                </div>
                <DataTable
                    hover responsive
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalItemCount={(data && data.length) || 0}
                    onPageClick={(val) => this.onCurrentPageChange(val)}
                >
                    {this.makeHeader()}
                    {this.makeBody()}
                </DataTable>
                <MessageModal
                    show={message.show}
                    title={message.title}
                    bsSize={message.size}
                    buttonStyle={message.buttonStyle}
                    onOK={message.onOK}
                    onCancel={message.onCancel}
                >
                    {message.message}
                </MessageModal>
            </div>
        );
    }
}

ListTable.propTypes = {
    data: PropTypes.array,
    onDeleteClick: PropTypes.func,
    onAddClick: PropTypes.func
};

ListTable.defaultProps = {
    onDeleteClick: () => { },
    onAddClick: () => { }
}