/**
 * Copyright 2017 DENSO Solutions
 * 
 * 一覧表示テーブル Reactコンポーネント
 * <ListDisplayTable />
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'react-bootstrap';
import { Table } from 'react-bootstrap';

/**
 * 一覧表示テーブル
 * <ListDisplayTable />
 */
export default class ListDisplayTable extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectRow: props.selected ? props.selected : null,
            checkRow: (props.checkRow || []),
            headerCheck: false,
            pageLength: 5
        };
    }

    /**********************************
    * 
    * ライフサイクルイベント
    * 
    **********************************/

    /**
     * コンポーネントがマウントされた直後に呼び出されるメソッド
     */
    componentDidMount() {
        this.setTable();
        
        if (this.props.useCheckbox && this.state.checkRow && this.state.checkRow.length > 0) {
            const checkRow = this.state.checkRow;
            const display = this.getDisplayRowIndex();
            const allChecked = _.size(_.pull(display, ...checkRow)) > 0 ? false : true;
            if (allChecked) {
                this.setState({ headerCheck: allChecked });
            }
        }
    }

    /**
     * コンポーネントがアップデートされた直後に呼び出される
     */
    componentWillReceiveProps(nextProps) {
        const id = "#" + this.props.id;
        if (JSON.stringify(nextProps.data) !== JSON.stringify(this.props.data)) {
            //拡張カラムのみが変更されたときは更新しない
            if (nextProps.data.length === this.props.data.length && 
                this.isChangeedExpandedCell(nextProps.data, this.props.data)) {
                return;
            }

            this.setState({ selectRow: null, checkRow: [], headerCheck: false });
            if ($.fn.DataTable.isDataTable(id)) {
                $(id).DataTable().destroy();    //一旦テーブル削除
            }
        }
        else if (this.props.isLoading && !nextProps.isLoading) { //ロードされるごとにテーブルの状態クリア
            this.setState({ selectRow: null, checkRow: [], headerCheck: false });
        }
        //初期選択行が変更されている場合
        if (this.props.selected !== nextProps.selected) {
            this.setState({ selectRow: nextProps.selected >= 0 ? nextProps.selected : null });
        }
        //初期チェック行が変更されている場合
        if (this.props.checked !== nextProps.checked) {
            const checkRow = (nextProps.checked || []);
            const display = this.getDisplayRowIndex();
            const allChecked = _.size(_.pull(display, ...checkRow)) > 0 ? false : true;
            this.setState({ checkRow: (nextProps.checked || null), headerCheck: allChecked });
        }
    }

    /**
     * コンポーネントがアップデートされた直後に呼び出される
     */
    componentDidUpdate(prevProps) {
        if (JSON.stringify(prevProps.data) !== JSON.stringify(this.props.data)) {
            if (!$.fn.DataTable.isDataTable("#" + this.props.id)) {
                this.setTable();
            }
        }
    }

    /**
     * コンポーネントをアップデートするかどうか
     */
    shouldComponentUpdate(nextProps, nextState) {
        if (JSON.stringify(nextProps.data) !== JSON.stringify(this.props.data)
            || JSON.stringify(nextProps.headerSet) !== JSON.stringify(this.props.headerSet)) {
            //データもしくはヘッダー情報が更新されている場合
            return true;
        }
        else if (nextProps.isLoading !== this.props.isLoading) {
            //ロード状態が変更された場合
            return true;
        }
        else if (nextState !== this.state) {
            //stateが更新された場合（チェック状態、選択状態変更時）
            return true;
        }
    }

    /**********************************
    * 
    * イベントハンドラ
    * 
    **********************************/

    /**
     * ヘッダーチェッククリックイベント
     */
    handleClickHeaderCheck = () => {
        let checked = [];
        if (!this.state.headerCheck) { //チェックされた場合
            checked = this.getDisplayRowIndex();
        }
        //チェックボックス状態変更
        this.setState({ checkRow: checked, headerCheck: !this.state.headerCheck });
        if (this.props.onChangeCheckState) {
            this.props.onChangeCheckState(checked);
        }
    }

    /**
     * セルクリックイベント
     */
    clickCell = (rowIndex) => {
        this.changeSelectRow(rowIndex);
    }

    /**
     * チェックボックスクリックイベント
     */
    handleClickCheckbox = (rowIndex) => {
        const { data } = this.props;
        const { checkRow } = this.state;
        const update = _.cloneDeep(checkRow);
        //すでにチェック済みかどうか確認
        var uncheckedIndex = _.findIndex(checkRow, (o) => { return o === rowIndex });

        if (uncheckedIndex >= 0) {
            //チェック済みの場合はチェック解除
            update.splice(uncheckedIndex, 1);
        }
        else {
            //チェックされていない場合はチェック状態に変更
            update.push(rowIndex);
        }

        const display = this.getDisplayRowIndex();
        const allChecked = _.size(_.pull(display, ...update)) > 0 ? false : true;
        this.setState({ checkRow: update, headerCheck: allChecked });
        if (this.props.onChangeCheckState) {
            this.props.onChangeCheckState(update);
        }
    }

    /**
     * render
     */
    render() {
        const { id, data, headerSet, useCheckbox, selectable, checkColTitle, headerCheckbox, className } = this.props;
        const { selectRow, checkRow, headerCheck } = this.state;

        return (
            <Table hover id={id} className={className} bordered={true}>
                <Header
                    checkColTitle={checkColTitle}
                    headerCheckbox={headerCheckbox}
                    headerCheck={headerCheck}
                    headerSet={headerSet}
                    onClickCheckbox={this.handleClickHeaderCheck}
                />
                <Body
                    data={data}
                    selectable={selectable}
                    useCheckbox={useCheckbox}
                    checkRow={checkRow}
                    selectRow={selectRow}
                    clickCell={this.clickCell}
                    onClickCheckbox={this.handleClickCheckbox}
                />
            </Table>
        );
    }

    /**
     * 表示中の行インデックスを取得する
     */
    getDisplayRowIndex() {
        const pageInfo = $('#' + this.props.id).DataTable().page.info();
        const indexes = $('#' + this.props.id).DataTable().rows().indexes();
        //表示中の行インデックス取得
        const start = pageInfo.start;
        const end = pageInfo.end;

        let checked = [];
        for (var i = start; i < end; i++) {
            let index = indexes[i];
            checked.push(index);
        }
        return checked;
    }

    /**
     * DataTableの設定
     */
    setTable() {
        const id = "#" + this.props.id;
        const _this = this;
        var noOrderTargets = [];
        if (this.props.useCheckbox) {
            noOrderTargets = this.props.noOrderColIndexArray ? this.props.noOrderColIndexArray.map((colIndex) => { return (colIndex + 1) }) : [];
            noOrderTargets.push(0);     //チェックボックスカラムはソートしない            
        } else {
            if (this.props.noOrderColIndexArray) {
                noOrderTargets = noOrderTargets.concat(this.props.noOrderColIndexArray);
            }            
        }
        $(id).DataTable({
            language: {
                "zeroRecords": this.props.zeroRecords ? this.props.zeroRecords : "データはありません。",
                "info": " _TOTAL_ 件中 _START_ から _END_ まで表示",
                "infoEmpty": "",
                "paginate": {
                    "first": "‹‹",
                    "previous": "‹",
                    "next": "›",
                    "last": "››",
                },
                lengthMenu: " _MENU_ 件表示",
            },
            lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "全"]],
            dom: "<'row'<'col-sm-12'<'pull-right'l>>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5 col-xs-12'i><'col-sm-7 col-xs-12'p>>",
            ordering: true,
            order: this.props.order ? this.props.order : [[0, 'asc']],
            columnDefs: noOrderTargets.length > 0 ?
                [{ "orderable": false, "targets": noOrderTargets }] : [],           //ソートしないインデックスを指定 
            pagingType: "simple_numbers",
            pageLength: this.state.pageLength,
            stateSave: this.props.stateSave
        });
        $(id).on('page.dt', function () {   //表示ページ変更イベント
            if (_this.props.useCheckbox) {
                _this.setState({ checkRow: [], headerCheck: false });
            }
            if (_this.props.selectable) {
                _this.changeSelectRow(null);
            }
        }).on('length.dt', function (e, settings, len) {    //表示件数変更イベント
            const pageInfo = $(id).DataTable().page.info();
            //表示中の行インデックス取得
            const beforeLength = pageInfo.length;
            const start = pageInfo.start;
            const end = pageInfo.end + (len - beforeLength);
            _this.setState({ pageLength: len });

            if (_this.props.useCheckbox) {
                let checked = [];
                const nowChecked = _this.state.checkRow;
                nowChecked.forEach((rowIndex) => {
                    if (_.inRange(rowIndex, start, end)) {
                        checked.push(rowIndex);
                    }
                });
                let headerCheck = false;
                if ((end - start) !== 0 && checked.length === (end - start)) {
                    headerCheck = true;
                }

                _this.setState({ checkRow: checked, headerCheck: headerCheck });
            }
            if (_this.props.selectable) {
                const nowSelected = _this.state.selectRow;
                if (!_.inRange(nowSelected, start, end)) {
                    _this.changeSelectRow(null);
                }
            }
        });
    }

    /**
     * 選択行を変更する
     */
    changeSelectRow(rowIndex) {
        this.setState({ selectRow: rowIndex });
        if (this.props.onSelectRow) {
            this.props.onSelectRow(rowIndex);
        }
    }

    /**
     * 拡張セルが変更されたかどうか
     * @param {array} targetRows 対象行
     * @param {array} sourceRows 元の行
     */
    isChangeedExpandedCell(targetRows, sourceRows) {
        return targetRows.some((targetRow) =>
            targetRow.cells.some((target, i) => {
                if (target.Component) {
                    return sourceRows.some((sourceRow) => 
                        sourceRow.cells.some((source, j) => (i === j) && (JSON.stringify(target) !== JSON.stringify(source)))
                    );
                }
                return false;
            })
        );
    }
}

