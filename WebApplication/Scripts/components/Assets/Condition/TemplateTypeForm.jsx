/**
 * @license Copyright 2017 DENSO
 * 
 * TemplateTypeForm Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { FormGroup, FormControl, Radio } from 'react-bootstrap';

export default class TemplateTypeForm extends Component {

    constructor(props) {
        super(props)
        this.state = {
            checked:"rack"
        }
    }

    /**
     * チェック状態変更イベント
     */
    changeCheck(value) {
        this.setState({ checked: value });
    }

    /**
     * render
     */
    render() {
        const { checked } = this.state;

        return (
            <FormGroup>
                <Radio name="templateType" value="rack" inline checked={checked === "rack" ? true : false} onClick={(e)=>this.changeCheck(e.target.value)}>
                    ラック
			        </Radio>
                <Radio name="templateType" value="unit" inline checked={checked === "unit" ? true : false} onClick={(e) => this.changeCheck(e.target.value)}>
                    ユニット
			        </Radio>
            </FormGroup>
        )
    }
}

TemplateTypeForm.propTypes = {
    onChange: PropTypes.func,
}