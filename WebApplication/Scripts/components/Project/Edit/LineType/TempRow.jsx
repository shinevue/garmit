/**
 * @license Copyright 2022 DENSO
 * 
 * TempRow Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import { Checkbox } from 'react-bootstrap';
import InputForm from 'Common/Form/InputForm';
import TypeSwitch from './TypeSwitch';
import { LINE_TEMP_TYPE, LINE_TEMP_TYPE_OPTIONS } from 'constant';


/**
 * 仮登録コンポーネント（工事種別：新設）
 * @param {boolean} hasTemp 仮登録有無
 * @param {number} tempType 仮登録方法
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {function} onChange スイッチ値変更時に呼び出す
 */
export default class TempRow extends Component {
    
    /**
     * render
     */
    render() {
        const { hasTemp, tempType, isReadOnly } = this.props;
        return (
            <InputForm.Row>
                <InputForm.Col label="仮登録" columnCount={1} isRequired>
                    <Checkbox className="mb-05" checked={hasTemp} onClick={() => this.handleChangeHasTemp()}>仮登録あり</Checkbox>
                    {hasTemp&&
                        <TypeSwitch
                            type={tempType?tempType:LINE_TEMP_TYPE.inOnly}
                            name="newTempType"
                            isReadOnly={isReadOnly}
                            options={_.cloneDeep(LINE_TEMP_TYPE_OPTIONS)} 
                            onChange={(value) => this.handleChangeType(value)} 
                        />
                    }
                </InputForm.Col>
            </InputForm.Row>
        );
    }

    /**
     * 仮登録有無を変更する
     */
    handleChangeHasTemp() {
        const hasTemp = !this.props.hasTemp;
        const tempType = hasTemp ? LINE_TEMP_TYPE.inOnly : null;
        this.onChange(hasTemp, tempType);
    }

    /**
     * 仮登録方法変更
     * @param {number} value 変更値
     */
    handleChangeType(value) {
        this.onChange(this.props.hasTemp, value)
    }

    /**
     * 仮登録方法変更
     * @param {boolean} hasTemp 仮登録有無
     * @param {number} tempType 仮登録方法
     */
    onChange(hasTemp, tempType) {
        if (this.props.onChange) {
            this.props.onChange(hasTemp, tempType)
        }
    }

}