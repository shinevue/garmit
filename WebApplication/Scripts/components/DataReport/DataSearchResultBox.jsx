/**
 * Copyright 2017 DENSO Solutions
 * 
 * データ検索結果ボックス Reactコンポーネント
 * <DataSearchResultBox />
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { outputReportResult } from 'exportUtility';
import { FormControl, Row, Col, InputGroup, InputGroupButton, Panel, Grid } from 'react-bootstrap';

import Accordion from 'Common/Widget/Accordion';
import CheckboxList from 'Common/Widget/CheckboxList';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import MultiSelectForm from 'Common/Form/MultiSelectForm';

import GarmitBox from 'Assets/GarmitBox';
import { ExportReportButton } from 'Assets/GarmitButton';

import ReportDataTable from 'DataReport/ReportDataTable';

/**
 * データ検索結果ボックス
 */
export default class DataSearchResultBox extends Component {

    constructor(props) {
        super(props);
        const useDataTypes = (props && props.dataTypes && props.data ) ? this.getUseDataTypes(props.dataTypes, props.data) : [];
        this.state = {
            checkedDataTypes: useDataTypes && useDataTypes.length > 0 ? this.getCheckedDataTypes(useDataTypes) : [],
            useDataTypes: useDataTypes
        };
    }

    /**
     * 新たなPropsを受け取ったときに実行される
     * @param {object} nextProps 
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.dataTypes !== nextProps.dataTypes ||
            this.props.data != nextProps.data) {
            const useDataTypes = nextProps.data ? this.getUseDataTypes(nextProps.dataTypes, nextProps.data) : [];
            this.setState({ 
                checkedDataTypes: this.getCheckedDataTypes(useDataTypes),
                useDataTypes: useDataTypes
            });
        }
    }

    /**
     * データ種別のチェック状態変更イベントハンドラ
     * @param {array} checkedItems チェック状態の項目リスト
     */
    handleCheckedDataTypes(checkedItems) {
        this.setState({ checkedDataTypes: checkedItems });
    }

    /**
     * CSV出力ボタン押下イベントハンドラ
     */
    handleClickExport() {
        // const export2DArray = this.refs.table.getTable2DArray();
        // outputCSVFile(export2DArray, this.props.csvFileName, false);
        const { headerSet, data } = this.props;
        outputReportResult({ headers: headerSet, rows: this.makeExportData(data) } , this.props.csvFileName);        //絞り込みが反映されていない！
    }

    //#region render
    /**
     * render
     */
    render() {        

        const { data, headerSet, isLoading } = this.props;
        const { checkedDataTypes, useDataTypes } = this.state;

        return (
            <GarmitBox title='検索結果' isLoading={isLoading}>
                {data && data.length> 0 &&
                    <div>
                        <Grid fluid>
                            <Row>
                                <Col sm={10}>
                                    <div>
                                        <div style={{ display: 'inline-block' }}>絞り込み：</div>
                                        <div style={{ display: 'inline-block' }}>
                                            <span>データ種別</span>
                                            <MultiSelectForm
                                                className="mr-1 mb-05"
                                                options={useDataTypes && useDataTypes.map((type) => ({ value: type.dtType.toString(), name: type.name }))}
                                                initValue={useDataTypes && useDataTypes.map((type) => type.dtType.toString())}
                                                value={checkedDataTypes}
                                                onChange={(value) => this.handleCheckedDataTypes(value)}
                                            />
                                        </div>
                                    </div>
                                </Col>
                                <Col sm={2}>
                                    <ExportReportButton className="pull-right mb-05" onClick={() => this.handleClickExport()} />
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={12}>
                                    <ReportDataTable ref="table" data={this.makeTableData(data)} headerSet={headerSet} useCheckbox={false} />
                                </Col>
                            </Row>
                        </Grid>
                    </div>
                }
            </GarmitBox>
        );
    }

    //#endregion

    /**
     * データ種別一覧からチェックされているデータ種別一覧を作成する
     * @param {array} dataTypes データ種別一覧
     */
    getCheckedDataTypes(dataTypes) {
        let checkedDataTypes = [];
        dataTypes &&
            dataTypes.forEach((item) => {
            checkedDataTypes.push(item.dtType.toString());
            });
        return checkedDataTypes;
    }

    /**
     * 絞り込みを反映したテーブルデータを作成する
     * @param {array} data オリジナルデータ
     */
    makeTableData(data) {
        if (this.state.checkedDataTypes && this.state.checkedDataTypes.length < this.state.useDataTypes.length) {
            let refinedData = [];
            data.forEach((row) => {
                if (this.displayRow(row, this.state.checkedDataTypes)) {
                    refinedData.push(row); 
                }
            })
            return refinedData;
        }
        return data;    //絞り込みがない場合はそのまま表示
    }

    /**
     * 表示する行かどうかを判定する
     * @param {object} row 行データ
     * @param {array} checkedDataTypes 
     */
    displayRow(row, checkedDataTypes) {
        if (checkedDataTypes.indexOf(row.dataType.dtType.toString()) > -1) {
            return true;
        }
        return false;
    }

    /**
     * エクスポートデータを作成する
     * @param {*} data データ
     */
    makeExportData(data) {
        var exportData = data && _.cloneDeep(this.makeTableData(data));
        exportData.forEach((row) => {
            row.cells.forEach((cell) => {
                cell.value = cell.value && cell.value.replace(/\n/g, "/");   //改行コードをスラッシュに置き換え(エクスポート時に使用)
            })
        })
        return exportData;
    }

    /**
     * 使用中のデータ種別を取得する
     * @param {array} dataTypes 全部入りのデータ種別一覧
     * @param {array} data 一覧に表示するデータ
     * @returns {array} 使用中のデータ種別
     */
    getUseDataTypes(dataTypes, data) {
        var useDataTypes = [];
        for (let index = 0; index < dataTypes.length; index++) {
            const type = dataTypes[index];
            data.some((row) => {
                if (row.dataType.dtType === type.dtType) {
                    useDataTypes.push(_.cloneDeep(type));
                    return true;
                }
            });
        }
        return useDataTypes;
    }
}

DataSearchResultBox.propTypes = {
    data: PropTypes.array,
    headerSet: PropTypes.array,
    dataTypes: PropTypes.arrayOf({
        dtType: PropTypes.string,
        name: PropTypes.string
    }),
    isLoading: PropTypes.bool,
    csvFileName:PropTypes.string
};

