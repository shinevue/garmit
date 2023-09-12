/**
 * Copyright 2017 DENSO Solutions
 * 
 * 管理項目設定入力リスト Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col, Checkbox } from 'react-bootstrap';

import InputTable from 'Common/Form/InputTable';
import TextForm from 'Common/Form/TextForm';
import TextareaForm from 'Common/Form/TextareaForm';
import SelectForm from 'Common/Form/SelectForm';

import DataFormatInputForm from 'Assets/RackUnitPageSetting/DataFormatInputForm';
import ItemSettingInputRow from 'Assets/RackUnitPageSetting/ItemSettingInputRow';

export default class ItemSettingInputList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            headerInfo: this.getHeaderInfo(props.pageInfo.isAllEnable, props.pageInfo.isAllSearchable, props.pageInfo.isAllSysAdmin, props.pageInfo.isReadOnly, props.sysAdminCheckbox),
        };
    }

    /**
     * 新たなコンポーネントを受け取ったときに実行
     */
    componentWillReceiveProps(nextProps) {
        let update = _.cloneDeep(this.state.headerInfo);
        if (nextProps.pageInfo.isAllEnable !== this.props.pageInfo.isAllEnable) {
            //ヘッダーの有効チェック状態変更
            update = _.set(update, '0.checked', nextProps.pageInfo.isAllEnable);
            this.setState({ headerInfo: update });
        }
        if (nextProps.pageInfo.isAllSearchable !== this.props.pageInfo.isAllSearchable) {
            //ヘッダーの検索対象チェック状態変更
            update = _.set(update, '1.checked', nextProps.pageInfo.isAllSearchable);
            this.setState({ headerInfo: update });
        }
        if (nextProps.pageInfo.isAllSysAdmin !== this.props.pageInfo.isAllSysAdmin) {
            //ヘッダーの管理者のみチェック状態変更
            update = _.set(update, '6.checked', nextProps.pageInfo.isAllSysAdmin);
            this.setState({ headerInfo: update });
        }

        if (nextProps.pageInfo.isReadOnly !== this.props.pageInfo.isReadOnly) {
            //ヘッダーの有効チェック状態変更
            update = _.chain(update)
                .set('0.checkBoxDisabled', nextProps.pageInfo.isReadOnly)
                .set('1.checkBoxDisabled', nextProps.pageInfo.isReadOnly)
                .set('6.checkBoxDisabled', nextProps.pageInfo.isReadOnly)
                .value();
            this.setState({ headerInfo: update });
        }
    }

    //#region イベントハンドラ
    /**
     * ヘッダーチェックボックスチェック状態をすべて変更する
     * @param {bool} value 変更する値
     * @param {string} type チェックされた種別（有効/検索対象）
     */
    handleChangeAllChecked(value, type) {
        if (this.props.onClickAllChecked) {
            this.props.onClickAllChecked(value, type);
        }
    }

    /**
     * フォームの項目を変更する（データ型以外）
     * @param {int} itemId 変更された項目番号（行を特定）
     * @param {string} value 変更内容
     */
    handleChangeInput(itemId, valueObj) {
        if (this.props.onChangeInput) {
            this.props.onChangeInput(itemId, valueObj);
        }
    }
    // #endregion

    //#region render
    /**
     * render
     */
    render() {
        const { pageInfo, sysAdminCheckbox } = this.props;
        const { extendedItems } = pageInfo;
        const { headerInfo } = this.state;
        const inputList = [Checkbox, Checkbox, ItemNameInputForm, DataTypeSelectForm, DataFormatInputForm, AlarmStateInputForm];
        if (sysAdminCheckbox) {
            inputList.push(Checkbox);
        }

        return (
            <InputTable
                headerInfo={headerInfo}
                inputComponentList={inputList}
            >
                {extendedItems && extendedItems.map((rowInfo, index) => {
                    return (
                        <ItemSettingInputRow
                            key={index}
                            headerInfo={headerInfo}
                            inputComponentList={inputList}
                            pageNo={pageInfo.pageNo}
                            rowInfo={sysAdminCheckbox ? rowInfo : Object.assign({}, rowInfo, { columnInfo: rowInfo.columnInfo.slice(0, 6) })}
                            isReadOnly={pageInfo.isReadOnly}
                            onChangeInput={(itemId, valueObj) => this.handleChangeInput(itemId, valueObj)}
                        />
                    );
                })}
            </InputTable>
        );
    }
    //#endregion

    //#region その他関数
    /**
     * テーブルのヘッダー情報を取得する
     * @param {bool} isAllEnable すべて有効状態かどうか
     */
    getHeaderInfo(isAllEnable, isAllSearchable, isAllSysAdmin, isReadOnly, sysAdminCheckbox) {
        const headers = [
            {
                label: "有効", columnSize: 1, isRequired: false,
                showCheckBox: true,
                checked: isAllEnable,
                checkBoxDisabled: isReadOnly,
                onChangeChecked: (value) => this.handleChangeAllChecked(value, "enable")
            },
            {
                label: "検索対象", columnSize: 1, isRequired: false,
                showCheckBox: true,
                checked: isAllSearchable,
                checkBoxDisabled: isReadOnly,
                onChangeChecked: (value) => this.handleChangeAllChecked(value, "isSearchable")
            },
            { label: "項目名", columnSize: 2, isRequired: true },
            { label: "データ型", columnSize: sysAdminCheckbox ? 2 : 3, isRequired: false },
            { label: "データ/書式", columnSize: 3, isRequired: false },
            { label: "監視状態", columnSize: 2, isRequired: false }            
        ];

        if (sysAdminCheckbox) {
            headers.push(
                {
                    label: "管理者のみ", columnSize: 1, isRequired: false,
                    showCheckBox: true,
                    checked: isAllSysAdmin,
                    checkBoxDisabled: isReadOnly,
                    onChangeChecked: (value) => this.handleChangeAllChecked(value, "isSysAdmin")
                },
            );
        }        

        return headers;
    }
    // #endregion
}

