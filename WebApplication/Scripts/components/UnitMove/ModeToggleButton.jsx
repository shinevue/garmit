/**
 * @license Copyright 2018 DENSO
 * 
 * ModeToggleButton Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import propTypes from 'prop-types';
import { Form, FormGroup, ControlLabel } from 'react-bootstrap';
import ToggleSwitch from 'Common/Widget/ToggleSwitch';

/**
 * モード選択トグルボタン
 * @param {array} modes モード情報リスト 
 * @param {function} onChange モード変更時に呼びだす
 */
export default class ModeToggleButton extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
        this.state = {
            value: false,
        };
    }



    /**
     * render
     */
    render() {
        const { modes, defaultMode } = this.props;
        return (
            <Form lnline className="mt-05 hidden-xs">
                <FormGroup className="mb-05">
                    <ControlLabel className='mr-05'>モード選択</ControlLabel>
                    <ToggleSwitch name="mode" swichValues={modes} defaultValue={defaultMode} onChange={(value) => this.changeMode(value)} />
                </FormGroup>
            </Form>
        );
    }

    /**
     * モード変更イベントを呼び出す
     * @param {number} value モード番号
     */
    changeMode(value) {
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }
}

ModeToggleButton.propTypes = {
    modes: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
    })),
    onChange: PropTypes.func,
    defaultMode: PropTypes.number
}