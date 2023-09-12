/**
 * Copyright 2017 DENSO Solutions
 * 
 * DataTableHeader Reactコンポーネント
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
 * DataTableHeader
 * <DataTableHeader clssName={}></DataTableHeader>
 * @param className クラス
 */
export default class DataTableHeader extends Component {

    /**
     * render
     */
    render() {

        const { className } = this.props;

        const classes = {

        };

        return (
            <thead className={classNames(className, classes)} >
                {this.props.children}
            </thead>
        );

    }

}

DataTableHeader.propTypes = {
    className: PropTypes.string
}
