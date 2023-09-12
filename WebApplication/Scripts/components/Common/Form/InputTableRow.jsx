/**
 * @license Copyright 2017 DENSO
 * 
 * InputTableRow Reactコンポーネント
 * <InputTableRow/>
 * 
 */
'use strict';

import React, { Component } from 'react';
import { Row } from 'react-bootstrap';
import InputTableCol from './InputTableCol';
import InputTableHeaderCol from './InputTableHeaderCol';

/**
 * 入力フォーム一覧の行
 * <InputTableRow/>
 */
export default class InputTableRow extends Component {

    /**
     * コンポーネントをアップデートするかどうか
     */
    shouldComponentUpdate(nextProps, nextState) {
        if (JSON.stringify(nextProps.rowInfo) !== JSON.stringify(this.props.rowInfo)) {
            return true;
        }
        else if (nextProps.children !== this.props.children) {
            return true;
        }
    }

    /**
    * 入力フォーム変更イベントハンドラ
    */
    handleChange=(colInfo, e)=>{
        if (this.props.onChange) {
            this.props.onChange(colInfo, e);
        }
    }

    /**
    * ヘッダー付きカラム
    */
    getColGroup(headerColInfo, colInfo, inputComponent, i, disabled, isReadOnly) {
        const Column = (
            <InputTableCol
                columnSize={headerColInfo.columnSize}
                inputComponent={inputComponent}
                columnInfo={colInfo}
                onChange={this.handleChange.bind(this, colInfo)}
            />
        );
        const HeaderCol = (
            <InputTableHeaderCol
                columnSize={headerColInfo.columnSize}
                label={headerColInfo.label}
                isRequired={headerColInfo.isRequired}
                isInline={true}
                showCheckBox={isReadOnly ? false : headerColInfo.showCheckBox}
                onChangeChecked={headerColInfo.onChangeChecked}
                checked={headerColInfo.checked}
            />
        );
        return [HeaderCol, Column];
    }

    /**
     * render
     */
    render() {
        const { headerInfo, inputComponentList, rowInfo, isReadOnly, onChange } = this.props;
        return (
            <tr className={classNames("input-table-item-row", rowInfo.rowClassName ? rowInfo.rowClassName:null)} >
                {rowInfo &&
                    rowInfo.columnInfo.map((colInfo, i) => {
                        return this.getColGroup(headerInfo[i], colInfo, inputComponentList[i], i, rowInfo.disabled, isReadOnly)
                    })
                }
                {this.props.children}
            </tr>
        );
    }
}

InputTableRow.propTypes = {
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
    inputComponentList: PropTypes.arrayOf(PropTypes.element),
    rowInfo:PropTypes.shape({
        columnInfo: PropTypes.arrayOf(PropTypes.object)
    }),
    backColor:PropTypes.string
}

