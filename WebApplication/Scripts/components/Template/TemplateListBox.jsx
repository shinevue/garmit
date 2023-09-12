/**
 * @license Copyright 2018 DENSO
 * 
 * テンプレート一覧ボックス Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row, Col } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import SearchResultTable from 'Assets/SearchResultTable';

import { FUNCTION_ID_MAP, LAVEL_TYPE, readOnlyByLevel } from 'authentication';
import { BUTTON_OPERATION_TYPE, TEMPLATE_TYPE } from 'constant';

/**
 * テンプレート一覧ボックスコンポーネント
 * @param {string} templateType テンプレート種別
 * @param {object} templateList テンプレート一覧（SearchResult型）
 * @param {object} tableSetting 表の設定情報
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {number} level 所属レベル
 * @param {boolean} isLoading ロード中かどうか
 * @param {function} onDelete 削除時に呼び出す
 * @param {function} onChangeTableSetting 表の設定情報の変更時に呼び出す
 * @param {function} onChangeColumnSetting 表示カラム設定を変更したときに呼び出す
 */
export default class TemplateListBox extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
    }

    /**
     * render
     */
    render() {
        const { templateType, templateList, tableSetting, isReadOnly, level, isLoading } = this.props;
        var buttonReadOnly = {};
        buttonReadOnly[BUTTON_OPERATION_TYPE.delete] = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.manager);
        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>検索結果</Box.Title>
                </Box.Header >
                <Box.Body>
                    { (templateList) &&
                        <Grid fluid>
                            <Row className=''>
                                <Col md={12}>
                                    <SearchResultTable deleteButton useCheckbox exportButton columnSettingButton useHotKeys
                                        className='mtb-05'
                                        searchResult={templateList}
                                        initialState={tableSetting}
                                        isReadOnly={isReadOnly}
                                        buttonHidden={buttonReadOnly}
                                        onStateChange={(state) => this.onTableSettingChange(state)}
                                        onHoverButtonClick={(button) => this.handleHoverButtonClick(button)}
                                        onDeleteClick={(parameterKeyPairList) => this.deleteTemplate(parameterKeyPairList)}
                                        exportName={templateType === TEMPLATE_TYPE.rack ? "RackTemplateList" : "UnitTemplateList"}
                                        functionId={FUNCTION_ID_MAP.template}
                                        gridNo={templateType === TEMPLATE_TYPE.rack ? 1 : 2}
                                        onColumnSettingChange={() => this.props.onChangeColumnSetting()}
                                        includeDateExportName
                                    />
                                </Col>
                            </Row>
                        </Grid>
                    }
                </Box.Body>
            </Box>
        );
    }

    /**
     * ホバーボタンクリックイベント
     * @param {object} hoverButton ホバーボタン情報
     */
    handleHoverButtonClick(hoverButton) {
        if (hoverButton) {
            if (hoverButton.operationType === BUTTON_OPERATION_TYPE.delete) {   //削除
                this.deleteTemplate([hoverButton.parameterKeyPairs]);
            }
        }
    }

    /**
     * テンプレートを削除する
     * @param {array} parameterKeyPairList キー情報リスト
     */
    deleteTemplate(parameterKeyPairList) {
        const ids = this.getTemplateIds(parameterKeyPairList);

        if (this.props.onDelete) {
            this.props.onDelete(ids);
        }
    }
    
    /**
     * ParameterKeyPairsのリストからテンプレートIDのリストを取得する
     * @param {array} parameterKeyPairList キー情報リスト
     */
    getTemplateIds(parameterKeyPairList) {
        return parameterKeyPairList.map((pairs) => {
            const target = pairs.find((pair) => pair.paramater === "TemplateId");
            return target.key;
        });
    }

    /**
     * 表示カラム設定変更関数を呼び出す
     */
    onChangeColumnSetting() {
        if (this.props.onChangeColumnSetting) {
            this.props.onChangeColumnSetting();
        }
    }

    /**
     * 表設定情報変更関数を呼び出す
     * @param {object} tableSetting 表の設定情報
     */
    onTableSettingChange(tableSetting) {
        if (this.props.onTableSettingChange) {
            this.props.onTableSettingChange(tableSetting);
        }
    }

}

TemplateListBox.propTypes = {
    templateType: PropTypes.string,
    templateList: PropTypes.array,
    tableSetting: PropTypes.object,
    isReadOnly: PropTypes.bool,
    level: PropTypes.number,
    isLoading: PropTypes.bool,
    onDelete: PropTypes.func,
    onChangeTableSetting: PropTypes.func,
    onChangeColumnSetting: PropTypes.func,
}