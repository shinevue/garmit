/**
 * Copyright 2017 DENSO Solutions
 * 
 * SearchResultTable Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Checkbox, ButtonToolbar, Form, FormControl, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';

import DataTable from 'Common/Widget/DataTable';
import LinkButton from 'Common/Widget/LinkButton';
import TextForm from 'Common/Form/TextForm';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import { DownloadButton, UploadButton, EditButton, DeleteButton, ConfirmButton, ExportReportButton, EditHotKeyButton, DeleteHotKeyButton, ConfirmHotKeyButton, UploadHotKeyButton, ExportReportHotKeyButton } from 'Assets/GarmitButton';

import MessageModal from 'Assets/Modal/MessageModal';
import AssetDetailReportModal  from 'Assets/Modal/AssetDetailReportModal';
import DisplayColumnSettingModal from 'Assets/Modal/DisplayColumnSettingModal';

import { outputSearchResult } from 'exportUtility';
import { BUTTON_OPERATION_TYPE, SEARCHRESULT_CELL_TYPE } from 'constant';
import { setSessionStorage } from 'webStorage';
import { convertCamelCase } from 'stringUtility';

const FILE_EXTENSION_PDF = 'pdf';

/**
 * SearchResultTable
 * @param {object} searchResult 一覧表示用データ
 * @param {object} initialState 表示設定用のstate
 * @param {bool} useCheckbox チェックボックスを表示するか
 * @param {string} className クラス
 * @param {bool} editButton 左上に編集ボタンを表示するか
 * @param {bool} deleteButton 左上に削除ボタンを表示するか
 * @param {bool} confirmButton 左上に確認ボタンを表示するか
 * @param {func} onEditClick 編集ボタンクリック時に呼ぶ関数
 * @param {func} onDeleteClick 削除ボタンクリック時に呼ぶ関数
 * @param {func} onConfirmClick 確認ボタンクリック時に呼ぶ関数
 * @param {func} onHoverButtonClick ホバーボタンクリック時に呼ぶ関数
 * @param {func} onStateChange stateが変化したときに呼ぶ関数
 * @param {bool} isReadOnly 読み取り専用かどうか
 * @param {object} hiddenButton 非表示にするボタン
 * @param {bool} selectable 選択可能にするかどうか
 * @param {func} onCellButtonClick セルのボタンクリック時に呼ぶ関数
 * @param {bool} isCellButtonReadOnly セルのボタンを読取専用とするか
 * @param {func} onDownloadClick ダウンロードボタンクリック時に呼ぶ関数
 * @param {bool} downloadButton 左上にダウンロードボタンを表示するか
 * @param {bool} uploadButton 左上にアップロードボタンを表示するかどうか
 * @param {bool} lengthSelect 表示件数を表示するかどうか
 * @param {bool} noFooter フッタ（件数表示およびページャー）を消すかどうか
 */
export default class SearchResultTable extends Component {

    /**
     * @constructor
     */
    constructor(props) {
        super(props)
        this.state = props.initialState ?　Object.assign({}, props.initialState, {
                showColumnSettingModal: false           //初期表示ではモーダルは常に非表示
            }) : {
                    currentPage: 1,
                    pageSize: 10,
                    sort: {
                        index: null,
                        type: 'asc'
                    },
                    filter: [],
                    checkedIndexes: [],
                    modalInfo: {
                        showModal: false,
                        rackPowerReport: null,
                        unitPowerReport: null,
                        unitNetworkReport: null,
                        lineResult: null
                    },
                    showColumnSettingModal: false,
                    selectRow: [],
                    message: {}
                };
    }

    /**
     * コンポーネントがマウントされる前に呼ばれます
     */
    componentWillMount() {
        // 画面遷移があったとき、チェック状態だけは保持しない。※searchResultの変更が想定されるため
        this.changeState({ checkedIndexes: [] });
    }

    /**
     * コンポーネントが新しいPropsを受け取るとき
     * @param {any} nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(nextProps.searchResult) !== JSON.stringify(this.props.searchResult)) {
            const obj = {
                checkedIndexes: []
            };

            if (JSON.stringify(nextProps.searchResult.headers) !== JSON.stringify(this.props.searchResult.headers)) {
                Object.assign(obj, {
                    sort: {
                        index: null,
                        type: 'asc'
                    },
                    filter: []
                });
            }

            this.changeState(obj);
        }
    }

    /**
     * stateを変更するときに、setStateの代わりに呼ぶ
     * @param {any} obj
     */
    changeState(obj, callback) {
        this.setState(obj, () => {
            if (callback) {
                callback();
            };
            if (this.props.onStateChange) {
                this.props.onStateChange(this.state, Object.assign({}, this.props.searchResult, { rows: this.getDisplayRows() }));
            }
        });
    }

    /**
     * チェックボックスがクリックされた時
     * @param {any} rowIndex
     */
    onCheckboxClicked(rowIndex) {
        const checkedIndexes = this.state.checkedIndexes.slice();
        const idx = checkedIndexes.indexOf(rowIndex);
        if (idx >= 0) {
            checkedIndexes.splice(idx, 1);
        } else {
            checkedIndexes.push(rowIndex);
        }
        this.changeState({ checkedIndexes: checkedIndexes });
    }

    /**
     * 「すべて」チェックボックスがクリックされた時
     */
    onAllCheckboxClicked() {
        if (this.isAllChecked()) {
            this.changeState({ checkedIndexes: [] });
        } else {
            this.changeState({ checkedIndexes: this.getCurrentPageRowIndexes() });
        }
    }

