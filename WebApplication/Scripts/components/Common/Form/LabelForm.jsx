/**
 * @license Copyright 2017 DENSO
 * 
 * LabelForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, FormControl, OverlayTrigger, Tooltip, HelpBlock } from 'react-bootstrap';
import Icon from 'Common/Widget/Icon';
import Button from 'Common/Widget/Button';

/**
 * テキスト表記のみコンポーネント
 * @param {string}　label フォームのタイトル
 * @param {string}　value 表示値
 * @param {oneOf} bsSize 表示サイズ（'sm','small', 'lg', 'large'）
 * @param {string} className className
 * @param {object} addonButton ボタンの情報(複数ボタンのときは配列で定義)
 * @param {function} onButtonClick ボタンクリックイベント
 * @param {boolean} isReadOnly 読み取り専用かどうか
 */
export default class LabelForm extends Component {
    
    /**
     * render
     */
    render() {
        const { label, bsSize, className, addonButton, style, helpText, validationState } = this.props;

        return (
            <FormGroup bsSize={bsSize} className={className} style={style} validationState={validationState}>
                {label&&<ControlLabel >{label}</ControlLabel>}
                {addonButton ? this.formControl_AddonButton() : this.formControl()}
                {helpText && <HelpBlock>{helpText}</HelpBlock>}
            </FormGroup>
        );
    }

    /**
     * 通常のフォームコントロール
     */
    formControl(){
        const { value, likeTextForm } = this.props;
        return <FormControl.Static className={likeTextForm && 'form-control'}> { value }</FormControl.Static >
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

}

LabelForm.propTypes = {
    label : PropTypes.string,
    value : PropTypes.string,
    bsSize: PropTypes.oneOf(['sm','small', 'lg', 'large']),
    className : PropTypes.string,
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
    isReadOnly : PropTypes.bool,
};
