/**
 * @license Copyright 2021 DENSO
 * 
 * ICCardListBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import GarmitBox from 'Assets/GarmitBox';
import SearchResultTable from 'Assets/SearchResultTable';

import { FUNCTION_ID_MAP } from 'authentication';
import { BUTTON_OPERATION_TYPE } from 'constant';

/**
 * ICカード一覧ボックスコンポーネント
 * @param {object} icCardResult ICカード一覧
 * @param {object} tableSetting 表示設定情報
 * @param {boolean} isLoading ロード中かどうか
 * @param {boolean} isReadOnly 読取専用かどうか
 * @param {function} onEdit 編集ボタン押下時に呼び出す
 * @param {function} onDelete 削除ボタン押下時に呼び出す
 * @param {function} onDisp 表示ボタン押下時に呼び出す
 * @param {function} onTableSettingChange 表の設定変更時に呼び出す
 * @param {function} onColumnSettingChanged 表示設定変更時に呼び出す
 */
export default class ICCardListBox extends Component {
    
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
        const { icCardResult, tableSetting, isLoading, isReadOnly } = this.props;
        return (
            <GarmitBox isLoading={isLoading} title="ICカード一覧">
                {icCardResult && 
                    <SearchResultTable useCheckbox editButton deleteButton exportButton columnSettingButton
                                searchResult={icCardResult}
                                initialState={tableSetting}
                                isReadOnly={isReadOnly}
                                onStateChange={(state) => this.onTableSettingChange(state)}
                                onHoverButtonClick={(button) => this.handleHoverButtonClick(button)}
                                onEditClick={(parameterKeyPairList) => this.handleEditButtonClick(parameterKeyPairList)}
                                onDeleteClick={(parameterKeyPairList) => this.handleDeleteButtonClick(parameterKeyPairList)}
                                exportName="ICCardList"
                                includeDateExportName
                                functionId={FUNCTION_ID_MAP.icCard}
                                gridNo={1}
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
                const cardNo = this.getCardNo(hoverButton.parameterKeyPairs);
                this.onDelete([cardNo]);
            } else if (hoverButton.operationType === BUTTON_OPERATION_TYPE.edit) {    //編集
                const cardNo = this.getCardNo(hoverButton.parameterKeyPairs);
                this.onEdit([cardNo]);
            }
        }
    }

    /**
     * 編集ボタンのクリックイベントハンドラ
     * @param {*} parameterKeyPairList キーペアリスト
     */
    handleEditButtonClick(parameterKeyPairList) {
        const cardNos = this.getCardNos(parameterKeyPairList);
        this.onEdit(cardNos);
    }

    /**
     * 削除ボタンのクリックイベントハンドラ
     * @param {*} parameterKeyPairList キーペアリスト
     */
    handleDeleteButtonClick(parameterKeyPairList) {        
        const cardNos = this.getCardNos(parameterKeyPairList);
        this.onDelete(cardNos);
    }

    //#endregion

    //#region イベント呼び出し

    /**
     * 編集イベントメソッド呼び出し
     * @param {array} cardNos カード番号リスト
     */
    onEdit(cardNos) {
        if (this.props.onEdit) {
            this.props.onEdit(cardNos);
        }
    }

    /**
     * 削除ボタンクリックイベント呼び出し
     * @param {array} cardNos カード番号リスト
     */
    onDelete(cardNos) {
        if (this.props.onDelete) {
            this.props.onDelete(cardNos);
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
     * ParameterKeyPairsから制御IDを取得する
     * @param {object} parameterKeyPairs キーペア
     */
    getCardNo(parameterKeyPairs) {
        const target = parameterKeyPairs.find((pair) => pair.paramater === 'CardNo');
        return target.key;
    }
    
    /**
     * ParameterKeyPairsのリストから制御IDのリストを取得する
     * @param {array} parameterKeyPairList キー情報リスト
     */
    getCardNos(parameterKeyPairList) {
        return parameterKeyPairList.map((pairs) => {
            return this.getCardNo(pairs);
        });
    }

    //#endregion
}

ICCardListBox.propTypes = {
    icCardResult: PropTypes.object,
    tableSetting: PropTypes.object,
    isLoading: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onTableSettingChange: PropTypes.func,
    onColumnSettingChanged: PropTypes.func
}
