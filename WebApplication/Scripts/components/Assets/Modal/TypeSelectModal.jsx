/**
 * @license Copyright 2020 DENSO
 * 
 * TypeSelectModal Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Modal, FormControl, FormGroup, ControlLabel, Checkbox } from 'react-bootstrap';
import Icon from 'Common/Widget/Icon';
import CheckboxList from 'Common/Widget/CheckboxList'
import { ApplyButton, CancelButton } from 'Assets/GarmitButton';

/**
 * 種別選択モーダル（汎用）
 * @param {boolean} showModal モーダルを表示するかどうか
 * @param {string} title モーダルのタイトル
 * @param {array} typeList 種別一覧（全種別）{ typeId: XX, Name: XXXX }の配列
 * @param {array} checkedTypes チェックされた種別一覧
 * @param {boolean} searchable 検索可能とするかどうか
 * @param {function} onSubmit 適用ボタン押下時に呼び出す
 * @param {function} onCancel キャンセルボタン押下時に呼び出す
 */
export default class TypeSelectModal extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            searchWord: "",
            checkedTypes: props.checkedTypes ? _.cloneDeep(props.checkedTypes) : []
        }
    }

    /**
     * 新しいpropsを受け取るときに呼び出す
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.checkedTypes !== nextProps.checkedTypes
            || this.props.showModal !== nextProps.showModal) {
            this.setState({ checkedTypes: nextProps.checkedTypes ? _.cloneDeep(nextProps.checkedTypes) : [] });
        }
    }

    /**
     * render
     */
    render() {
        const { title, showModal, searchable, bsSize } = this.props;
        const { checkedTypes } = this.state;

        const checkboxItems = this.createCheckboxItems();

        return (
            <Modal show={showModal} bsSize={bsSize} backdrop="static" onHide={() => this.handleCancel()}>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {searchable&&
                        <FormGroup>
                            <ControlLabel>検索:</ControlLabel>
                            <FormControl
                                type="text"
                                onChange={(e) => this.onSearchWordChange(e)}
                                placeholder="search"
                            />
                            <FormControl.Feedback >
                                <span>
                                    <Icon className="fal fa-search" />
                                </span>
                            </FormControl.Feedback>
                        </FormGroup>
                    }
                    {(checkboxItems.length != 0) ?
                        <div>
                            {searchable&&
                                <Checkbox
                                    checked={this.isAllChecked()}
                                    onClick={() => this.onAllCheckboxClick()}
                                >
                                    <b>すべて</b>
                                </Checkbox>
                            }
                            <CheckboxList
                                items={checkboxItems}
                                checkedItems={checkedTypes.map((type) => type.typeId)}
                                onChange={(keys) => this.checkChanged(keys)}
                                maxHeight={500}
                            />
                        </div>
                            :
                        <div>該当する種別がありません</div>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <ApplyButton onClick={() => this.handleSubmit()} />
                    <CancelButton onClick={() => this.handleCancel()} />
                </Modal.Footer>
            </Modal>
        )
    }

    //#region 検索関係
    
    /**
     * 検索ワード変更イベント
     * @param {any} e
     */
    onSearchWordChange(e) {
        this.setState({ searchWord: e.target.value }, () => {
            this.uncheckHiddenTypes();
        });
    }

    /**
     * すべてチェックがクリックされた時
     */
    onAllCheckboxClick() {
        let checkedTypes = [];

        if (!this.isAllChecked()) {
            checkedTypes = this.getFilteredTypes();
        }

        this.setState({ checkedTypes: checkedTypes });
    }

    /**
     * フィルター後の種別一覧を取得する
     */
    getFilteredTypes() {
        const { typeList } = this.props;
        const { searchWord } = this.state;

        return typeList ? typeList.filter((item) => item.name.indexOf(searchWord) >= 0) : [];
    }

    /**
     * 非表示の種別のチェックを外す
     */
    uncheckHiddenTypes() {
        const filteredTypes = this.getFilteredTypes();
        const checkedTypes = this.state.checkedTypes.filter((type) => filteredTypes.some((t) => t.typeId === type.typeId));
        this.setState({ checkedTypes: checkedTypes });
    }

    //#endregion

    //#region イベント

    /**
     * 適用ボタンクリック
     */
    handleSubmit() {
        if (this.props.onSubmit) {
            this.props.onSubmit(this.state.checkedTypes)
        }
    }

    /**
     * キャンセルボタンクリック
     */
    handleCancel() {
        if (this.props.onCancel) {
            this.props.onCancel()
        }
    }

    /**
     * チェックボックスのチェックが変化したとき
     * @param {any} checkedItems
     */
    checkChanged(checkedItems) {
        const { typeList } = this.props

        const checkedTypes = typeList.filter((type) => {
            return (checkedItems.indexOf(type.typeId) > -1);
        })

        this.setState({ checkedTypes: checkedTypes });
    }

    //#endregion

    //#region その他

    /**
     * チェックボックスのアイテムを生成する
     */
    createCheckboxItems() {
        const filteredTypes = this.getFilteredTypes();
        return filteredTypes.map((type) => ({ key: type.typeId, name: type.name }));
    }

    /**
     * すべてチェックされているか
     */
    isAllChecked() {
        const filteredTypes = this.getFilteredTypes();
        return !filteredTypes.some((type) => !this.state.checkedTypes.some((t) => t.typeId === type.typeId));
    }

    //#endregion

}

TypeSelectModal.propTypes = {
    showModal: PropTypes.bool,
    title: PropTypes.string,
    typeList: PropTypes.array,
    checkedTypes: PropTypes.array,
    searchable: PropTypes.bool,
    bsSize: PropTypes.string,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func
}

TypeSelectModal.defaultProps = {
    showModal: false,
    checkedTypes: [],
    onSubmit: () => { },
    onCancel: () => { }
}