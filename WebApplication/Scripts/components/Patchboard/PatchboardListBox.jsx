'use strict';

import React, { Component } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import Box from 'Common/Layout/Box';
import TextForm from 'Common/Form/TextForm';

export default class PatchboardListBox extends Component {

    constructor() {
        super();
        this.state = {
            searchWord: '',
            filteredPatchboard: [],
        };
    }

    handleOnChangeSearchWord(word){
        this.setState({ searchWord: word });
        this.filterPatchboards(word);
    }

    filterPatchboards(searchWord){
        let patchboards = this.props.patchboardList.map((item) => {
            if (!searchWord || (searchWord && item.patchboardName.indexOf(searchWord) >= 0)) {
                return item;
            }
        }).filter(item => item);
        this.setState({ filteredPatchboard: patchboards})
    }

    componentDidMount(){
        this.setState({ filteredPatchboard: this.props.patchboardList})
    }

    /**
     * render
     */
    render() {
        const { isLoading, selectedPatchboard, onSelect, patchboardList } = this.props;

        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>配線盤一覧</Box.Title>
                </Box.Header >
                <Box.Body>
                    {patchboardList &&
                        <div>
                            <TextForm
                                label="検索:"
                                placeholder="search"
                                value={this.state.searchWord}
                                onChange={(val) => this.handleOnChangeSearchWord(val)}
                            />
                            <ListGroup style={{ maxHeight: 450, overflow: 'auto' }}>
                                {this.state.filteredPatchboard.map((patchboard) => {
                                    return (
                                        <ListGroupItem
                                            active={ selectedPatchboard && patchboard.patchboardId === selectedPatchboard.patchboardId }
                                            onClick={() => onSelect(patchboard)}
                                        >
                                            <span>{patchboard.patchboardName}</span>
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