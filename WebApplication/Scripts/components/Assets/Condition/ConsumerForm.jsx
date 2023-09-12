/**
 * Copyright 2019 DENSO
 * 
 * ConsumerForm Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col, FormGroup, FormControl, Button } from 'react-bootstrap';

import ConsumerSelectModal from 'Assets/Modal/ConsumerSelectModal';
import ChipForm from 'Assets/Condition/ChipForm';

export default class ConsumerForm extends Component {

    constructor(props) {
        super(props)
        this.state = {
            showModal: false,
        }
    }

    /**
     * チップのリストを生成する
     * @param {any} consumers
     */
    createChipList(consumers) {
        return consumers.map((consumer) => { return { id: consumer.consumerId, name: consumer.consumerName } })
    }

    /**
     * チップの「×」ボタンクリック時
     * @param {any} id
     */
    handleRemoveChip(id) {
        if (this.props.onChange) {
            let consumers = this.props.checkedConsumers.slice();
            for (let i = 0; i < consumers.length; i++) {
                if (consumers[i].consumerId === id) {
                    consumers.splice(i, 1);
                    this.props.onChange(consumers);
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
        const { consumerList, checkedConsumers, validationState, helpText, search, disabled } = this.props

        return (
            <div>
                <ConsumerSelectModal
                    showModal={showModal}
                    consumerList={consumerList}
                    checkedConsumers={checkedConsumers}
                    onSubmit={(val) => this.handleSubmit(val)}
                    onCancel={() => this.setState({ showModal: false })}
                />
                <ChipForm
                    disabled={disabled}
                    chips={this.createChipList(checkedConsumers)}
                    removeButton={true}
                    onRemoveClick={(id) => this.handleRemoveChip(id)}
                    onClick={search && (() => this.setState({showModal: true }))}
                    validationState={validationState}
                    helpText={helpText}
                    addonButton={!search && {
                        iconId: 'user',
                        isCircle: true,
                        tooltipLabel: 'コンシューマー選択',
                        onClick: () => this.setState({ showModal: true })
                    }}
                />
            </div>
        )
    }
}

ConsumerForm.propTypes = {
    consumerList: PropTypes.array,
    checkedConsumers: PropTypes.array,
    onChange: PropTypes.func,
    validationState: PropTypes.string,
    helpText: PropTypes.string
}

ConsumerForm.defaultProps = {
    consumerList: [],
    checkedConsumers: [],
    onChange: () => { },
}