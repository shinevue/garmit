'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

/**
 * Switch
 * @param {bool} isOn
 * @param {func} onChange
 */
export default class Switch extends Component {

    constructor() {
        super();
        this.state = {

        }
    }

    render() {
        const { isOn, onChange } = this.props
        return (
            <ToggleButtonGroup type="radio" name="switch" value={isOn} className={this.props.className}>
                <ToggleButton value={true} onClick={() => onChange(true)}>ON</ToggleButton>
                <ToggleButton value={false} onClick={() => onChange(false)}>OFF</ToggleButton>
            </ToggleButtonGroup>
        );
    }
}