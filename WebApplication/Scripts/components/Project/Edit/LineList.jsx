/**
 * @license Copyright 2020 DENSO
 * 
 * LineList Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ButtonToolbar, Checkbox, Form, FormControl } from 'react-bootstrap';

import { DeleteButton, AddButton, EditButton, ResetSortCircleButton } from 'Assets/GarmitButton';
import DataTable from 'Common/Widget/DataTable';
import MessageModal from 'Assets/Modal/MessageModal';
import Icon from 'Common/Widget/Icon';

import { SORT_TYPE } from 'sortCompare';
import { convertNumber } from 'numberUtility';
import { getCurrentPageRows } from 'dataTableUtility';
import { createLocationDisplayString } from 'locationUtility';
import { makePatchCableName, makeLineIdsName } from 'lineUtility';
import { PROJECT_TYPE, LINE_TEMP_TYPE_OPTIONS, LINE_SEARCH_TYPE_OPTIONS, LINE_LEFT_TYPE_OPTIONS } from 'constant';
import { MAX_IDF_PATCH_CABLE } from 'projectLineUtility';
import { PROJECT_DATE_FORMAT } from 'projectUtility';

const CST_INITAIL_PAGE_SIZE = 5;

const PROJECT_TYPES_TEMP_TYPE = [PROJECT_TYPE.temp, PROJECT_TYPE.new];
const PROJECT_TYPES_SEARCH_TYPE= [PROJECT_TYPE.remove, PROJECT_TYPE.fix_temp, PROJECT_TYPE.fix_left];
const PROJECT_TYPES_CLOSE_DATE = [PROJECT_TYPE.remove, PROJECT_TYPE.fix_left];

/**
 * 回線一覧コンポーネント
 * @param {array} lines 回線一覧
 * @param {boolean} isReadOnly 読取専用かどうか
 * @param {number} projectType 工事種別
 * @param {function} onEdit 編集アイコンクリック時に呼び出す
 * @param {function} onEditBulk 編集ボタンクリック時に呼び出す
 * @param {function} onDelete 削除時に呼び出す
 * @param {fucntion} onAdd 新規作成時に呼び出す
 */
export default class LineList extends Component {
    
