/**
 * Copyright 2017 DENSO Solutions
 * 
 * DataTableRow Reactコンポーネント
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
 * DataTableRow
 * <DataTableRow clssName={}></DataTableHeader>
 * @param className クラス
 */
export default class DataTableRow extends Component {

    constructor(props) {
        super(props);
    }

    /**
     * クリックイベント
     */
    handleClick() {
        if (this.props.onClick) {
            this.props.onClick();
        }
    }

    /**
     * render
     */
    render() {

        const { className, style } = this.props;

        const classes = {

        };

        return (
            <tr
                className={classNames(className, classes)}
                style={style}
                onClick={() => this.handleClick()}
            >
                {this.props.children}
            </tr>
        );

    }

}

DataTableRow.propTypes = {
    className: PropTypes.string
}