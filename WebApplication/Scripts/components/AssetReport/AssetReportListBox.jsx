/**
 * @license Copyright 2018 DENSO
 * 
 * AssetReportListBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row, Col, ButtonToolbar } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import Button from 'Common/Widget/Button';
import SearchResultTable from 'Assets/SearchResultTable';
import DisplayColumnSettingModal from 'Assets/Modal/DisplayColumnSettingModal';
import ToggleSwitch from 'Common/Widget/ToggleSwitch';
import { ExportReportHotKeyButton } from 'Assets/GarmitButton';

import { outputSearchResult } from 'exportUtility';
import { FUNCTION_ID_MAP } from 'authentication';
import { ASSET_REPORT_TYPE, ASSET_REPORT_OUTPUT_TYPE } from 'constant';

//定数
const SEARCHRESULT_KEY_RACKPOWER = 'rackPowerReport';
const SEARCHRESULT_KEY_UNITPOWER = 'unitPowerReport';
const SEARCHRESULT_KEY_UNITNETWORK = 'unitNetworkReport';

/**
 * アセットレポート一覧ボックスコンポーネント
 * @param {number} reportType 出力対象
 * @param {array} reportList アセットレポート一覧
 * @param {object} tableSetting 表示設定情報
 * @param {boolean} isLoading ロード中かどうか
 * @param {function} onTableSettingChange 表の設定変更時に呼び出す
 * @param {function} onApplyLocationCondition ロケーション条件適用時に呼び出す
 * @param {function} onColumnSettingChanged 表示設定変更時に呼び出す
 */
export default class AssetReportListBox extends Component {
    
    static get CSV_TYPE_RACK() {
        return [
            { value: ASSET_REPORT_OUTPUT_TYPE.only, text: 'ラックのみ' }, 
            { value: ASSET_REPORT_OUTPUT_TYPE.all, text: 'まとめて出力' }, 
            { value: ASSET_REPORT_OUTPUT_TYPE.each, text: '分けて出力' }
        ];
    }

    static get CSV_TYPE_UNIT() {
        return [
            { value: ASSET_REPORT_OUTPUT_TYPE.only, text: 'ユニットのみ' }, 
            { value: ASSET_REPORT_OUTPUT_TYPE.all, text: 'まとめて出力' }, 
            { value: ASSET_REPORT_OUTPUT_TYPE.each, text: '分けて出力' }
        ];
    }

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { 
            showModal: false,
            outputType: ASSET_REPORT_OUTPUT_TYPE.only,
            outputResult: null
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (nextProps.reportType !== this.props.reportType) {
            this.setState({
                outputType: ASSET_REPORT_OUTPUT_TYPE.only,
                outputResult: null
            });
        } else if (!_.isEqual(nextProps.reportList, this.props.reportList)) {
            this.setState({
                outputResult: nextProps.reportList && Object.assign({}, nextProps.reportList)
            })
        }
    }

