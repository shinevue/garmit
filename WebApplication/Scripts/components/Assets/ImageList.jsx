'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { ButtonToolbar, Image, Form, FormControl, Checkbox } from 'react-bootstrap';

import DataTable from 'Common/Widget/DataTable';
import TextForm from 'Common/Form/TextForm';
import SelectForm from 'Common/Form/SelectForm';
import Icon from 'Common/Widget/Icon';
import Button from 'Common/Widget/Button';

const IMAGE_TABLE_HEADER = {
    type: { name: '種別', enableSort: true, filter: 'select' },
    name: { name: '名称', enableSort: true, filter: 'text' },
    fileName: { name: 'ファイル名', enableSort: true, filter: 'text' },
    image: { name: '画像', enableSort: false, filter: '' },
    rearFlg: { name: '前面/背面', enableSort: true, filter: 'select' }
};

/**
 * 画像一覧
 * @param {Array} unitImages
 */
export default class ImageList extends Component {

    constructor() {
        super();
        this.state = {
            currentPage: 1,
            pageSize: 10,
            sort: {
                key: 'type',
                isAsc: true
            },
            filter: {},
            checkedIds: []
        };
    }

    /**
     * コンポーネントが新しいpropsを受け取ったとき
     * @param {any} nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(nextProps.unitImages) !== JSON.stringify(this.props.unitImages)) {
            this.setState({ checkedIds: [] });

            const displayData = this.getDisplayData(nextProps.unitImages);
            // 現在のページに表示する行がない場合
            if (displayData.length < (this.state.currentPage - 1) * this.state.pageSize) {
                const lastPage = Math.ceil(displayData.length / this.state.pageSize);
                this.setState({ currentPage: lastPage });   // 表示するページを最後のページにする
            }
        }
        if (nextProps.selectedImage && nextProps.selectedImage !== this.props.selectedImage) {
            const displayData = this.getDisplayData(nextProps.unitImages);
            const selectedImageIndex = displayData.findIndex((data) => data.imageId === nextProps.selectedImage.imageId);
            const selectedImagePage = Math.ceil((selectedImageIndex + 1) / this.state.pageSize);
            if (selectedImagePage !== this.state.currentPage) {
                this.setState({ currentPage: selectedImagePage });
            }
        }
    }

    /**
     * ソートアイコンがクリックされた時
     * @param {any} key
     */
    onSortClick(key) {
        const { sort } = this.state;
        this.setState({ sort: { key: key, isAsc: key === sort.key ? !sort.isAsc : true } }, () => {
            this.uncheckHiddenRows();
            this.unselectHiddenRow();
        });
    }

    /**
     * フィルターの値が変化したとき
     * @param {any} val
     * @param {any} key
     */
    onFilterChange(val, key) {
        const newFilter = Object.assign({}, this.state.filter);
        newFilter[key] = val;
        this.setState({ filter: newFilter, currentPage: 1 }, () => {
            this.uncheckHiddenRows();
            this.unselectHiddenRow();
        });
    }

    /**
     * ページがクリックされた時
     * @param {any} no ページ番号
     */
    onPageClick(no) {
        this.setState({ currentPage: no, checkedIds: [] }, () => {
            this.props.onSelect(null);
        });
    }

