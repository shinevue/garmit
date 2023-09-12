/**
 * @license Copyright 2018 DENSO
 * 
 * NetworkList Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'react-bootstrap';

import DataTable from 'Common/Widget/DataTable';
import Icon from 'Common/Widget/Icon';

import { stableSort, SORT_TYPE } from 'sortCompare';
import { getCurrentPageRows } from 'dataTableUtility';
import { LAVEL_TYPE, readOnlyByLevel } from 'authentication';
import { makePortNoCellString, makeUnitCellString, makeRackCellString, isAllowedEditNetwrok } from 'assetUtility';

const CST_INITAIL_PAGE_SIZE = 10;
const CST_SORT_COLUMNKEY = {
    rackFrom: 'rackFrom',
    unitFrom: 'unitFrom',
    portFrom: 'portFrom',
    rackTo: 'rackTo',
    unitTo: 'unitTo',
    portTo: 'portTo'    
};

/**
 * ネットワーク一覧コンポーネント
 * @param {array} networkPathRows ネットワーク経路一覧情報
 * @param {object} selectedNetworkRow 選択中のネットワーク情報
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {number} level 権限レベル
 * @param {function} onSelect ネットワーク選択時に呼び出される
 * @param {function} onEdit 編集ボタン押下時に呼び出される
 * @param {function} onDelete 削除ボタン押下時に呼び出される
 * @param {function} onChangeChecked チェック変更時に呼び出される
 */
export default class NetworkList extends Component {

    /**
     * ソートの初期値
     */
    static get INITIAL_SORT() {
        return {
            type: SORT_TYPE.asc,
            columnKey: CST_SORT_COLUMNKEY.rackFrom
        };
    } 

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = this.setInitialState(props.initialDisplayState);
        this.state.currentPageNetworkRows = this.sortCurrentPage(true);
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        this.sortCurrentPage(true);

