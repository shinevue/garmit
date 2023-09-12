/**
 * Copyright 2017 DENSO Solutions
 * 
 * DataTable Reactコンポーネント
 * 
 * <DataTable className='mr-1' boxStyle='info' isSolid={false} isLoading={false} >
 *  <Box.Header>
 *      <Box.Title>...title</Box.Title>
 *      <Box.Tools>
 *       ...tools
 *      </Box.Tools>
 *  </Box.Header>
 *  <Box.Body>...</Box.Body>
 *  <Box.Footer></Box.Footer>
 * </Box>
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Grid, Row, Col, Table, Pagination, Pager } from 'react-bootstrap';

import DataTableHeader from './DataTableHeader';
import DataTableHeaderCell from './DataTableHeaderCell';
import DataTableBody from './DataTableBody';
import DataTableRow from './DataTableRow';
import DataTableCell from './DataTableCell';

/**
 * 表を作成する
 * @param {number} currentPage 現在のページ
 * @param {number} pageSize 1ページに表示する件数
 * @param {number} totalItemCount 全体の件数
 * @param {function} onPageClick ページをクリックしたときに呼び出す
 */
export default class DataTable extends Component {

    /**
     * render
     */
    render() {
        const { id, currentPage, pageSize, totalItemCount, isSinplified, noFooter, className, striped, bordered, responsive, hover } = this.props;
        const start = currentPage ? Math.min(((currentPage - 1) * pageSize) + 1, totalItemCount) : 0;
        const end = currentPage ? Math.min(totalItemCount, currentPage * pageSize) : 0;
        const totalPages = Math.max(0, Math.ceil(totalItemCount / pageSize));
        const classes = {
            'dataTable': true
        }
    
        return (
            <Grid className="dataTables_wrapper dt-bootstrap" fluid style={{ overflow: 'visible' }}>
                <Row>
                </Row>
                <Row>
                    <Table
                        id={id}
                        className={classNames(className, classes)}
                        striped={striped}
                        bordered={true}
                        responsive={responsive}
                        hover={hover}
                    >
                        {this.props.children}
                    </Table>
                </Row>
                {noFooter ?
                    null
                    :
                    isSinplified ?
                        <SimplifiedPager totalItemCount={totalItemCount} start={start} end={end} totalPages={totalPages} currentPage={currentPage} handlePageClick={(e) => this.handlePageClick(e)} />
                        :
                        <NormalPager totalItemCount={totalItemCount} start={start} end={end} totalPages={totalPages} currentPage={currentPage} handlePageClick={(e) => this.handlePageClick(e)} />
                }
            </Grid>
        );
    }

    handlePageClick(e){
        if (this.props.onPageClick){
            return this.props.onPageClick(e);
        }
    }

}

/**
 * ページャー（通常版）
 * <NormalPager totalItemCount={} start={} end={} totalPages={} currentPage={} ></NormalPager>
 * @param {number} totalItemCount データ数合計
 * @param {number} start 表示開始行
 * @param {number} end 表示終了業
 * @param {number} totalPages ページ数合計
 * @param {number} currentPage 現在表示中のページ
 */
const NormalPager = ({ totalItemCount, start, end, totalPages, currentPage, handlePageClick }) => (
    <Row>
        <Col sm={5}>
            <div className='dataTables_info'>
                {totalItemCount} 件中 {start} から {end} までを表示
            </div>
        </Col>
        <Col sm={7}>
            <div className='dataTables_paginate paging_simple_numbers'>
                <Pagination prev next first last ellipsis boundaryLinks maxButtons={5} items={totalPages} activePage={currentPage} onSelect={(e) => handlePageClick(e)}
                />
            </div>
        </Col>
    </Row>
);

/**
 * ページャー（簡易版）
 * <SimplifiedPager totalItemCount={} start={} end={} totalPages={} currentPage={} ></SimplifiedPager>
 * @param {number} totalItemCount データ数合計
 * @param {number} start 表示開始行
 * @param {number} end 表示終了業
 * @param {number} totalPages ページ数合計
 * @param {number} currentPage 現在表示中のページ
 */
const SimplifiedPager = ({ totalItemCount, start, end, totalPages, currentPage, handlePageClick }) => (
    <Row>
        <Col sm={5}>
            <div className='dataTables_info'>
                {totalItemCount} 件中 {start} から {end} 件
            </div>
        </Col>
        <Col sm={7}>
            <div className='dataTables_paginate paging_simple_numbers'>
                <Pagination prev next ellipsis={false} boundaryLinks maxButtons={2} items={totalPages} activePage={currentPage} onSelect={(e) => handlePageClick(e)}
                />
            </div>
        </Col>
    </Row>
);


DataTable.propTypes = {
    id:PropTypes.string,
    currentPage: PropTypes.number,
    pageSize: PropTypes.number.isRequired,
    totalItemCount: PropTypes.number.isRequired,
    onPageClick: PropTypes.func.isRequired,
    isSinplified: PropTypes.bool,     //簡易版データテーブルかどうか（スペースが狭い場合に使用する）
    noFooter:PropTypes.bool           //フッター表示無し
};

DataTable.Header = DataTableHeader;
DataTable.HeaderCell = DataTableHeaderCell;
DataTable.Body = DataTableBody;
DataTable.Row = DataTableRow;
DataTable.Cell = DataTableCell;
