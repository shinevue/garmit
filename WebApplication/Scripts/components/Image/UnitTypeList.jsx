'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { ButtonToolbar, Image, Form, FormControl, Checkbox } from 'react-bootstrap';

import DataTable from 'Common/Widget/DataTable';
import TextForm from 'Common/Form/TextForm';
import Icon from 'Common/Widget/Icon';
import Button from 'Common/Widget/Button';

/**
 * 画像一覧
 * @param {Array} unitTypes
 */
export default class UnitTypeList extends Component {

    constructor() {
        super();
        this.state = {
            currentPage: 1,
            pageSize: 10,
            sort: false,
            isAsc: false,
            filter: '',
            checkedIds: []
        };
    }

    /**
     * コンポーネントが新しいpropsを受け取ったとき
     * @param {any} nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(nextProps.unitTypes) !== JSON.stringify(this.props.unitTypes)) {
            this.setState({ checkedIds: [] });
        
            const displayData = this.getDisplayUnitTypes(nextProps.unitTypes);
            // 現在のページに表示する行がない場合
            if (displayData.length < (this.state.currentPage - 1) * this.state.pageSize) {
                const lastPage = Math.ceil(displayData.length / this.state.pageSize);
                this.setState({ currentPage: lastPage });   // 表示するページを最後のページにする
            }
        }
    }

    /**
     * ソートアイコンがクリックされた時
     */
    onSortClick() {
        this.setState({ isAsc: !this.state.isAsc, sort: true }, () => {
            this.uncheckHiddenRows();
        });
    }

    /**
     * フィルターの値が変化したとき
     * @param {any} val
     */
    onFilterChange(val) {
        this.setState({ filter: val, currentPage: 1 }, () => {
            this.uncheckHiddenRows();
        });
    }

    /**
     * ページがクリックされた時
     * @param {any} no ページ番号
     */
    onPageClick(no) {
        this.setState({ currentPage: no, checkedIds: [] });
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
     * チェックが変更された時
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

        this.setState({ checkedIds: checkedIds });
    }

    /**
     * すべてチェックチェックボックスのチェックが変更された時
     * @param {any} checked
     */
    onAllCheckChange(checked) {
        if (checked) {
            this.setState({ checkedIds: this.getCurrentPageRowIds() });
        } else {
            this.setState({ checkedIds: [] });
        }
    }

    /**
     * 現在のページに表示されていない行のチェックを外す
     */
    uncheckHiddenRows() {
        const { checkedIds } = this.state;
        const displayedData = this.getDisplayUnitTypes(this.props.unitTypes);
        const currentPageData = this.getCurrentPageUnitTypes(displayedData);

        const newcheckedIds = checkedIds.filter((id) => currentPageData.some((data) => data.typeId === id));
        this.setState({ checkedIds: newcheckedIds });
    }

    /**
     * 現在の表示ページの行IDを取得する
     */
    getCurrentPageRowIds() {
        const currentPageData = this.getCurrentPageUnitTypes(this.getDisplayUnitTypes(this.props.unitTypes));
        return currentPageData.map((data) => data.typeId);
    }

    /**
     * 全ての行がチェックされているか
     */
    isAllChecked() {
        const currentPageRowIds = this.getCurrentPageRowIds();
        if (currentPageRowIds.length === 0) {
            return false;
        }
        const hasUncheckedRow = currentPageRowIds.some((id) => this.state.checkedIds.indexOf(id) < 0);
        return !hasUncheckedRow;
    }

    /**
     * データを絞り込む
     * @param {any} unitTypes
     */
    filterUnitTypes(unitTypes) {
        const { filter } = this.state;
        return unitTypes.filter((unitType) => {
            if (filter.length) {
                const searchStrings = filter.split(/[\s　]+/);    // OR検索
                const match = (searchStrings.find((str) => unitType.name.indexOf(str) >= 0) !== undefined)
                if (!match) return false;
            }
            return true;
        });
    }

    /**
     * データをソートする
     * @param {any} unitTypes
     */
    sortUnitTypes(unitTypes) {
        if (!this.state.sort) {
            return unitTypes;
        }

        const sortedUnitTypes = unitTypes.slice();
        return sortedUnitTypes.sort((a, b) => {
            if (a.name < b.name) return this.state.isAsc ? -1 : 1;
            if (a.name > b.name) return this.state.isAsc ? 1 : -1;
            return 0;
        });
    }

    /**
     * 表示する全てのデータを取得する
     */
    getDisplayUnitTypes(unitTypes) {
        if (!unitTypes || !unitTypes.length) {
            return [];
        }

        // カラムフィルターで絞り込む
        const filteredUnitTypes = this.filterUnitTypes(unitTypes);
        // ソートする
        const sortedUnitTypes = this.sortUnitTypes(filteredUnitTypes);

        return sortedUnitTypes;
    }

    /**
     * 現在のページに表示するデータを取得する
     * @param {any} unitTypes
     */
    getCurrentPageUnitTypes(unitTypes) {
        if (!unitTypes || !unitTypes.length) {
            return [];
        }

        const { currentPage, pageSize } = this.state;
        const first = (currentPage - 1) * pageSize;
        const last = (currentPage * pageSize) < unitTypes.length ? (currentPage * pageSize) : unitTypes.length;
        const currentPageUnitTypes = [];
        for (let i = first; i < last; i++) {
            currentPageUnitTypes.push(unitTypes[i]);
        }
        return currentPageUnitTypes;
    }

