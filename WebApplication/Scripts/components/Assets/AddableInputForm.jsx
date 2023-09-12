/**
 * Copyright 2017 DENSO Solutions
 * 
 * 追加可能入力フォーム Reactコンポーネント
 *  
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

export default class AddableInputForm extends Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    /**
     * フォームを追加イベント
     * @param {number} maxNumber 表示可能最大フォーム数
     * @param {number} displayFormNumber 表示中のフォームの数
     */
    handleAddForm(maxNumber, displayFormNumber) {
        if (maxNumber && displayFormNumber <= maxNumber) {
            if (this.props.onAddForm) {
                this.props.onAddForm();
            }
        }
    }

    //#region render
    render() {
        const { displayFormNumber, maxNumber, isReadOnly } = this.props;
        let dispAddButton = !maxNumber ? true : displayFormNumber < maxNumber ? true : false;   //最大表示数がない場合はいつでも表示する
        return (
            <div className="select-option-input-form">
                {this.props.children}
                {dispAddButton && !isReadOnly &&
                    <div style={{ "padding-left": "15px" }}>
                        <Button className="btn-circle btn-garmit-add" onClick={() => this.handleAddForm(maxNumber, displayFormNumber)}>
                        </Button>
                    </div>
                }
            </div>
        );
    }
    //#endregion
}

AddableInputForm.propTypes = {
    displayFormNumber: PropTypes.number,        //表示中フォームの数
    maxNumber: PropTypes.number,                //フォームを最大何個表示させるか
    isReadOnly:PropTypes.bool                   //読み取り専用かどうか
}