/**
 * @license Copyright 2018 DENSO
 * 
 * UnitPowerList Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ButtonToolbar, Checkbox, Form, FormControl } from 'react-bootstrap';

import DataTable from 'Common/Widget/DataTable';
import MessageModal from 'Assets/Modal/MessageModal';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import { SORT_TYPE } from 'sortCompare';
import { changeNumbarFormat, convertNumber } from 'numberUtility';
import { getCurrentPageRows } from 'dataTableUtility';

const CST_INITAIL_PAGE_SIZE = 5;
const MAX_UNITPOWER_COUNT = 10;

/**
 * ユニット電源割り当て一覧コンポーネント
 * @param {string} id ユニットID
 * @param {array} unitPowers ユニット電源リスト
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {function} onDelete ユニット電源削除時に呼び出す
 * @param {function} onEdit ユニット電源編集時に呼び出す
 * @param {function} onAdd 追加ボタン押下時に呼び出す
 */
export default class UnitPowerList extends Component {
    
    /**
     * ソートの初期値
     */
    static get INITIAL_SORT() {
        return {
            type: SORT_TYPE.asc,
            columnKey: 'unitPsNo'
        };
    } 

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { 
            allChecked: false,
            currentPageNo: 1,
            currentPagePowers: [],
            confirmModal: {
                show: false,
                message: '',
                callback: null
            },
            sort: UnitPowerList.INITIAL_SORT,
            pageSize: CST_INITAIL_PAGE_SIZE
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const { id, unitPowers, isReadOnly } = nextProps;
        if (id != this.props.id) {
            this.setState({
                    allChecked: false,
                    currentPageNo: 1,
                    sort: UnitPowerList.INITIAL_SORT,
                    pageSize: CST_INITAIL_PAGE_SIZE                
                },
                () => this.sortCurrentPage(true)
            );
        } else if (isReadOnly != this.props.isReadOnly) {
            var sort = this.state.sort;
            if (isReadOnly && ['power', 'useConf'].indexOf(sort.columnKey) >= 0) {
                sort = UnitPowerList.INITIAL_SORT;
            }

            this.setState({
                    allChecked: false,
                    sort: sort,
                }, 
                () => this.sortCurrentPage(true)
            );
        } else if (unitPowers !== this.props.unitPowers || unitPowers.length !== this.props.unitPowers.length) {
            const { currentPageNo, pageSize } = this.state;
            const currentPagePowers = this.getCurrentPagePowers(unitPowers, currentPageNo, pageSize);
            this.setState({
                currentPageNo: currentPageNo,
                currentPagePowers: currentPagePowers,
                isAllChecked: this.isAllChecked(currentPagePowers)
            });
        }
    }

    /**
     * render
     */
    render() {
        const { unitPowers, isReadOnly } = this.props;  
        const { confirmModal, currentPagePowers } = this.state;     
        return (
            <div>
                {(!isReadOnly)&&
                    <ButtonToolbar className="mb-05 pull-left">
                        <Button iconId="delete" 
                                bsSize="sm"
                                disabled={currentPagePowers && !currentPagePowers.some((power) => power.checked)}
                                onClick={() => this.showConfirmModal(true)} >削除 
                        </Button>
                        <Button iconId="add" 
                                bsSize="sm"
                                disabled={unitPowers ? unitPowers.length >= MAX_UNITPOWER_COUNT : true}
                                onClick={() => this.handleAdd()} >追加
                        </Button>
                    </ButtonToolbar>
                }
                <div className="pull-right">
                    {this.makePageSizeSelectForm()}
                </div>
                {this.makeUnitPowerList()}
                {(!isReadOnly)&&
                    <MessageModal show={confirmModal.show} 
                                  title='確認' 
                                  bsSize='small'
                                  buttonStyle='confirm' 
                                  onOK={() => { confirmModal.callback ? confirmModal.callback() : this.hideConfirmModal() }} 
                                  onCancel={() => this.hideConfirmModal()} >
                                  <div>{confirmModal.message}</div>
                    </MessageModal>
                }
            </div>
        );
    }

