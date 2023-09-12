/**
 * Copyright 2017 DENSO Solutions
 * 
 * ラックユニットページ設定ボックス Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Modal } from 'react-bootstrap';

import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';

import GarmitBox from 'Assets/GarmitBox';
import { SaveButton, CancelButton, SortButton, ApplyButton } from 'Assets/GarmitButton';
import ItemSettingInputList from 'Assets/RackUnitPageSetting/ItemSettingInputList';
import SortableList from 'Assets/RackUnitPageSetting/SortableList';

import TypeSelectForm from 'UnitMaintenance/TypeSelectForm';

export default class PageSettingBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showModal: false, //並べ替えモーダル表示状態
        };
    }

    //#region イベントハンドラ
    //#region ページ設定編集
    /**
    * ページ名称変更イベント
    * @param {string} value 入力されたページ名称
    */
    handleChangePageName(value) {
        if (this.props.onChangePageName) {
            this.props.onChangePageName(value);
        }
    }

    /**
     * 管理項目変更イベント
     * @param {int} itemId 変更された項目番号（行を特定）
     * @param {string} valueObj 変更内容
     */
    handleChangeItem(itemId, valueObj) {
        if (this.props.onChangeItem) {
            this.props.onChangeItem(itemId, valueObj);
        }
    }

    /**
     * キャンセルボタン押下イベント
     */
    handleClickCancel() {
        if (this.props.onClickCancel) {
            this.props.onClickCancel();
        }
    }

    /**
     * 保存ボタン押下イベント
     */
    handleClickSave() {
        if (this.props.onClickSave) {
            this.props.onClickSave();
        }
    }

    /**
     * 種別変更イベントハンドラ
     * @param {array} changed 変更後の種別一覧
     */
    handleChangeTypes(changed) {
        if (this.props.onChangeTypes) {
            this.props.onChangeTypes(changed);
        }
    }

     /**
     * ヘッダーチェックボックスチェック状態をすべて変更する
     * @param {bool} value 変更する値
     * @param {string} type チェックされた種別（有効/検索対象）
     */
    handleClickAllChecked(value, type) {
        if (this.props.onClickAllChecked) {
            this.props.onClickAllChecked(value, type);
        }
    }
    //#endregion

    //#region 並べ替え関連イベント
    /**
     * 並べ替えボタン押下イベント
     */
    handleClickSort() {
        this.setState({ showModal: true });
    }

    /**
     * 並べ替えキャンセルボタン押下イベント
     */
    handleClickSortCancel() {
        this.setState({ showModal: false });
    }

    /**
     * 並べ替え保存ボタン押下イベント
     */
    handleClickSortSave() {
        this.setState({ showModal: false });
        var idArray = _.map($('#itemSort.sortable-list').sortable("toArray"), _.toNumber); //並べ替え後要素のidの配列を取得(文字列で取得されるため数値に変換)
        if (this.props.onChangeOrder) {
            this.props.onChangeOrder(idArray);
        }
    }
    //#endregion
    //#endregion

    //#region render
    /**
     * render
     */
    render() {
        const { pageName, isLoading, isUnit, sysAdminCheckbox, editPageInfo, canSave } = this.props;
        const { showModal } = this.state;
        const isReadOnly = editPageInfo && editPageInfo.isReadOnly;

        let title = "ページ設定";
        pageName ? title += "(" + pageName + ")" : null;
            
        return (
            <GarmitBox isLoading={isLoading} title={title}>
                <Body
                    pageInfo={editPageInfo}
                    isUnit={isUnit}
                    sysAdminCheckbox={sysAdminCheckbox}
                    onChangePageName={(e) => this.handleChangePageName(e)}
                    onChangeTypes={(changed) => this.handleChangeTypes(changed)}
                    onClickSort={() => this.handleClickSort()}
                    onChangeInput={(itemId, valueObj) => this.handleChangeItem(itemId, valueObj)}
                    onClickAllChecked={(value, type) => this.handleClickAllChecked(value, type)}
                />
                {editPageInfo && !editPageInfo.isReadOnly &&
                    <div className="pull-right mt-1">
                        <SaveButton className="mr-05" disabled={isReadOnly || !canSave} onClick={() => this.handleClickSave()} />
                        <CancelButton disabled={isReadOnly} onClick={() => this.handleClickCancel()} />
                    </div>
                }
                <SortModal
                    show={showModal}
                    items={editPageInfo && editPageInfo.extendedItems}
                    onClickCancel={() => this.handleClickSortCancel()}
                    onClickSave={() => this.handleClickSortSave()}
                />
            </GarmitBox>
        );
    }
    //#endregion
}

