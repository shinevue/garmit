/**
 * Copyright 2020 DENSO
 * 
 * PatchCableTypeForm Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PatchCableTypeSelectModal from 'Assets/Modal/PatchCableTypeSelectModal';
import ChipForm from 'Assets/Condition/ChipForm';

export default class PatchCableTypeForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
        };
    }

    /**
     * チップのリストを生成する
     * @param {any} patchCableTypes
     */
    createChipList(patchCableTypes) {
        return patchCableTypes.map((type) => { return { id: type.id, name: type.name }; });
    }

    /**
     * チップの「×」ボタンクリック時
     * @param {any} id
     */
    handleRemoveChip(id) {
        if (this.props.onChange) {
            let types = this.props.checkedPatchCableTypes.slice();
            types.splice(types.indexOf(id), 1);
            this.props.onChange(types);
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
        const { showModal } = this.state;
        const { patchCableTypeList, checkedPatchCableTypes, validationState, helpText, disabled, search } = this.props;

        return (
            <div>
                <PatchCableTypeSelectModal
                    showModal={showModal}
                    patchCableTypeList={patchCableTypeList}
                    checkedPatchCableTypes={checkedPatchCableTypes}
                    onSubmit={(val) => this.handleSubmit(val)}
                    onCancel={() => this.setState({ showModal: false })}
                />
                <ChipForm
                    disabled={disabled}
                    chips={this.createChipList(checkedPatchCableTypes)}
                    removeButton={true}
                    onRemoveClick={(id) => this.handleRemoveChip(id)}
                    onClick={() => this.setState({ showModal: true })}
                    validationState={validationState}
                    helpText={helpText}
                />
            </div>
        );
    }
}

PatchCableTypeForm.propTypes = {
    patchCableTypeList: PropTypes.array,
    checkedPatchCableTypes: PropTypes.array,
    onChange: PropTypes.func,
    validationState: PropTypes.string,
    helpText: PropTypes.string,
    disabled: PropTypes.bool,
    search: PropTypes.bool
};

PatchCableTypeForm.defaultProps = {
    patchCableTypeList: [],
    checkedPatchCableTypes: [],
    onChange: () => { },
};