'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { Grid, Row, Col, ButtonToolbar, ListGroup, ListGroupItem } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Box from 'Common/Layout/Box';
import TextForm from 'Common/Form/TextForm';
import InputForm from 'Common/Form/InputForm';
import EnterpriseForm from 'Assets/Condition/EnterpriseForm';

export default class TagInfoBox extends Component {

    constructor() {
        super();
        this.state = {

        };
    }

    /**
     * render
     */
    render() {
        const { isLoading, isReadOnly, tag, onChange, inputCheck, maxlength, lookUp } = this.props;

        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>タグ情報</Box.Title>
                </Box.Header >
                <Box.Body>
                    <InputForm>
                        <InputForm.Row>
                            <InputForm.Col label="名称" columnCount={2} isRequired={true}>
                                <TextForm
                                    value={tag && tag.name}
                                    maxlength={maxlength.name}
                                    isReadOnly={isReadOnly}
                                    validationState={!isReadOnly && inputCheck.name.state}
                                    helpText={!isReadOnly && inputCheck.name.helpText}
                                    onChange={(val) => onChange(val, 'name')}
                                />
                            </InputForm.Col>
                            <InputForm.Col label="所属" columnCount={2} isRequired={true}>
                                <EnterpriseForm
                                    selectedEnterprise={tag ? tag.enterprise : null}
                                    enterpriseList={lookUp && lookUp.enterprises}
                                    disabled={isReadOnly}
                                    validationState={!isReadOnly && inputCheck.enterprise.state}
                                    helpText={!isReadOnly && inputCheck.enterprise.helpText}
                                    onChange={(val) => onChange(val, 'enterprise')}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                    </InputForm>
                </Box.Body>
            </Box>
        );
    }
}