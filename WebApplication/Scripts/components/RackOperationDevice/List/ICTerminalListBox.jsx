/**
 * @license Copyright 2021 DENSO
 * 
 * ICTerminalListBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import GarmitBox from 'Assets/GarmitBox';
import SearchResultTable from 'Assets/SearchResultTable';
import { BUTTON_OPERATION_TYPE } from 'constant';
import { FUNCTION_ID_MAP } from 'authentication';


/**
 * ラック施開錠端末一覧コンポーネント
 * @param {object} terminalResult ラック施開錠端末一覧
 * @param {object} tableSetting 表示設定情報
 * @param {boolean} isLoading ロード中かどうか
 * @param {boolean} isReadOnly 読取専用かどうか
 * @param {function} onEdit 編集ボタン押下時に呼び出す
 * @param {function} onDelete 削除ボタン押下時に呼び出す
 * @param {function} onTableSettingChange 表の設定変更時に呼び出す
 * @param {function} onColumnSettingChanged 表示設定変更時に呼び出す
 */
export default class ICTerminalListBox extends Component {
    
    /**
     * render
     */
     render() {
        const { terminalResult, tableSetting, isLoading, isReadOnly } = this.props;
        return (            
            <GarmitBox isLoading={isLoading} title="ラック施開錠端末一覧">
                {terminalResult ?                          
                    <SearchResultTable useCheckbox deleteButton exportButton columnSettingButton
                                    searchResult={terminalResult}
                                    initialState={tableSetting}
                                    isReadOnly={isReadOnly}
                                    exportName="RackOperationDeviceList"
                                    includeDateExportName
                                    functionId={FUNCTION_ID_MAP.rackOperationDevice}
                                    gridNo={1}
                                    onStateChange={(state) => this.onTableSettingChange(state)}
                                    onHoverButtonClick={(button) => this.handleHoverButtonClick(button)}
                                    onDeleteClick={(parameterKeyPairList) => this.handleDeleteButtonClick(parameterKeyPairList)}
                                    onColumnSettingChange={() => this.onColumnSettingChanged()}
                    />
                :
                    <div>表示可能な端末はありません</div>
                }
            </GarmitBox>
        );
    }

    //#region イベントハンドラ

    /**
     * ホバーボタンがクリックイベントハンドラ
     * @param {object} hoverButton ホバーボタン情報
     */
    handleHoverButtonClick(hoverButton) {
        if (hoverButton) {
            if (hoverButton.operationType === BUTTON_OPERATION_TYPE.delete) {   //削除
                const termNo = this.getTermNo(hoverButton.parameterKeyPairs);
                this.onDelete([termNo]);
            } else if (hoverButton.operationType === BUTTON_OPERATION_TYPE.edit) {    //編集
                const termNo = this.getTermNo(hoverButton.parameterKeyPairs);
                this.onEdit(termNo);
            }
        }
    }

    /**
     * 削除ボタンのクリックイベントハンドラ
     * @param {*} parameterKeyPairList キーペアリスト
     */
    handleDeleteButtonClick(parameterKeyPairList) {
        const termNos = this.getTermNos(parameterKeyPairList);
        if (this.props.onDelete) {
            this.props.onDelete(termNos);
        }
    }

    //#endregion

    //#region イベント呼び出し

    /**
     * 編集イベントメソッド呼び出し
     * @param {number} termNo 端末番号
     */
    onEdit(termNo) {
        if (this.props.onEdit) {
            this.props.onEdit(termNo);
        }
    }

    /**
     * 削除ボタンクリックイベント呼び出し
     * @param {array} termNos 端末番号リスト
     */
    onDelete(termNos) {
        if (this.props.onDelete) {
            this.props.onDelete(termNos);
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

    //#region その他

    /**
     * ParameterKeyPairsからTermNoを取得する
     * @param {object} parameterKeyPairs キーペア
     */
    getTermNo(parameterKeyPairs) {
        const target = parameterKeyPairs.find((pair) => pair.paramater === "TermNo");
        return target.key;
    }
    
    /**
     * ParameterKeyPairsのリストからTermNoのリストを取得する
     * @param {array} parameterKeyPairList キー情報リスト
     */
    getTermNos(parameterKeyPairList) {
        return parameterKeyPairList.map((pairs) => {
            return this.getTermNo(pairs);
        });
    }

    //#endregion
}