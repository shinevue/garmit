/**
 * @license Copyright 2021 DENSO
 * 
 * ICTerminalForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ICTerminalSelectModal from 'Assets/Modal/ICTerminalSelectModal';
import ChipForm from 'Assets/Condition/ChipForm';


/**
 * 読み取り端末選択フォーム
 * @param {array} icTerminalList 読み取り端末一覧
 * @param {array} checkedICTerminals チェック中の読み取り端末一覧
 * @param {string} validationState 入力検証ステータス
 * @param {string} helpText ヘルプテキスト
 * @param {boolean} disabled 編集不可かどうか
 */
export default class ICTerminalForm extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
        };
    }

    /**
     * チップのリストを生成する
     * @param {any} icTerminals
     */
     createChipList(icTerminals) {
        return icTerminals.map((terminal) => { return { id: terminal.termNo, name: terminal.termName }; });
    }

    /**
     * チップの「×」ボタンクリック時
     * @param {any} no
     */
    handleRemoveChip(no) {
        if (this.props.onChange) {
            let terminals = this.props.checkedICTerminals.slice();
            for (let i = 0; i < terminals.length; i++) {
                if (terminals[i].termNo === no) {
                    terminals.splice(i, 1);
                    this.props.onChange(terminals);
                    return;
                }
            }
            this.props.onChange(terminals);
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
     * render
     */
     render() {
        const { showModal } = this.state
        const { icTerminalList, checkedICTerminals, validationState, helpText, search, disabled } = this.props

        return (
            <div>
                <ICTerminalSelectModal
                    showModal={showModal}
                    icTerminalList={icTerminalList}
                    checkedICTerminals={checkedICTerminals}
                    checkbox={true}
                    onSubmit={(val) => this.handleSubmit(val)}
                    onCancel={() => this.setState({ showModal: false })}
                />
                <ChipForm
                    disabled={disabled}
                    chips={this.createChipList(checkedICTerminals)}
                    removeButton={true}
                    onRemoveClick={(id) => this.handleRemoveChip(id)}
                    onClick={() => this.setState({showModal: true })}
                    validationState={validationState}
                    helpText={helpText}
            />
            </div>
        )
    }
}

ICTerminalForm.propTypes = {
    icTerminalList: PropTypes.array,
    checkedICTerminals: PropTypes.array,
    onChange: PropTypes.func,
    validationState: PropTypes.string,
    helpText: PropTypes.string,
    search: PropTypes.bool,
    disabled: PropTypes.bool
}

ICTerminalForm.defaultProps = {
    icTerminalList: [],
    checkedICTerminals: [],
    onChange: () => { },
}