    /**
     * ページサイズが変更された時
     * @param {any} size
     */
    onPageSizeChange(size) {
        this.setState({ pageSize: size, currentPage: 1 }, () => {
            this.uncheckHiddenRows();
            this.unselectHiddenRow();
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
        const displayedData = this.getDisplayData(this.props.unitImages);
        const currentPageData = this.getCurrentPageData(displayedData);
        
        const newcheckedIds = checkedIds.filter((id) => currentPageData.some((data) => data.imageId === id));
        this.setState({ checkedIds: newcheckedIds });
    }

    /**
     * 現在のページに選択行がない場合は選択を外す
     */
    unselectHiddenRow() {
        if (this.props.selectedImage) {
            const currentPageData = this.getCurrentPageData(this.getDisplayData(this.props.unitImages));
            if (!currentPageData.some((data) => data.imageId === this.props.selectedImage.imageId)) {
                this.props.onSelect(null);
            }
        }
    }

    /**
     * 現在の表示ページの行IDを取得する
     */
    getCurrentPageRowIds() {
        const currentPageData = this.getCurrentPageData(this.getDisplayData(this.props.unitImages));
        return currentPageData.map((data) => data.imageId);
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
     * 表示するデータの配列を生成する
     * @param {any} unitImages
     */
    makeDataArray(unitImages) {
        return unitImages.map((image) => ({
            imageId: image.imageId,
            type: image.type.name,
            name: image.name,
            fileName: image.fileName,
            image: <Image src={image.url} style={{ maxWidth: 250 }} thumbnail />,
            rearFlg: image.rearFlg ? '背面' : '前面'
        }));
    }

    /**
     * データを絞り込む
     * @param {any} datas
     */
    filterData(datas) {
        const { filter } = this.state;
        return datas.filter((data) => {
            for (let key of Object.keys(filter)) {
                if (IMAGE_TABLE_HEADER[key].filter === 'text') {
                    if (filter[key].length) {
                        const searchStrings = filter[key].split(/[\s　]+/);    // OR検索
                        const match = (searchStrings.find((str) => data[key].indexOf(str) >= 0) !== undefined)
                        if (!match) return false;
                    }
                } else {
                    if (filter[key] != -1) {
                        if (data[key] != filter[key]) return false;
                    }
                }
            }
            return true;
        });
    }

    /**
     * データをソートする
     * @param {any} datas
     */
    sortData(datas) {
        const { key, isAsc } = this.state.sort;

        const sortedData = datas.slice();
        sortedData.sort((a, b) => {
            if (a[key] < b[key]) return isAsc ? -1 : 1;
            if (a[key] > b[key]) return isAsc ? 1 : -1;
            return 0;
        });

        return sortedData;
    }

    /**
     * 表示する全てのデータを取得する
     */
    getDisplayData(unitImages) {
        if (!unitImages || !unitImages.length) {
            return [];
        }

        // テーブルで扱いやすい形に変換
        const data = this.makeDataArray(unitImages);
        // カラムフィルターで絞り込む
        const filteredData = this.filterData(data);
        // ソートする
        const sortedData = this.sortData(filteredData);

        return sortedData;
    }

    /**
     * 現在のページに表示するデータを取得する
     * @param {any} data
     */
    getCurrentPageData(data) {
        if (!data || !data.length) {
            return [];
        }

        const { currentPage, pageSize } = this.state;
        const first = (currentPage - 1) * pageSize;
        const last = (currentPage * pageSize) < data.length ? (currentPage * pageSize) : data.length;
        const currentPageData = [];
        for (let i = first; i < last; i++) {
            currentPageData.push(data[i]);
        }
        return currentPageData;
    }

    /**
     * unitImageを取得する
     * @param {any} imageId
     */
    getUnitImage(imageId) {
        return this.props.unitImages.find((unitImage) => unitImage.imageId === imageId);
    }

    /**
     * ヘッダーを生成する
     */
    makeHeader() {
        const { edit } = this.props;
        const { sort, filter } = this.state; 
        
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

        for (let key of Object.keys(IMAGE_TABLE_HEADER)) {
            headerCells.push(
                <DataTable.HeaderCell
                    className="va-t"
                    sorted={sort.key === key && (sort.isAsc ? 'asc' : 'desc')}
                    invalidSorting={!IMAGE_TABLE_HEADER[key].enableSort}
                    onClick={() => this.onSortClick(key)}
                >
                    <span>{IMAGE_TABLE_HEADER[key].name}</span>
                    {IMAGE_TABLE_HEADER[key].filter === 'text' &&
                        <TextForm
                            className="mb-0 normalText"
                            minWidth={80}
                            value={filter[key]}
                            onChange={(val) => this.onFilterChange(val, key)}
                            bsSize="sm"
                        />
                    }
                    {IMAGE_TABLE_HEADER[key].filter === 'select' &&
                        <SelectForm
                            className="mb-0 normalText"
                            minWidth={80}
                            options={this.makeFilterOptions(key)}
                            value={filter[key]}
                            onChange={(val) => this.onFilterChange(val, key)}
                            bsSize="sm"
                            placeholder="すべて"
                        />
                    }
                </DataTable.HeaderCell>
            );
        }

        return (
            <DataTable.Header>
                <DataTable.Row>{headerCells}</DataTable.Row>
            </DataTable.Header>
        );
    }

    /**
     * フィルターのオプションを生成する
     * @param {any} key
     */
    makeFilterOptions(key) {
        const data = this.makeDataArray(this.props.unitImages);
        let options = data.map((item) => item[key]);
        // 重複を取り除く
        options = options.filter((item, i, self) => self.indexOf(item) === i);
        // オプションの配列の形にする
        options = options.map((item) => ({ value: item, name: item }));

        return options;
    }

    /**
     * ボディを生成する
     * @param {any} data
     */
    makeBody(data) {
        if (!data || !data.length) {
            return (
                <DataTable.Body>
                    <DataTable.Row>
                        <DataTable.Cell
                            className="ta-c"
                            colspan={Object.keys(IMAGE_TABLE_HEADER).length + (this.props.edit ? 2 : 0)}
                        >
                            <span>ユニット画像がありません</span>
                        </DataTable.Cell>
                    </DataTable.Row>
                </DataTable.Body>
            );
        }

        return (
            <DataTable.Body>{data.map((rowData) => this.makeRow(rowData))}</DataTable.Body>
        );
    }

    /**
     * Rowを生成する
     * @param {any} rowData
     */
    makeRow(rowData) {
        const { edit, selectedImage } = this.props;
        const cells = [];
        const selected = (selectedImage && selectedImage.imageId === rowData.imageId);

        if (edit) {
            const checked = this.state.checkedIds.indexOf(rowData.imageId) >= 0;
            cells.push(
                <DataTable.Cell>
                    <Checkbox
                        className="ta-c"
                        checked={checked}
                        onClick={() => this.onCheckChange(!checked, rowData.imageId)}
                    />
                </DataTable.Cell>
            );
            cells.push(
                <DataTable.Cell style={{ whiteSpace: 'nowrap' }}>
                    <Icon
                        className="icon-garmit-edit hover-icon"
                        onClick={() => this.props.onEditClick(this.getUnitImage(rowData.imageId))}
                    />
                    <Icon
                        className="icon-garmit-delete hover-icon"
                        onClick={() => this.props.onDeleteClick([this.props.unitImages.find((img) => img.imageId === rowData.imageId)])}
                    />
                </DataTable.Cell>
            );
        }

        for (let key of Object.keys(IMAGE_TABLE_HEADER)) {
            cells.push(<DataTable.Cell><span>{rowData[key]}</span></DataTable.Cell>);
        }

        return (
            <DataTable.Row
                className={selected && 'datatable-select-row'}
                onClick={!selected && (() => this.props.onSelect(this.getUnitImage(rowData.imageId)))}
            >
                {cells}
            </DataTable.Row>    
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
     * チェックされているユニット画像リストを取得
     */
    getCheckedUnitImages() {
        return this.state.checkedIds.map((id) => this.props.unitImages.find((image) => image.imageId === id));
    }

    /**
     * render
     */
    render() {
        const { unitImages, select, edit, onDeleteClick, onAddClick, striped } = this.props;
        const { currentPage, pageSize, checkedIds } = this.state;

        const displayData = this.getDisplayData(unitImages);
        const currentPageData = this.getCurrentPageData(displayData);

        return (
            <div>
                {edit &&
                    <ButtonToolbar className="pull-left">
                        <Button iconId="delete" onClick={() => onDeleteClick(this.getCheckedUnitImages())} disabled={checkedIds.length === 0}>削除</Button>
                        <Button iconId="add" onClick={() => onAddClick()}>追加</Button>
                    </ButtonToolbar>
                }
                <div className="pull-right">
                    {this.makeDisplayLengthSelectForm()}
                </div>
                <div>
                    <DataTable hover responsive
                        striped={striped}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        totalItemCount={(displayData && displayData.length) || 0}
                        onPageClick={(no) => this.onPageClick(no)}
                    >
                        {this.makeHeader()}
                        {this.makeBody(currentPageData)}
                    </DataTable>
                </div>
            </div>
        );
    }
}

ImageList.propTypes = {
    unitImages: PropTypes.array,
    edit: PropTypes.bool,
    onEditClick: PropTypes.func,
    onDeleteClick: PropTypes.func,
    onAddClick: PropTypes.func,
    onSelect: PropTypes.func
}

ImageList.defaultProps = {
    unitImages: [],
    edit: false,
    onEditClick: () => { },
    onDeleteClick: () => { },
    onAddClick: () => { },
    onSelect: () => { }
}