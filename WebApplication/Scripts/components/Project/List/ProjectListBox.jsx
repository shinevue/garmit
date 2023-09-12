/**
 * @license Copyright 2020 DENSO
 * 
 * ProjectListBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { ButtonToolbar } from 'react-bootstrap';

import GarmitBox from 'Assets/GarmitBox';
import { ExportReportHotKeyButton } from 'Assets/GarmitButton';
import Button from 'Common/Widget/Button';
import SearchResultTable from 'Assets/SearchResultTable';
import DisplayColumnSettingModal from 'Assets/Modal/DisplayColumnSettingModal';
import ToggleSwitch from 'Common/Widget/ToggleSwitch';

import { outputSearchResult } from 'exportUtility';
import { FUNCTION_ID_MAP } from 'authentication';

import { BUTTON_OPERATION_TYPE } from 'constant';

//定数
const SEARCHRESULT_KEY_LINE = 'lineResult';

/**
 * レポートの出力方法種別
 */
export const OUTPUT_TYPE = {
    only: 1,        //案件のみ
    all: 2,         //まとめて出力
    each: 3         //分けて出力
}

/**
 * 案件一覧ボックス
 * @param {object} projectResult スケジュール一覧
 * @param {object} tableSetting 表示設定情報
 * @param {boolean} isLoading ロード中かどうか
 * @param {boolean} isReadOnly 読取専用かどうか
 * @param {boolean} hideEditButton 編集ボタンを非表示とするかどうか
 * @param {function} onEdit 編集ボタン押下時に呼び出す
 * @param {function} onTableSettingChange 表の設定変更時に呼び出す
 * @param {function} onColumnSettingChanged 表示設定変更時に呼び出す
 */
export default class ProjectListBox extends Component {
    
    static get CSV_TYPE() {
        return [
            { value: OUTPUT_TYPE.only, text: '案件のみ' }, 
            { value: OUTPUT_TYPE.all, text: 'まとめて出力' }, 
            { value: OUTPUT_TYPE.each, text: '分けて出力' }
        ];
    }

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { 
            showModal: false,
            outputType: OUTPUT_TYPE.only,
            outputResult: null
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (!_.isEqual(nextProps.projectResult, this.props.projectResult)) {
            this.setState({
                outputResult: nextProps.projectResult && _.cloneDeep(nextProps.projectResult)
            })
        }
    }

