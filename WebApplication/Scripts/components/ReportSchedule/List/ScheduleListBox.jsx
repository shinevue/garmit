/**
 * @license Copyright 2019 DENSO
 * 
 * ScheduleListBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import GarmitBox from 'Assets/GarmitBox';
import SearchResultTable from 'Assets/SearchResultTable';
import { BUTTON_OPERATION_TYPE } from 'constant';
import { FUNCTION_ID_MAP } from 'authentication';

/**
 * レポートスケジュール一覧コンポーネント
 * @param {object} scheduleResult スケジュール一覧
 * @param {object} tableSetting 表示設定情報
 * @param {boolean} isLoading ロード中かどうか
 * @param {boolean} isReadOnly 読取専用かどうか
 * @param {function} onEdit 編集ボタン押下時に呼び出す
 * @param {function} onDelete 削除ボタン押下時に呼び出す
 * @param {function} onDisp 表示ボタン押下時に呼び出す
 * @param {function} onTableSettingChange 表の設定変更時に呼び出す
 * @param {function} onColumnSettingChanged 表示設定変更時に呼び出す
 */
export default class ScheduleListBox extends Component {
    
    /**
     * render
     */
    render() {
        const { scheduleResult, tableSetting, isLoading, isReadOnly } = this.props;
        return (
            <GarmitBox isLoading={isLoading} title="出力スケジュール一覧">
                {scheduleResult ?
                    <SearchResultTable deleteButton useCheckbox columnSettingButton striped={false}
                                       searchResult={scheduleResult}
                                       initialState={tableSetting}
                                       isReadOnly={isReadOnly}
                                       functionId={FUNCTION_ID_MAP.reportSchedule}
                                       gridNo={1}
                                       onStateChange={(state) => this.onTableSettingChange(state)}
                                       onHoverButtonClick={(button) => this.handleHoverButtonClick(button)}
                                       onCellButtonClick={(parameterKeyPairs) => this.handleDispButtonClick(parameterKeyPairs)}
                                       onDeleteClick={(parameterKeyPairList) => this.handleDeleteButtonClick(parameterKeyPairList)}
                                       onColumnSettingChange={() => this.onColumnSettingChanged()}
                    />
                :
                    <div>表示可能なスケジュールはありません</div>
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
                const scheduleId = this.getScheduleId(hoverButton.parameterKeyPairs);
                this.onDelete([scheduleId]);
            } else if (hoverButton.operationType === BUTTON_OPERATION_TYPE.edit) {    //編集
                const scheduleId = this.getScheduleId(hoverButton.parameterKeyPairs);
                this.onEdit(scheduleId);
            }
        }
    }

    /**
     * 表示ボタンのクリックイベントハンドラ
     * @param {any} parameterKeyPairs キーペア
     */
    handleDispButtonClick(parameterKeyPairs) {
        const scheduleId = this.getScheduleId(parameterKeyPairs);
        this.onDisp(scheduleId);
    }

    /**
     * 削除ボタンのクリックイベントハンドラ
     * @param {*} parameterKeyPairList キーペアリスト
     */
    handleDeleteButtonClick(parameterKeyPairList) {
        const scheduleIds = this.getScheduleIds(parameterKeyPairList);
        if (this.props.onDelete) {
            this.props.onDelete(scheduleIds);
        }
    }

    //#endregion

    //#region イベント呼び出し

    /**
     * 編集イベントメソッド呼び出し
     * @param {number} scheduleId スケジュールID
     */
    onEdit(scheduleId) {
        if (this.props.onEdit) {
            this.props.onEdit(scheduleId);
        }
    }

    /**
     * 削除ボタンクリックイベント呼び出し
     * @param {array} scheduleIds スケジュールIDリスト
     */
    onDelete(scheduleIds) {
        if (this.props.onDelete) {
            this.props.onDelete(scheduleIds);
        }
    }

    /**
     * 表示ボタンクリックイベント呼び出し
     * @param {number} scheduleId スケジュールID
     */
    onDisp(scheduleId) {
        if (this.props.onDisp) {
            this.props.onDisp(scheduleId);
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

    onColumnSettingChanged() {
        if (this.props.onColumnSettingChanged) {
            this.props.onColumnSettingChanged();
        }
    }
    //#endregion

    //#region その他

    /**
     * ParameterKeyPairsからScheduleIdを取得する
     * @param {object} parameterKeyPairs キーペア
     */
    getScheduleId(parameterKeyPairs) {
        const target = parameterKeyPairs.find((pair) => pair.paramater === "ReportScheduleId");
        return target.key;
    }
    
    /**
     * ParameterKeyPairsのリストからScheduleIdのリストを取得する
     * @param {array} parameterKeyPairList キー情報リスト
     */
    getScheduleIds(parameterKeyPairList) {
        return parameterKeyPairList.map((pairs) => {
            return this.getScheduleId(pairs);
        });
    }

    //#endregion
}

ScheduleListBox.propsTypes = {
    scheduleResult: PropTypes.object,
    tableSetting: PropTypes.object,
    isLoading: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onDisp: PropTypes.func,
    onTableSettingChange: PropTypes.func,
    onColumnSettingChange: PropTypes.func
}