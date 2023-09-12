/**
 * @license Copyright 2020 DENSO
 * 
 * LineListBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import GarmitBox from 'Assets/GarmitBox';
import SearchResultTable from 'Assets/SearchResultTable';
import { FUNCTION_ID_MAP } from 'authentication';
import { BUTTON_OPERATION_TYPE } from 'constant';

/**
 * 回線一覧ボックス
 * @param {object} lineResult 回線
 * @param {object} tableSetting 表示設定情報
 * @param {boolean} isLoading ロード中かどうか
 * @param {boolean} isReadOnly 読取専用かどうか
 * @param {function} onEdit 編集ボタン押下時に呼び出す
 * @param {function} onUpload アップロードボタン押下時に呼び出す
 * @param {function} onShowFileList ファイルボタン押下時に呼び出す
 * @param {function} onTableSettingChange 表の設定変更時に呼び出す
 * @param {function} onColumnSettingChanged 表示設定変更時に呼び出す
 */

export default class LineListBox extends Component {
    
    /**
     * render
     */
    render() {
        const { lineResult, tableSetting, isLoading, isReadOnly } = this.props;        
        return (
            <GarmitBox isLoading={isLoading} title="回線一覧">
                {lineResult && 
                    <SearchResultTable useCheckbox uploadButton exportButton columnSettingButton useHotKeys
                                searchResult={lineResult}
                                initialState={tableSetting}
                                isReadOnly={isReadOnly}
                                onStateChange={(state) => this.onTableSettingChange(state)}
                                onHoverButtonClick={(button) => this.handleHoverButtonClick(button)}
                                onUploadClick={(parameterKeyPairList) => this.handleUploadButtonClick(parameterKeyPairList)}
                                onCellButtonClick={(parameterKeyPairs) => this.handleCellButtonClick(parameterKeyPairs)}
                                exportName="LineList"
                                includeDateExportName
                                functionId={FUNCTION_ID_MAP.line}
                                gridNo={1}
                                onColumnSettingChange={() => this.onColumnSettingChanged()}
                    />
                }
            </GarmitBox>
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
                const patchCableData = this.getPatchCableData(hoverButton.parameterKeyPairs);
                this.onEdit(patchCableData);
            }
        }
    }

    /**
     * アップロードボタンのクリックイベントハンドラ
     * @param {*} parameterKeyPairList キーペアリスト
     */
    handleUploadButtonClick(parameterKeyPairList) {        
        const patchCableDataList = this.getPatchCableDataList(parameterKeyPairList);
        this.onUpload(patchCableDataList);
    }

    /**
     * ファイルボタンのクリックイベント
     * @param {array} parameterKeyPairs キーペア
     */
    handleCellButtonClick(parameterKeyPairs) {
        const patchCableData = this.getPatchCableData(parameterKeyPairs);
        this.onShowFileList(patchCableData);
    }

    //#endregion

    
    //#region イベント呼び出し

    /**
     * 編集イベントメソッド呼び出し
     * @param {array} patchCableData 分電盤ID/線番
     */
    onEdit(patchCableData) {
        if (this.props.onEdit) {
            this.props.onEdit(patchCableData.patchboardId, patchCableData.cableNo);
        }
    }

    /**
     * アップロードボタンメソッド呼び出し
     * @param {array} patchCableDataList 分電盤/線番リスト
     */
    onUpload(patchCableDataList) {
        if (this.props.onUpload) {
            this.props.onUpload(patchCableDataList);
        }
    }

    /**
     * ファイル一覧表示メソッドの呼び出し
     * @param {object} patchCableData 分電盤ID/線番
     */
    onShowFileList(patchCableData) {
        if (this.props.onShowFileList) {
            this.props.onShowFileList(patchCableData);
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
   
    //#region 配線盤ID/線番取得

    /**
     * ParameterKeyPairsから配線盤ID/線番を取得する
     * @param {object} parameterKeyPairs キーペア
     */
    getPatchCableData(parameterKeyPairs) {
        const targetPatchboardId = parameterKeyPairs.find((pair) => pair.paramater === 'PatchboardId');
        const targetCableNo = parameterKeyPairs.find((pair) => pair.paramater === 'CableNo');
        return {
            patchboardId: targetPatchboardId.key,
            cableNo: targetCableNo.key
        }
    }
    
    /**
     * ParameterKeyPairsのリストから配線盤ID/線番のリストを取得する
     * @param {array} parameterKeyPairList キー情報リスト
     */
    getPatchCableDataList(parameterKeyPairList) {
        return parameterKeyPairList.map((pairs) => {
            return this.getPatchCableData(pairs);
        });
    }

    //#endregion

    
}


LineListBox.propTypes = {
    lineResult: PropTypes.object,
    isLoading: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    tableSetting: PropTypes.object,
    onEdit: PropTypes.func,
    onUpload: PropTypes.func,
    onShowFileList: PropTypes.func,
    onTableSettingChange: PropTypes.func,
    onColumnSettingChanged: PropTypes.func
}