PageSettingBox.propTypes = {
    pageName: PropTypes.string,         //編集前のページ名称（ボックスタイトルに表示）
    isLoading: PropTypes.bool,          //ロード中かどうか
    isUnit: PropTypes.bool,             //ユニットメンテナンス画面からの呼び出しかどうか
    editPageInfo: PropTypes.object,     //編集中ページ情報（表示用に加工したデータ）
    canSave: PropTypes.bool,            //保存可能かどうか
    onChangePageName: PropTypes.func,   //ページ名称変更イベント関数
    onChangeItem: PropTypes.func,       //管理項目変更イベント関数
    onClickAllChecked: PropTypes.func,  //全て有効チェック変更イベント関数
    onChangeOrder: PropTypes.func,      //並べ替えイベント関数
    onClickSave: PropTypes.func,        //保存クリックイベント関数
    onClickCancel: PropTypes.func,      //キャンセルクリックイベント関数
    onChangeTypes: PropTypes.func,      //ユニット種別変更イベント関数
    sysAdminCheckbox: PropTypes.bool,   //管理者のみのチェックボックスを表示するか
};

//#region SFC
/**
* ボックスボディ
*/
const Body = (props) => {
    const { pageInfo, isUnit, sysAdminCheckbox } = props;
    const { onChangePageName: handleChangePageName, onChangeTypes: handleChangeTypes } = props;
    const { onClickSort: handleClickSort } = props;
    const { onChangeInput: handleChangeItem, onClickAllChecked: handleClickAllChecked } = props;

    if (!pageInfo) return <div />;
    return (
        <div>
            <PageInfoFormGroup
                pageInfo={pageInfo.pageInfo}
                isReadOnly={pageInfo.isReadOnly}
                isUnit={isUnit}
                onChangePageName={(e) => handleChangePageName(e)}
                onChangeTypes={(changed) => handleChangeTypes(changed)}
            />
            <div className="flex-between-end">
                <label className="mt-1">管理項目</label>
                <SortButton
                    className="pull-right mt-2 mb-05"
                    disabled={pageInfo.isReadOnly}
                    onClick={() => handleClickSort()} />
            </div>
            <ItemSettingInputList
                pageInfo={pageInfo}
                sysAdminCheckbox={sysAdminCheckbox}
                onChangeInput={(itemId, valueObj) => handleChangeItem(itemId, valueObj)}
                onClickAllChecked={(value, type) => handleClickAllChecked(value, type)}
            />
        </div>
    );
};

/**
* ページ情報フォームグループ
*/
const PageInfoFormGroup = (props) => {
    const { pageInfo, isReadOnly, isUnit } = props;
    const { pageName, unitTypes } = pageInfo;
    const { onChangePageName: handleChangePageName, onChangeTypes: handleChangeTypes } = props;
    if (pageInfo) {
        return (
            <InputForm>
                <InputForm.Row>
                    <PageNameFormGroup
                        value={pageName.value}
                        columnCount={isUnit ? 2 : 1}
                        isReadOnly={isReadOnly}
                        validationState={pageName.validationState}
                        onChangePageName={(e) => handleChangePageName(e)}
                    />
                    <TypeSelectFormGroup
                        isUnit={isUnit}
                        isReadOnly={isReadOnly}
                        unitTypes={unitTypes}
                        onChangeTypes={(changed) => handleChangeTypes(changed)}
                    />
                </InputForm.Row>
            </InputForm>
        );
    }
    else {
        return <div />;
    }
};

/**
* ページ名称フォームグループ
*/
const PageNameFormGroup = ({ value, columnCount, validationState, isReadOnly, onChangePageName: handleChangePageName }) => {
    return (
        <InputForm.Col label="ページ名称" columnCount={columnCount} isRequired={true}>
            <TextForm
                value={value}
                validationState={_.get(validationState, "state")}
                helpText={_.get(validationState, "helpText")}
                placeholder="(ページ名称)"
                isReadOnly={isReadOnly}
                onChange={(e) => handleChangePageName(e)}
                maxlength={32}
            />
        </InputForm.Col>
    );
};

/**
* 種別フォームグループ
*/
const TypeSelectFormGroup = ({ isUnit, isReadOnly, unitTypes, onChangeTypes: handleChangeTypes }) => {
    if (!isUnit) {
        return <div />;
    }
    return (
        <InputForm.Col label="種別" columnCount={2} isRequired={false}>
            <TypeSelectForm
                isReadOnly={isReadOnly}
                options={unitTypes.options}
                formInfo={unitTypes.selected}
                onChangeTypes={(changed) => handleChangeTypes(changed)}
            />
        </InputForm.Col>
    );
};

/**
* 並べ替えモーダル
*/
const SortModal = ({ show, items, onClickCancel: handleClickCancel, onClickSave: handleClickSave }) => {
    return (
        <Modal show={show} bsSize="sm" onHide={() => handleClickCancel()} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>項目並べ替え</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <SortableList items={items} />
            </Modal.Body>
            <Modal.Footer>
                <ApplyButton onClick={() => handleClickSave()} />
                <CancelButton onClick={() => handleClickCancel()} />
            </Modal.Footer>
        </Modal>
    );
};
//#endregion