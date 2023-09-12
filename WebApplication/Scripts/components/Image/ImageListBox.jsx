'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import Box from 'Common/Layout/Box';

import ImageList from 'Assets/ImageList';

export default class ImageListBox extends Component {

    constructor() {
        super();
        this.state = {

        };
    }

    /**
     * render
     */
    render() {
        const { isLoading, unitImages } = this.props;

        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>ユニット画像一覧</Box.Title>
                </Box.Header >
                <Box.Body>
                    <ImageList edit striped
                        unitImages={unitImages || []}
                        onEditClick={(id) => this.props.onEditClick(id)}
                        onDeleteClick={(ids) => this.props.onDeleteClick(ids)}
                        onAddClick={() => this.props.onAddClick()}
                    />
                </Box.Body>
            </Box>
        );
    }
}