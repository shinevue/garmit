/**
 * Copyright 2017 DENSO Solutions
 * 
 * ポイント検索結果ボックス Reactコンポーネント
 * <PointSearchResultBox />
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, FormControl, Row, Col, InputGroup, InputGroupButton, Panel, Grid } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import BoxColseButton from 'Common/Widget/BoxColseButton';

import SearchResultTable from 'Assets/SearchResultTable';

/**
 * ポイント検索結果ボックス
 * <PointSearchResultBox layoutInfo={}></BreakerInfoBox>
 */
export default class PointSearchResultBox extends Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    /**
     * render
     */
    render() {
        const { pointInfo, useCheckbox, checkedRowIndexes, onHoverButtonClick, onCheckChange } = this.props
        

        return (
            <Box boxStyle='default'>
                <Box.Header>
                    <Box.Title>検索結果</Box.Title>
                    <Box.Tools>
                        <BoxColseButton />
                    </Box.Tools>
                </Box.Header >
                <Box.Body>
                    <div>
                        <Grid fluid>
                            <Row>
                                <Col sm={12}>
                                    <SearchResultTable
                                        searchResult={pointInfo && pointInfo.pointResult}
                                        useCheckbox={useCheckbox}
                                        checkedRowIndexes={checkedRowIndexes}
                                        onCheckChanged={(val) => onCheckChange(val)}
                                        onHoverButtonClick={(button) => onHoverButtonClick(button)}
                                    />
                                </Col>
                            </Row>
                        </Grid>
                    </div>
                </Box.Body>
                <Box.Footer>
                </Box.Footer >
            </Box>
        );
    }
}

PointSearchResultBox.propTypes = {
    pointInfo: PropTypes.object,
    useCheckbox: PropTypes.bool,
    checkedRowIndexes: PropTypes.array,
    onCheckChange: PropTypes.func,
    onHoverButtonClick: PropTypes.func
};

PointSearchResultBox.defaultProps = {
    checkedRowIndexes: []
};

