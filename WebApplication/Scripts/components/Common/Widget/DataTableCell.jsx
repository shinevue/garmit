/**
 * Copyright 2017 DENSO Solutions
 * 
 * DataTableCell Reactコンポーネント
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
 * DataTableCell
 * <DataTableCell className={}></DataTableCell>
 * @param className クラス
 */
export default class DataTableCell extends Component {

    //テーブルセルクリックイベント
    clickCell() {
        if (this.props.clickCell) {
            this.props.clickCell();
        }
    }

    /**
     * render
     */
    render() {

        const { className, style, width, colspan, rowSpan } = this.props;

        const classes = {

        };

        return (
            <td className={classNames(className, classes)} onClick={() => this.clickCell()} style={style} width={width} colSpan={colspan} rowSpan={rowSpan} >
                {this.props.children}
            </td>
        );

    }

}
DataTableCell.propTypes = {
    className: PropTypes.string
}