        if (this.props.networkPathRows && this.props.networkPathRows.length > 0) {
            if (this.props.onChangeDisplayState) {
                this.props.onChangeDisplayState({
                        currentPageNo: this.state.currentPageNo,
                        sort: this.state.sort,
                        pageSize: this.state.pageSize,
                    },
                    this.getDisplayNetworks()
                );
            }
        }
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (JSON.stringify(nextProps.networkPathRows) !== JSON.stringify(this.props.networkPathRows)) {
                this.setState({
                    allChecked: false,
                    currentPageNo: 1,
                    sort: NetworkList.INITIAL_SORT,
                    pageSize: CST_INITAIL_PAGE_SIZE,
                },
                () => this.sortCurrentPage(true)
            );
        }
    }

    /**
     * render
     */
    render() {
        const { networkPathRows, selectedNetworkRow, isReadOnly, level } = this.props;
        const { currentPageNo, allChecked, currentPageNetworkRows, pageSize, sort } = this.state;
        const hasNetworks = this.hasNetworks(currentPageNetworkRows);

        return (
            <DataTable 
                totalItemCount={networkPathRows ? networkPathRows.length : 0} 
                currentPage={currentPageNo}
                pageSize={pageSize}
                responsive 
                hover 
                striped
                noFooter={!hasNetworks}
                onPageClick={(pageNo) => this.handlePageChanged(pageNo)}>
                <DataTable.Header>
                    <DataTable.Row>
                        {!readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.manager)&&
                            <DataTable.HeaderCell invalidSorting>
                                <Checkbox bsClass="flex-center" 
                                        checked={allChecked}
                                        disabled={!(networkPathRows && networkPathRows.length > 0)}
                                        onChange={(e) => this.changeAllChecked(e.target.checked)}
                                />
                            </DataTable.HeaderCell>
                        }
                        {!isReadOnly&&
                            <DataTable.HeaderCell invalidSorting/>
                        }
                        <DataTable.HeaderCell invalidSorting/>
                        <DataTable.HeaderCell onClick={() => this.handleSortClick(CST_SORT_COLUMNKEY.rackFrom)}
                                              sorted={sort.columnKey === CST_SORT_COLUMNKEY.rackFrom && sort.type}>接続元ラック
                        </DataTable.HeaderCell>
                        <DataTable.HeaderCell onClick={() => this.handleSortClick(CST_SORT_COLUMNKEY.unitFrom)}
                                              sorted={sort.columnKey === CST_SORT_COLUMNKEY.unitFrom && sort.type}>接続元ユニット
                        </DataTable.HeaderCell>
                        <DataTable.HeaderCell onClick={() => this.handleSortClick(CST_SORT_COLUMNKEY.portFrom)}
                                              sorted={sort.columnKey === CST_SORT_COLUMNKEY.portFrom && sort.type}>ポート
                        </DataTable.HeaderCell>
                        <DataTable.HeaderCell onClick={() => this.handleSortClick(CST_SORT_COLUMNKEY.rackTo)}
                                              sorted={sort.columnKey === CST_SORT_COLUMNKEY.rackTo && sort.type}>接続先ラック
                        </DataTable.HeaderCell>
                        <DataTable.HeaderCell onClick={() => this.handleSortClick(CST_SORT_COLUMNKEY.unitTo)}
                                              sorted={sort.columnKey === CST_SORT_COLUMNKEY.unitTo && sort.type}>接続先ユニット
                        </DataTable.HeaderCell>
                        <DataTable.HeaderCell onClick={() => this.handleSortClick(CST_SORT_COLUMNKEY.portTo)}
                                              sorted={sort.columnKey === CST_SORT_COLUMNKEY.portTo && sort.type}>ポート
                        </DataTable.HeaderCell>
                    </DataTable.Row>
                </DataTable.Header>
                <DataTable.Body>
                    {hasNetworks ?
                        currentPageNetworkRows.map((item, index) => 
                            <DataRow isSelected={selectedNetworkRow?this.isMatchNetwork(item, selectedNetworkRow):false} 
                                     networkRow={item}
                                     isReadOnly={isReadOnly}
                                     level={level}
                                     onChangeChecked={(checked) => this.changeItemChecked(checked, item)} 
                                     onSelect={() => this.handleSelect(item)} 
                                     onEdit={() => this.handleEdit(item)}
                                     onDelete={() => this.handleDelete(item)}
                            /> 
                        )
                    :
                        <DataTable.Row>
                            <DataTable.Cell colspan={9}>
                                表示するデータがありません
                            </DataTable.Cell>
                        </DataTable.Row>
                    }
                </DataTable.Body>
            </DataTable>
        );
    }

    //#region イベント

    /********************************************
     * イベント
     ********************************************/
    
    /**
     * ページ変更イベント
     * @param {number} pageNo ページ番号
     */
    handlePageChanged(pageNo) {
        this.changeState({ 
            currentPageNo: pageNo, 
            allChecked: false, 
            currentPageNetworkRows: this.getCurrentPageNetworks(this.props.networkPathRows, pageNo, this.state.pageSize)
            },
            () => this.handleSelect(null, true)       //選択をクリアする
        );
    }
    
    /**
     * ネットワーク選択イベント
     * @param {object} networkRow 選択したネットワーク行情報
     * @param {boolean} isClearChecked チェックをクリアするか
     */
    handleSelect(networkRow, isClearChecked){
        if (this.props.onSelect){
            this.props.onSelect(networkRow, isClearChecked);
        }
    }

    /**
     * 編集ボタン押下イベント
     * @param {object} networkRow 編集するネットワーク行情報
     */
    handleEdit(networkRow){
        if (this.props.onEdit) {
            this.props.onEdit(networkRow)            
        }
    }

    /**
     * 削除ボタン押下イベント
     * @param {object} networkRow 削除するネットワーク行情報
     */
    handleDelete(networkRow){
        if (this.props.onDelete) {
            this.props.onDelete(networkRow)            
        }
    }

    /**
     * ソートアイコン押下イベント
     * @param {string} key キー
     */
    handleSortClick(key) {
        const newSort = {
            columnKey: key,
            type: (key !== this.state.sort.columnKey) ? SORT_TYPE.asc : ((this.state.sort.type === SORT_TYPE.asc) ? SORT_TYPE.desc : SORT_TYPE.asc)
        };
        this.changeState({ sort: newSort }, () => this.sortCurrentPage());
    }

    //#endregion

    //#region チェック変更関係

    /**
     * チェック変更イベント
     * @param {boolean} checked 変更後のチェック状態
     * @param {object} networkRow チェックを変更した対象ネットワーク情報
     */
    changeItemChecked(checked, networkRow) {
        var workNetworks = _.cloneDeep(this.state.currentPageNetworkRows);
        var item = workNetworks.find((i) => this.isMatchNetwork(i, networkRow));
        item.checked = checked;
        const checkedNetwork = workNetworks.filter((network) => network.checked);
        this.setState({allChecked: this.isAllChecked(workNetworks), currentPageNetworkRows: workNetworks},
                      () => this.onChangeChecked(checkedNetwork));
    }

    /**
     * 全チェックする
     * @param {boolean} checked 変更後のチェック状態
     */
    changeAllChecked(checked){
        const workNetworkRows = _.cloneDeep(this.state.currentPageNetworkRows);
        workNetworkRows.forEach((network) => {
            if (isAllowedEditNetwrok(network)) {
                network.checked = checked;
            }
        });
        const checkedNetwork = workNetworkRows.filter((network) => network.checked);
        this.setState({allChecked: checked, currentPageNetworkRows: workNetworkRows},
                      () => this.onChangeChecked(checkedNetwork));
    }

    //#endregion

    //#region その他

    /********************************************
     * その他関数
     ********************************************/

    /**
     * 現在のページに表示するネットワークに絞り込む
     * @param {array} networkRows ネットワーク経路一覧
     * @param {number} pageNo 表示するページ番号
     * @param {number} pageSize ページサイズ
     * @param {boolean} isReset リセットするかどうか
     * @returns {array} 現在のページに表示する電源リスト
     */
    getCurrentPageNetworks(networkRows, pageNo, pageSize, isReset) {
        const { currentPageNetworkRows, sort } = this.state;

        var workNetworkRows = stableSort(_.cloneDeep(networkRows), (current, next) => this.compareSortNetwork(current, next, sort));
        workNetworkRows = workNetworkRows && workNetworkRows.length > 0 ? workNetworkRows : [];

        var currnetNetworkRows = getCurrentPageRows(workNetworkRows, pageNo, pageSize);
        if (!isReset) {
            //もともとチェックの入っていたものはチェックを入れておく
            currnetNetworkRows.forEach((row) => {
                row.checked = currentPageNetworkRows.some(nw => (this.isMatchNetwork(nw, row) && nw.checked));
            });
        }
        return currnetNetworkRows;
    }    

    /**
     * 現在のページをソートする
     * @param {boolean} isReset リセットするかどうか
     */
    sortCurrentPage(isReset) {
        const { selectedNetworkRow } = this.props;
        const currentPageNetworkRows = this.getCurrentPageNetworks(this.props.networkPathRows, this.state.currentPageNo, this.state.pageSize, isReset);
        const includeSelected = currentPageNetworkRows.some((network) => selectedNetworkRow && this.isMatchNetwork(network, selectedNetworkRow));
        this.setState({ 
            currentPageNetworkRows: currentPageNetworkRows,
            allChecked: this.isAllChecked(currentPageNetworkRows)
            }, 
            () => !includeSelected && this.handleSelect(null)
        );
    }

    /**
     * ネットワークが一致しているかどうか
     * @param {object} target 対象のネットワーク情報
     * @param {object} source 比較するネットワーク情報
     */
    isMatchNetwork(target, source) {
        return (
            target.rackIdFrom === source.rackIdFrom &&
            target.unitIdFrom === source.unitIdFrom &&
            target.portSeqNoFrom === source.portSeqNoFrom &&
            target.portIndexFrom === source.portIndexFrom
        );
    }

    /**
     * ネットワークを並び替える場合に現在と次の値を比較する
     * @param {object} current 現在の値
     * @param {object} next 次の値
     * @param {object} sort ソート情報
     * @param {number} 比較結果（現在の方が大きいor小さい：1、現在の方が小さいor小さい：-1、同じ：0） 
     */
    compareSortNetwork(current, next, sort) {
        var currentValue;
        var nextValue;
        var currentThenValue;
        var nextThenValue;

        switch (sort.columnKey) {
            case CST_SORT_COLUMNKEY.rackFrom:
                currentValue = current.rackIdFrom ? current.rackNameFrom : '';
                nextValue = next.rackIdFrom ? next.rackNameFrom : '';
                break;
        
            case CST_SORT_COLUMNKEY.unitFrom:
                currentValue = current.unitIdFrom ? current.unitNameFrom : '';
                nextValue = next.unitIdFrom ? next.unitNameFrom : '';
                break;

            case CST_SORT_COLUMNKEY.portFrom:
                currentValue = current.portSeqNoFrom ? current.portNoFrom : 0;
                nextValue = next.portSeqNoFrom ? next.portNoFrom : 0;
                currentThenValue = current.portIndexFrom;
                nextThenValue = next.portIndexFrom;
                break;

            case CST_SORT_COLUMNKEY.rackTo:
                currentValue = current.rackIdTo ? current.rackNameTo : '';
                nextValue = next.rackIdTo ? next.rackNameTo : '';
                break;
        
            case CST_SORT_COLUMNKEY.unitTo:
                currentValue = current.unitIdTo ? current.unitNameTo : '';
                nextValue = next.unitIdTo ? next.unitNameTo : '';
                break;

            case CST_SORT_COLUMNKEY.portTo:
                currentValue = current.portSeqNoTo ? current.portNoTo : 0;
                nextValue = next.portSeqNoTo ? next.portNoTo : 0;
                currentThenValue = current.portIndexTo;
                nextThenValue = next.portIndexTo;
                break;
        }
        
        if (currentValue < nextValue) {
            return (sort.type === SORT_TYPE.asc) ? -1 : 1;
        } else if (currentValue > nextValue) {
            return (sort.type === SORT_TYPE.asc) ? 1 : -1;
        }

        if (currentThenValue && nextThenValue) {
            if (currentThenValue < nextThenValue) {
                return (sort.type === SORT_TYPE.asc) ? -1 : 1;
            } else if (currentThenValue > nextThenValue) {
                return (sort.type === SORT_TYPE.asc) ? 1 : -1;
            }
        }
        
        return 0;
    }

    /**
     * 全てチェックされているかどうか
     * @param {array} list 対象のリスト 
     */
    isAllChecked(list) {
        return list&&list.length>0 ? list.every((item) => !isAllowedEditNetwrok(item) || item.checked === true) : false;
    }

    /**
     * ネットワークがあるかどうか
     * @param {array} networkRows ネットワーク一覧
     */
    hasNetworks(networkRows) {
        if (networkRows && networkRows.length > 0) {
            return true;
        }
        return false;
    }

    /**
     * チェック変更関数を呼び出す
     * @param {array} networkRows チェックされたネットワーク一覧
     */
    onChangeChecked(networkRows) {
        if (this.props.onChangeChecked) {
            this.props.onChangeChecked(networkRows);
        }
    }
    
    /**
     * 初期stateをセットする
     * @param {object} displayState 表示設定状態
     */
    setInitialState(displayState) {
        var initialState = {
            currentPageNo: 1,
            sort: NetworkList.INITIAL_SORT,
            pageSize: CST_INITAIL_PAGE_SIZE
        }
        if (displayState) {
            initialState = displayState;
        }
        initialState.allChecked = false;
        initialState.currentPageNetworkRows = [];
        return initialState;
    }

    /**
     * stateを変更する。（setStateの代わりに代用）
     * @param {object} obj セットする オブジェクト
     * @param {function} callback setStateの後に呼び出す関数
     */
    changeState(obj, callback) {
        this.setState(obj, () => {
            if (callback) {
                callback();
            };
            if (this.props.onChangeDisplayState) {
                this.props.onChangeDisplayState({
                        currentPageNo: this.state.currentPageNo,
                        sort: this.state.sort,
                        pageSize: this.state.pageSize,
                    },
                    this.getDisplayNetworks()
                );
            }
        });
    }

    /**
     * 絞り込み、並び替え処理をした行を取得する
     */
    getDisplayNetworks() {
        if (!this.props.networkPathRows || this.props.networkPathRows.length === 0) {
            return [];
        }
        let networkRows = this.props.networkPathRows.slice();
        networkRows = this.getSortNetworks(networkRows);
        return networkRows;
    }

    /**
     * ソートしたネットワーク一覧を取得する
     * @param {*} networkRows 
     */
    getSortNetworks(networkRows) {
        const { sort } = this.state;
        var workNetworks = stableSort(_.cloneDeep(networkRows), (current, next) => this.compareSortNetwork(current, next, sort));
        workNetworks = workNetworks && workNetworks.length > 0 ? workNetworks : [];
        return workNetworks;
    }

    //#endregion
}


