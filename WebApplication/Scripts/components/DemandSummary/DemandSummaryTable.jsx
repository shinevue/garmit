'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import DataTable from 'Common/Widget/DataTable';

import { SEARCHRESULT_CELL_TYPE } from 'constant';

export default class DemandSummaryTable extends Component {

    constructor() {
        super();
        this.state = {
            
        };
        this.table = null;
    }

    /**
     * componentDidMount
     */
    componentDidMount() {
        this.setDataTable();
    }

    /**
     * componentWillReceiveProps
     * @param {any} nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.demandSummaryResult !== nextProps.demandSummaryResult) {
            if (this.table) {
                this.table.destroy();
                this.table = null;
            }
        }
    }

    /**
     * componentDidUpdate
     */
    componentDidUpdate(prevProps) {
        if (this.props.demandSummaryResult !== prevProps.demandSummaryResult) {
            this.setDataTable();
        }
    }

    /**
     * データテーブルの設定
     */
    setDataTable() {
        this.table = $('#table').DataTable({
            "scrollY": 500,
            "scrollCollapse": true,
            "scrollX": false,
            "paging": false,
            "ordering": false,
            "info": false,
            "searching": false,
            language: {
                "zeroRecords": "該当するデータが存在しません"
            }
        });

        $(window).resize(() => {
            this.table.columns.adjust().draw();
        });        
    }

    /**
     * セルの値を生成する
     * @param {any} cell
     */
    makeCellValue(cell) {
        switch (cell.cellType) {
            case SEARCHRESULT_CELL_TYPE.link:
                return (
                    <a href="#" onClick={() => this.props.onCellLinkClick(cell.parameterKeyPairs)}>
                        {cell.value}
                    </a>
                );

            default:
                return cell.value;
        }
    }

    /**
     * render
     */
    render() {
        const { headers, rows } = this.props.demandSummaryResult;

        return (
            <DataTable ref="table" hover={true} striped={true} noFooter={true} id="table">
                <DataTable.Header>
                    <DataTable.Row>
                        {headers.map((header) => <DataTable.HeaderCell invalidSorting>{header}</DataTable.HeaderCell>)}
                    </DataTable.Row>
                </DataTable.Header>
                <DataTable.Body>
                    {rows.map((row) =>
                        <DataTable.Row>
                            {row.cells.map((cell) =>
                                <DataTable.Cell style={{ backgroundColor: cell.backColor, color: cell.foreColor, textAlign: cell.align }}>
                                    {this.makeCellValue(cell)}
                                </DataTable.Cell>
                            )}
                        </DataTable.Row>
                    )}                    
                </DataTable.Body>
            </DataTable>
        );
    }
}