    /**
     * 電源割り当て一覧を作成する
     */
    makeUnitPowerList() {
        const { unitPowers, isReadOnly } = this.props;
        const { currentPageNo, allChecked, currentPagePowers, pageSize, sort } = this.state;
        const hasPowers = this.hasPowers(currentPagePowers);

        return (
            <DataTable totalItemCount={unitPowers ? unitPowers.length :0} 
                    currentPage={currentPageNo} 
                    pageSize={pageSize} 
                    responsive
                    hover
                    noFooter={!hasPowers}
                    onPageClick={(pageNo) => this.handlePageChanged(pageNo)}>
                <DataTable.Header>
                    <DataTable.Row>
                        {!isReadOnly&&
                            <DataTable.HeaderCell invalidSorting>
                                <Checkbox
                                    bsClass="flex-center" 
                                    checked={allChecked}
                                    disabled={!(unitPowers && unitPowers.length > 0)}
                                    onChange={(e) => this.changeAllChecked(e.target.checked)}
                                />
                            </DataTable.HeaderCell>
                        }
                        {!isReadOnly &&
                            <DataTable.HeaderCell invalidSorting></DataTable.HeaderCell>
                        }                        
                        <DataTable.HeaderCell onClick={() => this.handleSortClick('unitPsNo')}
                                              sorted={sort.columnKey === 'unitPsNo' && sort.type}>電源番号
                        </DataTable.HeaderCell>
                        <DataTable.HeaderCell onClick={() => this.handleSortClick('rackPower')}
                                              sorted={sort.columnKey === 'rackPower' && sort.type}>ラック電源
                        </DataTable.HeaderCell>
                        <DataTable.HeaderCell onClick={() => this.handleSortClick('outlet')}
                                              sorted={sort.columnKey === 'outlet' && sort.type}>アウトレット番号
                        </DataTable.HeaderCell>
                        {!isReadOnly&&
                            <DataTable.HeaderCell onClick={() => this.handleSortClick('power')}
                                                  sorted={sort.columnKey === 'power' && sort.type}>消費電力(W)
                            </DataTable.HeaderCell>
                        }
                        {!isReadOnly&&
                            <DataTable.HeaderCell onClick={() => this.handleSortClick('useConf')}
                                                  sorted={sort.columnKey === 'useConf' && sort.type}>補正値
                            </DataTable.HeaderCell>
                        }
                        <DataTable.HeaderCell onClick={() => this.handleSortClick('powerkVA')}
                                              sorted={sort.columnKey === 'powerkVA' && sort.type}>電力値(kVA)
                        </DataTable.HeaderCell>
                    </DataTable.Row>
                </DataTable.Header>
                <DataTable.Body>
                    {hasPowers ?
                        currentPagePowers.map((item, index) => 
                            <DataRow power={item} 
                                     isReadOnly={isReadOnly} 
                                     onChangeChecked={(v) => this.changeItemChecked(v, item.unitPsNo)} 
                                     onEdit={() => this.handleEdit(item)}
                                     onDelete={() => this.showConfirmModal(false, item)}
                            /> 
                        )
                    :
                        <DataTable.Row>
                            <DataTable.Cell colspan={isReadOnly?3:6}>
                                電源設定がありません
                            </DataTable.Cell>
                        </DataTable.Row>
                    }
                </DataTable.Body>                    
            </DataTable>
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
                    onChange={(e) => this.handlePageSizeChanged(e.target.value)}
                >
                    <option value="5">5</option>
                    <option value="10">10</option>
                </FormControl> 件を表示
            </Form>
        );
    }

    /********************************************
     * イベント
     ********************************************/
    
    /**
     * ページ変更イベント
     * @param {number} pageNo ページ番号
     */
    handlePageChanged(pageNo) {
        this.setState({ 
            currentPageNo: pageNo, 
            allChecked: false, 
            currentPagePowers: this.getCurrentPagePowers(this.props.unitPowers, pageNo, this.state.pageSize)
        });
    }

    
    /**
     * ページサイズが変更された時
     * @param {string} size ページサイズ
     */
    handlePageSizeChanged(size) {
        const currentPagePowers = this.getCurrentPagePowers(this.props.unitPowers, 1, convertNumber(size));
        this.setState({ 
            pageSize: size, 
            currentPageNo: 1 ,
            currentPagePowers: currentPagePowers,
            allChecked: this.isAllChecked(currentPagePowers)
        });
    }

    /**
     * チェック状態変更イベント
     * @param {boolean} checked 変更後のチェック状態
     * @param {number} unitPsNo チェック変更したユニット電源番号
     */
    changeItemChecked(checked, unitPsNo) {
        var workPowers = JSON.parse(JSON.stringify(this.state.currentPagePowers));
        var item = workPowers.find((i) => i.unitPsNo === unitPsNo);
        item.checked = checked;
        this.setState({allChecked: this.isAllChecked(workPowers), currentPagePowers: workPowers});
    }

    /**
     * 全チェックする
     * @param {boolean} checked 変更後のチェック状態
     */
    changeAllChecked(checked){
        const workPowers = JSON.parse(JSON.stringify(this.state.currentPagePowers));
        workPowers.forEach((power) => {
            power.checked = checked;
        });
        this.setState({allChecked: checked, currentPagePowers: workPowers});
    }

