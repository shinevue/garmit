/**
 * @license Copyright 2017 DENSO
 * 
 * InputForm Reactコンポーネント
 * <InputForm >
 *      <InputForm.Row>
 *          <InputForm.Col label='title' columnCount={2} isRequired={false}>
 *              ・・・FormGroups or FormControls
 *          </InputForm.Col>
 *          <InputForm.Col label='title' columnCount={2} isRequired={false}>
 *              ・・・FormGroups or FormControls
 *          </InputForm.Col>
 *      </InputForm.Row>
 *      <InputForm.Row>
 *          <InputForm.Col label='title' columnCount={1} isRequired={false}>
 *              ・・・FormGroups or FormControls
 *          </InputForm.Col>
 *      </InputForm.Row>
 * </InputForm>
 *  
 */
'use strict';

import React, { Component } from 'react';
import { Grid, Form } from 'react-bootstrap';
import classNames from 'classnames';

import InputFormRow from './InputFormRow';
import InputFormCol from './InputFormCol';

/**
 * 入力フォーム
 * <InputForm />
 */
export default class InputForm extends Component {

    /**
     * render
     */
    render() {
        const { className } = this.props;
        return (
            <Grid className={classNames(className, 'garmit-input-form')} fluid>
                <Form horizontal onSubmit={(e) => this.handleSubmit(e)} >
                    {this.props.children}
                </Form>
            </Grid>
        );
    }
    	
    /**
     * Submitイベントハンドラ
     * @param {*} e 
     */
    handleSubmit(e) {
        e.preventDefault();
        return false;           //リロードしない
    }
}

InputForm.Row = InputFormRow;
InputForm.Col = InputFormCol;