    /**
     * カラムフィルターの値が変更された時
     * @param {any} val 値
     * @param {any} index カラムのインデックス
     */
    onFilterChanged(val, index) {
        const filter = this.state.filter.slice();
        filter[index] = val;
        this.changeState({ filter: filter, currentPage: 1 }, () => this.uncheckHiddenRows());
    }

    /**
     * ソートアイコンがクリックされた時
     * @param {any} index
     */
    onColumnHeaderCellClick(index) {
        const { sort } = this.state;
        const newSort = {
            index: index,
            type: (index !== sort.index) ? 'asc' : (sort.type === 'asc') ? 'desc' : 'asc'
        }
        this.changeState({ sort: newSort }, () => this.uncheckHiddenRows());
    }

    /**
     * 詳細ボタンがクリックされた時
     * @param {any} values
     */
    onDetailButtonClick(values) {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'message',
                title: '詳細',
                message: values.map((v) => <div className="text-break-word">{v}</div>),
                onCancel: () => this.clearMessage()
            }
        });
    }

    /**
     * セルのリンククリックイベント
     * @param {any} linkFunction
     * @param {any} parameterKeyPairs
     */
    onCellLinkClick(linkFunction, parameterKeyPairs) {
        if (this.props.onCellLinkClick) {
            this.props.onCellLinkClick(linkFunction, parameterKeyPairs);
        }

        this.movePage(linkFunction && linkFunction.url, parameterKeyPairs);
    }

    /**
     * セルのボタンクリックイベント
     * @param {array} parameterKeyPairs パラメータキーペアリスト
     * @param {number} operationType 操作種別
     */
    onCellButtonClick(parameterKeyPairs, operationType) {
        if (this.props.onCellButtonClick) {
            this.props.onCellButtonClick(parameterKeyPairs, operationType)
        }
    }

    /**
     * 編集ボタンクリック
     */
    handleEditClick() {
        if (this.props.onEditClick) {
            this.props.onEditClick(this.getParameterKeyPairsOfCheckedRow());
        }
    }

    /**
     * 削除ボタンクリック
     */
    handleDeleteClick() {
        if (this.props.onDeleteClick) {
            this.props.onDeleteClick(this.getParameterKeyPairsOfCheckedRow());
        }
    }

    /**
     * 確認ボタンクリック
     */
    handleConfirmClick() {
        const { searchResult } = this.props;
        const { checkedIndexes } = this.state;
        if (this.props.onConfirmClick) {
            const targetIndexes = checkedIndexes.filter((index) => searchResult.rows[index].hoverButtons.some((btn) => btn.operationType == BUTTON_OPERATION_TYPE.confirm))
            const parameterKeyPairs = targetIndexes.map((index) => searchResult.rows[index].parameterKeyPairs);
            this.props.onConfirmClick(parameterKeyPairs);
        }
    }

    /**
     * ダウンロードボタンクリック
     */
    handleDownloadClick() {
        if (this.props.onDownloadClick) {
            this.props.onDownloadClick(this.getParameterKeyPairsOfCheckedRow());
        }
    }

    /**
    * 施錠ボタンクリック
    */
    handleLockClick() {
        if (this.props.onLockClick) {
            this.props.onLockClick(this.getParameterKeyPairsOfCheckedRow());
        }
    }

    /**
    * 開錠ボタンクリック
    */
    handleUnlockClick() {
        if (this.props.onUnlockClick) {
            this.props.onUnlockClick(this.getParameterKeyPairsOfCheckedRow());
        }
    }

    /**
     * 追加ボタンクリック
     */
    handleAddClick() {
        if (this.props.onAddClick) {
            this.props.onAddClick(this.getParameterKeyPairsOfCheckedRow());
        }
    }

    /**
     * アップロードボタンクリック
     */
    handleUploadClick() {
        if (this.props.onUploadClick) {
            this.props.onUploadClick(this.getParameterKeyPairsOfCheckedRow());
        }
    }

    /**
     * セルクリック
     */
    handleClickCell(row) {
        this.changeState({ selectRow: row.parameterKeyPairs });
        if (this.props.onSelectRow) {
            this.props.onSelectRow(row);
        }
    }

    /**
     * チェックされている行のParameterKeyPairsを取得
     */
    getParameterKeyPairsOfCheckedRow() {
        const { searchResult } = this.props;
        const { checkedIndexes } = this.state;

        return checkedIndexes.map((index) => searchResult.rows[index].parameterKeyPairs);
    }

    /**
     * すべてのチェックボックスがチェックされているか判定
     */
    isAllChecked() {
        const { checkedIndexes } = this.state;
        const currentPageRowIndexes = this.getCurrentPageRowIndexes();
        if (currentPageRowIndexes.length === 0) {
            return false;
        }

        const hasUncheckedRow = currentPageRowIndexes.some((index) => checkedIndexes.indexOf(index) === -1);

        return !hasUncheckedRow;
    }

    /**
     * 非表示の行のチェックを外す
     */
    uncheckHiddenRows() {
        const { checkedIndexes } = this.state;
        const displayedIndexes = this.getCurrentPageRowIndexes();

        const indexes = checkedIndexes.filter((index) => displayedIndexes.indexOf(index) >= 0);
        this.changeState({ checkedIndexes: indexes });
    }

    /**
     * フィルターの値で行を絞り込む
     * @param {array} rows 
     */
    filterRows(rows) {
        const { filter } = this.state;

        return rows.filter((row) => {
            for (let i = 0; i < row.cells.length; i++) {
                if (filter[i] && filter[i].length > 0) {
                    const searchStrings = filter[i].split(/[\s　]+/);    // OR検索
                    const match = (searchStrings.find((str) => row.cells[i].value && row.cells[i].value.indexOf(str) >= 0) !== undefined)
                    if (!match) return false;
                }
            }
            return true;
        });
    }

    /**
     * 行のソート処理を行う
     */
    sortRows(rows) {
        const { sort } = this.state;

        if (sort.index == null) {
            return rows;
        }

        let sortedRows = rows.slice();
        sortedRows.sort((a, b) => {
            const valueA = a.cells[sort.index].value || "";
            const valueB = b.cells[sort.index].value || "";
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

        return sortedRows;
    }

    /**
     * 現在のページに表示する行を取得する
     */
    getCurrentPageRows() {
        const { currentPage, pageSize } = this.state;

        const rows = this.getDisplayRows();

        return  rows.filter((row, i) => {
            return ((currentPage - 1) * pageSize <= i) && (i < currentPage * pageSize)
        });
    }

    /**
     * 現在のページに表示する行のインデックスを返す
     */
    getCurrentPageRowIndexes() {
        const rows = this.getCurrentPageRows();
        return rows.map((row) => this.props.searchResult.rows.indexOf(row));
    }

    /**
     * 絞り込み、並び替え処理をした行を取得する
     */
    getDisplayRows() {
        if (!this.props.searchResult.rows || this.props.searchResult.rows.length === 0) {
            return [];
        }

        let rows = this.props.searchResult.rows.slice();
        rows = this.filterRows(rows);
        rows = this.sortRows(rows);

        return rows;
    }

    /**
     * ボディを生成する
     * @param {any} rows
     * @param {any} alarmCol アラーム表示列があるか
     * @param {any} hoverButtonCol ホバーボタン表示列かあるか
     * @param {any} checkboxCol
     */
    makeDataTableBody(rows, alarmCol, hoverButtonCol, checkboxCol) {
        var tableRows = [];
        if (rows && rows.length > 0) {
            rows.forEach((row) => {
                tableRows = tableRows.concat(this.makeDataTableRow(row, alarmCol, hoverButtonCol, checkboxCol))
            })
        }
        return (
            <DataTable.Body>
                {tableRows.length > 0 ?
                    tableRows
                    :
                    <DataTable.Row>
                        <DataTable.Cell
                            colspan={this.props.searchResult.headers && this.props.searchResult.headers.length + 4}
                        >表示するデータがありません</DataTable.Cell>
                    </DataTable.Row>
                }
            </DataTable.Body>
        );
    }

    /**
     * Rowをつくる
     * @param {any} row
     * @param {any} alarmCol アラーム表示列があるか
     * @param {any} hoverButtonCol ホバーボタン表示列かあるか
     * @param {any} checkboxCol
     */
    makeDataTableRow(row, alarmCol, hoverButtonCol, checkboxCol) {
        const { searchResult, buttonHidden, selectable, isReadOnly } = this.props;
        const { checkedIndexes, selectRow } = this.state;

        let tableRows = [];
        let cells = [];
        const rowIndex = searchResult.rows.indexOf(row);
        const checked = checkedIndexes.indexOf(rowIndex) > -1;

        let rowSpan = this.isJoinRow(row) && row.rows.length;
        let firstSplitIndex = this.getFirstSplitIndex(row);

        const makeTableCell = (cell, row, rowSpan, border = null) => {
            return (                
                <DataTable.Cell
                    className={cell.alarmCssClassName}
                    style={{ whiteSpace: 'nowrap', textAlign: cell.align, color: cell.foreColor, backgroundColor: cell.backColor, borderRightWidth: (border && "1px") }}
                    clickCell={() => { selectable && this.handleClickCell(row)}}
                    rowSpan={rowSpan}
                >
                    { this.makeCellValue(cell, row) }
                </DataTable.Cell>
            );
        }

        const makeTableRow = (row, cells, checked, selectClass, checkboxCol, rowIndex) => {
            return (
                <DataTable.Row
                    className={classNames(checked ? 'datatable-check-row' : (selectClass || (row.isConfirmedAlarm || row.alarmCssClassName)), row.className)}
                    style={{ color: row.foreColor, backgroundColor: row.backColor }}
                    onClick={checkboxCol && (() => this.onCheckboxClicked(rowIndex))}
                >{cells}</DataTable.Row>
            );
        }

        // チェックボックスを使用する場合
        if (checkboxCol) {
            cells.push(
                <DataTable.Cell rowSpan={rowSpan}>
                    <Checkbox
                        className="pa-0 mtb-0 ta-c"
                        checked={checked}
                        onClick={() => this.onCheckboxClicked(rowIndex)}
                    />
                </DataTable.Cell>
            )
        }

        // 操作用アイコンがある場合
        if (hoverButtonCol) {
            const hoverButtons = [];
            row.hoverButtons.forEach((button) => {
                if (!buttonHidden || !buttonHidden[button.operationType]) {
                    if (!isReadOnly
                        || [
                            BUTTON_OPERATION_TYPE.linkToRack,
                            BUTTON_OPERATION_TYPE.linkToUnit,
                            BUTTON_OPERATION_TYPE.linkToFloorMap,
                            BUTTON_OPERATION_TYPE.graphDisp,
                            BUTTON_OPERATION_TYPE.linkToReportSchedule,
                            BUTTON_OPERATION_TYPE.linkToConsumer,
                            BUTTON_OPERATION_TYPE.linkToProject,
                            BUTTON_OPERATION_TYPE.linkToLine,
                            BUTTON_OPERATION_TYPE.linkToPatchboard
                        ].indexOf(button.operationType) >= 0) {
                        hoverButtons.push(this.makeHoverButton(button));
                    }
                }
            });

            cells.push(
                <DataTable.Cell style={{ whiteSpace: 'nowrap' }} rowSpan={rowSpan}>
                    <div className="mlr-1" >
                        {hoverButtons}
                    </div>
                </DataTable.Cell>
            );
        }

        // アラームカテゴリが指定されてるとき
        if (alarmCol) {
            cells.push(
                <DataTable.Cell style={{ whiteSpace: 'nowrap' }} rowSpan={rowSpan}>
                    <span class={row.alarmCssClassName && ('icon-garmit-' + row.alarmCssClassName)} />
                    {row.alarmCssClassName === 'error' ? '異常'
                        : row.alarmCssClassName === 'warn' ? '注意'
                            : row.alarmCssClassName === 'syserr' ? 'システムエラー' : ''}
                </DataTable.Cell>
            )
        }

        // 選択可能な場合、選択されているかどうかチェックしてクラスを付与
        let selectClass = null;
        if (selectable) {
            selectClass = selectRow === row.parameterKeyPairs && "datatable-select-row";
        }

        // 行のセルの内容を生成
        row.cells.forEach((cell, i) => {
            if (firstSplitIndex >= 0 && firstSplitIndex === i) {
                row.rows[0].cells.forEach((splitCell) => {
                    cells.push(makeTableCell(splitCell, row, null));
                })
            }
            cells.push(makeTableCell(cell, row, rowSpan));
        });
        tableRows.push(makeTableRow(row, cells, checked, selectClass, checkboxCol, rowIndex));

        //行が結合されるとき、2行目以降の行を生成
        if (rowSpan) {
            row.rows.forEach((splitRow, i) => {
                if (i === 0) {
                    return;
                }

                let splitCells = [];
                splitRow.cells.forEach((cell, index) => {
                    splitCells.push(makeTableCell(cell, row, null, (splitRow.cells.length===index+1)));
                })
                tableRows.push(makeTableRow(row, splitCells, checked, selectClass, checkboxCol, rowIndex));
            })
        }

        return tableRows;
    }

    /**
     * セルの内容コンポーネントを作成する
     * @param {object} cell セル情報
     * @param {object} row 行情報
     */
    makeCellValue(cell, row) {
        switch (cell.cellType) {
            case SEARCHRESULT_CELL_TYPE.link:
                return (
                    <a
                        href="#"
                        onClick={(e) => {
                            e.stopPropagation();    // 親要素へのイベントの伝播をキャンセル
                            this.onCellLinkClick(cell.linkFunction, cell.parameterKeyPairs);
                        }}
                    >
                        {cell.value}
                    </a>
                );
            case SEARCHRESULT_CELL_TYPE.image:
                return <Image src={cell.value} style={{ maxWidth: 250 }} thumbnail />;
            case SEARCHRESULT_CELL_TYPE.assetReportSubInfoButton:
                const { rackPowerReport, unitPowerReport, unitNetworkReport, lineResult } = row;
                return (
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();    // 親要素へのイベントの伝播をキャンセル
                            this.changeDeitalModalShowState(true, rackPowerReport, unitPowerReport, unitNetworkReport, lineResult);
                        }}
                    >
                        {cell.value}
                    </Button>
                );
            case SEARCHRESULT_CELL_TYPE.button:
                return (cell.value&&
                    <Button bsStyle="primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                this.onCellButtonClick(cell.parameterKeyPairs)
                            } }>
                            {cell.value}
                    </Button>
                );
            case SEARCHRESULT_CELL_TYPE.buttons:
                const multiButtons = cell.multiButtons && cell.multiButtons.filter((button) => button.value);
                return (multiButtons && multiButtons.length > 0 &&
                    <div>
                        {multiButtons.map((button, index) => 
                            <Button bsStyle="primary"
                                    className={(index + 1) < multiButtons.length ? 'mr-05' : ''}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        this.onCellButtonClick(button.parameterKeyPairs, button.operationType)
                                    } }
                                    disabled={button.disabled}
                                    >
                                    {button.value}
                            </Button>
                        )}
                    </div>
                );
            default:
                if (cell.value) {
                    const values = cell.value.split(/\r\n|\r|\n/);
                    const maxLineCount = this.props.maxLineCount || 1;
                    const count = Math.min(values.length, maxLineCount);

                    return (
                        <div>
                            {[...Array(count)].map((x, i) =>
                                <div>
                                    <span>{values[i].slice(0, 50)}</span>
                                    {(values[i].length > 50 || (i === count - 1 && values.length > count)) &&
                                <span>
                                    <span>...</span>
                                            {i === count - 1 &&
                                    <i
                                        className="icon-garmit-detail hover-icon pull-right"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            this.onDetailButtonClick(values);
                                        }}
                                    />
                                            }
                                </span>
                            }
                        </div>
                            )}
                        </div>
                    );
                } else {
                    return cell.value;
                }
        }
    }

    /**
     * アイコンのクラスを取得する
     * @param {any} operationType
     */
    getButtonInfo(operationType) {
        switch (operationType) {
            case BUTTON_OPERATION_TYPE.edit:
                return {
                    iconClass: 'icon-garmit-edit',
                    tooltip: '編集'
                };

            case BUTTON_OPERATION_TYPE.delete:
                return {
                    iconClass: 'icon-garmit-delete',
                    tooltip: '削除'
                };

            case BUTTON_OPERATION_TYPE.pointDetail:
                return {
                    iconClass: 'icon-garmit-detail',
                    tooltip: 'ポイント詳細'
                };

            case BUTTON_OPERATION_TYPE.graphDisp:
                return {
                    iconClass: 'icon-garmit-trend-graph',
                    tooltip: 'トレンドグラフ'
                };

            case BUTTON_OPERATION_TYPE.confirm:
                return {
                    iconClass: 'icon-garmit-confirm',
                    tooltip: '確認'
                };

            case BUTTON_OPERATION_TYPE.linkToFloorMap:
                return {
                    iconClass: 'icon-garmit-floor-map',
                    tooltip: 'フロアマップ',
                    url: '/FloorMap'
                };

            case BUTTON_OPERATION_TYPE.linkToRack:
                return {
                    iconClass: 'icon-garmit-category-asset',
                    tooltip: 'ラック',
                    url: '/Rack'
                };

            case BUTTON_OPERATION_TYPE.linkToUnit:
                return {
                    iconClass: 'icon-garmit-category-asset',
                    tooltip: 'ユニット',
                    url: '/Unit'
                };

            case BUTTON_OPERATION_TYPE.datagate:
                return {
                    iconClass: 'icon-garmit-category-maintenance',
                    tooltip: '機器',
                    url: '/Maintenance/Device'
                };

            case BUTTON_OPERATION_TYPE.gateStatus:
                return {
                    iconClass: 'icon-garmit-detail',
                    tooltip: '機器状態'
                };

            case BUTTON_OPERATION_TYPE.detail:
                return {
                    iconClass: 'icon-garmit-detail',
                    tooltip: '詳細'
                }
            
            case BUTTON_OPERATION_TYPE.download:
                return {
                    iconClass: 'fal fa-arrow-to-bottom',
                    tooltip: 'ダウンロード'
                };

            case BUTTON_OPERATION_TYPE.linkToReportSchedule:
                return {
                    iconClass: 'icon-garmit-category-schedule',
                    tooltip: 'レポートスケジュール',
                    url: '/ReportSchedule'
                };

            case BUTTON_OPERATION_TYPE.linkToConsumer:
                return {
                    iconClass: 'icon-garmit-category-consumer',
                    tooltip: 'コンシューマー',
                    url: '/Consumer'
                };

            case BUTTON_OPERATION_TYPE.linkToElectricLockMap:
                return {
                    iconClass: 'icon-garmit-eleckey-map',
                    tooltip: '電気錠マップ',
                    url: '/ElectricLockMap'
                };

            case BUTTON_OPERATION_TYPE.lock:
                return {
                    iconClass: 'fal fa-lock-alt mr-1',
                    tooltip: '施錠'
                };

            case BUTTON_OPERATION_TYPE.unlock:
                return {
                    iconClass: 'fal fa-lock-open-alt mr-1',
                    tooltip: '開錠'
                };

            case BUTTON_OPERATION_TYPE.linkToProject:
                return {
                    iconClass: 'icon-garmit-category-line',
                    tooltip: '案件',
                    url: '/Project'
                };

            case BUTTON_OPERATION_TYPE.linkToLine:
                return {
                    iconClass: 'icon-garmit-category-line',
                    tooltip: '回線',
                    url: '/Line'
                };

            case BUTTON_OPERATION_TYPE.linkToPatchboard:
                return {
                    iconClass: 'icon-garmit-category-line',
                    tooltip: '配線盤',
                    url: '/Patchboard'
                };

            default:
                return {};
        }
    }

    /**
     * ページ遷移する
     * @param {string} url 遷移先のURL
     * @param {array} keyPairs 遷移するときのキーとパラメータ
     */
    transitPage(url, keyPairs) {
        //キーをsessionStorageに格納
        keyPairs.forEach((keyPair) => {
            const paramater = keyPair.paramater.charAt(0).toLowerCase() + keyPair.paramater.slice(1);
            setSessionStorage(paramater, keyPair.key);
        });
        window.location.href = url;         //画面遷移
    }

    /**
     * ホバーボタンを生成する
     * @param {any} hoverButton
     */
    makeHoverButton(hoverButton) {
        const classes = 'hover-icon';
        const buttonInfo = this.getButtonInfo(hoverButton.operationType);
        const { iconClass, url, tooltip } = buttonInfo;
        const urlKey  = this.getKey(hoverButton.parameterKeyPairs, 'Url');
        var isPdf = (hoverButton.operationType === BUTTON_OPERATION_TYPE.download) && this.isPdfFile(urlKey);

        return (
            <OverlayTrigger placement="right" overlay={<Tooltip>{tooltip}</Tooltip>}>
                {hoverButton.operationType !== BUTTON_OPERATION_TYPE.download ? 
                    <i
                        className={classNames(classes, iconClass)}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (url) {
                                this.transitPage(url, hoverButton.parameterKeyPairs);
                            } else {
                                this.props.onHoverButtonClick(hoverButton);
                            }
                        }}
                    />
                    :
                    <a className={classNames(classes, iconClass)}
                        href={urlKey}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        download={!isPdf}
                        target={isPdf ? '_blank' : '_self'}
                    />
                }
            </OverlayTrigger>
        );
    }

    /**
     * ヘッダーを生成する
     * @param {any} alarmCol アラーム表示列があるか
     * @param {any} hoverButtonCol ホバーボタン表示列があるか
     * @param {any} checkboxCol
     */
    makeDataTableHeader(alarmCol, hoverButtonCol, checkboxCol) {
        const { searchResult, isReadOnly } = this.props;
        const { sort, filter } = this.state;

        if (searchResult && searchResult.headers) {
            let headerCells = [];
            let firstRow = searchResult.rows.length > 0 ? searchResult.rows[0] : null;
            let firstSplitIndex = this.getFirstSplitIndex(firstRow);
            let lastSplitndex = this.getLastSplitIndex(firstRow);
            if (checkboxCol) {
                headerCells.push(
                    <DataTable.HeaderCell invalidSorting>
                        <Checkbox
                            className="ta-c pa-0 mlr-0"
                            checked={this.isAllChecked()}
                            onClick={() => this.onAllCheckboxClicked()}
                        />
                    </DataTable.HeaderCell>
                )
            }
            if (hoverButtonCol) {
                headerCells.push(<DataTable.HeaderCell invalidSorting />);
            }           
            if (alarmCol) {
                headerCells.push(<DataTable.HeaderCell invalidSorting />);
            }

            searchResult.headers.forEach((header, i) => {
                let isSplit = firstSplitIndex >= 0 && firstSplitIndex <= i && i <= lastSplitndex;
                let index = -1;
                if (!isSplit) {
                    index = (firstSplitIndex < 0 || i <= firstSplitIndex) ? i : (i - lastSplitndex + firstSplitIndex - 1)
                }
                headerCells.push(
                    <DataTable.HeaderCell
                        onClick={() => this.onColumnHeaderCellClick(index)}
                        sorted={(index === sort.index) && sort.type}
                        filtered={(filter[index] && filter[index].length > 0)}
                        style={{ whiteSpace: "nowrap" }}
                        className={isSplit&&"va-t"}
                        invalidSorting={isSplit}
                    >
                        {header}
                        {!isSplit&&
                            <TextForm
                                className="mb-0 normalText"
                                value={filter[index]}
                                onChange={(val) => this.onFilterChanged(val, index)}
                                placeholder=""
                                minWidth={80}
                                bsSize="sm"
                            />
                        }
                    </DataTable.HeaderCell>
                );
            });

            return <DataTable.Header><DataTable.Row>{headerCells}</DataTable.Row></DataTable.Header>
        }
    }

    /**
     * リンクボタンを生成する
     */
    makeLinkButtons() {
        const { editButton, deleteButton, confirmButton, isReadOnly, buttonHidden, downloadButton, lockButton, unlockButton, addButton, uploadButton, useHotKeys } = this.props;
        const { checkedIndexes } = this.state;
        return (
            <div>
                <ButtonToolbar>
                {(downloadButton && (!buttonHidden || !buttonHidden[BUTTON_OPERATION_TYPE.download])) &&
                    <DownloadButton
                        onClick={() => this.handleDownloadClick()}
                        disabled={checkedIndexes.length === 0}
                    />
                }
                {(editButton && (!buttonHidden || !buttonHidden[BUTTON_OPERATION_TYPE.edit])) && (useHotKeys ? 
                    <EditHotKeyButton
                        onClick={() => this.handleEditClick()}
                        disabled={checkedIndexes.length === 0}
                    />
                        :
                    <EditButton
                        onClick={() => this.handleEditClick()}
                        disabled={checkedIndexes.length === 0}
                    />
                )}
                {(deleteButton && (!buttonHidden || !buttonHidden[BUTTON_OPERATION_TYPE.delete])) && (useHotKeys ?
                    <DeleteHotKeyButton
                        onClick={() => this.handleDeleteClick()}
                        disabled={checkedIndexes.length === 0}
                    />
                    :
                    <DeleteButton
                        onClick={() => this.handleDeleteClick()}
                        disabled={checkedIndexes.length === 0}
                    />
                )}
                {addButton &&
                    <Button
                        iconId="add"
                        onClick={() => this.handleAddClick()}
                    >追加</Button>
                }
                {(confirmButton && (!buttonHidden || !buttonHidden[BUTTON_OPERATION_TYPE.confirm])) && (useHotKeys ?
                    <ConfirmHotKeyButton
                        onClick={() => this.handleConfirmClick()}
                        disabled={checkedIndexes.length === 0
                            || !checkedIndexes.some((index) => this.props.searchResult.rows[index].hoverButtons.some((btn) => btn.operationType == BUTTON_OPERATION_TYPE.confirm))}
                    />
                    :
                    <ConfirmButton
                        onClick={() => this.handleConfirmClick()}
                        disabled={checkedIndexes.length === 0
                            || !checkedIndexes.some((index) => this.props.searchResult.rows[index].hoverButtons.some((btn) => btn.operationType == BUTTON_OPERATION_TYPE.confirm))}
                    />
                )}
                {(unlockButton && (!buttonHidden || !buttonHidden[BUTTON_OPERATION_TYPE.unlock])) &&
                    <Button
                        bsStyle="success"
                        onClick={() => this.handleUnlockClick()}
                        disabled={checkedIndexes.length === 0}
                    >
                        <i className="fal fa-lock-open-alt mr-05"></i>開錠
                    </Button>
                }
                {(lockButton && (!buttonHidden || !buttonHidden[BUTTON_OPERATION_TYPE.lock])) &&
                    <Button
                        bsStyle="lightgray"
                        onClick={() => this.handleLockClick()}
                        disabled={checkedIndexes.length === 0}
                    >
                        <i className="fal fa-lock-alt mr-05"></i>施錠
                    </Button>
                }
                {uploadButton && (useHotKeys ?
                    <UploadHotKeyButton 
                        onClick={() => this.handleUploadClick()}
                        disabled={checkedIndexes.length === 0}
                    />
                    :
                    <UploadButton
                        onClick={() => this.handleUploadClick()}
                        disabled={checkedIndexes.length === 0}
                    />
                )}
                </ButtonToolbar>
            </div>
        );
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
                    onChange={(e) => this.changeState({ pageSize: e.target.value, currentPage: 1 }, () => this.uncheckHiddenRows())}
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
     * ホバーボタン列を表示するか
     */
    hasHoverButtonCol() {
        const { isReadOnly, searchResult, buttonHidden } = this.props;

        if (!searchResult) {
            return false;
        }

        if (isReadOnly
            && !searchResult.rows.some((row) => row.hoverButtons && row.hoverButtons.some((button) => [
                BUTTON_OPERATION_TYPE.linkToRack,
                BUTTON_OPERATION_TYPE.linkToUnit,
                BUTTON_OPERATION_TYPE.linkToFloorMap,
                BUTTON_OPERATION_TYPE.graphDisp,
                BUTTON_OPERATION_TYPE.linkToConsumer,
                BUTTON_OPERATION_TYPE.linkToProject,
                BUTTON_OPERATION_TYPE.linkToLine,
                BUTTON_OPERATION_TYPE.linkToPatchboard
            ].indexOf(button.operationType) >= 0))) {
            return false;
        }

        return searchResult.rows.some((row) =>
            row.hoverButtons && row.hoverButtons.length > 0 && row.hoverButtons.some((button) =>
                !buttonHidden || !buttonHidden[button.operationType]
            )
        );
    }

    /**
     * チェックボックス列を表示するか
     */
    hasCheckboxCol() {
        const { isReadOnly, useCheckbox, editButton, deleteButton, confirmButton, buttonHidden, lockButton, unlockButton, downloadButton, uploadButton } = this.props;

        if (isReadOnly || !useCheckbox) {
            return false;
        }

        if (editButton && !buttonHidden[BUTTON_OPERATION_TYPE.edit]) return true;
        if (deleteButton && !buttonHidden[BUTTON_OPERATION_TYPE.delete]) return true;
        if (confirmButton && !buttonHidden[BUTTON_OPERATION_TYPE.confirm]) return true;
        if (lockButton && !buttonHidden[BUTTON_OPERATION_TYPE.lock]) return true;
        if (unlockButton && !buttonHidden[BUTTON_OPERATION_TYPE.unlock]) return true;
        if (downloadButton && !buttonHidden[BUTTON_OPERATION_TYPE.download]) return true;
        if (uploadButton) return true;
        return false;
    }

    /**
     * 詳細モーダルの表示/非表示を切り替える
     * @param {boolean} show 表示するかどうか
     * @param {object} rackPowerReport ラック電源一覧
     * @param {object} unitPowerReport ユニット電源一覧
     * @param {object} unitNetworkReport ユニットネットワーク一覧
     * @param {object} lineResult 回線一覧
     */
    changeDeitalModalShowState(show, rackPowerReport, unitPowerReport, unitNetworkReport, lineResult) {
        this.setState({
            modalInfo: { 
                showModal: show, 
                rackPowerReport: rackPowerReport, 
                unitPowerReport: unitPowerReport, 
                unitNetworkReport:unitNetworkReport,
                lineResult: lineResult
            }
        });
    }

    /**
     * 画面遷移する
     * @param {string} url 遷移先URL
     * @param {array} pkeyPairsList パラメータキーペアリスト
     */
    movePage(url, keyPairsList) {
        if (!url) {
            return;
        }

        if (keyPairsList) {
            keyPairsList.forEach((pair) => {
                let param = convertCamelCase(pair.paramater);
                setSessionStorage(param, pair.key);         //sessionStorageにキーを入れる
            });
        }

        window.location.href = url;
    }

    /**
     * メッセージモーダルを閉じる
     */
    clearMessage() {
        this.setState({ message: Object.assign({}, this.state.message, { show: false }) });
    }

    /**
     * 指定のパラメータのキーを取得する
     * @param {array} parameterKeyPairs パラーメータキーペア
     * @param {string} parameter パラメータ
     */
    getKey(parameterKeyPairs, parameter) {
        const target = parameterKeyPairs.find((pair) => pair.paramater === parameter);
        return　target ? target.key : '';
    }

    /**
     * 分割するセルの開始インデックス
     * @param {object} row 対象行
     */
    getFirstSplitIndex(row) {
        return this.isJoinRow(row) ? row.rowsIndex : -1;
    }

    /**
     * 分割するセルの終了インデックス
     * @param {object} row 対象行
     */
    getLastSplitIndex(row) {
        return this.isJoinRow(row) ? row.rowsIndex + row.rows[0].cells.length - 1 : -1;
    }

    /**
     * 結合行かどうか
     * @param {object} row 対象行
     */
    isJoinRow(row) {
        return row && row.rows && row.rows.length > 0 ? true : false;
    }
    
    /**
     * PDFファイルかどうか
     * @param {string} url URL
     */
    isPdfFile(url) {
        if (url) {
            const extension = this.getExtension(url)
            return (extension.toLowerCase() === FILE_EXTENSION_PDF);
        }
        return false;
    }

    /**
     * 拡張子を取得する
     * @param {any} fileName
     */
     getExtension(fileName) {
        return fileName.split('.').pop();
    }

    /**
     * render
     */
    render() {
        const { className, searchResult, isReadOnly, buttonHidden, editButton, deleteButton, confirmButton, exportButton, columnSettingButton, exportName, functionId, gridNo, striped, includeDateExportName, lengthSelect, noFooter, useHotKeys } = this.props;
        const { currentPage, pageSize, showColumnSettingModal, message } = this.state;
        const { showModal, rackPowerReport, unitPowerReport, unitNetworkReport, lineResult } = this.state.modalInfo;

        const totalRows = this.getDisplayRows();
        const currentPageRows = this.getCurrentPageRows();

        // 現在のページに表示する行がない場合
        if (totalRows.length && !currentPageRows.length) {
            // 現在のページを1ページ目にする
            this.changeState({ currentPage: 1 });
        }

        // アラーム状態表示列を表示するか
        const alarmCol = searchResult && searchResult.rows.some((row) => row.alarmCssClassName);
        // ホバーボタン列を表示するか
        const hoverButtonCol = this.hasHoverButtonCol();
        // チェックボックス行を表示するか
        const checkboxCol = this.hasCheckboxCol();

        return (
            <div className={className}>
                {searchResult &&
                    <div>
                        {(columnSettingButton || exportButton) &&
                            <div className="clearfix mb-1">
                                <div className="pull-right">
                                    <ButtonToolbar>
                                        {columnSettingButton &&
                                            <Button
                                                iconId="listing"
                                                onClick={() => this.setState({ showColumnSettingModal: true })}
                                            >表示設定</Button>
                                        }
                                        {exportButton && (useHotKeys ?
                                            <ExportReportHotKeyButton
                                                onClick={() => outputSearchResult(Object.assign({}, searchResult, { rows: this.getDisplayRows() }), exportName, includeDateExportName)}
                                            />
                                            :
                                            <ExportReportButton
                                                onClick={() => outputSearchResult(Object.assign({}, searchResult, { rows: this.getDisplayRows() }), exportName, includeDateExportName)}
                                            />
                                        )}
                                    </ButtonToolbar>
                                </div>
                            </div>
                        }
                        <div>
                            <div className="pull-left">
                                {!isReadOnly && this.makeLinkButtons()}
                            </div>
                            <div className="pull-right">
                                {lengthSelect && this.makeDisplayLengthSelectForm()}
                            </div>
                        </div>
                        <div>
                            <DataTable responsive hover 
                                striped={striped}
                                currentPage={currentPage}
                                pageSize={pageSize}
                                totalItemCount={totalRows.length}
                                noFooter={noFooter}
                                onPageClick={(val) => this.changeState({ currentPage: val }, () => this.uncheckHiddenRows())}
                            >
                                {searchResult.headers && this.makeDataTableHeader(alarmCol, hoverButtonCol, checkboxCol)}
                                {this.makeDataTableBody(currentPageRows, alarmCol, hoverButtonCol, checkboxCol)}
                            </DataTable>
                        </div>
                    </div>
                }
                <AssetDetailReportModal 
                    showModal={showModal} 
                    rackPowerReport={rackPowerReport} 
                    unitPowerReport={unitPowerReport}
                    unitNetworkReport={unitNetworkReport}
                    lineResult={lineResult}
                    onHide={() => this.changeDeitalModalShowState(false, null, null, null, null)}
                />
                {columnSettingButton && functionId &&
                    <DisplayColumnSettingModal
                        showModal={showColumnSettingModal}
                        onHide={() => this.changeState({ showColumnSettingModal: false })}
                        onSaved={() => this.props.onColumnSettingChange()}
                        functionId={functionId}
                        gridNo={gridNo}
                    />
                }
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
        )
    }
}

SearchResultTable.propTypes = {
    initialState: PropTypes.object,
    useCheckbox: PropTypes.bool,
    className: PropTypes.string,
    editButton: PropTypes.bool,
    deleteButton: PropTypes.bool,
    onEditClick: PropTypes.func,
    onDeleteClick: PropTypes.bool,
    onStateChange: PropTypes.func,
    onHoverButtonClick: PropTypes.func,
    isReadOnly: PropTypes.bool,
    buttonHidden: PropTypes.object,
    selectable: PropTypes.bool,
    onSelectRow:PropTypes.func,
    lengthSelect:PropTypes.bool,
    noFooter: PropTypes.bool,
    useHotKeys: PropTypes.bool
};

SearchResultTable.defaultProps = {
    buttonHidden: {},
    striped: true,
    lengthSelect: true,
    noFooter: false,
    useHotKeys: false
};