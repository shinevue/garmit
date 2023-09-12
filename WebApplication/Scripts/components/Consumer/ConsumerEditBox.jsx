'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';

import { LAVEL_TYPE } from 'authentication';

import Box from 'Common/Layout/Box';

import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import LocationForm from 'Assets/Condition/LocationForm';

export default class ConsumerEditBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            
        };
    }

    /**
     * render
     */
    render() {
        const { lookUp, level, consumer, inputCheck, bulk } = this.props;

        return (
            <Box boxStyle='default'>
                <Box.Header>
                    <Box.Title>コンシューマー情報</Box.Title>
                </Box.Header >
                <Box.Body>
                    <InputForm>
                        <InputForm.Row>
                            {!bulk &&
                                <InputForm.Col label="名称" columnCount={2} isRequired={true}>
                                    <TextForm
                                        isReadOnly={level > LAVEL_TYPE.manager}
                                        value={consumer.consumerName}
                                        validationState={inputCheck.consumerName.state}
                                        helpText={inputCheck.consumerName.helpText}
                                        onChange={(val) => this.props.onEdit([{ val: val, key: 'consumerName' }])}
                                        maxlength={200}
                                    />
                                </InputForm.Col>
                            }
                            <InputForm.Col label="ロケーション" columnCount={bulk ? 1 : 2} isRequired={true} >
                                <LocationForm
                                    disabled={level > LAVEL_TYPE.manager}
                                    locationList={lookUp && lookUp.locations}
                                    selectedLocation={consumer.location}
                                    onChange={(val) => this.props.onEdit([{ val: val, key: 'location' }])}                              
                                    validationState={inputCheck.location.state}
                                    helpText={inputCheck.location.helpText}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                    </InputForm>
                </Box.Body>
            </Box>
        );
    }
}