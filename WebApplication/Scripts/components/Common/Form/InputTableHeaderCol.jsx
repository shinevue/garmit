/**
 * @license Copyright 2017 DENSO
 * 
 * InputTableHeaderCol Reactコンポーネント
 * <InputTableHeaderCol label='title' columnCount={2} isRequired={false} />
 *  
 */
'use strict';

import React, { Component } from 'react';
import { Col, Row, FormGroup, ControlLabel, Checkbox } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * 入力フォーム一覧のヘッダーカラム
 * @param {string} label 入力欄のタイトル
 * @param {number} columnSize 入力欄の大きさ
 * @param {boolen} isRequired 必須表示するかどうか
 * @param {boolen} isInline テーブル上部ではなく各カラムの横に表示する
 * @param {boolen} showCheckBox チェックボックスを表示するかどうか
 * @param {boolen} checked チェック状態かどうか
 * @param {boolen} checkBoxDisabled チェックボックスの有効状態
 */
export default class InputTableHeaderCol extends Component {
    
    /**
     * render
     */
    render() {
        const { label, columnSize, isRequired, isInline, showCheckBox, checked, checkBoxDisabled } = this.props;

        if (columnSize && columnSize <= 0) {
            return null;
        }
        else {
            return (
                <Col sm={columnSize} xs={6} className={(isInline ? "visible-xs" : "hidden-xs") + " garmit-input-header"} componentClass="th">
                    {label &&
                        <label className="flex-center mt-05">{label}
                            {isRequired && <span className='text-red'>*</span>}
                        </label>
                    }
                    {showCheckBox && 
                        <Checkbox className="hidden-xs" checked={checked} disabled={checkBoxDisabled} bsClass="flex-center" onChange={(e) => this.handleCheckChanged(e.target.checked)} />                        
                    }
                </Col>
            );
        }
    }

    handleCheckChanged(value) {
        if(this.props.onChangeChecked) {
            this.props.onChangeChecked(value);
        }
    }
}

InputTableHeaderCol.PropTypes = {
    label: PropTypes.string,
    columnSize : PropTypes.number,
    isRequired: PropTypes.bool,
    isInline:PropTypes.bool,
    showCheckBox: PropTypes.bool,
    checked:PropTypes.bool,
    checkBoxDisabled: PropTypes.bool,
    onCheckChanged: PropTypes.func
}