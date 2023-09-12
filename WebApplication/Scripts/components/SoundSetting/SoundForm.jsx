'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { Grid, Row, Col, ButtonToolbar, Radio, FormGroup, FormControl } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import LabelForm from 'Common/Form/LabelForm';

export default class SoundForm extends Component {

    constructor() {
        super();
        this.state = {
            
        };
    }

    /**
     * render
     */
    render() {
        const { name, onCheckButtonClick, onClearButtonClick, checked, isReadOnly } = this.props;

        return (
            <LabelForm
                value={name}
                addonButton={!isReadOnly && [
                    {
                        key: 'check',
                        label: (<i className={checked ? "far fa-check" : "fal fa-check"} style= {{ opacity: checked ? 1 : 0.2 }}></i>),
                        isCircle: true,
                        onClick: onCheckButtonClick && (() => onCheckButtonClick())
                    },
                    {
                        key: 'clear',
                        bsStyle: 'lightgray',
                        iconId: 'erase',
                        isCircle: true,
                        onClick: onClearButtonClick && (() => onClearButtonClick())
                    }
                ]}
            />
        );
    }
}