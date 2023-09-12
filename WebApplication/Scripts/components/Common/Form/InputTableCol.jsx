/**
 * @license Copyright 2017 DENSO
 * 
 * InputTableCol Reactコンポーネント
 * <InputTableCol columnSize={2} isRequired={false} />
 *  
 */
'use strict';

import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * 入力フォームの入力欄
 * <InputTableCol columnSize={2} isRequired={false}>
 *      ・・・FormGroups or FormControls
 * </InputTableCol>
 * @param {number} columnSize 入力欄の大きさ
 * @param {string} validationState 検証結果
 */
export default class InputTableCol extends Component {

    /**********************************
    * 
    * ライフサイクルメソッド
    * 
    **********************************/

    /**
     * コンポーネントをアップデートするかどうか
     */
    shouldComponentUpdate(nextProps, nextState) {
        if (JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
            return true;
        }
    }

    /**
    * 入力フォーム変更イベントハンドラ
    */
    handleChange = (e) => {
        if (this.props.columnInfo.onChange) {
            this.props.columnInfo.onChange(e);    //カラム情報プロパティで直接イベント関数を渡している場合
        }
        if (this.props.onChange) {
            this.props.onChange(e);
        }
    }

    /**
     * render
     */
    render() {
        const { columnSize, inputComponent, columnInfo } = this.props;

        if (columnSize && columnSize <= 0) {
            return null;
        }
        else {
            return (
                <Col componentClass="td" sm={columnSize} xs={6} className='pa-05 input-table-col'>
                    <InputForm
                        inputComponent={inputComponent}
                        columnInfo={columnInfo}
                        onChange={this.handleChange.bind(this)} />
                </Col>
            );
        }
    }
}

InputTableCol.PropTypes = {
    columnSize : PropTypes.number,
    inputComponent: PropTypes.element,
    columnInfo: PropTypes.array
}

/**
* 入力フォーム
*/
const InputForm = ({ inputComponent, columnInfo, onChange: handleChange }) => React.createElement(inputComponent, { ...columnInfo, onChange: handleChange });