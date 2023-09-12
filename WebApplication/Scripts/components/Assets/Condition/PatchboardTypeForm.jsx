/**
 * Copyright 2020 DENSO
 * 
 * PatchboardTypeForm Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PatchboardTypeSelectModal from 'Assets/Modal/PatchboardTypeSelectModal';
import ChipForm from 'Assets/Condition/ChipForm';

export default class PatchboardTypeForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
        };
    }

    /**
     * チップのリストを生成する
     * @param {any} patchboardTypes
     */
    createChipList(patchboardTypes) {
        return patchboardTypes.map((type) => { return { id: type.typeId, name: type.name }; });
    }

    /**
     * チップの「×」ボタンクリック時
     * @param {any} id
     */
    handleRemoveChip(id) {
        if (this.props.onChange) {
            let types = this.props.checkedPatchboardTypes.slice();
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
        const { patchboardTypeList, checkedPatchboardTypes, validationState, helpText, disabled, search } = this.props;

        return (
            <div>
                <PatchboardTypeSelectModal
                    showModal={showModal}
                    patchboardTypeList={patchboardTypeList}
                    checkedPatchboardTypes={checkedPatchboardTypes}
                    onSubmit={(val) => this.handleSubmit(val)}
                    onCancel={() => this.setState({ showModal: false })}
                />
                <ChipForm
                    disabled={disabled}
                    chips={this.createChipList(checkedPatchboardTypes)}
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

PatchboardTypeForm.propTypes = {
    patchboardTypeList: PropTypes.array,
    checkedPatchboardTypes: PropTypes.array,
    onChange: PropTypes.func,
    validationState: PropTypes.string,
    helpText: PropTypes.string,
    disabled: PropTypes.bool,
    search: PropTypes.bool
};

PatchboardTypeForm.defaultProps = {
    patchboardTypeList: [],
    checkedPatchboardTypes: [],
    onChange: () => { },
};