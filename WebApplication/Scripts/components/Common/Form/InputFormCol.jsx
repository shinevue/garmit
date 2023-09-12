/**
 * @license Copyright 2017 DENSO
 * 
 * InputFormCol Reactコンポーネント
 * <InputFormCol label='title' columnCount={2} isRequired={false}>
 *      ・・・formControls
 * </InputFormCol>
 *  
 */
'use strict';

import React, { Component } from 'react';
import { Col, Row, FormGroup, ControlLabel, Checkbox, OverlayTrigger, Tooltip } from 'react-bootstrap';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * 入力フォームの入力欄
 * <InputFormCol label='title' columnCount={2} isRequired={false}>
 *      ・・・FormGroups or FormControls
 * </InputFormCol>
 * @param {string} label 入力欄のタイトル
 * @param {number} columnCount 入力欄の大きさ
 * @param {boolen} isRequired 必須表示するかどうか
 * @param {string} validationState 検証結果
 */
export default class InputFormCol extends Component {

    /**
     * チェックボックスのチェック状態が変更された時
     */
    onCheckChange() {
        if (this.props.onCheckChange) {
            this.props.onCheckChange(!this.props.checked);
        }
    }

    /**
     * ツールチップを作成する
     * @param {any} text
     */
    makeTooltip(text) {
        var tooltip = '';
        if (text) {
            tooltip = (
                <Tooltip><div className="ta-l">{text}</div></Tooltip >
            );
        }
        return tooltip;
    }

    /**
     * render
     */
    render() {
        const { label, isRequired, validationState, className, checkbox, checked, onCheckChange, helpText, childrenClassName } = this.props;
        const columnCount = this.props.columnCount ? this.props.columnCount : 1;

        return (
            <Col className={className} xsHidden={label?false:true} sm={12/columnCount}>
                <Row>
                    <Col sm={2 * columnCount} className='pa-t-05'>
                        {checkbox &&
                            <Checkbox
                                style={{ display: 'inline-block', verticalAlign: 'top' }}
                                checked={checked}
                                onClick={() => this.onCheckChange(!checked)}
                            />}
                        {label && <ControlLabel>{label}</ControlLabel>}
                        {isRequired && <span className='text-red'>*</span>}
                        {helpText &&
                            <div style={{ paddingTop: 7, float: 'right' }}>
                            <OverlayTrigger placement='right' overlay={this.makeTooltip(helpText)}>
                                <i class="material-icons">help</i>
                            </OverlayTrigger>
                            </div>
                        }
                    </Col>
                    <Col sm={12 - 2*columnCount} className={classNames('pa-05', childrenClassName)}>
                        {this.props.children}
                    </Col>    
                </Row>
            </Col>
        );
    }
}

InputFormCol.PropTypes = {
    label: PropTypes.string,
    columnCount : PropTypes.number,
    isRequired: PropTypes.bool,
    validationState: PropTypes.string,
    childrenClassName: PropTypes.string
}