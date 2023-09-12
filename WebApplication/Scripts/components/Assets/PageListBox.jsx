/**
 * Copyright 2017 DENSO Solutions
 * 
 * ページ一覧ボックス Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row, Col, FormGroup, FormControl } from 'react-bootstrap';

import DataTable from 'Common/Widget/DataTable';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import TextForm from 'Common/Form/TextForm';

import GarmitBox from 'Assets/GarmitBox';
import { EditCircleButton } from 'Assets/GarmitButton';

export default class PageListBox extends Component {

    constructor(props) {
        super(props)
        this.state = {

        }
    }

    /**
     * 編集ボタンクリックイベント
     * @param {int} rowInfo 行情報（番号、名称）
     */
    handleClickEdit(rowInfo) {
        if (this.props.onClickEdit) {
            this.props.onClickEdit(rowInfo);
        }
    }

    /**
     * データ一行を作成する
     * @param {object} dataRow 
     */
    makeDataRow(dataRow) {
        const selected = this.props.editing === dataRow.pageNo ? true : false;
        return (
            <DataTable.Row className={selected && "datatable-select-row"}>
                <DataTable.Cell>{dataRow.pageNo}</DataTable.Cell>
                <DataTable.Cell>{dataRow.name}</DataTable.Cell>
                <DataTable.Cell>{this.getOperationCell(dataRow)}</DataTable.Cell>
            </DataTable.Row>
        );
    }

    /**
     * 操作ボタン
     * @param {object} rowInfo
     */
    getOperationCell(rowInfo) {
        
        return (
            <div className="flex-center">
                <EditCircleButton onClick={() => this.handleClickEdit(rowInfo)} />
            </div>
            );
    }

    /**
     * render
     */
    render() {
        const { extendedData, editing, isLoading } = this.props;

        return (
            <GarmitBox isLoading={isLoading} title="ページ一覧">
                <DataTable noFooter={true}>
                    <DataTable.Header>
                        <DataTable.Row>
                            <DataTable.HeaderCell invalidSorting={true}>No.</DataTable.HeaderCell>
                            <DataTable.HeaderCell invalidSorting={true}>ページ名</DataTable.HeaderCell>
                            <DataTable.HeaderCell invalidSorting={true}>操作</DataTable.HeaderCell>
                        </DataTable.Row>
                    </DataTable.Header>
                    <DataTable.Body>
                        {extendedData &&
                            extendedData.map((info) => this.makeDataRow(info))}
                    </DataTable.Body>
                </DataTable>
            </GarmitBox>
        )
    }
}

PageListBox.propTypes = {
    isLoading: PropTypes.bool,
    extendedData: PropTypes.array,
    editing:PropTypes.number    //編集中の行番号
}