/**
 * Copyright 2017 DENSO Solutions
 * 
 * DataTableBody Reactコンポーネント
 * 
 * <DataTable className='mr-1' boxStyle='info' isSolid={false} isLoading={false} >
 *  <Box.Header>
 *      <Box.Title>...title</Box.Title>
 *      <Box.Tools>
 *       ...tools
 *      </Box.Tools>
 *  </Box.Header>
 *  <Box.Body>...</Box.Body>
 *  <Box.Footer></Box.Footer>
 * </Box>
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * DataTableBody
 * <DataTableBody className={}></DataTableBody>
 * @param className クラス
 */
export default class DataTableBody extends Component {

    /**
     * render
     */
    render() {

        const { className } = this.props;

        const classes = {

        };

        return (
            <tbody className={classNames(className, classes)} >
                    {this.props.children}
            </tbody>
        );

    }

}

DataTableBody.propTypes = {
    className: PropTypes.string
};
