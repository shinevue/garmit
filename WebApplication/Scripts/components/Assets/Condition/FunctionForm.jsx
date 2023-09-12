/**
 * Copyright 2017 DENSO Solutions
 * 
 * FunctionForm Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col, FormGroup, FormControl, Button } from 'react-bootstrap';

import FunctionSelectModal from 'Assets/Modal/FunctionSelectModal';
import ChipForm from 'Assets/Condition/ChipForm';


export default class FunctionForm extends Component {

    constructor(props) {
        super(props)
        this.state = {
            showModal: false,
        }
    }

    /**
     * チップのリストを生成する
     * @param {any} functions
     */
    createChipList(functions) {
        return functions.map((func) => { return { id: func.functionId, name: func.name } })
    }

    /**
     * チップの「×」ボタンクリック時
     * @param {any} id
     */
    handleRemoveChip(id) {
        if (this.props.onChange) {
            let functions = this.props.checkedFunctions.slice();
            for (let i = 0; i < functions.length; i++) {
                if (functions[i].functionId === id) {
                    functions.splice(i, 1);
                    this.props.onChange(functions);
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
     * render
     */
    render() {
        const { showModal } = this.state
        const { functionList, checkedFunctions, validationState, helpText, search, disabled } = this.props

        return (
            <div>
                <FunctionSelectModal
                    showModal={showModal}
                    functionList={functionList}
                    checkedFunctions={checkedFunctions}
                    onSubmit={(val) => this.handleSubmit(val)}
                    onCancel={() => this.setState({ showModal: false })}
                />
                <ChipForm
                    disabled={disabled}
                    chips={this.createChipList(checkedFunctions)}
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

FunctionForm.propTypes = {
    functionList: PropTypes.array,
    checkedFunctions: PropTypes.array,
    onChange: PropTypes.func,
    validationState: PropTypes.string,
    helpText: PropTypes.string
}

FunctionForm.defaultProps = {
    functionList: [],
    checkedFunctions: [],
    onChange: () => { },
}