/**
 * Copyright 2017 DENSO Solutions
 * 
 * garmit用ボックス Reactコンポーネント
 *  
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Box from 'Common/Layout/Box';

const GarmitBox = ({ isLoading, title, children, defaultClose }) => {
    const body = _.isArray(children) && children.length > 0 ? children[0] : children;
    const footer = children && children.length > 1 && children[1] && _.drop(children);
    return (
        <Box isLoading={isLoading} defaultClose={defaultClose}>
            <Box.Header>
                <Box.Title>{title}</Box.Title>
            </Box.Header >
            <Box.Body>
                {body}
            </Box.Body>
            {footer &&
                <Box.Footer>
                    {footer}
                </Box.Footer>
            }
        </Box>
    );
}

export default GarmitBox;

GarmitBox.propTypes = {
    isLoading: PropTypes.bool,
    title: PropTypes.string,
    children: PropTypes.element
}
