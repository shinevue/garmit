/**
 * Copyright 2017 DENSO Solutions
 * 
 * ReportDataTable Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, FormControl } from 'react-bootstrap';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import DataTable from 'Common/Widget/DataTable';
import LocationDetailModal from 'Assets/Modal/LocationDetailModal';
import { getByte, cutStringByByte } from 'stringUtility';
import { convertNumber } from 'numberUtility';

const POINT_DISP_COUNT = 10;
 
export default class ReportDataTable extends Component {

    constructor(props) {
        super(props)
        this.state = {
            detailModalInfo: {
                show: false,
                text: []
            },
            pageInfo : {
                currentPage: 1,
                pageSize: 10
            },
            pointDispInfo: {
                currentPage: 1,
                pageSize: POINT_DISP_COUNT
            }
        }
    }

    /**
     * componentDidMount
     */
    componentDidMount() {
        this.setDataTable();
    }

    /**
     * shouldComponentUpdate
     */
    shouldComponentUpdate(nextProps, nextState) {
        return ((this.props.data !== nextProps.data) || this.state != nextState);
    }

    /**
     * componentWillReceiveProps
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.data !== nextProps.data) {
            this.setState({
                pageInfo : {
                    currentPage: 1,
                    pageSize: this.state.pageInfo.pageSize          //ページ数は変えない
                },
                pointDispInfo: {
                    currentPage: 1,
                    pageSize: POINT_DISP_COUNT
                }
            });
        }
    }

    /**
     * componentDidUpdate
     */
    componentDidUpdate(prevProps, prevState) {
        if (this.props.data !== prevProps.data || this.state.pointDispInfo !== prevState.pointDispInfo) {
            this.setDataTable();
        } else if (this.state.pageInfo !== prevState.pageInfo) {
            this.setTableHighlight();
        }
    }

    /**
     * データテーブルの設定
     */
    setDataTable(table) {
        this.setHeaderSizeSetting();

        //データテーブルの縦ハイライト設定
        this.setTableHighlight();

        //画面サイズ変更イベントを設定
        window.addEventListener('resize', () => {
            this.setHeaderSizeSetting();
        });
    }

    /**
     * 詳細ボタン押下イベント
     */
    handleClickDetail = (value) => {
        this.setState({
            detailModalInfo: {
                show: true,
                text: _.split(value, '\n')
            }
        });
    }

    /**
     * 詳細モーダルクローズイベント
     */
    handleCloseModal = () => {
        this.setState({
            detailModalInfo: {
                show: false,
                text:""
            }
        })
    }

    /**
     * ページ変更イベント
     */
    handlePageNoChanged = (pageNo) => {
        this.setState({
            pageInfo : Object.assign(this.state.pageInfo, {
                currentPage: convertNumber(pageNo)
            }) 
        });
    }

    /**
     * ページ数変更イベント
     */
    handlePageSizeChanged = (pageSize) => {
        this.setState({
            pageInfo: {
                pageSize: convertNumber(pageSize),
                currentPage: 1
            }
        });
    }

    /**
     * ポイント表示を移動する
     */
    handleMoveDispPoints = (isNext) => {
        const { currentPage, pageSize } = this.state.pointDispInfo;
        this.setState({
            pointDispInfo: {
                currentPage: currentPage + (isNext ? 1 : -1),
                pageSize: pageSize
            }
        })
    }

    /**
     * ポイント表示を移動する
     */
    handleMoveDispPoints(isNext) {
        const { currentPage, pageSize } = this.state.pointDispInfo;
        this.setState({
            pointDispInfo: {
                currentPage: currentPage + (isNext ? 1 : -1),
                pageSize: pageSize
            }
        })
    }

    /**
     * 表示ポイントを変更する
     */
    hanldeChangeDispPoints(pageNo) {
        const { pageSize } = this.state.pointDispInfo;
        this.setState({
            pointDispInfo: {
                currentPage: pageNo,
                pageSize: pageSize
            }
        })
    }

    /**
     * render
     */
    render() {
        const { data, headerSet, className } = this.props;
        const { pointDispInfo } = this.state;
        const { show, text } = this.state.detailModalInfo;
        const { currentPage, pageSize } = this.state.pageInfo;

        const totalLength = this.getDataLength(headerSet);
        const currentPoints = this.getCurrentDispPoints(data, pointDispInfo.currentPage, pointDispInfo.pageSize);
        const currentPageHeaderSet = this.getCurrentPageRows(headerSet, currentPage, pageSize);
        const currentPageData = this.getCurrentPageData(currentPoints, currentPage, pageSize);
        const totalPointPageCount = Math.floor(data.length / pointDispInfo.pageSize) + (data.length % pointDispInfo.pageSize > 0 ? 1 : 0);

        return (
            <div>
                <div class="datatable-report-option-top">
                    {data && data.length > pointDispInfo.pageSize &&
                        <ExchangePointDisplay 
                            className="option-button-toolbar"
                            disabled={{
                                previous: (pointDispInfo.currentPage === 1),
                                next: (pointDispInfo.currentPage * pointDispInfo.pageSize >= data.length)
                            }}
                            totalPoint={data.length}
                            pageSize={pointDispInfo.pageSize}
                            currentPage={pointDispInfo.currentPage}
                            onMovePrevious={() => this.handleMoveDispPoints(false)}
                            onMoveNext={() => this.handleMoveDispPoints(true)}
                            onMoveFirst={() => this.hanldeChangeDispPoints(1)}
                            onMoveLast={() => this.hanldeChangeDispPoints(totalPointPageCount)}
                        />
                    }
                    <div >
                        <DisplayLengthSelectForm
                            pageSize={pageSize}
                            onChange={this.handlePageSizeChanged}
                        />
                    </div>
                </div>
                <div className={className} id="dataReportTable">
                    <DataTable hover={true} striped={true}
                               responsive 
                               className={'datatable-report' + (!(currentPoints && currentPoints.length > 0 ) ? ' fixed-width' : '')}
                               totalItemCount={totalLength}                            
                               currentPage={currentPage}
                               pageSize={pageSize}
                               onPageClick={this.handlePageNoChanged}
                               id="table">
                        <DataTable.Header>
                            <HeaderRow data={currentPoints} headerSet={headerSet} index={0} />
                            <HeaderRow data={currentPoints} headerSet={headerSet} index={1} showEllipsis={true} onClickDetail={this.handleClickDetail} />
                            <HeaderRow data={currentPoints} headerSet={headerSet} index={2} />
                        </DataTable.Header>
                        <DataTable.Body>
                            {(data && headerSet && totalLength > 0) ?
                                currentPageHeaderSet.map((info, index) => {
                                    return <DataRow data={currentPageData} info={info} index={index} />
                                })
                            :
                                <DataTable.Row>
                                    <DataTable.Cell
                                        colspan={currentPageData && currentPageData.length + 1}
                                    >該当するデータが存在しません。</DataTable.Cell>
                                </DataTable.Row>
                            }
                        </DataTable.Body>
                    </DataTable>
                    <LocationDetailModal show={show} onCancel={this.handleCloseModal} locationList={text}  />
                </div>
            </div>
        )
    }

    /**
     * 現在のページに表示するデータを取得する
     */
    getCurrentPageData(data, currentPage, pageSize) {
        let currentPageData = _.cloneDeep(data);
        return currentPageData.map((row) => {
            row.cells = this.getCurrentPageRows(row.cells, currentPage, pageSize)
            return row;
        });
    }

    /**
     * 現在のページ表示する行を取得する
     */
    getCurrentPageRows(rows, currentPage, pageSize) {
        return rows.filter((row, index) => {
            if (index === 0 || index === 1 || index===2) {
                return true;    //1～3行目は常に表示する（ポイントとロケーションと単位はヘッダーとしてスクロール時に固定する）
            }
            return ((currentPage - 1) * pageSize <= (index - 3)) && ((index - 3) < currentPage * pageSize)
        });
    }

    /**
     * 全体の行数を取得する
     */
    getDataLength(headerSet) {
        if (headerSet && headerSet.length > 0) {
            return headerSet.length - 3;
        }
        return 0;
    }

    /**
     * 現在のページに表示するポイントを取得する
     * @param {*} data 
     * @param {*} currnetPage 
     * @param {*} pageSize 
     */
    getCurrentDispPoints(data, currnetPage, pageSize) {
        if (!data || data.length <= 0) {
            return [];
        }
        return data.filter((row, i) => {
            return ((currnetPage - 1) * pageSize <= i) && (i < currnetPage * pageSize);
        });
    }

    /**
     * データレポート一覧のデータサイズを設定する
     */
    setHeaderSizeSetting() {        
        var table = $('#table');
        var firstHeaderRow = table.find('thead tr:first-child');
        var secondHeaderCell = firstHeaderRow && firstHeaderRow.find('td:nth-child(2)');
        if (secondHeaderCell) {
            let headerCells = table.find('thead tr td.table-header:not(:first-child)');
            if (secondHeaderCell.width() > 100) {
                headerCells.addClass('table-header-auto');
            } else {
                headerCells.removeClass('table-header-auto');
            }
        }
    }

    /**
     * データレポート一覧の縦ハイライト設定
     */
    setTableHighlight() {
        $('#dataReportTable tbody td').hover (
            function () {
                var index = $(this).index() + 1;
                var tds = $(this).closest('table tbody').find('td:nth-child(' + index + ')'); 
                tds.css('background-color','whitesmoke');
            },
            function () {
                var index = $(this).index() + 1
                var tds = $(this).closest('table tbody').find('td:nth-child(' + index + ')');            
                tds.css('background-color','');    
            }
        );
    }
}

