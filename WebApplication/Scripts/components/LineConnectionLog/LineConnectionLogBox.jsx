'use strict';

import React, { Component } from 'react';

import { Grid, Row, Col } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import SearchResultTable from 'Assets/SearchResultTable';

import { FUNCTION_ID_MAP } from 'authentication';
import { BUTTON_OPERATION_TYPE } from 'constant';

/**
 * 回線接続履歴一覧ボックスコンポーネント
 * @param {object} lineConnectionLogResult 回線接続履歴一覧
 * @param {datetime} dateFrom 検索条件の開始日時
 * @param {datetime} dateTo 検索条件の終了日時
 * @param {object} tableSetting 表示設定情報
 * @param {boolean} isLoading ロード中かどうか
 * @param {boolean} isReadOnly 読取専用かどうか
 * @param {function} onEdit 編集ボタン押下時に呼び出す
 * @param {function} onTableSettingChange 表の設定変更時に呼び出す
 * @param {function} onColumnSettingChanged 表示設定変更時に呼び出す
 */
export default class LineConnectionLogBox extends Component {

    constructor() {
        super();
        this.state = {

        };
    }

    /**
     * 出力ファイルの名称を生成する
     */
    createExportName() {
        const { dateFrom, dateTo } = this.props;
        let exportName = 'LineConnectionLog';
        if (dateFrom && dateTo) {
            exportName += '_' + moment(dateFrom).format('YYYYMMDD') + '-' + moment(dateTo).format('YYYYMMDD');
        }
        return exportName;
    }

    /**
     * render
     */
    render() {
        const { lineConnectionLogResult, tableSetting, isLoading, isReadOnly } = this.props;
        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>回線接続履歴</Box.Title>
                </Box.Header >
                <Box.Body>
                    {lineConnectionLogResult &&
                        <Grid fluid>
                            <Row className="">
                                <Col md={12}>
                                    <SearchResultTable useCheckbox editButton exportButton columnSettingButton useHotKeys
                                        searchResult={lineConnectionLogResult}
                                        initialState={tableSetting}
                                        isReadOnly={isReadOnly}
                                        className="mtb-05"
                                        exportName={this.createExportName()}
                                        includeDateExportName={!(this.props.dateFrom && this.props.dateTo)}
                                        functionId={FUNCTION_ID_MAP.lineConnectionLog}
                                        gridNo={1}
                                        onColumnSettingChange={() => this.props.onColumnSettingChange()}
                                        onStateChange={(state) => this.props.onTableSettingChange(state)}
                                        onHoverButtonClick={(button) => this.handleHoverButtonClick(button)}
                                        onEditClick={(parameterKeyPairList) => this.handleEditButtonClick(parameterKeyPairList)}
                                    />
                                </Col>
                            </Row>
                        </Grid>
                    }
                </Box.Body>
            </Box>
        );
    }
    

    
    //#region イベント

    /**
     * ホバーボタンがクリックイベントハンドラ
     * @param {object} hoverButton ホバーボタン情報
     */
     handleHoverButtonClick(hoverButton) {
        if (hoverButton) {
            if (hoverButton.operationType === BUTTON_OPERATION_TYPE.edit) {    //編集
                const histId = this.getHistId(hoverButton.parameterKeyPairs);
                this.onEdit([histId]);
            }
        }
    }

    /**
     * 編集ボタンのクリックイベントハンドラ
     * @param {*} parameterKeyPairList キーペアリスト
     */
     handleEditButtonClick(parameterKeyPairList) {
        const histIds = this.getHistIds(parameterKeyPairList);
        this.onEdit(histIds);
    }

    //#endregion
    
    //#region イベント呼び出し

    /**
     * 編集イベントメソッド呼び出し
     * @param {array} histIds 履歴IDリスト
     */
     onEdit(histIds) {
        if (this.props.onEdit) {
            this.props.onEdit(histIds);
        }
    }

    //#endregion

    //#region 履歴ID取得

    /**
     * ParameterKeyPairsから履歴IDを取得する
     * @param {object} parameterKeyPairs キーペア
     */
    getHistId(parameterKeyPairs) {
        const target = parameterKeyPairs.find((pair) => pair.paramater === 'HistId');
        return target.key;
    }
    
    /**
     * ParameterKeyPairsのリストから履歴IDのリストを取得する
     * @param {array} parameterKeyPairList キー情報リスト
     */
    getHistIds(parameterKeyPairList) {
        return parameterKeyPairList.map((pairs) => {
            return this.getHistId(pairs);
        });
    }

    //#endregion
}