/**
 * 一行分のデータ
 * @param {object} networkRow ネットワーク行情報
 * @param {boolean} isSelected 選択されているかどうか
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {number} level 権限レベル
 */
class DataRow extends Component {

    render(){
        const { networkRow, isSelected, isReadOnly, level } = this.props;
        const hasNetwork = networkRow.networkId ? true : false;
        const isAllowed = isAllowedEditNetwrok(networkRow);
        return (
            <DataTable.Row className={'hover-target ' + (isSelected ? "datatable-select-row" : '') } >
                {!readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.manager)&&
                    <DataTable.Cell>
                        {isAllowed&&
                            <Checkbox checked={networkRow.checked} 
                                    bsClass="flex-center"
                                    onChange={(e) => this.handleChangeChecked(e.target.checked)} />
                        }
                    </DataTable.Cell>
                }
                {!isReadOnly&&
                    <DataTable.Cell>
                        {isAllowed&&
                            <div className="ta-c">
                                {(hasNetwork||!readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.operator))&&
                                    <Icon className='hover-icon icon-garmit-edit'
                                        onClick={() => this.handleEdit()} />
                                }
                                {!readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.manager)&&
                                    <Icon className='hover-icon icon-garmit-delete'
                                        onClick={() => this.handleDelete()} />
                                }
                            </div>
                        }
                    </DataTable.Cell>
                }
                <DataTable.Cell clickCell={()=>this.clickCell()}>
                    {networkRow.isBothSearchTarget&&networkRow.isRackToAllowed&&
                        <Icon className="pa-05 ta-c fal fa-circle text-red" />
                    }
                </DataTable.Cell>
                <DataTable.Cell clickCell={()=>this.clickCell()}>{networkRow.rackNameFrom}</DataTable.Cell>
                <DataTable.Cell clickCell={()=>this.clickCell()}>{networkRow.unitNameFrom}</DataTable.Cell>
                <DataTable.Cell clickCell={()=>this.clickCell()}>{makePortNoCellString(networkRow.portNoFrom, networkRow.portIndexFrom)}</DataTable.Cell>
                <DataTable.Cell clickCell={()=>this.clickCell()}>{makeRackCellString(networkRow.rackIdTo, networkRow.rackNameTo, networkRow.isRackToAllowed)}</DataTable.Cell>
                <DataTable.Cell clickCell={()=>this.clickCell()}>{makeUnitCellString(networkRow.unitIdTo, networkRow.unitNameTo, networkRow.isRackToAllowed)}</DataTable.Cell>
                <DataTable.Cell clickCell={()=>this.clickCell()}>{makePortNoCellString(networkRow.portNoTo, networkRow.portIndexTo, networkRow.isRackToAllowed)}</DataTable.Cell>
            </DataTable.Row>
        );
    }

    /**
     * チェック変更イベント
     * @param {boolean} checked 変更後のチェック状態
     */
    handleChangeChecked(checked, networkRow){
        if (this.props.onChangeChecked){
            this.props.onChangeChecked(checked, networkRow);
        }
    }

    /**
     * セルのクリックイベント
     */
    clickCell(){
        if (this.props.onSelect) {
            this.props.onSelect();
        }
    }

    /**
     * 編集アイコンクリックイベント
     */
    handleEdit(){
        if (this.props.onEdit) {
            this.props.onEdit()            
        }
    }
    
    /**
     * 削除アイコンクリックイベント
     */
    handleDelete(){
        if (this.props.onDelete) {
            this.props.onDelete()            
        }
    }    
}