ReportDataTable.propTypes = {
    data: PropTypes.array,
    headerSet: PropTypes.array,
    className: PropTypes.string
}

//#region ヘッダー行コンポーネント
/**
* ヘッダー行コンポーネント
*/
function HeaderRow(props) {
    const { data, headerSet, index, showEllipsis, onClickDetail: handleClickDetail } = props;
    
    return (
        <DataTable.Row>
            <DataTable.Cell className="boldText table-header">{headerSet[index]}</DataTable.Cell>
            {data &&
                data.map((headerRow) => {
                return (
                        <HeaderColumn
                            value={headerRow.cells[index].value}
                            showEllipsis={showEllipsis}
                            onClickDetail={handleClickDetail}
                        />
                    )
                })
            }
        </DataTable.Row>
    );
}

/**
* ヘッダーカラムコンポーネント
*/
function HeaderColumn(props) {
    const { value, showEllipsis, onClickDetail: handleClickDetail } = props;
    const replaced = value && value.replace(/\n/g, "/");   //改行コードをスラッシュに置き換え(エクスポート時に使用)
    let displayString = replaced;
    let showEllipsisIcon = false;
    if (showEllipsis) {
        if (getByte(displayString) >= 48) { //48バイト以上の場合省略してアイコン表示
            displayString = cutStringByByte(displayString, 46)+"...";
            showEllipsisIcon = true;
        }
    }
    return (
        <DataTable.Cell className="boldText table-header">
            {displayString}
            <div className="full-string" style={{ display: "none" }}>{replaced}</div>
            {showEllipsisIcon &&
                <i className='icon-garmit-detail hover-icon pull-right' onClick={handleClickDetail.bind(this, value)}></i>
            }
        </DataTable.Cell>
    );
}
//#endregion

