/**
 * @license Copyright 2022 DENSO
 * 
 * 登録や検索方法行 Reactコンポーネント
 *  * 
 */
'use strict';

import React, { Component } from 'react';
import InputForm from 'Common/Form/InputForm';
import TypeSwitch from './TypeSwitch';
import { LINE_TEMP_TYPE_OPTIONS, LINE_LEFT_TYPE_OPTIONS, LINE_SEARCH_TYPE_OPTIONS } from 'constant';

/**
 * 種別行
 * @param {string} label 行の項目名
 * @param {string} name スイッチ名称（一意）
 * @param {number} type 選択中の種別
 * @param {array} options 選択肢
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {function} onChange スイッチ値変更時に呼び出す
 */
const TypeRow =({label, name, type, options, isReadOnly, onChange: handleChange }) => {
    return (
        <InputForm.Row>
            <InputForm.Col label={label} columnCount={1} isRequired>
                <TypeSwitch
                    type={type}
                    name={name}
                    isReadOnly={isReadOnly}
                    options={options} 
                    onChange={(value) => handleChange(value)} 
                />
            </InputForm.Col>
       </InputForm.Row>
    );
}

/**
 * 登録方法行
 * @param {number} type 選択中の種別
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {function} onChange スイッチ値変更時に呼び出す
 */
export const TempTypeRow = ({type, isReadOnly, onChange: handleChange}) => {
    return (
        <TypeRow 
            label="登録方法"
            name="tempType"
            type={type}
            options={LINE_TEMP_TYPE_OPTIONS}
            isReadOnly={isReadOnly}
            onChange={(value) => handleChange(value)}
        />
    )
}

/**
 * 残置方法行
 * @param {number} type 選択中の種別
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {function} onChange スイッチ値変更時に呼び出す
 */
 export const LeftTypeRow = ({type, isReadOnly, onChange: handleChange}) => {
    return (
        <TypeRow 
            label="残置方法"
            name="leftType"
            type={type}
            options={LINE_LEFT_TYPE_OPTIONS}
            isReadOnly={isReadOnly}
            onChange={(value) => handleChange(value)}
        />
    )
}

/**
 * 検索方法行
 * @param {number} type 選択中の種別
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {function} onChange スイッチ値変更時に呼び出す
 */
export const SearchTypeRow = ({type, isReadOnly, onChange: handleChange}) => {
    return (
        <TypeRow 
            label="検索方法"
            name="searchType"
            type={type}
            options={LINE_SEARCH_TYPE_OPTIONS}
            isReadOnly={isReadOnly}
            onChange={(value) => handleChange(value)}
        />
    )
}
