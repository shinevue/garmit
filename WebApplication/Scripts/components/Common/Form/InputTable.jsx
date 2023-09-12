/**
 * @license Copyright 2017 DENSO
 * 
 * InputTable Reactコンポーネント
 * <InputTable headerInfo={headerInfo} inputComponentList={inputComponentList} data={data} />                                                                                        
 */
'use strict';

import React, { Component } from 'react';
import { Grid, Form } from 'react-bootstrap';

import InputTableRow from './InputTableRow';
import InputTableCol from './InputTableCol';
import InputTableHeaderCol from './InputTableHeaderCol';
import InputTableHeaderRow from './InputTableHeaderRow';

export default class InputTable extends Component {

    /**
     * render
     */
    render() {
        const { headerInfo, inputComponentList, data } = this.props;
        const columnCount = headerInfo.length;

        return (
            <table className='garmit-input-table table-bordered table-responsive'>
                <thead>
                    <InputTable.HeaderRow>
                        {headerInfo &&
                            headerInfo.map((col) => {
                            return <InputTable.HeaderCol {...col} />
                            })
                        }
                    </InputTable.HeaderRow>
                </thead>
                <tbody>
                    {data &&
                        data.map((rowInfo, index) => {
                        return (
                            <InputTable.Row
                                headerInfo={headerInfo}
                                inputComponentList={inputComponentList}
                                rowInfo={rowInfo}
                            />
                            );
                        })
                    }
                    {this.props.children && this.props.children}
                </tbody>
            </table>
            );
    }
}

InputTable.propTypes = {
    headerInfo:
        PropTypes.shape([
            PropTypes.shape({
                label: PropTypes.string,
                columnSize: PropTypes.number,
                isRequired: PropTypes.bool,
                showCheckBox: PropTypes.bool,
                onChangeChecked: PropTypes.func
            })
        ]),
    inputComponentList:PropTypes.arrayOf(PropTypes.element),
    data:
        PropTypes.shape([
            PropTypes.shape({
                columnInfo: PropTypes.arrayOf(PropTypes.object)
            })
    ])
}

InputTable.Row = InputTableRow;
InputTable.Col = InputTableCol;
InputTable.HeaderCol = InputTableHeaderCol;
InputTable.HeaderRow = InputTableHeaderRow;