    /**
     * チェックされたユニット電源を削除する
     */
    deleteCheckdUnitPower() {
        var workPowers = Object.assign([], this.props.unitPowers);
        workPowers = workPowers.filter((power) => {
            const workPower = this.state.currentPagePowers.find((p) => p.unitPsNo === power.unitPsNo);
            if (workPower) {
                return workPower.checked;
            }
            return false;
        });
        this.setState({ allChecked: false }, () => this.hideConfirmModal());
        this.props.onDelete(workPowers);
    }

    /**
     * ユニット電源を削除する
     * @param {object} power ユニット電源
     */
    deleteUnitPower(unitPower) {
        var workPowers = Object.assign([], this.props.unitPowers);
        workPowers = workPowers.filter((power) => {
            return !(power.unitPsNo === convertNumber(unitPower.unitPsNo));
        });
        this.setState({ allChecked: this.isAllChecked(workPowers)}, () => this.hideConfirmModal());
        this.props.onDelete([ unitPower ]);
    }

    /**
     * 追加ボタン押下イベント
     */
    handleAdd(){
        if (this.props.onAdd) {
            this.props.onAdd();
        }
    }

    /**
     * 編集ボタン押下イベント
     * @param {number} unitPsNo 
     */
    handleEdit(power) {
        if (this.props.onEdit) {
            this.props.onEdit(power);
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
        this.setState({ sort: newSort }, () => this.sortCurrentPage());
    }
    
    /**
     * 全てチェックされているかどうか
     * @param {array} list 対象のリスト 
     */
    isAllChecked(list) {
        return list&&list.length>0 ? list.every((item) => item.checked === true) : false;
    }

    /********************************************
     * モーダル表示変更
     ********************************************/

    /**
     * 確認メッセージを閉じる
     */
    hideConfirmModal() {
        this.setState({confirmModal: { show: false, callback: null, message: '' }});
    }

    /**
     * 確認メッセージを表示する
     * @param {boolean} isMultiple 複数かどうか
     * @param {object} power 削除対象の電源
     */
    showConfirmModal(isMultiple, power) {
        var obj =  Object.assign({}, this.state.confirmModal);
        obj.show = true;
        if (isMultiple) {
            obj.callback = () => this.deleteCheckdUnitPower();
            obj.message = 'チェックされた電源を削除します。よろしいですか？';
        } else {
            obj.callback = () => this.deleteUnitPower(power);
            obj.message = '電源を削除します。よろしいですか？';
        }
        this.setState({ confirmModal: obj });
    }

    /********************************************
     * その他の関数
     ********************************************/
    
    /**
     * 指定のユニット電源が表示されたページを取得する
     * @param {array} powers 電源一覧
     * @param {object} targetPower 対象の電源
     * @param {number} pageSize ページサイズ
     * @returns {number} ページ番号
     */
    getPageNo(powers, targetPower, pageSize) {
        powers = powers.sort((current, next) => this.compareAscendingPower(current, next));
        const workPowers = powers && powers.length > 0 ? JSON.parse(JSON.stringify(powers)) : [];
        const MaxPageNo = workPowers.length / pageSize + (workPowers.length % pageSize > 0 ? 1 : 0);
        var pageNo = 1;
        for (let index = 1; index <= MaxPageNo; index++) {
            const currentPowers = getCurrentPageRows(workPowers, index, pageSize);
            if (currentPowers.some((item) => item.unitPsNo === targetPower.unitPsNo)) {
                pageNo = index;
                break;
            }
        }
        return pageNo;
    }


    /**
     * 現在のページに表示する電源に絞り込む
     * @param {array} powers 電源一覧
     * @param {number} pageNo 表示するページ番号
     * @param {number} pageSize ページサイズ
     * @param {boolean} isReset リセットするかどうか
     * @returns {array} 現在のページに表示する電源リスト
     */
    getCurrentPagePowers(powers, pageNo, pageSize, isReset) {
        const { currentPagePowers, sort } = this.state;

        var workPowers = powers.sort((current, next) => this.compareSortPower(current, next, sort));
        
        workPowers = workPowers && workPowers.length > 0 ? JSON.parse(JSON.stringify(workPowers)) : [];
        var currnetPowers = getCurrentPageRows(workPowers, pageNo, pageSize);
        if (!isReset) {
            currnetPowers.forEach((power) => {
                power.checked = currentPagePowers.some(p => p.unitPsNo === power.unitPsNo && p.checked);         //もともとチェックの入っていたものはチェックを入れておく
            });
        }
        return currnetPowers;
    }

    /**
     * ユニット電源を並び替える場合に現在と次の値を比較する
     * @param {object} current 現在の値
     * @param {object} next 次の値
     * @param {object} sort ソート情報
     * @param {number} 比較結果（現在の方が大きいor小さい：1、現在の方が小さいor小さい：-1、同じ：0） 
     */
    compareSortPower(current, next, sort) {
        var currentValue;
        var nextValue;

        switch (sort.columnKey) {
            case 'rackPower':
                currentValue = current.rackPower.name;
                nextValue = next.rackPower.name;
                break;
        
            case 'outlet':
                currentValue = current.outlet.outletNo;
                nextValue = next.outlet.outletNo;
                break;

            case 'powerKVA':
                currentValue = current.power.power * current.power.useConf * 0.001;
                nextValue = next.power.power * next.power.useConf * 0.001;
                break;

            default:
                currentValue = convertNumber(current[sort.columnKey]);
                nextValue = convertNumber(next[sort.columnKey]);
                break;
        }
        
        if (currentValue < nextValue) {
            return (sort.type === SORT_TYPE.asc) ? -1 : 1;
        } else if (currentValue > nextValue) {
            return (sort.type === SORT_TYPE.asc) ? 1 : -1;
        }
        
        return 0;
    }
    
    /**
     * 電源があるかどうか
     * @param {*} powers 
     */
    hasPowers(powers) {
        if (powers && powers.length > 0) {
            return true;
        }
        return false;
    }

    /**
     * 削除イベントを呼び出す
     * @param {array} unitPowers 削除対象のユニット電源リスト
     */
    onDelete(unitPowers) {
        if (this.props.onDelete) {
            this.props.onDelete(unitPowers);
        }
    }

    /**
     * 現在のページをソートする
     * @param {boolean} isReset リセットするかどうか
     */
    sortCurrentPage(isReset) {
        const currentPagePowers = this.getCurrentPagePowers(this.props.unitPowers, this.state.currentPageNo, this.state.pageSize, isReset);
        this.setState({ 
            currentPagePowers: currentPagePowers,
            allChecked: this.isAllChecked(currentPagePowers)
        });
    }
}

/**
 * 一行分のデータ
 * @param {object} power ユニット電源情報
 * @param {boolean} isSelected 選択されているかどうか
 * @param {boolean} isReadOnly 読み取り専用かどうか
 */
class DataRow extends Component {

