'use strict';

import React, { Component } from 'react';
import { FormGroup, ControlLabel, HelpBlock, Tooltip, OverlayTrigger } from 'react-bootstrap';

import Chip from 'Common/Widget/Chip';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import { isEdge } from 'edgeUtility';

/**
 * ChipForm
 */
export default class ChipForm extends Component {

    constructor() {
        super();
        this.state = {
            isEdge: isEdge()
        }
        this.container = null;
    }

    /**
     * マウントされた直後に1階だけ呼び出される
     */
    componentDidMount() {
        if (this.state.isEdge) {
            this.setResizeableChipControl();
        }
    }

    /**
     * コンポーネントが更新された後に呼び出される
     */
    componentDidUpdate() {
        if (this.state.isEdge) {
            this.setResizeableChipControl();
        }
    }

    /**
     * タグボックスを生成する
     */
    createChips() {
        const { chips, removeButton, onRemoveClick, onChipClick, disabled } = this.props;
        return chips.map((chip) => 
            <Chip
                disabled={disabled}
                name={chip.name}
                selected={chip.selected}
                removeButton={removeButton}
                onRemoveClick={() => onRemoveClick(chip.id)}
                onClick={() => { 
                    if (onChipClick) {
                        onChipClick(chip.id);
                    }
                }}
            />
        )
    }

    /**
     * フォームコントロールを生成する
     */
    createFormControl() {
        const { helpText, onClick, disabled } = this.props;
        const { isEdge } = this.state;
        const component = [];

        const chipForm = (
                <span                    
                    disabled={disabled}
                    className="form-control chip-form-control"        
                >
                    <div className="chip-form clearfix" onClick={() => onClick()} >
                        {this.createChips()}
                    </div>
                </span>
        );

        component.push(
            isEdge ? 
                <div
                    ref={(span) => this.handleSetChipFormContainer(span)}
                    className="edge-resizable-container chip-form-container"
                >
                    {chipForm}
                </div>
            :
                chipForm
        );

        if (helpText) {
            component.push(
                <HelpBlock>{helpText}</HelpBlock>
            );
        }

        return component;
    }

    /**
     * アドオンボタン付きフォームコントロールを生成する
     */
    createFormControlAddonButton() {
        const { addonButton } = this.props;
        return (
            <div className='garmit-input-group'>
                <div className='garmit-input-item'>
                    {this.createFormControl()}
                </div>
                <div className='garmit-input-item garmit-input-addon va-t'>
                    {Array.isArray(addonButton) ?
                        addonButton.map((b) => this.setButton(b))
                        :
                        this.setButton(addonButton)
                    }
                </div>
            </div>
        );
    }

    /**
     * ボタンを設定する
     */
    setButton(addonButton) {
        const { disabled } = this.props;
        const { key, tooltipLabel, buttonIconClass, label, bsStyle, isCircle, iconId, onClick } = addonButton;
        const button = (<Button className='ml-05' iconId={iconId} isCircle={isCircle} bsStyle={bsStyle} disabled={disabled} onClick={() => onClick()} >
            {buttonIconClass && <Icon className={buttonIconClass + (label ? ' mr-05' : '')} />}
            {label}
        </Button>);
        return (tooltipLabel ?
            <OverlayTrigger placement='bottom' overlay={this.makeTooltip(tooltipLabel)}>
                {button}
            </OverlayTrigger>
            :
            button
        )
    }

    /**
     * ツールチップを作成する
     * @param {string} label ツールチップに表示する文字列
     */
    makeTooltip(label) {
        var tooltip = '';
        if (label) {
            tooltip = (
                <Tooltip>{label}</Tooltip>
            );
        }
        return tooltip;
    }

    /**
     * render
     */
    render() {
        const { onEditClick, validationState, helpText, disabled, label, addonButton } = this.props;

        return (
            <FormGroup validationState={validationState}>
                {label && <ControlLabel>{label}</ControlLabel>}
                {addonButton ? this.createFormControlAddonButton() : this.createFormControl()}
            </FormGroup>          
        );
    }
    
    /**
     * コンテナをセットする
     */
    handleSetChipFormContainer(container) {
        if (!this.container) {
            this.container = container
        }
    }
    

    /**
     * リサイズチップコントロールを設定する（EdgeのみJqueryUIを使用）
     */
    setResizeableChipControl() {
        if (!this.container) return;
        let minHeight = $(this.container).css('min-height');
        let maxHeight = $(this.container).css('max-height');
        $(this.container).resizable({
            handles: "se",
            minHeight: minHeight ? parseInt(minHeight) : 10,
            maxHeight: maxHeight ? parseInt(maxHeight) : null,
            resize: function () {
                this.style.width = '100%';
            }
        });
    }
}

ChipForm.propTypes = {
    chips: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.any.isRequired,
        name: PropTypes.any.isRequired
    })),
    removeButton: PropTypes.bool,
    onRemoveClick: PropTypes.func,
    onEditClick: PropTypes.func,
    onClick: PropTypes.func,
    validationState: PropTypes.string,
    helpText: PropTypes.string
}

ChipForm.defaultProps = {
    chips: [],
    removeBurron: false,
    onRemoveClick: () => { },
    onEditClick: () => { },
    onClick: () => { }
}