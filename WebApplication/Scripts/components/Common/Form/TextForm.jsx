/**
 * @license Copyright 2017 DENSO
 * 
 * TextForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, FormControl, HelpBlock, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Icon from 'Common/Widget/Icon';
import Button from 'Common/Widget/Button';

/**
 * テキスト入力コンポーネント
 * @param {string}　label フォームのタイトル
 * @param {string}　value 入力値
 * @param {oneOf} type 入力コンポーネントの種類（text, url, email）
 * @param {string}　placeholder プレースフォルダに表示する文字列
 * @param {function}　onChange テキスト変更イベント
 * @param {boolean}　isReadOnly 読み取り専用かどうか
 * @param {string}　helpText 入力欄の説明。例：入力エラー時にエラー内容を表示する。
 * @param {oneOf}　validationState 検証結果（success, warning, error, null）
 * @param {function}　onKeyDown KeyDownイベント
 * @param {string} unit 単位文字列
 * @param {string} className className
 * @param {string} formControlClassName フォームコントロールのclassName
 * @param {number} maxlength 最大文字数
 */
export default class TextForm extends Component {
    
    /**
     * render
     */
    render() {
        const { label, unit, validationState, className, minWidth, bsSize, addonButton } = this.props;
        return (
            <FormGroup validationState={validationState} className={className} style={{ minWidth: minWidth }} bsSize={bsSize}>
                {label&&<ControlLabel>{label}</ControlLabel>}
                {unit?this.formControl_WithUnit(unit):(addonButton ? this.formControl_AddonButton() : this.formControl())}
            </FormGroup>
        );
    }

    /**
     * 通常のフォームコントロール
     */
    formControl() {
        const { value, isReadOnly, helpText, placeholder, type, maxlength, formControlClassName } = this.props;
        var textBox = [];
        textBox.push(
            <FormControl
                type={this.getType(type)}
                disabled={isReadOnly}
                value={(value || value === 0) ? value : ''}
                placeholder={placeholder}
                maxlength={maxlength}
                className={formControlClassName}
                onChange={(e) => this.handleOnChange(e)}
                onKeyDown={() => this.handleOnKeyDown()}
                onClick={() => this.handleOnClick()}
            />
        );
        if (helpText) {
            textBox.push(<HelpBlock>{helpText}</HelpBlock>);
        }
        return textBox
    }

    /**
     * 単位付きのフォームコントロール
     * @param {string} unit 
     */
    formControl_WithUnit(unit){
        return (
            <div className='garmit-input-group'>
                <div className='garmit-input-item'>
                    {this.formControl()}
                </div>
                <div className='garmit-input-item garmit-input-addon'>
                    <span>{unit}</span>
                </div>
            </div>
        );
    }
    
    /**
     * ボタン付きのフォームコントロール
     */
    formControl_AddonButton() {
        const { addonButton } = this.props;
        return (
            <div className='garmit-input-group'>
                <div className='garmit-input-item'>
                    {this.formControl()}
                </div>
                <div className='garmit-input-item garmit-input-addon va-t'>
                    {Array.isArray(addonButton)?
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
    setButton(addonButton){
        const { isReadOnly } = this.props;
        const { key, tooltipLabel, buttonIconClass, label, bsStyle, iconId, isCircle } = addonButton;
        const button = (<Button className='ml-05'  iconId={iconId} isCircle={isCircle} bsStyle={bsStyle} disabled={isReadOnly} onClick={() => this.handleButtonCilck(key)} >                                                
                            {buttonIconClass&&<Icon className={buttonIconClass+(label?' mr-05':'')} />}
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
    makeTooltip(label){
        var tooltip = '';
        if (label) {
            tooltip= (
                <Tooltip>{label}</Tooltip>
            );
        }
        return tooltip;
    }

    /**
     * ボタンクリックイベント
     * @param {*} key キー
     */
    handleButtonCilck(key) {
        const { addonButton } = this.props;
        if (key){
            const target = addonButton.find((i) => i.key === key );
            if (target.onClick) {
                target.onClick();
            }
        } else {
            if ( this.props.onButtonClick ) {
                this.props.onButtonClick();
            }
        }
    }

    /**
     * inputのタイプを取得する
     * @param {type} type 指定されたinputの種類
     * @return {string}
     */
    getType(type){
        const types = ['text', 'url', 'email'];
        return types.some((item) => item === type) ? type : 'text';
    }

    /**
     * テキスト変更イベント
     * @param {*} event 
     */
    handleOnChange(event){
        if (this.props.onChange) {
            this.props.onChange(event.target.value);
        }
    }

    /**
     * テキストボックスでのKeyDownイベント
     */
    handleOnKeyDown(){
        if ( this.props.onKeyDown ){
            this.props.onKeyDown();
        }
    }

    /**
     * テキストボックスのクリックイベント
     */
    handleOnClick() {
        if (this.props.onClick) {
            this.props.onClick();
        }
    }
}

TextForm.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    type: PropTypes.oneOf(['text','url', 'email']),
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    isReadOnly: PropTypes.bool,
    helpText: PropTypes.string,
    validationState: PropTypes.oneOf(['success', 'warning', 'error', null]),
    onKeyDown: PropTypes.func,
    unit: PropTypes.string,
    className: PropTypes.string,
    formControlClassName: PropTypes.string,
    maxlength: PropTypes.number
};
