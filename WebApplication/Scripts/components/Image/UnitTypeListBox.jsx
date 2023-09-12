'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import Box from 'Common/Layout/Box';

import UnitTypeList from 'Image/UnitTypeList';

export default class UnitTypeListBox extends Component {

    constructor() {
        super();
        this.state = {

        };
    }

    /**
     * render
     */
    render() {
        const { isLoading, unitTypes } = this.props;

        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>ユニット種別一覧</Box.Title>
                </Box.Header >
                <Box.Body>
                    <UnitTypeList edit
                        unitTypes={unitTypes || []}
                        onEditClick={(unitType) => this.props.onEditClick(unitType)}
                        onDeleteClick={(typeIds) => this.props.onDeleteClick(typeIds)}
                        onAddClick={() => this.props.onAddClick()}
                    />
                </Box.Body>
            </Box>
        );
    }
}