'use strict';

import React, { Component } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import Box from 'Common/Layout/Box';
import TextForm from 'Common/Form/TextForm';
import { getRouteNameUsingChildren } from 'patchboardUtility';

export default class PatchboardPathListBox extends Component {

    constructor() {
        super();
        this.state = {
            searchWord: ''
        };
    }

    handleOnChangeSearchWord(word) {
        this.setState({ searchWord: word });
    }

    isActiveRow(path, selectedPath){
        if (!selectedPath) {
            return false;
        }
        let deepestPath = this.getDeepestNode(path);
        if (deepestPath.patchboardId === selectedPath.patchboardId && deepestPath.pathNo === selectedPath.pathNo) {
            return true;
        }else{
            return false;
        }
    }

    getDeepestNode(path){
        if (!path.children || path.children.length === 0) {
            return path;
        }else {
            return this.getDeepestNode(path.children[0]);
        }
    }

    onClick(path){
        let deepestPath = this.getDeepestNode(path);
        this.props.onSelect(deepestPath);
    }

    filterPathList(pathList, searchWord) {
        return pathList && pathList.filter((path) => {
            if (!searchWord) {
                return true;
            } else {
                const name = getRouteNameUsingChildren(path);
                return name.indexOf(searchWord) >= 0;
            }
        });
    }

    /**
     * render
     */
    render() {
        const { isLoading, selectedPath, patchboardTreeList } = this.props;
        const { searchWord } = this.state;

        const filteredPatchboardPathList = this.filterPathList(patchboardTreeList, searchWord);

        return (
            patchboardTreeList ?
                <Box boxStyle='default' isLoading={isLoading}>
                    <Box.Header>
                        <Box.Title>経路一覧</Box.Title>
                    </Box.Header >
                    <Box.Body>
                        <div>
                            <TextForm
                                label="検索:"
                                placeholder="search"
                                value={searchWord}
                                onChange={(val) => this.handleOnChangeSearchWord(val)}
                            />
                            <ListGroup style={{ maxHeight: 450, overflow: 'auto' }}>
                                {filteredPatchboardPathList.map((tree, i) => {
                                    return (
                                        <ListGroupItem
                                            key={i}
                                            active={ this.isActiveRow(tree, selectedPath) }
                                            onClick={ () => this.onClick(tree) }
                                        >
                                            <span>{getRouteNameUsingChildren(tree)}</span>
                                        </ListGroupItem>
                                    );
                                })}
                            </ListGroup>
                        </div>
                    </Box.Body>
                </Box>
                :
                <div></div>
        );
    }
}