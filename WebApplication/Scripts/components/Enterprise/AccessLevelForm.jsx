'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { Radio } from 'react-bootstrap';

export default class AccessLevelForm extends Component {

    constructor() {
        super();
        this.state = {

        };
    }

    /**
     * ラジオボタンがクリックされた時
     * @param {any} index
     * @param {any} allowTypeNo
     */
    handleClick(index, allowTypeNo) {
        let functions = this.props.functions.slice();
        let func = Object.assign({}, functions[index]);
        if (func.allowTypeNo != allowTypeNo) {
            func.allowTypeNo = allowTypeNo;
            functions[index] = func;
            this.props.onChange(functions);
        }
    }

    /**
     * render
     */
    render() {
        const { functions, parentFunctions, disabled } = this.props;

        const accessLevelRows = [];

        functions.forEach((func, i) => {
            const parentFunc = parentFunctions && parentFunctions.find((f) => f.functionId == func.functionId);
            if (parentFunc && parentFunc.allowTypeNo !== 0) {
                accessLevelRows.push(
                    <tr>
                        <td className="pa-r-2">
                            {func.name}
                        </td>
                        <td className="pa-r-1">
                            <Radio inline
                                disabled={disabled}
                                checked={func.allowTypeNo == 9}
                                onClick={() => this.handleClick(i, 9)}
                            >
                                編集可
                    </Radio>
                        </td>
                        <td className="pa-r-1">
                            <Radio inline
                                disabled={disabled}
                                checked={func.allowTypeNo == 1}
                                onClick={() => this.handleClick(i, 1)}
                            >
                                読取専用
                    </Radio>
                        </td>
                        <td>
                            <Radio inline
                                disabled={disabled}
                                checked={func.allowTypeNo == 0}
                                onClick={() => this.handleClick(i, 0)}
                            >
                                非表示
                    </Radio>
                        </td>
                    </tr>
                );
            }
        });

        return (
            <div>
                <table>
                    {accessLevelRows}
                </table>
            </div>
        );
    }
}

AccessLevelForm.propTypes = {
    functions: PropTypes.array,
    onChange: PropTypes.func
}

AccessLevelForm.defaultProps = {
    functions: [],
    onChange: () => { }
}