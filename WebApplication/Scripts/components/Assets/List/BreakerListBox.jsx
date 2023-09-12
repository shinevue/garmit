/**
 * @license Copyright 2018 DENSO
 * 
 * BreakerListBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Form, FormControl } from 'react-bootstrap';

import DataTable from 'Common/Widget/DataTable';
import Box from 'Common/Layout/Box';
import BoxColseButton from 'Common/Widget/BoxColseButton';

import { getCurrentPageRows } from 'dataTableUtility';
import { BREAKER_STATUS } from 'constant';

/**
 * ブレーカー一覧ボックスコンポーネント
 * @param {string} title タイトル
 * @param {array} breakers 分岐電源一覧
 * @param {object} selectedBreaker 選択した分岐電源
 * @param {function} onSelect 分岐電源選択時に呼び出す
 */
export default class BreakerListBox extends Component {
    
    /*
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { 
            currentPage: 1,
            pageSize: 10
        };
    }

    /********************************************
     * ライフサイクル
     ********************************************/

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const { breakers } = nextProps;
        const nextBreakerLength = breakers ? breakers.length : 0;
        const currentBreakerLength = this.props.breakers ? this.props.breakers.length: 0;

        if (breakers !== this.props.breakers || nextBreakerLength !== currentBreakerLength) {
            this.setState({
                currentPage: 1
            });
        }
    }

    /**
     * render
     */
    render() {
        const { title, breakers, isLoading } = this.props;
        const { pageSize, currentPage } = this.state;
        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>{title}</Box.Title>
                </Box.Header >
                <Box.Body>
                    {breakers &&
                        <div>
                            <Pager pageSize={pageSize} onChange={(value) => this.changePageSize(value)} />
                            <DataTable  responsive hover
                                        currentPage={currentPage}
                                        pageSize={pageSize}
                                        className="datatable-select"
                                        totalItemCount={(breakers && breakers.length) ? breakers.length : 0}
                                        onPageClick={(page) => this.changePage(page)}
                            >
                                {this.makeTableHeader()}
                                {this.makeTableBody()}
                            </DataTable>
                        </div>
                    }
                </Box.Body>
            </Box>
        );
    }


    /********************************************
     * 一覧作成
     ********************************************/

    /**
     * 一覧のheaderを生成する
     */
    makeTableHeader() {        
        return (
            <DataTable.Header>
                <DataTable.Row>
                    <DataTable.HeaderCell invalidSorting>名称</DataTable.HeaderCell>
                    <DataTable.HeaderCell invalidSorting>定格電流値</DataTable.HeaderCell>
                    <DataTable.HeaderCell invalidSorting>定格電圧値</DataTable.HeaderCell>
                    <DataTable.HeaderCell invalidSorting>ステータス</DataTable.HeaderCell>
                    <DataTable.HeaderCell invalidSorting>ポイント</DataTable.HeaderCell>
                    <DataTable.HeaderCell invalidSorting>子電源系統</DataTable.HeaderCell>
                </DataTable.Row>
            </DataTable.Header>
        );

    }

    /**
     * 一覧のbodyを生成する
     */
    makeTableBody() {
        const { breakers, selectedBreaker } = this.props;
        const { currentPage, pageSize } = this.state;        
        const currentRows = getCurrentPageRows(breakers, currentPage, pageSize);
        return (
            <DataTable.Body>
                {(currentRows && currentRows.length > 0) ? currentRows.map((breaker) =>
                    <DataRow
                        breaker={breaker}
                        selected={selectedBreaker && 
                                  (selectedBreaker.egroup.egroupId === breaker.egroup.egroupId && selectedBreaker.breakerNo === breaker.breakerNo)}
                        onSelect={() => this.onSelect(breaker)}
                    />) 
                :
                    <DataTable.Row>
                        <DataTable.Cell colspan={6}>
                            分岐電源がありません
                        </DataTable.Cell>
                    </DataTable.Row>
                }
            </DataTable.Body>
        );
    }


    /********************************************
     * イベント
     ********************************************/

    /**
     * ページサイズを変更する
     * @param {string} value ページサイズ
     */
    changePageSize(value) {
        this.setState({ pageSize: value});
        this.onSelect(null);
    }
    
    /**
     * ページを変更する
     * @param {number} page ページ番号
     */
    changePage(page) {
        this.setState({ currentPage: page })
        this.onSelect(null);
    }

    /**
     * 分岐電源選択イベント
     * @param {*} breaker 
     */
    onSelect(breaker) {
        if (this.props.onSelect) {
            this.props.onSelect(breaker);
        }
    }
}

/**
 * 一行分のデータ
 * @param {object} breker 分岐電源情報
 * @param {boolean} selected 選択されているかどうか
 * @param {function} onSelect 選択時に呼び出す
 */
class DataRow extends Component {

    /**
     * render
     */
    render() {
        const { breaker, selected } = this.props;
        return (
            <DataTable.Row
                onClick={() =>this.onSelect()}
                className={selected && "datatable-select-row"}
            >
                <DataTable.Cell>{breaker.breakerName}</DataTable.Cell>
                <DataTable.Cell>{breaker.ratedCurrent}</DataTable.Cell>
                <DataTable.Cell>{breaker.ratedVoltage}</DataTable.Cell>
                <DataTable.Cell>{this.getBreakerStatusName(breaker.breakerStatus)}</DataTable.Cell>
                <DataTable.Cell>{breaker.points && this.makePointNamesString(breaker.points)}</DataTable.Cell>
                <DataTable.Cell>{breaker.connectedEgroup && breaker.connectedEgroup.egroupName}</DataTable.Cell>
            </DataTable.Row>
        ) 
    }

    /**
     * ブレーカーのステータスの表示名を取得
     * @param {number} statusValue ステータス番号
     */
    getBreakerStatusName(statusValue) {
        const status = BREAKER_STATUS.find((status) => status.value === statusValue);
        if (status) {
            return status.name;
        }
        return '';
    }
    
    /**
     * ポイント名称の文字列を生成する
     * @param {array} points ポイント一覧
     */
    makePointNamesString(points) {
        const pointNameList = points.map((point) => point.pointName);
        return pointNameList.join(',');
    }

    /**
     * 行選択イベントを発生させる
     */
    onSelect() {
        if (this.props.onSelect) {
            this.props.onSelect();
        }
    }
}

/**
 * ページャー
 * @param {string} pageSize ページサイズ
 * @param {function} onChange ページサイズ変更時に呼び出す
 */
class Pager extends Component {

    /**
     * render
     */
    render() {
        const { pageSize } = this.props;
        return (
            <Form inline className="pull-right">
                <FormControl
                    bsSize="sm"
                    componentClass="select"
                    value={pageSize}
                    onChange={(e) => this.handleChange(e.target.value)}
                >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </FormControl> 件を表示
            </Form>
        ) 
    }

    /**
     * ページ変更
     * @param {string} value ページ番号 
     */
    handleChange(value) {
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }
}

BreakerListBox.propTypes = {
    title: PropTypes.string.isRequired,
    breakers: PropTypes.arrayOf(PropTypes.shape({
        breakerName: PropTypes.string.isRequired,
        ratedCurrent: PropTypes.number.isRequired,
        ratedVoltage: PropTypes.number.isRequired,
        breakerStatus: PropTypes.number.isRequired,
        points: PropTypes.array,
        connectedEgroup: PropTypes.object
    })),
    selectedBreaker: PropTypes.object,
    onSelect: PropTypes.func
};