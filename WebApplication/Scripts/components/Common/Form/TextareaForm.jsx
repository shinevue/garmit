/**
 * @license Copyright 2017 DENSO
 * 
 * TextareaForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';
import { isEdge } from 'edgeUtility';

/**
 * テキストエリアフォームコンポーネント
 * @param {string}　label フォームのタイトル
 * @param {string}　value 入力値
 * @param {string}　placeholder プレースフォルダに表示する文字列
 * @param {function}　onChange テキスト変更イベント
 * @param {boolean}　isReadOnly 読み取り専用かどうか
 * @param {string}　helpText 入力欄の説明。例：入力エラー時にエラー内容を表示する。
 * @param {oneOf}　validationState 検証結果（success, warning, error, null）
 * @param {string} className className
 * @param {number} maxlength 最大文字数
 * @param {bool} disableFocus フォーカスを無効にするかどうか
 * @param {bool} showTextLength 文字数を表示するか
 */
export default class TextareaForm extends Component {
    
    /**
     * コンストラクタ 
     */
    constructor(props) {
        super(props);
        this.state = {
            isEdge: isEdge()
        };
        this.textarea = null;
        this.container = null;
    }

    /**
     * マウントされた直後に1階だけ呼び出される
     */
    componentDidMount() {
        if (this.state.isEdge) {
            this.setResizeableTextArea();
        }
    }

    /**
     * コンポーネントが更新された後に呼び出される
     */
    componentDidUpdate() {
        if (this.state.isEdge) {
            this.setResizeableTextArea();
        }
    }

    /**
     * render
     */
    render() {
        const { label, value, placeholder, helpText, isReadOnly, validationState, maxlength, className, style, disableFocus, showTextLength } = this.props;
        const { isEdge } = this.state;
        var textLength = value ? value.length : 0;
        return (
            <FormGroup validationState={validationState} className={className} style={style}>
                {label && <ControlLabel>{label}</ControlLabel>}
                {!isEdge ?
                    <TextareaControl {...this.props} onChange={(e) => this.handleOnChange(e)} />
                :
                    this.makeTextareaForEdge()
                }
                {showTextLength && <HelpBlock className="mb-0 ta-r">{'('+textLength+'文字)'}</HelpBlock>}
                {helpText && <HelpBlock>{helpText}</HelpBlock>}
            </FormGroup>
        );
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
     * テキストエリア（Edge用）
     */
    makeTextareaForEdge() {
        return (
            <div className="edge-resizable-container textarea-container"
                 ref={(container) => this.handleSetContainer(container)}
            >
                <TextareaControl {...this.props} onChange={(e) => this.handleOnChange(e)} />
            </div>
        );        
    }

    /**
     * コンテナをセットする
     */
    handleSetContainer(container) {
        if (!this.container) {
            this.container = container
        }
    }
    
    /**
     * リサイズテキストエリアを設定する（EdgeのみJqueryUIを使用）
     */
    setResizeableTextArea() {
        let minHeight = $(this.container).css('min-height');
        $(this.container).resizable({
            handles: "se",
            minHeight: minHeight ? parseInt(minHeight) : 10,
            resize: function () {
                this.style.width = '100%';
            }
        });
    }

}

TextareaForm.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    isReadOnly: PropTypes.bool,
    helpText: PropTypes.string,
    validationState: PropTypes.oneOf(['success', 'warning', 'error', null]),
    className: PropTypes.string,
    maxlength: PropTypes.number,
    disableFocus: PropTypes.bool,
    showTextLength: PropTypes.bool
};


/**
 * テキストコントロール
 */
const TextareaControl = (props) => {
    const { value, placeholder,  isReadOnly, maxlength, style, disableFocus, onChange: handleOnChange } = props; 
    return (
        <FormControl 
            style={style} 
            componentClass='textarea' 
            value={value ? value : ''} 
            disabled={isReadOnly} 
            placeholder={placeholder} 
            maxlength={maxlength} 
            onChange={handleOnChange} 
            readOnly={disableFocus} 
        />
    );                
}