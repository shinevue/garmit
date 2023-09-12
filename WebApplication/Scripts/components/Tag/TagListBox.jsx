'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { Grid, Row, Col, ButtonToolbar, ListGroup, ListGroupItem } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Box from 'Common/Layout/Box';
import TextForm from 'Common/Form/TextForm';

export default class TagListBox extends Component {

    constructor() {
        super();
        this.state = {
            searchWord: '',
        };
    }

    /**
     * render
     */
    render() {
        const { isLoading, selectedTag, onSelect, tagList } = this.props;

        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>タグ一覧</Box.Title>
                </Box.Header >
                <Box.Body>
                    {tagList &&
                        <div>
                            <TextForm
                                label="検索:"
                                placeholder="search"
                                value={this.state.searchWord}
                                onChange={(val) => this.setState({ searchWord: val })}
                            />
                            <ListGroup style={{ maxHeight: 620, overflow: 'auto' }}>
                                {tagList.map((tag) => {
                                    const red = this.state.searchWord && tag.name.indexOf(this.state.searchWord) >= 0;
                                    return (
                                        <ListGroupItem
                                            style={{ color: red && '#D9534F' }}
                                            active={ selectedTag && tag.tagId === selectedTag.tagId }
                                            onClick={() => onSelect(tag)}
                                        >
                                            <span>{tag.name}</span>
                                        </ListGroupItem>
                                    );
                                })}
                            </ListGroup>
                        </div>
                    }
                </Box.Body>
            </Box>
        );
    }
}