    /**
     * ヘッダーを生成する
     */
    makeHeader() {
        const { edit } = this.props;
        const { isAsc, filter, sort } = this.state;

        const headerCells = [];

        if (edit) {
            const checked = this.isAllChecked();
            headerCells.push(
                <DataTable.HeaderCell invalidSorting>
                    <Checkbox
                        className="ta-c"
                        checked={checked}
                        onClick={() => this.onAllCheckChange(!checked)}
                    />
                </DataTable.HeaderCell>
            );
            headerCells.push(<DataTable.HeaderCell invalidSorting></DataTable.HeaderCell>);
        }

        headerCells.push(
            <DataTable.HeaderCell
                sorted={sort && (isAsc ? 'asc' : 'desc')}
                onClick={() => this.onSortClick()}
            >
                <span>名称</span>
                    <TextForm
                        className="mb-0 normalText"
                        minWidth={80}
                        value={filter}
                        onChange={(val) => this.onFilterChange(val)}
                        bsSize="sm"
                    />
            </DataTable.HeaderCell>
        );

        return (
            <DataTable.Header>
                <DataTable.Row>{headerCells}</DataTable.Row>
            </DataTable.Header>
        );
    }

    /**
     * ボディを生成する
     * @param {any} unitTypes
     */
    makeBody(unitTypes) {
        if (!unitTypes || !unitTypes.length) {
            return (
                <DataTable.Body>
                    <DataTable.Row>
                        <DataTable.Cell
                            className="ta-c"
                            colspan={this.props.edit ? 3 : 1}
                        >
                            <span>ユニット種別がありません</span>
                        </DataTable.Cell>
                    </DataTable.Row>
                </DataTable.Body>
            );
        }

        return (
            <DataTable.Body>{unitTypes.map((unitType) => this.makeRow(unitType))}</DataTable.Body>
        );
    }

    /**
     * Rowを生成する
     * @param {any} unitType
     */
    makeRow(unitType) {
        const { edit } = this.props;
        const cells = [];

        if (edit) {
            const checked = this.state.checkedIds.indexOf(unitType.typeId) >= 0;
            cells.push(
                <DataTable.Cell>
                    <Checkbox
                        className="ta-c mtb-0"
                        checked={checked}
                        onClick={() => this.onCheckChange(!checked, unitType.typeId)}
                    />
                </DataTable.Cell>
            );
            cells.push(
                <DataTable.Cell style={{ whiteSpace: 'nowrap' }}>
                    <Icon className="icon-garmit-edit hover-icon" onClick={() => this.props.onEditClick(unitType)} />
                    <Icon className="icon-garmit-delete hover-icon" onClick={() => this.props.onDeleteClick([unitType.typeId])} />
                </DataTable.Cell>
            );
        }

        cells.push(<DataTable.Cell><span>{unitType.name}</span></DataTable.Cell>);

        return (
            <DataTable.Row>{cells}</DataTable.Row>
        )
    }

    /**
     * 表示件数選択フォームを生成する
     */
    makeDisplayLengthSelectForm() {
        const { pageSize } = this.state;
        return (
            <Form inline>
                <FormControl
                    componentClass="select"
                    value={pageSize}
                    onChange={(e) => this.onPageSizeChange(e.target.value)}
                    bsSize="sm"
                >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </FormControl> 件を表示
            </Form>
        );
    }

    /**
     * render
     */
    render() {
        const { unitTypes, edit, onDeleteClick, onAddClick } = this.props;
        const { currentPage, pageSize, checkedIds } = this.state;

        const displayUnitTypes = this.getDisplayUnitTypes(unitTypes);
        const currentPageUnitTypes = this.getCurrentPageUnitTypes(displayUnitTypes);

        return (
            <div>
                {edit &&
                    <ButtonToolbar className="pull-left">
                        <Button iconId="delete" onClick={() => onDeleteClick(checkedIds)} disabled={checkedIds.length === 0}>削除</Button>
                        <Button iconId="add" onClick={() => onAddClick()}>追加</Button>
                    </ButtonToolbar>
                }
                <div className="pull-right">
                    {this.makeDisplayLengthSelectForm()}
                </div>
                <div>
                    <DataTable hover responsive isSinplified striped
                        currentPage={currentPage}
                        pageSize={pageSize}
                        totalItemCount={(displayUnitTypes && displayUnitTypes.length) || 0}
                        onPageClick={(no) => this.onPageClick(no)}
                    >
                        {this.makeHeader()}
                        {this.makeBody(currentPageUnitTypes)}
                    </DataTable>
                </div>
            </div>
        );
    }
}

UnitTypeList.propTypes = {
    unitTypes: PropTypes.array,
    edit: PropTypes.bool,
    onEditClick: PropTypes.func,
    onDeleteClick: PropTypes.func,
    onAddClick: PropTypes.func,
    onSelect: PropTypes.func
}

UnitTypeList.defaultProps = {
    unitTypes: [],
    edit: false,
    onEditClick: () => { },
    onDeleteClick: () => { },
    onAddClick: () => { },
    onSelect: () => { }
}