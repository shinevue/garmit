/**
 * Copyright 2017 DENSO Solutions
 * 
 * 管理項目設定入力リストRow Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row, Col, Checkbox, FormGroup } from 'react-bootstrap';

import InputTableRow from 'Common/Form/InputTableRow';

import MessageModal from 'Assets/Modal/MessageModal';

import { validateText, validateInteger, validateFormatString } from 'inputCheck';
import { getDateFormat } from 'datetimeUtility';
import { COLUMN_INDEX } from 'extendedDataUtility';

export default class ItemSettingInputListRow extends Component {

    constructor(props) {
        super(props)
        this.state = {
            dataChangeModalInfo: {
                show: false,
                itemId: null,
                value: null
            },
        }
    }

    /**
     * コンポーネントをアップデートするかどうか
     */
    shouldComponentUpdate(nextProps, nextState) {
        if (JSON.stringify(nextProps.rowInfo) !== JSON.stringify(this.props.rowInfo)) {
            return true;
        }
        else if (nextState.dataChangeModalInfo.show !== this.state.dataChangeModalInfo.show) {
            return true;
        }
    }

    /**
     * データ型変更確認モーダル表示イベント
     * @param {number} itemId  変更された項目番号（行を特定）
     * @param {string} value 変更後の値（文字列）
     */
    confirmChangeType(itemId, value) {
        this.setState({
            dataChangeModalInfo: {
                show: true,
                itemId: itemId,
                type: isNaN(value) ? 0 : Number(value)
            }
        });
    }

    /**
    * 入力フォーム変更イベントハンドラ
    */
    handleChange = (colInfo, e) => {
        let valueObj;
        switch (colInfo.index) {
            case COLUMN_INDEX.enableCheck:
                valueObj = { enable: e.target.checked };
                break;
            case COLUMN_INDEX.searchableCheck:
                valueObj = { isSearchable: e.target.checked };
                break;
            case COLUMN_INDEX.itemName:
                valueObj = { name: e };
                break;
            case COLUMN_INDEX.dataType:
                if (!this.state.dataChangeModalInfo.show) {
                    this.confirmChangeType(colInfo.itemId, e);
                    return;
                }
                else {    
                    this.clearDataChangeModalInfo();
                    valueObj = { type: e };
                }
                break;
            case COLUMN_INDEX.dataFormat:
            case COLUMN_INDEX.alarmState:
                valueObj = { ...e };
                break;

            case COLUMN_INDEX.isSysAdmin:
                valueObj = { isSysAdmin: e.target.checked };
                break;
        }
        if (this.props.onChangeInput) {
            this.props.onChangeInput(colInfo.itemId, valueObj);
        }
    }

    //#region render
    /**
     * render
     */
    render() {
        const { headerInfo, inputComponentList, rowInfo, isReadOnly } = this.props;
        const { dataChangeModalInfo } = this.state;

        return (
            <InputTableRow
                headerInfo={headerInfo}
                inputComponentList={inputComponentList}
                rowInfo={rowInfo}
                isReadOnly={isReadOnly}
                onChange={this.handleChange.bind(this)}
            >
                <MessageModal
                    title={
                        <span>
                            <i class="fa fa-exclamation-triangle mr-05" style={{ color: 'rgb(232, 222, 101)' }} />
                            データ型変更確認
                        </span>
                    }
                    show={dataChangeModalInfo.show}
                    buttonStyle="confirm"
                    onCancel={() => this.clearDataChangeModalInfo()}
                    onOK={() => this.handleChange({ index: COLUMN_INDEX.dataType,itemId: dataChangeModalInfo.itemId}, dataChangeModalInfo.type)}
                >
                    <p>データ型を変更して保存ボタンを押下すると、
                        変更前のデータ型で登録されているデータがすべて削除されますので
                        ご注意ください。
                    </p>
                    <p>データ型を変更してもよろしいですか？</p>
                </MessageModal>
            </InputTableRow>
        )
    }
    //#endregion

    /**
     * データ変更確認モーダル用情報をクリアする
     * @param {number} type 選択中データ型
     * @param {string} format フォーマット
     */
    clearDataChangeModalInfo() {
        this.setState({
            dataChangeModalInfo:
            {
                show: false, itemId: null, colIndex: null, value: null
            }
        });
    }
}

ItemSettingInputListRow.propTypes = {
    rowInfo: PropTypes.object,
    isReadOnly:PropTypes.bool
}