    render(){
        const { power, isReadOnly } = this.props;
        return (
            <DataTable.Row >
                {!isReadOnly&&
                    <DataTable.Cell>
                        <Checkbox checked={power.checked} 
                                  bsClass="flex-center" 
                                  onChange={(e) => this.handleChangeChecked(e.target.checked, power.unitPsNo)} />
                    </DataTable.Cell>
                }
                {!isReadOnly &&
                    <DataTable.Cell>
                        <Icon
                            className="hover-icon icon-garmit-edit"
                            onClick={() => this.props.onEdit()}
                        />
                        <Icon
                            className="hover-icon icon-garmit-delete"
                            onClick={() => this.props.onDelete()}
                        />
                    </DataTable.Cell>
                }
                <DataTable.Cell>{power.unitPsNo}</DataTable.Cell>
                <DataTable.Cell>{power.rackPower.name}</DataTable.Cell>
                <DataTable.Cell>{power.outlet.outletNo}</DataTable.Cell>
                {!isReadOnly&&
                    <DataTable.Cell>{power.power}</DataTable.Cell>
                }
                {!isReadOnly&&
                    <DataTable.Cell>{changeNumbarFormat(power.useConf, 5)}</DataTable.Cell>
                }
                <DataTable.Cell>{changeNumbarFormat(power.power * power.useConf * 0.001, 3)}</DataTable.Cell>
            </DataTable.Row>
        );
    }

    /**
     * チェック状態の変更イベント
     * @param {boolean} checked チェック状態
     */
    handleChangeChecked(checked) {
        if (this.props.onChangeChecked){
            this.props.onChangeChecked(checked);
        }
    }

    /**
     * 編集ボタン押下イベント
     */
    handleEdit() {
        if (this.props.onEdit) {
            this.props.onEdit();
        }
    }

    /**
     * 削除ボタン押下イベント
     */
    handleDelete() {
        if (this.props.onDelete) {
            this.props.onDelete();
        }
    }
}

UnitPowerList.propTypes = {
    id: PropTypes.string,
    unitPowers: PropTypes.arrayOf(PropTypes.shape({
        unitId: PropTypes.string.isRequired,
        unitPsNo: PropTypes.string.isRequired,
        outlet: PropTypes.shape({
            outletNo: PropTypes.number.isRequired,
        }),
        power: PropTypes.number.isRequired,
        useConf: PropTypes.number.isRequired,
        rackPower: PropTypes.shape({
            psNo: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired
        })
    })),
    isReadOnly: PropTypes.isReadOnly,
    onDelete: PropTypes.func,
    onEdit: PropTypes.func,
    onAdd: PropTypes.func
}

