/**
 * Copyright 2017 DENSO Solutions
 * 
 * EgroupForm Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col, FormGroup, FormControl, Button } from 'react-bootstrap';

import LabelForm from 'Common/Form/LabelForm';
import EgroupSelectModal from 'Assets/Modal/EgroupSelectModal';
import ChipForm from 'Assets/Condition/ChipForm';

export default class EgroupForm extends Component {

    constructor(props) {
        super(props)
        this.state = {
            showModal: false,
        }
    }

    /**
     * 適用ボタンクリック
     * @param {any} val
     */
    handleSubmit(val) {
        this.setState({ showModal: false });
        this.props.onChange(val)
    }

    /**
     * タグ「×」ボタンクリック
     * @param {any} id
     */
    handleRemoveTag(id) {
        this.props.onChange(this.removeEgroup(id, this.props.checkedEgroups))
    }

    /**
     * 該当する電源系統を削除した所属リストを返す
     * @param {any} id
     */
    removeEgroup(id, egroup) {
        const newEgroups = egroup.slice();
        const removeIndex = newEgroups.findIndex((eg) => eg.egroupId === id);
        if (removeIndex !== -1) {
            newEgroups.splice(removeIndex, 1);
        }
        return newEgroups;
    }

    /**
     * フォームに表示するタグリストを生成
     * @param {any} egroups
     */
    createChipList(egroups) {
        return egroups.map((item) => ({ id: item.egroupId, name: item.egroupName }));
    }
    
    /**
     * render
     */
    render() {
        const { multiple, egroupList, selectedEgroup, checkedEgroups, validationState, helpText, search, disabled } = this.props
        const { showModal } = this.state

        return (
            <div>
                <EgroupSelectModal
                    showModal={showModal}
                    egroupList={egroupList}
                    selectedEgroup={selectedEgroup}
                    checkedEgroups={checkedEgroups}
                    checkbox={multiple}
                    defaultCollapse={true}
                    searchable={true}
                    onSubmit={(val) => this.handleSubmit(val)}
                    onCancel={() => this.setState({ showModal: false })}
                />
                {multiple ?
                    <ChipForm
                        disabled={disabled}
                        chips={this.createChipList(checkedEgroups)}
                        removeButton={true}
                        onRemoveClick={(id) => this.handleRemoveTag(id)}
                        onClick={search && (() => this.setState({ showModal: true }))}
                        validationState={validationState}
                        helpText={helpText}
                        addonButton={!search && {
                            iconId: 'plug',
                            isCircle: true,
                            tooltipLabel: '電源系統選択',
                            onClick: () => this.setState({ showModal: true })
                        }}
                    />
                    :
                    <LabelForm
                        isReadOnly={disabled}
                        value={selectedEgroup && selectedEgroup.egroupName}
                        validationState={validationState}
                        helpText={helpText}
                        addonButton={!disabled && [
                            {
                                key: 'select',
                                iconId: 'plug',
                                isCircle: true,
                                tooltipLabel: '電源系統選択',
                                onClick: () => this.setState({ showModal: true })
                            },
                            {
                                key: 'clear',
                                iconId: 'erase',
                                bsStyle: 'lightgray',
                                isCircle: true,
                                tooltipLabel: 'クリア',
                                onClick: () => this.props.onChange(null)
                            }
                        ]}
                    />
                }
            </div>
        )
    }
}

EgroupForm.propTypes = {
    onChange: PropTypes.func,
    egroupList: PropTypes.array,
    checkedEgroups: PropTypes.array,
    validationState: PropTypes.string,
    helpText: PropTypes.string
}

EgroupForm.defaultProps = {
    onChange: () => { },
    egroupList: [],
    checkedEgroups: []
}