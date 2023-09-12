/**
 * @license Copyright 2022 DENSO
 * 
 * PatchCableConnectForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PatchCableSelectModal from 'Assets/Modal/PatchCableSelectModal';
import ChipForm from 'Assets/Condition/ChipForm';

import { makePatchCableName } from 'lineUtility'

const ALL_NOS_STRING = 'ALL';

/**
 * 線番選択フォーム（検索条件用）
 * @param {boolean} isInPatchCable 局入かどうか
 * @param {array} patchCables 線番情報一覧
 * @param {array} selectedPatchCableConnects 選択中の線番情報一覧
 * @param {string} validationState 検証結果のステータス
 * @param {string} helpText ヘルプテキスト
 * @param {boolean} disabled 編集不可かどうか
 * @param {function} onChange 選択変更時に呼び出す
 */
export default class PatchCableConnectForm extends Component {
    
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
        const { isInPatchCable, patchCables, selectedPatchCableConnects, validationState, helpText, disabled } = this.props

        return (
            <div>
                <PatchCableSelectModal
                    showModal={showModal}
                    isInPatchCable={isInPatchCable}
                    patchCables={patchCables}
                    selectedPatchCableConnects={selectedPatchCableConnects}
                    onSubmit={(val) => this.handleSubmit(val)}
                    onCancel={() => this.setState({ showModal: false })}
                />
                <ChipForm
                    disabled={disabled}
                    chips={this.createChipList(selectedPatchCableConnects)}
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
        const ids = id.split(',');
        const patchboardId = Number(ids[0]);
        const patchCableNo = ids[1] !== ALL_NOS_STRING ? Number(ids[1]) : null;
        let connects = this.props.selectedPatchCableConnects.slice();
        for (let i = 0; i < connects.length; i++) {
            if (connects[i].patchboardId === patchboardId && connects[i].no === patchCableNo) {
                connects.splice(i, 1);
                this.onChange(connects);
                return;
            }
        }
    }

    /**
     * 適用ボタンクリックイベント
     * @param {any} val
     */
    handleSubmit(val) {
        this.setState({ showModal: false });
        this.onChange(val);
    }
    
    /**
     * 変更イベント発生
     * @param {array} connects 変更後の線番一覧
     */
    onChange(connects) {
        if (this.props.onChange) {
            this.props.onChange(connects);
        }
    }

    /**
     * チップのリストを生成する
     * @param {array} patchCables 線番リスト
     */
    createChipList(patchCables) {
        return patchCables.map((cable) => { 
            let cableNo = this.isAllCableNo(cable.no) ? ALL_NOS_STRING : cable.no;
            return { 
                id: cable.patchboardId + ',' + cableNo,
                name: makePatchCableName(cable.patchboardName, cable.no)
            } 
        });
    }

    /**
     * 線番が「すべて」かどうか
     * @param {*} no 線番番号
     */
    isAllCableNo(no) {
        return (no === null);
    }

}

PatchCableConnectForm.propTypes = {
    isInPatchCable: PropTypes.bool,
    patchCables: PropTypes.array,
    selectedPatchCableConnects: PropTypes.array,
    validationState: PropTypes.string,
    helpText: PropTypes.string,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
}

PatchCableConnectForm.defaultProps = {
    isInPatchCable: true,
    patchCables: [],
    selectedPatchCableConnects: [],
    onChange: () => { },
}