    /**
     * ソートの初期値
     */
    static get INITIAL_SORT() {
        return {
            type: SORT_TYPE.asc,
            columnKey: 'projectLineNo'
        };
    } 

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);

        const { lines } = props;
        var currentPageLines = [];
        if (lines) {
            currentPageLines = this.getInitialCurrentPageLines(lines, 1, CST_INITAIL_PAGE_SIZE, LineList.INITIAL_SORT);
        }
        this.state = { 
            allChecked: false,
            currentPageNo: 1,
            currentPageLines: currentPageLines,
            sort: LineList.INITIAL_SORT,
            pageSize: CST_INITAIL_PAGE_SIZE,
            modalInfo: {
                show: false,
                message: '',
                callback: null
            }
        };
    }

    //#region Reactライフサイクルメソッド
    
    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const { lines } = nextProps;
        if (_.cloneDeep(lines) !== _.cloneDeep(this.props.lines) || lines.length !== this.props.lines.length) {
            const { currentPageNo, pageSize } = this.state;
            const currentPageLines = this.getCurrentPageLines(lines, currentPageNo, pageSize);
            this.setState({
                currentPageNo: currentPageNo,
                currentPageLines: currentPageLines,
                isAllChecked: this.isAllChecked(currentPageLines)
            });
        }
    }

    //#endregion

    /**
     * render
     */
    render() {
        const { lines, projectType, isReadOnly, maxLineCount } = this.props;  
        const { pageSize, allChecked, sort, modalInfo, currentPageLines, currentPageNo } = this.state;
        const totalLinesLength = lines ? lines.length : 0;
        const hasLines = this.hasLines(lines);
        const hasCheckedLines = currentPageLines && !currentPageLines.some((line) => line.checked);
        return (
            <div className="garmit-input-form-under-row">
                <div className={classNames("mb-05", !isReadOnly?"flex-center-between":"flex-center-right")} >
                    {!isReadOnly&&
                        <ButtonToolbar>
                            <EditButton 
                                disabled={hasCheckedLines} 
                                onClick={() => this.handleEditLines()} 
                            />
                            <DeleteButton
                                disabled={hasCheckedLines} 
                                onClick={() => this.showConfirmModal(true)}
                            />
                            <AddButton 
                                disabled={lines ? lines.length >= maxLineCount : true}                                
                                onClick={() => this.onAdd()} 
                            />
                        </ButtonToolbar>
                    }
                    <div className="flex-center-between">
                        <ResetSortCircleButton className="mr-1" onClick={() => this.resetSort()}/>
                        <PageSizeSelectForm 
                            pageSize={pageSize}
                            onChange={(size) => this.handlePageSizeChanged(size)}
                        />
                    </div>
                </div>
                <DataTable 
                    className="datatable-project-line"
                    totalItemCount={totalLinesLength} 
                    currentPage={currentPageNo} 
                    pageSize={pageSize} 
                    responsive
                    hover
                    noFooter={!hasLines}
                    onPageClick={(pageNo) => this.handlePageChanged(pageNo)}>
                    <Header 
                        isReadOnly={isReadOnly}
                        allChecked={allChecked}
                        sort={sort}
                        linesLength={totalLinesLength}
                        projectType={projectType}
                        onChangeAllChecked={(checked) => this.changeAllChecked(checked)}
                        onSortClick={(key) => this.handleSortClick(key)}
                    />
                    <DataTable.Body>
                        {hasLines ?
                            this.makeRows(currentPageLines, isReadOnly, projectType)
                        :
                            <DataTable.Row>
                                <DataTable.Cell colspan={this.getColumnLength(isReadOnly, projectType)}>
                                    回線がありません
                                </DataTable.Cell>
                            </DataTable.Row>
                        }
                    </DataTable.Body>
                </DataTable>
                <MessageModal
                    show={modalInfo.show} 
                    title={modalInfo.title} 
                    bsSize={modalInfo.bsSize}
                    buttonStyle={modalInfo.buttonStyle}
                    onOK={() => { modalInfo.callback ? modalInfo.callback() : this.hideMessageModal() }} 
                    onCancel={() => this.hideMessageModal()} >
                    <div>{modalInfo.message}</div>
                </MessageModal>
            </div> 
        );
    }

    /**
     * 回線一覧の行を作成する
     * @param {array} lines 回線リスト
     * @param {boolean} isReadOnly 読取専用かどうか
     * @param {number} projectType 工事種別
     */
    makeRows(lines, isReadOnly, projectType) {
        let dataRows = [];
        lines.forEach((line) => {
            const rows = line.lineConnections.map((lineConnection, index) => 
                <DataRow 
                    line={(index>0)?null:line}
                    patchCableSequences={lineConnection.patchCableSequences}
                    rowSpan={(index>0)?null:line.lineConnections.length}
                    isReadOnly={isReadOnly}
                    projectType={projectType}
                    onChangeChecked={(value) => this.changeItemChecked(value, line.projectLineNo)}
                    onEdit={() => this.onEdit(line)}
                    onDelete={() => this.showConfirmModal(false, line)}
                    onDetailButtonClick={(values) => this.showDetailModal(values)}
                />
            );
            dataRows = dataRows.concat(rows);          
        });
        return dataRows;
    }

    //#region ページ関連
    
    /**
     * ページ変更イベント
     * @param {number} pageNo ページ番号
     */
    handlePageChanged(pageNo) {
        this.setState({ 
            currentPageNo: pageNo, 
            allChecked: false, 
            currentPageLines: this.getCurrentPageLines(this.props.lines, pageNo, this.state.pageSize)
        });
    }

    
    /**
     * ページサイズが変更された時
     * @param {string} size ページサイズ
     */
    handlePageSizeChanged(size) {
        const currentPageLines = this.getCurrentPageLines(this.props.lines, 1, convertNumber(size));
        this.setState({ 
            pageSize: size, 
            currentPageNo: 1 ,
            currentPageLines: currentPageLines,
            allChecked: this.isAllChecked(currentPageLines)
        });
    }

    //#endregion

    //#region ソート関連

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
     * 現在のページをソートする
     * @param {boolean} isReset リセットするかどうか
     */
    sortCurrentPage(isReset) {
        const currentPageLines = this.getCurrentPageLines(this.props.lines, this.state.currentPageNo, this.state.pageSize, isReset);
        this.setState({ 
            currentPageLines: currentPageLines,
            allChecked: this.isAllChecked(currentPageLines)
        });
    }

    /**
     * 表示順をリセットする
     */
    resetSort() {
        this.setState({ sort: LineList.INITIAL_SORT }, () => this.sortCurrentPage());        
    }

    //#endregion

    //#region チェック関連

    /**
     * チェック状態変更イベント
     * @param {boolean} checked 変更後のチェック状態
     * @param {number} projectLineNo チェック変更した回線番号
     */
    changeItemChecked(checked, projectLineNo) {
        var workLines = _.cloneDeep(this.state.currentPageLines);
        var item = workLines.find((i) => i.projectLineNo === projectLineNo);
        item.checked = checked;
        this.setState({allChecked: this.isAllChecked(workLines), currentPageLines: workLines});
    }

    /**
     * 全チェックする
     * @param {boolean} checked 変更後のチェック状態
     */
    changeAllChecked(checked){
        const workLines = _.cloneDeep(this.state.currentPageLines);
        workLines.forEach((line) => {
            line.checked = checked;
        });
        this.setState({allChecked: checked, currentPageLines: workLines});
    }
    
    /**
     * 全てチェックされているかどうか
     * @param {array} list 対象のリスト 
     */
    isAllChecked(list) {
        return list&&list.length>0 ? list.every((item) => item.checked === true) : false;
    }

    //#endregion

    //#region 回線削除関連


    /**
     * チェックされた回線を削除する
     */
    deleteCheckedLines() {
        var workLines = Object.assign([], this.props.lines);
        workLines = workLines.filter((line) => {
            const workLine = this.state.currentPageLines.find((l) => l.projectLineNo === line.projectLineNo);
            if (workLine) {
                return workLine.checked;
            }
            return false;
        });
        this.setState({ allChecked: false }, () => this.hideMessageModal());
        this.props.onDelete(workLines);
    }

    /**
     * 回線を削除する
     * @param {object} line 回線
     */
    deleteLine(line) {
        var workLines = Object.assign([], this.props.lines);
        workLines = workLines.filter((l) => {
            return !(l.projectLineNo === convertNumber(line.projectLineNo));
        });
        this.setState({ allChecked: this.isAllChecked(workLines)}, () => this.hideMessageModal());
        this.props.onDelete([ line ]);
    }

    /**
     * 削除イベントを呼び出す
     * @param {array} lines 削除対象リスト
     */
    onDelete(lines) {
        if (this.props.onDelete) {
            this.props.onDelete(lines);
        }
    }

    //#endregion

    //#region 追加/編集ボタン関連

    /**
     * 追加ボタン押下イベント
     */
    onAdd(){
        if (this.props.onAdd) {
            this.props.onAdd();
        }
    }

    /**
     * 編集イベント発生
     * @param {object} line 
     */
    onEdit(line) {
        if (this.props.onEdit) {
            this.props.onEdit(line);
        }
    }
    
    /**
     * 一括編集イベント発生
     * @param {array} lines 対象の回線一覧
     */
    onEditBulk(lines) {
        if (this.props.onEditBulk) {
            this.props.onEditBulk(lines)
        }
    }

    /**
     * 一括編集ボタンクリックイベント
     */
    handleEditLines() {
        var workLines = Object.assign([], this.props.lines);
        workLines = workLines.filter((line) => {
            const workLine = this.state.currentPageLines.find((l) => l.projectLineNo === line.projectLineNo);
            if (workLine) {
                return workLine.checked;
            }
            return false;
        });
        if (workLines.length > 1) {
            this.onEditBulk(workLines);
        } else {
            this.onEdit(workLines[0]);
        }
        
    }

    //#endregion

    //#region その他

    /**
     * メッセージモーダルを表示する
     * @param {array} values メッセージ文字列配列
     */
    showDetailModal(values) {
        this.setState({ 
            modalInfo: { 
                show: true, 
                callback: null, 
                buttonStyle:'message', 
                bsSize: null, 
                title: '詳細', 
                message: values.map((v) => <div className="text-break-word">{v}</div>)
            }
        });
    }

    /**
     * 確認メッセージを閉じる
     */
    hideMessageModal() {
        this.setState({modalInfo: { show: false, callback: null, buttonStyle:'message', bsSize: 'small', title: '', message: '' }});
    }

    /**
     * 確認メッセージを表示する
     * @param {boolean} isMultiple 複数かどうか
     * @param {object} line 削除対象の回線
     */
    showConfirmModal(isMultiple, line) {
        var obj =  Object.assign({}, this.state.modalInfo);
        obj.show = true;
        obj.buttonStyle = 'confirm';
        obj.title = '確認';
        obj.bsSize = 'small';
        if (isMultiple) {
            obj.callback = () => this.deleteCheckedLines();
            obj.message = 'チェックされた回線を削除します。よろしいですか？';
        } else {
            obj.callback = () => this.deleteLine(line);
            obj.message = '回線を削除します。よろしいですか？';
        }
        this.setState({ modalInfo: obj });
    }
    
    /**
     * 現在のページに表示する回線に絞り込む
     * @param {array} lines 回線一覧
     * @param {number} pageNo 表示するページ番号
     * @param {number} pageSize ページサイズ
     * @param {boolean} isReset リセットするかどうか
     * @returns {array} 現在のページに表示する回線リスト
     */
    getCurrentPageLines(lines, pageNo, pageSize, isReset) {
        const { currentPageLines, sort } = this.state;

        var workLines = lines.sort((current, next) => this.compareSortLine(current, next, sort));
        
        workLines = workLines && workLines.length > 0 ? _.cloneDeep(workLines) : [];
        var currnetLines = getCurrentPageRows(workLines, pageNo, pageSize);
        if (!isReset) {
            currnetLines.forEach((line) => {
                line.checked = currentPageLines.some(l => l.projectLineNo === line.projectLineNo && l.checked);         //もともとチェックの入っていたものはチェックを入れておく
            });
        }
        return currnetLines;
    }

    /**
     * 回線を並び替える場合に現在と次の値を比較する
     * @param {object} current 現在の値
     * @param {object} next 次の値
     * @param {object} sort ソート情報
     * @param {number} 比較結果（現在の方が大きいor小さい：1、現在の方が小さいor小さい：-1、同じ：0） 
     */
    compareSortLine(current, next, sort) {
        var currentValue;
        var nextValue;

        switch (sort.columnKey) {
            case 'wiringType':
                currentValue = current.wiringType ? current.wiringType.name : '';
                nextValue = next.wiringType ? next.wiringType.name : '';
                break;
        
            case 'location':
                currentValue = current.location ? createLocationDisplayString(current.location, ' ') : '';
                nextValue = next.location ? createLocationDisplayString(next.location, ' ') : '';
                break;

            case 'hasTemp':
                currentValue = line.hasTemp ? '〇' : '';
                nextValue = line.hasTemp ? '〇' : '';
                break;

            case 'tempType':
                currentValue = LINE_TEMP_TYPE_OPTIONS.find((type) => type.value == current.tempType).text;
                nextValue = LINE_TEMP_TYPE_OPTIONS.find((type) => type.value == next.tempType).text;
                break;

            case 'searchType':
                currentValue = LINE_SEARCH_TYPE_OPTIONS.find((type) => type.value == current.searchType).text;
                nextValue = LINE_SEARCH_TYPE_OPTIONS.find((type) => type.value == next.searchType).text;
                break;

            case 'leftType':
                currentValue = LINE_LEFT_TYPE_OPTIONS.find((type) => type.value == current.leftType).text;
                nextValue = LINE_LEFT_TYPE_OPTIONS.find((type) => type.value == next.leftType).text;
                break;

            default:
                currentValue = current[sort.columnKey];
                nextValue = next[sort.columnKey];
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
     * 回線があるかどうか
     * @param {array} lines 回線一覧
     */
    hasLines(lines) {
        if (lines && lines.length > 0) {
            return true;
        }
        return false;
    }

    /**
     * 列数を取得する
     * @param {boolean} isReadOnly 読取専用かどうか
     * @param {boolean} projectType 工事種別
     */
    getColumnLength(isReadOnly, projectType) {
        let colLength = 17;
        if (isReadOnly) {
            colLength = colLength - 2;
        }
        if ([PROJECT_TYPE.temp, PROJECT_TYPE.change].includes(projectType)) {
            colLength = colLength - 2;
        } else if (projectType === PROJECT_TYPE.left) {
            colLength = colLength - 1;
        }
        return colLength;
    }

    /**
     * 初期表示時に現在のページに表示する回線のみを一覧で取得する
     * @param {array} lines 回線一覧
     * @param {number} pageNo 表示するページ番号
     * @param {number} pageSize ページサイズ
     * @param {object} sort ソート情報
     * @returns {array} 現在のページに表示する回線リスト
     */
    getInitialCurrentPageLines(lines, pageNo, pageSize, sort) {
        var workLines = lines.sort((current, next) => this.compareSortLine(current, next, sort));
        workLines = workLines && workLines.length > 0 ? _.cloneDeep(workLines) : [];
        return getCurrentPageRows(workLines, pageNo, pageSize);
    }

    //#endregion



}

LineList.propTypes = {
    lines: PropTypes.array,
    isReadOnly: PropTypes.bool,
    projectType: PropTypes.number,
    onEdit: PropTypes.func,
    onEditBulk: PropTypes.func,
    onDelete: PropTypes.func,
    onAdd: PropTypes.func
}

/**
 * ページサイズ変更フォーム
 */
const PageSizeSelectForm = ({ pageSize, onChange: handlePageSizeChanged }) => {
    return (
        <Form inline>
            <FormControl
                componentClass="select"
                bsSize="sm"
                value={pageSize}
                onChange={(e) => handlePageSizeChanged(e.target.value)}
            >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
            </FormControl> 件を表示
        </Form>
    );
}

/**
 * ヘッダ
 */
const Header = ({ isReadOnly, projectType, allChecked, sort, linesLength, onChangeAllChecked: handleChangeAllChecked, onSortClick: handleSortClick  }) => {
    return (
        <DataTable.Header>
            <DataTable.Row>
                {!isReadOnly&&
                    <DataTable.HeaderCell invalidSorting>
                        <Checkbox
                            bsClass="flex-center" 
                            checked={allChecked}
                            disabled={!(linesLength > 0)}
                            onChange={(e) => handleChangeAllChecked(e.target.checked)}
                        />
                    </DataTable.HeaderCell>
                }
                {!isReadOnly &&
                    <DataTable.HeaderCell invalidSorting></DataTable.HeaderCell>
                }
                <DataTable.HeaderCell 
                    onClick={() => handleSortClick('lineId')}
                    sorted={sort.columnKey === 'lineId' && sort.type}>回線ID
                </DataTable.HeaderCell>
                <DataTable.HeaderCell 
                    onClick={() => handleSortClick('lineName')}
                    sorted={sort.columnKey === 'lineName' && sort.type}>回線名
                </DataTable.HeaderCell>
                <DataTable.HeaderCell 
                    onClick={() => handleSortClick('location')}
                    sorted={sort.columnKey === 'location' && sort.type}>ロケーション
                </DataTable.HeaderCell>
                <DataTable.HeaderCell 
                    onClick={() => handleSortClick('wiringType')}
                    sorted={sort.columnKey === 'wiringType' && sort.type}>ワイヤ
                </DataTable.HeaderCell>
                <DataTable.HeaderCell invalidSorting>局入線番</DataTable.HeaderCell>
                <DataTable.HeaderCell invalidSorting>IDF線番1</DataTable.HeaderCell>
                <DataTable.HeaderCell invalidSorting>IDF線番2</DataTable.HeaderCell>
                <DataTable.HeaderCell invalidSorting>IDF線番3</DataTable.HeaderCell>
                <DataTable.HeaderCell invalidSorting>IDF線番4</DataTable.HeaderCell>
                <DataTable.HeaderCell invalidSorting>IDF線番5</DataTable.HeaderCell>
                <DataTable.HeaderCell invalidSorting>IDF線番6</DataTable.HeaderCell>
                {projectType === PROJECT_TYPE.new &&
                    <DataTable.HeaderCell 
                        onClick={() => handleSortClick('hasTemp')}
                        sorted={sort.columnKey === 'hasTemp' && sort.type}>仮登録
                    </DataTable.HeaderCell>
                }
                {PROJECT_TYPES_TEMP_TYPE.includes(projectType) &&
                    <DataTable.HeaderCell 
                        onClick={() => handleSortClick('tempType')}
                        sorted={sort.columnKey === 'tempType' && sort.type}>登録方法
                    </DataTable.HeaderCell>
                }
                {PROJECT_TYPES_SEARCH_TYPE.includes(projectType) &&
                    <DataTable.HeaderCell 
                        onClick={() => handleSortClick('searchType')}
                        sorted={sort.columnKey === 'searchType' && sort.type}>検索方法
                    </DataTable.HeaderCell>
                }
                {projectType !== PROJECT_TYPE.temp &&
                    <DataTable.HeaderCell 
                        onClick={() => handleSortClick('openDate')}
                        sorted={sort.columnKey === 'openDate' && sort.type}>開通年月日
                    </DataTable.HeaderCell>
                }
                {PROJECT_TYPES_CLOSE_DATE.includes(projectType) &&
                    <DataTable.HeaderCell 
                        onClick={() => handleSortClick('closeDate')}
                        sorted={sort.columnKey === 'closeDate' && sort.type}>廃止年月日
                    </DataTable.HeaderCell>
                }
                <DataTable.HeaderCell 
                    onClick={() => handleSortClick('memo')}
                    sorted={sort.columnKey === 'memo' && sort.type}>備考
                </DataTable.HeaderCell>
                {projectType === PROJECT_TYPE.left &&
                    <DataTable.HeaderCell 
                        onClick={() => handleSortClick('leftType')}
                        sorted={sort.columnKey === 'leftType' && sort.type}>残置方法
                    </DataTable.HeaderCell>
                }
            </DataTable.Row>
        </DataTable.Header>
    );
}


/**
 * 一行分のデータ
 * @param {boolean} isSelected 選択されているかどうか
 * @param {boolean} isReadOnly 読み取り専用かどうか
 */
const DataRow = ({ line, patchCableSequences, rowSpan, isReadOnly, projectType, onChangeChecked: handleChangeChecked, onEdit: handleEdit, onDelete: handleDelete, onDetailButtonClick: hanldeDetailButtonClick }) => {
    let cableNames = [];
    for (let index = 0; index < (MAX_IDF_PATCH_CABLE + 1); index++) {
        const patchCable = patchCableSequences.length > 0 ? patchCableSequences.find((s) => s.seqNo === (index + 1)) : null;
        if (patchCable) {
            cableNames.push(makePatchCableName(patchCable.patchboardName, patchCable.patchCableNo.no))
        } else {
            cableNames.push('');
        }        
    }
    return (
        <DataTable.Row >
            {!isReadOnly&&line&&
                <DataTable.Cell rowSpan={rowSpan}>
                    <Checkbox checked={line.checked} 
                              bsClass="flex-center" 
                              onChange={(e) => handleChangeChecked(e.target.checked)} />
                </DataTable.Cell>
            }
            {!isReadOnly&&line&&
                <DataTable.Cell rowSpan={rowSpan}>
                    <Icon
                        className="hover-icon icon-garmit-edit"
                        onClick={() => handleEdit()}
                    />
                    <Icon
                        className="hover-icon icon-garmit-delete"
                        onClick={() => handleDelete()}
                    />
                </DataTable.Cell>
            }
            {line&&<DataCell rowSpan={rowSpan} cellValue={makeLineIdsName( { lineId1: line.lineId1, lineId2: line.lineId2, lineId3: line.lineId3 })} onDetailButtonClick={(values) => hanldeDetailButtonClick(values)}/>}   
            {line&&<DataCell rowSpan={rowSpan} cellValue={line.lineName} />}   
            {line&&<DataCell rowSpan={rowSpan} cellValue={line.location?createLocationDisplayString(line.location, ' '):''} onDetailButtonClick={(values) => hanldeDetailButtonClick(values)} />}   
            {line&&<DataCell rowSpan={rowSpan} cellValue={line.wiringType?line.wiringType.name:''} />}   
            {cableNames.map((name, index) => 
                <DataCell 
                    nowrap
                    style={{borderRightWidth: (cableNames.length===index+1 && "1px")}}
                    cellValue={name}                    
                />
            )}
            {line&&(projectType === PROJECT_TYPE.new)&&
                <DataCell rowSpan={rowSpan} cellValue={line.hasTemp ? '〇' : ''} />           
            }
            {line&&PROJECT_TYPES_TEMP_TYPE.includes(projectType) &&
                <DataCell rowSpan={rowSpan} cellValue={(line.tempType || line.tempType === 0) ? LINE_TEMP_TYPE_OPTIONS.find((type) => type.value === line.tempType).text : ''} />
            }
            {line&&PROJECT_TYPES_SEARCH_TYPE.includes(projectType) &&
                <DataCell rowSpan={rowSpan} cellValue={LINE_SEARCH_TYPE_OPTIONS.find((type) => type.value === line.searchType).text} />
                
            }
            {line&&(projectType !== PROJECT_TYPE.temp)&&
                <DataCell rowSpan={rowSpan} cellValue={line.openDate?line.openDate.format(PROJECT_DATE_FORMAT):''} />
            }
            {line&&PROJECT_TYPES_CLOSE_DATE.includes(projectType) && 
                <DataCell rowSpan={rowSpan} cellValue={line.closeDate?line.closeDate.format(PROJECT_DATE_FORMAT):''} />                
            }               
            {line&&<DataCell rowSpan={rowSpan} cellValue={line.memo} onDetailButtonClick={(values) => hanldeDetailButtonClick(values)} />}
            {line&&(projectType === PROJECT_TYPE.left)&&
                <DataCell rowSpan={rowSpan} cellValue={LINE_LEFT_TYPE_OPTIONS.find((type) => type.value === line.leftType).text} />
            }
        </DataTable.Row>
    );
}

/**
 * 1セル分のデータ
 */
const DataCell = ({cellValue, rowSpan, style, onDetailButtonClick: hanldeDetailButtonClick }) => {
    const values = cellValue ? cellValue.split(/\r\n|\r|\n/) : [];
    const count = Math.min(values.length, 1);
    const MAX_LENGTH = 50;

    return (
        <DataTable.Cell rowSpan={rowSpan} style={style} >
            {values?
                <div>
                    {[...Array(count)].map((x, i) =>
                        <div>
                            <span>{values[i].slice(0, MAX_LENGTH)}</span>
                            {((values[i].length > MAX_LENGTH) || (i === count - 1 && values.length > count)) &&
                                <span>
                                    <span>...</span>
                                        {i === count - 1 &&
                                            <i
                                                className="icon-garmit-detail hover-icon pull-right"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    hanldeDetailButtonClick(values);
                                                }}
                                            />
                                        }
                                </span>
                            }
                        </div>
                    )}
                </div>
            :
                null
            }
        </DataTable.Cell>
    );
}
