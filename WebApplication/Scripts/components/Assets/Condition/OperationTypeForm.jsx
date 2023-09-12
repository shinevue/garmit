/**
 * Copyright 2017 DENSO Solutions
 * 
 * OperationTypeForm Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col, FormGroup, FormControl, Button } from 'react-bootstrap';

import OperationTypeSelectModal from 'Assets/Modal/OperationTypeSelectModal';
import ChipForm from 'Assets/Condition/ChipForm';

import { OPERATION_TYPE } from 'constant';

export default class OperationTypeForm extends Component {

    constructor(props) {
        super(props)
        this.state = {
            showModal: false,
        }
    }

    /**
     * チップのリストを生成する
     * @param {any} ids
     */
    createChipList(ids) {
        const chips = [];

        for (let key of Object.keys(OPERATION_TYPE)) {
            if (ids.indexOf(OPERATION_TYPE[key].value) >= 0) {
                chips.push({ id: OPERATION_TYPE[key].value, name: OPERATION_TYPE[key].name });
            }
        }

        return chips;
    }

    /**
     * チップの「×」ボタンクリック時
     * @param {any} id
     */
    handleRemoveChip(id) {
        if (this.props.onChange) {
            let types = this.props.checkedOperationTypes.slice();
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
        const { showModal } = this.state
        const { checkedOperationTypes, validationState, helpText, search, disabled } = this.props

        return (
            <div>
                <OperationTypeSelectModal
                    showModal={showModal}
                    checkedOperationTypes={checkedOperationTypes}
                    onSubmit={(val) => this.handleSubmit(val)}
                    onCancel={() => this.setState({ showModal: false })}
                />
                <ChipForm
                    disabled={disabled}
                    chips={this.createChipList(checkedOperationTypes)}
                    removeButton={true}
                    onRemoveClick={(id) => this.handleRemoveChip(id)}
                    onClick={() => this.setState({ showModal: true })}
                    validationState={validationState}
                    helpText={helpText}
                />
            </div>
        )
    }
}

OperationTypeForm.propTypes = {
    checkedOperationTypes: PropTypes.array,
    onChange: PropTypes.func,
    validationState: PropTypes.string,
    helpText: PropTypes.string
}

OperationTypeForm.defaultProps = {
    checkedOperationTypes: [],
    onChange: () => { },
}