//#region データ行コンポーネント
/**
* データ行コンポーネント
*/
function DataRow(props) {
    const { data, info, index } = props;
    if (index === 0 || index === 1 || index===2) {
        return null;    //1～3行目（ポイントとロケーションと単位はヘッダーとしてスクロール時に固定する）
    }
    else {
        return (
            <DataTable.Row>
                <DataTable.HeaderCell invalidSorting={true}>{info}</DataTable.HeaderCell>
                {data &&
                    data.map((row) => {
                    return <DataTable.Cell>{row.cells[index].value}</DataTable.Cell>
                    })
                }
            </DataTable.Row>
        );
    }
}
//#endregion

//#region 表示件数選択フォーム

const DisplayLengthSelectForm = ({ pageSize, onChange: handleChanged }) => {
    return (
        <Form inline>
            <FormControl
                componentClass="select"
                value={pageSize}
                onChange={(e) => handleChanged(e.target.value)}
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

//#endregion

//#region ポイント表示切替ボタングループ

const ExchangePointDisplay = ({ className, 
                                disabled, 
                                totalPoint,
                                pageSize,
                                currentPage,
                                onMovePrevious: handleMovePrevious, 
                                onMoveNext: handleMoveNext,
                                onMoveFirst: handleMoveFirst, 
                                onMoveLast: handleMoveLast
                            }) => {
    const startCount = (currentPage - 1) * pageSize + 1;
    const endCount = (currentPage * pageSize > totalPoint) ? totalPoint : currentPage * pageSize;
    return (
        <div className={className} >
            <Button disabled={disabled.previous} onClick={handleMoveFirst}>
                <Icon className="fal fa-angle-double-left" />
            </Button>
            <Button disabled={disabled.previous} onClick={handleMovePrevious}>
                <Icon className="fal fa-angle-left" />
            </Button>
            <Button disabled={disabled.next} onClick={handleMoveNext} >
                <Icon className="fal fa-angle-right"  />
            </Button>
            <Button disabled={disabled.next} onClick={handleMoveLast} >
                <Icon className="fal fa-angle-double-right"  />
            </Button>
            <span className="">{startCount + ' - ' + endCount + ' / ' + totalPoint + ' ポイント'}</span>
        </div>
    );
}

//#endregion