    /**
     * render
     */
    render() {
        const { projectResult, tableSetting, isLoading, isReadOnly, hideEditButton } = this.props;
        const { showModal, outputType } = this.state;
        
        return (
            <GarmitBox isLoading={isLoading} title="案件一覧">
                {projectResult&&
                    <div>
                        <div className="flex-center-right mb-05" >
                            <ButtonToolbar>
                                <Button iconId="listing"
                                        onClick={() => this.changeDisplayColumnSettingModelState(true)}>
                                        表示設定
                                </Button>
                                <ExportReportHotKeyButton onClick={() => this.outputCSV()} />
                            </ButtonToolbar>
                        </div>
                        <div className="flex-center-right mb-05" >
                            出力種別：
                                <ToggleSwitch
                                    value={outputType} 
                                    name="swichCsvType" 
                                    bsSize="xs" 
                                    swichValues={ProjectListBox.CSV_TYPE} 
                                    onChange={(value) => this.changeOutputType(value)} 
                                />
                        </div>
                        <SearchResultTable useCheckbox useHotKeys
                            className='mtb-05'
                            isReadOnly={isReadOnly}
                            editButton={!hideEditButton}
                            searchResult={projectResult}
                            initialState={tableSetting}
                            onStateChange={(state, outputResult) => this.changeTableSetting(state, outputResult)}
                            onHoverButtonClick={(button) => this.handleHoverButtonClick(button)}
                            onEditClick={(parameterKeyPairList) => this.handleEditButtonClick(parameterKeyPairList)}
                        />
                        <DisplayColumnSettingModal
                            showModal={showModal}
                            functionId={FUNCTION_ID_MAP.project}
                            gridNo={1}
                            onHide={() => this.changeDisplayColumnSettingModelState(false)}
                            onSaved={() => this.onColumnSettingChanged()}
                        />
                    </div>
                }
            </GarmitBox>
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
     * ホバーボタンがクリックイベントハンドラ
     * @param {object} hoverButton ホバーボタン情報
     */
    handleHoverButtonClick(hoverButton) {
        if (hoverButton) {
            if (hoverButton.operationType === BUTTON_OPERATION_TYPE.edit) {    //編集
                const projectId = this.getProjectId(hoverButton.parameterKeyPairs);
                this.onEdit([projectId]);
            }
        }
    }

    /**
     * 編集ボタンのクリックイベントハンドラ
     * @param {*} parameterKeyPairList キーペアリスト
     */
    handleEditButtonClick(parameterKeyPairList) {
        const projectIds = this.getProjectIds(parameterKeyPairList);
        this.onEdit(projectIds);
    }

    //#endregion

    
    //#region イベント呼び出し

    /**
     * 編集イベントメソッド呼び出し
     * @param {array} projectIds 案件IDリスト
     */
    onEdit(projectIds) {
        if (this.props.onEdit) {
            this.props.onEdit(projectIds);
        }
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
     * 表示設定変更イベントを呼び出す
     */
    onColumnSettingChanged() {
        if (this.props.onColumnSettingChanged) {
            this.props.onColumnSettingChanged();
        }
    }

    //#endregion
   
    //#region 案件ID取得

    /**
     * ParameterKeyPairsから制御IDを取得する
     * @param {object} parameterKeyPairs キーペア
     */
    getProjectId(parameterKeyPairs) {
        const target = parameterKeyPairs.find((pair) => pair.paramater === 'ProjectId');
        return target.key;
    }
    
    /**
     * ParameterKeyPairsのリストから制御IDのリストを取得する
     * @param {array} parameterKeyPairList キー情報リスト
     */
    getProjectIds(parameterKeyPairList) {
        return parameterKeyPairList.map((pairs) => {
            return this.getProjectId(pairs);
        });
    }

    //#endregion

    //#region CSV出力
    
    /**
     * CSV出力する
     */
    outputCSV() {
        const { outputType, outputResult } = this.state;
        const projectFileName = 'ProjectList';
        switch (outputType) {
            case OUTPUT_TYPE.all:
                this.outputSearchResultIncludingSubInfo(outputResult, projectFileName);
                break;
            case OUTPUT_TYPE.each:
                outputSearchResult(outputResult, projectFileName, true);
                this.outputSubList(outputResult, 'ProjectLineList', SEARCHRESULT_KEY_LINE);
                break;

            default:
                outputSearchResult(outputResult, projectFileName, true);
                break;
        }
    }

    /**
     * サブ情報（回線一覧）を出力する
     * @param {object} searchResult 検索結果一覧
     * @param {string} fileName ファイル名称
     * @param {string} key キー文字列
     */
    outputSubList(searchResult, fileName, key) {
        const results = this.joinSearchResults(searchResult, key);
        if (results.length > 0) {
            outputSearchResult(this.margeSearchResult(results), fileName, true);
        }
    }

    /**
     * 出力対象の一覧を結合する
     * @param {object} searchResult 検索結果一覧
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
    margeSearchResult(results) {
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
     * サブ情報（回線情報）を含んだSearchResulutリストを出力する
     * @param {object} searchResult 
     * @param {name} fileName 
     */
    outputSearchResultIncludingSubInfo(searchResult, fileName) {
        var allSearchResulut = _.cloneDeep(searchResult);
        allSearchResulut.headers = this.getAllHeaders(searchResult);
        
        const maxLength = this.getSubResultMaxLength(allSearchResulut, SEARCHRESULT_KEY_LINE);

        //セルを追加していく
        allSearchResulut.rows.forEach(row => {
            row.cells = row.cells.concat(this.getJoinCellList(row[SEARCHRESULT_KEY_LINE], maxLength));
        });

        outputSearchResult(allSearchResulut, fileName, true);
    }

    /**
     * 全項目入りのヘッダを取得する
     * @param {object} searchResult 検索結果
     * @returns {array} ヘッダー
     */
    getAllHeaders(searchResult) {
        var headers = Object.assign([], searchResult.headers);
        headers = headers.concat(this.getSubResultHeaders(searchResult, SEARCHRESULT_KEY_LINE));
        return headers;
    }

    /**
     * サブ情報のヘッダーを取得する
     * @param {object} searchResult 検索結果
     * @param {string} key キー文字列
     * @returns {array} ヘッダー配列
     */
    getSubResultHeaders(searchResult, key) {
        const maxLength = this.getSubResultMaxLength(searchResult, key);
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
                headers.push('【' + number + '】' + header);
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
            let count = 0;
            searchResult.rows.forEach((row) => {
                if (row.rows && row.rows.length > 0) {
                    let beforeCells = row.cells ? row.cells.slice(1, row.rowsIndex) : [];
                    let afterCells = row.cells ? row.cells.slice(row.rowsIndex, row.cells.length) : [];            
                    row.rows.forEach((splitRow) => {
                        cells = cells.concat(beforeCells.concat(_.cloneDeep(splitRow.cells), afterCells));
                        count++;
                    })
                } else {
                    cells = cells.concat(_.cloneDeep(row.cells));
                    count++;
                }
            });

            for (let index = count; index < maxLength; index++) {
                cells = cells.concat(new Array(searchResult.headers.length - 1).fill({ value: '' }));
            }
        }
        return cells;
    }

    /**
     * サブ情報の最大行数を取得する
     * @param {object} searchResult 検索結果
     * @param {string} key キー文字列
     * @returns {number} 最大列数
     */
    getSubResultMaxLength(searchResult, key) {
        var maxLength = 0;
        searchResult.rows.forEach((row) => { 
            if (row[key]) {
                let length = row[key].rows.length;
                if (length > 0) {
                    row[key].rows.forEach((subRow) => {
                        if (subRow.rows.length > 0) {
                            length = length + subRow.rows.length - 1;
                        }                        
                    })
                }
                if (length > maxLength) {
                    maxLength = length;
                }
            }
        });
        return maxLength;
    }

    //#endregion
}


ProjectListBox.propTypes = {
    isLoading: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    projectResult: PropTypes.object,
    tableSetting: PropTypes.object,
    onEdit: PropTypes.func,
    onTableSettingChange: PropTypes.func,
    onColumnSettingChanged: PropTypes.func
}