    /**
     * render
     */
    render() {
        const { reportType, reportList, tableSetting, isLoading } = this.props;
        const { showModal, outputType } = this.state;
        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>検索結果</Box.Title>
                </Box.Header >
                <Box.Body>
                    { (reportList) &&
                        <Grid fluid>
                            <Row className="mb-05">
                                <Col md={12}>
                                    {reportType === ASSET_REPORT_TYPE.rack && 
                                        <Button iconId="location-select"
                                                disabled={reportList.length === 0}
                                                onClick={() => this.onApplyLocationCondition()} >
                                                条件に適用
                                        </Button>
                                    }
                                    <div className="ta-r pull-right">
                                        <ButtonToolbar>
                                            <Button iconId="listing"
                                                    onClick={() => this.changeDisplayColumnSettingModelState(true)}>
                                                    表示設定
                                            </Button>
                                            <ExportReportHotKeyButton
                                                    onClick={() => this.outputCSV()} 
                                            />
                                        </ButtonToolbar>
                                    </div>
                                </Col>
                            </Row>
                            <Row className="mb-1">
                                <Col md={12}>                        
                                    <div className="pull-right">
                                        出力種別：
                                        <ToggleSwitch
                                                  value={outputType} 
                                                  name="swichCsvType" 
                                                  bsSize="xs" 
                                                  swichValues={reportType === ASSET_REPORT_TYPE.rack ? AssetReportListBox.CSV_TYPE_RACK : AssetReportListBox.CSV_TYPE_UNIT} 
                                                  onChange={(value) => this.changeOutputType(value)} 
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <Row className=''>
                                <Col md={12}>
                                    <SearchResultTable 
                                        className='mtb-05'
                                        searchResult={reportList}
                                        initialState={tableSetting}
                                        onStateChange={(state, outputResult) => this.changeTableSetting(state, outputResult)}
                                    />
                                </Col>
                            </Row>
                            <DisplayColumnSettingModal
                                showModal={showModal}
                                functionId={FUNCTION_ID_MAP.assetReport}
                                gridNo={reportType === ASSET_REPORT_TYPE.rack ? 1 : 2}
                                onHide={() => this.changeDisplayColumnSettingModelState(false)}
                                onSaved={() => this.onColumnSettingChanged()}
                            />
                        </Grid>
                    }
                </Box.Body>
            </Box>
        );
    }

    //#region イベント

    /********************************************
     * イベント
     ********************************************/

    /**
     * 出力種別を変更する
     * @param {string} outputTypeText 変更後の出力種別
     */
    changeOutputType(outputTypeText) {
        const outputType = parseInt(outputTypeText);
        this.setState({ outputType: outputType });
    }

    /**
     * 表示設定モーダルの表示状態を変更する
     * @param {boolean} show モーダルを表示するかどうか
     */
    changeDisplayColumnSettingModelState(show){
        this.setState({ showModal: show });
    }

    /**
     * 表示設定変更イベントを呼び出す
     */
    onColumnSettingChanged() {
        if (this.props.onColumnSettingChanged) {
            this.props.onColumnSettingChanged();
        }
    }

    /**
     * 表の設定を変更する
     * @param {object} setting 設定情報 
     * @param {*} outputList 
     */
    changeTableSetting(setting, outputResult) {
        this.setState({
                outputResult: outputResult
            },
            this.onTableSettingChange(setting)
        )        
    }

    /**
     * 表の設定変更イベントを呼び出す
     * @param {object} setting 設定情報 
     */
    onTableSettingChange(setting) {
        if (this.props.onTableSettingChange) {
            this.props.onTableSettingChange(setting);
        }
    }

    /**
     * ロケーション条件を適用するイベントを呼び出す
     */
    onApplyLocationCondition() {
        if (this.props.onApplyLocationCondition) {
            this.props.onApplyLocationCondition(this.getLocationIds());
        }
    }

    /**
     * ロケーションIDリストを取得する
     */
    getLocationIds() {
        const { reportList } = this.props;
        var locationIds = [];
        reportList.rows.forEach((row) => {
            const { parameterKeyPairs } = row;
            if (parameterKeyPairs && parameterKeyPairs.length === 1) {
                locationIds.push(parseInt(parameterKeyPairs[0].key));
            }
        })
        return locationIds;
    }

    //#endregion

    //#region CSV出力
    
    /********************************************
     * CSV出力
     ********************************************/

    /**
     * CSV出力する
     */
    outputCSV() {
        const { reportType } = this.props;
        const { outputResult } = this.state;
        const fileTimeString = moment().format('YYYYMMDDHHmmss');
        var fileName = (reportType === ASSET_REPORT_TYPE.rack) ? 'RackListReport' : 'UnitListReport';
        fileName = fileName + '_' + fileTimeString;         //出力時刻をいれる
        switch (this.state.outputType) {
            case  ASSET_REPORT_OUTPUT_TYPE.all:
                this.outputSearchResultIncludingSubInfo(outputResult, fileName);
                break;
            case  ASSET_REPORT_OUTPUT_TYPE.each:
                outputSearchResult(outputResult, fileName);
                this.outputEveryReport(outputResult, 'RackPowerListReport_' + fileTimeString, SEARCHRESULT_KEY_RACKPOWER);
                this.outputEveryReport(outputResult, 'UnitPowerListReport_' + fileTimeString, SEARCHRESULT_KEY_UNITPOWER);
                this.outputEveryReport(outputResult, 'UnitNetworkListReport_' + fileTimeString, SEARCHRESULT_KEY_UNITNETWORK);
                break;
            default:
                outputSearchResult(outputResult, fileName);
                break;
        }
    }

    /**
     * 各種レポートを出力する
     * @param {object} searchResult アセットレポート検索結果一覧
     * @param {string} fileName ファイル名称
     * @param {string} key キー文字列
     */
    outputEveryReport(searchResult, fileName, key) {
        const results = this.joinSearchResults(searchResult, key);
        if (results.length > 0) {
            outputSearchResult(this.mergeSearchResult(results), fileName);
        }
    }

    /**
     * 出力対象のレポートを結合する
     * @param {object} searchResult アセットレポート検索結果一覧
     * @param {string} key キー文字列
     * @returns {array} 結合したSearchResulut
     */
    joinSearchResults(searchResult, key) {
        var results = [];
        searchResult.rows.forEach((row) => { 
            if (row[key]) {
                results.push(row[key]);
            }
        });
        return results;
    }
    
    /**
     * SearchResulutリストを１つのSearchResulutにマージする
     * @param {array} results マージ対象のSearchResulutリスト
     * @returns {object} SearchResulut
     */
    mergeSearchResult(results) {
        var rows = [];
        results.forEach(result => {
            if (result.rows && result.rows.length > 0) {
                rows = rows.concat(Object.assign([], result.rows));
            }            
        });
        return {
            headers: results[0].headers,
            rows: rows
        }
    }

    /**
     * サブ情報（電源やネットワーク情報）を含んだSearchResulutリストを出力する
     * @param {*} searchResult 
     * @param {*} fileName 
     */
    outputSearchResultIncludingSubInfo(searchResult, fileName) {
        var allSearchResulut = JSON.parse(JSON.stringify(searchResult));
        allSearchResulut.headers = this.getAllHeaders(searchResult);
        
        const maxLength = {
            rackPower: this.getSubResultColumnMaxLength(allSearchResulut, SEARCHRESULT_KEY_RACKPOWER),
            unitPower: this.getSubResultColumnMaxLength(allSearchResulut, SEARCHRESULT_KEY_UNITPOWER),
            unitNetwork: this.getSubResultColumnMaxLength(allSearchResulut, SEARCHRESULT_KEY_UNITNETWORK)
        }

        //セルを追加していく
        allSearchResulut.rows.forEach(row => {
            row.cells = row.cells.concat(this.getJoinCellList(row[SEARCHRESULT_KEY_RACKPOWER], maxLength.rackPower));
            row.cells = row.cells.concat(this.getJoinCellList(row[SEARCHRESULT_KEY_UNITPOWER], maxLength.unitPower));
            row.cells = row.cells.concat(this.getJoinCellList(row[SEARCHRESULT_KEY_UNITNETWORK], maxLength.unitNetwork));
        });

        outputSearchResult(allSearchResulut, fileName);
    }

    /**
     * 全項目入りのヘッダを取得する
     * @param {object} searchResult 検索結果
     * @returns {array} ヘッダー
     */
    getAllHeaders(searchResult) {
        var headers = Object.assign([], searchResult.headers);
        headers = headers.concat(this.getEveryHeaders(searchResult, SEARCHRESULT_KEY_RACKPOWER));
        headers = headers.concat(this.getEveryHeaders(searchResult, SEARCHRESULT_KEY_UNITPOWER));
        headers = headers.concat(this.getEveryHeaders(searchResult, SEARCHRESULT_KEY_UNITNETWORK));
        return headers;
    }

    /**
     * 各ヘッダーを取得する
     * @param {object} searchResult 検索結果
     * @param {string} key キー文字列
     * @returns {array} ヘッダー配列
     */
    getEveryHeaders(searchResult, key) {
        const maxLength = this.getSubResultColumnMaxLength(searchResult, key);
        var tempHeaders;
        var headers = [];
        if (maxLength > 0) {
            tempHeaders = Object.assign([], searchResult.rows[0][key].headers);
        }

        if (tempHeaders && maxLength) {
            for (let index = 0; index < maxLength; index++) {
                headers = headers.concat(this.addNumberToHeaders(tempHeaders, index + 1));
            }
        }

        return headers;
    }

    /**
     * ヘッダーにナンバーをつける
     * @param {array} tempHeaders ヘッダのテンプレート
     * @param {number} number ナンバー
     * @returns {array} ナンバー付きのヘッダ
     */
    addNumberToHeaders(tempHeaders, number) {
        var headers = [];
        tempHeaders.forEach((header, index) => {
            if (index !== 0) {
                headers.push(header + '(' + number + ')');
            }
        });
        return headers;
    }

    /**
     * SearchResulutのセルを結合したセルリストを取得する
     * @param {object} searchResult 対象のSearchResulut
     * @param {number} maxLength 最大数
     * @returns {array} セルリスト
     */
    getJoinCellList(searchResult, maxLength) {
        var cells = [];
        if (searchResult) {
            for (let index = 0; index < maxLength; index++) {
                const row = searchResult.rows[index];
                if (row) {
                    cells = cells.concat(Object.assign([], row.cells.slice(1)));
                } else {
                    cells = cells.concat(new Array(searchResult.headers.length - 1).fill({ value: '' }));
                }
            }
        }
        return cells;
    }

    /**
     * サブ情報の最大列数を取得する
     * @param {object} searchResult 検索結果
     * @param {string} key キー文字列
     * @returns {number} 最大列数
     */
    getSubResultColumnMaxLength(searchResult, key) {
        var maxLength = 0;
        searchResult.rows.forEach((row) => { 
            if (row[key]) {
                if (row[key].rows.length > maxLength) {
                    maxLength = row[key].rows.length;
                }
            }
        });
        return maxLength;
    }

    //#endregion

}

AssetReportListBox.propTypes = {
    reportType: PropTypes.number.isRequired, 
    reportList: PropTypes.array, 
    tableSetting: PropTypes.object,
    isLoading: PropTypes.bool,
    onTableSettingChange: PropTypes.func,
    onApplyLocationCondition: PropTypes.func,
    onColumnSettingChanged: PropTypes.func
}