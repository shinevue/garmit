/**
 * Copyright 2017 DENSO Solutions
 * 
 * EnterpriseForm Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col, InputGroup, FormGroup, FormControl, Button, HelpBlock } from 'react-bootstrap';

import LabelForm from 'Common/Form/LabelForm';
import EnterpriseSelectModal from 'Assets/Modal/EnterpriseSelectModal';
import ChipForm from 'Assets/Condition/ChipForm';

export default class EnterpriseForm extends Component {

    constructor(props) {
        super(props)
        this.state = {
            showModal: false
        };
    }

    /**
     * 適用ボタンクリック
     * @param {any} val
     */
    handleSubmit(enterprises) {
        let mainEnterprise = this.props.mainEnterprise;
        if (!enterprises) {
            mainEnterprise = null;
        } else if (!mainEnterprise || !enterprises.some((ent) => ent.enterpriseId === mainEnterprise.enterpriseId)) {
            mainEnterprise = enterprises[0];
        }

        this.setState({ showModal: false });
        this.props.onChange(enterprises, mainEnterprise);
    }

    /**
     * チップクリックイベント
     * @param {any} id
     */
    handleClick(id) {
        const mainEnterprise = this.props.checkedEnterprises.find((ent) => ent.enterpriseId === id);
        this.props.onChange(this.props.checkedEnterprises, mainEnterprise);
    }


    /**
     * チップの「×」ボタンクリックイベント
     * @param {any} id
     */
    handleRemoveTag(id) {
        const { checkedEnterprises, mainEnterprise } = this.props;

        const newCheckedEnterprises = this.removeEnterprise(id, checkedEnterprises);
        const newMainEnterprise = (mainEnterprise && mainEnterprise.enterpriseId === id) ? newCheckedEnterprises[0] : mainEnterprise;

        this.props.onChange(newCheckedEnterprises, newMainEnterprise);
    }

    /**
     * 該当する所属を削除した所属リストを返す
     * @param {any} id
     */
    removeEnterprise(id, enterprises) {
        const newEnterprises = enterprises.slice();
        const removeIndex = newEnterprises.findIndex((ent) => ent.enterpriseId === id);
        if (removeIndex !== -1) {
            newEnterprises.splice(removeIndex, 1);
        }
        return newEnterprises;
    }

    /**
     * フォームに表示するタグリストを生成
     * @param {any} enterprises
     */
    createChipList(enterprises, mainEnterprise) {
        return enterprises.map((ent) => {
            const selected = (mainEnterprise && mainEnterprise.enterpriseId === ent.enterpriseId);
            return { id: ent.enterpriseId, name: ent.enterpriseName, selected: selected };
        });
    }
    
    /**
     * アドオンボタンを取得
     * @param {boolean} clearButton クリアボタンを表示するか
     */
    getAddonButtons(clearButton) {
        var buttons = [{
            key: 'select',
            bsStyle: 'primary',
            label: (<i className="material-icons">group</i>),
            isCircle: true,
            tooltipLabel: '所属選択',
            onClick: () => this.setState({ showModal: true })
        }];
        
        clearButton && buttons.push({
            key: 'clear',
            iconId: 'erase',
            bsStyle: 'lightgray',
            isCircle: true,
            tooltipLabel: 'クリア',
            onClick: () => this.props.onChange(null, mainEnterprise)
        });

        return buttons;
    }

    /**
     * render
     */
    render() {
        const { multiple, enterpriseList, selectedEnterprise, checkedEnterprises, mainEnterprise, validationState, helpText, disabled, search, initialTreeMode, clearButton } = this.props;
        const { showModal } = this.state;

        return (
            <div className={this.props.className}>
                <EnterpriseSelectModal
                    showModal={showModal}
                    enterpriseList={enterpriseList}
                    selectedEnterprise={selectedEnterprise}
                    checkedEnterprise={checkedEnterprises}
                    checkbox={multiple}
                    searchable={true}
                    initialTreeMode={initialTreeMode}
                    onSubmit={(val) => this.handleSubmit(val)}
                    onCancel={() => this.setState({ showModal: false })}
                />
                {multiple ?
                    <ChipForm
                        disabled={disabled}
                        chips={this.createChipList(checkedEnterprises, mainEnterprise)}
                        removeButton={true}
                        onRemoveClick={(id) => this.handleRemoveTag(id)}
                        onChipClick={(id) => this.handleClick(id)}
                        onClick={search && (() => this.setState({ showModal: true }))}
                        validationState={validationState}
                        helpText={helpText}
                        addonButton={!disabled && !search && {
                            bsStyle: 'primary',
                            label: (<i className="material-icons">group</i>),
                            isCircle: true,
                            tooltipLabel: '所属選択',
                            onClick: () => this.setState({ showModal: true })
                        }}
                    />
                    :
                    <LabelForm
                        isReadOnly={disabled}
                        value={selectedEnterprise && selectedEnterprise.enterpriseName}
                        addonButton={!disabled && this.getAddonButtons(clearButton)}
                        validationState={validationState}
                        helpText={helpText}
                    />
                }
            </div>
        )
    }
}

EnterpriseForm.propTypes = {
    multiple: PropTypes.bool,
    onChange: PropTypes.func,
    enterpriseList: PropTypes.array,
    checkedEnterprises: PropTypes.array,
    selectedEnterprise: PropTypes.object,
    mainEnterprise: PropTypes.object,
    validationState: PropTypes.string,
    helpText: PropTypes.string,
    initialTreeMode: PropTypes.oneOf(['individual', 'collective']),  //ツリーチェックモード初期値
    clearButton: PropTypes.bool
}

EnterpriseForm.defaultProps = {
    multiple: false,
    onChange: () => { },
    enterpriseList: [],
    clearButton: true,
    checkedEnterprises: []
}