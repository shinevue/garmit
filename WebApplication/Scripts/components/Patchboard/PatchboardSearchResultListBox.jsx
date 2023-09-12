/**
 * @license Copyright 2020 DENSO
 * 
 * PatchboardSearchResultListBox Reactコンポーネント
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
 * 制御一覧ボックスコンポーネント
 * @param {object} patchboardResult 配線盤一覧
 * @param {object} tableSetting 表示設定情報
 * @param {boolean} isLoading ロード中かどうか
 * @param {boolean} isReadOnly 読取専用かどうか
 * @param {function} onEdit 編集ボタン押下時に呼び出す
 * @param {function} onDelete 削除ボタン押下時に呼び出す
 * @param {function} onDisp 表示ボタン押下時に呼び出す
 * @param {function} onTableSettingChange 表の設定変更時に呼び出す
 * @param {function} onColumnSettingChanged 表示設定変更時に呼び出す
 */
export default class PatchboardSearchResultListBox extends Component {
    
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
        const { tableSetting, isLoading, isReadOnly, patchboardResult } = this.props;

        const buttonReadOnly = {};
        buttonReadOnly[BUTTON_OPERATION_TYPE.edit] = isReadOnly;
        buttonReadOnly[BUTTON_OPERATION_TYPE.delete] = isReadOnly;

        return (
            <GarmitBox isLoading={isLoading} title="配線盤一覧">
                {patchboardResult &&
                    <SearchResultTable useCheckbox editButton deleteButton exportButton columnSettingButton useHotKeys
                        searchResult={patchboardResult}
                        initialState={tableSetting}
                        onStateChange={(state) => this.onTableSettingChange(state)}
                        onHoverButtonClick={(button) => this.handleHoverButtonClick(button)}
                        onEditClick={(parameterKeyPairList) => this.handleEditButtonClick(parameterKeyPairList)}
                        onDeleteClick={(parameterKeyPairList) => this.handleDeleteButtonClick(parameterKeyPairList)}
                        exportName={'PatchboardList'}
                        includeDateExportName
                        functionId={FUNCTION_ID_MAP.patchboard}
                        gridNo={1}
                        onColumnSettingChange={() => this.onColumnSettingChanged()}
                        buttonHidden={buttonReadOnly}
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
                const patchboardId = this.getPatchboardId(hoverButton.parameterKeyPairs);
                this.onDelete([patchboardId]);
            } else if (hoverButton.operationType === BUTTON_OPERATION_TYPE.edit) {    //編集
                const patchboardId = this.getPatchboardId(hoverButton.parameterKeyPairs);
                this.onEdit([patchboardId]);
            } else if (hoverButton.operationType === BUTTON_OPERATION_TYPE.detail) {
                // 詳細
                const patchboardId = this.getPatchboardId(hoverButton.parameterKeyPairs);
                this.onDetailClick(patchboardId);
            }
        }
    }

    /**
     * 編集ボタンのクリックイベントハンドラ
     * @param {*} parameterKeyPairList キーペアリスト
     */
    handleEditButtonClick(parameterKeyPairList) {
        const patchboardIds = this.getPatchboardIds(parameterKeyPairList);
        this.onEdit(patchboardIds);
    }

    /**
     * 削除ボタンのクリックイベントハンドラ
     * @param {*} parameterKeyPairList キーペアリスト
     */
    handleDeleteButtonClick(parameterKeyPairList) {        
        const patchboardIds = this.getPatchboardIds(parameterKeyPairList);
        this.onDelete(patchboardIds);
    }

    //#endregion

    //#region イベント呼び出し

    /**
     * 編集イベントメソッド呼び出し
     * @param {array} patchboardIds 配線盤IDリスト
     */
    onEdit(patchboardIds) {
        if (this.props.onEdit) {
            this.props.onEdit(patchboardIds);
        }
    }

    /**
     * 削除ボタンクリックイベント呼び出し
     * @param {array} patchboardIds 配線盤IDリスト
     */
    onDelete(patchboardIds) {
        if (this.props.onDelete) {
            this.props.onDelete(patchboardIds);
        }
    }

    /**
     *詳細ボタンクリックイベント
     *
     * @param {*} patchboardId
     * @memberof PatchboardSearchResultListBox
     */
    onDetailClick(patchboardId){
        if (this.props.onDetail) {
            this.props.onDetail(patchboardId);
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
     * ParameterKeyPairsから配線盤IDを取得する
     * @param {object} parameterKeyPairs キーペア
     */
    getPatchboardId(parameterKeyPairs) {
        const target = parameterKeyPairs.find((pair) => pair.key === "PatchboardId");
        return target.paramater;
    }
    
    /**
     * ParameterKeyPairsのリストから配線盤IDのリストを取得する
     * @param {array} parameterKeyPairList キー情報リスト
     */
    getPatchboardIds(parameterKeyPairList) {
        return parameterKeyPairList.map((pairs) => {
            return this.getPatchboardId(pairs);
        });
    }

    //#endregion
}

PatchboardSearchResultListBox.propTypes = {
    patchboardResult: PropTypes.object,
    tableSetting: PropTypes.object,
    isLoading: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onDetail: PropTypes.func,
    onTableSettingChange: PropTypes.func,
    onColumnSettingChanged: PropTypes.func
};
