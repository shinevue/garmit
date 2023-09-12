/**
 * Copyright 2017 DENSO Solutions
 * 
 * アラーム設定テーブル Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Table } from 'react-bootstrap';
import TextForm from 'Common/Form/TextForm';

/**
* アラーム情報テーブル
*/
const AlarmInfoTable = ({ title, alarmInfo, editMode, isLoading, onChange: handleChange }) => {
    return (
        <Table className="alarm-info-table" style={{ tableLayout: "fixed" }}>
            <thead>
                <tr>
                    <th colSpan="2">{title}</th>
                </tr>
            </thead>
            <tbody>
                {alarmInfo &&
                    alarmInfo.map((info) => {
                        return <AlarmInfoRow
                            itemName={info.name}
                            editMode={editMode}
                            isError={info.isError}
                            value={info.value}
                            validationInfo={info.validationInfo}
                            isLoading={isLoading}
                            onChange={(value) => handleChange && handleChange(info.id, value )}
                        />
                    })
                }
            </tbody>
        </Table>
    );
}
export default AlarmInfoTable;

/**
* アラーム情報テーブル行
*/
const AlarmInfoRow = ({ itemName, editMode, isError, value, isLoading, validationInfo, onChange:handleChange }) => {
    return (
        <tr>
            <td>{itemName}</td>
            <td>{editMode ?
                <TextForm
                    formControlClassName={isError ? "error-row" : "alarm-row"}
                    value={value}
                    isReadOnly={isLoading}
                    validationState={validationInfo && validationInfo.state}
                    helpText={validationInfo && validationInfo.helpText}
                    onChange={(value) => handleChange(value)} />
                : value}
            </td>
        </tr>
    );
}