ListDisplayTable.propTypes = {
    id: PropTypes.string.isRequired,
    data: PropTypes.array,
    headerSet: PropTypes.arrayOf(PropTypes.string),
    useCheckbox: PropTypes.bool,
    checked: PropTypes.array,
    selectable: PropTypes.bool,
    selected: PropTypes.number,
    checkColTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),  //チェックボックス列のヘッダータイトル
    headerCheckbox: PropTypes.bool,      //チェックボックスカラムのヘッダーにチェックボックスを表示するかどうか
    order: PropTypes.array,           //初期表示のオーダー設定 ex.[[0, 'asc']]  
    isLoading: PropTypes.bool,            //ロード状態
    onChangeCheckState: PropTypes.func,   //チェックボックスチェック状態変更イベント
    onSelectRow: PropTypes.func     　 //行選択イベント関数
};

/**
* 行をハイライトするかどうかを判定する
*/
function isHighlightRow(index, selectRow) {
    var isHighlight = false;
    isHighlight = (index === selectRow ? true : false);
    return isHighlight;
}

//#region SFC
/**
* ボックスヘッダー
*/
const Header = ({ headerCheckbox, checkColTitle, headerCheck, headerSet, onClickCheckbox: handleClickCheckbox }) => {
    return (
        <thead>
            <tr>
                {headerCheckbox &&
                    <th>
                        <div className="flex-center">
                            <input type="checkbox" onClick={handleClickCheckbox} checked={headerCheck} />
                            {checkColTitle}
                        </div>
                    </th>
                }
                {headerSet &&
                    headerSet.map((cell) => {
                        return <th children={cell} />
                    })
                }
            </tr>
        </thead>
    );
}