NetworkList.propTypes = {
    networkPathRows: PropTypes.arrayOf(PropTypes.shape({
        networkId: PropTypes.number,
        networkName: PropTypes.string,
        rackIdFrom: PropTypes.string,
        rackNameFrom: PropTypes.string,
        locationNameFrom: PropTypes.string,
        unitIdFrom: PropTypes.string,
        unitNameFrom: PropTypes.string,
        portSeqNoFrom: PropTypes.number,
        portNoFrom: PropTypes.number,
        portIndexFrom: PropTypes.number,
        portNameFrom: PropTypes.string,
        rackIdTo: PropTypes.string,
        rackNameTo: PropTypes.string,
        locationNameTo: PropTypes.string,
        unitIdTo: PropTypes.string,
        unitNameTo: PropTypes.string,
        portSeqNoTo: PropTypes.number,
        portNoTo: PropTypes.number,
        portIndexTo: PropTypes.number,
        portNameTo: PropTypes.string,
        isRackToAllowed: PropTypes.bool.isRequired,
        isBothSearchTarget: PropTypes.bool.isRequired
    })),
    selectedNetworkRow: PropTypes.object,
    initialDisplayState: PropTypes.object,
    isReadOnly: PropTypes.bool,
    level: PropTypes.number,
    onSelect: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onChangeChecked: PropTypes.func,
    onChangeDisplayState: PropTypes.func
}