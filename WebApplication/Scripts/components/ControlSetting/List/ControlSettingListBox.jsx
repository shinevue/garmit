/**
 * @license Copyright 2019 DENSO
 * 
 * ControlSettingListBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import GarmitBox from 'Assets/GarmitBox';
import SearchResultTable from 'Assets/SearchResultTable';

import { FUNCTION_ID_MAP } from 'authentication';
import { BUTTON_OPERATION_TYPE, CELL_BUTTON_OPERATION_TYPE, CONTROL_MODE } from 'constant';

/**
 * 制御一覧ボックスコンポーネント
 * @param {number} controlMode 制御モード（個別 or デマンド/発電量）
 * @param {object} controlResult スケジュール一覧
 * @param {object} tableSetting 表示設定情報
 * @param {boolean} isLoading ロード中かどうか
 * @param {boolean} isReadOnly 読取専用かどうか
 * @param {function} onEdit 編集ボタン押下時に呼び出す
 * @param {function} onDelete 削除ボタン押下時に呼び出す
 * @param {function} onDisp 表示ボタン押下時に呼び出す
 * @param {function} onTableSettingChange 表の設定変更時に呼び出す
 * @param {function} onColumnSettingChanged 表示設定変更時に呼び出す
 * @param {function} onExecuteCommand コマンド実行を呼び出す
 * @param {function} onStopCommand コマンド停止を呼び出す
 */
export default class ControlSettingListBox extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { };
    }

    /**
     * render
     */
    render() {
        const { controlMode, controlResult, tableSetting, isLoading, isReadOnly } = this.props;
        return (
            <GarmitBox isLoading={isLoading} title="制御一覧">
                {controlResult && 
                    <SearchResultTable useCheckbox editButton deleteButton exportButton columnSettingButton
                                searchResult={controlResult}
                                initialState={tableSetting}
                                isReadOnly={isReadOnly}
                                onStateChange={(state) => this.onTableSettingChange(state)}
                                onHoverButtonClick={(button) => this.handleHoverButtonClick(button)}
                                onEditClick={(parameterKeyPairList) => this.handleEditButtonClick(parameterKeyPairList)}
                                onDeleteClick={(parameterKeyPairList) => this.handleDeleteButtonClick(parameterKeyPairList)}
                                onCellButtonClick={(parameterKeyPairs, operationType) => this.handleCellButtonClick(parameterKeyPairs, operationType)}
                                exportName={controlMode===CONTROL_MODE.command?'ControlCommandList':'DemandControlList'}
                                includeDateExportName
                                functionId={FUNCTION_ID_MAP.controlSettingMaintenance}
                                gridNo={controlMode===CONTROL_MODE.command?1:2}
                                onColumnSettingChange={() => this.onColumnSettingChanged()}
                    />
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
                const controlId = this.getControlId(hoverButton.parameterKeyPairs);
                this.onDelete([controlId]);
            } else if (hoverButton.operationType === BUTTON_OPERATION_TYPE.edit) {    //編集
                const controlId = this.getControlId(hoverButton.parameterKeyPairs);
                this.onEdit([controlId]);
            }
        }
    }

    /**
     * 編集ボタンのクリックイベントハンドラ
     * @param {*} parameterKeyPairList キーペアリスト
     */
    handleEditButtonClick(parameterKeyPairList) {
        const constrolIds = this.getControlIds(parameterKeyPairList);
        this.onEdit(constrolIds);
    }

    /**
     * 削除ボタンのクリックイベントハンドラ
     * @param {*} parameterKeyPairList キーペアリスト
     */
    handleDeleteButtonClick(parameterKeyPairList) {        
        const constrolIds = this.getControlIds(parameterKeyPairList);
        this.onDelete(constrolIds);
    }

    /**
     * セル内のボタンクリックイベント
     * @param {*} parameterKeyPairs キーペアリスト
     * @param {*} operationType 操作種別
     */
    handleCellButtonClick(parameterKeyPairs, operationType) {
        const controlId = this.getControlId(parameterKeyPairs);
        if (operationType === CELL_BUTTON_OPERATION_TYPE.on) {      //ON
            this.onExecuteCommand(controlId);
        } else if (operationType === CELL_BUTTON_OPERATION_TYPE.off) {  //OFF
            this.onStopCommand(controlId);
        }
    }

    //#endregion

    //#region イベント呼び出し

    /**
     * 編集イベントメソッド呼び出し
     * @param {array} controlIds 制御IDリスト
     */
    onEdit(controlIds) {
        if (this.props.onEdit) {
            this.props.onEdit(controlIds);
        }
    }

    /**
     * 削除ボタンクリックイベント呼び出し
     * @param {array} controlIds 制御IDリスト
     */
    onDelete(controlIds) {
        if (this.props.onDelete) {
            this.props.onDelete(controlIds);
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

    /**
     * 制御コマンド実行イベントを呼び出す
     * @param {number} controlId 制御ID
     */
    onExecuteCommand(controlId) {
        if (this.props.onExecuteCommand) {
            this.props.onExecuteCommand(controlId);
        }
    }

    /**
     * 制御コマンド停止イベントを呼び出す
     * @param {number} controlId 制御ID
     */
    onStopCommand(controlId) {
        if (this.props.onStopCommand) {
            this.props.onStopCommand(controlId);
        }
    }
    //#endregion

    //#region その他

    /**
     * ParameterKeyPairsから制御IDを取得する
     * @param {object} parameterKeyPairs キーペア
     */
    getControlId(parameterKeyPairs) {
        const target = parameterKeyPairs.find((pair) => pair.paramater === "ControlCmdId" || pair.paramater === 'TriggerControlId');
        return target.key;
    }
    
    /**
     * ParameterKeyPairsのリストから制御IDのリストを取得する
     * @param {array} parameterKeyPairList キー情報リスト
     */
    getControlIds(parameterKeyPairList) {
        return parameterKeyPairList.map((pairs) => {
            return this.getControlId(pairs);
        });
    }

    //#endregion
}

ControlSettingListBox.propTypes = {
    controlMode: PropTypes.number.isRequired, 
    controlResult: PropTypes.object,
    tableSetting: PropTypes.object,
    isLoading: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onTableSettingChange: PropTypes.func,
    onColumnSettingChanged: PropTypes.func,
    onExecuteCommand: PropTypes.func,
    onStopCommand: PropTypes.func
}
