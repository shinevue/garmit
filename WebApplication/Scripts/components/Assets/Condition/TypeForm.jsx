/**
 * @license Copyright 2020 DENSO
 * 
 * TypeForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import TypeSelectModal from 'Assets/Modal/TypeSelectModal';
import ChipForm from 'Assets/Condition/ChipForm';


/**
 * 種別選択フォーム
 * @param {boolean} showModal モーダルを表示するかどうか
 * @param {string} title モーダルのタイトル
 * @param {array} typeList 種別一覧（全種別）{ typeId: XX, Name: XXXX }の配列
 * @param {array} checkedTypes チェックされた種別一覧
 * @param {boolean} searchable 検索可能とするかどうか
 * @param {string} validationState 検証結果のステータス
 * @param {string} helpText ヘルプテキスト
 * @param {string} modalSise 選択モーダルサイズ（"sm"等)
 * @param {function} onChange 種別選択変更時に呼び出す
 */
export default class TypeForm extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            showModal: false,
        }
    }

    /**
     * render
     */
    render() {
        const { showModal } = this.state
        const { title, typeList, checkedTypes, validationState, helpText, searchable, modalSize, disabled } = this.props

        return (
            <div>
                <TypeSelectModal
                    showModal={showModal}
                    title={title}
                    typeList={typeList}
                    checkedTypes={checkedTypes}
                    searchable={searchable}
                    bsSize={modalSize}
                    onSubmit={(val) => this.handleSubmit(val)}
                    onCancel={() => this.setState({ showModal: false })}
                />
                <ChipForm
                    disabled={disabled}
                    chips={this.createChipList(checkedTypes)}
                    removeButton={true}
                    onRemoveClick={(id) => this.handleRemoveChip(id)}
                    onClick={() => this.setState({showModal: true })}
                    validationState={validationState}
                    helpText={helpText}
                />
            </div>
        )
    }
    
    /**
     * チップの「×」ボタンクリック時
     * @param {any} id
     */
    handleRemoveChip(id) {
        if (this.props.onChange) {
            let types = this.props.checkedTypes.slice();
            for (let i = 0; i < types.length; i++) {
                if (types[i].typeId === id) {
                    types.splice(i, 1);
                    this.props.onChange(types);
                    return;
                }
            }
        }
    }

    /**
     * 適用ボタンクリックイベント
     * @param {any} val
     */
    handleSubmit(val) {
        this.setState({ showModal: false });

        if (this.props.onChange) {
            this.props.onChange(val);
        }
    }
    
    /**
     * チップのリストを生成する
     * @param {array} types
     */
    createChipList(types) {
        return types.map((type) => { return { id: type.typeId, name: type.name } });
    }


}

TypeForm.propTypes = {
    typeList: PropTypes.array,
    checkedTypes: PropTypes.array,
    searchable: PropTypes.bool,
    onChange: PropTypes.func,
    validationState: PropTypes.string,
    helpText: PropTypes.string,
    modalSize: PropTypes.string
}

TypeForm.defaultProps = {
    typeList: [],
    checkedTypes: [],
    searchable: false,
    onChange: () => { },
}