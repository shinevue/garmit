/**
 * @license Copyright 2017 DENSO
 * 
 * SelectForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, FormControl, HelpBlock, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Icon from 'Common/Widget/Icon';
import Button from 'Common/Widget/Button';

/**
 * セレクトフォーム（プルダウンメニュー）のコンポーネント
 * @param {string}　label フォームのタイトル
 * @param {string}　value 選択した値
 * @param {array} options 選択肢リスト（value、nameのリスト）
 * @param {string}　placeholder プレースフォルダに表示する文字列
 * @param {oneOf}　validationState 検証結果（success, warning, error, null）
 * @param {string}　helpText 入力欄の説明。例：入力エラー時にエラー内容を表示する。
 * @param {function}　onChange テキスト変更イベント
 * @param {boolean}　isReadOnly 読み取り専用かどうか
 * @param {string} className className
 * @param {boolean} isButtonOnlyControl ボタンのみを制御するかどうか（falseの場合は、全てを制御）
 */
export default class SelectForm extends Component {

    /**
     * render
     */
    render() {
        const { label,  validationState, onChange, className, addonButton, style, bsSize } = this.props;
        return (
            <FormGroup validationState={validationState} className={className} style={style} bsSize={bsSize} >
                {label && <ControlLabel>{label}</ControlLabel>}
                {addonButton?this.formControl_AddonButton():this.formControl()}
            </FormGroup>
        );
    }
    
    
    /**
     * 通常のフォームコントロール
     */
    formControl() {
        const { value, options, helpText, onChange, isReadOnly, className, isButtonOnlyControl, isRequired, placeholder } = this.props;
        var selectButton = [];
        var items = options ? options : [];
        if (!isRequired && (items.length <= 0||items[0].value !== -1)) {
            items.unshift({
                value: -1,
                name: placeholder
            });
        }
                
        selectButton.push(
            <FormControl componentClass='select' value={(value || value === 0) ? value : -1} onChange={(e) => this.handleChanged(e)} disabled={!isButtonOnlyControl && isReadOnly}>
                {items && items.map((i) => <option value={i.value} disabled={i.disabled}>{i.name}</option>)}
            </FormControl>
        );
        if (helpText) {
            selectButton.push(<HelpBlock>{helpText}</HelpBlock>);
        }
        return selectButton;
    }

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
        const { key, tooltipLabel, buttonIconClass, label, bsStyle, isCircle, iconId, disabled } = addonButton;
        const button = (<Button className='ml-05' iconId={iconId} isCircle={isCircle} bsStyle={bsStyle} disabled={isReadOnly || disabled} onClick={() => this.handleButtonCilck(key)} >                                                
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
     * テキスト変更イベント
     * @param {*} event 
     */
    handleChanged(event) {
        if ( this.props.onChange ) {
            this.props.onChange( event.target.value );
        }
    }
}

SelectForm.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string.isRequired,
    options: PropTypes.arrayOf( PropTypes.shape({
        value: PropTypes.string,
        name: PropTypes.string,
        disabled:PropTypes.string
    })),
    placeholder: PropTypes.string,
    validationState: PropTypes.oneOf(['success', 'warning', 'error', null]),
    helpText: PropTypes.string,
    onChange: PropTypes.func,
    isReadOnly: PropTypes.bool,
    className: PropTypes.string,
    addonButton : PropTypes.oneOfType(
        [
            PropTypes.shape({
                label: PropTypes.string,
                buttonIconClass : PropTypes.string,
                tooltipLabel : PropTypes.string,
                bsStyle: PropTypes.oneOf(['success', 'warning', 'danger', 'info', 'default', 'primary', 'link', null]),
                isCircle: PropTypes.bool,
                iconId: PropTypes.string
            }),
            PropTypes.arrayOf(PropTypes.shape({
                key: PropTypes.number.isRequired,           //任意のキー 配列の中では重複なしとする
                label: PropTypes.string,
                buttonIconClass : PropTypes.string,
                tooltipLabel : PropTypes.string,
                onClick : PropTypes.func,
                bsStyle: PropTypes.oneOf(['success', 'warning', 'danger', 'info', 'default', 'primary', 'link', null]),
                isCircle: PropTypes.bool,
                iconId: PropTypes.string
            }))
        ]),
    onButtonClick: PropTypes.func,
    isButtonOnlyControl: PropTypes.bool,
    isRequired : PropTypes.bool
}

SelectForm.defaultProps = {
    placeholder: '選択してください'
}