ItemSettingInputList.propTypes = {
    extendItems: PropTypes.object,
    pageNo: PropTypes.number,
    isAllEnable: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    pageInfo: PropTypes.object,
    onClickAllChecked: PropTypes.func,
    onChangeInput: PropTypes.func,
    sysAdminCheckbox: PropTypes.bool
};

//#region 入力フォームコンポーネント

/**
 * 項目名入力フォーム
 */
function ItemNameInputForm(props) {
    const { validationState } = props;
    return (
        <TextareaForm
            isReadOnly={props.isReadOnly}
            className={classNames({ 'disable-formgroup': props.disabled })}
            value={props.value}
            validationState={validationState.state}
            helpText={validationState.helpText}
            onChange={(value) => props.onChange(value)}
            maxlength={32}
        />
    );
}

/**
 * データ型選択フォーム
 */
function DataTypeSelectForm(props) {
    const { validationState } = props;
    return (
        <SelectForm
            isReadOnly={props.isReadOnly}
            className={classNames({ 'disable-formgroup': props.disabled })}
            value = { props.type }
            options = { props.options }
            isRequired = { props.isRequired }
            validationState = { validationState.state}
            helpText={validationState.helpText}
            onChange={(value) => props.onChange(value)}
        />
    );
}

/**
 * 監視状態入力フォーム
 */
function AlarmStateInputForm(props) {
    if (props.visible) {
        return (
            <div>
                <Row className="mlr-0">
                    <Col md={12} className="pa-0" style={{ border: "none" }}>
                        <Checkbox
                            disabled={props.isReadOnly}
                            className="pa-0"
                            checked={props.alarm ? true : false}
                            onClick={(e) => props.onChange({ alarmState: { alarm: e.target.checked } })}
                        >
                            監視する
                        </Checkbox>
                    </Col>
                </Row>
                {props.alarm &&
                    <Row className="mlr-0">
                        <Col md={12} className="pa-0" style={{ border: "none" }}>
                            <TextForm
                                isReadOnly={props.isReadOnly}
                                className={classNames({ 'disable-formgroup': props.disabled })}
                                value={props.noticeDays ? props.noticeDays : ""}
                                validationState={props.validationState.state}
                                helpText={props.validationState.helpText}
                                unit="日前"
                                onChange={(value) => props.onChange({ alarmState: { noticeDays: value } })}
                            />
                        </Col>
                    </Row>
                }
            </div>
        );
    }
    return null;
}

//#endregion