/**
* ボックスボディ
*/
const Body = ({ data, selectable, useCheckbox, checkRow, selectRow, clickCell, onClickCheckbox: handleClickCheckbox }) => {
    if (data) {
        return (
            <tbody>
                {data.map((row, index) => {
                    return (
                        <TableRow
                            row={row}
                            useCheckbox={useCheckbox}
                            checked={_.includes(checkRow, index)}
                            selected={isHighlightRow(index, selectRow)}
                            clickCell={selectable && clickCell.bind(this, index)}
                            onClickCheckbox={useCheckbox && handleClickCheckbox.bind(this, index)}
                        />
                    );
                })}
            </tbody>
        );
    }
    return null;
}

/**
* テーブル行
*/
const TableRow = ({ row, useCheckbox, checked, selected, clickCell, onClickCheckbox: handleClickCheckbox }) => {
    return (
        <tr className={row.alarmCssClassName}>
            {useCheckbox &&
                <CheckboxColumn checked={checked} selected={selected} clickCell={clickCell} onClickCheckbox={handleClickCheckbox} />
            }
            {row.cells.map((cell) => {
                if (cell.Component) {
                    return <cell.Component cell={cell} selected={selected} clickCell={clickCell} />
                }
                else {
                    return <ItemColumn cell={cell} selected={selected} clickCell={clickCell} />
                }
            })}
        </tr>
    );
}

/**
* チェックボックスカラム
*/
const CheckboxColumn = ({ checked, selected, clickCell, onClickCheckbox: handleClickCheckbox }) => {
    return (
        <td className={selected ? "datatable-select-row" : null} onClick={clickCell}>
            <div className="flex-center">
                <input type="checkbox" onClick={handleClickCheckbox} checked={checked} />
            </div>
        </td>
    );
}

/**
* アイテムカラム
*/
const ItemColumn = ({ cell, selected, clickCell, children }) => {
    return (
        <td
            className={selected ? "datatable-select-row" : null}
            style={{ color: cell.foreColor, backgroundColor: cell.backColor }}
            onClick={clickCell}
        >
            {children ? children : cell.value}
        </td>
    );
}

/**
* 拡張版カラム（任意のコンポーネントを表示する）
*/
export const makeComponentColumn = (Component, componentProps) => {
    return (props) => (
        <ItemColumn {...props}>
            <Component {...componentProps} {...props.cell} />
        </ItemColumn>
    );
}
//#endregion

